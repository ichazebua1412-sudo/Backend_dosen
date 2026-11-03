import { Router } from "express";
import { lecturerHandler } from "../handlers/lecturer.handler.js";
import { authGuard } from "../middleware/auth.js";
import { validateBody } from "../middleware/validate.js";
import { updateLecturerProfileDto, updateLecturerPasswordDto } from "../dto/lecturer.dto.js";

const router = Router();

// Get profile
router.get("/profile", authGuard, lecturerHandler.getProfile);

// Update profile
router.put("/profile", authGuard, validateBody(updateLecturerProfileDto), lecturerHandler.updateProfile);

// Update password
router.put("/password", authGuard, validateBody(updateLecturerPasswordDto), lecturerHandler.updatePassword);

export default router;
