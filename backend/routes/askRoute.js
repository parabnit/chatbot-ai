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
    options: { temperature: 0 },
  });

  return response.response.trim();
}

/* -------------------- STEP 2: POSTGRES FULL TEXT SEARCH -------------------- */
async function getRelevantChunks(searchQuery) {
  if (!searchQuery || searchQuery.trim() === "") return [];

  // convert query words to OR format for better matching
  const tsQuery = searchQuery
    .trim()
    .split(/\s+/)
    .map((w) => w.replace(/[^a-zA-Z0-9]/g, ""))
    .filter(Boolean)
    .join(" | ");

  const res = await pool.query(
    `
    SELECT text,
           ts_rank(
             to_tsvector('english', text),
             to_tsquery('english', $1)
           ) AS rank
    FROM pdf_chunks
    WHERE to_tsvector('english', text)
          @@ to_tsquery('english', $1)
    ORDER BY rank DESC
    LIMIT 5;
    `,
    [tsQuery]
  );

  // remove \n and return plain text
  return res.rows.map((r) => r.text.replace(/\n/g, " "));
}

/* -------------------- STEP 3: FINAL ANSWER -------------------- */
router.post("/ask", async (req, res) => {
  try {
    const { question } = req.body;

    if (!question || question.trim() === "") {
      return res.json({ answer: "Please enter a question." });
    }

    console.log("User question:", question);

    // 1️⃣ Rewrite question to search keywords
    const rewrittenQuery = await rewriteQuestionForSearch(question);
    console.log("Search keywords:", rewrittenQuery);

    // 2️⃣ Search PDF chunks in DB
    const chunks = await getRelevantChunks(rewrittenQuery);
    console.log("Chunks found:", chunks.length);

    let answer, source;

    if (chunks.length > 0) {
      // ✅ PDF matches found → answer using PDF content
      const context = chunks.join(" "); // join chunks with space
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
        options: { temperature: 0.2 },
      });

      answer = response.response.trim();

      // ❌ If PDF says "I don't know", fallback to general AI
      if (/i don't know/i.test(answer)) {
        const fallback = await ollama.generate({
          model: "phi3:mini",
          prompt: question,
          options: { temperature: 0.7 },
        });
        answer = fallback.response.trim();
        source = "general-ai";
      } else {
        source = "pdf";
      }
    } else {
      // ❌ No chunks → fallback to general AI
      const fallback = await ollama.generate({
        model: "phi3:mini",
        prompt: question,
        options: { temperature: 0.7 },
      });
      answer = fallback.response.trim();
      source = "general-ai";
    }

    res.json({ answer, source });
  } catch (err) {
    console.error("Ask error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
