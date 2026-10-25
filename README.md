# Gradia Backend - Portal Dosen API

Backend REST API untuk Portal Dosen Gradia yang dibangun dengan filosofi **Ponytail** (zero bloat, zero unnecessary abstractions, strict SQL safety with prepared statements, native platform features).

## 🚀 Fitur & Tech Stack

- **Runtime & Framework**: Node.js v24 + Express (TypeScript)
- **Database**: SQLite bawaan Node.js (`node:sqlite` DatabaseSync) dengan WAL mode & Foreign Keys aktif.
- **Autentikasi**: JWT (JSON Web Token) + `bcryptjs`
- **AI Feedback**: Google Gemini API (`@google/generative-ai`) dengan fallback cerdas berbasis heuristik OBE.
- **Import Nilai**: Excel / CSV parser via `xlsx`

---

## 🏃 Menjalankan Server

```bash
# Jalankan development server
npm run dev

# Build production
npm run build
npm start
```

Default URL: `http://localhost:5000`

---

## 🔑 Kredensial Default Dosen (Auto-Seeded)

- **NIDN**: `0412068201`
- **Email**: `hendra@kampus.ac.id`
- **Password**: `secretpassword123`

---

## 📡 Daftar Endpoint API

### 1. Autentikasi
- `POST /api/auth/login`
  - Body: `{ "identifier": "0412068201", "password": "secretpassword123" }`
  - Response: `{ "message": "Login berhasil.", "token": "...", "lecturer": {...} }`

### 2. Dashboard
- `GET /api/dashboard` (Auth required)
  - Mengembalikan statistik ringkas (`totalClasses`, `totalStudents`, `pendingGrading`, `aiReportsReady`) dan rekap kelas.

### 3. Manajemen Kelas
- `GET /api/classes` (Auth required): List kelas diampu dosen.
- `POST /api/classes` (Auth required): Tambah kelas baru.
  - Body: `{ "code": "TIF-3012", "title": "Pemrograman Web", "sks": 3, "prodi": "S1 Informatika" }`
- `GET /api/classes/:id` (Auth required): Detail kelas beserta mahasiswa terdaftar.
- `POST /api/classes/:id/students` (Auth required): Daftarkan mahasiswa ke kelas.

### 4. Penilaian & Import Nilai
- `GET /api/grades/:classId` (Auth required): Rekap nilai mahasiswa di kelas.
- `PUT /api/grades/:classId` (Auth required): Batch update nilai (tugas, uts, uas, status remedial).
- `POST /api/grades/:classId/import` (Auth required): Bulk import baris nilai dari Excel.

### 5. AI Feedback & OBE Analytics
- `POST /api/ai/feedback` (Auth required)
  - Body: `{ "studentName": "Citra Dewi", "nim": "2204101807", "courseName": "Pemrograman Web", "tugas": 65, "uts": 60, "uas": 62, "finalScore": 62.3, "letterGrade": "C" }`
  - Response: `{ "feedback": "...", "source": "gemini" | "rule-based" }`

### 6. Profil Dosen
- `GET /api/lecturer/profile` (Auth required)
- `PUT /api/lecturer/profile` (Auth required): Perbarui ruang kerja, nomor HP, dan jam konsultasi.
