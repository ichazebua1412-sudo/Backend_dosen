import { Router } from "express";
import { authGuard, studentGuard } from "../middleware/auth.js";
import { uploadMiddleware } from "../middleware/upload.js";
import { uploadHandler } from "../handlers/upload.handler.js";
import type { Response, NextFunction } from "express";
import type { AuthRequest } from "../middleware/auth.js";

const router = Router();

/**
 * anyAuth — izinkan dosen (authGuard) ATAU mahasiswa (studentGuard).
 * Token wajib ada; request tanpa token ditolak.
 */
function anyAuth(req: AuthRequest, res: Response, next: NextFunction): void {
  authGuard(req, res, (errDosen?: any) => {
    if (!errDosen && req.user) {
      return next();
    }
    studentGuard(req, res, next);
  });
}

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
