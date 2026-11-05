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

