import { Response } from "express";
import bcrypt from "bcryptjs";
import { LecturerRepository, lecturerRepository } from "../repositories/lecturer.repository.js";
import { AuthRequest } from "../middleware/auth.js";
import { UpdateLecturerProfileDto, UpdateLecturerPasswordDto } from "../dto/lecturer.dto.js";

export class LecturerHandler {
  constructor(private lecturerRepo: LecturerRepository = lecturerRepository) {}

  getProfile = (req: AuthRequest, res: Response): void => {
    const lecturerId = req.user!.id;
    const lecturer = this.lecturerRepo.findById(lecturerId);
    if (!lecturer) {
      res.status(404).json({ error: "Profil tidak ditemukan." });
      return;
    }

    res.json({
      lecturer: {
        id: lecturer.id,
        nidn: lecturer.nidn,
        email: lecturer.email,
        name: lecturer.name,
        title_prefix: lecturer.title_prefix,
        title_suffix: lecturer.title_suffix,
        phone: lecturer.phone,
        office_room: lecturer.office_room,
        consult_hours: lecturer.consult_hours,
        notif_achievement: lecturer.notif_achievement,
        notif_deadline: lecturer.notif_deadline,
      },
    });
  };

  updateProfile = (req: AuthRequest, res: Response): void => {
    const lecturerId = req.user!.id;
    const body = req.body as UpdateLecturerProfileDto;

    this.lecturerRepo.update(lecturerId, {
      name: body.name,
      titlePrefix: body.titlePrefix,
      titleSuffix: body.titleSuffix,
      phone: body.phone,
      officeRoom: body.officeRoom,
      consultHours: body.consultHours,
      notifAchievement: body.notifAchievement !== undefined ? (body.notifAchievement ? 1 : 0) : null,
      notifDeadline: body.notifDeadline !== undefined ? (body.notifDeadline ? 1 : 0) : null,
    });

    res.json({ message: "Profil dosen berhasil diperbarui." });
  };

  updatePassword = (req: AuthRequest, res: Response): void => {
    const lecturerId = req.user!.id;
    const { oldPassword, newPassword } = req.body as UpdateLecturerPasswordDto;

    const user = this.lecturerRepo.findById(lecturerId);
    if (!user) {
      res.status(404).json({ error: "Pengguna tidak ditemukan." });
      return;
    }

    const isValid = bcrypt.compareSync(oldPassword, user.password_hash);
    if (!isValid) {
      res.status(400).json({ error: "Kata sandi lama yang Anda masukkan tidak sesuai." });
      return;
    }

    const newHash = bcrypt.hashSync(newPassword, 10);
    this.lecturerRepo.updatePassword(lecturerId, newHash);

    res.json({ message: "Kata sandi berhasil diperbarui." });
  };
}

export const lecturerHandler = new LecturerHandler();

