// backend/server.js
const express = require("express");
const cors = require("cors");
const uploadRoute = require("./routes/uploadRoute");
const askRoute = require("./routes/askRoute");

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api", uploadRoute);
app.use("/api", askRoute);

// Start server
app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
