-- =========================================================================
-- SETUP LENGKAP SUPABASE UNTUK PORTAL DARUNNAJAH
-- Jalankan skrip ini di SQL Editor Supabase untuk memastikan seluruh tabel,
-- relasi, constraint role, RLS, trigger, dan user sync terpasang sempurna.
-- =========================================================================

-- 1. Tabel Master Classes (Kelas / Rombel)
CREATE TABLE IF NOT EXISTS public.classes (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    teacher_id uuid, -- Foreign key ke profiles (Wali Kelas)
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- 2. Tabel Profiles (User Profiles)
CREATE TABLE IF NOT EXISTS public.profiles (
    id uuid primary key references auth.users(id) on delete cascade,
    full_name text not null,
    role text not null default 'siswa',
    class_id uuid references public.classes(id) on delete set null,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- Perbarui constraint role agar mendukung superadmin, operator, dan seluruh role madrasah
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE public.profiles
ADD CONSTRAINT profiles_role_check
CHECK (role IN ('superadmin', 'operator', 'kepala_madrasah', 'bendahara', 'walikelas', 'guru', 'siswa', 'unassigned'));

-- 3. Constraint Foreign Key Classes -> Profiles
ALTER TABLE public.classes DROP CONSTRAINT IF EXISTS classes_teacher_id_fkey;
ALTER TABLE public.classes
ADD CONSTRAINT classes_teacher_id_fkey
FOREIGN KEY (teacher_id) REFERENCES public.profiles(id) ON DELETE SET NULL;

-- 4. Tabel Mata Pelajaran (Subjects)
CREATE TABLE IF NOT EXISTS public.subjects (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    description text,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- 5. Tabel Jadwal (Schedules)
CREATE TABLE IF NOT EXISTS public.schedules (
    id uuid primary key default gen_random_uuid(),
    class_id uuid not null references public.classes(id) on delete cascade,
    subject_id uuid not null references public.subjects(id) on delete cascade,
    teacher_id uuid not null references public.profiles(id) on delete cascade,
    day_of_week int not null CHECK (day_of_week >= 1 AND day_of_week <= 7), -- 1: Senin, 7: Minggu
    start_time time not null,
    end_time time not null,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- 6. Tabel Absensi (Attendance)
CREATE TABLE IF NOT EXISTS public.attendance (
    id uuid primary key default gen_random_uuid(),
    student_id uuid not null references public.profiles(id) on delete cascade,
    schedule_id uuid not null references public.schedules(id) on delete cascade,
    date date not null,
    status text not null CHECK (status IN ('hadir', 'sakit', 'izin', 'alfa')),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- 7. Tabel Tugas (Assignments)
CREATE TABLE IF NOT EXISTS public.assignments (
    id uuid primary key default gen_random_uuid(),
    subject_id uuid not null references public.subjects(id) on delete cascade,
    class_id uuid not null references public.classes(id) on delete cascade,
    teacher_id uuid not null references public.profiles(id) on delete cascade,
    title text not null,
    description text,
    due_date timestamptz not null,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- 8. Tabel Nilai (Grades)
CREATE TABLE IF NOT EXISTS public.grades (
    id uuid primary key default gen_random_uuid(),
    assignment_id uuid not null references public.assignments(id) on delete cascade,
    student_id uuid not null references public.profiles(id) on delete cascade,
    grade int not null,
    feedback text,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- 9. Tabel SPP & Pembayaran (Payments)
CREATE TABLE IF NOT EXISTS public.payments (
    id uuid primary key default gen_random_uuid(),
    student_id uuid not null references public.profiles(id) on delete cascade,
    month int not null,
    year int not null,
    amount int not null,
    status text not null CHECK (status IN ('lunas', 'belum_lunas', 'menunggu_konfirmasi')),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- 10. Tabel Pelanggaran & Tata Tertib Santri (Violations)
CREATE TABLE IF NOT EXISTS public.violations (
    id uuid primary key default gen_random_uuid(),
    student_id uuid not null references public.profiles(id) on delete cascade,
    reported_by uuid references public.profiles(id) on delete set null,
    title text not null, -- Jenis/keterangan pelanggaran
    category text not null CHECK (category IN ('ringan', 'sedang', 'berat')),
    points int not null default 5, -- Poin pelanggaran
    action_taken text, -- Tindakan / sanksi
    date date not null default CURRENT_DATE,
    created_at timestamptz not null default now()
);

-- =========================================================================
-- ROW LEVEL SECURITY (RLS) & PRIVILEGES
-- =========================================================================

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.violations ENABLE ROW LEVEL SECURITY;

-- Grant permissions to authenticated & anon
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT SELECT ON public.classes TO authenticated, anon;
GRANT SELECT ON public.subjects TO authenticated, anon;
GRANT SELECT ON public.schedules TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.attendance TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.assignments TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.grades TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.payments TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.violations TO authenticated;

-- Policies
DROP POLICY IF EXISTS "Authenticated users can read profiles" ON public.profiles;
CREATE POLICY "Authenticated users can read profiles" ON public.profiles
FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
FOR UPDATE TO authenticated USING (true);

DROP POLICY IF EXISTS "Users can insert profiles" ON public.profiles;
CREATE POLICY "Users can insert profiles" ON public.profiles
FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users can delete profiles" ON public.profiles;
CREATE POLICY "Authenticated users can delete profiles" ON public.profiles
FOR DELETE TO authenticated USING (true);

DROP POLICY IF EXISTS "Authenticated users can read classes" ON public.classes;
CREATE POLICY "Authenticated users can read classes" ON public.classes
FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can insert classes" ON public.classes;
CREATE POLICY "Authenticated users can insert classes" ON public.classes
FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users can read subjects" ON public.subjects;
CREATE POLICY "Authenticated users can read subjects" ON public.subjects
FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can insert subjects" ON public.subjects;
CREATE POLICY "Authenticated users can insert subjects" ON public.subjects
FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users can read schedules" ON public.schedules;
CREATE POLICY "Authenticated users can read schedules" ON public.schedules
FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Authenticated users can read attendance" ON public.attendance;
CREATE POLICY "Authenticated users can read attendance" ON public.attendance
FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Authenticated users can read assignments" ON public.assignments;
CREATE POLICY "Authenticated users can read assignments" ON public.assignments
FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Authenticated users can read grades" ON public.grades;
CREATE POLICY "Authenticated users can read grades" ON public.grades
FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Authenticated users can read payments" ON public.payments;
CREATE POLICY "Authenticated users can read payments" ON public.payments
FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Authenticated users can read violations" ON public.violations;
CREATE POLICY "Authenticated users can read violations" ON public.violations
FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Authenticated users can insert violations" ON public.violations;
CREATE POLICY "Authenticated users can insert violations" ON public.violations
FOR INSERT TO authenticated WITH CHECK (true);

-- =========================================================================
-- TRIGGER AUTO-INSERT PROFILES DARI AUTH.USERS
-- =========================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, role)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        COALESCE(NEW.raw_user_meta_data->>'role', 'siswa')
    )
    ON CONFLICT (id) DO UPDATE
    SET 
        full_name = EXCLUDED.full_name,
        role = EXCLUDED.role;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =========================================================================
-- SINKRONISASI USER LAMA DARI AUTH.USERS KE PROFILES
-- =========================================================================
INSERT INTO public.profiles (id, full_name, role)
SELECT 
    id,
    COALESCE(raw_user_meta_data->>'full_name', split_part(email, '@', 1)),
    CASE 
        WHEN raw_user_meta_data->>'role' IN ('superadmin', 'operator', 'kepala_madrasah', 'bendahara', 'walikelas', 'guru', 'siswa', 'unassigned') 
        THEN raw_user_meta_data->>'role'
        ELSE 'operator'
    END
FROM auth.users
ON CONFLICT (id) DO UPDATE
SET 
    full_name = EXCLUDED.full_name,
    role = EXCLUDED.role;

-- =========================================================================
-- DAFTAR AKUN RESMI PORTAL MADRASAH DARUNNAJAH (SUPABASE AUTH AKTIF)
-- Password default seluruh akun: Password123!
-- =========================================================================
-- 1. Operator (Superadmin) : operator@darunnajah.sch.id -> Ustadz Aziz Wahab, S.Kom
-- 2. Kepala Madrasah      : kamad@darunnajah.sch.id    -> Drs. H. Ahmad Dahlan, M.Pd.I
-- 3. Dewan Guru            : guru@darunnajah.sch.id     -> Ustadz Rahmat Hidayat, S.Pd
-- 4. Wali Kelas            : walikelas@darunnajah.sch.id-> Ustadzah Nurul Fadhilah, S.Pd.I
-- 5. Bendahara Madrasah    : bendahara@darunnajah.sch.id-> Ustadz Ridwan Malik, S.E
-- 6. Santri / Siswa        : siswa@darunnajah.sch.id    -> Muhammad Fatih Al-Ayyubi

