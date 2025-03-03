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
    // const prompt = `Extract the most relevant keywords from the following text covering graphs/lines/bars/pie-charts, separated by commas:\n\n${extractedText}`;
    const prompt = `Extract keywords from the following text in batches of 8, ensuring each batch covers a diverse range of topics such as text, information, graphs, lines, bars, pie charts, trends, comparisons, patterns, statistics etc, randomly not in a sequential ordered in every batch. The keywords should be comma-separated and structured in such a way that each batch of 8 represents a broad spectrum of the content. \n
    Output format: Batch 1: keyword1, keyword2, keyword3, keyword4, keyword5, keyword6, keyword7, keyword8 \n
     Batch 2: keyword9, keyword10, keyword11, keyword12, keyword13, keyword14, keyword15, keyword16 \n 
     Batch 3: keyword17, keyword18, keyword19, keyword20, keyword21, keyword22, keyword23, keyword24  and so on.... \n Text:  \n${extractedText}`;

    const response = await model.generateContent(prompt);
    const keywordText = response?.response?.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!keywordText) {
      return res.status(500).json({ error: "Failed to extract keywords" });
    }


 const keywordBatches: string[][] = keywordText
 .split("\n") // Split into lines
 .filter((line) => line.startsWith("Batch")) // Keep only batch lines
 .map((line) => line.split(":")[1]?.trim().split(",").map((kw) => kw.trim()) || []);
    if (keywordBatches.length === 0) {
      return res.status(500).json({ error: "No keywords extracted" });
    }

    

    return res.status(200).json({ keywords: keywordBatches });
  } catch (error: any) {
    console.error("❌ Error extracting keywords:", error.message || error);
    return res.status(500).json({ error: "Failed to extract keywords" });
  }
}
