import { Router } from "express";
import { gradeHandler } from "../handlers/grade.handler.js";
import { authGuard } from "../middleware/auth.js";
import { validateBody } from "../middleware/validate.js";
import { batchUpdateGradesDto, importGradesDto } from "../dto/grade.dto.js";

const router = Router();

// Sanggahan / Koreksi Nilai Mahasiswa (Grade Appeals)
router.get("/:classId/appeals", authGuard, gradeHandler.getAppeals);
router.patch("/appeals/:appealId", authGuard, gradeHandler.updateAppeal);
router.put("/appeals/:appealId", authGuard, gradeHandler.updateAppeal);

// Get grades for class
router.get("/:classId", authGuard, gradeHandler.getGrades);

// Update / save grades batch
router.put("/:classId", authGuard, validateBody(batchUpdateGradesDto), gradeHandler.updateGrades);

// Bulk import grades (from preview / Excel payload)
router.post("/:classId/import", authGuard, validateBody(importGradesDto), gradeHandler.importGrades);

// Get appeals for a class
router.get("/:classId/appeals", authGuard, gradeHandler.getAppeals);

// Update appeal status
router.patch("/appeals/:appealId", authGuard, gradeHandler.updateAppeal);

export default router;
