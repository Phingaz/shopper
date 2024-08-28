import { GoogleGenerativeAI, Part } from "@google/generative-ai";
import envValues from "./env.js";

const { geminiKey } = envValues;

interface GeminiResponse {
  measure_value: string;
  measure_others: string;
}

export const promptGemini = async (
  data: string,
  type: string
): Promise<GeminiResponse | null> => {
  try {
    const genAI = new GoogleGenerativeAI(geminiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

    const prompt = `
      Get the texts in this image, return a structured JSON with the texts.
      The primary reading should be the first one with the key measure_value.
      The secondary value should be with the key measure_others.
      Result must be a JSON with the keys measure_value and measure_others.
      No extras needed and do not include fenced block code, just {} with the data.
      If no reading is found, return null for that key.
      \n\n
    `;

    const imageInfo: Part = {
      inlineData: { data, mimeType: `image/${type}` },
    };

    const result = await model.generateContent([prompt, imageInfo]);
    const res = result.response.text();

    // Parse JSON response
    const jsonRes = JSON.parse(res);
    console.info("Gemini result structure:", jsonRes);
    return jsonRes as GeminiResponse;
  } catch (error) {
    throw new Error(`Failed to process image with Gemini: ${error.message}`);
  }
};
