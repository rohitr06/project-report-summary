import type { NextApiRequest, NextApiResponse } from "next";
import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) {
  console.error("❌ OPENAI_API_KEY is missing! Add it to .env.local");
}

const openai = new OpenAI({ apiKey });

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { extractedText } = req.body;

  if (!extractedText || extractedText.trim() === "") {
    return res.status(400).json({ error: "No text provided for keyword extraction" });
  }

  try {
    // const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
    // // const prompt = `Extract the most relevant keywords from the following text covering graphs/lines/bars/pie-charts, separated by commas:\n\n${extractedText}`;
    // const prompt = `Extract keywords from the following text in batches of 8, ensuring each batch covers a diverse range of topics such as text, information, graphs, lines, bars, pie charts, trends, comparisons, patterns, statistics etc, randomly not in a sequential ordered in every batch. The keywords should be comma-separated and structured in such a way that each batch of 8 represents a broad spectrum of the content. \n
    // Output format: Batch 1: keyword1, keyword2, keyword3, keyword4, keyword5, keyword6, keyword7, keyword8 \n
    //  Batch 2: keyword9, keyword10, keyword11, keyword12, keyword13, keyword14, keyword15, keyword16 \n 
    //  Batch 3: keyword17, keyword18, keyword19, keyword20, keyword21, keyword22, keyword23, keyword24  and so on.... \n Text:  \n${extractedText}`;

    // const response = await model.generateContent(prompt);  //used for GeminiAI

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: "Extract keywords from the following text in batches of 8 covering all the topics . Ensuring each batch covers a diverse range of topics such as text, information, graphs, lines, bars, pie charts, trends, comparisons, patterns, statistics etc, randomly not in a sequential ordered in every batch but every batch must cover all topics. The keywords should be comma-separated and structured in such a way that each batch of 8 represents a broad spectrum of the content.\n Return the output strictly in the following format: \n Batch 1: keyword1, keyword2, keyword3, keyword4, keyword5, keyword6, keyword7, keyword8 \n Batch 2: keyword9, keyword10, keyword11, keyword12, keyword13, keyword14, keyword15, keyword16 \n Batch 3: keyword17, keyword18, keyword19, keyword20, keyword21, keyword22, keyword23, keyword24  and so on ... \n Do not include any explanations or extra text. Only return the keywords in the exact format shown above." },
        { role: "user", content: extractedText }
      ],
      temperature: 0.3,
      max_tokens: 250,
    });

    // const keywordText = response?.response?.candidates?.[0]?.content?.parts?.[0]?.text; //used for GeminiAI

    const keywordText = response.choices[0]?.message?.content?.trim() || "";

    console.log("🔑 Extracted Keywords:", keywordText);
    if (!keywordText) {
      return res.status(500).json({ error: "Failed to extract keywords" });
    }


    const keywordBatches: string[][] = keywordText
      .split("\n")
      .map((line) => line.match(/Batch \d+:\s*(.+)/i))
      .filter((match) => match)  // Match "Batch 1:", "Batch 2:" etc.
      .map((match) => match![1].split(",").map((kw) => kw.trim()) || [] );
    

    return res.status(200).json({ keywords: keywordBatches });
  } catch (error: any) {
    console.error("❌ Error extracting keywords:", error.message || error);
    return res.status(500).json({ error: "Failed to extract keywords" });
  }
}
