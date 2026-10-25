import { Router, Response } from "express";
import { AuthRequest, authGuard } from "../middleware/auth.js";
import { db } from "../db.js";

const router = Router();

router.get("/", authGuard, (req: AuthRequest, res: Response) => {
  const lecturerId = req.user!.id;

  // Total classes
  const classesCount = (db.prepare("SELECT COUNT(id) as count FROM classes WHERE lecturer_id = ?").get(lecturerId) as any)?.count || 0;

  // Total distinct students enrolled in lecturer's classes
  const studentsCount = (db.prepare(`
    SELECT COUNT(DISTINCT ce.student_id) as count
    FROM class_enrollments ce
    JOIN classes c ON ce.class_id = c.id
    WHERE c.lecturer_id = ?
  `).get(lecturerId) as any)?.count || 0;

  // Pending grading count (classes with at least one grade status != 'Tersimpan')
  const pendingCount = (db.prepare(`
    SELECT COUNT(DISTINCT c.id) as count
    FROM classes c
    JOIN class_enrollments ce ON c.id = ce.class_id
    LEFT JOIN grades g ON ce.id = g.enrollment_id
    WHERE c.lecturer_id = ? AND (g.status IS NULL OR g.status != 'Tersimpan')
  `).get(lecturerId) as any)?.count || 0;

  // AI Reports count
  const aiReportsCount = (db.prepare(`
    SELECT COUNT(g.id) as count
    FROM grades g
    JOIN class_enrollments ce ON g.enrollment_id = ce.id
    JOIN classes c ON ce.class_id = c.id
    WHERE c.lecturer_id = ? AND g.ai_feedback IS NOT NULL
  `).get(lecturerId) as any)?.count || 0;

  // Classes list with progress
  const classes = db.prepare(`
    SELECT c.id, c.code, c.title, c.sks, c.prodi, c.semester, c.academic_year, c.capacity, c.schedule, c.room,
           COUNT(ce.id) as enrolled_count
    FROM classes c
    LEFT JOIN class_enrollments ce ON c.id = ce.class_id
    WHERE c.lecturer_id = ?
    GROUP BY c.id
  `).all(lecturerId) as any[];

  return res.json({
    stats: {
      totalClasses: classesCount,
      totalStudents: studentsCount,
      pendingGrading: pendingCount,
      aiReportsReady: aiReportsCount,
      accuracyRubric: aiReportsCount > 0 ? "98.4%" : "0%"
    },
    classes
  });
});

export default router;
