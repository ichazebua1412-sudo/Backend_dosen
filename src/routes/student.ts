import { Router } from "express";
import { studentHandler } from "../handlers/student.handler.js";
import { aiHandler } from "../handlers/ai.handler.js";
import { studentGuard } from "../middleware/auth.js";
import { validateBody } from "../middleware/validate.js";
import { authLimiter } from "../middleware/rateLimiter.js";
import { aiFeedbackDto } from "../dto/ai.dto.js";
import {
  studentLoginDto,
  checkInAttendanceDto,
  applyLeaveDto,
  submitAssignmentDto,
  createGradeReviewDto,
} from "../dto/student.dto.js";

const router = Router();

// -------------------------------------------------------------
// 1. AUTENTIKASI & AKADEMIK UTAMA
// -------------------------------------------------------------

// POST /login - Masuk sebagai mahasiswa (dengan rate limit & Zod DTO validation)
router.post("/login", authLimiter, validateBody(studentLoginDto), studentHandler.login);

// GET /profile - Data profil mahasiswa yang sedang aktif
router.get("/profile", studentGuard, studentHandler.getProfile);

// GET /dashboard - Ringkasan akademik (IPK, SKS, absensi, status tugas, kelas aktif)
router.get("/dashboard", studentGuard, studentHandler.getDashboard);

// GET /grades - Nilai akademik seluruh mata kuliah
router.get("/grades", studentGuard, studentHandler.getGrades);

// GET /ai-feedback - Ulasan evaluasi capaian OBE berbasis AI
router.get("/ai-feedback", studentGuard, studentHandler.getAiFeedback);

// POST /ai-feedback - Generate umpan balik evaluasi OBE dengan AI
router.post("/ai-feedback", studentGuard, validateBody(aiFeedbackDto), aiHandler.generateFeedback);

// -------------------------------------------------------------
// 2. FITUR MOBILE: PRESENSI & KEHADIRAN (ATTENDANCES)
// -------------------------------------------------------------

// GET /attendances - Rekap kehadiran per mata kuliah & keseluruhan
router.get("/attendances", studentGuard, studentHandler.getAttendances);

// POST /attendances/check-in - Presensi hadir langsung (Luring / Daring)
router.post("/attendances/check-in", studentGuard, validateBody(checkInAttendanceDto), studentHandler.checkIn);

// POST /attendances/leave - Pengajuan izin atau sakit dengan lampiran
router.post("/attendances/leave", studentGuard, validateBody(applyLeaveDto), studentHandler.applyLeave);

// -------------------------------------------------------------
// 3. FITUR MOBILE: TUGAS KULIAH & DEADLINE (ASSIGNMENTS)
// -------------------------------------------------------------

// GET /assignments - Daftar tugas mahasiswa (filter: To-Do, Terkumpul, Terlewat)
router.get("/assignments", studentGuard, studentHandler.getAssignments);

// POST /assignments/:id/submit - Pengumpulan tugas mahasiswa
router.post("/assignments/:id/submit", studentGuard, validateBody(submitAssignmentDto), studentHandler.submitAssignment);

// -------------------------------------------------------------
// 4. FITUR MOBILE: NOTIFIKASI MAHASISWA (NOTIFICATIONS)
// -------------------------------------------------------------

// GET /notifications - Daftar notifikasi (kategori: all, nilai, pengumuman, reminder, sistem)
router.get("/notifications", studentGuard, studentHandler.getNotifications);

// PUT /notifications/read-all - Tandai semua notifikasi telah dibaca
router.put("/notifications/read-all", studentGuard, studentHandler.markAllNotificationsRead);

// PUT /notifications/:id/read - Tandai satu notifikasi telah dibaca
router.put("/notifications/:id/read", studentGuard, studentHandler.markNotificationRead);

// -------------------------------------------------------------
// 5. FITUR MOBILE: REVIEW / SANGGAHAN NILAI (GRADE REVIEWS)
// -------------------------------------------------------------

// GET /grade-reviews - Riwayat pengajuan koreksi/sanggahan nilai
router.get("/grade-reviews", studentGuard, studentHandler.getGradeReviews);

// POST /grade-reviews - Kirim pengajuan koreksi nilai ke dosen pengampu
router.post("/grade-reviews", studentGuard, validateBody(createGradeReviewDto), studentHandler.createGradeReview);

// Alias routes untuk kompatibilitas
router.post("/grade-appeal", studentHandler.createGradeAppeal);
router.get("/grade-appeals", studentHandler.getGradeAppeals);

export default router;


