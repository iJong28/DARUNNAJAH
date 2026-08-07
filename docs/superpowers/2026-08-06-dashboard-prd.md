### **Product Requirements Document (PRD): Dashboard Aplikasi Terpadu Pondok Pesantren Darunnajah**

**1. Pendahuluan**

- **1.1. Latar Belakang:** Saat ini, Pondok Pesantren Darunnajah membutuhkan sebuah sistem terpusat untuk mengelola kegiatan akademik, administrasi, dan komunikasi. Dashboard ini bertujuan untuk menjadi halaman utama bagi setiap pengguna setelah login, menyediakan akses cepat ke informasi dan fitur yang relevan sesuai dengan hak akses (peran) mereka.
- **1.2. Tujuan Produk:**
  - Menciptakan pusat informasi dan layanan yang terpersonalisasi untuk setiap elemen pesantren (siswa, guru, bendahara, kepala madrasah, operator).
  - Meningkatkan efisiensi operasional harian, mingguan, hingga tahunan.
  - Mempermudah akses data secara _real-time_ dan mengurangi ketergantungan pada proses manual.
  - Memperkuat komunikasi antara berbagai pihak di dalam lingkungan pesantren.
- **1.3. Ruang Lingkup:** PRD ini mencakup kebutuhan fungsional dan non-fungsional untuk halaman `dashboard.html`. Pengembangan fitur di luar dashboard (seperti halaman profil detail, modul SPMB penuh, dll.) akan diuraikan dalam dokumen terpisah.
- **1.4. Pengguna Target (User Roles):**
  1.  **Siswa:** Pengguna utama dari sisi peserta didik.
  2.  **Guru:** Tenaga pengajar mata pelajaran.
  3.  **Wali Kelas:** Guru yang memiliki tanggung jawab perwalian terhadap satu kelas.
  4.  **Bendahara:** Staf yang bertanggung jawab atas keuangan dan pembayaran.
  5.  **Operator (Admin):** Staf yang mengelola data master dan operasional sistem.
  6.  **Kepala Madrasah:** Pimpinan yang membutuhkan laporan dan ringkasan data.
  7.  **Superadmin:** Pengguna dengan hak akses tertinggi, bertanggung jawab atas konfigurasi inti dan manajemen akses operator.

**2. Kebutuhan Fungsional (Functional Requirements)**

Halaman dashboard akan terdiri dari komponen-komponen (widget) yang tampilannya akan disesuaikan berdasarkan peran pengguna yang login.

- **2.1. Fitur Umum (Untuk Semua Peran)**
  - **Header Sambutan:** Menampilkan "Selamat datang, [Nama Pengguna]" dan peran pengguna.
  - **Papan Informasi Umum:** Menampilkan pengumuman penting dari Operator atau Kepala Madrasah.
  - **Kalender Kegiatan:** Menandai kegiatan penting pesantren (misal: ujian, hari libur, acara).
  - **Akses Cepat (Quick Access):** Tombol/link menuju halaman penting lainnya (misal: Profil Saya, Ganti Password, Logout).

- **2.2. Fitur Spesifik Berdasarkan Peran**
  - **2.2.1. Dashboard Siswa**
    - **Jadwal Pelajaran Hari Ini:** Widget yang menampilkan daftar mata pelajaran, jam, dan nama guru untuk hari berjalan.
    - **Ringkasan Absensi:** Menampilkan rekapitulasi kehadiran (Sakit, Izin, Alfa) dalam semester berjalan.
    - **Tugas Mendatang:** Daftar tugas/PR yang akan datang beserta tenggat waktunya.
    - **Status Pembayaran SPP:** Notifikasi status pembayaran SPP untuk bulan berjalan (Lunas/Belum Lunas).
    - **Nilai Terakhir:** Menampilkan nilai dari ujian atau tugas yang baru saja dipublikasikan.

  - **2.2.2. Dashboard Guru**
    - **Jadwal Mengajar Hari Ini:** Daftar kelas, mata pelajaran, dan jam yang harus diajar hari ini.
    - **Input Absensi Kelas:** Tombol akses cepat untuk masuk ke halaman pengisian absensi kelas yang diajar.
    - **Notifikasi Tugas:** Pengingat untuk memeriksa tugas siswa yang sudah dikumpulkan.
    - **Akses Cepat Input Nilai:** Link untuk masuk ke halaman pengisian nilai.

  - **2.2.3. Dashboard Wali Kelas (Mewarisi semua fitur Guru, ditambah:)**
    - **Ringkasan Akademik Kelas:** Grafik sederhana mengenai rata-rata nilai dan tingkat kehadiran kelas perwaliannya.
    - **Daftar Siswa Bermasalah:** Menampilkan siswa di kelasnya yang memiliki tingkat absensi tinggi atau nilai di bawah standar.
    - **Pesan Cepat ke Wali Murid:** Fitur untuk mengirim pengumuman singkat kepada grup wali murid kelasnya.

  - **2.2.4. Dashboard Bendahara**
    - **Statistik Pembayaran SPP:** Grafik pie chart yang menunjukkan persentase siswa yang sudah dan belum membayar SPP bulan ini.
    - **Konfirmasi Pembayaran Terbaru:** Daftar pembayaran yang perlu diverifikasi.
    - **Laporan Keuangan Cepat:** Tombol untuk mengunduh laporan penerimaan harian/bulanan.
    - **Daftar Tunggakan:** Menampilkan siswa dengan tunggakan pembayaran SPP lebih dari 1 bulan.

  - **2.2.5. Dashboard Operator (Admin)**
    - **Manajemen Pengguna:** Akses cepat untuk menambah, mengubah, atau menonaktifkan akun pengguna.
    - **Manajemen Konten:** Tombol untuk membuat pengumuman baru di papan informasi.
    - **Statistik Sistem:** Menampilkan jumlah pengguna aktif dan log aktivitas terakhir.
    - **Manajemen Data Master:** Link menuju halaman pengelolaan data kelas, mata pelajaran, dan tahun ajaran.

  - **2.2.6. Dashboard Kepala Madrasah**
    - **Ringkasan Kinerja Akademik:** Grafik tren rata-rata nilai seluruh madrasah dari waktu ke waktu.
    - **Laporan Kehadiran Guru:** Menampilkan rekapitulasi kehadiran seluruh tenaga pengajar.
    - **Ringkasan Keuangan:** Melihat ringkasan pendapatan dari Bendahara (tanpa akses edit).
    - **Alur Persetujuan:** Notifikasi jika ada dokumen atau permintaan yang memerlukan persetujuannya.

  - **2.2.7. Dashboard Superadmin (Mewarisi semua fitur Operator, ditambah:)**
    - **Manajemen Akses Operator:** Kemampuan untuk memberikan atau mencabut hak akses `Operator` kepada pengguna lain.
    - **Log Audit Sistem:** Akses untuk melihat log aktivitas krusial di seluruh sistem (misalnya: perubahan peran, ekspor data, login gagal berulang).
    - **Konfigurasi Sistem Global:** Antarmuka untuk mengubah pengaturan tingkat tinggi aplikasi yang tidak tersedia untuk Operator biasa.

**3. Kebutuhan Non-Fungsional**

- **3.1. Keamanan:** Akses ke setiap widget/data harus divalidasi secara ketat di sisi server (Supabase RLS) untuk memastikan pengguna tidak dapat melihat data di luar hak aksesnya.
- **3.2. Kinerja:** Halaman dashboard harus dapat dimuat dalam waktu kurang dari 3 detik pada koneksi internet standar.
- **3.3. Desain & User Experience (UX):**
  - Tampilan harus bersih, modern, dan intuitif.
  - Desain harus responsif (dapat diakses dengan baik di desktop maupun perangkat mobile).
  - Konsisten dengan skema warna dan branding Yayasan Darunnajah.
- **3.4. Skalabilitas:** Arsitektur harus memungkinkan penambahan peran atau widget baru di masa depan tanpa harus merombak keseluruhan sistem.

**4. Ketergantungan (Dependencies)**

- Sistem otentikasi (login) `auth.js` dan `supabase.js` harus sudah berfungsi penuh.
- Struktur tabel di Supabase (sesuai `schema.sql` dan pengembangannya) untuk menyimpan data siswa, guru, kelas, nilai, absensi, dan pembayaran harus sudah siap.
- Penerapan _Row Level Security_ (RLS) di Supabase untuk setiap peran harus sudah dikonfigurasi.
