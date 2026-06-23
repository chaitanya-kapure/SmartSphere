const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const compression = require("compression");
const mongoSanitize = require("express-mongo-sanitize");
const http = require("http");
const rateLimit = require("express-rate-limit");
const connectDB = require("./config/db");
const config = require("./config/env");
const { AppError } = require("./utils/errors");
const { errorHandler } = require("./middleware/errorHandler");
const { requestLogger } = require("./utils/logger");
const { sanitizeInput } = require("./middleware/sanitize");
const socketInit = require("./socket");

const app = express();

connectDB();

app.use(helmet());
app.use(compression());
app.use(cors({ origin: config.clientUrl, credentials: true }));
app.use(mongoSanitize());
app.use(sanitizeInput);
app.use(express.json({ limit: "1mb" }));

app.use(requestLogger);

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { success: false, message: "Too many requests", errorCode: "RATE_LIMIT" },
});
app.use(globalLimiter);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { success: false, message: "Too many auth attempts", errorCode: "RATE_LIMIT" },
});
app.use("/api/auth", authLimiter);

const aiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: { success: false, message: "AI rate limit exceeded", errorCode: "RATE_LIMIT" },
});
app.use("/api/ai", aiLimiter);

const uploadLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: { success: false, message: "Upload rate limit exceeded", errorCode: "RATE_LIMIT" },
});
app.use("/api/uploads", uploadLimiter);

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
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
    errorCode: "NOT_FOUND",
  });
});

app.use(errorHandler);

const server = http.createServer(app);
socketInit.init(server);

server.listen(config.port, () => {
  console.log(`Server running on port ${config.port}`);
});

process.on("unhandledRejection", (err) => {
  console.error("[UNHANDLED_REJECTION]", err);
  process.exit(1);
});

process.on("uncaughtException", (err) => {
  console.error("[UNCAUGHT_EXCEPTION]", err);
  process.exit(1);
});
