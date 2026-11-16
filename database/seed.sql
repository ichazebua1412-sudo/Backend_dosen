-- =====================================================================
-- GRADIA ACADEMIC PORTAL - SEED DATA (RESILIENT & IDEMPOTENT)
-- =====================================================================
-- Menggunakan subquery untuk resolusi Foreign Key sehingga aman dijalankan
-- pada database baru maupun database yang sudah memiliki data awal.
-- =====================================================================

-- 1. SEED ADMIN DEFAULT (admin / adminpassword123)
INSERT OR IGNORE INTO admins (username, email, password_hash, name, role)
VALUES (
    'admin',
    'admin@gradia.ac.id',
    '$2b$10$tUBqudlhB9M6wxaD5YoYB.JW3OUsfe8g4Jx2QSbFugpZVt7d0Olh.',
    'Administrator Akademik Gradia',
    'superadmin'
);

-- 2. SEED DOSEN (LECTURERS) (password123)
INSERT OR IGNORE INTO lecturers (nidn, email, password_hash, name, title_prefix, title_suffix, phone, office_room, consult_hours, status)
VALUES
(
    '1234567890',
    'dosen@gradia.ac.id',
    '$2b$10$K2K8WxZHFbU04LaxiJPK4OvP.nXJqfst7X8OX5O6ERIUzDnqDQxuu',
    'Budi Santoso',
    'Prof. Dr.',
    'M.Kom.',
    '081234567890',
    'Gd. A Lt. 3 R. 302',
    'Senin & Rabu, 13:00 - 15:00 WIB',
    'active'
),
(
    '0412068201',
    'hendra@gradia.ac.id',
    '$2b$10$K2K8WxZHFbU04LaxiJPK4OvP.nXJqfst7X8OX5O6ERIUzDnqDQxuu',
    'Hendra Gunawan',
    'Dr.',
    'S.T., M.T.',
    '081298765432',
    'Gd. B Lt. 2 R. 205',
    'Selasa & Kamis, 10:00 - 12:00 WIB',
    'active'
);

-- 3. SEED MAHASISWA (STUDENTS) (password123)
INSERT OR IGNORE INTO students (nim, name, email, password_hash, prodi, status)
VALUES
('251234567899', 'Sinta Permata', 'sinta@kampus.ac.id', '$2b$10$K2K8WxZHFbU04LaxiJPK4OvP.nXJqfst7X8OX5O6ERIUzDnqDQxuu', 'Teknik Informatika', 'Aktif'),
('22010101', 'Siti Rahma', 'siti.rahma@student.gradia.ac.id', '$2b$10$K2K8WxZHFbU04LaxiJPK4OvP.nXJqfst7X8OX5O6ERIUzDnqDQxuu', 'Teknik Informatika', 'Aktif'),
('22010102', 'Ahmad Fauzi', 'ahmad.fauzi@student.gradia.ac.id', '$2b$10$K2K8WxZHFbU04LaxiJPK4OvP.nXJqfst7X8OX5O6ERIUzDnqDQxuu', 'Teknik Informatika', 'Aktif'),
('22010103', 'Dewi Lestari', 'dewi.lestari@student.gradia.ac.id', '$2b$10$K2K8WxZHFbU04LaxiJPK4OvP.nXJqfst7X8OX5O6ERIUzDnqDQxuu', 'Teknik Informatika', 'Aktif'),
('22010104', 'Rian Pratama', 'rian.pratama@student.gradia.ac.id', '$2b$10$K2K8WxZHFbU04LaxiJPK4OvP.nXJqfst7X8OX5O6ERIUzDnqDQxuu', 'Teknik Informatika', 'Aktif'),
('22020201', 'Citra Kirana', 'citra.kirana@student.gradia.ac.id', '$2b$10$K2K8WxZHFbU04LaxiJPK4OvP.nXJqfst7X8OX5O6ERIUzDnqDQxuu', 'Sistem Informasi', 'Aktif');

-- Pastikan password_hash terupdate jika record mahasiswa sudah ada sebelumnya
UPDATE students SET password_hash = '$2b$10$K2K8WxZHFbU04LaxiJPK4OvP.nXJqfst7X8OX5O6ERIUzDnqDQxuu'
WHERE password_hash IS NULL OR password_hash = '';

-- 4. SEED KELAS DENGAN FOREIGN KEY DOSEN
INSERT OR IGNORE INTO classes (lecturer_id, code, title, sks, prodi, semester, academic_year, capacity, schedule, room)
SELECT id, 'IF2408', 'Algoritma & Pemrograman Terapan', 3, 'Teknik Informatika', 3, '2024/2025 Ganjil', 40, 'Senin, 08:00 - 10:30 WIB', 'Lab Komputer 2'
FROM lecturers WHERE nidn = '1234567890'
AND NOT EXISTS (SELECT 1 FROM classes WHERE code = 'IF2408');

INSERT OR IGNORE INTO classes (lecturer_id, code, title, sks, prodi, semester, academic_year, capacity, schedule, room)
SELECT id, 'IF301', 'Struktur Data & Rekayasa Perangkat Lunak', 4, 'Teknik Informatika', 4, '2024/2025 Ganjil', 35, 'Rabu, 10:00 - 12:30 WIB', 'Ruang Teori 301'
FROM lecturers WHERE nidn = '1234567890'
AND NOT EXISTS (SELECT 1 FROM classes WHERE code = 'IF301');

INSERT OR IGNORE INTO classes (lecturer_id, code, title, sks, prodi, semester, academic_year, capacity, schedule, room)
SELECT id, 'SI102', 'Basis Data Lanjut', 3, 'Sistem Informasi', 2, '2024/2025 Ganjil', 45, 'Kamis, 13:00 - 15:30 WIB', 'Lab Basis Data'
FROM lecturers WHERE nidn = '0412068201'
AND NOT EXISTS (SELECT 1 FROM classes WHERE code = 'SI102');

-- 5. SEED ENROLLMENT MAHASISWA KE KELAS
INSERT OR IGNORE INTO class_enrollments (class_id, student_id)
SELECT c.id, s.id
FROM classes c, students s
WHERE c.code = 'IF2408' AND s.nim IN ('251234567899', '22010101', '22010102', '22010103', '22010104');

INSERT OR IGNORE INTO class_enrollments (class_id, student_id)
SELECT c.id, s.id
FROM classes c, students s
WHERE c.code = 'IF301' AND s.nim IN ('251234567899', '22010101', '22010102');

INSERT OR IGNORE INTO class_enrollments (class_id, student_id)
SELECT c.id, s.id
FROM classes c, students s
WHERE c.code = 'SI102' AND s.nim IN ('251234567899', '22020201');

-- 6. SEED NILAI & AI FEEDBACK
-- Sinta Permata
INSERT OR IGNORE INTO grades (enrollment_id, tugas, uts, uas, final_score, letter_grade, status, ai_feedback)
SELECT ce.id, 92.0, 88.0, 95.0, 92.0, 'A', 'Tersimpan',
       'Penguasaan materi sangat baik pada seluruh indikator capaian pembelajaran mata kuliah Algoritma & Pemrograman Terapan.'
FROM class_enrollments ce
JOIN classes c ON ce.class_id = c.id
JOIN students s ON ce.student_id = s.id
WHERE c.code = 'IF2408' AND s.nim = '251234567899';

INSERT OR IGNORE INTO grades (enrollment_id, tugas, uts, uas, final_score, letter_grade, status, ai_feedback)
SELECT ce.id, 85.0, 80.0, 86.0, 83.9, 'B+', 'Tersimpan',
       'Kemampuan analisis struktur data dan perancangan modular sangat memuaskan pada studi kasus rekayasa perangkat lunak.'
FROM class_enrollments ce
JOIN classes c ON ce.class_id = c.id
JOIN students s ON ce.student_id = s.id
WHERE c.code = 'IF301' AND s.nim = '251234567899';

INSERT OR IGNORE INTO grades (enrollment_id, tugas, uts, uas, final_score, letter_grade, status, ai_feedback)
SELECT ce.id, 88.0, 85.0, 90.0, 87.9, 'A', 'Tersimpan',
       'Pemahaman kueri SQL relasional dan normalisasi skema luar biasa dalam perancangan basis data transaksi.'
FROM class_enrollments ce
JOIN classes c ON ce.class_id = c.id
JOIN students s ON ce.student_id = s.id
WHERE c.code = 'SI102' AND s.nim = '251234567899';

-- Siti Rahma
INSERT OR IGNORE INTO grades (enrollment_id, tugas, uts, uas, final_score, letter_grade, status, ai_feedback)
SELECT ce.id, 88.0, 85.0, 90.0, 87.9, 'A', 'Tersimpan',
       'Penguasaan materi oleh Siti Rahma sangat istimewa pada seluruh komponen (Tugas 88, UTS 85, UAS 90). Memenuhi seluruh indikator capaian pembelajaran OBE dengan sangat memuaskan.'
FROM class_enrollments ce
JOIN classes c ON ce.class_id = c.id
JOIN students s ON ce.student_id = s.id
WHERE c.code = 'IF2408' AND s.nim = '22010101';

-- Ahmad Fauzi
INSERT OR IGNORE INTO grades (enrollment_id, tugas, uts, uas, final_score, letter_grade, status, ai_feedback)
SELECT ce.id, 78.0, 75.0, 80.0, 77.9, 'B', 'Tersimpan',
       'Pemahaman konsep dan pengerjaan tugas oleh Ahmad Fauzi baik (Nilai Akhir 77.9). Disarankan untuk memperdalam studi kasus mandiri pada materi evaluasi akhir agar performa lebih optimal.'
FROM class_enrollments ce
JOIN classes c ON ce.class_id = c.id
JOIN students s ON ce.student_id = s.id
WHERE c.code = 'IF2408' AND s.nim = '22010102';

-- Dewi Lestari
INSERT OR IGNORE INTO grades (enrollment_id, tugas, uts, uas, final_score, letter_grade, status, ai_feedback)
SELECT ce.id, 50.0, 55.0, 48.0, 50.7, 'E', 'Perlu remedial',
       'Mahasiswa direkomendasikan mengikuti sesi bimbingan remedial dan penguatan modul dasar untuk mengejar ketertinggalan capaian pembelajaran mata kuliah.'
FROM class_enrollments ce
JOIN classes c ON ce.class_id = c.id
JOIN students s ON ce.student_id = s.id
WHERE c.code = 'IF2408' AND s.nim = '22010103';

-- Rian Pratama
INSERT OR IGNORE INTO grades (enrollment_id, status)
SELECT ce.id, 'Belum lengkap'
FROM class_enrollments ce
JOIN classes c ON ce.class_id = c.id
JOIN students s ON ce.student_id = s.id
WHERE c.code = 'IF2408' AND s.nim = '22010104';

-- 7. SEED KELAS TAMBAHAN UNTUK MOBILE
INSERT OR IGNORE INTO classes (lecturer_id, code, title, sks, prodi, semester, academic_year, capacity, schedule, room)
SELECT id, 'IF202', 'Pemrograman Mobile', 4, 'Teknik Informatika', 3, '2024/2025 Ganjil', 35, 'Selasa, 10:00 - 11:40 WIB', 'Ruang B.2.1'
FROM lecturers WHERE nidn = '1234567890'
AND NOT EXISTS (SELECT 1 FROM classes WHERE code = 'IF202');

INSERT OR IGNORE INTO classes (lecturer_id, code, title, sks, prodi, semester, academic_year, capacity, schedule, room)
SELECT id, 'IF203', 'Desain User Interface dan User Experience', 3, 'Teknik Informatika', 3, '2024/2025 Ganjil', 40, 'Senin, 13:00 - 15:30 WIB', 'Lab Multimedia'
FROM lecturers WHERE nidn = '1234567890'
AND NOT EXISTS (SELECT 1 FROM classes WHERE code = 'IF203');

INSERT OR IGNORE INTO classes (lecturer_id, code, title, sks, prodi, semester, academic_year, capacity, schedule, room)
SELECT id, 'IF204', 'Jaringan Komputer', 4, 'Teknik Informatika', 3, '2024/2025 Ganjil', 35, 'Kamis, 08:00 - 10:30 WIB', 'Lab Jaringan'
FROM lecturers WHERE nidn = '0412068201'
AND NOT EXISTS (SELECT 1 FROM classes WHERE code = 'IF204');

INSERT OR IGNORE INTO classes (lecturer_id, code, title, sks, prodi, semester, academic_year, capacity, schedule, room)
SELECT id, 'IF205', 'Pemrograman Web Framework', 3, 'Teknik Informatika', 3, '2024/2025 Ganjil', 40, 'Rabu, 13:00 - 15:30 WIB', 'Lab Komputer 1'
FROM lecturers WHERE nidn = '0412068201'
AND NOT EXISTS (SELECT 1 FROM classes WHERE code = 'IF205');

-- Enroll Sinta ke kelas tambahan
INSERT OR IGNORE INTO class_enrollments (class_id, student_id)
SELECT c.id, s.id
FROM classes c, students s
WHERE c.code IN ('IF202', 'IF203', 'IF204', 'IF205') AND s.nim = '251234567899';

-- Nilai untuk Sinta pada kelas tambahan
INSERT OR IGNORE INTO grades (enrollment_id, tugas, uts, uas, final_score, letter_grade, status, ai_feedback)
SELECT ce.id, 92.0, 90.0, 94.0, 92.0, 'A', 'Tersimpan',
       'Kemampuan perancangan interaksi dan riset pengguna pada mata kuliah Desain UI/UX sangat luar biasa dan berorientasi industri.'
FROM class_enrollments ce
JOIN classes c ON ce.class_id = c.id
JOIN students s ON ce.student_id = s.id
WHERE c.code = 'IF203' AND s.nim = '251234567899';

INSERT OR IGNORE INTO grades (enrollment_id, tugas, uts, uas, final_score, letter_grade, status, ai_feedback)
SELECT ce.id, 82.0, 84.0, 86.0, 84.0, 'B+', 'Tersimpan',
       'Pemahaman arsitektur routing dan konfigurasi perangkat jaringan komputer sangat baik dalam simulasi topologi.'
FROM class_enrollments ce
JOIN classes c ON ce.class_id = c.id
JOIN students s ON ce.student_id = s.id
WHERE c.code = 'IF204' AND s.nim = '251234567899';

INSERT OR IGNORE INTO grades (enrollment_id, tugas, uts, uas, final_score, letter_grade, status, ai_feedback)
SELECT ce.id, 75.0, 80.0, 78.0, 78.0, 'B', 'Tersimpan',
       'Implementasi widget dan state management mobile berjalan baik. Dianjurkan memperbanyak latihan pembuatan arsitektur clean code.'
FROM class_enrollments ce
JOIN classes c ON ce.class_id = c.id
JOIN students s ON ce.student_id = s.id
WHERE c.code = 'IF202' AND s.nim = '251234567899';

INSERT OR IGNORE INTO grades (enrollment_id, tugas, uts, uas, final_score, letter_grade, status, ai_feedback)
SELECT ce.id, 88.0, 85.0, 90.0, 88.0, 'A-', 'Tersimpan',
       'Penguasaan MVC framework dan integrasi ORM berjalan sangat memuaskan pada proyek tugas akhir.'
FROM class_enrollments ce
JOIN classes c ON ce.class_id = c.id
JOIN students s ON ce.student_id = s.id
WHERE c.code = 'IF205' AND s.nim = '251234567899';

-- 8. SEED PRESENSI / ATTENDANCES (Sinta)
-- Algoritma (8 hadir dari 8)
INSERT OR IGNORE INTO attendances (class_id, student_id, pertemuan, status, date)
SELECT c.id, s.id, p.num, 'hadir', DATE('now', '-' || (8 - p.num) * 7 || ' days')
FROM classes c, students s, (
  SELECT 1 as num UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION SELECT 6 UNION SELECT 7 UNION SELECT 8
) p
WHERE c.code = 'IF2408' AND s.nim = '251234567899';

-- Basis Data (7 hadir, 1 izin dari 8)
INSERT OR IGNORE INTO attendances (class_id, student_id, pertemuan, status, notes, date)
SELECT c.id, s.id, p.num,
       CASE WHEN p.num = 4 THEN 'izin' ELSE 'hadir' END,
       CASE WHEN p.num = 4 THEN 'Izin keperluan keluarga mendesak' ELSE '' END,
       DATE('now', '-' || (8 - p.num) * 7 || ' days')
FROM classes c, students s, (
  SELECT 1 as num UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION SELECT 6 UNION SELECT 7 UNION SELECT 8
) p
WHERE c.code = 'SI102' AND s.nim = '251234567899';

-- Desain UI/UX (8 hadir dari 8)
INSERT OR IGNORE INTO attendances (class_id, student_id, pertemuan, status, date)
SELECT c.id, s.id, p.num, 'hadir', DATE('now', '-' || (8 - p.num) * 7 || ' days')
FROM classes c, students s, (
  SELECT 1 as num UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION SELECT 6 UNION SELECT 7 UNION SELECT 8
) p
WHERE c.code = 'IF203' AND s.nim = '251234567899';

-- Pemrograman Mobile (8 hadir, 1 sakit dari 9)
INSERT OR IGNORE INTO attendances (class_id, student_id, pertemuan, status, notes, date)
SELECT c.id, s.id, p.num,
       CASE WHEN p.num = 5 THEN 'sakit' ELSE 'hadir' END,
       CASE WHEN p.num = 5 THEN 'Surat dokter terlampir' ELSE '' END,
       DATE('now', '-' || (9 - p.num) * 7 || ' days')
FROM classes c, students s, (
  SELECT 1 as num UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9
) p
WHERE c.code = 'IF202' AND s.nim = '251234567899';

-- Jaringan Komputer (8 hadir, 1 izin dari 9)
INSERT OR IGNORE INTO attendances (class_id, student_id, pertemuan, status, notes, date)
SELECT c.id, s.id, p.num,
       CASE WHEN p.num = 6 THEN 'izin' ELSE 'hadir' END,
       CASE WHEN p.num = 6 THEN 'Menghadiri kompetisi teknologi' ELSE '' END,
       DATE('now', '-' || (9 - p.num) * 7 || ' days')
FROM classes c, students s, (
  SELECT 1 as num UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9
) p
WHERE c.code = 'IF204' AND s.nim = '251234567899';

-- Web Framework (7 hadir, 1 alpa dari 8)
INSERT OR IGNORE INTO attendances (class_id, student_id, pertemuan, status, date)
SELECT c.id, s.id, p.num,
       CASE WHEN p.num = 3 THEN 'alpa' ELSE 'hadir' END,
       DATE('now', '-' || (8 - p.num) * 7 || ' days')
FROM classes c, students s, (
  SELECT 1 as num UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION SELECT 6 UNION SELECT 7 UNION SELECT 8
) p
WHERE c.code = 'IF205' AND s.nim = '251234567899';

-- 9. SEED TUGAS & DEADLINE (ASSIGNMENTS)
INSERT OR IGNORE INTO assignments (class_id, title, description, deadline)
SELECT c.id, 'Usability Test Report', 'Lakukan usability testing aplikasi kepada minimal 5 responden dan susun laporannya.', DATETIME('now', '-2 days')
FROM classes c WHERE c.code = 'IF203';

INSERT OR IGNORE INTO assignments (class_id, title, description, deadline)
SELECT c.id, 'Tugas Aplikasi Mobile', 'Selesaikan layout dashboard Flutter dan sambungkan form input ke API backend.', DATETIME('now', '+1 day', '23:59:00')
FROM classes c WHERE c.code = 'IF202';

INSERT OR IGNORE INTO assignments (class_id, title, description, deadline)
SELECT c.id, 'Laporan Praktikum Jaringan', 'Analisis paket data menggunakan Wireshark pada protokol TCP dan UDP.', DATETIME('now', '+3 days', '17:00:00')
FROM classes c WHERE c.code = 'IF204';

INSERT OR IGNORE INTO assignments (class_id, title, description, deadline)
SELECT c.id, 'Quiz Framework Laravel', 'Selesaikan modul RESTful API Controller dan validasi Form Request.', DATETIME('now', '+5 days', '10:00:00')
FROM classes c WHERE c.code = 'IF205';

INSERT OR IGNORE INTO assignments (class_id, title, description, deadline)
SELECT c.id, 'Prototype Hi-Fi', 'Buat prototype Figma interaktif untuk alur pemesanan dan checkout.', DATETIME('now', '-3 days')
FROM classes c WHERE c.code = 'IF203';

-- Submisi Tugas untuk Sinta: Prototype Hi-Fi sudah dikumpulkan
INSERT OR IGNORE INTO assignment_submissions (assignment_id, student_id, file_url, notes, status, score)
SELECT a.id, s.id, 'https://figma.com/file/prototype-sinta', 'Sudah mencakup seluruh interaksi prototype.', 'Terkumpul', 95.0
FROM assignments a, students s
WHERE a.title = 'Prototype Hi-Fi' AND s.nim = '251234567899';

-- 10. SEED NOTIFICATIONS
INSERT OR IGNORE INTO notifications (student_id, category, title, message, is_read, created_at)
SELECT s.id, 'nilai', 'Nilai mata kuliah', 'Nilai Algoritma & Struktur Data telah diperbarui', 0, DATETIME('now', '-1 hour')
FROM students s WHERE s.nim = '251234567899';

INSERT OR IGNORE INTO notifications (student_id, category, title, message, is_read, created_at)
SELECT s.id, 'pengumuman', 'Pengumuman kampus', 'Jadwal Ujian Semester Ganjil telah diumumkan', 0, DATETIME('now', '-2 hours')
FROM students s WHERE s.nim = '251234567899';

INSERT OR IGNORE INTO notifications (student_id, category, title, message, is_read, created_at)
SELECT s.id, 'reminder', 'Reminder tugas', 'Tugas Pemrograman Mobile dikumpulkan besok', 0, DATETIME('now', '-3 hours')
FROM students s WHERE s.nim = '251234567899';

INSERT OR IGNORE INTO notifications (student_id, category, title, message, is_read, created_at)
SELECT s.id, 'sistem', 'Update sistem', 'Aplikasi Gradia diperbarui ke versi terbaru', 1, DATETIME('now', '-1 day')
FROM students s WHERE s.nim = '251234567899';

INSERT OR IGNORE INTO notifications (student_id, category, title, message, is_read, created_at)
SELECT s.id, 'nilai', 'Nilai UTS', 'Nilai UTS Basis Data sudah tersedia', 0, DATETIME('now', '-1 day')
FROM students s WHERE s.nim = '251234567899';

INSERT OR IGNORE INTO notifications (student_id, category, title, message, is_read, created_at)
SELECT s.id, 'pengumuman', 'Pengumuman prodi', 'Kuliah Basis Data Jumat dipindah ke ruang B.2.1', 0, DATETIME('now', '-1 day')
FROM students s WHERE s.nim = '251234567899';

-- 11. SEED GRADE REVIEW
INSERT OR IGNORE INTO grade_reviews (student_id, class_id, component, current_score, reason, status, lecturer_response)
SELECT s.id, c.id, 'Soal 2 · Prinsip Gestalt', '4 / 5', 'Pada nomor 2 jawaban saya sudah mencakup contoh hukum kedekatan (proximity) sesuai modul.', 'approved', 'Jawaban telah diverifikasi ulang, nilai diperbarui menjadi 5/5.'
FROM students s, classes c
WHERE s.nim = '251234567899' AND c.code = 'IF203';

 