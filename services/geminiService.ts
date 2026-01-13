
import { GoogleGenAI } from "@google/genai";
import { Candidate } from "../types";

export const getAIResponse = async (query: string, candidates: Candidate[]) => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const candidatesContext = candidates
      .map(c => `${c.name} (${c.party}): ${c.manifesto}. Focuses on: ${c.focusIssues.join(', ')}`)
      .join('\n');

    const systemInstruction = `
      You are the official Dhaka-17 Election Assistant. 
      You help Bangladeshi citizens understand the election process.
      
      CRITICAL: You should be bilingual. If the user asks in Bengali, reply in Bengali. 
      If they use English, you can use "Banglish" (mixing English terms like 'Voter Slip', 'Polling Station' with Bengali sentences).
      
      Tone: Extremely polite (use 'Apni' for you), patriotic, and neutral.
      
      Candidate Context:
      ${candidatesContext}
      
      If a user asks about local issues in Gulshan, Banani, or Baridhara, mention that candidates are focused on Smart City initiatives.
      Stay away from political bias. Always encourage people to vote! "আপনার ভোট, আপনার শক্তি" (Your vote, your power).
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: query,
      config: {
        systemInstruction,
        temperature: 0.6,
      },
    });

    return response.text || "দুঃখিত, আমি এই মুহূর্তে উত্তর দিতে পারছি না। (Sorry, I can't answer right now.)";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "AI অ্যাসিস্ট্যান্ট বর্তমানে অফলাইনে আছে। অনুগ্রহ করে পরে আবার চেষ্টা করুন।";
  }
};