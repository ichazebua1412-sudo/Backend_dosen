import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { AdminRepository, adminRepository } from "../repositories/admin.repository.js";
import { LecturerRepository, lecturerRepository } from "../repositories/lecturer.repository.js";
import { StudentRepository, studentRepository } from "../repositories/student.repository.js";
import { ClassRepository, classRepository } from "../repositories/class.repository.js";
import { AuthRequest } from "../middleware/auth.js";
import {
  AdminLoginDto,
  CreateLecturerDto,
  UpdateLecturerDto,
  CreateStudentDto,
  UpdateStudentDto,
} from "../dto/admin.dto.js";

const JWT_SECRET = process.env.JWT_SECRET || "gradia_super_secret_jwt_key_2024";

export class AdminHandler {
  constructor(
    private adminRepo: AdminRepository = adminRepository,
    private lecturerRepo: LecturerRepository = lecturerRepository,
    private studentRepo: StudentRepository = studentRepository,
    private classRepo: ClassRepository = classRepository
  ) {}

  login = (req: Request, res: Response): void => {
    const body = req.body as AdminLoginDto;
    const loginIdentifier = body.username || body.identifier;

    if (!loginIdentifier) {
      res.status(400).json({ error: "Username atau Email administrator wajib diisi." });
      return;
    }

    const admin = this.adminRepo.findByUsernameOrEmail(loginIdentifier);
    if (!admin) {
      res.status(401).json({ error: "Akun administrator tidak ditemukan." });
      return;
    }

    const isPasswordValid = bcrypt.compareSync(body.password, admin.password_hash);
    if (!isPasswordValid) {
      res.status(401).json({ error: "Kata sandi administrator salah." });
      return;
    }

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
  };

  getProfile = (req: AuthRequest, res: Response): void => {
    const adminId = req.user!.id;
    const admin = this.adminRepo.findById(adminId);
    if (!admin) {
      res.status(404).json({ error: "Administrator tidak ditemukan." });
      return;
    }
    res.json({ admin });
  };

  getDashboard = (_req: AuthRequest, res: Response): void => {
    const data = this.adminRepo.getDashboardStats();
    res.json(data);
  };

  getLecturers = (_req: AuthRequest, res: Response): void => {
    const lecturers = this.lecturerRepo.findAll();
    res.json({ lecturers });
  };

  createLecturer = (req: AuthRequest, res: Response): void => {
    const body = req.body as CreateLecturerDto;

    const dup = this.lecturerRepo.checkDuplicate(body.nidn, body.email);
    if (dup) {
      res.status(400).json({ error: "NIDN atau Email dosen sudah terdaftar pada sistem." });
      return;
    }

    const passwordHash = bcrypt.hashSync(body.password, 10);
    const lecturerId = this.lecturerRepo.create({
      nidn: body.nidn,
      email: body.email,
      passwordHash,
      name: body.name,
      titlePrefix: body.titlePrefix,
      titleSuffix: body.titleSuffix,
      phone: body.phone,
      officeRoom: body.officeRoom,
      consultHours: body.consultHours,
    });

    res.status(201).json({
      message: "Akun dosen berhasil dibuat.",
      lecturerId,
    });
  };

  updateLecturer = (req: AuthRequest, res: Response): void => {
    const lecturerId = Number(req.params.id);
    const current = this.lecturerRepo.findById(lecturerId);
    if (!current) {
      res.status(404).json({ error: "Dosen tidak ditemukan." });
      return;
    }

    const { nidn, email, resetPassword, status } = req.body;
    if (nidn || email) {
      const dup = this.lecturerRepo.checkDuplicate(
        nidn || current.nidn,
        email || current.email,
        lecturerId
      );
      if (dup) {
        res.status(400).json({ error: "NIDN atau Email sudah digunakan oleh dosen lain." });
        return;
      }
    }

    this.lecturerRepo.updateAdminFields(lecturerId, {
      nidn: req.body.nidn,
      email: req.body.email,
      name: req.body.name,
      titlePrefix: req.body.titlePrefix,
      titleSuffix: req.body.titleSuffix,
      phone: req.body.phone,
      officeRoom: req.body.officeRoom,
      consultHours: req.body.consultHours,
      status: req.body.status,
    });

    if (resetPassword && typeof resetPassword === "string" && resetPassword.length >= 6) {
      const newHash = bcrypt.hashSync(resetPassword, 10);
      this.lecturerRepo.updatePassword(lecturerId, newHash);
    }

    res.json({ message: "Data dosen berhasil diperbarui." });
  };

  deleteLecturer = (req: AuthRequest, res: Response): void => {
    const lecturerId = Number(req.params.id);
    const current = this.lecturerRepo.findById(lecturerId);
    if (!current) {
      res.status(404).json({ error: "Dosen tidak ditemukan." });
      return;
    }

    this.lecturerRepo.delete(lecturerId);
    res.json({ message: "Akun dosen berhasil dihapus beserta kelas terkait." });
  };

  getStudents = (req: AuthRequest, res: Response): void => {
    const { search, prodi } = req.query;
    const students = this.studentRepo.findAll(
      search ? String(search) : undefined,
      prodi ? String(prodi) : undefined
    );
    res.json({ students });
  };

  createStudent = (req: AuthRequest, res: Response): void => {
    const body = req.body as CreateStudentDto;
    const exists = this.studentRepo.findByNim(body.nim);
    if (exists) {
      res.status(400).json({ error: "NIM sudah terdaftar." });
      return;
    }

    const studentId = this.studentRepo.create(body);
    res.status(201).json({ message: "Mahasiswa berhasil ditambahkan.", studentId });
  };

  updateStudent = (req: AuthRequest, res: Response): void => {
    const studentId = Number(req.params.id);
    const current = this.studentRepo.findById(studentId);
    if (!current) {
      res.status(404).json({ error: "Mahasiswa tidak ditemukan." });
      return;
    }

    this.studentRepo.update(studentId, req.body as UpdateStudentDto);
    res.json({ message: "Data mahasiswa berhasil diperbarui." });
  };

  deleteStudent = (req: AuthRequest, res: Response): void => {
    const studentId = Number(req.params.id);
    const current = this.studentRepo.findById(studentId);
    if (!current) {
      res.status(404).json({ error: "Mahasiswa tidak ditemukan." });
      return;
    }

    this.studentRepo.delete(studentId);
    res.json({ message: "Mahasiswa berhasil dihapus." });
  };

  getClasses = (req: AuthRequest, res: Response): void => {
    const { search } = req.query;
    const classes = this.classRepo.findAllWithLecturer(search ? String(search) : undefined);
    res.json({ classes });
  };
}

export const adminHandler = new AdminHandler();

