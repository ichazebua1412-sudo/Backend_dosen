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
    if (decoded.role !== "dosen") {
      res.status(403).json({ error: "Akses terlarang. Portal Dosen hanya dapat diakses oleh akun Dosen resmi." });
      return;
    }
    req.user = decoded;
    next();
  } catch (err: any) {
    if (err.name === "TokenExpiredError") {
      res.status(401).json({ error: "Sesi telah berakhir atau token sudah kedaluwarsa. Silakan login kembali." });
      return;
    }
    res.status(401).json({ error: "Sesi telah berakhir atau token tidak valid. Silakan login kembali." });
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

export function lecturerGuard(req: AuthRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ error: "Akses ditolak. Silakan login sebagai dosen." });
    return;
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    if (decoded.role !== "dosen") {
      res.status(403).json({ error: "Akses terlarang. Hanya dosen yang berhak mengakses fitur ini." });
      return;
    }
    req.user = decoded;
    next();
  } catch (err: any) {
    if (err.name === "TokenExpiredError") {
      res.status(401).json({ error: "Sesi dosen telah berakhir atau token sudah kedaluwarsa. Silakan login kembali." });
      return;
    }
    res.status(401).json({ error: "Sesi dosen telah berakhir atau token tidak valid. Silakan login kembali." });
  }
}

export const dosenGuard = lecturerGuard;

export function studentGuard(req: AuthRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ error: "Akses ditolak. Silakan login sebagai mahasiswa." });
    return;
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    if (decoded.role !== "student") {
      res.status(403).json({ error: "Akses terlarang. Hanya mahasiswa yang berhak mengakses fitur ini." });
      return;
    }
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: "Sesi mahasiswa telah berakhir atau token tidak valid." });
  }
}

/**
 * anyAuth - Izinkan akun yang memiliki token valid (dosen, admin, maupun mahasiswa).
 */
export function anyAuth(req: AuthRequest, res: Response, next: NextFunction): void {
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
  } catch (err: any) {
    if (err.name === "TokenExpiredError") {
      res.status(401).json({ error: "Sesi telah berakhir atau token sudah kedaluwarsa. Silakan login kembali." });
      return;
    }
    res.status(401).json({ error: "Sesi telah berakhir atau token tidak valid. Silakan login kembali." });
  }
}


