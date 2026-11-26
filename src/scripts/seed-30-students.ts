import { db } from "../db.js";
import { isSameProdi } from "../utils/prodi.js";

const defaultPasswordHash = "$2b$10$K2K8WxZHFbU04LaxiJPK4OvP.nXJqfst7X8OX5O6ERIUzDnqDQxuu"; // password123

export const studentsList = [
  // Existing students
  { nim: "251234567899", name: "Sinta Permata", email: "sinta@kampus.ac.id", prodi: "Teknik Informatika" },
  { nim: "22010101", name: "Siti Rahma", email: "siti.rahma@student.gradia.ac.id", prodi: "Teknik Informatika" },
  { nim: "22010102", name: "Ahmad Fauzi", email: "ahmad.fauzi@student.gradia.ac.id", prodi: "Teknik Informatika" },
  { nim: "22010103", name: "Dewi Lestari", email: "dewi.lestari@student.gradia.ac.id", prodi: "Teknik Informatika" },
  { nim: "22010104", name: "Rian Pratama", email: "rian.pratama@student.gradia.ac.id", prodi: "Teknik Informatika" },
  { nim: "22020201", name: "Citra Kirana", email: "citra.kirana@student.gradia.ac.id", prodi: "Sistem Informasi" },

  // Teknik Informatika batch
  { nim: "23010105", name: "Muhammad Rizky Pratama", email: "rizky.pratama@student.gradia.ac.id", prodi: "Teknik Informatika" },
  { nim: "23010106", name: "Aditiya Bagus Saputra", email: "aditiya.bagus@student.gradia.ac.id", prodi: "Teknik Informatika" },
  { nim: "23010107", name: "Nabila Putri Andini", email: "nabila.putri@student.gradia.ac.id", prodi: "Teknik Informatika" },
  { nim: "23010108", name: "Fajar Nugroho", email: "fajar.nugroho@student.gradia.ac.id", prodi: "Teknik Informatika" },
  { nim: "23010109", name: "Anisa Rahmawati", email: "anisa.rahmawati@student.gradia.ac.id", prodi: "Teknik Informatika" },
  { nim: "23010110", name: "Dimas Arya Wicaksono", email: "dimas.arya@student.gradia.ac.id", prodi: "Teknik Informatika" },
  { nim: "23010111", name: "Bayu Tri Pamungkas", email: "bayu.tri@student.gradia.ac.id", prodi: "Teknik Informatika" },
  { nim: "23010112", name: "Farah Diba Azzahra", email: "farah.diba@student.gradia.ac.id", prodi: "Teknik Informatika" },
  { nim: "23010113", name: "Ilham Maulana", email: "ilham.maulana@student.gradia.ac.id", prodi: "Teknik Informatika" },
  { nim: "23010114", name: "Putri Ayu Wulandari", email: "putri.ayu@student.gradia.ac.id", prodi: "Teknik Informatika" },
  { nim: "23010115", name: "Kevin Alamsyah", email: "kevin.alamsyah@student.gradia.ac.id", prodi: "Teknik Informatika" },
  { nim: "23010116", name: "Nadya Eka Safitri", email: "nadya.eka@student.gradia.ac.id", prodi: "Teknik Informatika" },
  { nim: "23010117", name: "Wahyu Hidayat", email: "wahyu.hidayat@student.gradia.ac.id", prodi: "Teknik Informatika" },
  { nim: "23010118", name: "Tiara Maharani", email: "tiara.maharani@student.gradia.ac.id", prodi: "Teknik Informatika" },
  { nim: "23010119", name: "Gilang Ramadhan", email: "gilang.ramadhan@student.gradia.ac.id", prodi: "Teknik Informatika" },
  { nim: "23010120", name: "Zahra Nur Aulia", email: "zahra.nur@student.gradia.ac.id", prodi: "Teknik Informatika" },
  { nim: "23010121", name: "Dwi Cahyo Prasetyo", email: "dwi.cahyo@student.gradia.ac.id", prodi: "Teknik Informatika" },
  { nim: "23010122", name: "Alifia Salsa Bella", email: "alifia.salsa@student.gradia.ac.id", prodi: "Teknik Informatika" },
  { nim: "23010123", name: "Reza Kurniawan", email: "reza.kurniawan@student.gradia.ac.id", prodi: "Teknik Informatika" },
  { nim: "23010124", name: "Maya Anggraini", email: "maya.anggraini@student.gradia.ac.id", prodi: "Teknik Informatika" },
  { nim: "23010125", name: "Hendra Wijaya", email: "hendra.wijaya@student.gradia.ac.id", prodi: "Teknik Informatika" },
  { nim: "23010126", name: "Syifa Fauziah", email: "syifa.fauziah@student.gradia.ac.id", prodi: "Teknik Informatika" },
  { nim: "23010127", name: "Rendy Septian", email: "rendy.septian@student.gradia.ac.id", prodi: "Teknik Informatika" },
  { nim: "23010128", name: "Gita Savitri", email: "gita.savitri@student.gradia.ac.id", prodi: "Teknik Informatika" },
  { nim: "23010129", name: "Bagas Dwi Putra", email: "bagas.dwi@student.gradia.ac.id", prodi: "Teknik Informatika" },
  { nim: "23010130", name: "Intan Permatasari", email: "intan.permatasari@student.gradia.ac.id", prodi: "Teknik Informatika" },
  { nim: "23010131", name: "Yoga Pratama", email: "yoga.pratama@student.gradia.ac.id", prodi: "Teknik Informatika" },
  { nim: "23010132", name: "Salma Khoirunnisa", email: "salma.khoirunnisa@student.gradia.ac.id", prodi: "Teknik Informatika" },
  { nim: "23010133", name: "Taufik Hidayat", email: "taufik.hidayat@student.gradia.ac.id", prodi: "Teknik Informatika" },
  { nim: "23010134", name: "Cantika Dewi", email: "cantika.dewi@student.gradia.ac.id", prodi: "Teknik Informatika" },
  { nim: "23010135", name: "Ari Wibowo", email: "ari.wibowo@student.gradia.ac.id", prodi: "Teknik Informatika" },
  { nim: "23010136", name: "Jessica Olivia", email: "jessica.olivia@student.gradia.ac.id", prodi: "Teknik Informatika" },
  { nim: "23010137", name: "Bintang Kejora", email: "bintang.kejora@student.gradia.ac.id", prodi: "Teknik Informatika" },
  { nim: "23010138", name: "Surya Dharma", email: "surya.dharma@student.gradia.ac.id", prodi: "Teknik Informatika" },
  { nim: "23010139", name: "Melati Kusuma", email: "melati.kusuma@student.gradia.ac.id", prodi: "Teknik Informatika" },
  { nim: "23010140", name: "Rio Febrian", email: "rio.febrian@student.gradia.ac.id", prodi: "Teknik Informatika" },

  // Sistem Informasi batch
  { nim: "23020202", name: "Agung Prasetyo", email: "agung.prasetyo@student.gradia.ac.id", prodi: "Sistem Informasi" },
  { nim: "23020203", name: "Bella Safira", email: "bella.safira@student.gradia.ac.id", prodi: "Sistem Informasi" },
  { nim: "23020204", name: "Candra Wijaya", email: "candra.wijaya@student.gradia.ac.id", prodi: "Sistem Informasi" },
  { nim: "23020205", name: "Dina Marlina", email: "dina.marlina@student.gradia.ac.id", prodi: "Sistem Informasi" },
  { nim: "23020206", name: "Eko Purnomo", email: "eko.purnomo@student.gradia.ac.id", prodi: "Sistem Informasi" },
  { nim: "23020207", name: "Fitri Handayani", email: "fitri.handayani@student.gradia.ac.id", prodi: "Sistem Informasi" },
  { nim: "23020208", name: "Galih Prakoso", email: "galih.prakoso@student.gradia.ac.id", prodi: "Sistem Informasi" },
  { nim: "23020209", name: "Hesti Purwanti", email: "hesti.purwanti@student.gradia.ac.id", prodi: "Sistem Informasi" },
  { nim: "23020210", name: "Indra Gunawan", email: "indra.gunawan@student.gradia.ac.id", prodi: "Sistem Informasi" },
  { nim: "23020211", name: "Julia Perezita", email: "julia.perezita@student.gradia.ac.id", prodi: "Sistem Informasi" },
  { nim: "23020212", name: "Krisna Murti", email: "krisna.murti@student.gradia.ac.id", prodi: "Sistem Informasi" },
  { nim: "23020213", name: "Larasati Wibisono", email: "larasati.wibisono@student.gradia.ac.id", prodi: "Sistem Informasi" },
  { nim: "23020214", name: "Mifta Huljannah", email: "mifta.huljannah@student.gradia.ac.id", prodi: "Sistem Informasi" },
  { nim: "23020215", name: "Naufal Zaki", email: "naufal.zaki@student.gradia.ac.id", prodi: "Sistem Informasi" },
  { nim: "23020216", name: "Olivia Zahrani", email: "olivia.zahrani@student.gradia.ac.id", prodi: "Sistem Informasi" },
  { nim: "23020217", name: "Panji Asmoro", email: "panji.asmoro@student.gradia.ac.id", prodi: "Sistem Informasi" },
  { nim: "23020218", name: "Qonita Luthfiah", email: "qonita.luthfiah@student.gradia.ac.id", prodi: "Sistem Informasi" },
  { nim: "23020219", name: "Raden Mas Danu", email: "raden.danu@student.gradia.ac.id", prodi: "Sistem Informasi" },
  { nim: "23020220", name: "Salsabila Firdaus", email: "salsabila.firdaus@student.gradia.ac.id", prodi: "Sistem Informasi" },
  { nim: "23020221", name: "Tri Wahyuni", email: "tri.wahyuni@student.gradia.ac.id", prodi: "Sistem Informasi" },
  { nim: "23020222", name: "Utami Pratiwi", email: "utami.pratiwi@student.gradia.ac.id", prodi: "Sistem Informasi" },
  { nim: "23020223", name: "Vicky Prasojo", email: "vicky.prasojo@student.gradia.ac.id", prodi: "Sistem Informasi" },
  { nim: "23020224", name: "Winda Novitasari", email: "winda.novitasari@student.gradia.ac.id", prodi: "Sistem Informasi" },
  { nim: "23020225", name: "Xaverius Putra", email: "xaverius.putra@student.gradia.ac.id", prodi: "Sistem Informasi" },
  { nim: "23020226", name: "Yasmin Aulia", email: "yasmin.aulia@student.gradia.ac.id", prodi: "Sistem Informasi" },
  { nim: "23020227", name: "Zainal Abidin", email: "zainal.abidin@student.gradia.ac.id", prodi: "Sistem Informasi" },
  { nim: "23020228", name: "Amanda Manopo", email: "amanda.manopo@student.gradia.ac.id", prodi: "Sistem Informasi" },
  { nim: "23020229", name: "Bobby Nasution", email: "bobby.nasution@student.gradia.ac.id", prodi: "Sistem Informasi" },
  { nim: "23020230", name: "Chika Jessica", email: "chika.jessica@student.gradia.ac.id", prodi: "Sistem Informasi" },
  { nim: "23020231", name: "Derry Sulaiman", email: "derry.sulaiman@student.gradia.ac.id", prodi: "Sistem Informasi" },
  { nim: "23020232", name: "Endah Prameswari", email: "endah.prameswari@student.gradia.ac.id", prodi: "Sistem Informasi" },
  { nim: "23020233", name: "Farhan Halim", email: "farhan.halim@student.gradia.ac.id", prodi: "Sistem Informasi" },
  { nim: "23020234", name: "Gina Sonia", email: "gina.sonia@student.gradia.ac.id", prodi: "Sistem Informasi" },
  { nim: "23020235", name: "Hafiz Al-Fatih", email: "hafiz.alfatih@student.gradia.ac.id", prodi: "Sistem Informasi" }
];

export function seedClassesWithMin30Students(): void {
  console.log("🚀 Memulai proses seeding mahasiswa (min. 30 per kelas)...");

  // 1. Insert students
  const insertStudent = db.prepare(`
    INSERT INTO students (nim, name, email, password_hash, prodi, status)
    VALUES (?, ?, ?, ?, ?, ?)
    ON CONFLICT(nim) DO UPDATE SET
      name = excluded.name,
      email = excluded.email,
      prodi = excluded.prodi,
      status = 'Aktif'
  `);

  for (const s of studentsList) {
    insertStudent.run(s.nim, s.name, s.email, defaultPasswordHash, s.prodi, "Aktif");
  }
  console.log(`✅ Berhasil memastikan ${studentsList.length} mahasiswa terdaftar di database.`);

  // 2. Fetch all students id map
  const allStudents = db.prepare("SELECT id, nim, name, prodi FROM students").all() as any[];
  const studentByNim: Record<string, number> = {};
  allStudents.forEach((s) => {
    studentByNim[s.nim] = s.id;
  });

  // 3. Fetch all classes
  const classes = db.prepare("SELECT id, code, title, capacity, prodi FROM classes").all() as any[];
  console.log(`📚 Menemukan ${classes.length} kelas di database:`);
  classes.forEach((c) => console.log(`   - [ID ${c.id}] ${c.code}: ${c.title}`));

  // Cohort mappings (34-36 students per class)
  const if2408Nims = [
    "251234567899", "22010101", "22010102", "22010103", "22010104",
    "23010105", "23010106", "23010107", "23010108", "23010109", "23010110",
    "23010111", "23010112", "23010113", "23010114", "23010115", "23010116",
    "23010117", "23010118", "23010119", "23010120", "23010121", "23010122",
    "23010123", "23010124", "23010125", "23010126", "23010127", "23010128",
    "23010129", "23010130", "23010131", "23010132", "23010133", "23010134"
  ];

  const if301Nims = [
    "251234567899", "22010101", "22010102",
    "23010111", "23010112", "23010113", "23010114", "23010115", "23010116",
    "23010117", "23010118", "23010119", "23010120", "23010121", "23010122",
    "23010123", "23010124", "23010125", "23010126", "23010127", "23010128",
    "23010129", "23010130", "23010131", "23010132", "23010133", "23010134",
    "23010135", "23010136", "23010137", "23010138", "23010139", "23010140"
  ];

  const si102Nims = [
    "22020201",
    "23020202", "23020203", "23020204", "23020205", "23020206", "23020207",
    "23020208", "23020209", "23020210", "23020211", "23020212", "23020213",
    "23020214", "23020215", "23020216", "23020217", "23020218", "23020219",
    "23020220", "23020221", "23020222", "23020223", "23020224", "23020225",
    "23020226", "23020227", "23020228", "23020229", "23020230", "23020231",
    "23020232", "23020233", "23020234", "23020235"
  ];

  const enrollStmt = db.prepare("INSERT OR IGNORE INTO class_enrollments (class_id, student_id) VALUES (?, ?)");
  const gradeInitStmt = db.prepare(`
    INSERT OR IGNORE INTO grades (enrollment_id, tugas, uts, uas, final_score, letter_grade, status, ai_feedback)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const cls of classes) {
    let targetNims: string[] = [];
    if (cls.code === "IF2408") targetNims = if2408Nims;
    else if (cls.code === "IF301") targetNims = if301Nims;
    else if (cls.code === "SI102") targetNims = si102Nims;
    else {
      // Filter students matching the class prodi; generate additional students if < 30
      const matchingStudents = allStudents.filter((s) => isSameProdi(s.prodi, cls.prodi));
      if (matchingStudents.length < 30) {
        const needed = 30 - matchingStudents.length;
        const prodiPrefix = (cls.prodi || "PR").replace(/[^A-Za-z]/g, "").slice(0, 2).toUpperCase() || "PR";
        for (let idx = 1; idx <= needed; idx++) {
          const genNim = `24${cls.id}${String(idx).padStart(4, "0")}`;
          const genName = `Mahasiswa ${prodiPrefix} ${idx}`;
          const genEmail = `${genNim.toLowerCase()}@student.gradia.ac.id`;
          insertStudent.run(genNim, genName, genEmail, defaultPasswordHash, cls.prodi, "Aktif");
          const inserted = db.prepare("SELECT id, nim, name, prodi FROM students WHERE nim = ?").get(genNim) as any;
          if (inserted) {
            studentByNim[inserted.nim] = inserted.id;
            allStudents.push(inserted);
            matchingStudents.push(inserted);
          }
        }
      }
      targetNims = matchingStudents.slice(0, 32).map((s) => s.nim);
    }

    // Ensure capacity accommodates all students
    if (cls.capacity < targetNims.length) {
      db.prepare("UPDATE classes SET capacity = ? WHERE id = ?").run(Math.max(40, targetNims.length + 5), cls.id);
    }

    for (let i = 0; i < targetNims.length; i++) {
      const nim = targetNims[i];
      const sId = studentByNim[nim];
      if (!sId) continue;

      enrollStmt.run(cls.id, sId);

      const enr = db.prepare("SELECT id FROM class_enrollments WHERE class_id = ? AND student_id = ?").get(cls.id, sId) as any;
      if (!enr) continue;

      const existingGrade = db.prepare("SELECT id FROM grades WHERE enrollment_id = ?").get(enr.id);
      if (!existingGrade) {
        let tugas: number | null = null;
        let uts: number | null = null;
        let uas: number | null = null;
        let finalScore: number | null = null;
        let letterGrade: string | null = null;
        let status = "Belum lengkap";
        let aiFeedback: string | null = null;

        if (i % 6 === 0) {
          tugas = 88.0 + (i % 7);
          uts = 85.0 + (i % 8);
          uas = 90.0 + (i % 6);
          finalScore = Math.round((tugas * 0.3 + uts * 0.3 + uas * 0.4) * 10) / 10;
          letterGrade = "A";
          status = "Tersimpan";
          aiFeedback = "Penguasaan capaian pembelajaran sangat baik dan konsisten pada seluruh evaluasi OBE.";
        } else if (i % 6 === 1 || i % 6 === 2) {
          tugas = 75.0 + (i % 10);
          uts = 74.0 + (i % 8);
          uas = 80.0 + (i % 5);
          finalScore = Math.round((tugas * 0.3 + uts * 0.3 + uas * 0.4) * 10) / 10;
          letterGrade = finalScore >= 80 ? "B+" : "B";
          status = "Tersimpan";
          aiFeedback = "Pemahaman teori dan tugas praktik memadai, siap melanjutkan ke materi tingkat lanjut.";
        } else if (i % 6 === 3) {
          tugas = 65.0 + (i % 5);
          uts = 62.0 + (i % 6);
          uas = 68.0 + (i % 4);
          finalScore = Math.round((tugas * 0.3 + uts * 0.3 + uas * 0.4) * 10) / 10;
          letterGrade = finalScore >= 65 ? "C+" : "C";
          status = "Tersimpan";
          aiFeedback = "Capaian pembelajaran memenuhi standar minimal, disarankan memperbanyak latihan soal.";
        } else if (i % 6 === 4) {
          tugas = 50.0 + (i % 5);
          uts = 48.0 + (i % 6);
          uas = 52.0 + (i % 4);
          finalScore = Math.round((tugas * 0.3 + uts * 0.3 + uas * 0.4) * 10) / 10;
          letterGrade = "E";
          status = "Perlu remedial";
          aiFeedback = "Mahasiswa disarankan mengikuti bimbingan dan ujian remedial.";
        } else {
          tugas = 75.0 + (i % 10);
          uts = 70.0 + (i % 5);
          status = "Belum lengkap";
          aiFeedback = "Komponen evaluasi akhir (UAS) belum diinput oleh dosen pengampu.";
        }

        gradeInitStmt.run(enr.id, tugas, uts, uas, finalScore, letterGrade, status, aiFeedback);
      }
    }
  }

  // 4. Verification
  const counts = db.prepare(`
    SELECT c.id, c.code, c.title, c.capacity, COUNT(ce.id) as enrolled_count
    FROM classes c
    LEFT JOIN class_enrollments ce ON c.id = ce.class_id
    GROUP BY c.id
  `).all() as any[];

  console.log("\n📊 Ringkasan Jumlah Mahasiswa per Kelas Setelah Update:");
  counts.forEach((c) => {
    console.log(`   - Kelas ${c.code} (${c.title}): ${c.enrolled_count} Mahasiswa (Kapasitas: ${c.capacity})`);
  });
}

// Run immediately if executed via CLI
if (process.argv[1]?.includes("seed-30-students")) {
  seedClassesWithMin30Students();
}
