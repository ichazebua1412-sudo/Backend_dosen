import { db } from "../db.js";

export interface LecturerRecord {
  id: number;
  nidn: string;
  email: string;
  password_hash: string;
  name: string;
  title_prefix: string;
  title_suffix: string;
  phone: string;
  office_room: string;
  consult_hours: string;
  status: string;
  notif_achievement: number;
  notif_deadline: number;
  created_at: string;
}

export class LecturerRepository {
  findByNidnOrEmail(identifier: string): LecturerRecord | null {
    const stmt = db.prepare(`
      SELECT id, nidn, email, password_hash, name, title_prefix, title_suffix, phone, office_room, consult_hours, status, notif_achievement, notif_deadline, created_at
      FROM lecturers
      WHERE nidn = ? OR email = ?
    `);
    const row = stmt.get(identifier.trim(), identifier.trim()) as LecturerRecord | undefined;
    return row || null;
  }

  findById(id: number): LecturerRecord | null {
    const stmt = db.prepare(`
      SELECT id, nidn, email, password_hash, name, title_prefix, title_suffix, phone, office_room, consult_hours, status, notif_achievement, notif_deadline, created_at
      FROM lecturers
      WHERE id = ?
    `);
    const row = stmt.get(id) as LecturerRecord | undefined;
    return row || null;
  }

  findAll(): any[] {
    const stmt = db.prepare(`
      SELECT l.id, l.nidn, l.email, l.name, l.title_prefix, l.title_suffix, l.phone,
             l.office_room, l.consult_hours, l.status, l.created_at,
             COUNT(c.id) as class_count
      FROM lecturers l
      LEFT JOIN classes c ON l.id = c.lecturer_id
      GROUP BY l.id
      ORDER BY l.name ASC
    `);
    return stmt.all();
  }

  checkDuplicate(nidn: string, email: string, excludeId?: number): LecturerRecord | null {
    if (excludeId) {
      const stmt = db.prepare(`
        SELECT id FROM lecturers WHERE (nidn = ? OR email = ?) AND id != ?
      `);
      return (stmt.get(nidn.trim(), email.trim(), excludeId) as LecturerRecord) || null;
    }
    const stmt = db.prepare(`
      SELECT id FROM lecturers WHERE nidn = ? OR email = ?
    `);
    return (stmt.get(nidn.trim(), email.trim()) as LecturerRecord) || null;
  }

  create(data: {
    nidn: string;
    email: string;
    passwordHash: string;
    name: string;
    titlePrefix?: string;
    titleSuffix?: string;
    phone?: string;
    officeRoom?: string;
    consultHours?: string;
  }): number {
    const stmt = db.prepare(`
      INSERT INTO lecturers (nidn, email, password_hash, name, title_prefix, title_suffix, phone, office_room, consult_hours, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'active')
    `);
    const result = stmt.run(
      data.nidn.trim(),
      data.email.trim(),
      data.passwordHash,
      data.name.trim(),
      data.titlePrefix?.trim() || "",
      data.titleSuffix?.trim() || "",
      data.phone?.trim() || "",
      data.officeRoom?.trim() || "",
      data.consultHours?.trim() || ""
    );
    return Number(result.lastInsertRowid);
  }

  update(id: number, data: {
    name?: string;
    titlePrefix?: string;
    titleSuffix?: string;
    phone?: string;
    officeRoom?: string;
    consultHours?: string;
    notifAchievement?: number | null;
    notifDeadline?: number | null;
  }): void {
    const stmt = db.prepare(`
      UPDATE lecturers
      SET name = COALESCE(?, name),
          title_prefix = COALESCE(?, title_prefix),
          title_suffix = COALESCE(?, title_suffix),
          phone = COALESCE(?, phone),
          office_room = COALESCE(?, office_room),
          consult_hours = COALESCE(?, consult_hours),
          notif_achievement = COALESCE(?, notif_achievement),
          notif_deadline = COALESCE(?, notif_deadline)
      WHERE id = ?
    `);
    stmt.run(
      data.name?.trim() || null,
      data.titlePrefix?.trim() || null,
      data.titleSuffix?.trim() || null,
      data.phone?.trim() || null,
      data.officeRoom?.trim() || null,
      data.consultHours?.trim() || null,
      data.notifAchievement !== undefined ? data.notifAchievement : null,
      data.notifDeadline !== undefined ? data.notifDeadline : null,
      id
    );
  }

  updateAdminFields(id: number, data: {
    nidn?: string;
    email?: string;
    name?: string;
    titlePrefix?: string;
    titleSuffix?: string;
    phone?: string;
    officeRoom?: string;
    consultHours?: string;
    status?: string;
  }): void {
    const stmt = db.prepare(`
      UPDATE lecturers
      SET nidn = COALESCE(?, nidn),
          email = COALESCE(?, email),
          name = COALESCE(?, name),
          title_prefix = COALESCE(?, title_prefix),
          title_suffix = COALESCE(?, title_suffix),
          phone = COALESCE(?, phone),
          office_room = COALESCE(?, office_room),
          consult_hours = COALESCE(?, consult_hours),
          status = COALESCE(?, status)
      WHERE id = ?
    `);
    stmt.run(
      data.nidn?.trim() || null,
      data.email?.trim() || null,
      data.name?.trim() || null,
      data.titlePrefix?.trim() || null,
      data.titleSuffix?.trim() || null,
      data.phone?.trim() || null,
      data.officeRoom?.trim() || null,
      data.consultHours?.trim() || null,
      data.status || null,
      id
    );
  }

  updateStatus(id: number, status: string): void {
    db.prepare("UPDATE lecturers SET status = ? WHERE id = ?").run(status, id);
  }

  updatePassword(id: number, passwordHash: string): void {
    db.prepare("UPDATE lecturers SET password_hash = ? WHERE id = ?").run(passwordHash, id);
  }

  delete(id: number): void {
    db.prepare("DELETE FROM lecturers WHERE id = ?").run(id);
  }

  countByLecturerId(lecturerId: number): number {
    const row = db.prepare("SELECT COUNT(id) as count FROM classes WHERE lecturer_id = ?").get(lecturerId) as any;
    return row?.count || 0;
  }
}

export const lecturerRepository = new LecturerRepository();

