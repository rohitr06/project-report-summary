import type { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { liked } = req.body;
  if (liked === undefined) {
    return res.status(400).json({ error: "Missing feedback data" });
  }

  try {
    // Send feedback to Google API (replace with actual API URL)
    const response = await axios.post("https://api.google.com/feedback", { liked });

    if (response.status === 200) {
      return res.status(200).json({ message: "Feedback sent successfully" });
    } else {
      throw new Error("Failed to send feedback to API");
    }
  } catch (error) {
    console.error("❌ Error sending feedback:", error);
    return res.status(500).json({ error: "Failed to send feedback" });
  }
}
