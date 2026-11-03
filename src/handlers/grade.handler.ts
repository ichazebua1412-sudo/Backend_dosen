import { Response } from "express";
import { GradeRepository, gradeRepository } from "../repositories/grade.repository.js";
import { ClassRepository, classRepository } from "../repositories/class.repository.js";
import { StudentRepository, studentRepository } from "../repositories/student.repository.js";
import { AuthRequest } from "../middleware/auth.js";
import { BatchUpdateGradesDto, ImportGradesDto } from "../dto/grade.dto.js";

export function calculateScore(tugas: number | null, uts: number | null, uas: number | null) {
  if (tugas === null || uts === null || uas === null || tugas === undefined || uts === undefined || uas === undefined) {
    return { finalScore: null, letterGrade: null, status: "Belum lengkap" };
  }
  const score = Math.round((Number(tugas) * 0.3 + Number(uts) * 0.3 + Number(uas) * 0.4) * 10) / 10;
  let letter = "E";
  let status = "Tersimpan";
  if (score >= 85) letter = "A";
  else if (score >= 75) letter = "B";
  else if (score >= 65) letter = "C";
  else if (score >= 55) letter = "D";
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

    const isOwner = this.classRepo.findByIdAndLecturerId(classId, lecturerId);
    if (!isOwner) {
      res.status(403).json({ error: "Akses ditolak." });
      return;
    }

    const grades = this.gradeRepo.findByClassId(classId);
    res.json({ grades });
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

    const isOwner = this.classRepo.findByIdAndLecturerId(classId, lecturerId);
    if (!isOwner) {
      res.status(403).json({ error: "Akses ditolak." });
      return;
    }

    const preparedItems = rawItems.map((item: any) => {
      const enrollmentId = item.enrollmentId || item.enrollment_id || item.id;
      const { finalScore, letterGrade, status } = calculateScore(item.tugas, item.uts, item.uas);
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
      res.json({ message: "Rekap nilai berhasil disimpan." });
    } catch (err: any) {
      res.status(500).json({ error: "Gagal menyimpan nilai: " + err.message });
    }
  };

  importGrades = (req: AuthRequest, res: Response): void => {
    const lecturerId = req.user!.id;
    const classId = Number(req.params.classId);
    const { rows } = req.body as ImportGradesDto;

    const classData = this.classRepo.findByIdAndLecturerId(classId, lecturerId);
    if (!classData) {
      res.status(403).json({ error: "Akses ditolak atau kelas tidak ditemukan." });
      return;
    }

    let successCount = 0;
    const errors: string[] = [];

    for (const row of rows) {
      try {
        const nim = String(row.nim).trim();
        const studentName = (row.nama || row.name || `Mahasiswa ${nim}`).trim();
        if (!nim) continue;

        // Upsert student
        const studentId = this.studentRepo.upsert({
          nim,
          name: studentName,
          email: `${nim}@student.kampus.ac.id`,
          prodi: classData.prodi,
          status: "Aktif",
        });

        // Ensure enrollment
        let enrollment = this.studentRepo.findEnrollment(classId, studentId);
        let enrollmentId = enrollment ? enrollment.id : null;
        if (!enrollmentId) {
          enrollmentId = this.studentRepo.enrollStudent(classId, studentId);
        }

        const parseVal = (v: any) => (v !== undefined && v !== null && v !== "" && !isNaN(Number(v))) ? Number(v) : null;
        const tugas = parseVal(row.tugas);
        const uts = parseVal(row.uts);
        const uas = parseVal(row.uas);

        const { finalScore, letterGrade, status } = calculateScore(tugas, uts, uas);

        this.gradeRepo.upsert({
          enrollmentId,
          tugas,
          uts,
          uas,
          finalScore,
          letterGrade,
          status,
        });

        successCount++;
      } catch (err: any) {
        errors.push(`Gagal memproses baris NIM ${row.nim}: ${err.message}`);
      }
    }

    res.json({
      message: `Berhasil mengimpor ${successCount} data nilai mahasiswa.`,
      successCount,
      errors: errors.length > 0 ? errors : undefined,
    });
  };
}

export const gradeHandler = new GradeHandler();

