import { Router } from "express";
import { aiHandler } from "../handlers/ai.handler.js";
import { anyAuth } from "../middleware/auth.js";
import { validateBody } from "../middleware/validate.js";
import { aiFeedbackDto } from "../dto/ai.dto.js";

const router = Router();

// POST /feedback - Evaluasi AI berbasis OBE atau telaah kelas (dosen maupun mahasiswa)
router.post("/feedback", anyAuth, validateBody(aiFeedbackDto), aiHandler.generateFeedback);

export default router;
