import { db } from "../db.js";

export interface AdminRecord {
  id: number;
  username: string;
  email: string;
  password_hash: string;
  name: string;
  role: string;
  created_at: string;
}

export class AdminRepository {
  findByUsernameOrEmail(identifier: string): AdminRecord | null {
    const stmt = db.prepare(`
      SELECT id, username, email, password_hash, name, role, created_at
      FROM admins
      WHERE username = ? OR email = ?
    `);
    const row = stmt.get(identifier.trim(), identifier.trim()) as AdminRecord | undefined;
    return row || null;
  }

  findById(id: number): Omit<AdminRecord, "password_hash"> | null {
    const stmt = db.prepare(`
      SELECT id, username, email, name, role, created_at
      FROM admins
      WHERE id = ?
    `);
    const row = stmt.get(id) as Omit<AdminRecord, "password_hash"> | undefined;
    return row || null;
  }

  getDashboardStats() {
    const totalLecturers = (db.prepare("SELECT COUNT(id) as count FROM lecturers").get() as any)?.count || 0;
    const activeLecturers = (db.prepare("SELECT COUNT(id) as count FROM lecturers WHERE status = 'active' OR status IS NULL").get() as any)?.count || 0;
    const totalClasses = (db.prepare("SELECT COUNT(id) as count FROM classes").get() as any)?.count || 0;
    const totalStudents = (db.prepare("SELECT COUNT(id) as count FROM students").get() as any)?.count || 0;
    const totalGrades = (db.prepare("SELECT COUNT(id) as count FROM grades").get() as any)?.count || 0;

    const recentLecturers = db.prepare(`
      SELECT l.id, l.nidn, l.name, l.email, l.status, l.created_at,
             COUNT(c.id) as class_count
      FROM lecturers l
      LEFT JOIN classes c ON l.id = c.lecturer_id
      GROUP BY l.id
      ORDER BY l.id DESC
      LIMIT 5
    `).all();

    const recentClasses = db.prepare(`
      SELECT c.id, c.code, c.title, c.sks, c.prodi, c.semester,
             l.name as lecturer_name,
             COUNT(ce.id) as student_count
      FROM classes c
      JOIN lecturers l ON c.lecturer_id = l.id
      LEFT JOIN class_enrollments ce ON c.id = ce.class_id
      GROUP BY c.id
      ORDER BY c.id DESC
      LIMIT 5
    `).all();

    return {
      stats: {
        totalLecturers,
        activeLecturers,
        totalClasses,
        totalStudents,
        totalGrades,
      },
      recentLecturers,
      recentClasses,
    };
  }
}

export const adminRepository = new AdminRepository();

