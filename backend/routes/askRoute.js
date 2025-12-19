const express = require("express");
const { Pool } = require("pg");
const ollama = require("ollama").default; // Note the .default for CommonJS

const router = express.Router();

// PostgreSQL connection
const pool = new Pool({
  user: "pdfuser",
  host: "localhost",
  database: "pdfdb",
  password: "pdfpass",
  port: 5432,
});

/**
 * Simple search: get chunks containing the keyword
 * Using ILIKE for basic pattern matching
 */
async function getRelevantChunks(question) {
  try {
    const res = await pool.query(
      `SELECT text FROM pdf_chunks
       WHERE text ILIKE $1
       ORDER BY id
       LIMIT 3`,
      [`%${question}%`]
    );
    return res.rows.map((r) => r.text);
  } catch (err) {
    console.error("Database Query Error:", err);
    return [];
  }
}

/**
 * POST /ask
 * Route to handle RAG (Retrieval-Augmented Generation)
 */
router.post("/ask", async (req, res) => {
  try {
    const { question } = req.body;

    if (!question) {
      return res.status(400).json({ error: "No question provided" });
    }

    // 1. Retrieve context from PostgreSQL
    const chunks = await getRelevantChunks(question);
    
    // Fallback if no context is found
    const context = chunks.length > 0 
      ? chunks.join("\n\n") 
      : "No relevant documents found in the database.";

    // 2. Construct the Prompt
    const prompt = `
Answer the question strictly using the provided context. 
If the answer is not in the context, say "I don't know based on the documents provided."

Context:
${context}

Question:
${question}
`;

    // 3. Call Ollama
    // Ensure you have run 'ollama pull mistral' in your terminal
    const response = await ollama.generate({
      model: "mistral",
      prompt: prompt,
      stream: false, // Set to true if you want to handle streaming responses
    });

    // 4. Send response back to React frontend
    res.json({ 
      answer: response.response,
      sources: chunks.length // Optional: let the UI know how many chunks were used
    });

  } catch (err) {
    console.error("Route Error:", err);
    res.status(500).json({ 
      error: "Chat failed", 
      message: err.message 
    });
  }
});

module.exports = router;