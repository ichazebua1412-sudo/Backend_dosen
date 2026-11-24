import multer from "multer";
import type { Request } from "express";

// File disimpan di memory (tidak ke disk lokal), lalu langsung diteruskan ke Vercel Blob
const storage = multer.memoryStorage();

const ALLOWED_MIME = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/zip",
  "application/x-rar-compressed",
  "application/octet-stream",
]);

const ALLOWED_EXT = new Set([
  "pdf",
  "jpg",
  "jpeg",
  "png",
  "doc",
  "docx",
  "zip",
  "rar",
]);

const MAX_SIZE = 5 * 1024 * 1024; // 5 MB

function fileFilter(
  _req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
): void {
  const ext = file.originalname.split(".").pop()?.toLowerCase() ?? "";

  if (ALLOWED_MIME.has(file.mimetype) || ALLOWED_EXT.has(ext)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        `Format file '${file.originalname}' tidak diizinkan. Hanya PDF, JPG, PNG, DOC, DOCX, ZIP, RAR.`
      )
    );
  }
}

export const uploadMiddleware = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_SIZE },
});
