import { GoogleGenAI } from "@google/genai";
import { Recruiter } from "../types";

// Safe initialization
const apiKey = process.env.API_KEY || '';
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

export const getCoachingTip = async (
  currentUser: Recruiter, 
  leader: Recruiter
): Promise<string> => {
  if (!ai) return "Keep pushing! You're doing great.";

  const userCount = currentUser.applicants.length;
  const leaderCount = leader.applicants.length;
  const diff = leaderCount - userCount;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `
        Context: A sales/recruiter leaderboard competition.
        User: ${currentUser.name} has ${userCount} applicants.
        Leader: ${leader.name} has ${leaderCount} applicants.
        Difference: ${diff}.
        
        Task: Provide a short, high-energy, 1-sentence motivational coaching tip for ${currentUser.name}. 
        If they are winning, congratulate them. If losing, tell them how close they are or to push harder.
        Be spicy and competitive.
      `,
    });
    return response.text || "Compete to win!";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Focus on your unique value proposition to attract more candidates!";
  }
};

export const parseUnstructuredData = async (text: string): Promise<any[]> => {
  if (!ai) return [];

  try {
    // Using gemini to parse pasted text into JSON
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `
        Extract applicant data from this unstructured text. 
        Return ONLY a JSON array of objects with keys: "name", "email", "date" (ISO string).
        If date is missing, use today. Generate fake email if missing based on name.
        
        Text:
        ${text}
      `,
      config: {
        responseMimeType: 'application/json'
      }
    });
    
    return JSON.parse(response.text);
  } catch (error) {
    console.error("Parsing error", error);
    return [];
  }
};