import { z } from "zod";

export const loginDto = z.object({
  identifier: z
    .string()
    .trim()
    .min(1, "NIDN, Email, atau Username tidak boleh kosong."),
  password: z
    .string()
    .min(1, "Kata sandi tidak boleh kosong."),
  role: z.string().optional(),
});

export const forgotPasswordDto = z.object({
  identifier: z
    .string()
    .trim()
    .min(1, "NIDN atau email kampus tidak boleh kosong."),
});

export const resetPasswordWithTokenDto = z.object({
  token: z
    .string()
    .trim()
    .min(1, "Token reset tidak valid."),
  newPassword: z
    .string()
    .min(6, "Kata sandi baru minimal 6 karakter."),
});

export type LoginDto = z.infer<typeof loginDto>;
export type ForgotPasswordDto = z.infer<typeof forgotPasswordDto>;
export type ResetPasswordWithTokenDto = z.infer<typeof resetPasswordWithTokenDto>;
