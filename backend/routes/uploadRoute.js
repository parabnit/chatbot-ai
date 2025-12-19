// backend/routes/uploadRoute.js
const express = require("express");
const multer = require("multer");
const pdfParse = require("pdf-parse");
const pool = require("../db");

const router = express.Router();
const upload = multer();

router.post("/upload", upload.single("pdf"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    const pdfName = req.file.originalname;
    const data = await pdfParse(req.file.buffer);
    const text = data.text;

    // Split text into chunks (~1000 chars)
    const chunks = text.match(/(.|\n){1,1000}/g);

    for (let i = 0; i < chunks.length; i++) {
      await pool.query(
        "INSERT INTO pdf_chunks (pdf_name, chunk_index, text) VALUES ($1, $2, $3)",
        [pdfName, i, chunks[i]]
      );
    }

    res.json({ success: true, chunks: chunks.length });
  } catch (err) {
    console.error("Upload failed:", err);
    res.status(500).json({ error: "PDF processing failed" });
  }
});

module.exports = router;
