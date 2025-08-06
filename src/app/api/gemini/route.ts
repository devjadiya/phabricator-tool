import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Ensure you have GEMINI_API_KEY in your .env.local file
const genAI = new GoogleGenerativeAI("AIzaSyCuoJXOUoL-bhXUuFPe7IBTTWoTDJVF1BA");

// --- NEW: Configuration for retry logic ---
const MAX_RETRIES = 3;
const INITIAL_BACKOFF_MS = 1000; // Start with a 1-second delay
// -----------------------------------------

export async function POST(req: NextRequest) {
  const { prompt } = await req.json();

  if (!prompt) {
    return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
  }

  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

  // --- NEW: Retry loop with exponential backoff ---
  for (let i = 0; i < MAX_RETRIES; i++) {
    try {
      console.log(`Attempt ${i + 1} to call Gemini API...`);
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      // If successful, return the result immediately
      return NextResponse.json({ result: text });
    } catch (error: any) {
      // Check if the error is a 5xx server error, which is retryable
      const isRetryable =
        error.message?.includes("503") || error.message?.includes("500");

      // If it's the last attempt or the error is not retryable, throw the error
      if (i === MAX_RETRIES - 1 || !isRetryable) {
        console.error(
          "Gemini API Error (Final Attempt or Not Retryable):",
          error
        );
        return NextResponse.json(
          {
            error:
              "Failed to fetch response from Gemini API after multiple attempts.",
          },
          { status: 500 }
        );
      }

      // Calculate delay for the next retry (e.g., 1s, 2s, 4s)
      const delay = INITIAL_BACKOFF_MS * Math.pow(2, i);
      console.log(`Attempt ${i + 1} failed. Retrying in ${delay}ms...`);
      // Wait for the calculated delay
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  // This part should theoretically not be reached, but is a fallback.
  return NextResponse.json(
    { error: "An unexpected error occurred after all retries." },
    { status: 500 }
  );
}
