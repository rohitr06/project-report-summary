import type { NextApiRequest, NextApiResponse } from "next";
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error("❌ GEMINI_API_KEY is missing! Add it to .env.local");
}

const genAI = new GoogleGenerativeAI(apiKey!);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { extractedText } = req.body;

  if (!extractedText || extractedText.trim() === "") {
    return res.status(400).json({ error: "No text provided for keyword extraction" });
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
    const prompt = `Extract 8 - 10 the most relevant keywords from the following text covering graphs/lines/bars/pie-charts, separated by commas:\n\n${extractedText}`;

    const response = await model.generateContent(prompt);
    const keywordText = response?.response?.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!keywordText) {
      return res.status(500).json({ error: "Failed to extract keywords" });
    }

    const keywords = keywordText.split(",").map((word) => word.trim());

    return res.status(200).json({ keywords });
  } catch (error: any) {
    console.error("❌ Error extracting keywords:", error.message || error);
    return res.status(500).json({ error: "Failed to extract keywords" });
  }
}
