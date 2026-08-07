-- This is an extended schema to support the application's features.

-- subjects table
CREATE TABLE IF NOT EXISTS public.subjects (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    description text,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- classes table
CREATE TABLE IF NOT EXISTS public.classes (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    teacher_id uuid references public.profiles(id) on delete set null, -- Wali Kelas
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- schedules table
CREATE TABLE IF NOT EXISTS public.schedules (
    id uuid primary key default gen_random_uuid(),
    class_id uuid not null references public.classes(id) on delete cascade,
    subject_id uuid not null references public.subjects(id) on delete cascade,
    teacher_id uuid not null references public.profiles(id) on delete cascade,
    day_of_week int not null CHECK (day_of_week >= 1 AND day_of_week <= 7), -- 1 for Monday, 7 for Sunday
    start_time time not null,
    end_time time not null,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- attendance table
CREATE TABLE IF NOT EXISTS public.attendance (
    id uuid primary key default gen_random_uuid(),
    student_id uuid not null references public.profiles(id) on delete cascade,
    schedule_id uuid not null references public.schedules(id) on delete cascade,
    date date not null,
    status text not null CHECK (status IN ('hadir', 'sakit', 'izin', 'alfa')),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- assignments table
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

-- grades table
CREATE TABLE IF NOT EXISTS public.grades (
    id uuid primary key default gen_random_uuid(),
    assignment_id uuid not null references public.assignments(id) on delete cascade,
    student_id uuid not null references public.profiles(id) on delete cascade,
    grade int not null,
    feedback text,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- payments table
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
