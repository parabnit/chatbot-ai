// memory/vectorStore.js
const { ChromaClient } = require("chromadb");

let client = null;
let collection = null;

async function getCollection() {
  if (collection) return collection;

  try {
    // Create client pointing to your running Chroma server
    if (!client) {
      client = new ChromaClient({ path: "http://127.0.0.1:8000" });
    }

    // Try to get or create collection
    collection = await client.getOrCreateCollection({ name: "pdf_chunks" });
    return collection;
  } catch (err) {
    console.error("Failed to connect to ChromaDB. Make sure the server is running on http://127.0.0.1:8000");
    throw err;
  }
}

module.exports = { getCollection };
