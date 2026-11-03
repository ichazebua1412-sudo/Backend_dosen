import { db } from "../db.js";

export interface StudentRecord {
  id: number;
  nim: string;
  name: string;
  email: string;
  prodi: string;
  status: string;
}

export class StudentRepository {
  findByNim(nim: string): StudentRecord | null {
    const stmt = db.prepare(`
      SELECT id, nim, name, email, prodi, status
      FROM students
      WHERE nim = ?
    `);
    const row = stmt.get(nim.trim()) as StudentRecord | undefined;
    return row || null;
  }

  findById(id: number): StudentRecord | null {
    const stmt = db.prepare(`
      SELECT id, nim, name, email, prodi, status
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
    prodi: string;
    status?: string;
  }): number {
    const stmt = db.prepare(`
      INSERT INTO students (nim, name, email, prodi, status)
      VALUES (?, ?, ?, ?, ?)
    `);
    const result = stmt.run(
      data.nim.trim(),
      data.name.trim(),
      data.email.trim(),
      data.prodi.trim(),
      data.status || "Aktif"
    );
    return Number(result.lastInsertRowid);
  }

  upsert(data: {
    nim: string;
    name: string;
    email: string;
    prodi: string;
    status?: string;
  }): number {
    const existing = this.findByNim(data.nim);
    if (existing) {
      db.prepare(`
        UPDATE students
        SET name = COALESCE(?, name),
            email = COALESCE(?, email),
            prodi = COALESCE(?, prodi),
            status = COALESCE(?, status)
        WHERE id = ?
      `).run(
        data.name?.trim() || null,
        data.email?.trim() || null,
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
    prodi?: string;
    status?: string;
  }): void {
    const stmt = db.prepare(`
      UPDATE students
      SET name = COALESCE(?, name),
          email = COALESCE(?, email),
          prodi = COALESCE(?, prodi),
          status = COALESCE(?, status)
      WHERE id = ?
    `);
    stmt.run(
      data.name?.trim() || null,
      data.email?.trim() || null,
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
}

export const studentRepository = new StudentRepository();

