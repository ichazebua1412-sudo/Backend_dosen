export interface SendResetEmailOptions {
  to: string;
  lecturerName: string;
  resetUrl: string;
  expiresMinutes: number;
}

export function isEmailServiceConfigured(): boolean {
  return Boolean(
    process.env.SMTP_HOST?.trim() &&
      process.env.SMTP_PORT?.trim() &&
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

  let nodemailer: any;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    nodemailer = require("nodemailer");
  } catch {
    throw new Error(
      "Paket pengirim email (nodemailer) belum terpasang pada backend."
    );
  }

  const port = Number(process.env.SMTP_PORT) || 587;
  const secure = process.env.SMTP_SECURE === "true" || port === 465;
  const from = process.env.SMTP_FROM?.trim() || process.env.SMTP_USER!.trim();

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST!.trim(),
    port,
    secure,
    auth: {
      user: process.env.SMTP_USER!.trim(),
      pass: process.env.SMTP_PASS!.trim(),
    },
  });

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
        <p>Halo <strong>${options.lecturerName}</strong>,</p>
        <p>Kami menerima permintaan untuk mengatur ulang kata sandi akun dosen Anda.</p>
        <p>Klik tombol di bawah ini untuk membuat kata sandi baru. Tautan ini berlaku selama <strong>${options.expiresMinutes} menit</strong> dan hanya dapat digunakan <strong>satu kali</strong>.</p>
        <p style="margin: 24px 0;">
          <a href="${options.resetUrl}" style="background-color: #4f46e5; color: #ffffff; padding: 12px 20px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
            Atur Ulang Kata Sandi
          </a>
        </p>
        <p style="font-size: 12px; color: #64748b;">Jika tombol tidak berfungsi, salin tautan ini ke browser Anda:<br/>${options.resetUrl}</p>
        <p style="font-size: 12px; color: #64748b;">Jika Anda tidak meminta pengaturan ulang kata sandi, abaikan email ini.</p>
      </div>
    `,
  });
}
