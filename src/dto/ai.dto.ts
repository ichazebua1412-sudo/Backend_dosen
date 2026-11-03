import { z } from "zod";

export const aiFeedbackDto = z.object({
  studentName: z.string().trim().optional(),
  nim: z.string().trim().optional(),
  courseName: z.string().trim().optional(),
  tugas: z.coerce.number().optional(),
  uts: z.coerce.number().optional(),
  uas: z.coerce.number().optional(),
  finalScore: z.coerce.number().optional(),
  letterGrade: z.string().optional(),
  classSummary: z
    .object({
      totalStudents: z.coerce.number().optional(),
      avgScore: z.coerce.number().optional(),
      passRate: z.coerce.number().optional(),
      remedialCount: z.coerce.number().optional(),
      className: z.string().optional(),
    })
    .optional(),
}).refine(data => data.studentName || data.classSummary, {
  message: "studentName atau classSummary wajib disertakan.",
});

export type AiFeedbackDto = z.infer<typeof aiFeedbackDto>;

