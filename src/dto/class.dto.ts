import { z } from "zod";

export const createClassDto = z.object({
  code: z
    .string()
    .trim()
    .min(3, "Kode mata kuliah minimal 3 karakter.")
    .max(20, "Kode mata kuliah maksimal 20 karakter."),
  title: z
    .string()
    .trim()
    .min(3, "Nama mata kuliah minimal 3 karakter.")
    .max(100, "Nama mata kuliah maksimal 100 karakter."),
  sks: z.coerce
    .number()
    .int("SKS harus bilangan bulat.")
    .min(1, "SKS minimal 1.")
    .max(6, "SKS maksimal 6.")
    .default(3),
  prodi: z
    .string()
    .trim()
    .min(2, "Program studi wajib diisi."),
  semester: z.coerce
    .number()
    .int("Semester harus bilangan bulat.")
    .min(1, "Semester minimal 1.")
    .max(8, "Semester maksimal 8.")
    .default(1),
  capacity: z.coerce
    .number()
    .int("Kapasitas harus bilangan bulat.")
    .min(1, "Kapasitas minimal 1 mahasiswa.")
    .max(200, "Kapasitas maksimal 200 mahasiswa.")
    .default(40),
  schedule: z
    .string()
    .trim()
    .min(3, "Jadwal kuliah minimal 3 karakter.")
    .optional()
    .default("Senin, 08:00 WIB"),
  room: z
    .string()
    .trim()
    .min(2, "Ruangan kuliah minimal 2 karakter.")
    .optional()
    .default("Ruang Teori"),
});

export const updateClassDto = z.object({
  code: z.string().trim().min(3).max(20).optional(),
  title: z.string().trim().min(3).max(100).optional(),
  sks: z.coerce.number().int().min(1).max(6).optional(),
  prodi: z.string().trim().min(2).optional(),
  semester: z.coerce.number().int().min(1).max(8).optional(),
  capacity: z.coerce.number().int().min(1).max(200).optional(),
  schedule: z.string().trim().min(3).optional(),
  room: z.string().trim().min(2).optional(),
});

export const enrollStudentDto = z.object({
  nim: z
    .string()
    .trim()
    .min(3, "NIM minimal 3 karakter."),
  name: z
    .string()
    .trim()
    .min(2, "Nama minimal 2 karakter."),
  email: z.string().trim().email("Format email tidak valid.").optional(),
  prodi: z.string().trim().optional(),
});

export type CreateClassDto = z.infer<typeof createClassDto>;
export type UpdateClassDto = z.infer<typeof updateClassDto>;
export type EnrollStudentDto = z.infer<typeof enrollStudentDto>;
