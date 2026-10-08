import { env } from "../config/env.js";

/*
|--------------------------------------------------------------------------
| Error Message Helpers
|--------------------------------------------------------------------------
*/

const GENERIC_VALIDATION_MESSAGES = new Set([
  "validation failed.",
  "validation error",
  "invalid input",
  "invalid request",
]);

const formatFieldName = (field) => {
  if (!field || typeof field !== "string") {
    return "";
  }

  const cleaned = field
    .replace(/^(body|params|query)\./, "")
    .replace(/\[(\d+)\]/g, ".$1")
    .split(".")
    .map((part) =>
      part.replace(/([a-z])([A-Z])/g, "$1 $2")
    )
    .join(" → ")
    .trim();

  if (!cleaned) {
    return "";
  }

  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
};

const getIssueMessage = (issue) => {
  if (typeof issue === "string") {
    return issue.trim();
  }

  if (!issue || typeof issue !== "object") {
    return "";
  }

  const message =
    typeof issue.message === "string"
      ? issue.message.trim()
      : "";

  const field = formatFieldName(
    issue.field ||
    (Array.isArray(issue.path)
      ? issue.path.join(".")
      : "")
  );

  if (!message) {
    return field
      ? `${field}: Invalid value.`
      : "";
  }

  if (!field) {
    return message;
  }

  const lowerMessage = message.toLowerCase();
  const lowerField = field.toLowerCase();

  if (
    lowerMessage.startsWith(lowerField) ||
    lowerMessage.includes(lowerField)
  ) {
    return message;
  }

  return `${field}: ${message}`;
};

const getValidationMessage = (errors) => {
  if (!Array.isArray(errors) || errors.length === 0) {
    return "";
  }

  const messages = [
    ...new Set(
      errors
        .map(getIssueMessage)
        .filter(Boolean)
    ),
  ];

  if (messages.length === 0) {
    return "";
  }

  return messages.join(" ");
};

/*
|--------------------------------------------------------------------------
| Error Middleware
|--------------------------------------------------------------------------
*/

const errorMiddleware = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;

  let message =
    err.message || "Internal server error";

  let code =
    err.code || "INTERNAL_SERVER_ERROR";

  const errors = Array.isArray(err.errors)
    ? err.errors
    : [];

  /*
  |--------------------------------------------------------------------------
  | Duplicate Record
  |--------------------------------------------------------------------------
  */

  if (err.code === "ER_DUP_ENTRY") {
    statusCode = 409;
    message =
      "A record with this value already exists.";
    code = "DUPLICATE_RECORD";
  }

  /*
  |--------------------------------------------------------------------------
  | Invalid Reference
  |--------------------------------------------------------------------------
  */

  if (err.code === "ER_NO_REFERENCED_ROW_2") {
    statusCode = 400;
    message =
      "A referenced record does not exist.";
    code = "INVALID_REFERENCE";
  }

  /*
  |--------------------------------------------------------------------------
  | Record In Use
  |--------------------------------------------------------------------------
  */

  if (err.code === "ER_ROW_IS_REFERENCED_2") {
    statusCode = 409;
    message =
      "This record is being used by another record.";
    code = "RECORD_IN_USE";
  }

  /*
  |--------------------------------------------------------------------------
  | Validation Errors
  |--------------------------------------------------------------------------
  |
  | The validation middleware already supplies:
  |
  | errors: [
  |   {
  |     field: "body.dueAt",
  |     message: "Reconnect date cannot be in the past.",
  |     code: "custom"
  |   }
  | ]
  |
  | Instead of returning only "Validation failed.",
  | build a useful message from the actual issues.
  |
  | Preserve the original errors array so existing
  | frontend forms can still use field-level details.
  |
  */

  if (
    code === "VALIDATION_ERROR" ||
    (
      statusCode === 422 &&
      GENERIC_VALIDATION_MESSAGES.has(
        String(message).trim().toLowerCase()
      )
    )
  ) {
    const detailedMessage =
      getValidationMessage(errors);

    if (detailedMessage) {
      message = detailedMessage;
    } else if (
      GENERIC_VALIDATION_MESSAGES.has(
        String(message).trim().toLowerCase()
      )
    ) {
      message =
        "Please check the information entered and try again.";
    }
  }

  /*
  |--------------------------------------------------------------------------
  | API Response
  |--------------------------------------------------------------------------
  */

  const response = {
    success: false,
    message,
    code,
    errors,
  };

  /*
  |--------------------------------------------------------------------------
  | Development Stack Trace
  |--------------------------------------------------------------------------
  */

  if (env.NODE_ENV !== "production") {
    response.stack = err.stack;
  }

  /*
  |--------------------------------------------------------------------------
  | Server Logging
  |--------------------------------------------------------------------------
  |
  | Keep useful diagnostics in server logs.
  |
  */

  console.error("API request failed:", {
    method: req.method,
    url: req.originalUrl,
    statusCode,
    code,
    message,
    ...(errors.length > 0 ? { errors } : {}),
  });

  res.status(statusCode).json(response);
};

export default errorMiddleware;