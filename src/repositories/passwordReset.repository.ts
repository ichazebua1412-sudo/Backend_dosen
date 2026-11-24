import { db } from "../db.js";

export interface PasswordResetTokenRecord {
  id: number;
  lecturer_id: number;
  token_hash: string;
  expires_at: string;
  used_at: string | null;
  requested_by: "self" | "admin";
  created_by_admin_id: number | null;
  created_at: string;
}

export class PasswordResetRepository {
  createToken(params: {
    lecturerId: number;
    tokenHash: string;
    expiresAt: string;
    requestedBy: "self" | "admin";
    createdByAdminId?: number | null;
  }): number {
    db.prepare(
      "UPDATE password_reset_tokens SET used_at = CURRENT_TIMESTAMP WHERE lecturer_id = ? AND used_at IS NULL"
    ).run(params.lecturerId);

    const result = db
      .prepare(
        `INSERT INTO password_reset_tokens (lecturer_id, token_hash, expires_at, requested_by, created_by_admin_id)
         VALUES (?, ?, ?, ?, ?)`
      )
      .run(
        params.lecturerId,
        params.tokenHash,
        params.expiresAt,
        params.requestedBy,
        params.createdByAdminId ?? null
      );

    return Number(result.lastInsertRowid);
  }

  findValidByTokenHash(tokenHash: string): PasswordResetTokenRecord | null {
    const row = db
      .prepare(
        `SELECT id, lecturer_id, token_hash, expires_at, used_at, requested_by, created_by_admin_id, created_at
         FROM password_reset_tokens
         WHERE token_hash = ?`
      )
      .get(tokenHash) as PasswordResetTokenRecord | undefined;

    if (!row || row.used_at !== null) {
      return null;
    }

    const expiresMs = new Date(row.expires_at).getTime();
    if (!Number.isFinite(expiresMs) || expiresMs <= Date.now()) {
      return null;
    }

    return row;
  }

  deleteById(id: number): void {
    db.prepare("DELETE FROM password_reset_tokens WHERE id = ?").run(id);
  }

  markUsedAndUpdateLecturerPassword(
    tokenId: number,
    lecturerId: number,
    passwordHash: string
  ): void {
    db.exec("BEGIN");
    try {
      const tokenUpdate = db
        .prepare(
          `UPDATE password_reset_tokens
           SET used_at = CURRENT_TIMESTAMP
           WHERE id = ? AND used_at IS NULL`
        )
        .run(tokenId);

      if (Number(tokenUpdate.changes) !== 1) {
        throw new Error("TOKEN_ALREADY_USED");
      }

      db.prepare("UPDATE lecturers SET password_hash = ? WHERE id = ?").run(
        passwordHash,
        lecturerId
      );
      db.prepare(
        `UPDATE password_reset_tokens
         SET used_at = CURRENT_TIMESTAMP
         WHERE lecturer_id = ? AND used_at IS NULL`
      ).run(lecturerId);
      db.exec("COMMIT");
    } catch (err) {
      db.exec("ROLLBACK");
      throw err;
    }
  }
}

export const passwordResetRepository = new PasswordResetRepository();
