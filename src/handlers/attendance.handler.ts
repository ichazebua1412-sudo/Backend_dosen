import { Response } from "express";
import { AuthRequest } from "../middleware/auth.js";
import { ClassRepository, classRepository } from "../repositories/class.repository.js";
import { AttendanceRepository, attendanceRepository } from "../repositories/attendance.repository.js";
import { CorrectAttendanceDto, ToggleSessionDto } from "../dto/attendance.dto.js";
import { realtimeService } from "../services/realtime.service.js";

export class AttendanceHandler {
  constructor(
    private attendanceRepo: AttendanceRepository = attendanceRepository,
    private classRepo: ClassRepository = classRepository
  ) {}

  getSchedule = (req: AuthRequest, res: Response): void => {
    const lecturerId = req.user!.id;
    const classes = this.attendanceRepo.getLecturerSchedule(lecturerId);
    res.json({ classes });
  };

  toggleSession = (req: AuthRequest, res: Response): void => {
    const lecturerId = req.user!.id;
    const { classId, pertemuan, isOpen } = req.body as ToggleSessionDto;

    const classCheck = this.classRepo.findByIdAndLecturerId(classId, lecturerId);
    if (!classCheck) {
      res.status(403).json({ error: "Akses ditolak atau kelas tidak ditemukan." });
      return;
    }

    const session = this.attendanceRepo.toggleSession(classId, pertemuan, isOpen);
    realtimeService.emitToClassStudents(classId, "attendance_updated", {
      pertemuan,
      isOpen,
    });
    realtimeService.emitToClassLecturer(classId, "attendance_updated", {
      pertemuan,
      isOpen,
    });
    if (isOpen) {
      realtimeService.notifyClassStudents(
        classId,
        "pengumuman",
        `Presensi ${classCheck.code} Dibuka`,
        `Sesi presensi Pertemuan ${pertemuan} untuk ${classCheck.title} telah dibuka. Silakan lakukan presensi.`
      );
    }
    res.json({
      message: isOpen
        ? `Sesi presensi Pertemuan ${pertemuan} dibuka untuk mahasiswa.`
        : `Sesi presensi Pertemuan ${pertemuan} telah ditutup.`,
      session: {
        ...session,
        is_open: Boolean(session.is_open),
      },
    });
  };

  getClassAttendance = (req: AuthRequest, res: Response): void => {
    const lecturerId = req.user!.id;
    const classId = Number(req.params.classId);
    const pertemuanParam = req.query.pertemuan ? Number(req.query.pertemuan) : undefined;

    if (isNaN(classId)) {
      res.status(400).json({ error: "ID Kelas tidak valid." });
      return;
    }

    const classCheck = this.classRepo.findByIdAndLecturerId(classId, lecturerId);
    if (!classCheck) {
      res.status(403).json({ error: "Akses ditolak atau kelas tidak ditemukan." });
      return;
    }

    const detail = this.attendanceRepo.getClassAttendanceDetail(
      classId,
      pertemuanParam && !isNaN(pertemuanParam) ? pertemuanParam : undefined
    );

    if (!detail) {
      res.status(404).json({ error: "Kelas tidak ditemukan." });
      return;
    }

    res.json(detail);
  };

  correctStudentAttendance = (req: AuthRequest, res: Response): void => {
    const lecturerId = req.user!.id;
    const classId = Number(req.params.classId);
    const studentId = Number(req.params.studentId);
    const { pertemuan, status, alasan_koreksi } = req.body as CorrectAttendanceDto;

    if (isNaN(classId) || isNaN(studentId)) {
      res.status(400).json({ error: "ID Kelas atau Mahasiswa tidak valid." });
      return;
    }

    const classCheck = this.classRepo.findByIdAndLecturerId(classId, lecturerId);
    if (!classCheck) {
      res.status(403).json({ error: "Akses ditolak atau kelas tidak ditemukan." });
      return;
    }

    const updated = this.attendanceRepo.correctStudentAttendance(
      classId,
      studentId,
      pertemuan,
      status,
      alasan_koreksi
    );

    realtimeService.emitToUser("student", studentId, "attendance_updated", {
      classId,
      pertemuan,
      status,
    });
    realtimeService.emitToClassLecturer(classId, "attendance_updated", {
      studentId,
      pertemuan,
      status,
    });
    realtimeService.notifyStudent(
      studentId,
      "pengumuman",
      `Koreksi Kehadiran ${classCheck.code}`,
      `Status kehadiran Anda pada Pertemuan ${pertemuan} (${classCheck.title}) telah dikoreksi dosen menjadi "${status}".`
    );

    res.json({
      message: "Status kehadiran berhasil dikoreksi dan dicatat dalam audit log dosen.",
      attendance: {
        ...updated,
        audit_dosen: Boolean(updated.audit_dosen),
      },
    });
  };
}

export const attendanceHandler = new AttendanceHandler();

