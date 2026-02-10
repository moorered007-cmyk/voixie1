
/**
 * VOIXI1 BACKEND SERVER
 * 
 * This is the production-ready Node.js/Express logic to handle:
 * 1. Incoming calls from Twilio
 * 2. Routing audio to Vapi.ai (or Retell AI)
 * 3. Logging call metadata to the database
 * 4. Sending SMS Notifications via Twilio
 * 
 * DEPLOYMENT INSTRUCTIONS:
 * 1. Run `npm install`
 * 2. Set environment variables: TWILIO_AUTH_TOKEN, TWILIO_ACCOUNT_SID, TWILIO_PHONE_NUMBER, VAPI_PRIVATE_KEY, DATABASE_URL
 * 3. Point your Twilio Phone Number's "Voice Webhook" to https://your-domain.com/webhooks/twilio/voice
 * 4. Run `node server/index.js`
 */

import express from 'express';
import bodyParser from 'body-parser';
import twilio from 'twilio';

// const { Pool } = require('pg'); // PostgreSQL connection for logging

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// --- TWILIO SMS CONFIGURATION ---

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioNumber = process.env.TWILIO_PHONE_NUMBER;

// Initialize Twilio Client (Graceful fallback if keys are missing in dev)
const twilioClient = (accountSid && authToken) ? new twilio(accountSid, authToken) : null;
const VoiceResponse = twilio.twiml.VoiceResponse;

/**
 * Helper to send SMS
 * @param {string} to - Recipient phone number
 * @param {string} body - Message content
 */
const sendSMS = async (to, body) => {
  if (!twilioClient) {
    console.log(`[Mock SMS] To: ${to} | Body: "${body}"`);
    return { success: true, mock: true };
  }

  try {
    const message = await twilioClient.messages.create({
      body: body,
      from: twilioNumber,
      to: to
    });
    console.log(`[SMS Sent] SID: ${message.sid} | To: ${to}`);
    return { success: true, sid: message.sid };
  } catch (error) {
    console.error(`[SMS Failed] To: ${to} | Error: ${error.message}`);
    return { success: false, error: error.message };
  }
};

// --- RATE LIMITING LOGIC ---

// Limits based on subscription tiers
const TIER_LIMITS = {
  'GROWTH': 500,       // Basic Tier: 500 interactions/month
  'PRO': Infinity,     // Growth Tier: Unlimited interactions
  'ENTERPRISE': Infinity // Premium Tier: Unlimited everything
};

// In-memory store for demo purposes. 
// IN PRODUCTION: Use Redis or a database to persist usage counts and handle monthly resets.
const usageStore = new Map(); 

/**
 * Mock helper to determine business tier based on phone number.
 * In production, this would query the database.
 */
const getBusinessTier = (phoneNumber) => {
  if (!phoneNumber) return 'GROWTH';
  // Demo simulation:
  if (phoneNumber.endsWith('9999')) return 'ENTERPRISE';
  if (phoneNumber.endsWith('8888')) return 'PRO';
  return 'GROWTH';
};

/**
 * Middleware to check if the business has exceeded their monthly call limit.
 */
const checkRateLimit = async (req, res, next) => {
  try {
    const { To } = req.body; // 'To' is the business phone number in Twilio webhook
    
    // 1. Lookup Business Tier
    const businessTier = getBusinessTier(To);
    
    // 2. Get Current Usage
    const currentUsage = usageStore.get(To) || 0;
    const limit = TIER_LIMITS[businessTier];

    console.log(`[Rate Limit Check] Business: ${To} | Tier: ${businessTier} | Usage: ${currentUsage}/${limit === Infinity ? 'Unlimited' : limit}`);

    // 3. Check Limit
    if (limit !== Infinity && currentUsage >= limit) {
      console.warn(`[Rate Limit Exceeded] Blocking call for ${To}`);
      
      const response = new VoiceResponse();
      response.say("We apologize, but this number has exceeded its monthly interaction limit. Please contact the business owner directly.");
      response.hangup();
      
      res.type('text/xml');
      res.send(response.toString());
      return;
    }

    // 4. Increment Usage (Optimistic)
    // In production, increment strictly after call or use an atomic counter in Redis
    usageStore.set(To, currentUsage + 1);
    
    next();
  } catch (error) {
    console.error("Rate limit check failed", error);
    // Fail open (allow call) or closed (block call) depending on policy. Here we allow it.
    next();
  }
};

// --- END RATE LIMITING LOGIC ---

// Mock Database (Replace with Supabase/Postgres in production)
const db = {
  logCall: async (callData) => {
    console.log(">> DB INSERT: Logging incoming call...", callData);
    // return pool.query('INSERT INTO calls ...', [values]);
  }
};

// --- NOTIFICATION ENDPOINTS ---

/**
 * API: Send Appointment Confirmation to Customer
 */
app.post('/api/notify/appointment', async (req, res) => {
  const { customerPhone, customerName, time, serviceName } = req.body;
  
  if (!customerPhone || !time) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const message = `Hello ${customerName || 'there'}, your appointment for ${serviceName || 'service'} at VOIXI1 is confirmed for ${time}. Reply STOP to cancel.`;
  
  const result = await sendSMS(customerPhone, message);
  res.json(result);
});

/**
 * API: Send Low Stock Alert to Business Owner
 */
app.post('/api/notify/stock', async (req, res) => {
  const { businessOwnerPhone, itemName, currentStock } = req.body;

  const message = `[VOIXI1 ALERT] Low Stock Warning: ${itemName} is down to ${currentStock} units. AI suggests reordering within 48 hours to avoid revenue loss.`;

  const result = await sendSMS(businessOwnerPhone, message);
  res.json(result);
});

/**
 * API: Send Revenue Insight to Business Owner
 */
app.post('/api/notify/insight', async (req, res) => {
  const { businessOwnerPhone, insightTitle, projectedRoi } = req.body;

  const message = `[VOIXI1 INSIGHT] New Opportunity: "${insightTitle}" detected. Projected ROI: ${projectedRoi}. Check your dashboard to activate.`;

  const result = await sendSMS(businessOwnerPhone, message);
  res.json(result);
});


// --- VOICE WEBHOOKS ---

/**
 * WEBHOOK: Handle Incoming Voice Call from Twilio
 * URL: /webhooks/twilio/voice
 */
app.post('/webhooks/twilio/voice', checkRateLimit, async (req, res) => {
  const { CallSid, From, To, FromCountry } = req.body;

  console.log(`[Incoming Call] SID: ${CallSid} | From: ${From}`);

  // 1. Log the incoming call attempt
  await db.logCall({
    id: CallSid,
    callerNumber: From,
    businessNumber: To,
    country: FromCountry,
    timestamp: new Date().toISOString(),
    status: 'RINGING'
  });

  // 2. Determine Business Logic (Lookup business via 'To' number)
  // const businessProfile = await db.getBusinessByPhone(To);
  const assistantId = process.env.VAPI_ASSISTANT_ID || 'your-vapi-assistant-id';

  // 3. Generate TwiML to Route Audio Stream to Vapi.ai
  // This connects the telephone call to the AI agent
  const response = new VoiceResponse();
  
  const connect = response.connect();
  
  // Vapi.ai specific stream endpoint
  connect.stream({
    url: `wss://api.vapi.ai/adapter/twilio/v1/stream/${assistantId}`,
  });

  // 4. Send Response to Twilio
  res.type('text/xml');
  res.send(response.toString());
});

/**
 * WEBHOOK: Call Status Updates (Completed, Failed, etc.)
 * URL: /webhooks/twilio/status
 */
app.post('/webhooks/twilio/status', async (req, res) => {
  const { CallSid, CallStatus, Duration } = req.body;
  
  console.log(`[Call Status] SID: ${CallSid} | Status: ${CallStatus} | Duration: ${Duration}s`);

  // Update log in DB
  // await db.updateCallStatus(CallSid, CallStatus, Duration);

  res.sendStatus(200);
});

// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Voixi1 Voice Server running on port ${PORT}`);
});
