import crypto from "crypto";
import bcrypt from "bcryptjs";
import { LecturerRecord } from "../repositories/lecturer.repository.js";
import {
  PasswordResetRepository,
  passwordResetRepository,
} from "../repositories/passwordReset.repository.js";
import {
  isEmailServiceConfigured,
  sendLecturerPasswordResetEmail,
} from "./email.service.js";

const RESET_TOKEN_TTL_MINUTES = 30;

export class PasswordResetError extends Error {
  constructor(
    public statusCode: number,
    message: string
  ) {
    super(message);
    this.name = "PasswordResetError";
  }
}

export class PasswordResetService {
  constructor(
    private resetRepo: PasswordResetRepository = passwordResetRepository
  ) {}

  private hashToken(rawToken: string): string {
    return crypto.createHash("sha256").update(rawToken).digest("hex");
  }

  async requestLecturerReset(params: {
    lecturer: LecturerRecord;
    requestedBy: "self" | "admin";
    adminId?: number;
  }): Promise<{ email: string }> {
    const { lecturer, requestedBy, adminId } = params;

    if (lecturer.status === "inactive") {
      throw new PasswordResetError(
        403,
        "Akun dosen sedang dinonaktifkan oleh Administrator."
      );
    }

    if (!lecturer.email || !lecturer.email.trim()) {
      throw new PasswordResetError(
        400,
        "Akun dosen belum memiliki alamat email kampus yang terdaftar."
      );
    }

    if (!isEmailServiceConfigured()) {
      throw new PasswordResetError(
        503,
        "Layanan pengiriman email (SMTP) belum dikonfigurasi pada server, sehingga tautan reset kata sandi tidak dapat dikirim."
      );
    }

    const rawToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = this.hashToken(rawToken);
    const expiresAt = new Date(
      Date.now() + RESET_TOKEN_TTL_MINUTES * 60 * 1000
    ).toISOString();

    const tokenId = this.resetRepo.createToken({
      lecturerId: lecturer.id,
      tokenHash,
      expiresAt,
      requestedBy,
      createdByAdminId: adminId ?? null,
    });

    const frontendBaseUrl = (
      process.env.FRONTEND_URL || "http://localhost:3000"
    ).replace(/\/+$/, "");
    const resetUrl = `${frontendBaseUrl}/auth/reset-password?token=${encodeURIComponent(rawToken)}`;

    try {
      await sendLecturerPasswordResetEmail({
        to: lecturer.email.trim(),
        lecturerName: lecturer.name || "Dosen",
        resetUrl,
        expiresMinutes: RESET_TOKEN_TTL_MINUTES,
      });
    } catch (err: any) {
      this.resetRepo.deleteById(tokenId);
      throw new PasswordResetError(
        503,
        err?.message || "Gagal mengirim email tautan reset kata sandi."
      );
    }

    return { email: lecturer.email.trim() };
  }

  verifyToken(rawToken: string): boolean {
    const trimmed = rawToken.trim();
    if (!trimmed) return false;
    const tokenHash = this.hashToken(trimmed);
    return Boolean(this.resetRepo.findValidByTokenHash(tokenHash));
  }

  completeReset(rawToken: string, newPassword: string): void {
    const trimmed = rawToken.trim();
    if (!trimmed) {
      throw new PasswordResetError(400, "Token reset tidak valid.");
    }

    const tokenHash = this.hashToken(trimmed);
    const record = this.resetRepo.findValidByTokenHash(tokenHash);
    if (!record) {
      throw new PasswordResetError(
        400,
        "Tautan reset kata sandi tidak valid atau sudah kedaluwarsa."
      );
    }

    const passwordHash = bcrypt.hashSync(newPassword, 10);
    try {
      this.resetRepo.markUsedAndUpdateLecturerPassword(
        record.id,
        record.lecturer_id,
        passwordHash
      );
    } catch (err: any) {
      if (err?.message === "TOKEN_ALREADY_USED") {
        throw new PasswordResetError(
          400,
          "Tautan reset kata sandi tidak valid atau sudah kedaluwarsa."
        );
      }
      throw err;
    }
  }
}

export const passwordResetService = new PasswordResetService();
