const ERROR_CODES = {
  VALIDATION_ERROR: "VALIDATION_ERROR",
  AUTH_ERROR: "AUTH_ERROR",
  NOT_FOUND: "NOT_FOUND",
  FORBIDDEN: "FORBIDDEN",
  RATE_LIMIT: "RATE_LIMIT",
  FILE_ERROR: "FILE_ERROR",
  DUPLICATE_ERROR: "DUPLICATE_ERROR",
  INTERNAL_ERROR: "INTERNAL_ERROR",
};

function mapError(err) {
  if (err instanceof (require("../utils/errors").AppError)) {
    if (err.statusCode === 401) return ERROR_CODES.AUTH_ERROR;
    if (err.statusCode === 403) return ERROR_CODES.FORBIDDEN;
    if (err.statusCode === 404) return ERROR_CODES.NOT_FOUND;
    if (err.statusCode === 409) return ERROR_CODES.DUPLICATE_ERROR;
    return ERROR_CODES.VALIDATION_ERROR;
  }
  if (err.name === "CastError") return ERROR_CODES.VALIDATION_ERROR;
  if (err.name === "ValidationError") return ERROR_CODES.VALIDATION_ERROR;
  if (err.code === "LIMIT_FILE_SIZE") return ERROR_CODES.FILE_ERROR;
  if (err.code === 11000) return ERROR_CODES.DUPLICATE_ERROR;
  if (err.type === "entity.too.large") return ERROR_CODES.FILE_ERROR;
  return ERROR_CODES.INTERNAL_ERROR;
}

function errorHandler(err, req, res, next) {
  const errorCode = mapError(err);

  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal server error";

  if (err.name === "CastError") {
    statusCode = 400;
    message = "Invalid ID format";
  }
  if (err.name === "ValidationError") {
    statusCode = 400;
    message = err.message;
  }
  if (err.code === "LIMIT_FILE_SIZE") {
    statusCode = 400;
    message = "File too large (max 5MB)";
  }
  if (err.code === 11000) {
    statusCode = 409;
    message = "Duplicate value";
  }
  if (err.type === "entity.too.large") {
    statusCode = 413;
    message = "Request body too large";
  }

  if (statusCode === 500) {
    console.error("[500]", err);
  }

  res.status(statusCode).json({
    success: false,
    message,
    errorCode,
  });
}

module.exports = { errorHandler, ERROR_CODES };
