// backend/routes/uploadRoute.js
const express = require("express");
const multer = require("multer");
const pdfParse = require("pdf-parse");
const pool = require("../db");

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

/* -------------------- HELPERS -------------------- */

// Clean extracted PDF text
const cleanText = (text) => {
  return text
    .replace(/[^\x20-\x7E\s]/g, "") // remove non-printable chars
    .replace(/\s+/g, " ")           // normalize whitespace
    .trim();
};

// Chunk text by words (~300–400 words per chunk)
const chunkText = (text, chunkSize = 350) => {
  const words = text.split(" ");
  const chunks = [];

  for (let i = 0; i < words.length; i += chunkSize) {
    chunks.push(words.slice(i, i + chunkSize).join(" "));
  }

  return chunks;
};

/* -------------------- ROUTE -------------------- */

router.post("/upload", upload.single("pdf"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No PDF file uploaded" });
  }

  const pdfName = req.file.originalname;

  try {
    /* ---------- Prevent duplicate PDF uploads ---------- */
    const existing = await pool.query(
      "SELECT 1 FROM pdf_chunks WHERE pdf_name = $1 LIMIT 1",
      [pdfName]
    );

    if (existing.rowCount > 0) {
      return res.status(409).json({
        error: "PDF already uploaded",
        pdf_name: pdfName,
      });
    }

    /* ---------- Parse PDF ---------- */
    const pdfData = await pdfParse(req.file.buffer);
    const sanitizedText = cleanText(pdfData.text);

    if (!sanitizedText || sanitizedText.length < 50) {
      return res.status(400).json({
        error: "PDF contains no readable text",
      });
    }

    /* ---------- Chunk text ---------- */
    const chunks = chunkText(sanitizedText);

    /* ---------- Insert into DB (transaction) ---------- */
    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];

        if (chunk.length < 20) continue; // skip garbage chunks

        await client.query(
          `
          INSERT INTO pdf_chunks (pdf_name, chunk_index, text, tsv)
          VALUES ($1, $2, $3, to_tsvector('english', $3))
          `,
          [pdfName, i, chunk]
        );
      }

      await client.query("COMMIT");
    } catch (dbErr) {
      await client.query("ROLLBACK");
      throw dbErr;
    } finally {
      client.release();
    }

    /* ---------- Success ---------- */
    res.json({
      success: true,
      pdf_name: pdfName,
      chunks_stored: chunks.length,
      message: "PDF uploaded and indexed successfully",
    });
  } catch (err) {
    console.error("PDF upload failed:", err);
    res.status(500).json({
      error: "PDF processing failed",
    });
  }
});

module.exports = router;
