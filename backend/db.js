// backend/db.js
const { Pool } = require("pg");

const pool = new Pool({
  user: "pdfuser",
  host: "localhost",
  database: "pdfdb",
  password: "pdfpass",
  port: 5432,
});

module.exports = pool;
