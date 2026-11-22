-- =====================================================================
-- GRADIA ACADEMIC PORTAL - SEED DATA (RESILIENT & IDEMPOTENT)
-- =====================================================================
-- Seluruh kelas perkuliahan memiliki minimal 30 mahasiswa terdaftar.
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

-- 3. SEED MAHASISWA (STUDENTS) (password123) - 76 Mahasiswa Aktif
INSERT OR IGNORE INTO students (nim, name, email, password_hash, prodi, status)
VALUES
('251234567899', 'Sinta Permata', 'sinta@kampus.ac.id', '$2b$10$K2K8WxZHFbU04LaxiJPK4OvP.nXJqfst7X8OX5O6ERIUzDnqDQxuu', 'Teknik Informatika', 'Aktif'),
('22010101', 'Siti Rahma', 'siti.rahma@student.gradia.ac.id', '$2b$10$K2K8WxZHFbU04LaxiJPK4OvP.nXJqfst7X8OX5O6ERIUzDnqDQxuu', 'Teknik Informatika', 'Aktif'),
('22010102', 'Ahmad Fauzi', 'ahmad.fauzi@student.gradia.ac.id', '$2b$10$K2K8WxZHFbU04LaxiJPK4OvP.nXJqfst7X8OX5O6ERIUzDnqDQxuu', 'Teknik Informatika', 'Aktif'),
('22010103', 'Dewi Lestari', 'dewi.lestari@student.gradia.ac.id', '$2b$10$K2K8WxZHFbU04LaxiJPK4OvP.nXJqfst7X8OX5O6ERIUzDnqDQxuu', 'Teknik Informatika', 'Aktif'),
('22010104', 'Rian Pratama', 'rian.pratama@student.gradia.ac.id', '$2b$10$K2K8WxZHFbU04LaxiJPK4OvP.nXJqfst7X8OX5O6ERIUzDnqDQxuu', 'Teknik Informatika', 'Aktif'),
('22020201', 'Citra Kirana', 'citra.kirana@student.gradia.ac.id', '$2b$10$K2K8WxZHFbU04LaxiJPK4OvP.nXJqfst7X8OX5O6ERIUzDnqDQxuu', 'Sistem Informasi', 'Aktif'),
('23010105', 'Muhammad Rizky Pratama', 'rizky.pratama@student.gradia.ac.id', '$2b$10$K2K8WxZHFbU04LaxiJPK4OvP.nXJqfst7X8OX5O6ERIUzDnqDQxuu', 'Teknik Informatika', 'Aktif'),
('23010106', 'Aditiya Bagus Saputra', 'aditiya.bagus@student.gradia.ac.id', '$2b$10$K2K8WxZHFbU04LaxiJPK4OvP.nXJqfst7X8OX5O6ERIUzDnqDQxuu', 'Teknik Informatika', 'Aktif'),
('23010107', 'Nabila Putri Andini', 'nabila.putri@student.gradia.ac.id', '$2b$10$K2K8WxZHFbU04LaxiJPK4OvP.nXJqfst7X8OX5O6ERIUzDnqDQxuu', 'Teknik Informatika', 'Aktif'),
('23010108', 'Fajar Nugroho', 'fajar.nugroho@student.gradia.ac.id', '$2b$10$K2K8WxZHFbU04LaxiJPK4OvP.nXJqfst7X8OX5O6ERIUzDnqDQxuu', 'Teknik Informatika', 'Aktif'),
('23010109', 'Anisa Rahmawati', 'anisa.rahmawati@student.gradia.ac.id', '$2b$10$K2K8WxZHFbU04LaxiJPK4OvP.nXJqfst7X8OX5O6ERIUzDnqDQxuu', 'Teknik Informatika', 'Aktif'),
('23010110', 'Dimas Arya Wicaksono', 'dimas.arya@student.gradia.ac.id', '$2b$10$K2K8WxZHFbU04LaxiJPK4OvP.nXJqfst7X8OX5O6ERIUzDnqDQxuu', 'Teknik Informatika', 'Aktif'),
('23010111', 'Bayu Tri Pamungkas', 'bayu.tri@student.gradia.ac.id', '$2b$10$K2K8WxZHFbU04LaxiJPK4OvP.nXJqfst7X8OX5O6ERIUzDnqDQxuu', 'Teknik Informatika', 'Aktif'),
('23010112', 'Farah Diba Azzahra', 'farah.diba@student.gradia.ac.id', '$2b$10$K2K8WxZHFbU04LaxiJPK4OvP.nXJqfst7X8OX5O6ERIUzDnqDQxuu', 'Teknik Informatika', 'Aktif'),
('23010113', 'Ilham Maulana', 'ilham.maulana@student.gradia.ac.id', '$2b$10$K2K8WxZHFbU04LaxiJPK4OvP.nXJqfst7X8OX5O6ERIUzDnqDQxuu', 'Teknik Informatika', 'Aktif'),
('23010114', 'Putri Ayu Wulandari', 'putri.ayu@student.gradia.ac.id', '$2b$10$K2K8WxZHFbU04LaxiJPK4OvP.nXJqfst7X8OX5O6ERIUzDnqDQxuu', 'Teknik Informatika', 'Aktif'),
('23010115', 'Kevin Alamsyah', 'kevin.alamsyah@student.gradia.ac.id', '$2b$10$K2K8WxZHFbU04LaxiJPK4OvP.nXJqfst7X8OX5O6ERIUzDnqDQxuu', 'Teknik Informatika', 'Aktif'),
('23010116', 'Nadya Eka Safitri', 'nadya.eka@student.gradia.ac.id', '$2b$10$K2K8WxZHFbU04LaxiJPK4OvP.nXJqfst7X8OX5O6ERIUzDnqDQxuu', 'Teknik Informatika', 'Aktif'),
('23010117', 'Wahyu Hidayat', 'wahyu.hidayat@student.gradia.ac.id', '$2b$10$K2K8WxZHFbU04LaxiJPK4OvP.nXJqfst7X8OX5O6ERIUzDnqDQxuu', 'Teknik Informatika', 'Aktif'),
('23010118', 'Tiara Maharani', 'tiara.maharani@student.gradia.ac.id', '$2b$10$K2K8WxZHFbU04LaxiJPK4OvP.nXJqfst7X8OX5O6ERIUzDnqDQxuu', 'Teknik Informatika', 'Aktif'),
('23010119', 'Gilang Ramadhan', 'gilang.ramadhan@student.gradia.ac.id', '$2b$10$K2K8WxZHFbU04LaxiJPK4OvP.nXJqfst7X8OX5O6ERIUzDnqDQxuu', 'Teknik Informatika', 'Aktif'),
('23010120', 'Zahra Nur Aulia', 'zahra.nur@student.gradia.ac.id', '$2b$10$K2K8WxZHFbU04LaxiJPK4OvP.nXJqfst7X8OX5O6ERIUzDnqDQxuu', 'Teknik Informatika', 'Aktif'),
('23010121', 'Dwi Cahyo Prasetyo', 'dwi.cahyo@student.gradia.ac.id', '$2b$10$K2K8WxZHFbU04LaxiJPK4OvP.nXJqfst7X8OX5O6ERIUzDnqDQxuu', 'Teknik Informatika', 'Aktif'),
('23010122', 'Alifia Salsa Bella', 'alifia.salsa@student.gradia.ac.id', '$2b$10$K2K8WxZHFbU04LaxiJPK4OvP.nXJqfst7X8OX5O6ERIUzDnqDQxuu', 'Teknik Informatika', 'Aktif'),
('23010123', 'Reza Kurniawan', 'reza.kurniawan@student.gradia.ac.id', '$2b$10$K2K8WxZHFbU04LaxiJPK4OvP.nXJqfst7X8OX5O6ERIUzDnqDQxuu', 'Teknik Informatika', 'Aktif'),
('23010124', 'Maya Anggraini', 'maya.anggraini@student.gradia.ac.id', '$2b$10$K2K8WxZHFbU04LaxiJPK4OvP.nXJqfst7X8OX5O6ERIUzDnqDQxuu', 'Teknik Informatika', 'Aktif'),
('23010125', 'Hendra Wijaya', 'hendra.wijaya@student.gradia.ac.id', '$2b$10$K2K8WxZHFbU04LaxiJPK4OvP.nXJqfst7X8OX5O6ERIUzDnqDQxuu', 'Teknik Informatika', 'Aktif'),
('23010126', 'Syifa Fauziah', 'syifa.fauziah@student.gradia.ac.id', '$2b$10$K2K8WxZHFbU04LaxiJPK4OvP.nXJqfst7X8OX5O6ERIUzDnqDQxuu', 'Teknik Informatika', 'Aktif'),
('23010127', 'Rendy Septian', 'rendy.septian@student.gradia.ac.id', '$2b$10$K2K8WxZHFbU04LaxiJPK4OvP.nXJqfst7X8OX5O6ERIUzDnqDQxuu', 'Teknik Informatika', 'Aktif'),
('23010128', 'Gita Savitri', 'gita.savitri@student.gradia.ac.id', '$2b$10$K2K8WxZHFbU04LaxiJPK4OvP.nXJqfst7X8OX5O6ERIUzDnqDQxuu', 'Teknik Informatika', 'Aktif'),
('23010129', 'Bagas Dwi Putra', 'bagas.dwi@student.gradia.ac.id', '$2b$10$K2K8WxZHFbU04LaxiJPK4OvP.nXJqfst7X8OX5O6ERIUzDnqDQxuu', 'Teknik Informatika', 'Aktif'),
('23010130', 'Intan Permatasari', 'intan.permatasari@student.gradia.ac.id', '$2b$10$K2K8WxZHFbU04LaxiJPK4OvP.nXJqfst7X8OX5O6ERIUzDnqDQxuu', 'Teknik Informatika', 'Aktif'),
('23010131', 'Yoga Pratama', 'yoga.pratama@student.gradia.ac.id', '$2b$10$K2K8WxZHFbU04LaxiJPK4OvP.nXJqfst7X8OX5O6ERIUzDnqDQxuu', 'Teknik Informatika', 'Aktif'),
('23010132', 'Salma Khoirunnisa', 'salma.khoirunnisa@student.gradia.ac.id', '$2b$10$K2K8WxZHFbU04LaxiJPK4OvP.nXJqfst7X8OX5O6ERIUzDnqDQxuu', 'Teknik Informatika', 'Aktif'),
('23010133', 'Taufik Hidayat', 'taufik.hidayat@student.gradia.ac.id', '$2b$10$K2K8WxZHFbU04LaxiJPK4OvP.nXJqfst7X8OX5O6ERIUzDnqDQxuu', 'Teknik Informatika', 'Aktif'),
('23010134', 'Cantika Dewi', 'cantika.dewi@student.gradia.ac.id', '$2b$10$K2K8WxZHFbU04LaxiJPK4OvP.nXJqfst7X8OX5O6ERIUzDnqDQxuu', 'Teknik Informatika', 'Aktif'),
('23010135', 'Ari Wibowo', 'ari.wibowo@student.gradia.ac.id', '$2b$10$K2K8WxZHFbU04LaxiJPK4OvP.nXJqfst7X8OX5O6ERIUzDnqDQxuu', 'Teknik Informatika', 'Aktif'),
('23010136', 'Jessica Olivia', 'jessica.olivia@student.gradia.ac.id', '$2b$10$K2K8WxZHFbU04LaxiJPK4OvP.nXJqfst7X8OX5O6ERIUzDnqDQxuu', 'Teknik Informatika', 'Aktif'),
('23010137', 'Bintang Kejora', 'bintang.kejora@student.gradia.ac.id', '$2b$10$K2K8WxZHFbU04LaxiJPK4OvP.nXJqfst7X8OX5O6ERIUzDnqDQxuu', 'Teknik Informatika', 'Aktif'),
('23010138', 'Surya Dharma', 'surya.dharma@student.gradia.ac.id', '$2b$10$K2K8WxZHFbU04LaxiJPK4OvP.nXJqfst7X8OX5O6ERIUzDnqDQxuu', 'Teknik Informatika', 'Aktif'),
('23010139', 'Melati Kusuma', 'melati.kusuma@student.gradia.ac.id', '$2b$10$K2K8WxZHFbU04LaxiJPK4OvP.nXJqfst7X8OX5O6ERIUzDnqDQxuu', 'Teknik Informatika', 'Aktif'),
('23010140', 'Rio Febrian', 'rio.febrian@student.gradia.ac.id', '$2b$10$K2K8WxZHFbU04LaxiJPK4OvP.nXJqfst7X8OX5O6ERIUzDnqDQxuu', 'Teknik Informatika', 'Aktif'),
('23020202', 'Agung Prasetyo', 'agung.prasetyo@student.gradia.ac.id', '$2b$10$K2K8WxZHFbU04LaxiJPK4OvP.nXJqfst7X8OX5O6ERIUzDnqDQxuu', 'Sistem Informasi', 'Aktif'),
('23020203', 'Bella Safira', 'bella.safira@student.gradia.ac.id', '$2b$10$K2K8WxZHFbU04LaxiJPK4OvP.nXJqfst7X8OX5O6ERIUzDnqDQxuu', 'Sistem Informasi', 'Aktif'),
('23020204', 'Candra Wijaya', 'candra.wijaya@student.gradia.ac.id', '$2b$10$K2K8WxZHFbU04LaxiJPK4OvP.nXJqfst7X8OX5O6ERIUzDnqDQxuu', 'Sistem Informasi', 'Aktif'),
('23020205', 'Dina Marlina', 'dina.marlina@student.gradia.ac.id', '$2b$10$K2K8WxZHFbU04LaxiJPK4OvP.nXJqfst7X8OX5O6ERIUzDnqDQxuu', 'Sistem Informasi', 'Aktif'),
('23020206', 'Eko Purnomo', 'eko.purnomo@student.gradia.ac.id', '$2b$10$K2K8WxZHFbU04LaxiJPK4OvP.nXJqfst7X8OX5O6ERIUzDnqDQxuu', 'Sistem Informasi', 'Aktif'),
('23020207', 'Fitri Handayani', 'fitri.handayani@student.gradia.ac.id', '$2b$10$K2K8WxZHFbU04LaxiJPK4OvP.nXJqfst7X8OX5O6ERIUzDnqDQxuu', 'Sistem Informasi', 'Aktif'),
('23020208', 'Galih Prakoso', 'galih.prakoso@student.gradia.ac.id', '$2b$10$K2K8WxZHFbU04LaxiJPK4OvP.nXJqfst7X8OX5O6ERIUzDnqDQxuu', 'Sistem Informasi', 'Aktif'),
('23020209', 'Hesti Purwanti', 'hesti.purwanti@student.gradia.ac.id', '$2b$10$K2K8WxZHFbU04LaxiJPK4OvP.nXJqfst7X8OX5O6ERIUzDnqDQxuu', 'Sistem Informasi', 'Aktif'),
('23020210', 'Indra Gunawan', 'indra.gunawan@student.gradia.ac.id', '$2b$10$K2K8WxZHFbU04LaxiJPK4OvP.nXJqfst7X8OX5O6ERIUzDnqDQxuu', 'Sistem Informasi', 'Aktif'),
('23020211', 'Julia Perezita', 'julia.perezita@student.gradia.ac.id', '$2b$10$K2K8WxZHFbU04LaxiJPK4OvP.nXJqfst7X8OX5O6ERIUzDnqDQxuu', 'Sistem Informasi', 'Aktif'),
('23020212', 'Krisna Murti', 'krisna.murti@student.gradia.ac.id', '$2b$10$K2K8WxZHFbU04LaxiJPK4OvP.nXJqfst7X8OX5O6ERIUzDnqDQxuu', 'Sistem Informasi', 'Aktif'),
('23020213', 'Larasati Wibisono', 'larasati.wibisono@student.gradia.ac.id', '$2b$10$K2K8WxZHFbU04LaxiJPK4OvP.nXJqfst7X8OX5O6ERIUzDnqDQxuu', 'Sistem Informasi', 'Aktif'),
('23020214', 'Mifta Huljannah', 'mifta.huljannah@student.gradia.ac.id', '$2b$10$K2K8WxZHFbU04LaxiJPK4OvP.nXJqfst7X8OX5O6ERIUzDnqDQxuu', 'Sistem Informasi', 'Aktif'),
('23020215', 'Naufal Zaki', 'naufal.zaki@student.gradia.ac.id', '$2b$10$K2K8WxZHFbU04LaxiJPK4OvP.nXJqfst7X8OX5O6ERIUzDnqDQxuu', 'Sistem Informasi', 'Aktif'),
('23020216', 'Olivia Zahrani', 'olivia.zahrani@student.gradia.ac.id', '$2b$10$K2K8WxZHFbU04LaxiJPK4OvP.nXJqfst7X8OX5O6ERIUzDnqDQxuu', 'Sistem Informasi', 'Aktif'),
('23020217', 'Panji Asmoro', 'panji.asmoro@student.gradia.ac.id', '$2b$10$K2K8WxZHFbU04LaxiJPK4OvP.nXJqfst7X8OX5O6ERIUzDnqDQxuu', 'Sistem Informasi', 'Aktif'),
('23020218', 'Qonita Luthfiah', 'qonita.luthfiah@student.gradia.ac.id', '$2b$10$K2K8WxZHFbU04LaxiJPK4OvP.nXJqfst7X8OX5O6ERIUzDnqDQxuu', 'Sistem Informasi', 'Aktif'),
('23020219', 'Raden Mas Danu', 'raden.danu@student.gradia.ac.id', '$2b$10$K2K8WxZHFbU04LaxiJPK4OvP.nXJqfst7X8OX5O6ERIUzDnqDQxuu', 'Sistem Informasi', 'Aktif'),
('23020220', 'Salsabila Firdaus', 'salsabila.firdaus@student.gradia.ac.id', '$2b$10$K2K8WxZHFbU04LaxiJPK4OvP.nXJqfst7X8OX5O6ERIUzDnqDQxuu', 'Sistem Informasi', 'Aktif'),
('23020221', 'Tri Wahyuni', 'tri.wahyuni@student.gradia.ac.id', '$2b$10$K2K8WxZHFbU04LaxiJPK4OvP.nXJqfst7X8OX5O6ERIUzDnqDQxuu', 'Sistem Informasi', 'Aktif'),
('23020222', 'Utami Pratiwi', 'utami.pratiwi@student.gradia.ac.id', '$2b$10$K2K8WxZHFbU04LaxiJPK4OvP.nXJqfst7X8OX5O6ERIUzDnqDQxuu', 'Sistem Informasi', 'Aktif'),
('23020223', 'Vicky Prasojo', 'vicky.prasojo@student.gradia.ac.id', '$2b$10$K2K8WxZHFbU04LaxiJPK4OvP.nXJqfst7X8OX5O6ERIUzDnqDQxuu', 'Sistem Informasi', 'Aktif'),
('23020224', 'Winda Novitasari', 'winda.novitasari@student.gradia.ac.id', '$2b$10$K2K8WxZHFbU04LaxiJPK4OvP.nXJqfst7X8OX5O6ERIUzDnqDQxuu', 'Sistem Informasi', 'Aktif'),
('23020225', 'Xaverius Putra', 'xaverius.putra@student.gradia.ac.id', '$2b$10$K2K8WxZHFbU04LaxiJPK4OvP.nXJqfst7X8OX5O6ERIUzDnqDQxuu', 'Sistem Informasi', 'Aktif'),
('23020226', 'Yasmin Aulia', 'yasmin.aulia@student.gradia.ac.id', '$2b$10$K2K8WxZHFbU04LaxiJPK4OvP.nXJqfst7X8OX5O6ERIUzDnqDQxuu', 'Sistem Informasi', 'Aktif'),
('23020227', 'Zainal Abidin', 'zainal.abidin@student.gradia.ac.id', '$2b$10$K2K8WxZHFbU04LaxiJPK4OvP.nXJqfst7X8OX5O6ERIUzDnqDQxuu', 'Sistem Informasi', 'Aktif'),
('23020228', 'Amanda Manopo', 'amanda.manopo@student.gradia.ac.id', '$2b$10$K2K8WxZHFbU04LaxiJPK4OvP.nXJqfst7X8OX5O6ERIUzDnqDQxuu', 'Sistem Informasi', 'Aktif'),
('23020229', 'Bobby Nasution', 'bobby.nasution@student.gradia.ac.id', '$2b$10$K2K8WxZHFbU04LaxiJPK4OvP.nXJqfst7X8OX5O6ERIUzDnqDQxuu', 'Sistem Informasi', 'Aktif'),
('23020230', 'Chika Jessica', 'chika.jessica@student.gradia.ac.id', '$2b$10$K2K8WxZHFbU04LaxiJPK4OvP.nXJqfst7X8OX5O6ERIUzDnqDQxuu', 'Sistem Informasi', 'Aktif'),
('23020231', 'Derry Sulaiman', 'derry.sulaiman@student.gradia.ac.id', '$2b$10$K2K8WxZHFbU04LaxiJPK4OvP.nXJqfst7X8OX5O6ERIUzDnqDQxuu', 'Sistem Informasi', 'Aktif'),
('23020232', 'Endah Prameswari', 'endah.prameswari@student.gradia.ac.id', '$2b$10$K2K8WxZHFbU04LaxiJPK4OvP.nXJqfst7X8OX5O6ERIUzDnqDQxuu', 'Sistem Informasi', 'Aktif'),
('23020233', 'Farhan Halim', 'farhan.halim@student.gradia.ac.id', '$2b$10$K2K8WxZHFbU04LaxiJPK4OvP.nXJqfst7X8OX5O6ERIUzDnqDQxuu', 'Sistem Informasi', 'Aktif'),
('23020234', 'Gina Sonia', 'gina.sonia@student.gradia.ac.id', '$2b$10$K2K8WxZHFbU04LaxiJPK4OvP.nXJqfst7X8OX5O6ERIUzDnqDQxuu', 'Sistem Informasi', 'Aktif'),
('23020235', 'Hafiz Al-Fatih', 'hafiz.alfatih@student.gradia.ac.id', '$2b$10$K2K8WxZHFbU04LaxiJPK4OvP.nXJqfst7X8OX5O6ERIUzDnqDQxuu', 'Sistem Informasi', 'Aktif');

UPDATE students SET password_hash = '$2b$10$K2K8WxZHFbU04LaxiJPK4OvP.nXJqfst7X8OX5O6ERIUzDnqDQxuu'
WHERE password_hash IS NULL OR password_hash = '';

-- 4. SEED KELAS DENGAN FOREIGN KEY DOSEN
INSERT OR IGNORE INTO classes (lecturer_id, code, title, sks, prodi, semester, academic_year, capacity, schedule, room)
SELECT id, 'IF2408', 'Algoritma & Pemrograman Terapan', 3, 'Teknik Informatika', 3, '2024/2025 Ganjil', 40, 'Senin, 08:00 - 10:30 WIB', 'Lab Komputer 2'
FROM lecturers WHERE nidn = '1234567890'
AND NOT EXISTS (SELECT 1 FROM classes WHERE code = 'IF2408');

INSERT OR IGNORE INTO classes (lecturer_id, code, title, sks, prodi, semester, academic_year, capacity, schedule, room)
SELECT id, 'IF301', 'Struktur Data & Rekayasa Perangkat Lunak', 4, 'Teknik Informatika', 4, '2024/2025 Ganjil', 40, 'Rabu, 10:00 - 12:30 WIB', 'Ruang Teori 301'
FROM lecturers WHERE nidn = '1234567890'
AND NOT EXISTS (SELECT 1 FROM classes WHERE code = 'IF301');

INSERT OR IGNORE INTO classes (lecturer_id, code, title, sks, prodi, semester, academic_year, capacity, schedule, room)
SELECT id, 'SI102', 'Basis Data Lanjut', 3, 'Sistem Informasi', 2, '2024/2025 Ganjil', 45, 'Kamis, 13:00 - 15:30 WIB', 'Lab Basis Data'
FROM lecturers WHERE nidn = '0412068201'
AND NOT EXISTS (SELECT 1 FROM classes WHERE code = 'SI102');

-- 5. SEED ENROLLMENT MAHASISWA KE KELAS (MINIMAL 30 PER KELAS)
-- Kelas IF2408 (35 Mahasiswa)
INSERT OR IGNORE INTO class_enrollments (class_id, student_id)
SELECT c.id, s.id
FROM classes c, students s
WHERE c.code = 'IF2408' AND s.nim IN (
  '251234567899', '22010101', '22010102', '22010103', '22010104',
  '23010105', '23010106', '23010107', '23010108', '23010109', '23010110',
  '23010111', '23010112', '23010113', '23010114', '23010115', '23010116',
  '23010117', '23010118', '23010119', '23010120', '23010121', '23010122',
  '23010123', '23010124', '23010125', '23010126', '23010127', '23010128',
  '23010129', '23010130', '23010131', '23010132', '23010133', '23010134'
);

-- Kelas IF301 (34 Mahasiswa)
INSERT OR IGNORE INTO class_enrollments (class_id, student_id)
SELECT c.id, s.id
FROM classes c, students s
WHERE c.code = 'IF301' AND s.nim IN (
  '251234567899', '22010101', '22010102',
  '23010111', '23010112', '23010113', '23010114', '23010115', '23010116',
  '23010117', '23010118', '23010119', '23010120', '23010121', '23010122',
  '23010123', '23010124', '23010125', '23010126', '23010127', '23010128',
  '23010129', '23010130', '23010131', '23010132', '23010133', '23010134',
  '23010135', '23010136', '23010137', '23010138', '23010139', '23010140'
);

-- Kelas SI102 (36 Mahasiswa)
INSERT OR IGNORE INTO class_enrollments (class_id, student_id)
SELECT c.id, s.id
FROM classes c, students s
WHERE c.code = 'SI102' AND s.nim IN (
  '251234567899', '22020201',
  '23020202', '23020203', '23020204', '23020205', '23020206', '23020207',
  '23020208', '23020209', '23020210', '23020211', '23020212', '23020213',
  '23020214', '23020215', '23020216', '23020217', '23020218', '23020219',
  '23020220', '23020221', '23020222', '23020223', '23020224', '23020225',
  '23020226', '23020227', '23020228', '23020229', '23020230', '23020231',
  '23020232', '23020233', '23020234', '23020235'
);

-- 6. SEED NILAI & AI FEEDBACK UNTUK SELURUH MAHASISWA TERDAFTAR
INSERT OR IGNORE INTO grades (enrollment_id, tugas, uts, uas, final_score, letter_grade, status, ai_feedback)
SELECT ce.id,
       CASE (ce.id % 5)
         WHEN 0 THEN 90.0
         WHEN 1 THEN 82.0
         WHEN 2 THEN 78.0
         WHEN 3 THEN 68.0
         ELSE 52.0
       END,
       CASE (ce.id % 5)
         WHEN 0 THEN 88.0
         WHEN 1 THEN 80.0
         WHEN 2 THEN 75.0
         WHEN 3 THEN 65.0
         ELSE 50.0
       END,
       CASE (ce.id % 5)
         WHEN 0 THEN 92.0
         WHEN 1 THEN 85.0
         WHEN 2 THEN 80.0
         WHEN 3 THEN 70.0
         ELSE 54.0
       END,
       CASE (ce.id % 5)
         WHEN 0 THEN 90.2
         WHEN 1 THEN 82.6
         WHEN 2 THEN 77.9
         WHEN 3 THEN 67.9
         ELSE 52.2
       END,
       CASE (ce.id % 5)
         WHEN 0 THEN 'A'
         WHEN 1 THEN 'B+'
         WHEN 2 THEN 'B'
         WHEN 3 THEN 'C+'
         ELSE 'E'
       END,
       CASE (ce.id % 5)
         WHEN 4 THEN 'Perlu remedial'
         ELSE 'Tersimpan'
       END,
       CASE (ce.id % 5)
         WHEN 0 THEN 'Penguasaan materi sangat baik pada seluruh indikator capaian pembelajaran OBE.'
         WHEN 1 THEN 'Kemampuan analisis dan implementasi sangat memuaskan, konsisten dalam pengerjaan evaluasi.'
         WHEN 2 THEN 'Pemahaman konsep baik dan tugas terselesaikan tepat waktu. Disarankan pengayaan materi lanjut.'
         WHEN 3 THEN 'Memenuhi standar kompetensi minimal, perlu peningkatan dalam penyelesaian studi kasus mandiri.'
         ELSE 'Mahasiswa direkomendasikan mengikuti remedial dan pendampingan capaian pembelajaran dasar.'
       END
FROM class_enrollments ce
WHERE ce.id NOT IN (SELECT enrollment_id FROM grades);
