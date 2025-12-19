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
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        result = await model.generateContent(prompt);
    } catch (e: any) {
        console.warn("Gemini 2.5 Flash failed, trying 1.5 Flash:", e.message);
        // Fallback to 1.5 just in case
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        result = await model.generateContent(prompt);
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
      return { isSafe: false, error: "Unable to verify content safety." };
    }
  } catch (error: any) {
    console.error("Error checking content safety:", error);
    return { isSafe: false, error: `Error checking content safety: ${error.message || error}` };
  }
}
