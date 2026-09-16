import rateLimit from "express-rate-limit"
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 10,
  message: {
    msg: "Too many login attempts. Please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,   
});
export const registrationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 5,
  message: {
    msg: "Too many registration attempts. Please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,   
});