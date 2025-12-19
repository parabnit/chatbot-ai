const fs = require("fs");
const pdf = require("pdf-parse");
const { v4: uuid } = require("uuid");
const { collectionPromise } = require("./vectorStore");

async function embedPDF(filePath, filename) {
  const buffer = fs.readFileSync(filePath);
  const data = await pdf(buffer);

  const text = data.text.replace(/\n+/g, " ");
  const chunks = text.match(/.{1,700}/g) || [];

  const collection = await collectionPromise;

  for (const chunk of chunks) {
    const res = await fetch("http://localhost:11434/api/embeddings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "nomic-embed-text",
        prompt: chunk
      })
    });

    const json = await res.json();

    await collection.add({
      ids: [uuid()],
      documents: [chunk],
      embeddings: [json.embedding],
      metadatas: [{ source: filename }]
    });
  }
}

module.exports = { embedPDF };
