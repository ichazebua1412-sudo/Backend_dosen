import { Router } from "express";
import { gradeHandler } from "../handlers/grade.handler.js";
import { authGuard } from "../middleware/auth.js";
import { validateBody } from "../middleware/validate.js";
import { batchUpdateGradesDto, importGradesDto } from "../dto/grade.dto.js";

const router = Router();

// Get grades for class
router.get("/:classId", authGuard, gradeHandler.getGrades);

// Update / save grades batch
router.put("/:classId", authGuard, validateBody(batchUpdateGradesDto), gradeHandler.updateGrades);

// Bulk import grades (from preview / Excel payload)
router.post("/:classId/import", authGuard, validateBody(importGradesDto), gradeHandler.importGrades);

export default router;
