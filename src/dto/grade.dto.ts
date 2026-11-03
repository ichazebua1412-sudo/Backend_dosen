import { z } from "zod";

export const gradeItemDto = z.object({
  enrollmentId: z.coerce.number().int().positive().optional(),
  enrollment_id: z.coerce.number().int().positive().optional(),
  id: z.coerce.number().int().positive().optional(),
  tugas: z.coerce.number().min(0).max(100).nullable().optional(),
  uts: z.coerce.number().min(0).max(100).nullable().optional(),
  uas: z.coerce.number().min(0).max(100).nullable().optional(),
  status: z.string().optional(),
  aiFeedback: z.string().nullable().optional(),
  ai_feedback: z.string().nullable().optional(),
}).refine(data => data.enrollmentId || data.enrollment_id || data.id, {
  message: "Enrollment ID wajib disediakan untuk setiap komponen nilai.",
});

export const batchUpdateGradesDto = z.object({
  items: z.array(gradeItemDto).optional(),
  grades: z.array(gradeItemDto).optional(),
}).refine(data => (data.items && data.items.length > 0) || (data.grades && data.grades.length > 0), {
  message: "Data nilai (items atau grades) tidak boleh kosong.",
});

export const importGradeRowDto = z.object({
  nim: z.union([z.string(), z.number()]).transform(v => String(v).trim()),
  nama: z.string().trim().optional(),
  name: z.string().trim().optional(),
  tugas: z.coerce.number().min(0).max(100).nullable().optional(),
  uts: z.coerce.number().min(0).max(100).nullable().optional(),
  uas: z.coerce.number().min(0).max(100).nullable().optional(),
});

export const importGradesDto = z.object({
  rows: z.array(importGradeRowDto).min(1, "Data import Excel tidak boleh kosong."),
});

export type GradeItemDto = z.infer<typeof gradeItemDto>;
export type BatchUpdateGradesDto = z.infer<typeof batchUpdateGradesDto>;
export type ImportGradeRowDto = z.infer<typeof importGradeRowDto>;
export type ImportGradesDto = z.infer<typeof importGradesDto>;

