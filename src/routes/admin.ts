import { Router } from "express";
import { adminHandler } from "../handlers/admin.handler.js";
import { adminGuard } from "../middleware/auth.js";
import { validateBody } from "../middleware/validate.js";
import { authLimiter } from "../middleware/rateLimiter.js";
import {
  adminLoginDto,
  createLecturerDto,
  updateLecturerDto,
  createStudentDto,
  updateStudentDto,
} from "../dto/admin.dto.js";

const router = Router();

// ==========================================
// 1. ADMIN AUTHENTICATION
// ==========================================
router.post("/login", authLimiter, validateBody(adminLoginDto), adminHandler.login);
router.get("/profile", adminGuard, adminHandler.getProfile);

// ==========================================
// 2. DASHBOARD STATS
// ==========================================
router.get("/dashboard", adminGuard, adminHandler.getDashboard);
router.get("/stats", adminGuard, adminHandler.getDashboard);

// ==========================================
// 3. LECTURER MANAGEMENT
// ==========================================
router.get("/lecturers", adminGuard, adminHandler.getLecturers);
router.post("/lecturers", adminGuard, validateBody(createLecturerDto), adminHandler.createLecturer);
router.put("/lecturers/:id", adminGuard, validateBody(updateLecturerDto), adminHandler.updateLecturer);
router.post("/lecturers/:id/reset-password", adminGuard, adminHandler.resetLecturerPassword);
router.put("/lecturers/:id/reset-password", adminGuard, adminHandler.resetLecturerPassword);
router.delete("/lecturers/:id", adminGuard, adminHandler.deleteLecturer);

// ==========================================
// 4. STUDENT MANAGEMENT
// ==========================================
router.get("/students", adminGuard, adminHandler.getStudents);
router.post("/students", adminGuard, validateBody(createStudentDto), adminHandler.createStudent);
router.put("/students/:id", adminGuard, validateBody(updateStudentDto), adminHandler.updateStudent);
router.put("/students/:id/reset-password", adminGuard, adminHandler.resetStudentPassword);
router.delete("/students/:id", adminGuard, adminHandler.deleteStudent);

// ==========================================
// 5. CLASS MANAGEMENT & MONITORING
// ==========================================
router.get("/classes", adminGuard, adminHandler.getClasses);
router.post("/classes", adminGuard, adminHandler.createClass);
router.put("/classes/:id", adminGuard, adminHandler.updateClass);
router.delete("/classes/:id", adminGuard, adminHandler.deleteClass);
router.get("/classes/:id/students", adminGuard, adminHandler.getClassStudents);
router.post("/classes/:id/students", adminGuard, adminHandler.enrollStudentToClass);
router.post("/classes/:id/fill-minimum", adminGuard, adminHandler.fillClassMinimumStudents);
router.delete("/classes/:classId/students/:studentId", adminGuard, adminHandler.unenrollStudentFromClass);

export default router;
