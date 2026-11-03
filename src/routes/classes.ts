import { Router } from "express";
import { classHandler } from "../handlers/class.handler.js";
import { authGuard } from "../middleware/auth.js";
import { validateBody } from "../middleware/validate.js";
import { createClassDto, updateClassDto, enrollStudentDto } from "../dto/class.dto.js";

const router = Router();

// List all classes for current lecturer
router.get("/", authGuard, classHandler.getClasses);

// Create new class
router.post("/", authGuard, validateBody(createClassDto), classHandler.createClass);

// Get class detail with enrolled students and grades
router.get("/:id", authGuard, classHandler.getClassDetail);

// Enroll a student to class
router.post("/:id/students", authGuard, validateBody(enrollStudentDto), classHandler.enrollStudent);

// Update class details
router.put("/:id", authGuard, validateBody(updateClassDto), classHandler.updateClass);

// Delete class
router.delete("/:id", authGuard, classHandler.deleteClass);

// Unenroll student from class
router.delete("/:classId/students/:studentId", authGuard, classHandler.unenrollStudent);

export default router;
