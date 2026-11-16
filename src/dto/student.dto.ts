import { z } from "zod";

export const studentLoginDto = z.object({
  identifier: z
    .string()
    .trim()
    .min(1, "NIM atau Email wajib diisi."),
  password: z
    .string()
    .min(1, "Kata sandi wajib diisi."),
});

export type StudentLoginDto = z.infer<typeof studentLoginDto>;

export const checkInAttendanceDto = z.object({
  classId: z.number().int().positive("ID Kelas tidak valid."),
  type: z.enum(["Luring", "Daring"]).optional().default("Luring"),
});

export type CheckInAttendanceDto = z.infer<typeof checkInAttendanceDto>;

export const applyLeaveDto = z.object({
  classId: z.number().int().positive("ID Kelas tidak valid."),
  status: z.preprocess(
    (val) => (typeof val === "string" ? val.toLowerCase().trim() : val),
    z.enum(["izin", "sakit"])
  ),
  reason: z.string().trim().min(3, "Alasan wajib diisi minimal 3 karakter."),
  attachmentUrl: z.string().optional().default(""),
});

export type ApplyLeaveDto = z.infer<typeof applyLeaveDto>;

export const submitAssignmentDto = z.object({
  fileUrl: z.string().trim().optional().default(""),
  notes: z.string().trim().optional().default(""),
});

export type SubmitAssignmentDto = z.infer<typeof submitAssignmentDto>;

export const createGradeReviewDto = z.object({
  classId: z.number().int().positive("ID Kelas tidak valid."),
  component: z.string().trim().min(1, "Komponen nilai wajib diisi."),
  currentScore: z.string().trim().min(1, "Nilai saat ini wajib diisi."),
  reason: z.string().trim().min(5, "Alasan permohonan koreksi wajib diisi minimal 5 karakter."),
});

export type CreateGradeReviewDto = z.infer<typeof createGradeReviewDto>;


