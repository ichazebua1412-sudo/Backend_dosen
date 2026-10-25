import { Router, Response } from "express";
import { AuthRequest, authGuard } from "../middleware/auth.js";
import { db } from "../db.js";

const router = Router();

function calculateScore(tugas: number | null, uts: number | null, uas: number | null) {
  if (tugas === null || uts === null || uas === null) {
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

// Get grades for class
router.get("/:classId", authGuard, (req: AuthRequest, res: Response) => {
  const lecturerId = req.user!.id;
  const classId = Number(req.params.classId);

  const isOwner = db.prepare("SELECT id FROM classes WHERE id = ? AND lecturer_id = ?").get(classId, lecturerId);
  if (!isOwner) return res.status(403).json({ error: "Akses ditolak." });

  const grades = db.prepare(`
    SELECT ce.id as enrollment_id, s.id as student_id, s.nim, s.name, s.prodi,
           g.id as grade_id, g.tugas, g.uts, g.uas, g.final_score, g.letter_grade, g.status, g.ai_feedback
    FROM class_enrollments ce
    JOIN students s ON ce.student_id = s.id
    LEFT JOIN grades g ON ce.id = g.enrollment_id
    WHERE ce.class_id = ?
    ORDER BY s.nim ASC
  `).all(classId);

  return res.json({ grades });
});

// Update / save grades batch
router.put("/:classId", authGuard, (req: AuthRequest, res: Response) => {
  const lecturerId = req.user!.id;
  const classId = Number(req.params.classId);
  const rawItems = req.body.items || req.body.grades;

  if (!Array.isArray(rawItems)) {
    return res.status(400).json({ error: "Format data tidak valid. Wajib berupa array (items atau grades)." });
  }

  const isOwner = db.prepare("SELECT id FROM classes WHERE id = ? AND lecturer_id = ?").get(classId, lecturerId);
  if (!isOwner) return res.status(403).json({ error: "Akses ditolak." });

  const updateStmt = db.prepare(`
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
    for (const item of rawItems) {
      const enrollmentId = item.enrollmentId || item.enrollment_id || item.id;
      if (!enrollmentId) continue;
      const { finalScore, letterGrade, status } = calculateScore(item.tugas, item.uts, item.uas);
      updateStmt.run(
        enrollmentId,
        item.tugas ?? null,
        item.uts ?? null,
        item.uas ?? null,
        finalScore,
        letterGrade,
        item.status || status,
        item.aiFeedback || item.ai_feedback || null
      );
    }
    db.exec("COMMIT;");
    return res.json({ message: "Rekap nilai berhasil disimpan." });
  } catch (err: any) {
    db.exec("ROLLBACK;");
    return res.status(500).json({ error: "Gagal menyimpan nilai: " + err.message });
  }
});

// Bulk import grades (from preview / Excel payload)
router.post("/:classId/import", authGuard, (req: AuthRequest, res: Response) => {
  const lecturerId = req.user!.id;
  const classId = Number(req.params.classId);
  const { rows } = req.body; // array of { nim, name, tugas, uts, uas }

  if (!Array.isArray(rows) || rows.length === 0) {
    return res.status(400).json({ error: "Data baris import kosong." });
  }

  const isOwner = db.prepare("SELECT id FROM classes WHERE id = ? AND lecturer_id = ?").get(classId, lecturerId);
  if (!isOwner) return res.status(403).json({ error: "Akses ditolak." });

  const upsertStudent = db.prepare(`
    INSERT INTO students (nim, name, email, prodi, status)
    VALUES (?, ?, ?, 'Teknik Informatika', 'Aktif')
    ON CONFLICT(nim) DO UPDATE SET name = excluded.name
  `);
  const enrollStmt = db.prepare(`INSERT OR IGNORE INTO class_enrollments (class_id, student_id) VALUES (?, ?)`);
  const upsertGrade = db.prepare(`
    INSERT INTO grades (enrollment_id, tugas, uts, uas, final_score, letter_grade, status)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(enrollment_id) DO UPDATE SET
      tugas = excluded.tugas,
      uts = excluded.uts,
      uas = excluded.uas,
      final_score = excluded.final_score,
      letter_grade = excluded.letter_grade,
      status = excluded.status,
      updated_at = CURRENT_TIMESTAMP
  `);

  let importedCount = 0;
  db.exec("BEGIN;");
  try {
    for (const row of rows) {
      if (!row.nim) continue;
      upsertStudent.run(String(row.nim).trim(), row.name || "Mahasiswa", `${row.nim}@student.ac.id`);
      const student = db.prepare("SELECT id FROM students WHERE nim = ?").get(String(row.nim).trim()) as { id: number };
      enrollStmt.run(classId, student.id);
      const enrollment = db.prepare("SELECT id FROM class_enrollments WHERE class_id = ? AND student_id = ?").get(classId, student.id) as { id: number };

      const { finalScore, letterGrade, status } = calculateScore(row.tugas ?? null, row.uts ?? null, row.uas ?? null);
      upsertGrade.run(enrollment.id, row.tugas ?? null, row.uts ?? null, row.uas ?? null, finalScore, letterGrade, status);
      importedCount++;
    }
    db.exec("COMMIT;");
    return res.json({ message: `Berhasil mengimpor ${importedCount} data nilai mahasiswa.` });
  } catch (err: any) {
    db.exec("ROLLBACK;");
    return res.status(500).json({ error: "Gagal mengimpor nilai: " + err.message });
  }
});

export default router;
