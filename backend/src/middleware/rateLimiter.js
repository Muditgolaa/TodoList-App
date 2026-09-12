import rateLimit from "express-rate-limit";

// Caps AI calls so one user can't drain Groq free tier.
export const aiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20,                  // 20 AI calls per hour per IP
  message: { error: "Too many AI requests — please try again later." },
});