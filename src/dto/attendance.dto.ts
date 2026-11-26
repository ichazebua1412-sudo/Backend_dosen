import { z } from "zod";

export const toggleSessionDto = z.object({
  classId: z.number().int().positive("ID Kelas tidak valid."),
  pertemuan: z.number().int().min(1).max(32).default(1),
  isOpen: z.boolean(),
});

export type ToggleSessionDto = z.infer<typeof toggleSessionDto>;

export const correctAttendanceDto = z.object({
  pertemuan: z.number().int().min(1).max(32).default(1),
  status: z.preprocess(
    (val) => (typeof val === "string" ? val.toLowerCase().trim() : val),
    z.enum(["hadir", "izin", "sakit", "alpa"])
  ),
  alasan_koreksi: z
    .string()
    .trim()
    .min(3, "Alasan koreksi wajib diisi minimal 3 karakter untuk audit log dosen."),
});

export type CorrectAttendanceDto = z.infer<typeof correctAttendanceDto>;

