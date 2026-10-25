import { Router, Response } from "express";
import { AuthRequest, authGuard } from "../middleware/auth.js";
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const router = Router();
const apiKey = process.env.GEMINI_API_KEY;
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

// Heuristic fallback generator (Ponytail zero-fail guarantee)
function generateRuleBasedFeedback(name: string, finalScore: number, tugas: number, uts: number, uas: number): string {
  if (finalScore >= 85) {
    return `Penguasaan materi oleh ${name} sangat istimewa pada seluruh komponen (Tugas ${tugas}, UTS ${uts}, UAS ${uas}). Memenuhi seluruh indikator capaian pembelajaran OBE dengan sangat memuaskan.`;
  } else if (finalScore >= 75) {
    return `Pemahaman konsep dan pengerjaan tugas oleh ${name} baik (Nilai Akhir ${finalScore}). Disarankan untuk memperdalam studi kasus mandiri pada materi evaluasi akhir agar performa lebih optimal.`;
  } else if (finalScore >= 65) {
    return `Capaian kompetensi dasar terpenuhi cukup baik. Namun mahasiswa perlu meningkatkan ketelitian pada pengerjaan ujian dan praktikum evaluasi.`;
  } else {
    return `Mahasiswa direkomendasikan mengikuti sesi bimbingan remedial dan penguatan modul dasar untuk mengejar ketertinggalan capaian pembelajaran mata kuliah.`;
  }
}

router.post("/feedback", authGuard, async (req: AuthRequest, res: Response) => {
  const { studentName, nim, courseName, tugas, uts, uas, finalScore, letterGrade, classSummary } = req.body;

  if (classSummary) {
    const { totalStudents, avgScore, passRate, remedialCount, className } = classSummary;
    const strength = `Sebanyak ${passRate || 0}% mahasiswa telah mencapai ambang batas kompetensi CPMK dengan rata-rata nilai kelas ${avgScore || 0}. Pemahaman konsep dasar telah tuntas dengan baik.`;
    const improvement = remedialCount > 0
      ? `Terdapat ${remedialCount} mahasiswa yang membutuhkan bimbingan intensif dan remedial untuk mengejar capaian CPMK utama.`
      : `Seluruh mahasiswa tuntas di atas KKM. Peningkatan dapat difokuskan pada pengayaan studi kasus lanjutan.`;
    const recommendation = remedialCount > 0
      ? `Jadwalkan 1 sesi remedial praktikum terarah dan berikan materi pendampingan bagi mahasiswa yang belum tuntas.`
      : `Pertahankan ritme pembelajaran dan persiapkan proyek portofolio akhir berbasis industri.`;

    if (genAI && apiKey && apiKey.trim().length > 0) {
      try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const prompt = `Sebagai dosen pengampu OBE untuk kelas "${className || "Kelas"}", buatkan telaah AI dalam format JSON dengan kunci "strength", "improvement", dan "recommendation" (Bahasa Indonesia ringkas):
Total: ${totalStudents} mahasiswa, Rata-rata: ${avgScore}, Kelulusan: ${passRate}%, Remedial: ${remedialCount}.`;
        const result = await model.generateContent(prompt);
        const text = result.response.text();
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          return res.json({ ...parsed, source: "gemini" });
        }
      } catch (err: any) {
        console.warn("Gemini class analysis fallback:", err.message);
      }
    }

    return res.json({ strength, improvement, recommendation, source: "rule-based" });
  }

  if (!studentName) {
    return res.status(400).json({ error: "Nama mahasiswa atau classSummary wajib disediakan." });
  }

  const numScore = Number(finalScore) || 0;
  const numTugas = Number(tugas) || 0;
  const numUts = Number(uts) || 0;
  const numUas = Number(uas) || 0;

  // If Gemini API Key is available, use Gemini model
  if (genAI && apiKey && apiKey.trim().length > 0) {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const prompt = `Sebagai dosen pengampu mata kuliah "${courseName || "Akademik"}", berikan umpan balik evaluasi akademik (AI feedback) berbasis Outcome-Based Education (OBE) secara ringkas, konstruktif, dan profesional (maksimal 2 kalimat dalam Bahasa Indonesia) untuk mahasiswa:
Nama: ${studentName} (${nim || "-"})
Tugas: ${numTugas}, UTS: ${numUts}, UAS: ${numUas}, Nilai Akhir: ${numScore} (${letterGrade || "-"}).`;

      const result = await model.generateContent(prompt);
      const text = result.response.text();
      return res.json({ feedback: text.trim(), source: "gemini" });
    } catch (err: any) {
      console.warn("Gemini API call failed, falling back to rule-based engine:", err.message);
    }
  }

  // Fallback to rule-based engine
  const feedback = generateRuleBasedFeedback(studentName, numScore, numTugas, numUts, numUas);
  return res.json({ feedback, source: "rule-based" });
});

export default router;
