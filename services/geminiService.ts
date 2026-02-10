import { GoogleGenAI, Type } from "@google/genai";
import { RevenueInsight, BusinessProfile } from '../types';

// NOTE: In a real production app, API calls should be proxied through a backend
// to protect the API Key. For this MVP demo, we assume the environment variable is available.
// If process.env.API_KEY is not set, we will use a dummy simulation mode.

const apiKey = process.env.API_KEY || '';
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

export const generateBusinessProfile = async (
  name: string,
  url: string,
  manualDescription?: string
): Promise<Partial<BusinessProfile>> => {
  // Simulation mode if no key
  if (!ai) {
    await new Promise(resolve => setTimeout(resolve, 2000));
    const descSource = manualDescription ? "provided description" : "website URL";
    return {
      industry: 'Retail / Service',
      description: `A premier destination for customers looking for quality service at ${name}. Generated from ${descSource}.`,
      services: ['Consultation', 'Premium Service', 'Support', 'Sales'],
      hours: 'Mon-Fri: 9AM - 6PM'
    };
  }

  try {
    const model = 'gemini-3-flash-preview';
    let prompt = '';

    if (manualDescription) {
      prompt = `
        I am onboarding a business named "${name}".
        The owner describes the business as follows: "${manualDescription}".
        
        Please analyze this description and return a structured JSON profile.
        Assume standard business practices for this industry where details are missing.

        Return JSON with these fields:
        - industry (string)
        - description (string, max 2 sentences, professional tone)
        - services (array of strings, max 5)
        - hours (string, formatted neatly, assume 9-5 if not specified)
      `;
    } else {
      prompt = `
        I am onboarding a business named "${name}" with website "${url}".
        Please simulate a web scrape of this business type and return a JSON profile.
        Assume it is a standard business of its likely type.
        
        Return JSON with these fields:
        - industry (string)
        - description (string, max 2 sentences)
        - services (array of strings, max 5)
        - hours (string, formatted neatly)
      `;
    }

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            industry: { type: Type.STRING },
            description: { type: Type.STRING },
            services: { type: Type.ARRAY, items: { type: Type.STRING } },
            hours: { type: Type.STRING }
          }
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    return JSON.parse(text);

  } catch (error) {
    console.error("AI Profile Generation failed", error);
    return {
      industry: 'General Business',
      description: 'Could not auto-detect. Please update profile manually.',
      services: ['General Inquiry'],
      hours: '9AM - 5PM'
    };
  }
};

export const generateRevenueInsights = async (
  logs: any[],
  profile: BusinessProfile
): Promise<RevenueInsight[]> => {
  if (!ai) {
    // Return mock data if no AI
    await new Promise(resolve => setTimeout(resolve, 1500));
    return [
      {
        id: `gen-${Date.now()}`,
        title: 'Missed Calls Pattern',
        description: '3 missed calls during lunch hours (12-1PM).',
        type: 'OPTIMIZATION',
        projectedRoi: '+$150/wk',
        actionParams: 'Adjust Shift Schedule'
      }
    ];
  }

  try {
    const model = 'gemini-3-flash-preview';
    const prompt = `
      Analyze the following business context and call logs for "${profile.name}" (${profile.industry}).
      Identify 1 specific revenue optimization opportunity based on common business patterns.
      
      Call Logs Summary: ${JSON.stringify(logs.slice(0, 3))}
      
      Return a SINGLE JSON object (not an array) with:
      - title (short header)
      - description (what is happening)
      - type (OPPORTUNITY | WARNING | OPTIMIZATION)
      - projectedRoi (e.g. +$500/mo)
      - actionParams (short action button text)
    `;

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
            type: Type.OBJECT,
            properties: {
                title: { type: Type.STRING },
                description: { type: Type.STRING },
                type: { type: Type.STRING, enum: ['OPPORTUNITY', 'WARNING', 'OPTIMIZATION'] },
                projectedRoi: { type: Type.STRING },
                actionParams: { type: Type.STRING }
            }
        }
      }
    });
    
    const text = response.text;
    if(!text) return [];
    
    const insight = JSON.parse(text);
    return [{ ...insight, id: `ai-${Date.now()}` }];

  } catch (error) {
    console.error("Insight generation failed", error);
    return [];
  }
};

export const generateDemoScript = async (name: string, businessType: string): Promise<{ role: string, text: string, label?: string }[]> => {
  // Mock if no AI to ensure demo works reliably without key
  if (!ai) {
    await new Promise(resolve => setTimeout(resolve, 1500));
    return [
         { role: 'ai', text: `Thank you for calling ${name}. This is Voixi, your virtual assistant. How can I help you today?` },
         { role: 'user', label: "Ask about services", text: `Hi, I was looking for more information about what services you offer.` },
         { role: 'ai', text: `We offer a full range of services tailored to your needs here at ${name}. Are you looking to book an appointment or speak with a specialist?` },
         { role: 'user', label: "Book appointment", text: "I'd like to book an appointment for tomorrow." },
         { role: 'ai', text: "I can help with that. I have an opening available at 2 PM. Shall I confirm that for you?" },
         { role: 'user', label: "Confirm", text: "Yes, that works." },
         { role: 'ai', text: "Perfect. You are booked for 2 PM tomorrow. We look forward to seeing you." }
    ];
  }

  try {
    const model = 'gemini-3-flash-preview';
    const prompt = `
    Generate a short 5-turn phone conversation script between an AI receptionist (Voixi) and a customer for a business named "${name}" which is a "${businessType}".
    
    The AI should be professional, warm, and sound like a high-end concierge.
    
    Format as a JSON array of objects with these properties:
    - role: "ai" or "user"
    - text: the spoken text
    - label: (only for user roles) a short 2-4 word button label describing the action (e.g. "Ask for pricing")
    
    Ensure the first turn is the AI greeting the caller.
    Ensure the script flows logically for a demo.
    `;

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              role: { type: Type.STRING, enum: ['ai', 'user'] },
              text: { type: Type.STRING },
              label: { type: Type.STRING }
            }
          }
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response");
    return JSON.parse(text);
  } catch (error) {
    console.error("Demo script generation failed", error);
    // Fallback
    return [
         { role: 'ai', text: `Thank you for calling ${name}. How may I direct your call?` },
         { role: 'user', label: "Ask for hours", text: `Hi, what are your opening hours?` },
         { role: 'ai', text: `We are open Monday through Friday from 9 AM to 6 PM.` },
         { role: 'user', label: "Say thanks", text: "Great, thank you." },
         { role: 'ai', text: "You're welcome. Have a wonderful day." }
    ];
  }
};