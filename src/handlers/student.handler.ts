import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { StudentRepository, studentRepository } from "../repositories/student.repository.js";
import { AuthRequest } from "../middleware/auth.js";
import { realtimeService } from "../services/realtime.service.js";
import {
  StudentLoginDto,
  ApplyLeaveDto,
  CheckInAttendanceDto,
  SubmitAssignmentDto,
  CreateGradeReviewDto,
} from "../dto/student.dto.js";

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
    const attendances = this.studentRepo.getStudentAttendances(studentId);
    const assignmentsData = this.studentRepo.getStudentAssignments(studentId);

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
      activeSession: attendances.activeSession,
      upcomingAssignments: assignmentsData.assignments.slice(0, 3),
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

  // -------------------------------------------------------------
  // FITUR MOBILE 1: PRESENSI & KEHADIRAN
  // -------------------------------------------------------------
  getAttendances = (req: AuthRequest, res: Response): void => {
    const studentId = req.user!.id;
    const data = this.studentRepo.getStudentAttendances(studentId);
    res.json(data);
  };

  checkIn = (req: AuthRequest, res: Response): void => {
    const studentId = req.user!.id;
    const body = req.body as CheckInAttendanceDto;

    const result = this.studentRepo.checkInAttendance(
      studentId,
      body.classId,
      body.type
    );

    realtimeService.emitToUser("student", studentId, "attendance_updated", { classId: body.classId });
    realtimeService.emitToClassLecturer(body.classId, "attendance_updated", { studentId });

    res.status(201).json({
      message: `Presensi ${body.type || "Luring"} berhasil dicatat.`,
      attendance: result,
    });
  };

  applyLeave = (req: AuthRequest, res: Response): void => {
    const studentId = req.user!.id;
    const body = req.body as ApplyLeaveDto;

    const result = this.studentRepo.applyLeave(
      studentId,
      body.classId,
      body.status,
      body.reason,
      body.attachmentUrl
    );

    realtimeService.emitToUser("student", studentId, "attendance_updated", { classId: body.classId });
    realtimeService.emitToClassLecturer(body.classId, "attendance_updated", { studentId, status: body.status });

    res.status(201).json({
      message: `Pengajuan ${body.status} berhasil disimpan.`,
      attendance: result,
    });
  };

  // -------------------------------------------------------------
  // FITUR MOBILE 2: TUGAS KULIAH
  // -------------------------------------------------------------
  getAssignments = (req: AuthRequest, res: Response): void => {
    const studentId = req.user!.id;
    const filter = req.query.filter as string | undefined;

    const data = this.studentRepo.getStudentAssignments(studentId, filter);
    res.json(data);
  };

  submitAssignment = (req: AuthRequest, res: Response): void => {
    const studentId = req.user!.id;
    const assignmentId = parseInt(req.params.id, 10);
    const body = req.body as SubmitAssignmentDto;

    if (isNaN(assignmentId)) {
      res.status(400).json({ error: "ID Tugas tidak valid." });
      return;
    }

    const result = this.studentRepo.submitAssignment(
      studentId,
      assignmentId,
      body.fileUrl,
      body.notes
    );

    realtimeService.emitToUser("student", studentId, "assignment_submitted", { assignmentId });

    res.json(result);
  };

  // -------------------------------------------------------------
  // FITUR MOBILE 3: NOTIFIKASI MAHASISWA
  // -------------------------------------------------------------
  getNotifications = (req: AuthRequest, res: Response): void => {
    const studentId = req.user!.id;
    const category = req.query.category as string | undefined;

    const data = this.studentRepo.getStudentNotifications(studentId, category);
    res.json(data);
  };

  markNotificationRead = (req: AuthRequest, res: Response): void => {
    const studentId = req.user!.id;
    const notifId = parseInt(req.params.id, 10);

    if (isNaN(notifId)) {
      res.status(400).json({ error: "ID Notifikasi tidak valid." });
      return;
    }

    this.studentRepo.markNotificationRead(studentId, notifId);
    res.json({ message: "Notifikasi telah ditandai dibaca." });
  };

  markAllNotificationsRead = (req: AuthRequest, res: Response): void => {
    const studentId = req.user!.id;
    this.studentRepo.markAllNotificationsRead(studentId);
    res.json({ message: "Semua notifikasi telah ditandai dibaca." });
  };

  // -------------------------------------------------------------
  // FITUR MOBILE 4: REVIEW / SANGGAHAN NILAI
  // -------------------------------------------------------------
  getGradeReviews = (req: AuthRequest, res: Response): void => {
    const studentId = req.user!.id;
    const reviews = this.studentRepo.getStudentGradeReviews(studentId);
    res.json({ reviews });
  };

  createGradeReview = (req: AuthRequest, res: Response): void => {
    const studentId = req.user!.id;
    const body = req.body as CreateGradeReviewDto;

    const result = this.studentRepo.createGradeReview(studentId, body);
    realtimeService.emitToClassLecturer(body.classId, "grade_review_created", {
      studentId,
      component: body.component,
    });
    res.status(201).json(result);
  };

  createGradeAppeal = (req: AuthRequest, res: Response): void => {
    const studentId = req.user?.id || req.body.student_id || 1;
    const body = req.body;
    const classId = body.classId || body.class_id || 1;
    const component = body.component || body.question_title || "Umum";
    const currentScore = body.currentScore || body.current_score || "-";
    const reason = body.reason || body.comment || "";

    const result = this.studentRepo.createGradeReview(Number(studentId), {
      classId: Number(classId),
      component: String(component),
      currentScore: String(currentScore),
      reason: String(reason),
    });

    res.status(201).json({
      appeal: result,
      ...result,
    });
  };

  getGradeAppeals = (req: AuthRequest, res: Response): void => {
    const studentId = req.user?.id || req.query.student_id || 1;
    const reviews = this.studentRepo.getStudentGradeReviews(Number(studentId));
    res.json({ appeals: reviews, reviews });
  };
}

export const studentHandler = new StudentHandler();


