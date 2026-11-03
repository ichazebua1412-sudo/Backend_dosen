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
-- INDEXES UNTUK OPTIMASI PERFORMA QUERY
-- ---------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_classes_lecturer ON classes(lecturer_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_class ON class_enrollments(class_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_student ON class_enrollments(student_id);
CREATE INDEX IF NOT EXISTS idx_grades_enrollment ON grades(enrollment_id);
CREATE INDEX IF NOT EXISTS idx_students_nim ON students(nim);
CREATE INDEX IF NOT EXISTS idx_lecturers_nidn ON lecturers(nidn);
