import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

// Create standard Google GenAI SDK instance server-side
export const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// robust helper with model fallback and dynamic retry backoff
export async function generateContentWithFallback(params: { contents: any; config?: any }) {
  const modelsToTry = ["gemini-3.5-flash", "gemini-flash-latest", "gemini-3.1-flash-lite"];
  let lastError: any = null;

  for (const model of modelsToTry) {
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const res = await ai.models.generateContent({
          model: model,
          contents: params.contents,
          config: params.config,
        });
        return res;
      } catch (err: any) {
        lastError = err;
        const msg = err?.message || String(err);
        const isTransient =
          msg.includes("503") ||
          msg.includes("UNAVAILABLE") ||
          msg.includes("429") ||
          msg.includes("Resource has been exhausted") ||
          msg.includes("high demand") ||
          msg.includes("temporary");

        if (isTransient && attempt < 2) {
          const waitTime = attempt * 1500;
          await delay(waitTime);
        } else {
          break;
        }
      }
    }
  }

  throw lastError || new Error("All responsive agricultural AI model routes are temporarily congested. Please retry in a moment.");
}
