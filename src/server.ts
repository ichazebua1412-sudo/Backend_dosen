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

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ==========================================
// 1. KEAMANAN & HEADER (HELMET)
// ==========================================
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

// ==========================================
// 2. LOGGING PERMINTAAN HTTP (MORGAN)
// ==========================================
app.use(morgan("dev"));

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

// ==========================================
// 7. GLOBAL ERROR HANDLER
// ==========================================
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error("Unhandled error:", err);
  res.status(err.status || 500).json({
    error: err.message || "Terjadi kesalahan internal server.",
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Gradia Backend berjalan di http://localhost:${PORT}`);
});

export default app;
