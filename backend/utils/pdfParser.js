const fs = require("fs");
const pdfParse = require("pdf-parse"); // works now

async function extractTextFromPDF(filePath) {
  const buffer = fs.readFileSync(filePath);
  const data = await pdfParse(buffer);
  return data.text;
}

module.exports = extractTextFromPDF;
