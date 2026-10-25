import { Router, Response } from "express";
import { AuthRequest, authGuard } from "../middleware/auth.js";
import { db } from "../db.js";
import { classSchema } from "../schemas.js";

const router = Router();

// List all classes for current lecturer
router.get("/", authGuard, (req: AuthRequest, res: Response) => {
  const lecturerId = req.user!.id;
  const classes = db.prepare(`
    SELECT c.id, c.code, c.title, c.sks, c.prodi, c.semester, c.academic_year, c.capacity, c.schedule, c.room,
           COUNT(ce.id) as enrolled_count
    FROM classes c
    LEFT JOIN class_enrollments ce ON c.id = ce.class_id
    WHERE c.lecturer_id = ?
    GROUP BY c.id
    ORDER BY c.id DESC
  `).all(lecturerId);

  return res.json({ classes });
});

// Create new class
router.post("/", authGuard, (req: AuthRequest, res: Response) => {
  const lecturerId = req.user!.id;

  // Validasi skema bersama (safeParse di server)
  const validation = classSchema.safeParse(req.body);
  if (!validation.success) {
    const fieldErrors = validation.error.flatten().fieldErrors;
    return res.status(400).json({
      error: "Validasi data gagal. Periksa kembali input Anda.",
      fieldErrors,
    });
  }

  const { code, title, sks, prodi, semester, capacity, schedule, room } = validation.data;

  const stmt = db.prepare(`
    INSERT INTO classes (lecturer_id, code, title, sks, prodi, semester, capacity, schedule, room)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const result = stmt.run(
    lecturerId,
    code.trim(),
    title.trim(),
    Number(sks) || 3,
    prodi.trim(),
    Number(semester) || 1,
    Number(capacity) || 40,
    schedule?.trim() || "Senin, 08:00 WIB",
    room?.trim() || "Ruang Teori"
  );

  return res.status(201).json({
    message: "Kelas berhasil dibuat.",
    classId: Number(result.lastInsertRowid)
  });
});

// Get class detail with enrolled students
router.get("/:id", authGuard, (req: AuthRequest, res: Response) => {
  const lecturerId = req.user!.id;
  const classId = Number(req.params.id);

  const classData = db.prepare(`
    SELECT id, code, title, sks, prodi, semester, academic_year, capacity, schedule, room
    FROM classes
    WHERE id = ? AND lecturer_id = ?
  `).get(classId, lecturerId) as any;

  if (!classData) {
    return res.status(404).json({ error: "Kelas tidak ditemukan atau Anda tidak memiliki akses." });
  }

  const students = db.prepare(`
    SELECT s.id, s.nim, s.name, s.email, s.prodi, s.status, ce.id as enrollment_id,
           g.tugas, g.uts, g.uas, g.final_score, g.letter_grade, g.status as grade_status, g.ai_feedback
    FROM class_enrollments ce
    JOIN students s ON ce.student_id = s.id
    LEFT JOIN grades g ON ce.id = g.enrollment_id
    WHERE ce.class_id = ?
    ORDER BY s.nim ASC
  `).all(classId);

  return res.json({ class: classData, students });
});

// Enroll a student to class
router.post("/:id/students", authGuard, (req: AuthRequest, res: Response) => {
  const lecturerId = req.user!.id;
  const classId = Number(req.params.id);
  const { nim, name, email, prodi } = req.body;

  if (!nim || !name) {
    return res.status(400).json({ error: "NIM dan Nama Mahasiswa wajib diisi." });
  }

  // Verify class ownership
  const classCheck = db.prepare("SELECT id FROM classes WHERE id = ? AND lecturer_id = ?").get(classId, lecturerId);
  if (!classCheck) {
    return res.status(404).json({ error: "Kelas tidak ditemukan." });
  }

  // Insert or get student
  db.prepare(`
    INSERT OR IGNORE INTO students (nim, name, email, prodi, status)
    VALUES (?, ?, ?, ?, 'Aktif')
  `).run(nim.trim(), name.trim(), email?.trim() || `${nim}@student.ac.id`, prodi?.trim() || "Teknik Informatika");

  const student = db.prepare("SELECT id FROM students WHERE nim = ?").get(nim.trim()) as { id: number };

  // Enroll
  try {
    const enrollResult = db.prepare("INSERT INTO class_enrollments (class_id, student_id) VALUES (?, ?)").run(classId, student.id);
    const enrollmentId = Number(enrollResult.lastInsertRowid);
    // Initialize blank grade
    db.prepare("INSERT INTO grades (enrollment_id, status) VALUES (?, 'Belum lengkap')").run(enrollmentId);

    return res.status(201).json({ message: "Mahasiswa berhasil ditambahkan ke kelas." });
  } catch (err: any) {
    return res.status(400).json({ error: "Mahasiswa sudah terdaftar di kelas ini." });
  }
});

// Update class details
router.put("/:id", authGuard, (req: AuthRequest, res: Response) => {
  const lecturerId = req.user!.id;
  const classId = Number(req.params.id);
  const { code, title, sks, prodi, semester, capacity, schedule, room } = req.body;

  const isOwner = db.prepare("SELECT id FROM classes WHERE id = ? AND lecturer_id = ?").get(classId, lecturerId);
  if (!isOwner) return res.status(403).json({ error: "Akses ditolak." });

  db.prepare(`
    UPDATE classes
    SET code = COALESCE(?, code),
        title = COALESCE(?, title),
        sks = COALESCE(?, sks),
        prodi = COALESCE(?, prodi),
        semester = COALESCE(?, semester),
        capacity = COALESCE(?, capacity),
        schedule = COALESCE(?, schedule),
        room = COALESCE(?, room)
    WHERE id = ? AND lecturer_id = ?
  `).run(
    code?.trim() || null,
    title?.trim() || null,
    sks ? Number(sks) : null,
    prodi?.trim() || null,
    semester ? Number(semester) : null,
    capacity ? Number(capacity) : null,
    schedule?.trim() || null,
    room?.trim() || null,
    classId,
    lecturerId
  );

  return res.json({ message: "Informasi kelas berhasil diperbarui." });
});

// Delete class (cascade deletes enrollments and grades via FK)
router.delete("/:id", authGuard, (req: AuthRequest, res: Response) => {
  const lecturerId = req.user!.id;
  const classId = Number(req.params.id);

  const isOwner = db.prepare("SELECT id FROM classes WHERE id = ? AND lecturer_id = ?").get(classId, lecturerId);
  if (!isOwner) return res.status(403).json({ error: "Akses ditolak atau kelas tidak ditemukan." });

  db.prepare("DELETE FROM classes WHERE id = ? AND lecturer_id = ?").run(classId, lecturerId);
  return res.json({ message: "Kelas berhasil dihapus." });
});

// Unenroll student from class
router.delete("/:id/students/:studentId", authGuard, (req: AuthRequest, res: Response) => {
  const lecturerId = req.user!.id;
  const classId = Number(req.params.id);
  const studentId = Number(req.params.studentId);

  const isOwner = db.prepare("SELECT id FROM classes WHERE id = ? AND lecturer_id = ?").get(classId, lecturerId);
  if (!isOwner) return res.status(403).json({ error: "Akses ditolak." });

  db.prepare("DELETE FROM class_enrollments WHERE class_id = ? AND student_id = ?").run(classId, studentId);
  return res.json({ message: "Mahasiswa berhasil dihapus dari kelas." });
});

export default router;
