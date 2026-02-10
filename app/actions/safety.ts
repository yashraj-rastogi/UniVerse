'use server'

import { GoogleGenerativeAI } from "@google/generative-ai";

export async function checkContentSafety(text: string): Promise<{ isSafe: boolean; error?: string }> {
  if (!process.env.GEMINI_API_KEY) {
    console.error("GEMINI_API_KEY is not set");
    return { isSafe: false, error: "Safety check system is offline (Configuration Error). Please contact support." };
  }

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const prompt = `Analyze this text for bullying, harassment, or severe toxicity. Respond ONLY with "SAFE" or "UNSAFE". Text: "${text}"`;

    let result;
    try {
      // Try the model available in your dashboard
      // Updated to gemini-flash-latest based on available models list and 403 error with 2.0
      const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
      result = await model.generateContent(prompt);
    } catch (e: any) {
      console.warn("Gemini Flash Latest failed:", e.message);
      return { isSafe: false, error: "Safety check service unavailable. Please try again later." };
    }

    const response = await result.response;
    const textResponse = response.text().trim().toUpperCase();

    if (textResponse.includes("SAFE") && !textResponse.includes("UNSAFE")) {
      return { isSafe: true };
    } else if (textResponse.includes("UNSAFE")) {
      return { isSafe: false, error: "This post was flagged as unsafe (bullying/harassment). Please revise." };
    } else {
      // Fallback for unexpected responses
      console.warn("Unexpected response from Gemini:", textResponse);
      return { isSafe: false, error: "Unable to verify content safety. Please try again." };
    }
  } catch (error: any) {
    console.error("Error checking content safety:", error);
    // Fail closed on error
    return { isSafe: false, error: "An error occurred during safety check." };
  }
}
