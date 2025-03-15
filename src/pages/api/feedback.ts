import type { NextApiRequest, NextApiResponse } from "next";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const { action, summary } = req.body;

    if (!action) {
      return res.status(400).json({ error: "Missing action type" });
    }

    //  Handle Like/Dislike Feedback
    if (action === "like" || action === "dislike") {
      await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: "User feedback received on an AI-generated summary." },
          { role: "user", content: `Feedback type: ${action}. Summary: ${summary || "N/A"}` },
        ],
      });
      console.log("Feedback recorded:", action);

      return res.status(200).json({ message: `Feedback recorded: ${action}` });
    }

    //  Handle Regenerate Request
    if (action === "regenerate") {
      if (!summary) {
        return res.status(400).json({ error: "Summary is required for regeneration" });
      }

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: "Rewrite the following summary to improve clarity and readability while retaining all details." },
          { role: "user", content: summary },
        ],
      });

      const newSummary = response.choices[0]?.message?.content || "Error generating summary";
      console.log("Regenerated summary:", newSummary);

      return res.status(200).json({ message: "Regeneration successful", summary: newSummary });
    }

    return res.status(400).json({ error: "Invalid request action" });
  } catch (error) {
    console.error("Error processing feedback:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}