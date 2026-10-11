import { supabase } from "../supabase.js";

// ============================================================================
// DATA BASELINE & STATE MANAGEMENT OPERATOR
// ============================================================================

export const STORAGE_KEY = "darunnajah_portal_operator_state";

export let appState = {
  // 1. Data Lembaga
  institution: {
    name: "MA Swasta Darunnajah Timampu",
    nsm: "131273240001",
    npsn: "69987654",
    jenjang: "Madrasah Aliyah (MA) Terpadu",
    status: "Swasta Terakreditasi B",
    address: "Jl. Pesantren No. 01, Desa Timampu, Kec. Towuti, Kab. Luwu Timur, Sulawesi Selatan",
    phone: "0821-9087-6543",
    email: "madarunnajahtimampu@gmail.com",
    academicYear: "2026/2027 (Ganjil)",
    headmaster: "Ustadz H. Ahmad Dahlan, S.Pd.I",
    vision: "Mencetak Generasi Qur'ani yang Berilmu, Berakhlak Mulia, dan Berdaya Saing Global.",
    lastUpdated: "Hari Ini"
  },

  // 2. Data Master
  classes: [],
  subjects: [],
  users: [], // Guru, Siswa, Operator, Staf
  teachers: [],
  students: [],
  
  // 3. Data Akademik & Operasional
  teachingAssignments: [], // Mapel Ampuh
  alumni: [],              // Data Alumni
  attendanceRecords: [],   // Data Absensi
  paymentRecords: [],      // Data Iuran

  // Filter & Search
  searchTerm: "",
  filterClass: "all"
};

// ============================================================================
// PERSISTENSI LOCAL STORAGE
// ============================================================================

export function saveAppState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      institution: appState.institution,
      teachers: appState.teachers,
      students: appState.students,
      users: appState.users,
      classes: appState.classes,
      subjects: appState.subjects,
      teachingAssignments: appState.teachingAssignments,
      alumni: appState.alumni,
      attendanceRecords: appState.attendanceRecords,
      paymentRecords: appState.paymentRecords
    }));
  } catch (e) {
    console.warn("Gagal menyimpan state ke localStorage:", e);
  }
}

export function ensureBaselineState() {
  if (appState.teachers.length === 0) {
    appState.teachers = [
      { id: "usr-guru-1", full_name: "Ustadz H. Ahmad Dahlan, S.Pd.I", email: "kamad@darunnajah.sch.id", role: "kepala_madrasah", nip: "197503122005011003", phone: "0812-4455-6677", gender: "Laki-laki", status: "Aktif Mengajar" },
      { id: "usr-guru-2", full_name: "Ustadz Muhammad Syukri, Lc.", email: "syukri@darunnajah.sch.id", role: "walikelas", nip: "198507202012011002", phone: "0813-8899-1122", gender: "Laki-laki", status: "Aktif Mengajar" },
      { id: "usr-guru-3", full_name: "Ustadzah Nurul Hidayah, S.Pd.", email: "nurul@darunnajah.sch.id", role: "walikelas", nip: "199008152018022004", phone: "0852-7788-9900", gender: "Perempuan", status: "Aktif Mengajar" },
      { id: "usr-guru-4", full_name: "Ustadz Fathurrahman, M.Pd.", email: "fathur@darunnajah.sch.id", role: "guru", nip: "198811042016011005", phone: "0821-3344-5566", gender: "Laki-laki", status: "Aktif Mengajar" },
      { id: "usr-guru-5", full_name: "Ustadzah Fatimah Azzahra, S.Ag.", email: "fatimah@darunnajah.sch.id", role: "guru", nip: "199204192019032001", phone: "0853-1122-3344", gender: "Perempuan", status: "Aktif Mengajar" }
    ];
  }
  if (appState.classes.length === 0) {
    appState.classes = [
      { id: "cls-1", name: "MA Kelas X IPA", level: "MA", teacher_id: "usr-guru-2", homeroom: "Ustadz Muhammad Syukri, Lc.", studentsCount: 28, room: "Ruang Kelas 10A" },
      { id: "cls-2", name: "MA Kelas XI IPA", level: "MA", teacher_id: "usr-guru-3", homeroom: "Ustadzah Nurul Hidayah, S.Pd.", studentsCount: 25, room: "Ruang Kelas 11A" },
      { id: "cls-3", name: "MA Kelas XII Keagamaan", level: "MA", teacher_id: "usr-guru-4", homeroom: "Ustadz Fathurrahman, M.Pd.", studentsCount: 24, room: "Ruang Kelas 12B" },
      { id: "cls-4", name: "SMP IT Kelas VII", level: "SMP IT", teacher_id: "usr-guru-5", homeroom: "Ustadzah Fatimah Azzahra, S.Ag.", studentsCount: 30, room: "Ruang SMP 1" },
      { id: "cls-5", name: "SMP IT Kelas VIII", level: "SMP IT", teacher_id: "usr-guru-2", homeroom: "Ustadz Muhammad Syukri, Lc.", studentsCount: 27, room: "Ruang SMP 2" },
      { id: "cls-6", name: "SMP IT Kelas IX", level: "SMP IT", teacher_id: "usr-guru-3", homeroom: "Ustadzah Nurul Hidayah, S.Pd.", studentsCount: 26, room: "Ruang SMP 3" },
      { id: "cls-7", name: "RA (Raudhatul Athfal)", level: "RA", teacher_id: "usr-guru-5", homeroom: "Ustadzah Fatimah Azzahra, S.Ag.", studentsCount: 20, room: "Ruang RA" }
    ];
  }
  if (appState.subjects.length === 0) {
    appState.subjects = [
      { id: "sub-1", code: "MP-01", name: "Tahfidz & Tahsin Al-Qur'an", category: "Agama & Kepesantrenan", hours: "6 Jam / Pekan" },
      { id: "sub-2", code: "MP-02", name: "Fiqih & Ushul Fiqih", category: "Agama & Kepesantrenan", hours: "4 Jam / Pekan" },
      { id: "sub-3", code: "MP-03", name: "Bahasa Arab", category: "Bahasa (Arab & Inggris)", hours: "4 Jam / Pekan" },
      { id: "sub-4", code: "MP-04", name: "Bahasa Inggris", category: "Bahasa (Arab & Inggris)", hours: "4 Jam / Pekan" },
      { id: "sub-5", code: "MP-05", name: "Matematika", category: "Sains & Matematika", hours: "4 Jam / Pekan" },
      { id: "sub-6", code: "MP-06", name: "Biologi", category: "Sains & Matematika", hours: "4 Jam / Pekan" },
      { id: "sub-7", code: "MP-07", name: "Hadits & Ilmu Hadits", category: "Agama & Kepesantrenan", hours: "3 Jam / Pekan" }
    ];
  }
  if (appState.students.length === 0) {
    appState.students = [
      { id: "std-1", full_name: "Ahmad Rizky Pratama", nisn: "0081234501", class_id: "cls-1", gender: "Laki-laki", status: "Aktif", phone: "0812-9988-7711", role: "siswa", email: "ahmad.rizky@darunnajah.sch.id" },
      { id: "std-2", full_name: "Muhammad Bilal Habibi", nisn: "0081234502", class_id: "cls-1", gender: "Laki-laki", status: "Aktif", phone: "0812-9988-7712", role: "siswa", email: "bilal.habibi@darunnajah.sch.id" },
      { id: "std-3", full_name: "Fathimah Zahra Syahidah", nisn: "0081234503", class_id: "cls-1", gender: "Perempuan", status: "Aktif", phone: "0812-9988-7713", role: "siswa", email: "fathimah.zahra@darunnajah.sch.id" },
      { id: "std-4", full_name: "Muhammad Raihan Al-Ghifari", nisn: "0071234504", class_id: "cls-2", gender: "Laki-laki", status: "Aktif", phone: "0812-9988-7714", role: "siswa", email: "raihan.ghifari@darunnajah.sch.id" },
      { id: "std-5", full_name: "Aisyah Humairah", nisn: "0071234505", class_id: "cls-2", gender: "Perempuan", status: "Aktif", phone: "0812-9988-7715", role: "siswa", email: "aisyah.humairah@darunnajah.sch.id" },
      { id: "std-6", full_name: "Zaidan Al-Faris", nisn: "0061234506", class_id: "cls-3", gender: "Laki-laki", status: "Aktif", phone: "0812-9988-7716", role: "siswa", email: "zaidan.alfaris@darunnajah.sch.id" },
      { id: "std-7", full_name: "Maryam Shalihah", nisn: "0061234507", class_id: "cls-3", gender: "Perempuan", status: "Aktif", phone: "0812-9988-7717", role: "siswa", email: "maryam.shalihah@darunnajah.sch.id" }
    ];
  }
  if (appState.teachingAssignments.length === 0) {
    appState.teachingAssignments = [
      { id: "asg-1", teacherId: "usr-guru-2", teacherName: "Ustadz Muhammad Syukri, Lc.", subjectId: "sub-1", subjectName: "Tahfidz & Tahsin Al-Qur'an", classId: "cls-1", className: "MA Kelas X IPA", hours: "07:30 - 09:00" },
      { id: "asg-2", teacherId: "usr-guru-2", teacherName: "Ustadz Muhammad Syukri, Lc.", subjectId: "sub-3", subjectName: "Bahasa Arab", classId: "cls-1", className: "MA Kelas X IPA", hours: "09:15 - 10:45" },
      { id: "asg-3", teacherId: "usr-guru-3", teacherName: "Ustadzah Nurul Hidayah, S.Pd.", subjectId: "sub-6", subjectName: "Biologi", classId: "cls-2", className: "MA Kelas XI IPA", hours: "07:30 - 09:00" },
      { id: "asg-4", teacherId: "usr-guru-4", teacherName: "Ustadz Fathurrahman, M.Pd.", subjectId: "sub-2", subjectName: "Fiqih & Ushul Fiqih", classId: "cls-3", className: "MA Kelas XII Keagamaan", hours: "08:00 - 09:30" }
    ];
  }
  if (appState.alumni.length === 0) {
    appState.alumni = [
      { id: "alm-1", name: "Muhammad Fikri Pratama", nisn: "0068472910", graduationYear: "2025", lastClass: "MA Kelas XII IPA", status: "Kuliah (UIN Alauddin Makassar)", phone: "0813-5566-7788" },
      { id: "alm-2", name: "Nurul Aisyah Zahra", nisn: "0069384721", graduationYear: "2025", lastClass: "MA Kelas XII Keagamaan", status: "Pondok Lanjutan (Kudus)", phone: "0852-4433-2211" }
    ];
  }
  if (appState.users.length === 0) {
    appState.users = [...appState.teachers, ...appState.students];
  }
}

export function loadAppState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.institution) appState.institution = { ...appState.institution, ...parsed.institution };
      if (Array.isArray(parsed.teachers) && parsed.teachers.length > 0) appState.teachers = parsed.teachers;
      if (Array.isArray(parsed.students) && parsed.students.length > 0) appState.students = parsed.students;
      if (Array.isArray(parsed.users) && parsed.users.length > 0) appState.users = parsed.users;
      if (Array.isArray(parsed.classes) && parsed.classes.length > 0) appState.classes = parsed.classes;
      if (Array.isArray(parsed.subjects) && parsed.subjects.length > 0) appState.subjects = parsed.subjects;
      if (Array.isArray(parsed.teachingAssignments) && parsed.teachingAssignments.length > 0) appState.teachingAssignments = parsed.teachingAssignments;
      if (Array.isArray(parsed.alumni) && parsed.alumni.length > 0) appState.alumni = parsed.alumni;
      if (Array.isArray(parsed.attendanceRecords) && parsed.attendanceRecords.length > 0) appState.attendanceRecords = parsed.attendanceRecords;
      if (Array.isArray(parsed.paymentRecords) && parsed.paymentRecords.length > 0) appState.paymentRecords = parsed.paymentRecords;
    }
  } catch (e) {
    console.warn("Gagal memuat state dari localStorage:", e);
  }

  ensureBaselineState();
}

// Inisialisasi awal
loadAppState();

// ============================================================================
// SINKRONISASI SUPABASE
// ============================================================================

export async function syncWithSupabase() {
  try {
    loadAppState();

    const [profilesRes, classesRes, subjectsRes, schedulesRes, attendanceRes, paymentsRes] = await Promise.allSettled([
      supabase.from("profiles").select("id, full_name, role, class_id").order("full_name"),
      supabase.from("classes").select("id, name, teacher_id"),
      supabase.from("subjects").select("id, name, description"),
      supabase.from("schedules").select("id, class_id, subject_id, teacher_id, day_of_week, start_time, end_time"),
      supabase.from("attendance").select("id, student_id, schedule_id, date, status"),
      supabase.from("payments").select("id, student_id, month, year, amount, status")
    ]);

    // 1. Profil Pengguna (Merge Cerdas tanpa menimpa data yang diedit)
    if (profilesRes.status === "fulfilled" && Array.isArray(profilesRes.value.data) && profilesRes.value.data.length > 0) {
      const dbProfiles = profilesRes.value.data;
      
      dbProfiles.forEach(u => {
        const existing = appState.users.find(x => x.id === u.id);
        if (existing) {
          existing.full_name = u.full_name || existing.full_name;
          existing.role = u.role || existing.role;
          if (u.class_id !== undefined) existing.class_id = u.class_id;
        } else {
          let email = `${u.full_name?.toLowerCase().replace(/\s+/g, ".") || "user"}@darunnajah.sch.id`;
          if (u.role === "operator" || u.role === "superadmin") email = "operator@darunnajah.sch.id";
          else if (u.role === "kepala_madrasah") email = "kamad@darunnajah.sch.id";
          else if (u.role === "walikelas") email = "walikelas@darunnajah.sch.id";
          else if (u.role === "bendahara") email = "bendahara@darunnajah.sch.id";
          else if (u.role === "siswa") email = "siswa@darunnajah.sch.id";

          appState.users.push({
            id: u.id,
            full_name: u.full_name || "Tanpa Nama",
            role: u.role || "siswa",
            email: email,
            class_id: u.class_id,
            phone: "0812-3456-7890",
            nip: u.role === "guru" || u.role === "walikelas" ? "198501012015011001" : "-",
            nisn: u.role === "siswa" ? "0081234567" : "-",
            gender: "Laki-laki",
            status: "Aktif"
          });
        }
      });

      appState.teachers = appState.users.filter(u => u.role === "guru" || u.role === "walikelas" || u.role === "kepala_madrasah");
      appState.students = appState.users.filter(u => u.role === "siswa");
    }

    // 2. Kelas / Rombel (Merge jika ada dari Supabase)
    if (classesRes.status === "fulfilled" && Array.isArray(classesRes.value.data) && classesRes.value.data.length > 0) {
      classesRes.value.data.forEach((c, idx) => {
        const existingCls = appState.classes.find(x => x.id === c.id);
        const teacher = appState.teachers.find(t => t.id === c.teacher_id);
        const count = appState.students.filter(s => s.class_id === c.id).length;
        if (existingCls) {
          existingCls.name = c.name;
          existingCls.teacher_id = c.teacher_id;
          existingCls.homeroom = teacher ? teacher.full_name : existingCls.homeroom || "Belum Ditugaskan";
          existingCls.studentsCount = count;
        } else {
          appState.classes.push({
            id: c.id,
            name: c.name,
            level: c.name.includes("SMP") ? "SMP IT" : c.name.includes("RA") ? "RA" : "MA",
            teacher_id: c.teacher_id,
            homeroom: teacher ? teacher.full_name : "Belum Ditugaskan",
            studentsCount: count || 0,
            room: `Ruang Kelas ${idx + 1}`
          });
        }
      });
    }

    // 3. Mata Pelajaran (Merge jika ada dari Supabase)
    if (subjectsRes.status === "fulfilled" && Array.isArray(subjectsRes.value.data) && subjectsRes.value.data.length > 0) {
      subjectsRes.value.data.forEach((s, idx) => {
        const existingSub = appState.subjects.find(x => x.id === s.id);
        if (existingSub) {
          existingSub.name = s.name;
          existingSub.category = s.description || existingSub.category;
        } else {
          appState.subjects.push({
            id: s.id,
            code: `MP-${String(idx + 1).padStart(2, '0')}`,
            name: s.name,
            category: s.description || "Umum",
            hours: "4 Jam / Pekan",
            kkm: 75
          });
        }
      });
    }

    // 4. Mapel Ampuh / Schedules
    if (schedulesRes.status === "fulfilled" && Array.isArray(schedulesRes.value.data) && schedulesRes.value.data.length > 0) {
      schedulesRes.value.data.forEach(sc => {
        const teacher = appState.teachers.find(t => t.id === sc.teacher_id);
        const subject = appState.subjects.find(s => s.id === sc.subject_id);
        const cls = appState.classes.find(c => c.id === sc.class_id);
        const existing = appState.teachingAssignments.find(x => x.id === sc.id);
        if (existing) {
          existing.teacherId = sc.teacher_id;
          existing.teacherName = teacher?.full_name || existing.teacherName;
          existing.subjectId = sc.subject_id;
          existing.subjectName = subject?.name || existing.subjectName;
          existing.classId = sc.class_id;
          existing.className = cls?.name || existing.className;
        } else {
          appState.teachingAssignments.push({
            id: sc.id,
            teacherId: sc.teacher_id,
            teacherName: teacher?.full_name || "Guru",
            subjectId: sc.subject_id,
            subjectName: subject?.name || "Mata Pelajaran",
            classId: sc.class_id,
            className: cls?.name || "Kelas",
            hours: `${sc.start_time?.substring(0, 5) || "08:00"} - ${sc.end_time?.substring(0, 5) || "09:30"}`
          });
        }
      });
    }

    // 5. Data Absensi
    if (attendanceRes.status === "fulfilled" && Array.isArray(attendanceRes.value.data) && attendanceRes.value.data.length > 0) {
      appState.attendanceRecords = attendanceRes.value.data;
    }

    // 6. Data Iuran
    if (paymentsRes.status === "fulfilled" && Array.isArray(paymentsRes.value.data) && paymentsRes.value.data.length > 0) {
      appState.paymentRecords = paymentsRes.value.data;
    }

    ensureBaselineState();
    saveAppState();

  } catch (err) {
    console.warn("Sinkronisasi Supabase:", err);
  }
}
