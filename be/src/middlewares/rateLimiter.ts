import rateLimit from "express-rate-limit";

export const createUrlLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10,
  message: {
    status: 429,
    error: "Too many create attempts from this IP. Try again later.",
  },
});

export const redirectLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: { status: 429, error: "Too many redirects. Please slow down." },
});

export const seederLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 1,
  message: {
    status: 429,
    error: "Fake URL seeding is limited to 1 request per minute.",
  },
});
