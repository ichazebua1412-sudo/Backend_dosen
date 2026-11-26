import fs from "node:fs/promises";
import path from "node:path";
import { put, del } from "@vercel/blob";

export type BlobFolder = "attachments" | "assignments" | "avatars";

const LOCAL_UPLOAD_ROOT = path.resolve(process.cwd(), "uploads");

export interface BlobUploadResult {
  url: string;
  pathname: string;
  contentType: string;
  size: number;
}

/**
 * Upload buffer ke Vercel Blob (atau fallback ke disk lokal jika
 * BLOB_READ_WRITE_TOKEN belum dikonfigurasi untuk development).
 * Semua file harus melalui backend — TIDAK boleh langsung dari FE / mobile.
 *
 * @param buffer    - File bytes
 * @param filename  - Nama file asli (dengan ekstensi)
 * @param folder    - Sub-folder: 'attachments' | 'assignments' | 'avatars'
 * @param baseUrl   - Base URL server untuk membentuk URL lokal saat fallback
 */
export async function uploadToBlob(
  buffer: Buffer,
  filename: string,
  folder: BlobFolder = "attachments",
  baseUrl?: string
): Promise<BlobUploadResult> {
  // Sanitize filename: hapus karakter berbahaya
  const safe = filename.replace(/[^a-zA-Z0-9._-]/g, "_");
  const fileKey = `${Date.now()}_${safe}`;
  const pathname = `${folder}/${fileKey}`;
  const contentType = detectContentType(filename);

  const token = process.env.BLOB_READ_WRITE_TOKEN?.trim();
  if (!token) {
    const targetDir = path.join(LOCAL_UPLOAD_ROOT, folder);
    await fs.mkdir(targetDir, { recursive: true });
    await fs.writeFile(path.join(targetDir, fileKey), buffer);

    const normalizedBase = baseUrl ? baseUrl.replace(/\/+$/, "") : "";
    const url = normalizedBase
      ? `${normalizedBase}/uploads/${pathname}`
      : `/uploads/${pathname}`;

    return {
      url,
      pathname,
      contentType,
      size: buffer.byteLength,
    };
  }

  const blob = await put(pathname, buffer, {
    access: "public",
    token,
    contentType,
  });

  return {
    url: blob.url,
    pathname: blob.pathname,
    contentType: blob.contentType,
    size: buffer.byteLength,
  };
}

/**
 * Hapus file dari Vercel Blob (atau disk lokal) berdasarkan URL.
 */
export async function deleteFromBlob(url: string): Promise<void> {
  const token = process.env.BLOB_READ_WRITE_TOKEN?.trim();
  if (!token) {
    const marker = "/uploads/";
    const idx = url.indexOf(marker);
    if (idx === -1) return;
    const relPath = url.slice(idx + marker.length);
    const resolved = path.resolve(LOCAL_UPLOAD_ROOT, relPath);
    if (!resolved.startsWith(LOCAL_UPLOAD_ROOT + path.sep)) return;
    await fs.unlink(resolved).catch(() => undefined);
    return;
  }
  await del(url, { token });
}

function detectContentType(filename: string): string {
  const ext = filename.split(".").pop()?.toLowerCase() ?? "";
  const map: Record<string, string> = {
    pdf: "application/pdf",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    doc: "application/msword",
    docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    zip: "application/zip",
    rar: "application/x-rar-compressed",
  };
  return map[ext] ?? "application/octet-stream";
}
