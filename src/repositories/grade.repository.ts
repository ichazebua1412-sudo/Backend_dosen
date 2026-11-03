import { db } from "../db.js";

export interface GradeRecord {
  id: number;
  enrollment_id: number;
  tugas: number | null;
  uts: number | null;
  uas: number | null;
  final_score: number | null;
  letter_grade: string | null;
  status: string;
  ai_feedback: string | null;
  updated_at: string;
}

export class GradeRepository {
  findByClassId(classId: number): any[] {
    const stmt = db.prepare(`
      SELECT ce.id as enrollment_id, s.id as student_id, s.nim, s.name, s.prodi,
             g.id as grade_id, g.tugas, g.uts, g.uas, g.final_score, g.letter_grade, g.status, g.ai_feedback
      FROM class_enrollments ce
      JOIN students s ON ce.student_id = s.id
      LEFT JOIN grades g ON ce.id = g.enrollment_id
      WHERE ce.class_id = ?
      ORDER BY s.nim ASC
    `);
    return stmt.all(classId);
  }

  findByEnrollmentId(enrollmentId: number): GradeRecord | null {
    const stmt = db.prepare(`
      SELECT id, enrollment_id, tugas, uts, uas, final_score, letter_grade, status, ai_feedback, updated_at
      FROM grades
      WHERE enrollment_id = ?
    `);
    const row = stmt.get(enrollmentId) as GradeRecord | undefined;
    return row || null;
  }

  initEmptyGrade(enrollmentId: number): void {
    db.prepare(`
      INSERT OR IGNORE INTO grades (enrollment_id, status)
      VALUES (?, 'Belum lengkap')
    `).run(enrollmentId);
  }

  upsert(data: {
    enrollmentId: number;
    tugas: number | null;
    uts: number | null;
    uas: number | null;
    finalScore: number | null;
    letterGrade: string | null;
    status: string;
    aiFeedback?: string | null;
  }): void {
    const stmt = db.prepare(`
      INSERT INTO grades (enrollment_id, tugas, uts, uas, final_score, letter_grade, status, ai_feedback, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(enrollment_id) DO UPDATE SET
        tugas = excluded.tugas,
        uts = excluded.uts,
        uas = excluded.uas,
        final_score = excluded.final_score,
        letter_grade = excluded.letter_grade,
        status = excluded.status,
        ai_feedback = COALESCE(excluded.ai_feedback, grades.ai_feedback),
        updated_at = CURRENT_TIMESTAMP
    `);
    stmt.run(
      data.enrollmentId,
      data.tugas,
      data.uts,
      data.uas,
      data.finalScore,
      data.letterGrade,
      data.status,
      data.aiFeedback || null
    );
  }

  batchUpsert(items: Array<{
    enrollmentId: number;
    tugas: number | null;
    uts: number | null;
    uas: number | null;
    finalScore: number | null;
    letterGrade: string | null;
    status: string;
    aiFeedback?: string | null;
  }>): void {
    const stmt = db.prepare(`
      INSERT INTO grades (enrollment_id, tugas, uts, uas, final_score, letter_grade, status, ai_feedback, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(enrollment_id) DO UPDATE SET
        tugas = excluded.tugas,
        uts = excluded.uts,
        uas = excluded.uas,
        final_score = excluded.final_score,
        letter_grade = excluded.letter_grade,
        status = excluded.status,
        ai_feedback = COALESCE(excluded.ai_feedback, grades.ai_feedback),
        updated_at = CURRENT_TIMESTAMP
    `);

    db.exec("BEGIN;");
    try {
      for (const item of items) {
        stmt.run(
          item.enrollmentId,
          item.tugas,
          item.uts,
          item.uas,
          item.finalScore,
          item.letterGrade,
          item.status,
          item.aiFeedback || null
        );
      }
      db.exec("COMMIT;");
    } catch (err) {
      db.exec("ROLLBACK;");
      throw err;
    }
  }

  getDashboardGradeStats(lecturerId: number): any[] {
    const stmt = db.prepare(`
      SELECT g.id, g.tugas, g.uts, g.uas, g.final_score, g.letter_grade, g.status
      FROM grades g
      JOIN class_enrollments ce ON g.enrollment_id = ce.id
      JOIN classes c ON ce.class_id = c.id
      WHERE c.lecturer_id = ?
    `);
    return stmt.all(lecturerId);
  }
}

export const gradeRepository = new GradeRepository();

