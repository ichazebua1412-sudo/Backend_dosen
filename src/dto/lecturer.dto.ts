import { z } from "zod";

export const updateLecturerProfileDto = z.object({
  name: z.string().trim().min(2, "Nama minimal 2 karakter.").optional(),
  titlePrefix: z.string().trim().optional(),
  titleSuffix: z.string().trim().optional(),
  phone: z.string().trim().optional(),
  officeRoom: z.string().trim().optional(),
  consultHours: z.string().trim().optional(),
  notifAchievement: z.union([z.boolean(), z.number()]).optional(),
  notifDeadline: z.union([z.boolean(), z.number()]).optional(),
});

export const updateLecturerPasswordDto = z.object({
  oldPassword: z
    .string()
    .min(1, "Kata sandi lama tidak boleh kosong."),
  newPassword: z
    .string()
    .min(6, "Kata sandi baru minimal 6 karakter."),
});

export type UpdateLecturerProfileDto = z.infer<typeof updateLecturerProfileDto>;
export type UpdateLecturerPasswordDto = z.infer<typeof updateLecturerPasswordDto>;
