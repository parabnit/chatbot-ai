const express = require("express");
const { Pool } = require("pg");
const ollama = require("ollama").default;

const router = express.Router();

/**
 * PostgreSQL connection
 */
const pool = new Pool({
  user: "pdfuser",
  host: "localhost",
  database: "pdfdb",
  password: "pdfpass",
  port: 5432,
});

/**
 * Simple keyword-based search (ILIKE)
 * Fetches up to 3 relevant chunks
 */
async function getRelevantChunks(question) {
  try {
    const res = await pool.query(
      `
      SELECT text
      FROM pdf_chunks
      WHERE text ILIKE $1
      ORDER BY id
      LIMIT 3
      `,
      [`%${question}%`]
    );

    return res.rows.map(row => row.text);
  } catch (err) {
    console.error("DB Error:", err);
    return [];
  }
}

/**
 * POST /ask (STREAMING RESPONSE)
 */
router.post("/ask", async (req, res) => {
  try {
    const { question } = req.body;

    if (!question || question.trim() === "") {
      return res.status(400).json({ error: "No question provided" });
    }

    // 1️⃣ Fetch relevant PDF chunks
    const chunks = await getRelevantChunks(question);

    const context =
      chunks.length > 0
        ? chunks.join("\n\n")
        : "No relevant documents found in the database.";

    // 2️⃣ Build prompt
    const prompt = `
Answer strictly using the context below.
If the answer is not present, say:
"I don't know based on the documents provided."

Context:
${context}

Question:
${question}
`;

    // 3️⃣ Streaming headers
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.setHeader("Transfer-Encoding", "chunked");

    // 4️⃣ Call Ollama with phi3:mini
    const stream = await ollama.generate({
      model: "phi3:mini",
      prompt: prompt,
      stream: true,
      options: {
        temperature: 0.2,   // factual answers
        num_ctx: 4096       // good context size for phi3
      }
    });

    // 5️⃣ Stream response token-by-token
    for await (const part of stream) {
      if (part.response) {
        res.write(part.response);
      }
    }

    res.end();
  } catch (err) {
    console.error("Ask Route Error:", err);
    res.status(500).end("Chat failed");
  }
});

module.exports = router;
