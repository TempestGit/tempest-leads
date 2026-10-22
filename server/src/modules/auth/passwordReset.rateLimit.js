
import ApiError from "../../utils/ApiError.js";

const attempts = new Map();

export const passwordResetRateLimit = (req, res, next) => {
  const now = Date.now();
  const windowMs = 15 * 60 * 1000;
  const maxAttempts = 5;

  const key = String(req.ip || "unknown");

  // Remove expired entries to bound memory usage.
  for (const [ip, entry] of attempts.entries()) {
    if (entry.expiresAt <= now) {
      attempts.delete(ip);
    }
  }

  const entry = attempts.get(key);

  if (!entry) {
    attempts.set(key, {
      count: 1,
      expiresAt: now + windowMs,
    });

    return next();
  }

  if (entry.count >= maxAttempts) {
    return next(
      new ApiError(
        429,
        "Too many password reset requests. Please try again in 15 minutes.",
        [],
        "PASSWORD_RESET_RATE_LIMIT"
      )
    );
  }

  entry.count += 1;
  next();
};
