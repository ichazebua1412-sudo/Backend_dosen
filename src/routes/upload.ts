import { Router } from "express";
import { anyAuth } from "../middleware/auth.js";
import { uploadMiddleware } from "../middleware/upload.js";
import { uploadHandler } from "../handlers/upload.handler.js";

const router = Router();

/**
 * POST /api/upload
 * Endpoint tunggal untuk upload file.
 * - Dosen maupun mahasiswa yang sudah login dapat menggunakannya.
 * - Multer memproses multipart/form-data dan menyimpan di memory buffer.
 * - Handler meneruskan buffer ke Vercel Blob.
 * - FE / Mobile TIDAK boleh upload langsung ke Vercel Blob.
 *
 * Form-data field : "file"
 * Query param     : ?folder=attachments|assignments|avatars
 */
router.post(
  "/",
  anyAuth,
  uploadMiddleware.single("file"),
  uploadHandler.uploadFile
);

export default router;
