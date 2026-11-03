import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { LecturerRepository, lecturerRepository } from "../repositories/lecturer.repository.js";
import { LoginDto } from "../dto/auth.dto.js";

const JWT_SECRET = process.env.JWT_SECRET || "gradia_super_secret_jwt_key_2024";

export class AuthHandler {
  constructor(private lecturerRepo: LecturerRepository = lecturerRepository) {}

  register = (_req: Request, res: Response): void => {
    res.status(403).json({
      error: "Pendaftaran mandiri dinonaktifkan. Akun dosen resmi hanya dapat diterbitkan langsung oleh Administrator Akademik Kampus.",
    });
  };

  login = (req: Request, res: Response): void => {
    const { identifier, password } = req.body as LoginDto;

    const lecturer = this.lecturerRepo.findByNidnOrEmail(identifier);
    if (!lecturer) {
      res.status(401).json({ error: "Akun dosen tidak ditemukan. Periksa NIDN atau Email Anda." });
      return;
    }

    if (lecturer.status === "inactive") {
      res.status(403).json({
        error: "Akun dosen Anda sedang dinonaktifkan oleh Administrator. Hubungi Bagian Akademik.",
      });
      return;
    }

    const isPasswordValid = bcrypt.compareSync(password, lecturer.password_hash);
    if (!isPasswordValid) {
      res.status(401).json({ error: "Kata sandi yang Anda masukkan salah." });
      return;
    }

    const token = jwt.sign(
      { id: lecturer.id, nidn: lecturer.nidn, email: lecturer.email },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
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
        consultHours: lecturer.consult_hours,
      },
    });
  };
}

export const authHandler = new AuthHandler();

