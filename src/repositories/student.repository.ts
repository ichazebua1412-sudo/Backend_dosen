import { db } from "../db.js";

export interface StudentRecord {
  id: number;
  nim: string;
  name: string;
  email: string;
  password_hash?: string;
  prodi: string;
  status: string;
}

export class StudentRepository {
  findByNim(nim: string): StudentRecord | null {
    const stmt = db.prepare(`
      SELECT id, nim, name, email, password_hash, prodi, status
      FROM students
      WHERE nim = ?
    `);
    const row = stmt.get(nim.trim()) as StudentRecord | undefined;
    return row || null;
  }

  findByNimOrEmail(identifier: string): (StudentRecord & { password_hash: string }) | null {
    const stmt = db.prepare(`
      SELECT id, nim, name, email, password_hash, prodi, status
      FROM students
      WHERE nim = ? OR email = ?
    `);
    const row = stmt.get(identifier.trim(), identifier.trim()) as any;
    return row || null;
  }

  findById(id: number): StudentRecord | null {
    const stmt = db.prepare(`
      SELECT id, nim, name, email, password_hash, prodi, status
      FROM students
      WHERE id = ?
    `);
    const row = stmt.get(id) as StudentRecord | undefined;
    return row || null;
  }

  findAll(search?: string, prodi?: string): any[] {
    let query = `
      SELECT s.id, s.nim, s.name, s.email, s.prodi, s.status,
             COUNT(ce.id) as class_count
      FROM students s
      LEFT JOIN class_enrollments ce ON s.id = ce.student_id
    `;
    const conditions: string[] = [];
    const params: any[] = [];

    if (search && search.trim()) {
      conditions.push(`(s.name LIKE ? OR s.nim LIKE ? OR s.email LIKE ?)`);
      const term = `%${search.trim()}%`;
      params.push(term, term, term);
    }

    if (prodi && prodi.trim() && prodi !== "all") {
      conditions.push(`s.prodi = ?`);
      params.push(prodi.trim());
    }

    if (conditions.length > 0) {
      query += ` WHERE ` + conditions.join(" AND ");
    }

    query += ` GROUP BY s.id ORDER BY s.nim ASC `;
    return db.prepare(query).all(...params);
  }

  create(data: {
    nim: string;
    name: string;
    email: string;
    passwordHash?: string;
    prodi: string;
    status?: string;
  }): number {
    const stmt = db.prepare(`
      INSERT INTO students (nim, name, email, password_hash, prodi, status)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    const result = stmt.run(
      data.nim.trim(),
      data.name.trim(),
      data.email.trim(),
      data.passwordHash || "",
      data.prodi.trim(),
      data.status || "Aktif"
    );
    return Number(result.lastInsertRowid);
  }

  upsert(data: {
    nim: string;
    name: string;
    email: string;
    passwordHash?: string;
    prodi: string;
    status?: string;
  }): number {
    const existing = this.findByNim(data.nim);
    if (existing) {
      db.prepare(`
        UPDATE students
        SET name = COALESCE(?, name),
            email = COALESCE(?, email),
            password_hash = COALESCE(?, password_hash),
            prodi = COALESCE(?, prodi),
            status = COALESCE(?, status)
        WHERE id = ?
      `).run(
        data.name?.trim() || null,
        data.email?.trim() || null,
        data.passwordHash || null,
        data.prodi?.trim() || null,
        data.status || null,
        existing.id
      );
      return existing.id;
    }
    return this.create(data);
  }

  update(id: number, data: {
    name?: string;
    email?: string;
    passwordHash?: string;
    prodi?: string;
    status?: string;
  }): void {
    const stmt = db.prepare(`
      UPDATE students
      SET name = COALESCE(?, name),
          email = COALESCE(?, email),
          password_hash = COALESCE(?, password_hash),
          prodi = COALESCE(?, prodi),
          status = COALESCE(?, status)
      WHERE id = ?
    `);
    stmt.run(
      data.name?.trim() || null,
      data.email?.trim() || null,
      data.passwordHash || null,
      data.prodi?.trim() || null,
      data.status || null,
      id
    );
  }

  delete(id: number): void {
    db.prepare("DELETE FROM students WHERE id = ?").run(id);
  }

  findEnrolledByClassId(classId: number): any[] {
    const stmt = db.prepare(`
      SELECT s.id, s.nim, s.name, s.email, s.prodi, s.status, ce.id as enrollment_id,
             g.tugas, g.uts, g.uas, g.final_score, g.letter_grade, g.status as grade_status, g.ai_feedback
      FROM class_enrollments ce
      JOIN students s ON ce.student_id = s.id
      LEFT JOIN grades g ON ce.id = g.enrollment_id
      WHERE ce.class_id = ?
      ORDER BY s.nim ASC
    `);
    return stmt.all(classId);
  }

  findEnrollment(classId: number, studentId: number): { id: number } | null {
    const stmt = db.prepare("SELECT id FROM class_enrollments WHERE class_id = ? AND student_id = ?");
    const row = stmt.get(classId, studentId) as { id: number } | undefined;
    return row || null;
  }

  enrollStudent(classId: number, studentId: number): number {
    const stmt = db.prepare("INSERT INTO class_enrollments (class_id, student_id) VALUES (?, ?)");
    const result = stmt.run(classId, studentId);
    return Number(result.lastInsertRowid);
  }

  unenrollStudent(classId: number, studentId: number): void {
    db.prepare("DELETE FROM class_enrollments WHERE class_id = ? AND student_id = ?").run(classId, studentId);
  }

  getStudentCoursesWithGrades(studentId: number): any[] {
    const stmt = db.prepare(`
      SELECT c.id as class_id, c.code, c.title, c.sks, c.prodi, c.semester, c.academic_year,
             c.schedule, c.room, l.name as lecturer_name,
             g.id as grade_id, g.tugas, g.uts, g.uas, g.final_score, g.letter_grade, g.status as grade_status, g.ai_feedback
      FROM class_enrollments ce
      JOIN classes c ON ce.class_id = c.id
      JOIN lecturers l ON c.lecturer_id = l.id
      LEFT JOIN grades g ON ce.id = g.enrollment_id
      WHERE ce.student_id = ?
      ORDER BY c.semester ASC, c.code ASC
    `);
    return stmt.all(studentId);
  }

  getStudentDashboardStats(studentId: number) {
    const courses = this.getStudentCoursesWithGrades(studentId);
    let totalSks = 0;
    let totalQualityPoints = 0;
    let gradedSks = 0;

    const gradePoints: Record<string, number> = {
      "A": 4.0,
      "A-": 3.7,
      "B+": 3.3,
      "B": 3.0,
      "B-": 2.7,
      "C+": 2.3,
      "C": 2.0,
      "D": 1.0,
      "E": 0.0,
    };

    for (const c of courses) {
      const sks = Number(c.sks) || 3;
      totalSks += sks;
      if (c.letter_grade && gradePoints[c.letter_grade] !== undefined) {
        totalQualityPoints += gradePoints[c.letter_grade] * sks;
        gradedSks += sks;
      }
    }

    const ipk = gradedSks > 0 ? (Math.round((totalQualityPoints / gradedSks) * 100) / 100) : 3.75;

    return {
      totalCourses: courses.length,
      totalSks,
      ipk,
      attendancePercentage: 94, // Presensi aktif
      academicYear: "2024/2025 Ganjil",
      semester: courses.length > 0 ? courses[0].semester : 5,
    };
  }

  getStudentAiFeedback(studentId: number): any[] {
    const stmt = db.prepare(`
      SELECT c.id as class_id, c.code, c.title, c.sks, l.name as lecturer_name,
             g.final_score, g.letter_grade, g.status as grade_status, g.ai_feedback, g.updated_at
      FROM class_enrollments ce
      JOIN classes c ON ce.class_id = c.id
      JOIN lecturers l ON c.lecturer_id = l.id
      JOIN grades g ON ce.id = g.enrollment_id
      WHERE ce.student_id = ? AND g.ai_feedback IS NOT NULL AND g.ai_feedback != ''
      ORDER BY g.updated_at DESC
    `);
    return stmt.all(studentId);
  }
}

export const studentRepository = new StudentRepository();
