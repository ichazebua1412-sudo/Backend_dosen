-- =====================================================================
-- GRADIA ACADEMIC PORTAL - DATABASE SCHEMA (SQLITE)
-- =====================================================================
-- Seluruh tabel sesuai arsitektur data pada folder Backend/src/routes
-- (auth, admin, lecturer, classes, grades, ai, dashboard)
-- =====================================================================

PRAGMA foreign_keys = ON;
PRAGMA journal_mode = WAL;

-- ---------------------------------------------------------------------
-- 1. TABEL ADMINS (Superadmin & Staf Akademik)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS admins (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    name TEXT NOT NULL,
    role TEXT DEFAULT 'superadmin',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ---------------------------------------------------------------------
-- 2. TABEL LECTURERS (Dosen Pengampu)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS lecturers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nidn TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    name TEXT NOT NULL,
    title_prefix TEXT DEFAULT '',
    title_suffix TEXT DEFAULT '',
    phone TEXT DEFAULT '',
    office_room TEXT DEFAULT '',
    consult_hours TEXT DEFAULT '',
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    notif_achievement INTEGER DEFAULT 1,
    notif_deadline INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ---------------------------------------------------------------------
-- 3. TABEL CLASSES (Mata Kuliah / Kelas Perkuliahan)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS classes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    lecturer_id INTEGER NOT NULL REFERENCES lecturers(id) ON DELETE CASCADE,
    code TEXT NOT NULL,
    title TEXT NOT NULL,
    sks INTEGER NOT NULL DEFAULT 3,
    prodi TEXT NOT NULL,
    semester INTEGER NOT NULL DEFAULT 1,
    academic_year TEXT DEFAULT '2024/2025 Ganjil',
    capacity INTEGER DEFAULT 40,
    schedule TEXT DEFAULT '',
    room TEXT DEFAULT '',
    weight_tugas REAL DEFAULT 0.25,
    weight_uts REAL DEFAULT 0.35,
    weight_uas REAL DEFAULT 0.40,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ---------------------------------------------------------------------
-- 4. TABEL STUDENTS (Data Mahasiswa)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS students (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nim TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT DEFAULT '',
    prodi TEXT NOT NULL,
    status TEXT DEFAULT 'Aktif'
);

-- ---------------------------------------------------------------------
-- 5. TABEL CLASS_ENROLLMENTS (Pendaftaran Mahasiswa ke Kelas)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS class_enrollments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    class_id INTEGER NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(class_id, student_id)
);

-- ---------------------------------------------------------------------
-- 6. TABEL GRADES (Komponen Nilai & AI Feedback OBE)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS grades (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    enrollment_id INTEGER UNIQUE NOT NULL REFERENCES class_enrollments(id) ON DELETE CASCADE,
    tugas REAL DEFAULT NULL,
    uts REAL DEFAULT NULL,
    uas REAL DEFAULT NULL,
    final_score REAL DEFAULT NULL,
    letter_grade TEXT DEFAULT NULL,
    status TEXT DEFAULT 'Belum lengkap',
    ai_feedback TEXT DEFAULT NULL,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ---------------------------------------------------------------------
-- 7. TABEL PASSWORD_RESET_TOKENS (Token Reset Sandi Dosen Sekali Pakai)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    lecturer_id INTEGER NOT NULL REFERENCES lecturers(id) ON DELETE CASCADE,
    token_hash TEXT UNIQUE NOT NULL,
    expires_at DATETIME NOT NULL,
    used_at DATETIME DEFAULT NULL,
    requested_by TEXT NOT NULL DEFAULT 'self' CHECK (requested_by IN ('self', 'admin')),
    created_by_admin_id INTEGER REFERENCES admins(id) ON DELETE SET NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ---------------------------------------------------------------------
-- 8. TABEL ATTENDANCES (Presensi Mahasiswa per Pertemuan)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS attendances (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    class_id INTEGER NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    pertemuan INTEGER NOT NULL DEFAULT 1,
    status TEXT NOT NULL CHECK(status IN ('hadir', 'izin', 'sakit', 'alpa')),
    notes TEXT DEFAULT '',
    attachment_url TEXT DEFAULT '',
    date DATE DEFAULT CURRENT_DATE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(class_id, student_id, pertemuan)
);

-- ---------------------------------------------------------------------
-- 9. TABEL ASSIGNMENTS (Tugas Perkuliahan) & SUBMISSIONS
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS assignments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    class_id INTEGER NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT DEFAULT '',
    deadline DATETIME NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS assignment_submissions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    assignment_id INTEGER NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
    student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    file_url TEXT DEFAULT '',
    notes TEXT DEFAULT '',
    submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    status TEXT DEFAULT 'Terkumpul' CHECK(status IN ('Terkumpul', 'Terlambat', 'Dinilai')),
    score REAL DEFAULT NULL,
    UNIQUE(assignment_id, student_id)
);

-- ---------------------------------------------------------------------
-- 10. TABEL NOTIFICATIONS (Pemberitahuan Mahasiswa)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    category TEXT NOT NULL CHECK(category IN ('nilai', 'pengumuman', 'reminder', 'sistem')),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    is_read INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ---------------------------------------------------------------------
-- 11. TABEL GRADE_REVIEWS (Pengajuan Review / Sanggahan Nilai)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS grade_reviews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    class_id INTEGER NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    component TEXT NOT NULL,
    current_score TEXT NOT NULL,
    reason TEXT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'approved', 'rejected')),
    lecturer_response TEXT DEFAULT '',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ---------------------------------------------------------------------
-- INDEXES UNTUK OPTIMASI PERFORMA QUERY
-- ---------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_classes_lecturer ON classes(lecturer_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_class ON class_enrollments(class_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_student ON class_enrollments(student_id);
CREATE INDEX IF NOT EXISTS idx_grades_enrollment ON grades(enrollment_id);
CREATE INDEX IF NOT EXISTS idx_students_nim ON students(nim);
CREATE INDEX IF NOT EXISTS idx_lecturers_nidn ON lecturers(nidn);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_hash ON password_reset_tokens(token_hash);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_lecturer ON password_reset_tokens(lecturer_id);
CREATE INDEX IF NOT EXISTS idx_attendances_student ON attendances(student_id);
CREATE INDEX IF NOT EXISTS idx_attendances_class ON attendances(class_id);
CREATE INDEX IF NOT EXISTS idx_assignments_class ON assignments(class_id);
CREATE INDEX IF NOT EXISTS idx_submissions_student ON assignment_submissions(student_id);
CREATE INDEX IF NOT EXISTS idx_notifications_student ON notifications(student_id);
CREATE INDEX IF NOT EXISTS idx_reviews_student ON grade_reviews(student_id);
>>>>>>> 2ba7734d819f632c1c804a49adf35587781b34a1
