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
  weight_tugas?: number;
  weight_uts?: number;
  weight_uas?: number;
  created_at: string;
}

export class ClassRepository {
  findAllByLecturerId(lecturerId: number): any[] {
    const stmt = db.prepare(`
      SELECT c.id, c.code, c.title, c.sks, c.prodi, c.semester, c.academic_year, c.capacity, c.schedule, c.room,
             c.weight_tugas, c.weight_uts, c.weight_uas,
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
      SELECT id, lecturer_id, code, title, sks, prodi, semester, academic_year, capacity, schedule, room,
             weight_tugas, weight_uts, weight_uas, created_at
      FROM classes
      WHERE id = ? AND lecturer_id = ?
    `);
    const row = stmt.get(classId, lecturerId) as ClassRecord | undefined;
    return row || null;
  }

  findById(classId: number): ClassRecord | null {
    const stmt = db.prepare(`
      SELECT id, lecturer_id, code, title, sks, prodi, semester, academic_year, capacity, schedule, room,
             weight_tugas, weight_uts, weight_uas, created_at
      FROM classes
      WHERE id = ?
    `);
    const row = stmt.get(classId) as ClassRecord | undefined;
    return row || null;
  }

  findAllWithLecturer(search?: string, lecturerId?: number): any[] {
    let query = `
      SELECT c.id, c.code, c.title, c.sks, c.prodi, c.semester, c.academic_year, c.capacity, c.schedule, c.room,
             c.lecturer_id,
             l.name as lecturer_name, l.nidn as lecturer_nidn,
             l.title_prefix as lecturer_title_prefix, l.title_suffix as lecturer_title_suffix,
             COUNT(ce.id) as enrolled_count
      FROM classes c
      JOIN lecturers l ON c.lecturer_id = l.id
      LEFT JOIN class_enrollments ce ON c.id = ce.class_id
    `;
    const params: any[] = [];
    const whereClauses: string[] = [];

    if (lecturerId !== undefined) {
      whereClauses.push(`c.lecturer_id = ?`);
      params.push(lecturerId);
    }

    if (search && search.trim()) {
      whereClauses.push(`(c.title LIKE ? OR c.code LIKE ? OR l.name LIKE ? OR l.nidn LIKE ?)`);
      const term = `%${search.trim()}%`;
      params.push(term, term, term, term);
    }

    if (whereClauses.length > 0) {
      query += ` WHERE ${whereClauses.join(" AND ")} `;
    }

    query += ` GROUP BY c.id ORDER BY c.id DESC `;
    const rows = db.prepare(query).all(...params) as any[];
    return rows.map((r) => {
      const prefix = r.lecturer_title_prefix ? `${r.lecturer_title_prefix.trim()} ` : "";
      const suffix = r.lecturer_title_suffix ? `, ${r.lecturer_title_suffix.trim()}` : "";
      const lecturerFullName = `${prefix}${r.lecturer_name || ""}${suffix}`.trim() || r.lecturer_name || "";
      return {
        ...r,
        lecturerFullName,
      };
    });
  }

  create(data: {
    lecturerId: number;
    code: string;
    title: string;
    sks: number;
    prodi: string;
    semester: number;
    academicYear?: string;
    capacity: number;
    schedule: string;
    room: string;
  }): number {
    const stmt = db.prepare(`
      INSERT INTO classes (lecturer_id, code, title, sks, prodi, semester, academic_year, capacity, schedule, room)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const result = stmt.run(
      data.lecturerId,
      data.code.trim(),
      data.title.trim(),
      data.sks,
      data.prodi.trim(),
      data.semester,
      data.academicYear ? data.academicYear.trim() : "2024/2025 Ganjil",
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

  adminUpdate(classId: number, data: {
    lecturerId?: number;
    code?: string;
    title?: string;
    sks?: number;
    prodi?: string;
    semester?: number;
    academicYear?: string;
    capacity?: number;
    schedule?: string;
    room?: string;
  }): void {
    const stmt = db.prepare(`
      UPDATE classes
      SET lecturer_id = COALESCE(?, lecturer_id),
          code = COALESCE(?, code),
          title = COALESCE(?, title),
          sks = COALESCE(?, sks),
          prodi = COALESCE(?, prodi),
          semester = COALESCE(?, semester),
          academic_year = COALESCE(?, academic_year),
          capacity = COALESCE(?, capacity),
          schedule = COALESCE(?, schedule),
          room = COALESCE(?, room)
      WHERE id = ?
    `);
    stmt.run(
      data.lecturerId !== undefined ? data.lecturerId : null,
      data.code?.trim() || null,
      data.title?.trim() || null,
      data.sks !== undefined ? data.sks : null,
      data.prodi?.trim() || null,
      data.semester !== undefined ? data.semester : null,
      data.academicYear?.trim() || null,
      data.capacity !== undefined ? data.capacity : null,
      data.schedule?.trim() || null,
      data.room?.trim() || null,
      classId
    );
  }

  updateWeights(classId: number, weights: { tugas: number; uts: number; uas: number }): void {
    const stmt = db.prepare(`
      UPDATE classes
      SET weight_tugas = ?,
          weight_uts = ?,
          weight_uas = ?
      WHERE id = ?
    `);
    stmt.run(weights.tugas, weights.uts, weights.uas, classId);
  }

  delete(classId: number, lecturerId: number): void {
    db.prepare("DELETE FROM classes WHERE id = ? AND lecturer_id = ?").run(classId, lecturerId);
  }

  adminDelete(classId: number): void {
    db.prepare("DELETE FROM classes WHERE id = ?").run(classId);
  }
}

export const classRepository = new ClassRepository();

