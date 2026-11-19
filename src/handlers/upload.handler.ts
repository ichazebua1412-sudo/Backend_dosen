import type { Response } from "express";
import type { AuthRequest } from "../middleware/auth.js";
import { uploadToBlob } from "../services/blob.service.js";

export class UploadHandler {
  /**
   * POST /api/upload
   * Menerima file via multipart/form-data (field name: "file").
   * Query param: ?folder=attachments|assignments|avatars
   *
   * Flow:
   *   Mobile/FE → POST file → Backend → Vercel Blob → return { url }
   *
   * FE dan Mobile TIDAK boleh upload langsung ke Vercel Blob.
   */
  uploadFile = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const file = req.file;
      if (!file) {
        res.status(400).json({
          error: "Tidak ada file yang diunggah. Gunakan field 'file' pada form-data.",
        });
        return;
      }

      const folderParam = (req.query.folder as string) ?? "attachments";
      const allowedFolders = ["attachments", "assignments", "avatars"];
      const folder = allowedFolders.includes(folderParam)
        ? (folderParam as "attachments" | "assignments" | "avatars")
        : "attachments";

      const result = await uploadToBlob(file.buffer, file.originalname, folder);

      res.status(201).json({
        message: "File berhasil diunggah.",
        url: result.url,
        pathname: result.pathname,
        contentType: result.contentType,
        size: result.size,
      });
    } catch (err: any) {
      console.error("[Upload] Error:", err);
      res.status(500).json({ error: err.message ?? "Gagal mengunggah file." });
    }
  };
}

export const uploadHandler = new UploadHandler();
