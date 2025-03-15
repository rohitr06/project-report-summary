import type { NextApiRequest, NextApiResponse } from "next";
import OpenAI from "openai";

import dotenv from "dotenv";

dotenv.config();

const apiKey = process.env.OPENAI_API_KEY;
console.log(apiKey);
if (!apiKey) {
  console.error("❌ OPENAI_API_KEY is missing! Add it to .env.local");
}

const openAi = new OpenAI({ apiKey });

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  //! console.log("Chatbot API Request Body:", req.body);

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  

  const { message, extractedText } = req.body;

  
  //! console.log("Received Message:", message);
  //!console.log("Extracted Text Length:", extractedText?.length || 'No text');

  if (!extractedText || extractedText.trim() === "") {
    return res.status(400).json({ error: "No extracted text provided" });
  }

  if (!message ) {
    // message = "The question is not from the provided Document";
    return res.status(400).json({ error: "Message is required" });
  }

  //! const prompt = `
  //! You are an AI chatbot.  If the user's question relates to a general conversation that are not in extracted text, respond naturally. However, if the question is about specific information, answer strictly based on the extracted text provided. Do not generate information beyond the extracted content.
  //! If the question is not related to the extracted text, respond with: "The question is not from the provided document."

  //! Extracted Text:
  //! ${extractedText || "No additional context provided."}

  //! User's Question:
  //! ${message}
  //! `;

  //  const prompt = `
  //   You are an AI chatbot. Answer the user's question strictly based on the extracted text.
  //  If the question is not related to the extracted text, respond with: "The question is not from the provided document."

  // Extracted Text:
  //  ${extractedText || "No additional context provided."}

  //  User's Question:
  //  ${message}
  //  `;

  try {
    const response = await openAi.chat.completions.create({
      model: "gpt-4", 
      messages: [
        { role: "system", content: "You are an AI chatbot. Answer the user's question strictly based on the extracted text. Keep the answer straightforward and concise. If the question is not related to the extracted text, respond with: 'The question is not from the provided document.'" },
        { role: "user", content: `Extracted Text: ${extractedText}\n\nUser's Question: ${message}` }
      ],
      temperature: 0.7,
      max_tokens: 300,
    });
    const reply = response.choices?.[0]?.message?.content?.trim() || "The question is not from the provided document."; // ✅ Added a fallback
    

    console.log("🤖 Chatbot Reply:", reply);
    return res.status(200).json({ reply });
  } catch (error: any) {
    console.error("❌ Error details:", {message: error.message, stack: error.stack,
      name:error.name, code:error.code, details:error.details
    });
    return res.status(500).json({ error: "Failed to process query", details:error.message});
  }
}
