import { put, del } from "@vercel/blob";

export type BlobFolder = "attachments" | "assignments" | "avatars";

export interface BlobUploadResult {
  url: string;
  pathname: string;
  contentType: string;
  size: number;
}

/**
 * Upload buffer ke Vercel Blob.
 * Semua file harus melalui backend — TIDAK boleh langsung dari FE / mobile.
 *
 * @param buffer    - File bytes
 * @param filename  - Nama file asli (dengan ekstensi)
 * @param folder    - Sub-folder: 'attachments' | 'assignments' | 'avatars'
 */
export async function uploadToBlob(
  buffer: Buffer,
  filename: string,
  folder: BlobFolder = "attachments"
): Promise<BlobUploadResult> {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) {
    throw new Error(
      "BLOB_READ_WRITE_TOKEN tidak ditemukan di environment variables."
    );
  }

  // Sanitize filename: hapus karakter berbahaya
  const safe = filename.replace(/[^a-zA-Z0-9._-]/g, "_");
  const pathname = `${folder}/${Date.now()}_${safe}`;

  const blob = await put(pathname, buffer, {
    access: "public",
    token,
    contentType: detectContentType(filename),
  });

  return {
    url: blob.url,
    pathname: blob.pathname,
    contentType: blob.contentType,
    size: buffer.byteLength,
  };
}

/**
 * Hapus file dari Vercel Blob berdasarkan URL.
 */
export async function deleteFromBlob(url: string): Promise<void> {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) return;
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
