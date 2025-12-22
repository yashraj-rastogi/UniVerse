'use server'

import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function checkContentSafety(text: string): Promise<{ isSafe: boolean; error?: string }> {
  if (!process.env.GEMINI_API_KEY) {
    console.error("GEMINI_API_KEY is not set");
    return { isSafe: true }; // Fail open if key is missing, or handle as error
  }

  try {
    const prompt = `Analyze this text for bullying, harassment, or severe toxicity. Respond ONLY with "SAFE" or "UNSAFE". Text: "${text}"`;
    
    let result;
    try {
        // Try the model available in your dashboard
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        result = await model.generateContent(prompt);
    } catch (e: any) {
        console.warn("Gemini 1.5 Flash failed:", e.message);
        // Fail open if the API fails
        return { isSafe: true };
    }

    const response = await result.response;
    const textResponse = response.text().trim().toUpperCase();

    if (textResponse.includes("SAFE") && !textResponse.includes("UNSAFE")) {
      return { isSafe: true };
    } else if (textResponse.includes("UNSAFE")) {
      return { isSafe: false };
    } else {
      // Fallback for unexpected responses
      console.warn("Unexpected response from Gemini:", textResponse);
      return { isSafe: true };
    }
  } catch (error: any) {
    console.error("Error checking content safety:", error);
    // Fail open on error to allow posting when API is down/invalid
    return { isSafe: true };
  }
}
