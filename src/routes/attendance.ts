import { Router } from "express";
import { attendanceHandler } from "../handlers/attendance.handler.js";
import { authGuard } from "../middleware/auth.js";
import { validateBody } from "../middleware/validate.js";
import { correctAttendanceDto, toggleSessionDto } from "../dto/attendance.dto.js";

const router = Router();

// GET /api/attendances/schedule - Jadwal mengajar hari ini beserta status sesi presensi
router.get("/schedule", authGuard, attendanceHandler.getSchedule);

// POST /api/attendances/sessions - Buka atau tutup sesi presensi mobile
router.post("/sessions", authGuard, validateBody(toggleSessionDto), attendanceHandler.toggleSession);

// GET /api/attendances/class/:classId - Detail daftar kehadiran mahasiswa per pertemuan
router.get("/class/:classId", authGuard, attendanceHandler.getClassAttendance);

// PATCH /api/attendances/class/:classId/student/:studentId - Koreksi status kehadiran & audit log dosen
router.patch(
  "/class/:classId/student/:studentId",
  authGuard,
  validateBody(correctAttendanceDto),
  attendanceHandler.correctStudentAttendance
);

export default router;

