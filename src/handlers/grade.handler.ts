import { Response } from "express";
import { GradeRepository, gradeRepository } from "../repositories/grade.repository.js";
import { ClassRepository, classRepository } from "../repositories/class.repository.js";
import { StudentRepository, studentRepository } from "../repositories/student.repository.js";
import { AuthRequest } from "../middleware/auth.js";
import { BatchUpdateGradesDto } from "../dto/grade.dto.js";
import { realtimeService } from "../services/realtime.service.js";

export function calculateScore(
  tugas: number | null,
  uts: number | null,
  uas: number | null,
  weights: { tugas: number; uts: number; uas: number } = { tugas: 0.25, uts: 0.35, uas: 0.4 }
) {
  if (tugas === null || uts === null || uas === null || tugas === undefined || uts === undefined || uas === undefined) {
    return { finalScore: null, letterGrade: null, status: "Belum lengkap" };
  }
  const score = Math.round((Number(tugas) * weights.tugas + Number(uts) * weights.uts + Number(uas) * weights.uas) * 10) / 10;
  let letter = "E";
  let status = "Tersimpan";
  if (score >= 85) letter = "A";
  else if (score >= 80) letter = "A-";
  else if (score >= 75) letter = "B+";
  else if (score >= 70) letter = "B";
  else if (score >= 65) letter = "C+";
  else if (score >= 55) letter = "C";
  else if (score >= 45) letter = "D";
  else {
    letter = "E";
    status = "Perlu remedial";
  }
  return { finalScore: score, letterGrade: letter, status };
}

export class GradeHandler {
  constructor(
    private gradeRepo: GradeRepository = gradeRepository,
    private classRepo: ClassRepository = classRepository,
    private studentRepo: StudentRepository = studentRepository
  ) {}

  getGrades = (req: AuthRequest, res: Response): void => {
    const lecturerId = req.user!.id;
    const classId = Number(req.params.classId);

    const classData = this.classRepo.findByIdAndLecturerId(classId, lecturerId);
    if (!classData) {
      res.status(403).json({ error: "Akses ditolak atau kelas tidak ditemukan." });
      return;
    }

    const grades = this.gradeRepo.findByClassId(classId);
    const weights = {
      tugas: classData.weight_tugas != null ? Math.round(classData.weight_tugas * 100) : 25,
      uts: classData.weight_uts != null ? Math.round(classData.weight_uts * 100) : 35,
      uas: classData.weight_uas != null ? Math.round(classData.weight_uas * 100) : 40,
    };

    res.json({ grades, weights });
  };

  updateGrades = (req: AuthRequest, res: Response): void => {
    const lecturerId = req.user!.id;
    const classId = Number(req.params.classId);
    const body = req.body as BatchUpdateGradesDto;

    const rawItems = body.items || body.grades;
    if (!rawItems || !Array.isArray(rawItems)) {
      res.status(400).json({ error: "Format data tidak valid. Wajib berupa array (items atau grades)." });
      return;
    }

    const classData = this.classRepo.findByIdAndLecturerId(classId, lecturerId);
    if (!classData) {
      res.status(403).json({ error: "Akses ditolak atau kelas tidak ditemukan." });
      return;
    }

    let weightsDec = {
      tugas: classData.weight_tugas != null ? classData.weight_tugas : 0.25,
      uts: classData.weight_uts != null ? classData.weight_uts : 0.35,
      uas: classData.weight_uas != null ? classData.weight_uas : 0.40,
    };

    if (body.weights) {
      const wTugas = Number(body.weights.tugas) / 100;
      const wUts = Number(body.weights.uts) / 100;
      const wUas = Number(body.weights.uas) / 100;
      weightsDec = { tugas: wTugas, uts: wUts, uas: wUas };
      this.classRepo.updateWeights(classId, weightsDec);
    }

    const preparedItems = rawItems.map((item: any) => {
      const enrollmentId = item.enrollmentId || item.enrollment_id || item.id;
      const { finalScore, letterGrade, status } = calculateScore(item.tugas, item.uts, item.uas, weightsDec);
      return {
        enrollmentId,
        tugas: item.tugas ?? null,
        uts: item.uts ?? null,
        uas: item.uas ?? null,
        finalScore,
        letterGrade,
        status: item.status || status,
        aiFeedback: item.aiFeedback || item.ai_feedback || null,
      };
    });

    try {
      this.gradeRepo.batchUpsert(preparedItems);
      realtimeService.emitToClassStudents(classId, "grades_updated", {
        title: classData.title,
        code: classData.code,
      });
      res.json({
        message: "Rekap nilai berhasil disimpan.",
        weights: {
          tugas: Math.round(weightsDec.tugas * 100),
          uts: Math.round(weightsDec.uts * 100),
          uas: Math.round(weightsDec.uas * 100),
        },
      });
    } catch (err: any) {
      res.status(500).json({ error: "Gagal menyimpan nilai: " + err.message });
    }
  };

  getAppeals = (req: AuthRequest, res: Response): void => {
    const classId = Number(req.params.classId);
    if (!classId) {
      res.status(400).json({ error: "Parameter classId tidak valid." });
      return;
    }

    const appeals = this.gradeRepo.getAppealsByClassId(classId);
    res.json({ appeals });
  };

  updateAppeal = (req: AuthRequest, res: Response): void => {
    const appealId = Number(req.params.appealId);
    const { status, lecturer_response } = req.body;

    if (!appealId) {
      res.status(400).json({ error: "Parameter appealId tidak valid." });
      return;
    }

    if (!status || !["pending", "approved", "rejected"].includes(status)) {
      res.status(400).json({ error: "Status harus bernilai pending, approved, atau rejected." });
      return;
    }

    const updated = this.gradeRepo.updateAppealStatus(appealId, status, lecturer_response);
    if (updated?.student_id) {
      realtimeService.emitToUser("student", Number(updated.student_id), "grade_review_updated", {
        appealId,
        status,
      });
    }
    res.json({
      message: "Status pengajuan koreksi nilai berhasil diperbarui.",
      appeal: updated,
    });
  };
}

export const gradeHandler = new GradeHandler();

