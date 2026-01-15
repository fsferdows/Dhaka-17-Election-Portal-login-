
import { GoogleGenAI } from "@google/genai";
import { Candidate } from "../types";

export const getAIResponse = async (query: string, candidates: Candidate[]) => {
  try {
    // Create instance right before use to ensure most up-to-date API key
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const candidatesContext = candidates
      .map(c => `${c.name} (${c.party}): ${c.manifesto}. Focuses on: ${c.focusIssues.join(', ')}`)
      .join('\n');

    const systemInstruction = `
      You are the official Dhaka-17 Election Assistant. 
      You help Bangladeshi citizens understand the election process in the Constituency 190 (Gulshan, Banani, Baridhara, Cantonment).
      
      CRITICAL: You are bilingual. 
      - If the user asks in Bengali, reply in Bengali. 
      - If they use English, reply in English or "Banglish" (Mixing English terms with Bengali grammar).
      - If the query is unclear, ask for clarification politely.
      
      Tone: Extremely polite (use 'Apni' for you), patriotic, and neutral.
      
      Candidate Context:
      ${candidatesContext}
      
      Common Locations: Gulshan 1, Gulshan 2, Banani, Baridhara, Baridhara DOHS, Mohakhali, Cantonment.
      
      If a user asks about local issues, mention that candidates are focused on Smart City initiatives and eco-urbanism.
      Stay away from political bias. Always encourage people to vote! "আপনার ভোট, আপনার শক্তি" (Your vote, your power).
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [{ parts: [{ text: query }] }],
      config: {
        systemInstruction,
        temperature: 0.6,
      },
    });

    return response.text || "দুঃখিত, আমি এই মুহূর্তে উত্তর দিতে পারছি না। (Sorry, I can't answer right now.)";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "AI অ্যাসিস্ট্যান্ট বর্তমানে অফলাইনে আছে। অনুগ্রহ করে পরে আবার চেষ্টা করুন। (AI Assistant is currently offline. Please try again later.)";
  }
};
