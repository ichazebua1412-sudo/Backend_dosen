import { DatabaseSync } from "node:sqlite";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

const dbPath = process.env.DATABASE_PATH || path.join(process.cwd(), "gradia.db");
export const db = new DatabaseSync(dbPath);

// Enable WAL mode & foreign keys for high performance & ACID integrity
db.exec("PRAGMA journal_mode = WAL;");
db.exec("PRAGMA foreign_keys = ON;");

export function initDatabase(): void {
  // 1. Lecturers Table
  db.exec(`
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
      notif_achievement INTEGER DEFAULT 1,
      notif_deadline INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // 2. Classes Table
  db.exec(`
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
  `);

  // 3. Students Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS students (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nim TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      prodi TEXT NOT NULL,
      status TEXT DEFAULT 'Aktif'
    );
  `);

  // 4. Class Enrollments Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS class_enrollments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      class_id INTEGER NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
      student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
      UNIQUE(class_id, student_id)
    );
  `);

  // 5. Grades Table
  db.exec(`
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
  `);
}
