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

-- 3. SEED MAHASISWA (STUDENTS)
INSERT OR IGNORE INTO students (nim, name, email, prodi, status)
VALUES
('22010101', 'Siti Rahma', 'siti.rahma@student.gradia.ac.id', 'Teknik Informatika', 'Aktif'),
('22010102', 'Ahmad Fauzi', 'ahmad.fauzi@student.gradia.ac.id', 'Teknik Informatika', 'Aktif'),
('22010103', 'Dewi Lestari', 'dewi.lestari@student.gradia.ac.id', 'Teknik Informatika', 'Aktif'),
('22010104', 'Rian Pratama', 'rian.pratama@student.gradia.ac.id', 'Teknik Informatika', 'Aktif'),
('22020201', 'Citra Kirana', 'citra.kirana@student.gradia.ac.id', 'Sistem Informasi', 'Aktif');

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
WHERE c.code = 'IF2408' AND s.nim IN ('22010101', '22010102', '22010103', '22010104');

INSERT OR IGNORE INTO class_enrollments (class_id, student_id)
SELECT c.id, s.id
FROM classes c, students s
WHERE c.code = 'IF301' AND s.nim IN ('22010101', '22010102');

INSERT OR IGNORE INTO class_enrollments (class_id, student_id)
SELECT c.id, s.id
FROM classes c, students s
WHERE c.code = 'SI102' AND s.nim = '22020201';

-- 6. SEED NILAI & AI FEEDBACK
INSERT OR IGNORE INTO grades (enrollment_id, tugas, uts, uas, final_score, letter_grade, status, ai_feedback)
SELECT ce.id, 88.0, 85.0, 90.0, 87.9, 'A', 'Tersimpan',
       'Penguasaan materi oleh Siti Rahma sangat istimewa pada seluruh komponen (Tugas 88, UTS 85, UAS 90). Memenuhi seluruh indikator capaian pembelajaran OBE dengan sangat memuaskan.'
FROM class_enrollments ce
JOIN classes c ON ce.class_id = c.id
JOIN students s ON ce.student_id = s.id
WHERE c.code = 'IF2408' AND s.nim = '22010101';

INSERT OR IGNORE INTO grades (enrollment_id, tugas, uts, uas, final_score, letter_grade, status, ai_feedback)
SELECT ce.id, 78.0, 75.0, 80.0, 77.9, 'B', 'Tersimpan',
       'Pemahaman konsep dan pengerjaan tugas oleh Ahmad Fauzi baik (Nilai Akhir 77.9). Disarankan untuk memperdalam studi kasus mandiri pada materi evaluasi akhir agar performa lebih optimal.'
FROM class_enrollments ce
JOIN classes c ON ce.class_id = c.id
JOIN students s ON ce.student_id = s.id
WHERE c.code = 'IF2408' AND s.nim = '22010102';

INSERT OR IGNORE INTO grades (enrollment_id, tugas, uts, uas, final_score, letter_grade, status, ai_feedback)
SELECT ce.id, 50.0, 55.0, 48.0, 50.7, 'E', 'Perlu remedial',
       'Mahasiswa direkomendasikan mengikuti sesi bimbingan remedial dan penguatan modul dasar untuk mengejar ketertinggalan capaian pembelajaran mata kuliah.'
FROM class_enrollments ce
JOIN classes c ON ce.class_id = c.id
JOIN students s ON ce.student_id = s.id
WHERE c.code = 'IF2408' AND s.nim = '22010103';

INSERT OR IGNORE INTO grades (enrollment_id, status)
SELECT ce.id, 'Belum lengkap'
FROM class_enrollments ce
JOIN classes c ON ce.class_id = c.id
JOIN students s ON ce.student_id = s.id
WHERE c.code = 'IF2408' AND s.nim = '22010104';
