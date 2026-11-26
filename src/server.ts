import path from "node:path";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";

import { initDatabase } from "./db.js";
import { globalLimiter } from "./middleware/rateLimiter.js";

import authRoutes from "./routes/auth.js";
import dashboardRoutes from "./routes/dashboard.js";
import classesRoutes from "./routes/classes.js";
import gradesRoutes from "./routes/grades.js";
import lecturerRoutes from "./routes/lecturer.js";
import aiRoutes from "./routes/ai.js";
import adminRoutes from "./routes/admin.js";
import studentRoutes from "./routes/student.js";
import uploadRoutes from "./routes/upload.js";
import realtimeRoutes from "./routes/realtime.js";
import attendanceRoutes from "./routes/attendance.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Sembunyikan informasi teknologi server dari penyerang
app.disable("x-powered-by");

// ==========================================
// 1. KEAMANAN & HEADER (HELMET STRICT)
// ==========================================
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    frameguard: { action: "deny" },
    noSniff: true,
    xssFilter: true,
  })
);

// ==========================================
// 2. LOGGING PERMINTAAN HTTP (MORGAN)
// ==========================================
morgan.token("safe-url", (req) => {
  const rawUrl = (req as express.Request).originalUrl || req.url || "";
  return rawUrl.replace(/([?&]token=)[^&]*/gi, "$1[REDACTED]");
});
app.use(morgan(":method :safe-url :status :response-time ms - :res[content-length]"));

// ==========================================
// 3. CORS & BODY PARSER
// ==========================================
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// ==========================================
// 4. RATE LIMITING (GLOBAL)
// ==========================================
app.use("/api/", globalLimiter);

// ==========================================
// 5. INISIALISASI DATABASE (SCHEMA & SEED)
// ==========================================
initDatabase();

// ==========================================
// 6. ROUTE HANDLERS (LAPISAN ROUTER)
// ==========================================
app.get("/", (_req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Gradia Backend Server</title>
        <meta charset="utf-8" />
      </head>
      <body style="font-family: system-ui, -apple-system, sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; margin: 0; background-color: #f1f5f9;">
        <div style="background: white; padding: 2.5rem; border-radius: 1rem; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); text-align: center; max-width: 480px; width: 90%;">
          <div style="font-size: 3rem; margin-bottom: 0.5rem;">🚀</div>
          <h1 style="color: #312e81; margin: 0 0 0.5rem 0; font-size: 1.5rem;">Gradia Backend Server</h1>
          <div style="display: inline-block; background-color: #dcfce7; color: #15803d; padding: 0.35rem 1rem; border-radius: 9999px; font-weight: 600; font-size: 0.9rem; margin-bottom: 1rem;">
            ● Server Aktif & Berjalan di Port 5001
          </div>
          <p style="color: #64748b; font-size: 0.95rem; line-height: 1.5; margin-top: 0;">
            Server REST API siap melayani request dari aplikasi mobile Gradia-PBL maupun web frontend dosen.
          </p>
          <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 0.5rem; padding: 0.75rem 1rem; font-family: monospace; font-size: 0.85rem; color: #475569; margin: 1rem 0;">
            GET /api/health → Status OK
          </div>
          <a href="/api/health" style="display: inline-block; background-color: #4f46e5; color: white; text-decoration: none; padding: 0.6rem 1.25rem; border-radius: 0.5rem; font-weight: 500; font-size: 0.9rem;">
            Cek Health Status
          </a>
        </div>
      </body>
    </html>
  `);
});

app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "Gradia Backend API (3-Tier Modular)",
    timestamp: new Date().toISOString(),
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/classes", classesRoutes);
app.use("/api/grades", gradesRoutes);
app.use("/api/lecturer", lecturerRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/student", studentRoutes);
app.use("/uploads", express.static(path.resolve(process.cwd(), "uploads")));
app.use("/api/upload", uploadRoutes); // Upload file → Vercel Blob / fallback lokal (wajib via backend)
app.use("/api/realtime", realtimeRoutes); // SSE real-time sync untuk mobile & web
app.use("/api/attendances", attendanceRoutes);

// ==========================================
// 7. GLOBAL ERROR HANDLER
// ==========================================
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error("Unhandled error:", err?.message || "Unknown error");
  res.status(err.status || 500).json({
    error: err.message || "Terjadi kesalahan internal server.",
  });
});

app.listen(Number(PORT), "0.0.0.0", () => {
  console.log(`🚀 Gradia Backend berjalan di http://localhost:${PORT}`);
});

export default app;
