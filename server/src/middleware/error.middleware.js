import { env } from "../config/env.js";

const errorMiddleware = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal server error";
  let code = err.code || "INTERNAL_SERVER_ERROR";
  let errors = Array.isArray(err.errors) ? err.errors : [];

  if (err.code === "ER_DUP_ENTRY") {
    statusCode = 409;
    message = "A record with this value already exists.";
    code = "DUPLICATE_RECORD";
  }

  if (err.code === "ER_NO_REFERENCED_ROW_2") {
    statusCode = 400;
    message = "A referenced record does not exist.";
    code = "INVALID_REFERENCE";
  }

  if (err.code === "ER_ROW_IS_REFERENCED_2") {
    statusCode = 409;
    message = "This record is being used by another record.";
    code = "RECORD_IN_USE";
  }

  const response = {
    success: false,
    message,
    code,
    errors,
  };

  if (env.NODE_ENV !== "production") {
    response.stack = err.stack;
  }

  console.error("API request failed:", {
    method: req.method,
    url: req.originalUrl,
    statusCode,
    code,
    message,
  });

  res.status(statusCode).json(response);
};

export default errorMiddleware;