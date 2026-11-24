import { Router } from "express";
import { authHandler } from "../handlers/auth.handler.js";
import { adminHandler } from "../handlers/admin.handler.js";
import { validateBody } from "../middleware/validate.js";
import { loginDto, forgotPasswordDto, resetPasswordWithTokenDto } from "../dto/auth.dto.js";
import { adminLoginDto } from "../dto/admin.dto.js";
import { authLimiter } from "../middleware/rateLimiter.js";

const router = Router();

// POST /register - Registrasi mandiri dinonaktifkan
router.post("/register", authHandler.register);

// POST /login - Masuk dengan NIDN atau Email Dosen (dilindungi rate limiter ketat & validasi Zod DTO)
router.post("/login", authLimiter, validateBody(loginDto), authHandler.login);

// POST /forgot-password - Kirim tautan reset kata sandi dosen (NIDN / Email)
router.post("/forgot-password", authLimiter, validateBody(forgotPasswordDto), authHandler.forgotPassword);

// GET /reset-password/verify - Verifikasi token tautan reset kata sandi
router.get("/reset-password/verify", authHandler.verifyResetToken);

// POST /reset-password - Simpan kata sandi baru menggunakan token sekali pakai
router.post("/reset-password", authLimiter, validateBody(resetPasswordWithTokenDto), authHandler.resetPasswordWithToken);

// POST /admin-login - Masuk Administrator (alias terpadu)
router.post("/admin-login", authLimiter, validateBody(adminLoginDto), adminHandler.login);

export default router;
