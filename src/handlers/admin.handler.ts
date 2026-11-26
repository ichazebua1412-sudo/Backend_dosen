import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { AdminRepository, adminRepository } from "../repositories/admin.repository.js";
import { LecturerRepository, lecturerRepository } from "../repositories/lecturer.repository.js";
import { StudentRepository, studentRepository } from "../repositories/student.repository.js";
import { ClassRepository, classRepository } from "../repositories/class.repository.js";
import { GradeRepository, gradeRepository } from "../repositories/grade.repository.js";
import { AuthRequest } from "../middleware/auth.js";
import { passwordResetService, PasswordResetError } from "../services/passwordReset.service.js";
import { isSameProdi } from "../utils/prodi.js";
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
    private classRepo: ClassRepository = classRepository,
    private gradeRepo: GradeRepository = gradeRepository
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
      // Cek apakah akun ini terdaftar sebagai Dosen
      const lecturer = this.lecturerRepo.findByNidnOrEmail(loginIdentifier);
      if (lecturer) {
        res.status(403).json({
          error: "Akses ditolak. Akun Anda terdaftar sebagai Dosen. Hanya akun Administrator yang berhak login ke Dashboard Admin.",
        });
        return;
      }

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

  resetLecturerPassword = async (req: AuthRequest, res: Response): Promise<void> => {
    const lecturerId = Number(req.params.id);
    const lecturer = this.lecturerRepo.findById(lecturerId);
    if (!lecturer) {
      res.status(404).json({ error: "Dosen tidak ditemukan." });
      return;
    }

    try {
      const result = await passwordResetService.requestLecturerReset({
        lecturer,
        requestedBy: "admin",
        adminId: req.user?.id,
      });
      res.json({
        message: `Tautan reset kata sandi telah dikirim ke email kampus dosen (${result.email}).`,
      });
    } catch (err: any) {
      if (err instanceof PasswordResetError) {
        res.status(err.statusCode).json({ error: err.message });
        return;
      }
      res.status(500).json({
        error: "Gagal mengirim tautan reset kata sandi dosen.",
      });
    }
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

  resetStudentPassword = (req: AuthRequest, res: Response): void => {
    const studentId = Number(req.params.id);
    const current = this.studentRepo.findById(studentId);
    if (!current) {
      res.status(404).json({ error: "Mahasiswa tidak ditemukan." });
      return;
    }

    const { password } = req.body;
    if (!password || typeof password !== "string" || password.trim().length < 6) {
      res.status(400).json({ error: "Kata sandi baru minimal 6 karakter." });
      return;
    }

    const newHash = bcrypt.hashSync(password.trim(), 10);
    this.studentRepo.update(studentId, { passwordHash: newHash });

    res.json({ message: "Kata sandi mahasiswa berhasil direset." });
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
    const { search, lecturer_id } = req.query;
    const lecturerIdNum = lecturer_id ? Number(lecturer_id) : undefined;
    const classes = this.classRepo.findAllWithLecturer(
      search ? String(search) : undefined,
      isNaN(lecturerIdNum!) ? undefined : lecturerIdNum
    );
    res.json({ classes });
  };

  createClass = (req: AuthRequest, res: Response): void => {
    const { lecturer_id, code, title, sks, prodi, semester, academic_year, capacity, schedule, room } = req.body;
    if (!lecturer_id || !code || !title) {
      res.status(400).json({ error: "Kode kelas, nama mata kuliah, dan dosen pengampu wajib diisi." });
      return;
    }

    const lecturer = this.lecturerRepo.findById(Number(lecturer_id));
    if (!lecturer) {
      res.status(404).json({ error: "Dosen pengampu tidak ditemukan." });
      return;
    }

    const requestedCapacity = capacity ? Number(capacity) : 40;
    const effectiveCapacity = Math.max(requestedCapacity, 30);

    const classId = this.classRepo.create({
      lecturerId: Number(lecturer_id),
      code: String(code),
      title: String(title),
      sks: sks ? Number(sks) : 3,
      prodi: prodi ? String(prodi) : "Teknik Informatika",
      semester: semester ? Number(semester) : 1,
      academicYear: academic_year ? String(academic_year) : "2024/2025 Ganjil",
      capacity: effectiveCapacity,
      schedule: schedule ? String(schedule) : "",
      room: room ? String(room) : "",
    });

    const addedCount = this.fillMinimumStudentsForClass(classId, 30);

    res.status(201).json({
      message: `Kelas berhasil dibuat dan otomatis diisi ${addedCount} mahasiswa (minimal 30 mahasiswa).`,
      classId,
      addedCount,
    });
  };

  updateClass = (req: AuthRequest, res: Response): void => {
    const classId = Number(req.params.id);
    const existing = this.classRepo.findById(classId);
    if (!existing) {
      res.status(404).json({ error: "Kelas tidak ditemukan." });
      return;
    }

    const { lecturer_id, code, title, sks, prodi, semester, academic_year, capacity, schedule, room } = req.body;

    this.classRepo.adminUpdate(classId, {
      lecturerId: lecturer_id ? Number(lecturer_id) : undefined,
      code: code ? String(code) : undefined,
      title: title ? String(title) : undefined,
      sks: sks !== undefined ? Number(sks) : undefined,
      prodi: prodi ? String(prodi) : undefined,
      semester: semester !== undefined ? Number(semester) : undefined,
      academicYear: academic_year ? String(academic_year) : undefined,
      capacity: capacity !== undefined ? Number(capacity) : undefined,
      schedule: schedule !== undefined ? String(schedule) : undefined,
      room: room !== undefined ? String(room) : undefined,
    });

    res.json({ message: "Data kelas berhasil diperbarui." });
  };

  deleteClass = (req: AuthRequest, res: Response): void => {
    const classId = Number(req.params.id);
    const existing = this.classRepo.findById(classId);
    if (!existing) {
      res.status(404).json({ error: "Kelas tidak ditemukan." });
      return;
    }

    this.classRepo.adminDelete(classId);
    res.json({ message: "Kelas berhasil dihapus." });
  };

  getClassStudents = (req: AuthRequest, res: Response): void => {
    const classId = Number(req.params.id);
    const existing = this.classRepo.findById(classId);
    if (!existing) {
      res.status(404).json({ error: "Kelas tidak ditemukan." });
      return;
    }

    const students = this.studentRepo.findEnrolledByClassId(classId);
    res.json({ class: existing, students });
  };

  enrollStudentToClass = (req: AuthRequest, res: Response): void => {
    const classId = Number(req.params.id);
    const existing = this.classRepo.findById(classId);
    if (!existing) {
      res.status(404).json({ error: "Kelas tidak ditemukan." });
      return;
    }

    const currentEnrolled = this.studentRepo.findEnrolledByClassId(classId);
    const maxCapacity = Number(existing.capacity) || 0;
    if (maxCapacity > 0 && currentEnrolled.length >= maxCapacity) {
      res.status(400).json({
        error: `Kapasitas kelas sudah penuh (${currentEnrolled.length}/${maxCapacity} mahasiswa).`,
      });
      return;
    }

    const { studentId, nim, name, email } = req.body;
    let targetStudentId: number;

    if (studentId) {
      const stu = this.studentRepo.findById(Number(studentId));
      if (!stu) {
        res.status(404).json({ error: "Mahasiswa tidak ditemukan." });
        return;
      }
      if (!isSameProdi(stu.prodi, existing.prodi)) {
        res.status(400).json({
          error: `Mahasiswa ${stu.name} berasal dari prodi ${stu.prodi}, tidak sesuai dengan prodi kelas (${existing.prodi}).`,
        });
        return;
      }
      targetStudentId = stu.id;
    } else if (nim && name) {
      const existingByNim = this.studentRepo.findByNim(String(nim));
      if (existingByNim && !isSameProdi(existingByNim.prodi, existing.prodi)) {
        res.status(400).json({
          error: `Mahasiswa dengan NIM ${existingByNim.nim} terdaftar di prodi ${existingByNim.prodi}, tidak sesuai dengan prodi kelas (${existing.prodi}).`,
        });
        return;
      }
      targetStudentId = this.studentRepo.upsert({
        nim: String(nim),
        name: String(name),
        email: email ? String(email) : `${nim}@student.kampus.ac.id`,
        prodi: existing.prodi,
        status: "Aktif",
      });
    } else {
      res.status(400).json({ error: "Pilih mahasiswa terdaftar atau masukkan NIM dan Nama." });
      return;
    }

    const existingEnrollment = this.studentRepo.findEnrollment(classId, targetStudentId);
    if (existingEnrollment) {
      res.status(400).json({ error: "Mahasiswa sudah terdaftar pada kelas ini." });
      return;
    }

    const enrollmentId = this.studentRepo.enrollStudent(classId, targetStudentId);
    this.gradeRepo.initEmptyGrade(enrollmentId);

    res.status(201).json({
      message: "Mahasiswa berhasil didaftarkan ke kelas.",
      enrollmentId,
    });
  };

  unenrollStudentFromClass = (req: AuthRequest, res: Response): void => {
    const classId = Number(req.params.classId);
    const studentId = Number(req.params.studentId);

    this.studentRepo.unenrollStudent(classId, studentId);
    res.json({ message: "Mahasiswa berhasil dikeluarkan dari kelas." });
  };

  fillClassMinimumStudents = (req: AuthRequest, res: Response): void => {
    const classId = Number(req.params.id);
    const existing = this.classRepo.findById(classId);
    if (!existing) {
      res.status(404).json({ error: "Kelas tidak ditemukan." });
      return;
    }

    const addedCount = this.fillMinimumStudentsForClass(classId, 30);
    const updatedStudents = this.studentRepo.findEnrolledByClassId(classId);

    res.json({
      message:
        addedCount > 0
          ? `Berhasil menambahkan ${addedCount} mahasiswa. Total mahasiswa kelas kini ${updatedStudents.length} orang.`
          : `Kelas sudah memenuhi minimal 30 mahasiswa (${updatedStudents.length} orang).`,
      addedCount,
      totalEnrolled: updatedStudents.length,
    });
  };

  private fillMinimumStudentsForClass(classId: number, minCount = 30): number {
    const cls = this.classRepo.findById(classId);
    if (!cls) return 0;

    const currentEnrolled = this.studentRepo.findEnrolledByClassId(classId);
    if (currentEnrolled.length >= minCount) return 0;

    if (Number(cls.capacity) < minCount) {
      this.classRepo.adminUpdate(classId, { capacity: Math.max(40, minCount) });
    }

    const enrolledIds = new Set(currentEnrolled.map((s: any) => s.id));
    const allStudents = this.studentRepo.findAll();
    const eligibleStudents = allStudents.filter(
      (s: any) => !enrolledIds.has(s.id) && isSameProdi(s.prodi, cls.prodi)
    );

    let needed = minCount - currentEnrolled.length;
    let added = 0;

    for (const stu of eligibleStudents) {
      if (needed <= 0) break;
      const enrollmentId = this.studentRepo.enrollStudent(classId, stu.id);
      this.gradeRepo.initEmptyGrade(enrollmentId);
      enrolledIds.add(stu.id);
      added++;
      needed--;
    }

    if (needed > 0) {
      const defaultHash = bcrypt.hashSync("password123", 10);
      const prodiPrefix =
        (cls.prodi || "MHS").replace(/[^A-Za-z]/g, "").slice(0, 2).toUpperCase() || "MH";
      let seq = 1;
      while (needed > 0) {
        const genNim = `24${classId}${String(seq).padStart(4, "0")}`;
        seq++;
        if (this.studentRepo.findByNim(genNim)) continue;
        const newStudentId = this.studentRepo.create({
          nim: genNim,
          name: `Mahasiswa ${prodiPrefix} ${seq - 1}`,
          email: `${genNim}@student.gradia.ac.id`,
          passwordHash: defaultHash,
          prodi: cls.prodi,
          status: "Aktif",
        });
        const enrollmentId = this.studentRepo.enrollStudent(classId, newStudentId);
        this.gradeRepo.initEmptyGrade(enrollmentId);
        added++;
        needed--;
      }
    }

    return added;
  }
}

export const adminHandler = new AdminHandler();

