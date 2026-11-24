import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { LecturerRepository, lecturerRepository } from "../repositories/lecturer.repository.js";
import { AdminRepository, adminRepository } from "../repositories/admin.repository.js";
import { LoginDto, ForgotPasswordDto, ResetPasswordWithTokenDto } from "../dto/auth.dto.js";
import {
  passwordResetService,
  PasswordResetError,
} from "../services/passwordReset.service.js";

const JWT_SECRET = process.env.JWT_SECRET || "gradia_super_secret_jwt_key_2024";

export class AuthHandler {
  constructor(
    private lecturerRepo: LecturerRepository = lecturerRepository,
    private adminRepo: AdminRepository = adminRepository
  ) {}

  register = (_req: Request, res: Response): void => {
    res.status(403).json({
      error: "Pendaftaran mandiri dinonaktifkan. Akun resmi hanya dapat diterbitkan langsung oleh Administrator Akademik Kampus.",
    });
  };

  /**
   * Pengecekan User Terpadu Lewat Backend:
   * Otomatis memvalidasi apakah kredensial merupakan Administrator atau Dosen.
   */
  login = (req: Request, res: Response): void => {
    const { identifier, password } = req.body as LoginDto;

    // 1. Cek apakah kredensial cocok dengan Administrator
    const admin = this.adminRepo.findByUsernameOrEmail(identifier);
    if (admin) {
      const isPasswordValid = bcrypt.compareSync(password, admin.password_hash);
      if (isPasswordValid) {
        const role = admin.role || "admin";
        const token = jwt.sign(
          { id: admin.id, username: admin.username, email: admin.email, role },
          JWT_SECRET,
          { expiresIn: "7d" }
        );

        res.json({
          message: "Login administrator berhasil.",
          token,
          role,
          user: {
            id: admin.id,
            username: admin.username,
            email: admin.email,
            name: admin.name,
            role,
          },
          admin: {
            id: admin.id,
            username: admin.username,
            email: admin.email,
            name: admin.name,
            role,
          },
        });
        return;
      }
    }

    // 2. Cek apakah kredensial cocok dengan Dosen
    const lecturer = this.lecturerRepo.findByNidnOrEmail(identifier);
    if (lecturer) {
      if (lecturer.status === "inactive") {
        res.status(403).json({
          error: "Akun dosen Anda sedang dinonaktifkan oleh Administrator. Hubungi Bagian Akademik.",
        });
        return;
      }

      const isPasswordValid = bcrypt.compareSync(password, lecturer.password_hash);
      if (isPasswordValid) {
        const token = jwt.sign(
          { id: lecturer.id, nidn: lecturer.nidn, email: lecturer.email, role: "dosen" },
          JWT_SECRET,
          { expiresIn: "7d" }
        );

        res.json({
          message: "Login dosen berhasil.",
          token,
          role: "dosen",
          user: {
            id: lecturer.id,
            nidn: lecturer.nidn,
            email: lecturer.email,
            name: lecturer.name,
            role: "dosen",
          },
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
        return;
      }

      // Password salah untuk akun dosen yang ditemukan
      res.status(401).json({ error: "Kata sandi yang Anda masukkan salah." });
      return;
    }

    // Jika admin ditemukan tetapi passwordnya salah
    if (admin) {
      res.status(401).json({ error: "Kata sandi yang Anda masukkan salah." });
      return;
    }

    // Jika akun tidak ditemukan di kedua role (admin maupun dosen)
    res.status(401).json({
      error: "Akun tidak ditemukan. Periksa NIDN, Email resmi, atau Username Anda.",
    });
  };

  forgotPassword = async (req: Request, res: Response): Promise<void> => {
    const { identifier } = req.body as ForgotPasswordDto;
    const lecturer = this.lecturerRepo.findByNidnOrEmail(identifier);

    if (!lecturer) {
      res.status(404).json({
        error: "Akun dosen dengan NIDN atau email kampus tersebut tidak ditemukan.",
      });
      return;
    }

    try {
      const result = await passwordResetService.requestLecturerReset({
        lecturer,
        requestedBy: "self",
      });
      res.json({
        message: `Tautan reset kata sandi telah dikirim ke email kampus terdaftar (${result.email}).`,
        email: result.email,
      });
    } catch (err: any) {
      if (err instanceof PasswordResetError) {
        res.status(err.statusCode).json({ error: err.message });
        return;
      }
      res.status(500).json({
        error: "Gagal memproses permintaan reset kata sandi.",
      });
    }
  };

  verifyResetToken = (req: Request, res: Response): void => {
    const token = String(req.query.token || "");
    if (!passwordResetService.verifyToken(token)) {
      res.status(400).json({
        valid: false,
        error: "Tautan reset kata sandi tidak valid atau sudah kedaluwarsa.",
      });
      return;
    }
    res.json({ valid: true });
  };

  resetPasswordWithToken = (req: Request, res: Response): void => {
    const { token, newPassword } = req.body as ResetPasswordWithTokenDto;
    try {
      passwordResetService.completeReset(token, newPassword);
      res.json({
        message: "Kata sandi berhasil diperbarui. Silakan login dengan kata sandi baru Anda.",
      });
    } catch (err: any) {
      if (err instanceof PasswordResetError) {
        res.status(err.statusCode).json({ error: err.message });
        return;
      }
      res.status(500).json({
        error: "Gagal menyimpan kata sandi baru.",
      });
    }
  };
}

export const authHandler = new AuthHandler();

