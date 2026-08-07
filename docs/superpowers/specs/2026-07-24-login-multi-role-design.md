# Login Multi-Role Darunnajah

## Tujuan

Menambahkan login berbasis Supabase dan satu dashboard dinamis untuk enam role pengguna:

- Kepala Madrasah
- Operator
- Bendahara
- Walikelas
- Guru
- Siswa

Tahap ini hanya mencakup autentikasi, pengambilan profil, pembatasan tampilan dashboard berdasarkan role, penjagaan sesi, dan logout. Modul akademik, absensi, serta keuangan belum termasuk.

## Keputusan Arsitektur

Website tetap menggunakan HTML statis dan JavaScript ES Modules. Supabase digunakan untuk:

- Supabase Auth dengan email dan password.
- Tabel `profiles` yang terhubung ke `auth.users.id`.
- Penyimpanan nama, role, dan identitas dasar pengguna.
- Row Level Security untuk melindungi data profil.

Konfigurasi Supabase diletakkan di modul frontend terpisah. URL project dan anon key boleh berada di frontend; service role key tidak boleh digunakan di browser.

## Halaman dan Alur

### `login.html`

- Form email dan password.
- Tombol tampil/sembunyikan password.
- Status loading saat proses login.
- Pesan error yang aman dan mudah dipahami.
- Jika sesi valid, arahkan ke `dashboard.html`.
- Jika login berhasil, arahkan ke `dashboard.html`.

### `dashboard.html`

- Memeriksa sesi Supabase saat halaman dimuat.
- Jika tidak ada sesi, arahkan ke `login.html`.
- Menampilkan nama dan role pengguna.
- Menampilkan kartu sambutan dan menu sesuai role.
- Menyediakan tombol logout.
- Tidak menampilkan menu role lain.

### Role Dashboard

- `kepala_madrasah`: ringkasan seluruh sistem.
- `operator`: administrasi pengguna dan data sekolah.
- `bendahara`: ringkasan keuangan.
- `walikelas`: ringkasan kelas.
- `guru`: ringkasan kelas atau mata pelajaran yang diampu.
- `siswa`: ringkasan profil dan akademik pribadi.

Pada tahap ini menu berupa placeholder yang jelas, karena modul data belum dibuat. Placeholder tidak memberikan akses data atau aksi yang belum tersedia.

## Model Data

Tabel `profiles`:

- `id uuid primary key references auth.users(id) on delete cascade`
- `full_name text not null`
- `role text not null` dengan nilai role yang ditentukan
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`

Setiap pengguna Auth harus memiliki satu baris profil. Pembuatan profil awal dilakukan melalui SQL atau Supabase Dashboard. Registrasi publik belum dibuka pada tahap ini agar pengguna tidak dapat memilih role sendiri.

## Keamanan

- RLS aktif pada tabel `profiles`.
- Pengguna hanya dapat membaca profil dengan `id = auth.uid()`.
- Pengguna tidak dapat mengubah role sendiri dari frontend.
- Guard halaman memeriksa sesi melalui Supabase Auth, bukan `localStorage` buatan sendiri.
- Logout menghapus sesi Supabase lalu mengarahkan pengguna ke halaman login.
- Error login tidak membocorkan apakah email tertentu terdaftar.

## Validasi

- Login dengan kredensial valid menampilkan dashboard sesuai role.
- Login dengan password salah menampilkan error dan tidak masuk dashboard.
- Membuka dashboard tanpa sesi mengarah ke login.
- Logout mengakhiri sesi dan mencegah dashboard dibuka kembali tanpa login.
- Setiap role menerima menu dashboard yang sesuai.
- File JavaScript dapat dimuat sebagai ES Module tanpa error.
- SQL schema dan policy dapat dijalankan di Supabase.

## Di Luar Ruang Lingkup

- Reset password melalui email.
- Registrasi mandiri.
- Manajemen pengguna dari dashboard Operator.
- Modul nilai, absensi, jadwal, pembayaran, dan laporan.
- Permission granular di luar enam role utama.
- Backend server khusus.
