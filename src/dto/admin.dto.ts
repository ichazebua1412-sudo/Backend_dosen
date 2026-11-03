import { z } from "zod";

export const adminLoginDto = z.object({
  username: z
    .string()
    .trim()
    .min(1, "Username atau Email tidak boleh kosong."),
  password: z
    .string()
    .min(1, "Kata sandi tidak boleh kosong."),
});

export const createLecturerDto = z.object({
  nidn: z
    .string()
    .trim()
    .min(5, "NIDN minimal 5 karakter."),
  email: z
    .string()
    .trim()
    .email("Format email tidak valid."),
  password: z
    .string()
    .min(6, "Kata sandi minimal 6 karakter."),
  name: z
    .string()
    .trim()
    .min(2, "Nama dosen minimal 2 karakter."),
  titlePrefix: z.string().trim().optional().default(""),
  titleSuffix: z.string().trim().optional().default(""),
  phone: z.string().trim().optional().default(""),
  officeRoom: z.string().trim().optional().default(""),
  consultHours: z.string().trim().optional().default(""),
});

export const updateLecturerDto = z.object({
  nidn: z.string().trim().min(5, "NIDN minimal 5 karakter.").optional(),
  email: z.string().trim().email("Format email tidak valid.").optional(),
  name: z.string().trim().min(2, "Nama minimal 2 karakter.").optional(),
  titlePrefix: z.string().trim().optional(),
  titleSuffix: z.string().trim().optional(),
  phone: z.string().trim().optional(),
  officeRoom: z.string().trim().optional(),
  consultHours: z.string().trim().optional(),
  status: z.enum(["active", "inactive"]).optional(),
});

export const resetPasswordDto = z.object({
  newPassword: z
    .string()
    .min(6, "Kata sandi baru minimal 6 karakter."),
});

export const createStudentDto = z.object({
  nim: z
    .string()
    .trim()
    .min(3, "NIM minimal 3 karakter."),
  name: z
    .string()
    .trim()
    .min(2, "Nama mahasiswa minimal 2 karakter."),
  email: z
    .string()
    .trim()
    .email("Format email tidak valid."),
  prodi: z
    .string()
    .trim()
    .min(2, "Program studi minimal 2 karakter."),
  status: z.string().trim().optional().default("Aktif"),
});

export const updateStudentDto = z.object({
  name: z.string().trim().min(2, "Nama minimal 2 karakter.").optional(),
  email: z.string().trim().email("Format email tidak valid.").optional(),
  prodi: z.string().trim().min(2, "Program studi minimal 2 karakter.").optional(),
  status: z.string().trim().optional(),
});

export type AdminLoginDto = z.infer<typeof adminLoginDto>;
export type CreateLecturerDto = z.infer<typeof createLecturerDto>;
export type UpdateLecturerDto = z.infer<typeof updateLecturerDto>;
export type ResetPasswordDto = z.infer<typeof resetPasswordDto>;
export type CreateStudentDto = z.infer<typeof createStudentDto>;
export type UpdateStudentDto = z.infer<typeof updateStudentDto>;
