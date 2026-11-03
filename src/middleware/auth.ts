import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "gradia_super_secret_jwt_key_2024";

export interface AuthRequest extends Request {
  user?: {
    id: number;
    nidn?: string;
    email: string;
    role?: string;
    username?: string;
  };
}

export function authGuard(req: AuthRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ error: "Akses ditolak. Token tidak disediakan." });
    return;
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: "Sesi telah berakhir atau token tidak valid." });
  }
}

export function adminGuard(req: AuthRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ error: "Akses ditolak. Silakan login sebagai administrator." });
    return;
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    if (decoded.role !== "superadmin" && decoded.role !== "admin") {
      res.status(403).json({ error: "Akses terlarang. Hanya administrator yang berhak mengakses fitur ini." });
      return;
    }
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: "Sesi admin telah berakhir atau token tidak valid." });
  }
}

