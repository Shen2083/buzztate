import rateLimit from "express-rate-limit";

/**
 * General rate limiter for most API endpoints.
 * 100 requests per 15 minutes per IP.
 */
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: {
    error: "Too many requests. Please try again later.",
    retryAfter: "15 minutes"
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Stricter rate limiter for translation endpoints (expensive AI calls).
 * 10 requests per minute per IP.
 */
export const translationLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10,
  message: {
    error: "Translation rate limit exceeded. Please wait a moment.",
    retryAfter: "1 minute"
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Payment rate limiter to prevent abuse.
 * 5 requests per minute per IP.
 */
export const paymentLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5,
  message: {
    error: "Too many payment requests. Please wait a moment.",
    retryAfter: "1 minute"
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Auth rate limiter to prevent brute force attacks.
 * 5 requests per minute per IP.
 */
export const authLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5,
  message: {
    error: "Too many authentication attempts. Please wait a moment.",
    retryAfter: "1 minute"
  },
  standardHeaders: true,
  legacyHeaders: false,
});
