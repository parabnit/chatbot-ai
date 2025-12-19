const { collectionPromise } = require("./vectorStore");

async function askQuestion(question) {
  const collection = await collectionPromise;

  // Embed question
  const embRes = await fetch("http://localhost:11434/api/embeddings", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "nomic-embed-text",
      prompt: question
    })
  });

  const { embedding } = await embRes.json();

  // Search
  const results = await collection.query({
    queryEmbeddings: [embedding],
    nResults: 4
  });

  const context = (results.documents || []).flat().join("\n");

  // Chat with Mistral
  const chatRes = await fetch("http://localhost:11434/api/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "mistral",
      prompt: `Answer ONLY from the context.\n\nContext:\n${context}\n\nQuestion:\n${question}`,
      stream: false
    })
  });

  const data = await chatRes.json();
  return data.response || "No answer found";
}

module.exports = { askQuestion };
