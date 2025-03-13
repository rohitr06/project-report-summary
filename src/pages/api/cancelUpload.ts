import type { NextApiRequest, NextApiResponse } from "next";
import fs from "fs/promises";
import path from "path";
import { activeProcesses } from "../api/upload"; 

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const { fileName } = req.body;
    if (!fileName) {
      return res.status(400).json({ error: "No file specified" });
    }

    const filePath = path.join(process.cwd(), "uploads", fileName); // Adjust path as needed

    // Abort any ongoing processing
    if (activeProcesses.has(fileName)) {
      activeProcesses.get(fileName)?.abort();
      activeProcesses.delete(fileName);
      console.log(`⛔ Processing canceled for ${fileName}`);
    }

    // Check if the file exists before deletion
    try {
      await fs.access(filePath);
      await fs.unlink(filePath);
      console.log(`🗑️ Deleted file: ${filePath}`);
    } catch (err) {
      console.warn(`⚠️ File not found: ${filePath}`);
    }

    res.status(200).json({ message: "File deleted successfully" });
  } catch (error) {
    console.error("Error deleting file:", error);
    res.status(500).json({ error: "Failed to delete file" });
  }
}
