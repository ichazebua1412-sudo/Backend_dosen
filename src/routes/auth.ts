import { Router } from "express";
import { authHandler } from "../handlers/auth.handler.js";
import { adminHandler } from "../handlers/admin.handler.js";
import { validateBody } from "../middleware/validate.js";
import { loginDto } from "../dto/auth.dto.js";
import { adminLoginDto } from "../dto/admin.dto.js";
import { authLimiter } from "../middleware/rateLimiter.js";

const router = Router();

// POST /register - Registrasi mandiri dinonaktifkan
router.post("/register", authHandler.register);

// POST /login - Masuk dengan NIDN atau Email Dosen (dilindungi rate limiter ketat & validasi Zod DTO)
router.post("/login", authLimiter, validateBody(loginDto), authHandler.login);

// POST /admin-login - Masuk Administrator (alias terpadu)
router.post("/admin-login", authLimiter, validateBody(adminLoginDto), adminHandler.login);

export default router;
