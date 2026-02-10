import { SubscriptionTier, CallLog, ChartDataPoint, RevenueInsight, Employee, Shift, VoiceOption } from './types';

export const TIERS = [
  {
    id: SubscriptionTier.GROWTH,
    name: 'Starter',
    price: 99,
    priceYearly: 990,
    stripePriceId: 'price_starter_99',
    stripePriceIdYearly: 'price_starter_990',
    features: ['500 calls/mo', 'Basic Scheduling', 'Weekly Reports', 'Email Support'],
    recommended: false,
    trialDays: 0,
  },
  {
    id: SubscriptionTier.PRO,
    name: 'Growth',
    price: 299,
    priceYearly: 2990,
    stripePriceId: 'price_growth_299',
    stripePriceIdYearly: 'price_growth_2990',
    features: ['Unlimited Calls', 'Adv. Scheduling', 'Daily Insights', '10 Integrations'],
    recommended: true,
    trialDays: 14,
  },
  {
    id: SubscriptionTier.ENTERPRISE,
    name: 'Enterprise',
    price: 599,
    priceYearly: 5990,
    stripePriceId: 'price_ent_599',
    stripePriceIdYearly: 'price_ent_5990',
    features: ['Unlimited Calls', 'Real-time Analytics', 'Employee Scheduling', 'Dedicated Support'],
    recommended: false,
    trialDays: 0,
  }
];

export const VOICE_OPTIONS: VoiceOption[] = [
  { 
    id: 'voice_prof_f', 
    name: 'Sarah', 
    tone: 'Professional', 
    gender: 'Female', 
    description: 'Crisp, clear, and efficient. Best for legal and corporate.',
    sampleText: 'Good morning. You have reached the executive offices. How may I direct your call?'
  },
  { 
    id: 'voice_warm_m', 
    name: 'Michael', 
    tone: 'Friendly', 
    gender: 'Male', 
    description: 'Warm, welcoming, and casual. Best for retail and local business.',
    sampleText: 'Hi there! Thanks for calling. We\'d love to help you out today.'
  },
  { 
    id: 'voice_soft_f', 
    name: 'Emma', 
    tone: 'Empathetic', 
    gender: 'Female', 
    description: 'Calm, patient, and understanding. Best for healthcare and wellness.',
    sampleText: 'I understand completely. Let me take care of that for you right away.'
  },
  { 
    id: 'voice_lux_m', 
    name: 'James', 
    tone: 'Luxury', 
    gender: 'Male', 
    description: 'Sophisticated, composed, and polished. Best for high-end hospitality.',
    sampleText: 'Welcome. It is our pleasure to assist you with your reservation.'
  }
];

export const MOCK_CALL_LOGS: CallLog[] = [
  {
    id: '1',
    callerNumber: '+1 (555) 123-4567',
    timestamp: '2 mins ago',
    duration: '1m 45s',
    summary: 'Customer asked for hair coloring pricing. Booked appointment.',
    outcome: 'BOOKED',
    sentiment: 'POSITIVE',
    transcriptSnippet: "User: How much for a dye? Agent: It starts at $80. I have an opening at 4pm.",
    revenueImpact: 80,
    recordingUrl: '#',
    fullTranscript: `AI: Thank you for calling The Grand Hotel. This is Voixi, your virtual concierge. How may I assist you today?
User: Hi, I'd like to ask about the price for a full hair coloring session.
AI: Certainly. Our full hair coloring services start at $80. We also have a special on highlights this week. Would you be interested in hearing about that?
User: No, just the full color. Do you have any openings this afternoon?
AI: Let me check the schedule for you. I have an opening at 4:00 PM with Sarah. Would you like to book that?
User: Yes, that works perfectly.
AI: Excellent. I have you confirmed for a full hair coloring at 4:00 PM today. Is there anything else I can help you with?
User: No, that's all. Thanks.
AI: You're welcome. We look forward to seeing you. Have a wonderful day.`
  },
  {
    id: '2',
    callerNumber: '+1 (555) 987-6543',
    timestamp: '15 mins ago',
    duration: '45s',
    summary: 'Inquired about opening hours.',
    outcome: 'INFO_GIVEN',
    sentiment: 'NEUTRAL',
    transcriptSnippet: "User: Are you open Sundays? Agent: Yes, from 10am to 4pm.",
    revenueImpact: 0,
    recordingUrl: '#',
    fullTranscript: `AI: Good afternoon, thank you for calling. How can I help you?
User: Hi, are you guys open on Sundays?
AI: Yes, we are open on Sundays from 10:00 AM to 4:00 PM.
User: Okay, great. Do I need an appointment just to browse?
AI: No appointment is necessary for browsing. You are welcome to stop by anytime during business hours.
User: Awesome, thanks!
AI: You're welcome. Have a great day!`
  },
  {
    id: '3',
    callerNumber: '+1 (555) 555-0199',
    timestamp: '1 hour ago',
    duration: '2m 10s',
    summary: 'Complaint about product stock. Agent offered discount.',
    outcome: 'MISSED',
    sentiment: 'NEGATIVE',
    transcriptSnippet: "User: You guys are always out of gel. Agent: I apologize. I can order it for you.",
    revenueImpact: -20,
    recordingUrl: '#',
    fullTranscript: `AI: Thank you for calling. How may I assist you?
User: I'm calling because I came in yesterday and you were out of the styling gel again. This is the third time.
AI: I sincerely apologize for the inconvenience. We have been experiencing some supply chain delays with that specific product.
User: Well, it's very frustrating. I drive 20 minutes to get there.
AI: I understand completely. I can place a special order for you right now with a 10% discount for the trouble, and we can ship it directly to your home for free. Would you like me to do that?
User: I guess that would work.
AI: Wonderful. I'll just need to confirm your shipping details...`
  }
];

export const MOCK_CHART_DATA: ChartDataPoint[] = [
  { name: 'Mon', revenue: 400, calls: 24, missed: 2 },
  { name: 'Tue', revenue: 300, calls: 18, missed: 1 },
  { name: 'Wed', revenue: 550, calls: 35, missed: 4 },
  { name: 'Thu', revenue: 450, calls: 28, missed: 2 },
  { name: 'Fri', revenue: 800, calls: 45, missed: 0 },
  { name: 'Sat', revenue: 950, calls: 52, missed: 1 },
  { name: 'Sun', revenue: 600, calls: 30, missed: 3 },
];

export const INITIAL_INSIGHTS: RevenueInsight[] = [
  {
    id: 'init-1',
    title: 'High Call Volume Warning',
    description: 'Saturdays between 10am-12pm see 40% missed calls. Potential revenue loss: $400/wk.',
    type: 'WARNING',
    projectedRoi: 'Recoup $1.6k/mo',
    actionParams: 'Add Staff Shift'
  },
  {
    id: 'init-2',
    title: 'Upsell Opportunity',
    description: 'Customers booking "Haircut" convert to "Shampoo" upsell 60% of time when asked.',
    type: 'OPPORTUNITY',
    projectedRoi: '+$500/mo',
    actionParams: 'Update AI Prompt'
  }
];

export const MOCK_EMPLOYEES: Employee[] = [
  { id: 'e1', name: 'Sarah J.', role: 'Senior Stylist', avatar: 'S' },
  { id: 'e2', name: 'Mike T.', role: 'Junior Stylist', avatar: 'M' },
  { id: 'e3', name: 'Jessica R.', role: 'Receptionist', avatar: 'J' },
];

export const MOCK_SHIFTS: Shift[] = [
  { id: 's1', employeeId: 'e1', day: 'Mon', startTime: '09:00', endTime: '17:00' },
  { id: 's2', employeeId: 'e1', day: 'Wed', startTime: '09:00', endTime: '17:00' },
  { id: 's3', employeeId: 'e1', day: 'Fri', startTime: '09:00', endTime: '17:00' },
  { id: 's4', employeeId: 'e2', day: 'Tue', startTime: '10:00', endTime: '18:00' },
  { id: 's5', employeeId: 'e2', day: 'Thu', startTime: '10:00', endTime: '18:00' },
  { id: 's6', employeeId: 'e2', day: 'Sat', startTime: '09:00', endTime: '16:00' },
  { id: 's7', employeeId: 'e3', day: 'Mon', startTime: '08:30', endTime: '12:30' },
];