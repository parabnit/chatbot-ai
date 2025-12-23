const express = require("express");
const { Pool } = require("pg");
const ollama = require("ollama").default;

const router = express.Router();

/* -------------------- PostgreSQL -------------------- */
const pool = new Pool({
  user: "pdfuser",
  host: "localhost",
  database: "pdfdb",
  password: "pdfpass",
  port: 5432,
});

/* -------------------- STEP 1: AI QUERY REWRITE -------------------- */
/**
 * phi-3 mini friendly: very short, rule-based prompt
 */
async function rewriteQuestionForSearch(question) {
  const prompt = `
Rewrite question as search keywords.
No sentences.
No explanation.

Question:
${question}

Keywords:
`;

  const response = await ollama.generate({
    model: "phi3:mini",
    prompt,
    options: {
      temperature: 0,
    },
  });

  return response.response.trim();
}

/* -------------------- STEP 2: POSTGRES FULL TEXT SEARCH -------------------- */
async function getRelevantChunks(searchQuery) {
  const res = await pool.query(
    `
    SELECT text,
           ts_rank(
             to_tsvector('english', text),
             plainto_tsquery('english', $1)
           ) AS rank
    FROM pdf_chunks
    WHERE to_tsvector('english', text)
          @@ plainto_tsquery('english', $1)
    ORDER BY rank DESC
    LIMIT 5;
    `,
    [searchQuery]
  );

  return res.rows.map(r => r.text);
}

/* -------------------- STEP 3: FINAL ANSWER -------------------- */
router.post("/ask", async (req, res) => {
  try {
    const { question } = req.body;

    if (!question || question.length < 3) {
      return res.json({ answer: "Invalid question." });
    }

    /* 🧠 THINK FIRST */
    const rewrittenQuery = await rewriteQuestionForSearch(question);

    console.log("User:", question);
    console.log("Search:", rewrittenQuery);

    /* 🔍 SEARCH */
    const chunks = await getRelevantChunks(rewrittenQuery);

    if (chunks.length === 0) {
      return res.json({
        answer: "I don't know based on the documents provided.",
      });
    }

    const context = chunks.join("\n\n");

    /* 🧠 ANSWER (STRICT) */
    const finalPrompt = `
Answer using ONLY the text below.
If answer not present, say "I don't know".

Text:
${context}

Question:
${question}

Answer:
`;

    const response = await ollama.generate({
      model: "phi3:mini",
      prompt: finalPrompt,
      options: {
        temperature: 0.2,
      },
    });

    res.json({ answer: response.response.trim() });
  } catch (err) {
    console.error("Ask error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
