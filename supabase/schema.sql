-- 1. Create classes table without foreign key to profiles
CREATE TABLE IF NOT EXISTS public.classes (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    teacher_id uuid, -- Foreign key to profiles (wali kelas) added later
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- 2. Create profiles table with foreign key to classes
CREATE TABLE IF NOT EXISTS public.profiles (
    id uuid primary key references auth.users(id) on delete cascade,
    full_name text not null,
    role text not null CHECK (role IN ('kepala_madrasah', 'operator', 'bendahara', 'walikelas', 'guru', 'siswa')),
    class_id uuid references public.classes(id) on delete set null, -- For students
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- 3. Add the foreign key constraint from classes to profiles
-- Use "alter table" to break the circular dependency between classes and profiles.
ALTER TABLE public.classes
ADD CONSTRAINT IF NOT EXISTS classes_teacher_id_fkey
FOREIGN KEY (teacher_id) REFERENCES public.profiles(id) ON DELETE SET NULL;

-- 4. RLS for profiles table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
CREATE POLICY "Users can read own profile" ON public.profiles
FOR SELECT TO authenticated
USING (id = auth.uid());
-- Grant select for authenticated users
REVOKE ALL ON public.profiles FROM anon, authenticated;
GRANT SELECT ON public.profiles TO authenticated;


-- 5. RLS for classes table
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Authenticated users can read classes" ON public.classes;
CREATE POLICY "Authenticated users can read classes" ON public.classes
FOR SELECT TO authenticated
USING (true);
-- Grant select for authenticated users
REVOKE ALL ON public.classes FROM anon, authenticated;
GRANT SELECT ON public.classes TO authenticated;
