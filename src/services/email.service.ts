import nodemailer from "nodemailer";

export interface SendResetEmailOptions {
  to: string;
  lecturerName: string;
  resetUrl: string;
  expiresMinutes: number;
}

function parseSmtpPort(rawPort: string | undefined): number | null {
  const trimmed = rawPort?.trim();
  if (!trimmed) return null;
  const port = Number(trimmed);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    return null;
  }
  return port;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function isEmailServiceConfigured(): boolean {
  return Boolean(
    process.env.SMTP_HOST?.trim() &&
      parseSmtpPort(process.env.SMTP_PORT) !== null &&
      process.env.SMTP_USER?.trim() &&
      process.env.SMTP_PASS?.trim()
  );
}

export async function sendLecturerPasswordResetEmail(
  options: SendResetEmailOptions
): Promise<void> {
  if (!isEmailServiceConfigured()) {
    throw new Error(
      "Layanan pengiriman email (SMTP) belum dikonfigurasi pada server."
    );
  }

  const host = process.env.SMTP_HOST!.trim();
  const port = parseSmtpPort(process.env.SMTP_PORT)!;
  const secure = process.env.SMTP_SECURE?.trim() === "true" || port === 465;
  const user = process.env.SMTP_USER!.trim();
  const pass = process.env.SMTP_PASS!.trim();
  const from = process.env.SMTP_FROM?.trim() || user;

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user,
      pass,
    },
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 15_000,
  });

  const safeName = escapeHtml(options.lecturerName);
  const safeResetUrl = escapeHtml(options.resetUrl);

  try {
    await transporter.sendMail({
      from,
      to: options.to,
      subject: "Reset Kata Sandi Portal Dosen Gradia",
      text: [
        `Halo ${options.lecturerName},`,
        "",
        "Kami menerima permintaan untuk mengatur ulang kata sandi akun Portal Dosen Gradia Anda.",
        `Silakan buka tautan berikut untuk membuat kata sandi baru (berlaku ${options.expiresMinutes} menit dan hanya dapat digunakan satu kali):`,
        options.resetUrl,
        "",
        "Jika Anda tidak merasa meminta reset kata sandi, abaikan email ini.",
      ].join("\n"),
      html: `
        <div style="font-family: Arial, sans-serif; color: #1e293b; max-width: 520px; line-height: 1.6;">
          <h2 style="color: #4f46e5;">Reset Kata Sandi Portal Dosen Gradia</h2>
          <p>Halo <strong>${safeName}</strong>,</p>
          <p>Kami menerima permintaan untuk mengatur ulang kata sandi akun dosen Anda.</p>
          <p>Klik tombol di bawah ini untuk membuat kata sandi baru. Tautan ini berlaku selama <strong>${options.expiresMinutes} menit</strong> dan hanya dapat digunakan <strong>satu kali</strong>.</p>
          <p style="margin: 24px 0;">
            <a href="${safeResetUrl}" style="background-color: #4f46e5; color: #ffffff; padding: 12px 20px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
              Atur Ulang Kata Sandi
            </a>
          </p>
          <p style="font-size: 12px; color: #64748b;">Jika tombol tidak berfungsi, salin tautan ini ke browser Anda:<br/>${safeResetUrl}</p>
          <p style="font-size: 12px; color: #64748b;">Jika Anda tidak meminta pengaturan ulang kata sandi, abaikan email ini.</p>
        </div>
      `,
    });
  } catch (err: any) {
    const code = err?.code;
    const responseCode = err?.responseCode;
    if (code === "EAUTH" || responseCode === 535) {
      throw new Error(
        "Autentikasi layanan email (SMTP) gagal. Periksa konfigurasi kredensial SMTP pada server."
      );
    }
    if (
      code === "ECONNECTION" ||
      code === "ETIMEDOUT" ||
      code === "ESOCKET" ||
      code === "ENOTFOUND" ||
      code === "ECONNREFUSED"
    ) {
      throw new Error(
        "Tidak dapat terhubung ke server email (SMTP). Periksa host, port, dan koneksi jaringan server."
      );
    }
    throw new Error(
      "Gagal mengirim email tautan reset kata sandi melalui server SMTP."
    );
  }
}
