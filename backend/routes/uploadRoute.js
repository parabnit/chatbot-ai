// backend/routes/uploadRoute.js
const express = require("express");
const multer = require("multer");
const pdfParse = require("pdf-parse");
const pool = require("../db");

const router = express.Router();
const upload = multer();

// Helper function to clean text
const cleanText = (text) => {
  return text
    .replace(/[^\x20-\x7E\s]/g, "") // 1. Remove non-printable/strange ASCII characters
    .replace(/\s+/g, " ")           // 2. Collapse multiple spaces/newlines into a single space
    .trim();                        // 3. Trim leading/trailing whitespace
};

router.post("/upload", upload.single("pdf"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    const pdfName = req.file.originalname;
    const data = await pdfParse(req.file.buffer);
    
    // Clean the extracted text
    const sanitizedText = cleanText(data.text);

    if (!sanitizedText) {
      return res.status(400).json({ error: "PDF appears to be empty or contains no readable text" });
    }

    // Split text into chunks (~1000 chars) while trying to respect word boundaries
    // This regex looks for up to 1000 characters but stops at a space
    const chunks = sanitizedText.match(/.{1,1000}(\s|$)/g) || [];

    // Use a transaction for better performance and reliability
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      
      for (let i = 0; i < chunks.length; i++) {
        const chunkText = chunks[i].trim();
        if (chunkText.length > 5) { // Ignore tiny "garbage" chunks
          await client.query(
            "INSERT INTO pdf_chunks (pdf_name, chunk_index, text) VALUES ($1, $2, $3)",
            [pdfName, i, chunkText]
          );
        }
      }
      
      await client.query("COMMIT");
    } catch (dbErr) {
      await client.query("ROLLBACK");
      throw dbErr;
    } finally {
      client.release();
    }

    res.json({ success: true, chunks: chunks.length });
  } catch (err) {
    console.error("Upload failed:", err);
    res.status(500).json({ error: "PDF processing failed" });
  }
});

module.exports = router;