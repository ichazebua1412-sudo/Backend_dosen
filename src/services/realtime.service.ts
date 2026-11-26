import { Request, Response } from "express";
import { db } from "../db.js";

export interface RealtimeClient {
  id: string;
  userId: number;
  role: string;
  res: Response;
}

class RealtimeService {
  private clients = new Map<string, RealtimeClient>();
  private counter = 0;

  addClient(req: Request, res: Response, user: { id: number; role?: string }): void {
    const clientId = `${user.role || "unknown"}-${user.id}-${++this.counter}`;
    const role = (user.role || "").toLowerCase();

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache, no-transform");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("X-Accel-Buffering", "no");
    res.flushHeaders?.();

    this.clients.set(clientId, {
      id: clientId,
      userId: Number(user.id),
      role,
      res,
    });

    this.writeEvent(res, "connected", {
      clientId,
      role,
      userId: user.id,
      timestamp: new Date().toISOString(),
    });

    const heartbeat = setInterval(() => {
      if (!res.writableEnded) {
        res.write(": ping\n\n");
      }
    }, 25000);

    req.on("close", () => {
      clearInterval(heartbeat);
      this.clients.delete(clientId);
    });
  }

  emitToUser(role: string, userId: number, event: string, data: Record<string, any> = {}): void {
    const targetRole = role.toLowerCase();
    const payload = { ...data, timestamp: new Date().toISOString() };

    for (const client of this.clients.values()) {
      if (client.role === targetRole && client.userId === Number(userId) && !client.res.writableEnded) {
        this.writeEvent(client.res, event, payload);
      }
    }
  }

  emitToClassStudents(classId: number, event: string, data: Record<string, any> = {}): void {
    try {
      const rows = db
        .prepare("SELECT student_id FROM class_enrollments WHERE class_id = ?")
        .all(classId) as Array<{ student_id: number }>;
      const studentIds = new Set(rows.map((r) => Number(r.student_id)));
      const payload = { ...data, classId, timestamp: new Date().toISOString() };

      for (const client of this.clients.values()) {
        if (client.role === "student" && studentIds.has(client.userId) && !client.res.writableEnded) {
          this.writeEvent(client.res, event, payload);
        }
      }
    } catch {
      // Abaikan jika tabel belum siap
    }
  }

  emitToClassLecturer(classId: number, event: string, data: Record<string, any> = {}): void {
    try {
      const row = db
        .prepare("SELECT lecturer_id FROM classes WHERE id = ?")
        .get(classId) as { lecturer_id: number } | undefined;
      if (row?.lecturer_id) {
        this.emitToUser("dosen", row.lecturer_id, event, { ...data, classId });
      }
    } catch {
      // Abaikan jika tabel belum siap
    }
  }

  private writeEvent(res: Response, event: string, data: Record<string, any>): void {
    try {
      res.write(`event: ${event}\n`);
      res.write(`data: ${JSON.stringify(data)}\n\n`);
    } catch {
      // Koneksi sudah tertutup
    }
  }
}

export const realtimeService = new RealtimeService();
