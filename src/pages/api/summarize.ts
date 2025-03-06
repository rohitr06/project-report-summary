import type { NextApiRequest, NextApiResponse } from 'next';
//* import { GoogleGenerativeAI } from "@google/generative-ai";
import OpenAI from "openai";
import dotenv from 'dotenv';
import { log } from 'console';

dotenv.config();

const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) {
  console.error("❌ OPENAI_API_KEY is missing! Add it to .env.local");
}

const openAi = new OpenAI({ apiKey });

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { text, length = "Short", keywords = "" } = req.body;

  if (!text || text.trim() === "") {
    return res.status(400).json({ error: 'No text provided for summarization' });
  }

  try {
    let prompt = `Summarize this report, including graphs. Summary length: ${length}.`;
if (keywords) {
  prompt += ` Focus on the following topics: ${keywords}.`;
}
prompt += `\n\n${text}`;


    
    const response = await openAi.chat.completions.create({
  model: "gpt-4",
  messages: [{ role: "system", content: "You are an AI assistant that provides summaries strictly based on the given text." }, { role: "user", content: prompt }],
});
console.log("✅ Summary generated successfully.");
    const summaryText = response.choices?.[0]?.message?.content?.trim();    
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
