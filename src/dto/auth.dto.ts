import { z } from "zod";

export const loginDto = z.object({
  identifier: z
    .string()
    .trim()
    .min(1, "NIDN atau Email tidak boleh kosong."),
  password: z
    .string()
    .min(1, "Kata sandi tidak boleh kosong."),
});

export type LoginDto = z.infer<typeof loginDto>;
