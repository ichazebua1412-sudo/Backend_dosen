import { Router } from "express";
import { dashboardHandler } from "../handlers/dashboard.handler.js";
import { authGuard } from "../middleware/auth.js";

const router = Router();

// GET / - Dashboard metrics & active courses
router.get("/", authGuard, dashboardHandler.getSummary);

export default router;
