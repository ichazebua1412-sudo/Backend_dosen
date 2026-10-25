import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { initDatabase } from "./db.js";
import authRoutes from "./routes/auth.js";
import dashboardRoutes from "./routes/dashboard.js";
import classesRoutes from "./routes/classes.js";
import gradesRoutes from "./routes/grades.js";
import lecturerRoutes from "./routes/lecturer.js";
import aiRoutes from "./routes/ai.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: "10mb" }));

// Initialize SQLite schema and seed data
initDatabase();

// Route Handlers
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", service: "Gradia Backend", timestamp: new Date().toISOString() });
});

app.use("/api/auth", authRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/classes", classesRoutes);
app.use("/api/grades", gradesRoutes);
app.use("/api/lecturer", lecturerRoutes);
app.use("/api/ai", aiRoutes);

// Global Error Handler
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ error: "Terjadi kesalahan internal server." });
});

app.listen(PORT, () => {
  console.log(`🚀 Gradia Backend berjalan di http://localhost:${PORT}`);
});
