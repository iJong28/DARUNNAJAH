-- =========================================================================
-- SKRIP HAPUS AKUN OTOMATIS PORTAL DARUNNAJAH
-- Jalankan skrip ini di SQL Editor Supabase untuk menghapus seluruh akun
-- yang sebelumnya dibuat secara otomatis sehingga Anda dapat mendaftar/
-- membuat akun masing-masing secara manual dari awal.
-- =========================================================================

-- 1. Bersihkan referensi foreign key di classes jika ada
UPDATE public.classes 
SET teacher_id = NULL;

-- 2. Hapus seluruh akun dari auth.users
-- (Tabel public.profiles otomatis terhapus karena ON DELETE CASCADE)
DELETE FROM auth.users 
WHERE email IN (
    'operator@darunnajah.sch.id',
    'kamad@darunnajah.sch.id',
    'guru@darunnajah.sch.id',
    'walikelas@darunnajah.sch.id',
    'bendahara@darunnajah.sch.id',
    'siswa@darunnajah.sch.id'
);

-- 3. Verifikasi daftar akun yang tersisa di database
SELECT id, email, created_at FROM auth.users;
SELECT id, full_name, role FROM public.profiles;
