import { GoogleGenerativeAI, Part } from "@google/generative-ai";
import envValues from "./env";

const { geminiKey } = envValues;

export const promptGemini = async (
  data: string,
  type: string
): Promise<Record<string, string>> => {
  try {
    const genAI = new GoogleGenerativeAI(geminiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
    const prompt = `Get the texts in this image, return a structed json with the texts. The primary reading should be the first one with the key measure_value. The secondary value should be with the key measure_uuid. Result must be a json with the keys measure_value and measure_uuid. No extras needed and do not include fenced block code, just {} with the data. If no reading is found return null for that key \n\n`;
    const imageInfo: Part = {
      inlineData: { data, mimeType: `image/${type}` },
    };
    const result = await model.generateContent([prompt, imageInfo]);
    const res = result.response.text();
    const jsonRes = JSON.parse(res);
    return jsonRes as { measure_value: string; measure_uuid: string };
  } catch (error) {
    throw error;
  }
};
