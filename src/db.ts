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
db.exec("PRAGMA journal_mode = WAL;");
db.exec("PRAGMA foreign_keys = ON;");

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

  try {
    const adminCount = (db.prepare("SELECT COUNT(id) as count FROM admins").get() as any)?.count || 0;
    if (adminCount === 0) {
      console.log("🌱 Database kosong terdeteksi. Menjalankan seed data otomatis...");
      runSeed();
      console.log("✅ Seed data berhasil diterapkan.");
    }
  } catch (err: any) {
    console.error("Gagal memeriksa atau menjalankan seed:", err.message);
  }
}
