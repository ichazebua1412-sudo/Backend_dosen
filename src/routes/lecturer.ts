import { Router, Response } from "express";
import bcrypt from "bcryptjs";
import { AuthRequest, authGuard } from "../middleware/auth.js";
import { db } from "../db.js";

const router = Router();

// Get profile
router.get("/profile", authGuard, (req: AuthRequest, res: Response) => {
  const lecturerId = req.user!.id;
  const lecturer = db.prepare(`
    SELECT id, nidn, email, name, title_prefix, title_suffix, phone, office_room, consult_hours, notif_achievement, notif_deadline
    FROM lecturers
    WHERE id = ?
  `).get(lecturerId) as any;

  if (!lecturer) return res.status(404).json({ error: "Profil tidak ditemukan." });

  return res.json({ lecturer });
});

// Update profile
router.put("/profile", authGuard, (req: AuthRequest, res: Response) => {
  const lecturerId = req.user!.id;
  const { name, titlePrefix, titleSuffix, phone, officeRoom, consultHours, notifAchievement, notifDeadline } = req.body;

  const updateStmt = db.prepare(`
    UPDATE lecturers
    SET name = COALESCE(?, name),
        title_prefix = COALESCE(?, title_prefix),
        title_suffix = COALESCE(?, title_suffix),
        phone = COALESCE(?, phone),
        office_room = COALESCE(?, office_room),
        consult_hours = COALESCE(?, consult_hours),
        notif_achievement = COALESCE(?, notif_achievement),
        notif_deadline = COALESCE(?, notif_deadline)
    WHERE id = ?
  `);

  updateStmt.run(
    name?.trim() || null,
    titlePrefix?.trim() || null,
    titleSuffix?.trim() || null,
    phone?.trim() || null,
    officeRoom?.trim() || null,
    consultHours?.trim() || null,
    notifAchievement !== undefined ? (notifAchievement ? 1 : 0) : null,
    notifDeadline !== undefined ? (notifDeadline ? 1 : 0) : null,
    lecturerId
  );

  return res.json({ message: "Profil dosen berhasil diperbarui." });
});

// Update password
router.put("/password", authGuard, (req: AuthRequest, res: Response) => {
  const lecturerId = req.user!.id;
  const { oldPassword, newPassword } = req.body;

  if (!oldPassword || !newPassword) {
    return res.status(400).json({ error: "Kata sandi lama dan kata sandi baru wajib diisi." });
  }

  const user = db.prepare("SELECT password_hash FROM lecturers WHERE id = ?").get(lecturerId) as any;
  if (!user || !bcrypt.compareSync(oldPassword, user.password_hash)) {
    return res.status(401).json({ error: "Kata sandi saat ini salah." });
  }

  const newHash = bcrypt.hashSync(newPassword, 10);
  db.prepare("UPDATE lecturers SET password_hash = ? WHERE id = ?").run(newHash, lecturerId);

  return res.json({ message: "Kata sandi berhasil diperbarui dengan aman." });
});

export default router;
