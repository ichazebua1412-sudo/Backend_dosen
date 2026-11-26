import { DatabaseSync } from "node:sqlite";
import path from "path";
import fs from "fs";
import dotenv from "dotenv";

const currentFileDir = typeof __dirname !== "undefined" ? __dirname : process.cwd();
// currentFileDir berada di Backend/src atau Backend/dist -> parentnya adalah Backend/
const backendRootDir = path.resolve(currentFileDir, "..");

// Load .env
const envFile = path.resolve(backendRootDir, ".env");
if (fs.existsSync(envFile)) {
  dotenv.config({ path: envFile });
} else {
  dotenv.config();
}

function resolveDbPath(): string {
  if (process.env.DATABASE_PATH) {
    if (path.isAbsolute(process.env.DATABASE_PATH)) return process.env.DATABASE_PATH;
    return path.resolve(backendRootDir, process.env.DATABASE_PATH);
  }
  return path.resolve(backendRootDir, "gradia.db");
}

const dbPath = resolveDbPath();
export const db = new DatabaseSync(dbPath);

// Enable WAL mode & foreign keys for high performance & ACID integrity
try {
  db.exec("PRAGMA busy_timeout = 5000;");
  db.exec("PRAGMA journal_mode = WAL;");
  db.exec("PRAGMA foreign_keys = ON;");
} catch (e) {
  console.warn("Notice setting SQLite PRAGMA:", e);
}

/**
 * Temukan path ke file SQL di folder database/
 */
function getDatabaseFilePath(filename: string): string {
  const directPath = path.resolve(backendRootDir, "database", filename);
  if (fs.existsSync(directPath)) return directPath;

  const cwdPath = path.resolve(process.cwd(), "database", filename);
  if (fs.existsSync(cwdPath)) return cwdPath;

  return directPath;
}

/**
 * Jalankan file schema.sql untuk membuat seluruh struktur tabel & index
 */
export function runSchema(): void {
  const schemaPath = getDatabaseFilePath("schema.sql");
  if (fs.existsSync(schemaPath)) {
    const schemaSql = fs.readFileSync(schemaPath, "utf-8");
    db.exec(schemaSql);
  } else {
    console.warn("⚠️ Warning: File schema.sql tidak ditemukan di", schemaPath);
  }
}

/**
 * Jalankan file seed.sql untuk mengisi data awal / dummy
 */
export function runSeed(): void {
  const seedPath = getDatabaseFilePath("seed.sql");
  if (fs.existsSync(seedPath)) {
    const seedSql = fs.readFileSync(seedPath, "utf-8");
    db.exec(seedSql);
  } else {
    console.warn("⚠️ Warning: File seed.sql tidak ditemukan di", seedPath);
  }
}

/**
 * Inisialisasi database: jalankan schema dan jika tabel admin kosong, isi data seed otomatis.
 */
export function initDatabase(): void {
  runSchema();

  // Migration check: pastikan kolom password_hash ada di tabel students
  try {
    const tableInfo = db.prepare("PRAGMA table_info(students)").all() as any[];
    const hasPassword = tableInfo.some((col: any) => col.name === "password_hash");
    if (!hasPassword) {
      db.exec("ALTER TABLE students ADD COLUMN password_hash TEXT DEFAULT '';");
      console.log("Migrasi skema: kolom students.password_hash berhasil ditambahkan.");
    }
  } catch (err: any) {
    console.error("Gagal memeriksa atau migrasi kolom students.password_hash:", err.message);
  }

  // Migration check: pastikan kolom weight_tugas, weight_uts, weight_uas ada di tabel classes
  try {
    const classInfo = db.prepare("PRAGMA table_info(classes)").all() as any[];
    const classCols = classInfo.map((col: any) => col.name);
    if (!classCols.includes("weight_tugas")) {
      db.exec("ALTER TABLE classes ADD COLUMN weight_tugas REAL DEFAULT 0.25;");
    }
    if (!classCols.includes("weight_uts")) {
      db.exec("ALTER TABLE classes ADD COLUMN weight_uts REAL DEFAULT 0.35;");
    }
    if (!classCols.includes("weight_uas")) {
      db.exec("ALTER TABLE classes ADD COLUMN weight_uas REAL DEFAULT 0.40;");
    }
  } catch (err: any) {
    console.error("Gagal memeriksa atau migrasi kolom bobot classes:", err.message);
  }

  try {
    const adminCount = (db.prepare("SELECT COUNT(id) as count FROM admins").get() as any)?.count || 0;
    if (adminCount === 0) {
      console.log("🌱 Database kosong terdeteksi. Menjalankan seed data otomatis...");
      runSeed();
      console.log("✅ Seed data berhasil diterapkan.");
    }

    const underfilled = db
      .prepare(
        `SELECT COUNT(*) as count FROM (
           SELECT c.id, COUNT(ce.id) as enrolled_count
           FROM classes c
           LEFT JOIN class_enrollments ce ON c.id = ce.class_id
           GROUP BY c.id
           HAVING enrolled_count < 30
         )`
      )
      .get() as any;

    if (underfilled && underfilled.count > 0) {
      import("./scripts/seed-30-students.js")
        .then(({ seedClassesWithMin30Students }) => {
          seedClassesWithMin30Students();
        })
        .catch((err) => {
          console.error("Gagal menjalankan seed minimal 30 mahasiswa:", err.message);
        });
    }
  } catch (err: any) {
    console.error("Gagal memeriksa atau menjalankan seed:", err.message);
  }
}
