import { z } from "zod";

/**
 * =========================================================
 * SCHEMA ZOD BERSAMA - BACKEND
 * =========================================================
 */
export const classSchema = z.object({
  code: z
    .string()
    .trim()
    .min(1, "Kode mata kuliah wajib diisi.")
    .min(3, "Kode mata kuliah minimal 3 karakter.")
    .max(20, "Kode mata kuliah maksimal 20 karakter."),
  title: z
    .string()
    .trim()
    .min(1, "Nama mata kuliah wajib diisi.")
    .min(3, "Nama mata kuliah minimal 3 karakter.")
    .max(100, "Nama mata kuliah maksimal 100 karakter."),
  sks: z.coerce
    .number()
    .int("SKS harus bilangan bulat.")
    .min(1, "SKS minimal 1.")
    .max(6, "SKS maksimal 6."),
  prodi: z
    .string()
    .trim()
    .min(2, "Program studi wajib diisi."),
  semester: z.coerce
    .number()
    .int("Semester harus bilangan bulat.")
    .min(1, "Semester minimal 1.")
    .max(8, "Semester maksimal 8."),
  capacity: z.coerce
    .number()
    .int("Kapasitas harus bilangan bulat.")
    .min(1, "Kapasitas minimal 1 mahasiswa.")
    .max(200, "Kapasitas maksimal 200 mahasiswa."),
  schedule: z
    .string()
    .trim()
    .min(1, "Jadwal kuliah wajib diisi.")
    .min(3, "Jadwal kuliah minimal 3 karakter (contoh: Senin, 08:00 WIB)."),
  room: z
    .string()
    .trim()
    .min(1, "Ruangan kuliah wajib diisi.")
    .min(2, "Ruangan kuliah minimal 2 karakter (contoh: Lab Kom 1)."),
});

export type ClassInput = z.infer<typeof classSchema>;
