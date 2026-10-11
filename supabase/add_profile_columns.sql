-- ============================================================================
-- SKRIP MIGRASI SUPABASE: LENGKAPI KOLOM PROFIL & AKSES DATABASE PORTAL
-- ============================================================================
-- Jalankan skrip ini di SQL Editor pada Supabase Dashboard Anda.

-- 1. Tambahkan kolom pendukung di tabel public.profiles jika belum ada
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS email text,
  ADD COLUMN IF NOT EXISTS nip text,
  ADD COLUMN IF NOT EXISTS phone text,
  ADD COLUMN IF NOT EXISTS nisn text,
  ADD COLUMN IF NOT EXISTS gender text;

-- 2. Berikan izin SELECT & UPDATE kepada authenticated users & anon
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT SELECT ON public.profiles TO anon;

-- 3. Kebijakan RLS agar profil guru, santri, dan staf dapat dibaca dan dikelola
DROP POLICY IF EXISTS "Semua pengguna dapat melihat profil" ON public.profiles;
CREATE POLICY "Semua pengguna dapat melihat profil" ON public.profiles
  FOR SELECT TO authenticated, anon
  USING (true);

DROP POLICY IF EXISTS "Pengguna dapat memperbarui profil sendiri atau operator" ON public.profiles;
CREATE POLICY "Pengguna dapat memperbarui profil sendiri atau operator" ON public.profiles
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

-- 4. Trigger otomatis saat user baru mendaftar di auth.users -> sinkron ke public.profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role, email, created_at, updated_at)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'role', 'guru'),
    NEW.email,
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    role = EXCLUDED.role,
    email = EXCLUDED.email,
    updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
