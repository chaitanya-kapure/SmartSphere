const xss = require("xss");

const SKIP_FIELDS = new Set(["password", "passwordHash", "refreshToken"]);

function sanitizeValue(value) {
  if (typeof value === "string") return xss(value.trim());
  if (Array.isArray(value)) return value.map(sanitizeValue);
  if (value && typeof value === "object" && value.constructor === Object) {
    return sanitizeObject(value);
  }
  return value;
}

function sanitizeObject(obj) {
  const sanitized = {};
  for (const [key, value] of Object.entries(obj)) {
    if (SKIP_FIELDS.has(key)) {
      sanitized[key] = value;
    } else {
      sanitized[key] = sanitizeValue(value);
    }
  }
  return sanitized;
}

function sanitizeInput(req, res, next) {
  if (req.body) {
    req.body = sanitizeObject(req.body);
  }
  if (req.query) {
    req.query = sanitizeObject(req.query);
  }
  if (req.params) {
    req.params = sanitizeObject(req.params);
  }
  next();
}

module.exports = { sanitizeInput };
