# PRD: Struktur Menu & Fitur Dashboard Operator Darunnajah

## 1. Ringkasan Eksekutif
Dokumen ini mendefinisikan pembaruan struktur navigasi dan fungsionalitas halaman dashboard untuk Portal Madrasah Pondok Pesantren Darunnajah Timampu. Semua menu lama pada "Menu Halaman" digantikan dengan 5 (lima) pilar utama yang memiliki sub-menu operasional terpadu.

## 2. Struktur Navigasi & Modul Halaman

### Pilar 1: Lembaga (Pusat Ringkasan & Konfigurasi Lembaga)
Berisi ringkasan eksekutif seluruh data madrasah dan manajemen konfigurasi inti.
* **1.a. Pengaturan Data Lembaga (`lembaga_info`)**
  * Tinjauan metrik seluruh data madrasah (total murid, guru, rombel, mapel, iuran, kehadiran).
  * Formulir konfigurasi identitas madrasah: Nama Lembaga, NPSN, NSM, Alamat, Kontak, Tahun Ajaran Aktif, Akreditasi, dan Kepala Madrasah.
* **1.b. Pengaturan Data Mapel (`lembaga_mapel`)**
  * Katalog kurikulum mata pelajaran (Agama, Bahasa Arab, Sains, Umum).
  * Fitur tambah mata pelajaran baru (Kode, Nama, Kategori, Jam).
  * Fitur hapus mata pelajaran dengan dialog konfirmasi aman.
* **1.c. Pengaturan Rombel (`lembaga_rombel`)**
  * Manajemen Rombongan Belajar (MA, SMP IT, RA).
  * Tambah rombel baru dan hapus rombel.
  * Edit nama rombel dan penetapan / ganti Wali Kelas (terhubung ke daftar akun guru).

---

### Pilar 2: Guru (Manajemen Pendidik & Pengampu)
Berisi pengelolaan data tenaga pendidik dan distribusi beban mengajar.
* **2.a. Data Guru (`guru_data`)**
  * Manajemen akun login pendidik dan biodata lengkap guru (NIP/NIY, Kontak, Email).
  * Tambah akun guru baru, edit biodata guru, dan reset / kelola hak akses guru.
* **2.b. Mapel Ampuh (`guru_mapel`)**
  * Pengaturan beban mengajar: menentukan guru mana yang mengampu mata pelajaran apa di rombel/kelas mana.
  * Tambah penugasan guru pengampu dan hapus/ubah penugasan.

---

### Pilar 3: Murid (Database Santri, Mutasi & Kenaikan Kelas)
Pusat kendali siklus santri dari pendaftaran, rombel aktif, hingga alumni.
* **3.a. Data Murid (`murid_data`)**
  * Direktori seluruh santri dengan filter per rombel/kelas dan pencarian nama/NISN.
  * Fitur tambah murid baru ke kelas tertentu dan hapus data murid.
* **3.b. Pindah Kelas (`murid_pindah`)**
  * Fitur mutasi kelas santri dari satu rombel ke rombel lain secara aman.
  * Riwayat mutasi rombel santri.
* **3.c. Naik Kelas (`murid_naik`)**
  * Fitur evaluasi akhir tahun ajaran untuk memproses kenaikan kelas (misal: Kelas X ke Kelas XI).
  * Pilihan kelulusan untuk tingkat akhir menjadi status tamat.
* **3.d. Data Alumni (`murid_alumni`)**
  * Direktori penelusuran santri yang telah lulus/tamat madrasah beserta tahun tamat dan catatan kelulusan.

---

### Pilar 4: Kehadiran (Presensi & Rekapitulasi Santri)
Pemantauan kedisiplinan dan keaktifan murid di kelas.
* **4.a. Absen (`kehadiran_absen`)**
  * Formulir input absensi santri per kelas per tanggal.
  * Status kehadiran per santri: Hadir (H), Sakit (S), Izin (I), Alfa (A).
* **4.b. Rekapitulasi Kehadiran (`kehadiran_rekap`)**
  * Statistik persentase kehadiran santri per rombel dan per periode.
  * Tinjauan grafis atau tabel santri dengan akumulasi ketidakhadiran tertinggi.

---

### Pilar 5: Keuangan (Iuran & Rekapitulasi Kas Santri)
Pengawasan dan pencatatan pembayaran kewajiban santri.
* **5.a. Iuran (`keuangan_iuran`)**
  * Pencatatan iuran harian/mingguan/bulanan murid oleh wali kelas atau staf madrasah.
  * Status verifikasi (Lunas / Belum Lunas) dengan nominal tagihan.
* **5.b. Rekapitulasi Iuran (`keuangan_rekap`)**
  * Statistik data iuran yang telah diinput: total kas terkumpul, persentase pelunasan per kelas.
  * Rekapitulasi daftar murid yang belum melunasi iuran.

---

## 3. Desain Antarmuka & Sidebar Navigasi
1. Sidebar kiri memuat 5 grup menu berjenjang dengan accordion/collapsible yang dinamis dan modern:
   * Mengklik menu utama membuka/menutup daftar sub-menu.
   * Mengklik sub-menu merender halaman khusus di canvas utama (`#main-page-container`).
2. Topbar dinamis memperbarui judul pilar dan sub-menu yang sedang aktif.
3. Data disinkronkan secara langsung dengan tabel Supabase (`classes`, `subjects`, `profiles`, `schedules`, `attendance`, `payments`).
