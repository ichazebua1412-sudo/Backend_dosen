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

    // Hitung persentase kehadiran nyata dari tabel attendances
    const attRow = db.prepare(`
      SELECT COUNT(id) as total,
             SUM(CASE WHEN status = 'hadir' THEN 1 ELSE 0 END) as hadir
      FROM attendances
      WHERE student_id = ?
    `).get(studentId) as any;

    const attendancePercentage = (attRow && attRow.total > 0)
      ? Math.round((attRow.hadir / attRow.total) * 100)
      : 92;

    // Hitung status tugas dari tabel assignments
    const taskRows = db.prepare(`
      SELECT
        SUM(CASE WHEN sub.id IS NOT NULL THEN 1 ELSE 0 END) as submitted,
        SUM(CASE WHEN sub.id IS NULL AND a.deadline < DATETIME('now') THEN 1 ELSE 0 END) as overdue,
        SUM(CASE WHEN sub.id IS NULL AND a.deadline >= DATETIME('now') THEN 1 ELSE 0 END) as upcoming
      FROM assignments a
      JOIN class_enrollments ce ON a.class_id = ce.class_id AND ce.student_id = ?
      LEFT JOIN assignment_submissions sub ON a.id = sub.assignment_id AND sub.student_id = ?
    `).get(studentId, studentId) as any;

    const taskStats = {
      terlewat: taskRows?.overdue || 0,
      mendatang: taskRows?.upcoming || 0,
      terkumpul: taskRows?.submitted || 0,
    };

    return {
      totalCourses: courses.length,
      totalSks,
      ipk,
      attendancePercentage,
      taskStats,
      academicYear: "2024/2025 Ganjil",
      semester: courses.length > 0 ? courses[0].semester : 3,
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

  // -------------------------------------------------------------
  // FITUR MOBILE 1: PRESENSI & KEHADIRAN (ATTENDANCES)
  // -------------------------------------------------------------
  getStudentAttendances(studentId: number) {
    const courses = db.prepare(`
      SELECT c.id as class_id, c.code, c.title, c.schedule, c.room
      FROM class_enrollments ce
      JOIN classes c ON ce.class_id = c.id
      WHERE ce.student_id = ?
      ORDER BY c.title ASC
    `).all(studentId) as any[];

    const perCourse = courses.map((c) => {
      const stats = db.prepare(`
        SELECT
          COUNT(id) as total,
          SUM(CASE WHEN status = 'hadir' THEN 1 ELSE 0 END) as hadir,
          SUM(CASE WHEN status = 'izin' THEN 1 ELSE 0 END) as izin,
          SUM(CASE WHEN status = 'sakit' THEN 1 ELSE 0 END) as sakit,
          SUM(CASE WHEN status = 'alpa' THEN 1 ELSE 0 END) as alpa
        FROM attendances
        WHERE student_id = ? AND class_id = ?
      `).get(studentId, c.class_id) as any;

      const total = stats?.total || 0;
      const hadir = stats?.hadir || 0;
      const izin = stats?.izin || 0;
      const sakit = stats?.sakit || 0;
      const alpa = stats?.alpa || 0;
      const persen = total > 0 ? Math.round((hadir / total) * 100) : 100;

      return {
        class_id: c.class_id,
        nama: c.title,
        code: c.code,
        schedule: c.schedule,
        room: c.room,
        total,
        hadir,
        izin,
        sakit,
        alpa,
        persen,
        keterangan: `${hadir} dari ${total} pertemuan dihadiri`,
        dibuka: c.code === "IF202", // Presensi terbuka untuk sesi aktif
      };
    });

    const totalPertemuan = perCourse.reduce((acc, curr) => acc + curr.total, 0);
    const totalHadir = perCourse.reduce((acc, curr) => acc + curr.hadir, 0);
    const totalIzin = perCourse.reduce((acc, curr) => acc + curr.izin, 0);
    const totalSakit = perCourse.reduce((acc, curr) => acc + curr.sakit, 0);
    const totalAlpa = perCourse.reduce((acc, curr) => acc + curr.alpa, 0);
    const overallPercentage = totalPertemuan > 0 ? Math.round((totalHadir / totalPertemuan) * 100) : 100;

    // Ambil detail sesi yang sedang aktif saat ini
    const activeCourse = perCourse.find((c) => c.dibuka) || null;
    let activeSession = null;
    if (activeCourse) {
      const todayAttendance = db.prepare(`
        SELECT status, notes, date FROM attendances
        WHERE student_id = ? AND class_id = ? AND date = DATE('now')
        ORDER BY id DESC LIMIT 1
      `).get(studentId, activeCourse.class_id) as any;

      activeSession = {
        class_id: activeCourse.class_id,
        nama: activeCourse.nama,
        code: activeCourse.code,
        schedule: activeCourse.schedule,
        room: activeCourse.room,
        batas: "Ditutup 10:15",
        sudahAbsen: !!todayAttendance,
        status: todayAttendance ? todayAttendance.status : null,
        notes: todayAttendance ? todayAttendance.notes : null,
      };
    }

    return {
      overallPercentage,
      totalPertemuan,
      totalHadir,
      totalIzin,
      totalSakit,
      totalAlpa,
      activeSession,
      courses: perCourse,
    };
  }

  checkInAttendance(studentId: number, classId: number, type: "Luring" | "Daring" = "Luring") {
    const existing = db.prepare(`
      SELECT id FROM attendances
      WHERE class_id = ? AND student_id = ? AND date = DATE('now')
    `).get(classId, studentId) as any;

    if (existing) {
      db.prepare(`
        UPDATE attendances
        SET status = 'hadir', notes = ?
        WHERE id = ?
      `).run(`Hadir · ${type}`, existing.id);

      return {
        id: existing.id,
        class_id: classId,
        status: "hadir",
        notes: `Hadir · ${type}`,
      };
    }

    const nextRow = db.prepare(`
      SELECT COALESCE(MAX(pertemuan), 0) + 1 as next_p
      FROM attendances
      WHERE class_id = ? AND student_id = ?
    `).get(classId, studentId) as any;

    const pertemuan = nextRow?.next_p || 1;

    const stmt = db.prepare(`
      INSERT INTO attendances (class_id, student_id, pertemuan, status, notes, date)
      VALUES (?, ?, ?, 'hadir', ?, DATE('now'))
    `);
    const info = stmt.run(classId, studentId, pertemuan, `Hadir · ${type}`);

    return {
      id: Number(info.lastInsertRowid),
      class_id: classId,
      pertemuan,
      status: "hadir",
      notes: `Hadir · ${type}`,
    };
  }

  applyLeave(studentId: number, classId: number, status: "izin" | "sakit", reason: string, attachmentUrl?: string) {
    const existing = db.prepare(`
      SELECT id FROM attendances
      WHERE class_id = ? AND student_id = ? AND date = DATE('now')
    `).get(classId, studentId) as any;

    if (existing) {
      db.prepare(`
        UPDATE attendances
        SET status = ?, notes = ?, attachment_url = ?
        WHERE id = ?
      `).run(status, reason.trim(), attachmentUrl?.trim() || "", existing.id);

      return {
        id: existing.id,
        class_id: classId,
        status,
        reason,
        attachmentUrl,
      };
    }

    const nextRow = db.prepare(`
      SELECT COALESCE(MAX(pertemuan), 0) + 1 as next_p
      FROM attendances
      WHERE class_id = ? AND student_id = ?
    `).get(classId, studentId) as any;

    const pertemuan = nextRow?.next_p || 1;

    const stmt = db.prepare(`
      INSERT INTO attendances (class_id, student_id, pertemuan, status, notes, attachment_url, date)
      VALUES (?, ?, ?, ?, ?, ?, DATE('now'))
    `);
    const info = stmt.run(classId, studentId, pertemuan, status, reason.trim(), attachmentUrl?.trim() || "");

    return {
      id: Number(info.lastInsertRowid),
      class_id: classId,
      pertemuan,
      status,
      reason,
      attachmentUrl,
    };
  }

  // -------------------------------------------------------------
  // FITUR MOBILE 2: TUGAS KULIAH (ASSIGNMENTS)
  // -------------------------------------------------------------
  getStudentAssignments(studentId: number, filter?: string) {
    const stmt = db.prepare(`
      SELECT a.id, a.class_id, a.title, a.description, a.deadline,
             c.title as course, c.code as course_code,
             sub.id as submission_id, sub.file_url, sub.notes, sub.submitted_at, sub.score,
             CASE
               WHEN sub.id IS NOT NULL THEN 'Terkumpul'
               WHEN a.deadline < DATETIME('now') THEN 'Terlewat'
               ELSE 'To-Do'
             END as status
      FROM assignments a
      JOIN classes c ON a.class_id = c.id
      JOIN class_enrollments ce ON c.id = ce.class_id AND ce.student_id = ?
      LEFT JOIN assignment_submissions sub ON a.id = sub.assignment_id AND sub.student_id = ?
      ORDER BY a.deadline ASC
    `);

    let items = stmt.all(studentId, studentId) as any[];

    const counts = {
      todo: items.filter((i) => i.status === "To-Do").length,
      terkumpul: items.filter((i) => i.status === "Terkumpul").length,
      terlewat: items.filter((i) => i.status === "Terlewat").length,
    };

    if (filter && ["To-Do", "Terkumpul", "Terlewat"].includes(filter)) {
      items = items.filter((i) => i.status === filter);
    }

    return {
      counts,
      assignments: items,
    };
  }

  submitAssignment(studentId: number, assignmentId: number, fileUrl?: string, notes?: string) {
    const stmt = db.prepare(`
      INSERT INTO assignment_submissions (assignment_id, student_id, file_url, notes, status, submitted_at)
      VALUES (?, ?, ?, ?, 'Terkumpul', CURRENT_TIMESTAMP)
      ON CONFLICT(assignment_id, student_id) DO UPDATE SET
        file_url = excluded.file_url,
        notes = excluded.notes,
        submitted_at = CURRENT_TIMESTAMP,
        status = 'Terkumpul'
    `);
    stmt.run(assignmentId, studentId, fileUrl || "", notes || "");

    return { success: true, message: "Tugas berhasil dikumpulkan." };
  }

  // -------------------------------------------------------------
  // FITUR MOBILE 3: NOTIFIKASI MAHASISWA (NOTIFICATIONS)
  // -------------------------------------------------------------
  getStudentNotifications(studentId: number, category?: string) {
    let query = `
      SELECT id, category, title, message, is_read, created_at
      FROM notifications
      WHERE student_id = ?
    `;
    const params: any[] = [studentId];

    if (category && category !== "all" && ["nilai", "pengumuman", "reminder", "sistem"].includes(category)) {
      query += ` AND category = ?`;
      params.push(category);
    }

    query += ` ORDER BY created_at DESC`;

    const notifications = db.prepare(query).all(...params) as any[];
    const unreadCount = (db.prepare(`
      SELECT COUNT(id) as count FROM notifications WHERE student_id = ? AND is_read = 0
    `).get(studentId) as any)?.count || 0;

    return {
      unreadCount,
      notifications,
    };
  }

  markNotificationRead(studentId: number, notificationId: number) {
    db.prepare(`
      UPDATE notifications SET is_read = 1 WHERE id = ? AND student_id = ?
    `).run(notificationId, studentId);
    return { success: true };
  }

  markAllNotificationsRead(studentId: number) {
    db.prepare(`
      UPDATE notifications SET is_read = 1 WHERE student_id = ?
    `).run(studentId);
    return { success: true };
  }

  // -------------------------------------------------------------
  // FITUR MOBILE 4: REVIEW / SANGGAHAN NILAI (GRADE REVIEWS)
  // -------------------------------------------------------------
  getStudentGradeReviews(studentId: number) {
    const stmt = db.prepare(`
      SELECT gr.id, gr.class_id, gr.component, gr.current_score, gr.reason, gr.status, gr.lecturer_response, gr.created_at,
             c.title as class_title, c.code as class_code, l.name as lecturer_name
      FROM grade_reviews gr
      JOIN classes c ON gr.class_id = c.id
      JOIN lecturers l ON c.lecturer_id = l.id
      WHERE gr.student_id = ?
      ORDER BY gr.created_at DESC
    `);
    return stmt.all(studentId);
  }

  createGradeReview(studentId: number, data: { classId: number; component: string; currentScore: string; reason: string }) {
    const stmt = db.prepare(`
      INSERT INTO grade_reviews (student_id, class_id, component, current_score, reason, status)
      VALUES (?, ?, ?, ?, ?, 'pending')
    `);
    const info = stmt.run(studentId, data.classId, data.component.trim(), data.currentScore.trim(), data.reason.trim());

    return {
      id: Number(info.lastInsertRowid),
      class_id: data.classId,
      component: data.component,
      current_score: data.currentScore,
      status: "pending",
      message: "Permintaan koreksi nilai berhasil dikirim ke dosen pengampu.",
    };
  }
}

export const studentRepository = new StudentRepository();
