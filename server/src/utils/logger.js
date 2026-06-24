const morgan = require("morgan");
const config = require("../config/env");

const requestLogger = morgan(
  ':remote-addr ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent" :response-time ms',
  {
    skip: () => config.nodeEnv === "test",
  }
);

function info(...args) {
  console.log("[INFO]", ...args);
}

function warn(...args) {
  console.warn("[WARN]", ...args);
}

function error(...args) {
  console.error("[ERROR]", ...args);
}

function security(event, meta = {}) {
  console.warn("[SECURITY]", event, JSON.stringify(meta));
}

module.exports = { requestLogger, info, warn, error, security };
