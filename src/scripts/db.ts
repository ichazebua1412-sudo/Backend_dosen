import { runSchema, runSeed, db } from "../db.js";
import fs from "fs";
import path from "path";

const action = process.argv[2] || "init";

switch (action) {
  case "init":
  case "migrate":
    console.log("⚡ Menjalankan schema migrasi database...");
    runSchema();
    console.log("✅ Schema database berhasil diterapkan.");
    break;

  case "seed":
    console.log("🌱 Menjalankan data seeding...");
    runSeed();
    console.log("✅ Data seed berhasil diterapkan.");
    break;

  case "reset":
    console.log("⚠️ Melakukan reset database...");
    try {
      db.exec("PRAGMA foreign_keys = OFF;");
      const dbPath = process.env.DATABASE_PATH || path.join(process.cwd(), "gradia.db");
      // Drop all tables
      const tables = [
        "grade_reviews",
        "grade_appeals",
        "notifications",
        "assignment_submissions",
        "assignments",
        "attendances",
        "attendance_sessions",
        "grades",
        "class_enrollments",
        "classes",
        "students",
        "lecturers",
        "admins",
      ];
      for (const t of tables) {
        db.exec(`DROP TABLE IF EXISTS ${t};`);
      }
      db.exec("PRAGMA foreign_keys = ON;");
      console.log("🗑️ Semua tabel berhasil di-drop.");
      runSchema();
      console.log("✅ Schema berhasil dibuat ulang.");
      runSeed();
      console.log("✅ Data seed berhasil diisi ulang.");
    } catch (err: any) {
      console.error("Gagal melakukan reset database:", err.message);
    }
    break;

  default:
    console.log("Perintah tidak dikenal. Gunakan: init | seed | reset");
}

