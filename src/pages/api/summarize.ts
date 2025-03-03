import type { NextApiRequest, NextApiResponse } from 'next';
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';
import { log } from 'console';

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error("❌ GEMINI_API_KEY is missing! Add it to .env.local");
}

const genAI = new GoogleGenerativeAI(apiKey!);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { text, length = "Short", keywords = "" } = req.body;

  if (!text || text.trim() === "") {
    return res.status(400).json({ error: 'No text provided for summarization' });
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
    let prompt="";
    if(!prompt){
      prompt = `Summarize this report, including graphs. Summary length: ${length}\n\n${text}`;

    }
    prompt=`Summarize about ${keywords}. Summary length: ${length}\n\n${text}`;
    
    
    const response = await model.generateContent(prompt);
    console.log("🌟 API Response:", JSON.stringify(response, null, 2));

    const summaryText = response?.response?.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!summaryText) {
      
      console.warn("⚠️ No valid summary generated.");
      return res.status(500).json({ error: "Summary could not be generated." });
    }

    return res.status(200).json({ summary: summaryText });

  } catch (error: any) {
    console.error("❌ Error generating summary:", error.message || error);
    return res.status(500).json({ error: 'Failed to generate summary' });
  }
}
