import type { NextApiRequest, NextApiResponse } from "next";
import mongoose from "mongoose";

const MONGODB_URI = "mongodb+srv://backupdata044:5A653Tfr95bxBmQf@sample.svsnq.mongodb.net/sampleDB?retryWrites=true&w=majority";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(MONGODB_URI, {
        dbName: "Sample", // Change this if needed
      });
    }
    res.status(200).json({ message: "Database connection successful!" });
  } catch (error: any) {
    console.error("MongoDB Connection Error:", error);
    res.status(500).json({ error: "Failed to connect to database", details: error.message });
  }
}
