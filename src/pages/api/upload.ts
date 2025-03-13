import type { NextApiRequest, NextApiResponse } from "next";
import { IncomingForm } from "formidable";
import fs from "fs/promises";
import pdfParse from "pdf-parse";
import { PDFDocument } from "pdf-lib";
import Tesseract from "tesseract.js";
import path from "path";
import poppler from "pdf-poppler";
import { processGraph } from "../../lib/graphProcessor";


export const activeProcesses = new Map<string, AbortController>();

export const config = { api: { bodyParser: false } };

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method Not Allowed" });

  const form = new IncomingForm({ keepExtensions: true });

  form.parse(req, async (err, fields, files) => {
    if (err) return res.status(500).json({ error: "File upload failed" });

    const file = files.file?.[0];
    if (!file) return res.status(400).json({ error: "No file uploaded" });

     
    try {
      const filePath = file.filepath;
      const fileBuffer = await fs.readFile(filePath);

      const originalFilename = path.parse(file.originalFilename || "document").name.replace(/\s+/g, "_");
      console.log(`📂 Processing file: ${originalFilename}`);
     

      let extractedText = "";
      let scannedText = "";
      let graphText = "";

      console.log("📄 Extracting text using pdf-parse...");
      const parsedPdf = await pdfParse(fileBuffer);
      extractedText = parsedPdf.text.trim();
      console.log("📜 Extracted Text (pdf-parse):", extractedText ? "Text Found ✅" : "No Text Found ❌");

      const pdfDoc = await PDFDocument.load(fileBuffer);
      let hasImages = false;

      for (const page of pdfDoc.getPages()) {
        if (page.node.Annots || page.node.XObject) {
          hasImages = true;
          break;
        }
      }
      console.log(`📷 Scanned Image Detection (pdf-lib): ${hasImages ? "Images Found ✅" : "No Images ❌"}`);

      if (hasImages) {
        console.log("🔄 Converting PDF to images for OCR...");
        const outputDir = path.join(process.cwd(), "public", "pdf_images");
        await fs.mkdir(outputDir, { recursive: true });

        const popplerOptions = {
          format: "png",
          out_dir: outputDir,
          out_prefix: `${originalFilename}_page`,
          page: null,
        };

        await poppler.convert(filePath, popplerOptions);

        const imageFiles = (await fs.readdir(outputDir))
          .filter(file => file.startsWith(originalFilename) && file.endsWith(".png"))
          .sort(); 

        if (imageFiles.length === 0) {
          throw new Error("PDF-to-Image conversion failed. No images were generated.");
        }
        console.log("🖼️ PDF successfully converted to images:", imageFiles);

        
        console.log("🔍 Running OCR on all extracted images...");
        for (const image of imageFiles) {
          const imagePath = path.join(outputDir, image);
          console.log(`🔹 Processing ${imagePath} with OCR...`);
          
          const ocrResult = await Tesseract.recognize(imagePath, "eng");
          scannedText += `\n\n[OCR ${image}]:\n${ocrResult.data.text.trim()}`;
        }
        console.log("📝 Extracted Text (OCR):", scannedText ? "Text Found ✅" : "No OCR Text Found ❌");

        //adding graph analysing 
        for (const image of imageFiles) {
          const imagePath = path.join(outputDir, image);

          // 🔍 Check if this image is a graph
          const graphResponse = await processGraph(imagePath);
          if (graphResponse.graph_detected) {
            graphText += `\n\n[Graph Detected]: ${graphResponse.graph_info}`;
          }

          
        }


        // for (const file of imageFiles) {
        //   await fs.unlink(path.join(outputDir, file));
        // }
        // await fs.rmdir(outputDir);
      }

      let finalExtractedText = extractedText;
      if (scannedText) {
        finalExtractedText += `\n\n[Scanned Text Extracted]:\n${scannedText}`;
      }
      if (graphText) {
        finalExtractedText += `\n\n[Graph Information]:\n${graphText}`;
      }

      //! console.log("Final Extracted Text Analysis:");
      //! console.log(`- Total Length: ${finalExtractedText.length} characters`);
      //! console.log(`- Preview (first 500 chars): ${finalExtractedText.slice(0, 500)}`);

      if (!finalExtractedText.trim()) {
        throw new Error("No text could be extracted from the document.");
        
      }

      await fs.unlink(filePath);

      res.status(200).json({ message: "File uploaded successfully", text: finalExtractedText });
    } catch (error: any) {
      console.error("❌ Error processing file:", {
        message: error.message,
        name: error.name,
        stack: error.stack
      });
      res.status(500).json({ error: "Failed to process file.", details:error.message });

    }
  });
}

