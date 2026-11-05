import { Router } from "express";
import { studentHandler } from "../handlers/student.handler.js";
import { studentGuard } from "../middleware/auth.js";
import { validateBody } from "../middleware/validate.js";
import { authLimiter } from "../middleware/rateLimiter.js";
import { studentLoginDto } from "../dto/student.dto.js";

const router = Router();

// POST /login - Masuk sebagai mahasiswa (dengan rate limit & Zod DTO validation)
router.post("/login", authLimiter, validateBody(studentLoginDto), studentHandler.login);

// GET /profile - Data profil mahasiswa yang sedang aktif
router.get("/profile", studentGuard, studentHandler.getProfile);

// GET /dashboard - Ringkasan akademik (IPK, SKS, absensi, kelas aktif)
router.get("/dashboard", studentGuard, studentHandler.getDashboard);

// GET /grades - Nilai akademik seluruh mata kuliah
router.get("/grades", studentGuard, studentHandler.getGrades);

// GET /ai-feedback - Ulasan evaluasi capaian OBE berbasis AI
router.get("/ai-feedback", studentGuard, studentHandler.getAiFeedback);

export default router;

