import { GoogleGenerativeAI, Part } from "@google/generative-ai";
import envValues from "./env.js";

const { geminiKey } = envValues;

interface GeminiResponse {
  measure_value: string;
  measure_uuid: string;
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
      The secondary value should be with the key measure_uuid.
      Result must be a JSON with the keys measure_value and measure_uuid.
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

    // Validate JSON structure
    if (
      typeof jsonRes.measure_value === "string" &&
      typeof jsonRes.measure_uuid === "string"
    ) {
      return jsonRes as GeminiResponse;
    } else {
      console.warn("Unexpected response format:", jsonRes);
      return null;
    }
  } catch (error) {
    throw new Error(`Failed to process image with Gemini: ${error.message}`);
  }
};
