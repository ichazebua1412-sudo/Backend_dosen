import { Router, Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { db } from "../db.js";

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || "gradia_super_secret_jwt_key_2024";

// POST /register - Buat akun dosen baru (riil)
router.post("/register", (req: Request, res: Response) => {
  const { nidn, email, password, name, titlePrefix, titleSuffix } = req.body;

  // Early-exit guard
  if (!nidn || !email || !password || !name) {
    return res.status(400).json({ error: "NIDN, Email, Nama Lengkap, dan Kata Sandi wajib diisi." });
  }

  // Cek duplikasi NIDN / Email
  const exists = db.prepare("SELECT id FROM lecturers WHERE nidn = ? OR email = ?").get(nidn.trim(), email.trim());
  if (exists) {
    return res.status(400).json({ error: "NIDN atau Email sudah terdaftar. Silakan login." });
  }

  const hashedPassword = bcrypt.hashSync(password, 10);
  const insertStmt = db.prepare(`
    INSERT INTO lecturers (nidn, email, password_hash, name, title_prefix, title_suffix)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  const result = insertStmt.run(
    nidn.trim(),
    email.trim(),
    hashedPassword,
    name.trim(),
    titlePrefix?.trim() || "",
    titleSuffix?.trim() || ""
  );

  const lecturerId = Number(result.lastInsertRowid);
  const token = jwt.sign({ id: lecturerId, nidn: nidn.trim(), email: email.trim() }, JWT_SECRET, { expiresIn: "7d" });

  return res.status(201).json({
    message: "Registrasi akun dosen berhasil.",
    token,
    lecturer: {
      id: lecturerId,
      nidn: nidn.trim(),
      email: email.trim(),
      name: name.trim(),
      titlePrefix: titlePrefix?.trim() || "",
      titleSuffix: titleSuffix?.trim() || "",
      fullName: `${titlePrefix?.trim() ? titlePrefix.trim() + " " : ""}${name.trim()}${titleSuffix?.trim() ? ", " + titleSuffix.trim() : ""}`.trim(),
      phone: "",
      officeRoom: "",
      consultHours: ""
    }
  });
});

// POST /login - Masuk dengan NIDN atau Email
router.post("/login", (req: Request, res: Response) => {
  const { identifier, password } = req.body;

  // Early-exit guard (Ponytail style)
  if (!identifier || !password) {
    return res.status(400).json({ error: "NIDN/Email dan kata sandi wajib diisi." });
  }

  // Prepared statement - no SELECT *
  const stmt = db.prepare(`
    SELECT id, nidn, email, password_hash, name, title_prefix, title_suffix, phone, office_room, consult_hours
    FROM lecturers
    WHERE nidn = ? OR email = ?
  `);
  const lecturer = stmt.get(identifier.trim(), identifier.trim()) as any;

  if (!lecturer) {
    return res.status(401).json({ error: "Akun dosen tidak ditemukan. Periksa NIDN atau Email Anda." });
  }

  const isPasswordValid = bcrypt.compareSync(password, lecturer.password_hash);
  if (!isPasswordValid) {
    return res.status(401).json({ error: "Kata sandi yang Anda masukkan salah." });
  }

  const token = jwt.sign(
    { id: lecturer.id, nidn: lecturer.nidn, email: lecturer.email },
    JWT_SECRET,
    { expiresIn: "7d" }
  );

  return res.json({
    message: "Login berhasil.",
    token,
    lecturer: {
      id: lecturer.id,
      nidn: lecturer.nidn,
      email: lecturer.email,
      name: lecturer.name,
      titlePrefix: lecturer.title_prefix,
      titleSuffix: lecturer.title_suffix,
      fullName: `${lecturer.title_prefix ? lecturer.title_prefix + " " : ""}${lecturer.name}${lecturer.title_suffix ? ", " + lecturer.title_suffix : ""}`.trim(),
      phone: lecturer.phone,
      officeRoom: lecturer.office_room,
      consultHours: lecturer.consult_hours
    }
  });
});

export default router;
