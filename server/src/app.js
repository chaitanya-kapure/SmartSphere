const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const http = require("http");
const rateLimit = require("express-rate-limit");
const connectDB = require("./config/db");
const config = require("./config/env");
const { AppError } = require("./utils/errors");
const socketInit = require("./socket");

const app = express();

connectDB();

app.use(helmet());
app.use(cors({ origin: config.clientUrl, credentials: true }));
app.use(express.json({ limit: "1mb" }));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: "Too many requests, please try again later" },
});
app.use("/api/auth", limiter);

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

app.use("/api/auth", require("./routes/auth"));
app.use("/api/complaints", require("./routes/complaints"));
app.use("/api/uploads", require("./routes/uploads"));
app.use("/api/maps", require("./routes/maps"));
app.use("/api/notifications", require("./routes/notifications"));
app.use("/api/analytics", require("./routes/analytics"));
app.use("/api/ai", require("./routes/ai"));

app.all("*", (req, res) => {
  res.status(404).json({ error: `Route ${req.originalUrl} not found` });
});

app.use((err, req, res, next) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ error: err.message });
  }
  if (err.name === "CastError") {
    return res.status(400).json({ error: "Invalid ID format" });
  }
  if (err.name === "ValidationError") {
    return res.status(400).json({ error: err.message });
  }
  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({ error: "File too large (max 5MB)" });
  }
  if (err.code === 11000) {
    return res.status(409).json({ error: "Duplicate value" });
  }
  console.error("Unhandled error:", err);
  res.status(500).json({ error: "Internal server error" });
});

const server = http.createServer(app);
socketInit.init(server);

server.listen(config.port, () => {
  console.log(`Server running on port ${config.port}`);
});

process.on("unhandledRejection", (err) => {
  console.error("Unhandled rejection:", err);
  process.exit(1);
});

process.on("uncaughtException", (err) => {
  console.error("Uncaught exception:", err);
  process.exit(1);
});
