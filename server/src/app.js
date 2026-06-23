const express = require("express");
const connectDB = require("./config/db");
const config = require("./config/env");

const app = express();

app.use(express.json());

connectDB();

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Internal server error" });
});

app.listen(config.port, () => {
  console.log(`Server running on port ${config.port}`);
});
