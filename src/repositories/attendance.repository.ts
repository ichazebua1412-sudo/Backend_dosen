import { db } from "../db.js";

export interface LecturerScheduleItem {
  id: number;
  code: string;
  title: string;
  sks: number;
  prodi: string;
  semester: number;
  room: string;
  schedule: string;
  enrolled_count: number;
  is_session_open: boolean;
  active_pertemuan: number | null;
  present_count: number;
}

export class AttendanceRepository {
  getLecturerSchedule(lecturerId: number): LecturerScheduleItem[] {
    const classes = db.prepare(`
      SELECT c.id, c.code, c.title, c.sks, c.prodi, c.semester, c.room, c.schedule,
             COUNT(ce.id) as enrolled_count
      FROM classes c
      LEFT JOIN class_enrollments ce ON c.id = ce.class_id
      WHERE c.lecturer_id = ?
      GROUP BY c.id
      ORDER BY c.id ASC
    `).all(lecturerId) as any[];

    return classes.map((c) => {
      const openSession = db.prepare(`
        SELECT pertemuan
        FROM attendance_sessions
        WHERE class_id = ? AND is_open = 1
        ORDER BY pertemuan DESC LIMIT 1
      `).get(c.id) as { pertemuan: number } | undefined;

      const activePertemuan = openSession ? openSession.pertemuan : null;

      let presentCount = 0;
      if (activePertemuan !== null) {
        const countRow = db.prepare(`
          SELECT COUNT(id) as cnt
          FROM attendances
          WHERE class_id = ? AND pertemuan = ? AND status = 'hadir'
        `).get(c.id, activePertemuan) as { cnt: number } | undefined;
        presentCount = countRow?.cnt || 0;
      }

      return {
        id: c.id,
        code: c.code,
        title: c.title,
        sks: c.sks,
        prodi: c.prodi,
        semester: c.semester,
        room: c.room || "Ruang Teori",
        schedule: c.schedule || "",
        enrolled_count: c.enrolled_count || 0,
        is_session_open: !!openSession,
        active_pertemuan: activePertemuan,
        present_count: presentCount,
      };
    });
  }

  toggleSession(classId: number, pertemuan: number, isOpen: boolean) {
    if (isOpen) {
      // Tutup sesi lain yang mungkin masih terbuka pada kelas yang sama
      db.prepare(`
        UPDATE attendance_sessions
        SET is_open = 0, closed_at = CURRENT_TIMESTAMP
        WHERE class_id = ? AND pertemuan != ? AND is_open = 1
      `).run(classId, pertemuan);
    }

    const existing = db.prepare(`
      SELECT id FROM attendance_sessions
      WHERE class_id = ? AND pertemuan = ?
    `).get(classId, pertemuan) as { id: number } | undefined;

    if (existing) {
      if (isOpen) {
        db.prepare(`
          UPDATE attendance_sessions
          SET is_open = 1, opened_at = CURRENT_TIMESTAMP, closed_at = NULL, date = DATE('now')
          WHERE id = ?
        `).run(existing.id);
      } else {
        db.prepare(`
          UPDATE attendance_sessions
          SET is_open = 0, closed_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `).run(existing.id);
      }
    } else {
      db.prepare(`
        INSERT INTO attendance_sessions (class_id, pertemuan, is_open, opened_at, closed_at, date)
        VALUES (?, ?, ?, ?, ?, DATE('now'))
      `).run(
        classId,
        pertemuan,
        isOpen ? 1 : 0,
        isOpen ? new Date().toISOString() : null,
        isOpen ? null : new Date().toISOString()
      );
    }

    return db.prepare(`
      SELECT id, class_id, pertemuan, is_open, opened_at, closed_at, date
      FROM attendance_sessions
      WHERE class_id = ? AND pertemuan = ?
    `).get(classId, pertemuan) as any;
  }

  getClassAttendanceDetail(classId: number, requestedPertemuan?: number) {
    const classInfo = db.prepare(`
      SELECT c.id, c.code, c.title, c.sks, c.prodi, c.semester, c.room, c.schedule,
             COUNT(ce.id) as enrolled_count
      FROM classes c
      LEFT JOIN class_enrollments ce ON c.id = ce.class_id
      WHERE c.id = ?
      GROUP BY c.id
    `).get(classId) as any;

    if (!classInfo) return null;

    // Tentukan pertemuan aktif jika tidak diminta secara spesifik
    let targetPertemuan = requestedPertemuan;
    if (!targetPertemuan) {
      const openSession = db.prepare(`
        SELECT pertemuan FROM attendance_sessions
        WHERE class_id = ? AND is_open = 1
        ORDER BY pertemuan DESC LIMIT 1
      `).get(classId) as { pertemuan: number } | undefined;

      if (openSession) {
        targetPertemuan = openSession.pertemuan;
      } else {
        const latestSession = db.prepare(`
          SELECT MAX(pertemuan) as max_p FROM (
            SELECT pertemuan FROM attendance_sessions WHERE class_id = ?
            UNION ALL
            SELECT pertemuan FROM attendances WHERE class_id = ?
          )
        `).get(classId, classId) as { max_p: number | null } | undefined;
        targetPertemuan = latestSession?.max_p || 1;
      }
    }

    const sessionRow = db.prepare(`
      SELECT id, class_id, pertemuan, is_open, opened_at, closed_at, date
      FROM attendance_sessions
      WHERE class_id = ? AND pertemuan = ?
    `).get(classId, targetPertemuan) as any;

    const students = db.prepare(`
      SELECT
        s.id as student_id,
        s.nim,
        s.name,
        s.email,
        s.prodi,
        a.id as attendance_id,
        a.status,
        a.notes,
        a.attachment_url,
        a.alasan_koreksi,
        a.audit_dosen,
        a.date,
        a.created_at,
        a.updated_at
      FROM class_enrollments ce
      JOIN students s ON ce.student_id = s.id
      LEFT JOIN attendances a
        ON a.class_id = ce.class_id
        AND a.student_id = ce.student_id
        AND a.pertemuan = ?
      WHERE ce.class_id = ?
      ORDER BY s.nim ASC
    `).all(targetPertemuan, classId) as any[];

    const normalizedStudents = students.map((row) => ({
      student_id: row.student_id,
      nim: row.nim,
      name: row.name,
      email: row.email,
      prodi: row.prodi,
      attendance_id: row.attendance_id || null,
      status: row.status || "belum",
      notes: row.notes || "",
      attachment_url: row.attachment_url || "",
      alasan_koreksi: row.alasan_koreksi || "",
      audit_dosen: Boolean(row.audit_dosen),
      date: row.date || null,
      created_at: row.created_at || null,
      updated_at: row.updated_at || null,
    }));

    const stats = {
      total: normalizedStudents.length,
      hadir: normalizedStudents.filter((s) => s.status === "hadir").length,
      izin: normalizedStudents.filter((s) => s.status === "izin").length,
      sakit: normalizedStudents.filter((s) => s.status === "sakit").length,
      alpa: normalizedStudents.filter((s) => s.status === "alpa").length,
      belum: normalizedStudents.filter((s) => s.status === "belum").length,
    };

    return {
      class: classInfo,
      session: {
        pertemuan: targetPertemuan,
        is_open: sessionRow ? Boolean(sessionRow.is_open) : false,
        opened_at: sessionRow?.opened_at || null,
        closed_at: sessionRow?.closed_at || null,
        date: sessionRow?.date || new Date().toISOString().slice(0, 10),
      },
      stats,
      students: normalizedStudents,
    };
  }

  correctStudentAttendance(
    classId: number,
    studentId: number,
    pertemuan: number,
    status: "hadir" | "izin" | "sakit" | "alpa",
    alasanKoreksi: string
  ) {
    const existing = db.prepare(`
      SELECT id FROM attendances
      WHERE class_id = ? AND student_id = ? AND pertemuan = ?
    `).get(classId, studentId, pertemuan) as { id: number } | undefined;

    if (existing) {
      db.prepare(`
        UPDATE attendances
        SET status = ?, alasan_koreksi = ?, audit_dosen = 1, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(status, alasanKoreksi.trim(), existing.id);

      return db.prepare(`
        SELECT id, class_id, student_id, pertemuan, status, notes, attachment_url, alasan_koreksi, audit_dosen, date, created_at, updated_at
        FROM attendances WHERE id = ?
      `).get(existing.id) as any;
    }

    const info = db.prepare(`
      INSERT INTO attendances (class_id, student_id, pertemuan, status, notes, alasan_koreksi, audit_dosen, date)
      VALUES (?, ?, ?, ?, ?, ?, 1, DATE('now'))
    `).run(classId, studentId, pertemuan, status, "Koreksi Dosen", alasanKoreksi.trim());

    return db.prepare(`
      SELECT id, class_id, student_id, pertemuan, status, notes, attachment_url, alasan_koreksi, audit_dosen, date, created_at, updated_at
      FROM attendances WHERE id = ?
    `).get(Number(info.lastInsertRowid)) as any;
  }
}

export const attendanceRepository = new AttendanceRepository();

