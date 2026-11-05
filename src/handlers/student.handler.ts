import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { StudentRepository, studentRepository } from "../repositories/student.repository.js";
import { AuthRequest } from "../middleware/auth.js";
import { StudentLoginDto } from "../dto/student.dto.js";

const JWT_SECRET = process.env.JWT_SECRET || "gradia_super_secret_jwt_key_2024";

export class StudentHandler {
  constructor(private studentRepo: StudentRepository = studentRepository) {}

  login = (req: Request, res: Response): void => {
    const { identifier, password } = req.body as StudentLoginDto;

    const student = this.studentRepo.findByNimOrEmail(identifier);
    if (!student) {
      res.status(401).json({ error: "Akun mahasiswa tidak ditemukan. Periksa NIM atau Email Anda." });
      return;
    }

    if (student.status && student.status.toLowerCase() === "nonaktif") {
      res.status(403).json({ error: "Akun mahasiswa Anda sedang nonaktif. Hubungi Bagian Akademik." });
      return;
    }

    // Periksa password bcrypt, dengan fallback ke password default 'password123' jika hash belum terisi
    let isPasswordValid = false;
    if (student.password_hash && student.password_hash.startsWith("$2")) {
      isPasswordValid = bcrypt.compareSync(password, student.password_hash);
    } else {
      isPasswordValid = password === "password123";
    }

    if (!isPasswordValid) {
      res.status(401).json({ error: "Kata sandi yang Anda masukkan salah." });
      return;
    }

    const token = jwt.sign(
      { id: student.id, nim: student.nim, email: student.email, role: "student" },
      JWT_SECRET,
      { expiresIn: "14d" }
    );

    res.json({
      message: "Login berhasil.",
      token,
      student: {
        id: student.id,
        nim: student.nim,
        name: student.name,
        email: student.email,
        prodi: student.prodi,
        status: student.status,
      },
    });
  };

  getProfile = (req: AuthRequest, res: Response): void => {
    const studentId = req.user!.id;
    const student = this.studentRepo.findById(studentId);
    if (!student) {
      res.status(404).json({ error: "Mahasiswa tidak ditemukan." });
      return;
    }

    res.json({ student });
  };

  getDashboard = (req: AuthRequest, res: Response): void => {
    const studentId = req.user!.id;
    const student = this.studentRepo.findById(studentId);
    if (!student) {
      res.status(404).json({ error: "Mahasiswa tidak ditemukan." });
      return;
    }

    const stats = this.studentRepo.getStudentDashboardStats(studentId);
    const courses = this.studentRepo.getStudentCoursesWithGrades(studentId);

    res.json({
      student: {
        id: student.id,
        nim: student.nim,
        name: student.name,
        email: student.email,
        prodi: student.prodi,
      },
      stats,
      courses,
    });
  };

  getGrades = (req: AuthRequest, res: Response): void => {
    const studentId = req.user!.id;
    const courses = this.studentRepo.getStudentCoursesWithGrades(studentId);
    res.json({ courses });
  };

  getAiFeedback = (req: AuthRequest, res: Response): void => {
    const studentId = req.user!.id;
    const feedbacks = this.studentRepo.getStudentAiFeedback(studentId);
    res.json({ feedbacks });
  };
}

export const studentHandler = new StudentHandler();

