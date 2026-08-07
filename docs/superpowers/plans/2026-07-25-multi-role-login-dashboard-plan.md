# Rencana Pengembangan Fitur Login Multi-Otoritas dan Desain Dashboard

**Dokumen:** `2026-07-25-multi-role-login-dashboard-plan.md`  
**Tanggal:** 25 Juli 2026  
**Penulis:** Gemini CLI Agent
**Referensi:** `2026-07-24-login-multi-role-plan.md`

## 1. Latar Belakang

Sistem portal Pondok Pesantren Darunnajah Timampu memerlukan sebuah sistem otentikasi yang dapat mengakomodasi berbagai jenis pengguna dengan hak akses yang berbeda. Dokumen ini merinci rencana pengembangan fitur login multi-otoritas dan merancang tampilan dashboard yang akan dilihat oleh setiap peran setelah berhasil login, sesuai dengan peran yang telah didefinisikan dalam rencana implementasi teknis.

## 2. Identifikasi Peran (Otoritas) Pengguna

Berdasarkan dokumen `2026-07-24-login-multi-role-plan.md`, sistem akan mendukung enam peran utama berikut:

1.  `kepala_madrasah` (Kepala Sekolah)
2.  `operator` (Operator Sistem)
3.  `bendahara` (Bendahara)
4.  `walikelas` (Wali Kelas)
5.  `guru` (Guru Mata Pelajaran)
6.  `siswa` (Siswa/Santri)

## 3. Desain Fungsionalitas Dashboard per Otoritas

Setiap peran akan memiliki dashboard yang disesuaikan untuk menampilkan informasi dan menyediakan alat yang paling relevan bagi mereka.

---

### 3.1. Dashboard `kepala_madrasah`

**Tujuan:** Menyediakan pandangan tingkat tinggi (helikopter view) terhadap performa sekolah, guru, dan siswa.

**Komponen / Widget:**

*   **Laporan Akademik Teragregasi:**
    *   Grafik rata-rata nilai per kelas atau per angkatan.
    *   Tingkat kehadiran siswa secara keseluruhan.
    *   Laporan prestasi siswa.
*   **Laporan Kinerja Guru:**
    *   Ringkasan aktivitas guru (misalnya, kapan terakhir kali menginput nilai).
    *   Rekapitulasi kehadiran guru.
*   **Statistik Kesiswaan:**
    *   Grafik pertumbuhan jumlah siswa dari tahun ke tahun.
    *   Data demografi siswa.
*   **Penerbitan Pengumuman:**
    *   Formulir sederhana untuk menerbitkan pengumuman penting ke seluruh sekolah.

---

### 3.2. Dashboard `operator`

**Tujuan:** Memberikan kontrol administratif dan teknis atas data master, manajemen pengguna, dan pendaftaran siswa baru.

**Komponen / Widget:**

*   **Manajemen Pengguna:**
    *   Tabel daftar semua pengguna dengan fitur pencarian dan filter.
    *   Tombol untuk **Tambah Pengguna Baru**, **Edit**, dan **Nonaktifkan**.
    *   Fitur untuk reset kata sandi pengguna.
*   **Manajemen Data Induk Siswa (CRUD):**
    *   Antarmuka untuk mengelola data lengkap semua siswa.
*   **Manajemen SPMB (Seleksi Penerimaan Murid Baru):**
    *   Melihat dan memverifikasi semua data calon siswa yang mendaftar.
    *   Mengubah status pendaftaran (diterima, ditolak, daftar tunggu).
*   **Manajemen Konten Website:**
    *   Editor untuk membuat/mengubah artikel, berita, atau pengumuman di halaman utama (jika diperlukan).
*   **Log Aktivitas Sistem:**
    *   Tampilan log untuk memantau aktivitas penting yang terjadi di sistem.

---

### 3.3. Dashboard `bendahara`

**Tujuan:** Memfasilitasi seluruh manajemen keuangan sekolah, termasuk SPP, tagihan lain, dan pelaporan.

**Komponen / Widget:**

*   **Ringkasan Keuangan:**
    *   Grafik pemasukan bulan ini (SPP dan lainnya).
    *   Jumlah tunggakan total.
*   **Manajemen SPP & Tagihan:**
    *   Antarmuka untuk membuat, mengirim, dan melacak status pembayaran SPP siswa.
    *   Fitur untuk menambahkan tagihan lain (misalnya, biaya buku, seragam).
*   **Pencatatan Transaksi:**
    *   Formulir untuk mencatat pemasukan dan pengeluaran manual.
*   **Laporan Keuangan:**
    *   Fitur untuk menghasilkan laporan keuangan periodik (bulanan, tahunan).
    *   Daftar siswa yang menunggak pembayaran.

---

### 3.4. Dashboard `walikelas`

**Tujuan:** Memberikan alat kepada wali kelas untuk mengelola kelasnya secara holistik, mencakup aspek akademik, kehadiran, dan pembinaan.

**Komponen / Widget:**

*   **Informasi Kelas Perwalian:**
    *   Daftar lengkap siswa di kelasnya.
    *   Statistik kelas (jumlah siswa, rata-rata kehadiran, dll.).
*   **Manajemen Kehadiran Harian:**
    *   Antarmuka untuk mencatat absensi harian seluruh siswa di kelasnya.
*   **Manajemen Nilai Komprehensif:**
    *   Melihat rekap nilai semua mata pelajaran untuk siswa di kelasnya.
    *   Menginput nilai-nilai non-akademik (sikap, kerajinan).
*   **Catatan & Pembinaan Siswa:**
    *   Fitur untuk mencatat observasi atau pelanggaran siswa.
*   **Komunikasi dengan Orang Tua:**
    *   Fitur perpesanan untuk berkomunikasi dengan seluruh orang tua di kelasnya.
*   *Semua fitur yang dimiliki oleh peran `guru`.*

---

### 3.5. Dashboard `guru`

**Tujuan:** Memfasilitasi manajemen mata pelajaran yang diampu, termasuk penilaian dan materi ajar.

**Komponen / Widget:**

*   **Daftar Kelas yang Diampu:**
    *   Kartu atau daftar kelas yang diajar.
*   **Manajemen Nilai per Mata Pelajaran:**
    *   Antarmuka untuk menginput dan mengubah nilai siswa untuk mata pelajaran yang diampu.
*   **Manajemen Kehadiran per Mata Pelajaran:**
    *   Formulir untuk mencatat kehadiran siswa pada saat jam mengajarnya.
*   **Bank Soal & Materi Ajar:**
    *   Tempat untuk mengunggah materi pelajaran dan tugas.

---

### 3.6. Dashboard `siswa`

**Tujuan:** Memberikan akses cepat dan mudah ke informasi akademik, jadwal, dan pengumuman yang relevan.

**Komponen / Widget:**

*   **Profil Saya:**
    *   Menampilkan data diri, NIS, dan kelas.
*   **Jadwal Pelajaran:**
    *   Tampilan jadwal mingguan.
*   **Kartu Hasil Studi (KHS):**
    *   Tampilan nilai per mata pelajaran dan nilai rata-rata.
    *   Fitur untuk mengunduh KHS.
*   **Riwayat Kehadiran:**
    *   Kalender atau daftar yang menunjukkan status kehadiran (hadir, sakit, izin, alpa).
*   **Informasi Tagihan:**
    *   Melihat status pembayaran SPP dan tagihan lainnya.

## 4. Langkah Implementasi Selanjutnya

1.  **Desain Database:** Merancang skema database untuk tabel `profiles` dengan enum `role` yang sesuai.
2.  **Pengembangan Backend:** Membangun API endpoints untuk otentikasi dan otorisasi.
3.  **Pengembangan Frontend:** Membuat halaman login dan komponen-komponen dashboard dinamis.
4.  **Pengujian:** Melakukan pengujian fungsional untuk setiap peran.
