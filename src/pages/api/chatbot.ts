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
    message = "The question is not from the provided Document";
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

   const prompt = `
    You are an AI chatbot. Answer the user's question strictly based on the extracted text.
   If the question is not related to the extracted text, respond with: "The question is not from the provided document."

  Extracted Text:
   ${extractedText || "No additional context provided."}

   User's Question:
   ${message}
   `;

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
    
    const response = await model.generateContent(prompt);
    const reply = response?.response?.candidates?.[0]?.content?.parts?.[0]?.text || "The question is not from the provided Document";
    

    console.log("🤖 Chatbot Reply:", reply);
    return res.status(200).json({ reply });
  } catch (error: any) {
    console.error("❌ Error details:", {message: error.message, stack: error.stack,
      name:error.name, code:error.code, details:error.details
    });
    return res.status(500).json({ error: "Failed to process query", details:error.message});
  }
}
