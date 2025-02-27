import type { NextApiRequest, NextApiResponse } from 'next';
import { dbConnect } from '../../../lib/dbConnect';
import mongoose from 'mongoose';

const SummarySchema = new mongoose.Schema({
  fileName: String,
  summary: String,
  keywords: String,
  length: String,
});

const Summary = mongoose.models.Summary || mongoose.model('Summary', SummarySchema);

// export default async function handler(req: NextApiRequest, res: NextApiResponse) {
//   if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

//   await dbConnect(); // Ensures MongoDB is connected before storing data

//   const { fileName, summary, keywords, length } = req.body;

//   try {
//     const newSummary = new Summary({ fileName, summary, keywords, length });
//     await newSummary.save();
//     res.status(201).json({ message: 'Summary stored successfully' });
//   } catch (error) {
//     console.error("❌ Error saving summary:", error);
//     res.status(500).json({ error: 'Failed to store summary' });
//   }
// } 


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  await dbConnect(); // Ensures MongoDB is connected before storing data

  console.log("📥 Incoming request to /api/store-summary");
  console.log("📄 Request Body:", req.body); // Log request body

  const { fileName, summary, keywords, length } = req.body;

  if (!fileName || !summary || !keywords || !length) {
    console.error("❌ Missing data in request body");
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const newSummary = new Summary({ fileName, summary, keywords, length });
    await newSummary.save();
    console.log("✅ Summary saved in mangoDB:", newSummary);
    res.status(201).json({ message: 'Summary stored successfully' });
  } catch (error) {
    console.error("❌ Error saving summary:", error);
    res.status(500).json({ error: 'Failed to store summary' });
  }
}
