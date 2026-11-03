import { db } from "../db.js";

export interface ClassRecord {
  id: number;
  lecturer_id: number;
  code: string;
  title: string;
  sks: number;
  prodi: string;
  semester: number;
  academic_year: string;
  capacity: number;
  schedule: string;
  room: string;
  created_at: string;
}

export class ClassRepository {
  findAllByLecturerId(lecturerId: number): any[] {
    const stmt = db.prepare(`
      SELECT c.id, c.code, c.title, c.sks, c.prodi, c.semester, c.academic_year, c.capacity, c.schedule, c.room,
             COUNT(ce.id) as enrolled_count
      FROM classes c
      LEFT JOIN class_enrollments ce ON c.id = ce.class_id
      WHERE c.lecturer_id = ?
      GROUP BY c.id
      ORDER BY c.id DESC
    `);
    return stmt.all(lecturerId);
  }

  findByIdAndLecturerId(classId: number, lecturerId: number): ClassRecord | null {
    const stmt = db.prepare(`
      SELECT id, lecturer_id, code, title, sks, prodi, semester, academic_year, capacity, schedule, room, created_at
      FROM classes
      WHERE id = ? AND lecturer_id = ?
    `);
    const row = stmt.get(classId, lecturerId) as ClassRecord | undefined;
    return row || null;
  }

  findById(classId: number): ClassRecord | null {
    const stmt = db.prepare(`
      SELECT id, lecturer_id, code, title, sks, prodi, semester, academic_year, capacity, schedule, room, created_at
      FROM classes
      WHERE id = ?
    `);
    const row = stmt.get(classId) as ClassRecord | undefined;
    return row || null;
  }

  findAllWithLecturer(search?: string): any[] {
    let query = `
      SELECT c.id, c.code, c.title, c.sks, c.prodi, c.semester, c.academic_year, c.capacity, c.schedule, c.room,
             l.name as lecturer_name, l.nidn as lecturer_nidn,
             COUNT(ce.id) as enrolled_count
      FROM classes c
      JOIN lecturers l ON c.lecturer_id = l.id
      LEFT JOIN class_enrollments ce ON c.id = ce.class_id
    `;
    const params: any[] = [];
    if (search && search.trim()) {
      query += ` WHERE c.title LIKE ? OR c.code LIKE ? OR l.name LIKE ? `;
      const term = `%${search.trim()}%`;
      params.push(term, term, term);
    }
    query += ` GROUP BY c.id ORDER BY c.id DESC `;
    return db.prepare(query).all(...params);
  }

  create(data: {
    lecturerId: number;
    code: string;
    title: string;
    sks: number;
    prodi: string;
    semester: number;
    capacity: number;
    schedule: string;
    room: string;
  }): number {
    const stmt = db.prepare(`
      INSERT INTO classes (lecturer_id, code, title, sks, prodi, semester, capacity, schedule, room)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const result = stmt.run(
      data.lecturerId,
      data.code.trim(),
      data.title.trim(),
      data.sks,
      data.prodi.trim(),
      data.semester,
      data.capacity,
      data.schedule.trim(),
      data.room.trim()
    );
    return Number(result.lastInsertRowid);
  }

  update(classId: number, lecturerId: number, data: {
    code?: string;
    title?: string;
    sks?: number;
    prodi?: string;
    semester?: number;
    capacity?: number;
    schedule?: string;
    room?: string;
  }): void {
    const stmt = db.prepare(`
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
    `);
    stmt.run(
      data.code?.trim() || null,
      data.title?.trim() || null,
      data.sks !== undefined ? data.sks : null,
      data.prodi?.trim() || null,
      data.semester !== undefined ? data.semester : null,
      data.capacity !== undefined ? data.capacity : null,
      data.schedule?.trim() || null,
      data.room?.trim() || null,
      classId,
      lecturerId
    );
  }

  delete(classId: number, lecturerId: number): void {
    db.prepare("DELETE FROM classes WHERE id = ? AND lecturer_id = ?").run(classId, lecturerId);
  }
}

export const classRepository = new ClassRepository();

