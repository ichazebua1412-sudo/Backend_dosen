import { Router, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { realtimeService } from "../services/realtime.service.js";

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || "gradia_super_secret_jwt_key_2024";

// GET /api/realtime/stream - Koneksi SSE real-time untuk mobile & web
router.get("/stream", (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  const queryToken = typeof req.query.token === "string" ? req.query.token : "";
  const token =
    authHeader && authHeader.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : queryToken;

  if (!token) {
    res.status(401).json({ error: "Token autentikasi wajib disertakan." });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: number; role?: string };
    realtimeService.addClient(req, res, decoded);
  } catch {
    res.status(401).json({ error: "Token tidak valid atau telah kedaluwarsa." });
  }
});

export default router;
