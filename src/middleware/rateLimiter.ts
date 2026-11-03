import rateLimit from "express-rate-limit";

/**
 * Global rate limiter: 300 requests per 15 minutes per IP.
 * Melindungi backend dari flooding dan spam berlebih.
 */
export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 menit
  max: 300,
  standardHeaders: true, // Kembalikan info rate limit di headers `RateLimit-*`
  legacyHeaders: false, // Nonaktifkan headers `X-RateLimit-*`
  message: {
    error: "Terlalu banyak permintaan dari IP ini. Silakan coba kembali dalam 15 menit.",
  },
});

/**
 * Strict Auth rate limiter: 15 requests per 15 minutes per IP.
 * Melindungi endpoint sensitif (login dosen & admin) dari serangan brute force.
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 menit
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "Terlalu banyak percobaan autentikasi dari IP ini. Coba lagi dalam 15 menit.",
  },
});

