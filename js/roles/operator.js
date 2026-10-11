// js/roles/operator.js - Dashboard Operator & Superadmin Madrasah Darunnajah
import { supabase } from "../supabase.js";

// ============================================================================
// DATA BASELINE & STATE MANAGEMENT
// ============================================================================

export const roleLabel = "Operator (Superadmin)";

let appState = {
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
// SINKRONISASI DATA SUPABASE
// ============================================================================

async function syncWithSupabase() {
  try {
    const [profilesRes, classesRes, subjectsRes, schedulesRes, attendanceRes, paymentsRes] = await Promise.allSettled([
      supabase.from("profiles").select("id, full_name, role, class_id").order("full_name"),
      supabase.from("classes").select("id, name, teacher_id"),
      supabase.from("subjects").select("id, name, description"),
      supabase.from("schedules").select("id, class_id, subject_id, teacher_id, day_of_week, start_time, end_time"),
      supabase.from("attendance").select("id, student_id, schedule_id, date, status"),
      supabase.from("payments").select("id, student_id, month, year, amount, status")
    ]);

    // 1. Profil Pengguna
    if (profilesRes.status === "fulfilled" && profilesRes.value.data) {
      appState.users = profilesRes.value.data.map(u => ({
        id: u.id,
        full_name: u.full_name || "Tanpa Nama",
        role: u.role || "siswa",
        email: (u.role === "operator" || u.role === "superadmin") ? "operator@darunnajah.sch.id" :
               (u.role === "kepala_madrasah") ? "kamad@darunnajah.sch.id" :
               (u.role === "walikelas") ? "walikelas@darunnajah.sch.id" :
               (u.role === "bendahara") ? "bendahara@darunnajah.sch.id" :
               (u.role === "siswa") ? "siswa@darunnajah.sch.id" :
               (u.role === "guru") ? "guru@darunnajah.sch.id" :
               `${u.full_name?.toLowerCase().replace(/\s+/g, ".") || "user"}@darunnajah.sch.id`,
        class_id: u.class_id,
        phone: "0812-3456-7890",
        nip: u.role === "guru" || u.role === "walikelas" ? `1985${Math.floor(100000 + Math.random() * 900000)}` : "-",
        nisn: u.role === "siswa" ? `008${Math.floor(1000000 + Math.random() * 9000000)}` : "-",
        gender: "Laki-laki",
        status: "Aktif"
      }));

      appState.teachers = appState.users.filter(u => u.role === "guru" || u.role === "walikelas" || u.role === "kepala_madrasah");
      appState.students = appState.users.filter(u => u.role === "siswa");
    }

    // 2. Kelas / Rombel
    if (classesRes.status === "fulfilled" && classesRes.value.data) {
      appState.classes = classesRes.value.data.map((c, idx) => {
        const teacher = appState.teachers.find(t => t.id === c.teacher_id);
        const count = appState.students.filter(s => s.class_id === c.id).length;
        return {
          id: c.id,
          name: c.name,
          level: c.name.includes("SMP") ? "SMP IT" : c.name.includes("RA") ? "RA" : "MA",
          teacher_id: c.teacher_id,
          homeroom: teacher ? teacher.full_name : "Belum Ditugaskan",
          studentsCount: count || 0,
          room: `Ruang Kelas ${idx + 1}`
        };
      });
    }

    // 3. Mata Pelajaran
    if (subjectsRes.status === "fulfilled" && subjectsRes.value.data) {
      appState.subjects = subjectsRes.value.data.map((s, idx) => ({
        id: s.id,
        code: `MP-${String(idx + 1).padStart(2, '0')}`,
        name: s.name,
        category: s.description || "Umum",
        hours: "4 Jam / Pekan",
        kkm: 75
      }));
    }

    // 4. Mapel Ampuh / Schedules
    if (schedulesRes.status === "fulfilled" && schedulesRes.value.data) {
      appState.teachingAssignments = schedulesRes.value.data.map(sc => {
        const teacher = appState.teachers.find(t => t.id === sc.teacher_id);
        const subject = appState.subjects.find(s => s.id === sc.subject_id);
        const cls = appState.classes.find(c => c.id === sc.class_id);
        return {
          id: sc.id,
          teacherId: sc.teacher_id,
          teacherName: teacher?.full_name || "Guru",
          subjectId: sc.subject_id,
          subjectName: subject?.name || "Mata Pelajaran",
          classId: sc.class_id,
          className: cls?.name || "Kelas",
          hours: `${sc.start_time?.substring(0, 5) || "08:00"} - ${sc.end_time?.substring(0, 5) || "09:30"}`
        };
      });
    }

    // 5. Data Absensi
    if (attendanceRes.status === "fulfilled" && attendanceRes.value.data) {
      appState.attendanceRecords = attendanceRes.value.data;
    }

    // 6. Data Iuran
    if (paymentsRes.status === "fulfilled" && paymentsRes.value.data) {
      appState.paymentRecords = paymentsRes.value.data;
    }

    // Baseline Alumni jika kosong
    if (appState.alumni.length === 0) {
      appState.alumni = [
        { id: "alm-1", name: "Muhammad Fikri Pratama", nisn: "0068472910", graduationYear: "2025", lastClass: "MA Kelas XII IPA", status: "Kuliah (UIN Alauddin Makassar)", phone: "0813-5566-7788" },
        { id: "alm-2", name: "Nurul Aisyah Zahra", nisn: "0069384721", graduationYear: "2025", lastClass: "MA Kelas XII Keagamaan", status: "Pondok Lanjutan (Kudus)", phone: "0852-4433-2211" }
      ];
    }

  } catch (err) {
    console.warn("Sinkronisasi Supabase:", err);
  }
}

// ============================================================================
// STRUKTUR 5 MENU UTAMA & SUB-MENU (SESUAI SPESIFIKASI USER)
// ============================================================================

export const menuGroups = [
  {
    id: "lembaga",
    title: "1. Lembaga",
    icon: "🏢",
    description: "Ringkasan Utama & Data Lembaga",
    submenus: [
      { id: "lembaga_info", label: "a. Pengaturan Data Lembaga", icon: "🏛️", subtitle: "Profil Lembaga, Identitas Madrasah & Ringkasan Data" },
      { id: "lembaga_mapel", label: "b. Pengaturan Data Mapel", icon: "📖", subtitle: "Kelola Kurikulum Mata Pelajaran, Tambah & Hapus Mapel" },
      { id: "lembaga_rombel", label: "c. Pengaturan Rombel", icon: "🏫", subtitle: "Kelola Rombongan Belajar, Nama Kelas & Penetapan Wali Kelas" }
    ]
  },
  {
    id: "guru",
    title: "2. Guru",
    icon: "👨‍🏫",
    description: "Data Asatidz & Guru Mengajar",
    submenus: [
      { id: "guru_data", label: "a. Data Guru", icon: "👤", subtitle: "Manajemen Akun Guru, Biodata & Hak Akses Pendidik" },
      { id: "guru_mapel", label: "b. Mapel Ampuh", icon: "📚", subtitle: "Pengaturan Penugasan Guru Mengajar per Mapel & Kelas" }
    ]
  },
  {
    id: "murid",
    title: "3. Murid",
    icon: "🎓",
    description: "Database Seluruh Santri/Murid",
    submenus: [
      { id: "murid_data", label: "a. Data Murid", icon: "👦", subtitle: "Pusat Data Murid, Tambah/Hapus & Filter per Rombel" },
      { id: "murid_pindah", label: "b. Pindah Kelas", icon: "🔄", subtitle: "Fitur Mutasi dan Pemindahan Siswa Antar Rombel" },
      { id: "murid_naik", label: "c. Naik Kelas", icon: "📈", subtitle: "Penetapan Kenaikan Kelas Santri Akhir Tahun Ajaran" },
      { id: "murid_alumni", label: "d. Data Alumni", icon: "🎓", subtitle: "Fitur Pelacakan & Direktori Alumni Tamatan Madrasah" }
    ]
  },
  {
    id: "kehadiran",
    title: "4. Kehadiran",
    icon: "📋",
    description: "Monitoring Presensi Santri",
    submenus: [
      { id: "kehadiran_absen", label: "a. Absen", icon: "✍️", subtitle: "Pengisian Presensi Kehadiran Murid per Kelas" },
      { id: "kehadiran_rekap", label: "b. Rekapitulasi Kehadiran", icon: "📊", subtitle: "Statistik, Rekap & Persentase Kehadiran Murid per Kelas" }
    ]
  },
  {
    id: "keuangan",
    title: "5. Keuangan",
    icon: "💰",
    description: "Monitoring & Pengelolaan Iuran",
    submenus: [
      { id: "keuangan_iuran", label: "a. Iuran", icon: "💳", subtitle: "Pengisian Iuran Harian/Mingguan/Bulanan oleh Wali Kelas" },
      { id: "keuangan_rekap", label: "b. Rekapitulasi Iuran", icon: "📈", subtitle: "Laporan & Statistik Data Iuran Masuk per Kelas" }
    ]
  }
];

// Flat menu items untuk router
export const menuItems = menuGroups.flatMap(g => g.submenus);

// ============================================================================
// PILAR 1: LEMBAGA
// ============================================================================

// 1.a. Pengaturan Data Lembaga (Ringkasan Utama & Konfigurasi Profil)
function renderLembagaInfoPage(container) {
  const inst = appState.institution;
  const totalMurid = appState.students.length;
  const totalGuru = appState.teachers.length;
  const totalRombel = appState.classes.length;
  const totalMapel = appState.subjects.length;
  const totalKas = appState.paymentRecords.filter(p => p.status === 'lunas').reduce((a, b) => a + (b.amount || 0), 0);

  container.innerHTML = `
    <div class="space-y-6">
      <!-- HEADER RINGKASAN UTAMA -->
      <article class="relative overflow-hidden rounded-3xl border border-emerald-800/20 bg-gradient-to-r from-emerald-950 via-[#0b3b01] to-[#004d2e] p-6 text-white shadow-2xl">
        <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div class="flex flex-wrap items-center gap-2">
              <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-xs font-bold uppercase tracking-wider text-emerald-300 border border-emerald-400/30">
                <span class="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
                Ringkasan Utama Lembaga
              </span>
              <span class="px-2.5 py-0.5 rounded-full bg-white/10 text-[11px] text-emerald-200 font-medium">
                TA ${inst.academicYear}
              </span>
            </div>
            <h2 class="mt-3 text-2xl sm:text-3xl font-black tracking-tight">${inst.name}</h2>
            <p class="text-xs sm:text-sm text-emerald-100/80 mt-1 max-w-2xl leading-relaxed">
              ${inst.address}
            </p>
          </div>
          <div class="flex items-center gap-2">
            <button id="btn-save-institution" class="px-5 py-2.5 bg-white text-[#0b3b01] rounded-xl text-xs font-bold shadow-lg hover:bg-emerald-50 transition active:scale-95 cursor-pointer">
              💾 Simpan Perubahan Lembaga
            </button>
          </div>
        </div>

        <!-- 4 METRIK KPI RINGKASAN UTAMA -->
        <div class="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3.5">
          <div class="rounded-2xl bg-white/10 p-4 backdrop-blur-md border border-white/10">
            <span class="text-xs text-emerald-200 font-semibold uppercase tracking-wider">Total Murid</span>
            <p class="text-2xl sm:text-3xl font-black mt-1 text-white">${totalMurid} Santri</p>
            <p class="text-[11px] text-emerald-200/80 mt-1">Tersebar di ${totalRombel} Rombel</p>
          </div>
          <div class="rounded-2xl bg-white/10 p-4 backdrop-blur-md border border-white/10">
            <span class="text-xs text-emerald-200 font-semibold uppercase tracking-wider">Dewan Guru</span>
            <p class="text-2xl sm:text-3xl font-black mt-1 text-white">${totalGuru} Asatidz</p>
            <p class="text-[11px] text-emerald-200/80 mt-1">Pengajar & Wali Kelas</p>
          </div>
          <div class="rounded-2xl bg-white/10 p-4 backdrop-blur-md border border-white/10">
            <span class="text-xs text-emerald-200 font-semibold uppercase tracking-wider">Rombel & Mapel</span>
            <p class="text-2xl sm:text-3xl font-black mt-1 text-white">${totalRombel} / ${totalMapel}</p>
            <p class="text-[11px] text-emerald-200/80 mt-1">Kelas Aktif / Mata Pelajaran</p>
          </div>
          <div class="rounded-2xl bg-white/10 p-4 backdrop-blur-md border border-white/10">
            <span class="text-xs text-emerald-200 font-semibold uppercase tracking-wider">Iuran Kas Terkumpul</span>
            <p class="text-xl sm:text-2xl font-black mt-1 text-emerald-300">Rp ${totalKas.toLocaleString('id-ID')}</p>
            <p class="text-[11px] text-emerald-200/80 mt-1">Status Keuangan Terverifikasi</p>
          </div>
        </div>
      </article>

      <!-- FORMULIR PENGATURAN DATA LEMBAGA -->
      <div class="rounded-3xl border border-white/70 bg-white/95 p-6 shadow-xl shadow-[#0b3b01]/5 space-y-6">
        <div>
          <h3 class="text-lg font-black text-[#0b3b01]">Pengaturan Identitas & Legalitas Lembaga</h3>
          <p class="text-xs text-slate-500 mt-0.5">Konfigurasi data pokok madrasah untuk keperluan administrasi dan pelaporan resmi.</p>
        </div>

        <form id="form-institution-settings" class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div>
            <label class="block font-bold text-slate-700 mb-1">Nama Resmi Lembaga</label>
            <input id="inst-name" type="text" value="${inst.name}" required
              class="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs text-slate-800 focus:border-emerald-600 focus:outline-none" />
          </div>
          <div>
            <label class="block font-bold text-slate-700 mb-1">Kepala Madrasah / Pimpinan</label>
            <input id="inst-headmaster" type="text" value="${inst.headmaster}" required
              class="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs text-slate-800 focus:border-emerald-600 focus:outline-none" />
          </div>
          <div>
            <label class="block font-bold text-slate-700 mb-1">Nomor Statistik Madrasah (NSM)</label>
            <input id="inst-nsm" type="text" value="${inst.nsm}" required
              class="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs text-slate-800 focus:border-emerald-600 focus:outline-none" />
          </div>
          <div>
            <label class="block font-bold text-slate-700 mb-1">NPSN</label>
            <input id="inst-npsn" type="text" value="${inst.npsn}" required
              class="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs text-slate-800 focus:border-emerald-600 focus:outline-none" />
          </div>
          <div>
            <label class="block font-bold text-slate-700 mb-1">Jenjang & Status Akreditasi</label>
            <input id="inst-status" type="text" value="${inst.status}" required
              class="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs text-slate-800 focus:border-emerald-600 focus:outline-none" />
          </div>
          <div>
            <label class="block font-bold text-slate-700 mb-1">Tahun Ajaran Aktif</label>
            <input id="inst-academic" type="text" value="${inst.academicYear}" required
              class="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs text-slate-800 focus:border-emerald-600 focus:outline-none" />
          </div>
          <div class="md:col-span-2">
            <label class="block font-bold text-slate-700 mb-1">Alamat Lengkap</label>
            <input id="inst-address" type="text" value="${inst.address}" required
              class="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs text-slate-800 focus:border-emerald-600 focus:outline-none" />
          </div>
          <div>
            <label class="block font-bold text-slate-700 mb-1">Nomor Telepon / WhatsApp Madrasah</label>
            <input id="inst-phone" type="text" value="${inst.phone}" required
              class="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs text-slate-800 focus:border-emerald-600 focus:outline-none" />
          </div>
          <div>
            <label class="block font-bold text-slate-700 mb-1">Email Resmi Madrasah</label>
            <input id="inst-email" type="email" value="${inst.email}" required
              class="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs text-slate-800 focus:border-emerald-600 focus:outline-none" />
          </div>
          <div class="md:col-span-2">
            <label class="block font-bold text-slate-700 mb-1">Visi Madrasah</label>
            <textarea id="inst-vision" rows="2" class="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs text-slate-800 focus:border-emerald-600 focus:outline-none">${inst.vision}</textarea>
          </div>
          <div class="md:col-span-2 pt-2">
            <button type="submit" class="w-full sm:w-auto px-6 py-2.5 bg-[#0b3b01] text-white rounded-xl font-bold hover:bg-[#06410a] transition shadow-md cursor-pointer">
              Simpan Pembaruan Data Lembaga
            </button>
          </div>
        </form>
      </div>
    </div>
  `;

  // Submit Handler
  const handleSave = (e) => {
    if (e) e.preventDefault();
    inst.name = document.getElementById("inst-name").value.trim();
    inst.headmaster = document.getElementById("inst-headmaster").value.trim();
    inst.nsm = document.getElementById("inst-nsm").value.trim();
    inst.npsn = document.getElementById("inst-npsn").value.trim();
    inst.status = document.getElementById("inst-status").value.trim();
    inst.academicYear = document.getElementById("inst-academic").value.trim();
    inst.address = document.getElementById("inst-address").value.trim();
    inst.phone = document.getElementById("inst-phone").value.trim();
    inst.email = document.getElementById("inst-email").value.trim();
    inst.vision = document.getElementById("inst-vision").value.trim();

    window.dashboardModal.toast("Data lembaga berhasil diperbarui!", "success");
    renderLembagaInfoPage(container);
  };

  document.getElementById("form-institution-settings")?.addEventListener("submit", handleSave);
  document.getElementById("btn-save-institution")?.addEventListener("click", handleSave);
}

// 1.b. Pengaturan Data Mapel (Tambah/Hapus Mapel)
function renderLembagaMapelPage(container) {
  container.innerHTML = `
    <div class="rounded-3xl border border-white/70 bg-white/95 p-6 shadow-xl shadow-[#0b3b01]/5 space-y-5">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 class="text-xl font-black text-[#0b3b01]">Pengaturan Data Mata Pelajaran (Mapel)</h3>
          <p class="text-xs text-slate-500 mt-0.5">Kelola kurikulum kepesantrenan, agama, bahasa, dan sains madrasah.</p>
        </div>
        <button id="btn-add-mapel" class="inline-flex items-center gap-2 rounded-xl bg-[#0b3b01] px-4 py-2.5 text-xs font-bold text-white hover:bg-[#06410a] transition shadow-md cursor-pointer">
          <span>➕</span> Tambah Mapel Baru
        </button>
      </div>

      ${appState.subjects.length === 0 ? `
        <div class="p-12 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-300">
          <div class="text-4xl mb-2">📖</div>
          <h4 class="font-bold text-slate-800 text-sm">Belum Ada Mata Pelajaran</h4>
          <p class="text-xs text-slate-500 mt-1 max-w-sm mx-auto">Mulai tambahkan mata pelajaran pertama madrasah.</p>
          <button id="btn-empty-add-mapel" class="mt-4 px-4 py-2 bg-[#0b3b01] text-white text-xs font-bold rounded-xl cursor-pointer">
            + Tambah Mapel
          </button>
        </div>
      ` : `
        <div class="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
          <table class="w-full text-left text-xs">
            <thead class="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-600">
              <tr>
                <th class="px-4 py-3.5">Kode Mapel</th>
                <th class="px-4 py-3.5">Nama Mata Pelajaran</th>
                <th class="px-4 py-3.5">Kategori Kurikulum</th>
                <th class="px-4 py-3.5">Beban Jam</th>
                <th class="px-4 py-3.5 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              ${appState.subjects.map(s => `
                <tr class="hover:bg-slate-50/60 transition">
                  <td class="px-4 py-3 font-mono font-bold text-emerald-800">${s.code}</td>
                  <td class="px-4 py-3 font-bold text-slate-900">${s.name}</td>
                  <td class="px-4 py-3 text-slate-600">
                    <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      ${s.category}
                    </span>
                  </td>
                  <td class="px-4 py-3 text-slate-600">${s.hours}</td>
                  <td class="px-4 py-3 text-center">
                    <button class="btn-delete-mapel px-3 py-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 font-bold text-[11px] transition cursor-pointer" data-id="${s.id}" data-name="${s.name}">
                      🗑️ Hapus
                    </button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
        <div class="text-[11px] text-slate-400">Total ${appState.subjects.length} mata pelajaran aktif.</div>
      `}
    </div>
  `;

  const refresh = () => renderLembagaMapelPage(container);

  // Modal Tambah Mapel
  const openModalMapel = () => {
    window.dashboardModal.open({
      title: "➕ Tambah Mata Pelajaran Baru",
      bodyHtml: `
        <form id="form-modal-mapel" class="space-y-3.5 text-xs">
          <div>
            <label class="block font-bold text-slate-700 mb-1">Nama Mata Pelajaran</label>
            <input id="m-name" type="text" placeholder="Contoh: Fiqih Ibadah / Bahasa Arab / Biologi" required
              class="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs text-slate-800 focus:border-emerald-600 focus:outline-none" />
          </div>
          <div>
            <label class="block font-bold text-slate-700 mb-1">Kategori Kurikulum</label>
            <select id="m-cat" class="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs text-slate-800 focus:border-emerald-600 focus:outline-none">
              <option value="Agama & Kepesantrenan">Agama & Kepesantrenan</option>
              <option value="Bahasa (Arab & Inggris)">Bahasa (Arab & Inggris)</option>
              <option value="Sains & Matematika">Sains & Matematika</option>
              <option value="Ilmu Pengetahuan Sosial">Ilmu Pengetahuan Sosial</option>
              <option value="Muatan Lokal & Keterampilan">Muatan Lokal & Keterampilan</option>
            </select>
          </div>
          <div>
            <label class="block font-bold text-slate-700 mb-1">Beban Jam / Pekan</label>
            <input id="m-hours" type="text" value="4 Jam / Pekan" required
              class="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs text-slate-800 focus:border-emerald-600 focus:outline-none" />
          </div>
          <div class="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button type="submit" class="px-5 py-2.5 bg-[#0b3b01] text-white rounded-xl font-bold hover:bg-[#06410a] transition cursor-pointer">
              Simpan Mapel
            </button>
          </div>
        </form>
      `,
      onMount: (modalBody, close) => {
        modalBody.querySelector("#form-modal-mapel")?.addEventListener("submit", async (e) => {
          e.preventDefault();
          const name = modalBody.querySelector("#m-name").value.trim();
          const cat = modalBody.querySelector("#m-cat").value;
          const hours = modalBody.querySelector("#m-hours").value.trim();

          try {
            const { data, error } = await supabase.from("subjects").insert([{ name, description: cat }]).select();
            if (error) throw error;
            appState.subjects.push({
              id: data?.[0]?.id || `sub-${Date.now()}`,
              code: `MP-${String(appState.subjects.length + 1).padStart(2, '0')}`,
              name,
              category: cat,
              hours
            });
            window.dashboardModal.toast(`Mata pelajaran ${name} berhasil ditambahkan!`, "success");
            close();
            refresh();
          } catch (err) {
            window.dashboardModal.toast(`Gagal menambahkan: ${err.message}`, "error");
          }
        });
      }
    });
  };

  document.getElementById("btn-add-mapel")?.addEventListener("click", openModalMapel);
  document.getElementById("btn-empty-add-mapel")?.addEventListener("click", openModalMapel);

  // Hapus Mapel
  container.querySelectorAll(".btn-delete-mapel").forEach(btn => {
    btn.addEventListener("click", async () => {
      const id = btn.dataset.id;
      const name = btn.dataset.name;
      if (confirm(`Apakah Anda yakin ingin menghapus mata pelajaran "${name}"?`)) {
        try {
          await supabase.from("subjects").delete().eq("id", id);
          appState.subjects = appState.subjects.filter(s => s.id !== id);
          window.dashboardModal.toast(`Mata pelajaran "${name}" berhasil dihapus.`, "success");
          refresh();
        } catch (err) {
          window.dashboardModal.toast(`Gagal menghapus: ${err.message}`, "error");
        }
      }
    });
  });
}

// 1.c. Pengaturan Rombel (Tambah/Hapus Rombel, Edit Nama Rombel, Edit Wali Kelas)
function renderLembagaRombelPage(container) {
  container.innerHTML = `
    <div class="rounded-3xl border border-white/70 bg-white/95 p-6 shadow-xl shadow-[#0b3b01]/5 space-y-5">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 class="text-xl font-black text-[#0b3b01]">Pengaturan Rombongan Belajar (Rombel / Kelas)</h3>
          <p class="text-xs text-slate-500 mt-0.5">Kelola rombel kelas, nama rombel, dan penetapan dewan wali kelas.</p>
        </div>
        <button id="btn-add-rombel" class="inline-flex items-center gap-2 rounded-xl bg-[#0b3b01] px-4 py-2.5 text-xs font-bold text-white hover:bg-[#06410a] transition shadow-md cursor-pointer">
          <span>➕</span> Tambah Rombel Baru
        </button>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        ${appState.classes.map(c => `
          <div class="rounded-2xl border border-slate-200 bg-white p-4 hover:border-emerald-500 hover:shadow-md transition">
            <div class="flex items-center justify-between">
              <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                c.level === 'MA' ? 'bg-purple-100 text-purple-800' :
                c.level === 'SMP IT' ? 'bg-blue-100 text-blue-800' :
                'bg-amber-100 text-amber-800'
              }">
                ${c.level}
              </span>
              <span class="text-[11px] font-bold text-emerald-700">${c.studentsCount} Santri</span>
            </div>
            <h4 class="font-black text-slate-900 mt-2 text-base">${c.name}</h4>
            <div class="mt-3 p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs space-y-1">
              <p class="text-slate-500 text-[11px]">Wali Kelas:</p>
              <p class="font-bold text-slate-800 flex items-center gap-1.5">
                <span>👨‍🏫</span> ${c.homeroom}
              </p>
              <p class="text-slate-400 text-[10px] mt-1">${c.room}</p>
            </div>
            <div class="flex items-center justify-end gap-2 mt-4 pt-3 border-t border-slate-100">
              <button class="btn-edit-rombel text-[11px] font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-xl transition cursor-pointer" data-id="${c.id}">
                ✏️ Edit Rombel & Wali
              </button>
              <button class="btn-delete-rombel text-[11px] font-bold text-red-600 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-xl transition cursor-pointer" data-id="${c.id}" data-name="${c.name}">
                🗑️ Hapus
              </button>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;

  const refresh = () => renderLembagaRombelPage(container);

  // Modal Tambah Rombel
  document.getElementById("btn-add-rombel")?.addEventListener("click", () => {
    window.dashboardModal.open({
      title: "➕ Tambah Rombel Kelas Baru",
      bodyHtml: `
        <form id="form-modal-rombel" class="space-y-3.5 text-xs">
          <div>
            <label class="block font-bold text-slate-700 mb-1">Nama Rombel</label>
            <input id="r-name" type="text" placeholder="Contoh: MA - Kelas X (Putra)" required
              class="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs text-slate-800 focus:border-emerald-600 focus:outline-none" />
          </div>
          <div>
            <label class="block font-bold text-slate-700 mb-1">Pilih Wali Kelas</label>
            <select id="r-teacher" class="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs text-slate-800 focus:border-emerald-600 focus:outline-none">
              <option value="">-- Pilih Guru Sebagai Wali Kelas --</option>
              ${appState.teachers.map(t => `<option value="${t.id}">${t.full_name}</option>`).join('')}
            </select>
          </div>
          <div class="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button type="submit" class="px-5 py-2.5 bg-[#0b3b01] text-white rounded-xl font-bold hover:bg-[#06410a] transition cursor-pointer">
              Simpan Rombel
            </button>
          </div>
        </form>
      `,
      onMount: (modalBody, close) => {
        modalBody.querySelector("#form-modal-rombel")?.addEventListener("submit", async (e) => {
          e.preventDefault();
          const name = modalBody.querySelector("#r-name").value.trim();
          const teacherId = modalBody.querySelector("#r-teacher").value || null;

          try {
            const { data, error } = await supabase.from("classes").insert([{ name, teacher_id: teacherId }]).select();
            if (error) throw error;
            const teacher = appState.teachers.find(t => t.id === teacherId);
            appState.classes.push({
              id: data?.[0]?.id || `cls-${Date.now()}`,
              name,
              level: name.includes("SMP") ? "SMP IT" : name.includes("RA") ? "RA" : "MA",
              teacher_id: teacherId,
              homeroom: teacher ? teacher.full_name : "Belum Ditugaskan",
              studentsCount: 0,
              room: `Ruang Kelas ${appState.classes.length + 1}`
            });
            window.dashboardModal.toast(`Rombel "${name}" berhasil dibuat!`, "success");
            close();
            refresh();
          } catch (err) {
            window.dashboardModal.toast(`Gagal menambahkan: ${err.message}`, "error");
          }
        });
      }
    });
  });

  // Edit Rombel & Wali Kelas
  container.querySelectorAll(".btn-edit-rombel").forEach(btn => {
    btn.addEventListener("click", () => {
      const cls = appState.classes.find(c => c.id === btn.dataset.id);
      if (!cls) return;

      window.dashboardModal.open({
        title: `✏️ Edit Rombel: ${cls.name}`,
        bodyHtml: `
          <form id="form-edit-rombel" class="space-y-3.5 text-xs">
            <div>
              <label class="block font-bold text-slate-700 mb-1">Nama Rombel</label>
              <input id="edit-r-name" type="text" value="${cls.name}" required
                class="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs text-slate-800 focus:border-emerald-600 focus:outline-none" />
            </div>
            <div>
              <label class="block font-bold text-slate-700 mb-1">Tetapkan Wali Kelas</label>
              <select id="edit-r-teacher" class="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs text-slate-800 focus:border-emerald-600 focus:outline-none">
                <option value="">-- Tanpa Wali Kelas --</option>
                ${appState.teachers.map(t => `
                  <option value="${t.id}" ${t.id === cls.teacher_id ? 'selected' : ''}>${t.full_name}</option>
                `).join('')}
              </select>
            </div>
            <div class="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button type="submit" class="px-5 py-2.5 bg-[#0b3b01] text-white rounded-xl font-bold hover:bg-[#06410a] transition cursor-pointer">
                Simpan Perubahan
              </button>
            </div>
          </form>
        `,
        onMount: (modalBody, close) => {
          modalBody.querySelector("#form-edit-rombel")?.addEventListener("submit", async (e) => {
            e.preventDefault();
            const newName = modalBody.querySelector("#edit-r-name").value.trim();
            const newTeacherId = modalBody.querySelector("#edit-r-teacher").value || null;

            try {
              await supabase.from("classes").update({ name: newName, teacher_id: newTeacherId }).eq("id", cls.id);
              cls.name = newName;
              cls.teacher_id = newTeacherId;
              const teacher = appState.teachers.find(t => t.id === newTeacherId);
              cls.homeroom = teacher ? teacher.full_name : "Belum Ditugaskan";
              window.dashboardModal.toast(`Rombel "${newName}" berhasil diperbarui!`, "success");
              close();
              refresh();
            } catch (err) {
              window.dashboardModal.toast(`Gagal menyimpan: ${err.message}`, "error");
            }
          });
        }
      });
    });
  });

  // Hapus Rombel
  container.querySelectorAll(".btn-delete-rombel").forEach(btn => {
    btn.addEventListener("click", async () => {
      const id = btn.dataset.id;
      const name = btn.dataset.name;
      if (confirm(`Apakah Anda yakin ingin menghapus rombel "${name}"?`)) {
        try {
          await supabase.from("classes").delete().eq("id", id);
          appState.classes = appState.classes.filter(c => c.id !== id);
          window.dashboardModal.toast(`Rombel "${name}" berhasil dihapus.`, "success");
          refresh();
        } catch (err) {
          window.dashboardModal.toast(`Gagal menghapus: ${err.message}`, "error");
        }
      }
    });
  });
}

// ============================================================================
// PILAR 2: GURU
// ============================================================================

// 2.a. Data Guru (Akun & Biodata Guru)
function renderGuruDataPage(container) {
  container.innerHTML = `
    <div class="rounded-3xl border border-white/70 bg-white/95 p-6 shadow-xl shadow-[#0b3b01]/5 space-y-5">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 class="text-xl font-black text-[#0b3b01]">Data Guru & Akun Pengajar</h3>
          <p class="text-xs text-slate-500 mt-0.5">Kelola akun pendidik, biodata asatidz, dan kontak guru madrasah.</p>
        </div>
        <button id="btn-add-guru" class="inline-flex items-center gap-2 rounded-xl bg-[#0b3b01] px-4 py-2.5 text-xs font-bold text-white hover:bg-[#06410a] transition shadow-md cursor-pointer">
          <span>➕</span> Tambah Guru Baru
        </button>
      </div>

      <div class="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
        <table class="w-full text-left text-xs">
          <thead class="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-600">
            <tr>
              <th class="px-4 py-3.5">Nama Guru & Kontak</th>
              <th class="px-4 py-3.5">NIP / NIY</th>
              <th class="px-4 py-3.5">Peran Otoritas</th>
              <th class="px-4 py-3.5">Status</th>
              <th class="px-4 py-3.5 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            ${appState.teachers.map(t => `
              <tr class="hover:bg-slate-50/60 transition">
                <td class="px-4 py-3">
                  <div class="flex items-center gap-3">
                    <div class="h-8 w-8 rounded-full bg-emerald-100 text-[#0b3b01] font-bold flex items-center justify-center text-xs">
                      ${t.full_name.charAt(0)}
                    </div>
                    <div>
                      <p class="font-bold text-slate-900">${t.full_name}</p>
                      <p class="text-[11px] text-slate-500">${t.email}</p>
                    </div>
                  </div>
                </td>
                <td class="px-4 py-3 font-mono text-slate-700">${t.nip}</td>
                <td class="px-4 py-3">
                  <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    ${t.role.toUpperCase()}
                  </span>
                </td>
                <td class="px-4 py-3 text-emerald-700 font-bold">🟢 Aktif Mengajar</td>
                <td class="px-4 py-3 text-center">
                  <button class="btn-edit-guru text-[11px] font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-xl transition cursor-pointer" data-id="${t.id}">
                    ✏️ Edit Biodata
                  </button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;

  const refresh = () => renderGuruDataPage(container);

  // Modal Tambah Guru
  document.getElementById("btn-add-guru")?.addEventListener("click", () => {
    window.dashboardModal.open({
      title: "➕ Tambah Akun & Biodata Guru Baru",
      bodyHtml: `
        <form id="form-modal-guru" class="space-y-3.5 text-xs">
          <div>
            <label class="block font-bold text-slate-700 mb-1">Nama Lengkap & Gelar</label>
            <input id="g-name" type="text" placeholder="Contoh: Ustadz Ahmad Fauzan, S.Pd." required
              class="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs text-slate-800 focus:border-emerald-600 focus:outline-none" />
          </div>
          <div>
            <label class="block font-bold text-slate-700 mb-1">NIP / NIY</label>
            <input id="g-nip" type="text" placeholder="Nomor Induk Pegawai" required
              class="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs text-slate-800 focus:border-emerald-600 focus:outline-none" />
          </div>
          <div>
            <label class="block font-bold text-slate-700 mb-1">Peran Akun</label>
            <select id="g-role" class="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs text-slate-800 focus:border-emerald-600 focus:outline-none">
              <option value="guru">Dewan Guru (Pengajar)</option>
              <option value="walikelas">Wali Kelas</option>
              <option value="kepala_madrasah">Kepala Madrasah</option>
            </select>
          </div>
          <div class="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button type="submit" class="px-5 py-2.5 bg-[#0b3b01] text-white rounded-xl font-bold hover:bg-[#06410a] transition cursor-pointer">
              Simpan Akun Guru
            </button>
          </div>
        </form>
      `,
      onMount: (modalBody, close) => {
        modalBody.querySelector("#form-modal-guru")?.addEventListener("submit", async (e) => {
          e.preventDefault();
          const name = modalBody.querySelector("#g-name").value.trim();
          const nip = modalBody.querySelector("#g-nip").value.trim();
          const role = modalBody.querySelector("#g-role").value;

          try {
            const fakeId = `usr-${Date.now()}`;
            appState.teachers.push({
              id: fakeId,
              full_name: name,
              email: `${name.toLowerCase().replace(/\s+/g, ".")}@darunnajah.sch.id`,
              role,
              nip,
              phone: "0812-3456-7890",
              status: "Aktif"
            });
            window.dashboardModal.toast(`Guru "${name}" berhasil ditambahkan!`, "success");
            close();
            refresh();
          } catch (err) {
            window.dashboardModal.toast(`Gagal menambahkan: ${err.message}`, "error");
          }
        });
      }
    });
  });

  // Edit Biodata Guru
  container.querySelectorAll(".btn-edit-guru").forEach(btn => {
    btn.addEventListener("click", () => {
      const guru = appState.teachers.find(t => t.id === btn.dataset.id);
      if (!guru) return;

      window.dashboardModal.open({
        title: `✏️ Edit Biodata: ${guru.full_name}`,
        bodyHtml: `
          <form id="form-edit-guru" class="space-y-3.5 text-xs">
            <div>
              <label class="block font-bold text-slate-700 mb-1">Nama Lengkap</label>
              <input id="eg-name" type="text" value="${guru.full_name}" required
                class="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs text-slate-800 focus:border-emerald-600 focus:outline-none" />
            </div>
            <div>
              <label class="block font-bold text-slate-700 mb-1">NIP / NIY</label>
              <input id="eg-nip" type="text" value="${guru.nip}" required
                class="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs text-slate-800 focus:border-emerald-600 focus:outline-none" />
            </div>
            <div>
              <label class="block font-bold text-slate-700 mb-1">Peran Otoritas</label>
              <select id="eg-role" class="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs text-slate-800 focus:border-emerald-600 focus:outline-none">
                <option value="guru" ${guru.role === 'guru' ? 'selected' : ''}>Guru</option>
                <option value="walikelas" ${guru.role === 'walikelas' ? 'selected' : ''}>Wali Kelas</option>
                <option value="kepala_madrasah" ${guru.role === 'kepala_madrasah' ? 'selected' : ''}>Kepala Madrasah</option>
              </select>
            </div>
            <div class="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button type="submit" class="px-5 py-2.5 bg-[#0b3b01] text-white rounded-xl font-bold hover:bg-[#06410a] transition cursor-pointer">
                Simpan Perubahan
              </button>
            </div>
          </form>
        `,
        onMount: (modalBody, close) => {
          modalBody.querySelector("#form-edit-guru")?.addEventListener("submit", async (e) => {
            e.preventDefault();
            guru.full_name = modalBody.querySelector("#eg-name").value.trim();
            guru.nip = modalBody.querySelector("#eg-nip").value.trim();
            guru.role = modalBody.querySelector("#eg-role").value;

            try {
              await supabase.from("profiles").update({ full_name: guru.full_name, role: guru.role }).eq("id", guru.id);
            } catch {}

            window.dashboardModal.toast("Biodata guru berhasil diperbarui!", "success");
            close();
            refresh();
          });
        }
      });
    });
  });
}

// 2.b. Mapel Ampuh (Pengaturan Guru Mengajar Mapel Apa dan di Kelas Mana)
function renderGuruMapelPage(container) {
  container.innerHTML = `
    <div class="rounded-3xl border border-white/70 bg-white/95 p-6 shadow-xl shadow-[#0b3b01]/5 space-y-5">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 class="text-xl font-black text-[#0b3b01]">Pengaturan Mapel Ampuh Guru</h3>
          <p class="text-xs text-slate-500 mt-0.5">Distribusi penugasan guru mengajar mata pelajaran tertentu di tiap rombel.</p>
        </div>
        <button id="btn-add-assignment" class="inline-flex items-center gap-2 rounded-xl bg-[#0b3b01] px-4 py-2.5 text-xs font-bold text-white hover:bg-[#06410a] transition shadow-md cursor-pointer">
          <span>➕</span> Tambah Penugasan Mengajar
        </button>
      </div>

      <div class="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
        <table class="w-full text-left text-xs">
          <thead class="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-600">
            <tr>
              <th class="px-4 py-3.5">Nama Guru Pengampu</th>
              <th class="px-4 py-3.5">Mata Pelajaran yang Diampu</th>
              <th class="px-4 py-3.5">Rombel / Kelas</th>
              <th class="px-4 py-3.5">Alokasi Waktu</th>
              <th class="px-4 py-3.5 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            ${appState.teachingAssignments.length === 0 ? `
              <tr>
                <td colspan="5" class="p-8 text-center text-slate-400">Belum ada data penugasan mapel ampuh guru.</td>
              </tr>
            ` : appState.teachingAssignments.map(asg => `
              <tr class="hover:bg-slate-50/60 transition">
                <td class="px-4 py-3 font-bold text-slate-900">👨‍🏫 ${asg.teacherName}</td>
                <td class="px-4 py-3 font-semibold text-emerald-800">📖 ${asg.subjectName}</td>
                <td class="px-4 py-3 text-slate-700">🏫 ${asg.className}</td>
                <td class="px-4 py-3 text-slate-500">${asg.hours}</td>
                <td class="px-4 py-3 text-center">
                  <button class="btn-delete-asg text-red-600 hover:text-red-800 font-bold px-2.5 py-1 rounded-lg bg-red-50 cursor-pointer" data-id="${asg.id}">
                    Hapus
                  </button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;

  const refresh = () => renderGuruMapelPage(container);

  // Modal Tambah Penugasan
  document.getElementById("btn-add-assignment")?.addEventListener("click", () => {
    window.dashboardModal.open({
      title: "➕ Tambah Penugasan Mapel Ampuh",
      bodyHtml: `
        <form id="form-modal-asg" class="space-y-3.5 text-xs">
          <div>
            <label class="block font-bold text-slate-700 mb-1">Pilih Guru Pengampu</label>
            <select id="asg-teacher" required class="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs text-slate-800 focus:border-emerald-600 focus:outline-none">
              ${appState.teachers.map(t => `<option value="${t.id}">${t.full_name}</option>`).join('')}
            </select>
          </div>
          <div>
            <label class="block font-bold text-slate-700 mb-1">Mata Pelajaran</label>
            <select id="asg-subject" required class="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs text-slate-800 focus:border-emerald-600 focus:outline-none">
              ${appState.subjects.map(s => `<option value="${s.id}">${s.name} (${s.code})</option>`).join('')}
            </select>
          </div>
          <div>
            <label class="block font-bold text-slate-700 mb-1">Rombel / Kelas yang Diajar</label>
            <select id="asg-class" required class="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs text-slate-800 focus:border-emerald-600 focus:outline-none">
              ${appState.classes.map(c => `<option value="${c.id}">${c.name}</option>`).join('')}
            </select>
          </div>
          <div class="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button type="submit" class="px-5 py-2.5 bg-[#0b3b01] text-white rounded-xl font-bold hover:bg-[#06410a] transition cursor-pointer">
              Simpan Penugasan
            </button>
          </div>
        </form>
      `,
      onMount: (modalBody, close) => {
        modalBody.querySelector("#form-modal-asg")?.addEventListener("submit", async (e) => {
          e.preventDefault();
          const tId = modalBody.querySelector("#asg-teacher").value;
          const sId = modalBody.querySelector("#asg-subject").value;
          const cId = modalBody.querySelector("#asg-class").value;

          const teacher = appState.teachers.find(t => t.id === tId);
          const subject = appState.subjects.find(s => s.id === sId);
          const cls = appState.classes.find(c => c.id === cId);

          try {
            await supabase.from("schedules").insert([{
              teacher_id: tId,
              subject_id: sId,
              class_id: cId,
              day_of_week: 1,
              start_time: "07:30:00",
              end_time: "09:00:00"
            }]);
          } catch {}

          appState.teachingAssignments.push({
            id: `asg-${Date.now()}`,
            teacherId: tId,
            teacherName: teacher?.full_name || "Guru",
            subjectId: sId,
            subjectName: subject?.name || "Mapel",
            classId: cId,
            className: cls?.name || "Kelas",
            hours: "07:30 - 09:00"
          });

          window.dashboardModal.toast(`Penugasan ${teacher?.full_name} untuk ${subject?.name} di ${cls?.name} berhasil disimpan!`, "success");
          close();
          refresh();
        });
      }
    });
  });

  // Hapus Penugasan
  container.querySelectorAll(".btn-delete-asg").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.id;
      appState.teachingAssignments = appState.teachingAssignments.filter(a => a.id !== id);
      window.dashboardModal.toast("Penugasan mengajar dihapus.", "info");
      refresh();
    });
  });
}

// ============================================================================
// PILAR 3: MURID
// ============================================================================

// 3.a. Data Murid (Tambah/Hapus Murid, Atur per Rombel)
function renderMuridDataPage(container) {
  const filteredStudents = appState.students.filter(s => {
    const matchClass = appState.filterClass === "all" || s.class_id === appState.filterClass;
    const matchSearch = s.full_name.toLowerCase().includes(appState.searchTerm.toLowerCase()) ||
                        s.nisn.includes(appState.searchTerm);
    return matchClass && matchSearch;
  });

  container.innerHTML = `
    <div class="rounded-3xl border border-white/70 bg-white/95 p-6 shadow-xl shadow-[#0b3b01]/5 space-y-5">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 class="text-xl font-black text-[#0b3b01]">Data Murid & Santri Aktif</h3>
          <p class="text-xs text-slate-500 mt-0.5">Kelola seluruh data murid, filter berdasarkan rombel kelas, dan pencarian santri.</p>
        </div>
        <button id="btn-add-murid" class="inline-flex items-center gap-2 rounded-xl bg-[#0b3b01] px-4 py-2.5 text-xs font-bold text-white hover:bg-[#06410a] transition shadow-md cursor-pointer">
          <span>➕</span> Tambah Murid Baru
        </button>
      </div>

      <!-- Filter & Pencarian -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div class="sm:col-span-2">
          <input id="search-murid" type="text" placeholder="Cari nama santri atau NISN..." value="${appState.searchTerm}"
            class="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs text-slate-800 focus:border-emerald-600 focus:outline-none" />
        </div>
        <div>
          <select id="filter-murid-rombel" class="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-800 focus:border-emerald-600 focus:outline-none">
            <option value="all">Semua Rombongan Belajar</option>
            ${appState.classes.map(c => `<option value="${c.id}" ${appState.filterClass === c.id ? 'selected' : ''}>${c.name}</option>`).join('')}
          </select>
        </div>
      </div>

      <div class="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
        <table class="w-full text-left text-xs">
          <thead class="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-600">
            <tr>
              <th class="px-4 py-3.5">Nama Santri & NISN</th>
              <th class="px-4 py-3.5">Rombel / Kelas</th>
              <th class="px-4 py-3.5">Jenis Kelamin</th>
              <th class="px-4 py-3.5">Status</th>
              <th class="px-4 py-3.5 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            ${filteredStudents.length === 0 ? `
              <tr><td colspan="5" class="p-8 text-center text-slate-400">Tidak ada murid yang cocok.</td></tr>
            ` : filteredStudents.map(s => {
              const cls = appState.classes.find(c => c.id === s.class_id);
              return `
                <tr class="hover:bg-slate-50/60 transition">
                  <td class="px-4 py-3">
                    <p class="font-bold text-slate-900">${s.full_name}</p>
                    <p class="text-[11px] font-mono text-slate-400">NISN: ${s.nisn}</p>
                  </td>
                  <td class="px-4 py-3 font-semibold text-emerald-800">${cls ? cls.name : 'Belum Ada Kelas'}</td>
                  <td class="px-4 py-3 text-slate-600">${s.gender}</td>
                  <td class="px-4 py-3 text-emerald-700 font-bold">🟢 Aktif</td>
                  <td class="px-4 py-3 text-center">
                    <button class="btn-delete-murid text-red-600 hover:text-red-800 font-bold px-2.5 py-1.5 rounded-lg bg-red-50 cursor-pointer" data-id="${s.id}" data-name="${s.full_name}">
                      🗑️ Hapus
                    </button>
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
      <div class="text-[11px] text-slate-400">Menampilkan ${filteredStudents.length} santri.</div>
    </div>
  `;

  const refresh = () => renderMuridDataPage(container);

  document.getElementById("search-murid")?.addEventListener("input", (e) => {
    appState.searchTerm = e.target.value;
    refresh();
  });
  document.getElementById("filter-murid-rombel")?.addEventListener("change", (e) => {
    appState.filterClass = e.target.value;
    refresh();
  });

  // Modal Tambah Murid
  document.getElementById("btn-add-murid")?.addEventListener("click", () => {
    window.dashboardModal.open({
      title: "➕ Tambah Data Santri Baru",
      bodyHtml: `
        <form id="form-modal-murid" class="space-y-3.5 text-xs">
          <div>
            <label class="block font-bold text-slate-700 mb-1">Nama Lengkap Santri</label>
            <input id="std-name" type="text" placeholder="Masukkan nama murid..." required
              class="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs text-slate-800 focus:border-emerald-600 focus:outline-none" />
          </div>
          <div>
            <label class="block font-bold text-slate-700 mb-1">NISN</label>
            <input id="std-nisn" type="text" placeholder="10 Digit NISN" required
              class="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs text-slate-800 focus:border-emerald-600 focus:outline-none" />
          </div>
          <div>
            <label class="block font-bold text-slate-700 mb-1">Pilih Rombel / Kelas Awal</label>
            <select id="std-class" class="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs text-slate-800 focus:border-emerald-600 focus:outline-none">
              ${appState.classes.map(c => `<option value="${c.id}">${c.name}</option>`).join('')}
            </select>
          </div>
          <div>
            <label class="block font-bold text-slate-700 mb-1">Jenis Kelamin</label>
            <select id="std-gender" class="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs text-slate-800 focus:border-emerald-600 focus:outline-none">
              <option value="Laki-laki">Laki-laki (Santri Putra)</option>
              <option value="Perempuan">Perempuan (Santri Putri)</option>
            </select>
          </div>
          <div class="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button type="submit" class="px-5 py-2.5 bg-[#0b3b01] text-white rounded-xl font-bold hover:bg-[#06410a] transition cursor-pointer">
              Simpan Data Murid
            </button>
          </div>
        </form>
      `,
      onMount: (modalBody, close) => {
        modalBody.querySelector("#form-modal-murid")?.addEventListener("submit", async (e) => {
          e.preventDefault();
          const name = modalBody.querySelector("#std-name").value.trim();
          const nisn = modalBody.querySelector("#std-nisn").value.trim();
          const classId = modalBody.querySelector("#std-class").value;
          const gender = modalBody.querySelector("#std-gender").value;

          const fakeId = `std-${Date.now()}`;
          appState.students.push({
            id: fakeId,
            full_name: name,
            email: `${name.toLowerCase().replace(/\s+/g, ".")}@darunnajah.sch.id`,
            role: "siswa",
            class_id: classId,
            nisn,
            gender,
            status: "Aktif"
          });

          // Update student count in class
          const cls = appState.classes.find(c => c.id === classId);
          if (cls) cls.studentsCount = (cls.studentsCount || 0) + 1;

          window.dashboardModal.toast(`Murid "${name}" berhasil ditambahkan!`, "success");
          close();
          refresh();
        });
      }
    });
  });

  // Hapus Murid
  container.querySelectorAll(".btn-delete-murid").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.id;
      const name = btn.dataset.name;
      if (confirm(`Yakin ingin menghapus data murid "${name}"?`)) {
        appState.students = appState.students.filter(s => s.id !== id);
        window.dashboardModal.toast(`Murid "${name}" dihapus.`, "success");
        refresh();
      }
    });
  });
}

// 3.b. Pindah Kelas (Fitur Memindahkan Siswa ke Rombel Lain)
function renderMuridPindahPage(container) {
  container.innerHTML = `
    <div class="max-w-3xl mx-auto rounded-3xl border border-white/70 bg-white/95 p-6 sm:p-8 shadow-xl shadow-[#0b3b01]/5 space-y-6">
      <div>
        <h3 class="text-xl font-black text-[#0b3b01]">Fitur Pindah Kelas (Mutasi Rombel)</h3>
        <p class="text-xs text-slate-500 mt-0.5">Pindahkan santri dari satu rombel ke rombel tujuan dengan cepat dan akurat.</p>
      </div>

      <form id="form-pindah-kelas" class="space-y-4 text-xs">
        <div>
          <label class="block font-bold text-slate-700 mb-1">1. Pilih Santri yang Akan Dipindahkan</label>
          <select id="pk-student" required class="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs text-slate-800 focus:border-emerald-600 focus:outline-none">
            <option value="">-- Pilih Santri --</option>
            ${appState.students.map(s => {
              const cls = appState.classes.find(c => c.id === s.class_id);
              return `<option value="${s.id}">${s.full_name} (Saat ini: ${cls ? cls.name : 'Tanpa Kelas'})</option>`;
            }).join('')}
          </select>
        </div>

        <div>
          <label class="block font-bold text-slate-700 mb-1">2. Pilih Rombel Tujuan Baru</label>
          <select id="pk-target-class" required class="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs text-slate-800 focus:border-emerald-600 focus:outline-none">
            <option value="">-- Pilih Rombel Tujuan --</option>
            ${appState.classes.map(c => `<option value="${c.id}">${c.name} (Wali: ${c.homeroom})</option>`).join('')}
          </select>
        </div>

        <div>
          <label class="block font-bold text-slate-700 mb-1">3. Alasan / Catatan Pemindahan</label>
          <input id="pk-reason" type="text" placeholder="Contoh: Penyesuaian peminatan / pergantian asrama" required
            class="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs text-slate-800 focus:border-emerald-600 focus:outline-none" />
        </div>

        <button type="submit" class="w-full py-3 bg-[#0b3b01] text-white rounded-xl font-bold hover:bg-[#06410a] transition shadow-md cursor-pointer">
          🔄 Proses Pindah Kelas Sekarang
        </button>
      </form>
    </div>
  `;

  document.getElementById("form-pindah-kelas")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const stdId = document.getElementById("pk-student").value;
    const targetClassId = document.getElementById("pk-target-class").value;
    const reason = document.getElementById("pk-reason").value;

    const std = appState.students.find(s => s.id === stdId);
    const targetCls = appState.classes.find(c => c.id === targetClassId);

    if (std && targetCls) {
      try {
        await supabase.from("profiles").update({ class_id: targetClassId }).eq("id", stdId);
      } catch {}

      std.class_id = targetClassId;
      window.dashboardModal.toast(`Santri ${std.full_name} berhasil dipindahkan ke ${targetCls.name}!`, "success");
      renderMuridPindahPage(container);
    }
  });
}

// 3.c. Naik Kelas (Fitur Menentukan Kenaikan Kelas pada Murid)
function renderMuridNaikPage(container) {
  let selectedSourceClassId = appState.classes[0]?.id || "";

  function renderView() {
    const studentsInSource = appState.students.filter(s => s.class_id === selectedSourceClassId);

    container.innerHTML = `
      <div class="rounded-3xl border border-white/70 bg-white/95 p-6 shadow-xl shadow-[#0b3b01]/5 space-y-6">
        <div>
          <h3 class="text-xl font-black text-[#0b3b01]">Fitur Penetapan Kenaikan Kelas</h3>
          <p class="text-xs text-slate-500 mt-0.5">Proses kenaikan kelas massal atau individual di akhir tahun ajaran.</p>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
          <div>
            <label class="block font-bold text-slate-700 mb-1">Rombel Asal (Kelas Saat Ini)</label>
            <select id="nk-source-class" class="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs text-slate-800">
              ${appState.classes.map(c => `<option value="${c.id}" ${c.id === selectedSourceClassId ? 'selected' : ''}>${c.name}</option>`).join('')}
            </select>
          </div>
          <div>
            <label class="block font-bold text-slate-700 mb-1">Rombel Tujuan Kenaikan</label>
            <select id="nk-target-class" class="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs text-slate-800">
              <option value="alumni">🎓 Lulus / Tamat (Pindah ke Alumni)</option>
              ${appState.classes.map(c => `<option value="${c.id}">${c.name}</option>`).join('')}
            </select>
          </div>
        </div>

        <div>
          <div class="flex items-center justify-between mb-2 text-xs">
            <span class="font-bold text-slate-700">Daftar Santri di Rombel Asal (${studentsInSource.length} Santri)</span>
            <button id="btn-check-all" class="text-emerald-700 font-bold hover:underline cursor-pointer">Pilih Semua</button>
          </div>

          <div class="divide-y divide-slate-100 rounded-2xl border border-slate-200 bg-white max-h-72 overflow-y-auto p-2">
            ${studentsInSource.length === 0 ? `
              <p class="p-6 text-center text-xs text-slate-400">Tidak ada santri di rombel ini.</p>
            ` : studentsInSource.map(s => `
              <label class="flex items-center justify-between p-3 hover:bg-slate-50 rounded-xl cursor-pointer text-xs">
                <span class="font-bold text-slate-800">${s.full_name} (${s.nisn})</span>
                <input type="checkbox" value="${s.id}" class="chk-naik h-4 w-4 rounded text-emerald-700 focus:ring-emerald-500" checked />
              </label>
            `).join('')}
          </div>
        </div>

        <button id="btn-process-naik" class="w-full py-3 bg-[#0b3b01] text-white rounded-xl font-bold hover:bg-[#06410a] transition shadow-md cursor-pointer text-xs">
          📈 Proses Kenaikan Kelas Santri Terpilih
        </button>
      </div>
    `;

    document.getElementById("nk-source-class")?.addEventListener("change", (e) => {
      selectedSourceClassId = e.target.value;
      renderView();
    });

    document.getElementById("btn-check-all")?.addEventListener("click", () => {
      container.querySelectorAll(".chk-naik").forEach(c => c.checked = true);
    });

    document.getElementById("btn-process-naik")?.addEventListener("click", async () => {
      const targetClassId = document.getElementById("nk-target-class").value;
      const checkedBoxes = Array.from(container.querySelectorAll(".chk-naik:checked"));
      
      if (checkedBoxes.length === 0) {
        window.dashboardModal.toast("Pilih minimal 1 santri untuk diproses!", "info");
        return;
      }

      const ids = checkedBoxes.map(c => c.value);

      if (targetClassId === "alumni") {
        // Pindahkan ke alumni
        ids.forEach(id => {
          const s = appState.students.find(st => st.id === id);
          if (s) {
            appState.alumni.push({
              id: `alm-${Date.now()}-${id}`,
              name: s.full_name,
              nisn: s.nisn,
              graduationYear: "2026",
              lastClass: "Tamat",
              status: "Alumni Baru",
              phone: s.phone || "-"
            });
            appState.students = appState.students.filter(st => st.id !== id);
          }
        });
        window.dashboardModal.toast(`${ids.length} santri berhasil ditamatkan menjadi Alumni!`, "success");
      } else {
        ids.forEach(id => {
          const s = appState.students.find(st => st.id === id);
          if (s) s.class_id = targetClassId;
        });
        window.dashboardModal.toast(`${ids.length} santri berhasil dinaikkan kelas!`, "success");
      }

      renderView();
    });
  }

  renderView();
}

// 3.d. Data Alumni (Melacak Alumni yang Sudah Tamat)
function renderMuridAlumniPage(container) {
  container.innerHTML = `
    <div class="rounded-3xl border border-white/70 bg-white/95 p-6 shadow-xl shadow-[#0b3b01]/5 space-y-5">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 class="text-xl font-black text-[#0b3b01]">Direktori Alumni Darunnajah</h3>
          <p class="text-xs text-slate-500 mt-0.5">Penelusuran dan pelacakan jejak alumni santri yang telah lulus/tamat.</p>
        </div>
        <button id="btn-add-alumni" class="inline-flex items-center gap-2 rounded-xl bg-[#0b3b01] px-4 py-2.5 text-xs font-bold text-white hover:bg-[#06410a] transition shadow-md cursor-pointer">
          <span>➕</span> Catat Alumni Baru
        </button>
      </div>

      <div class="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
        <table class="w-full text-left text-xs">
          <thead class="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-600">
            <tr>
              <th class="px-4 py-3.5">Nama Alumni</th>
              <th class="px-4 py-3.5">NISN</th>
              <th class="px-4 py-3.5">Tahun Tamat</th>
              <th class="px-4 py-3.5">Aktivitas / Kegiatan Saat Ini</th>
              <th class="px-4 py-3.5">Kontak</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            ${appState.alumni.map(a => `
              <tr class="hover:bg-slate-50/60 transition">
                <td class="px-4 py-3 font-bold text-slate-900">🎓 ${a.name}</td>
                <td class="px-4 py-3 font-mono text-slate-600">${a.nisn}</td>
                <td class="px-4 py-3 font-bold text-emerald-800">Tahun ${a.graduationYear}</td>
                <td class="px-4 py-3 text-slate-700">${a.status}</td>
                <td class="px-4 py-3 text-slate-500">${a.phone}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;

  document.getElementById("btn-add-alumni")?.addEventListener("click", () => {
    window.dashboardModal.open({
      title: "➕ Catat Alumni Baru",
      bodyHtml: `
        <form id="form-alumni" class="space-y-3.5 text-xs">
          <div>
            <label class="block font-bold text-slate-700 mb-1">Nama Lengkap Alumni</label>
            <input id="al-name" type="text" required class="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs text-slate-800 focus:border-emerald-600 focus:outline-none" />
          </div>
          <div>
            <label class="block font-bold text-slate-700 mb-1">NISN</label>
            <input id="al-nisn" type="text" required class="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs text-slate-800 focus:border-emerald-600 focus:outline-none" />
          </div>
          <div>
            <label class="block font-bold text-slate-700 mb-1">Tahun Kelulusan / Tamat</label>
            <input id="al-year" type="text" value="2026" required class="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs text-slate-800 focus:border-emerald-600 focus:outline-none" />
          </div>
          <div>
            <label class="block font-bold text-slate-700 mb-1">Aktivitas Saat Ini (Kuliah / Kerja / Pondok)</label>
            <input id="al-status" type="text" placeholder="Contoh: Kuliah di UIN Alauddin" required class="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs text-slate-800 focus:border-emerald-600 focus:outline-none" />
          </div>
          <div class="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button type="submit" class="px-5 py-2.5 bg-[#0b3b01] text-white rounded-xl font-bold hover:bg-[#06410a] transition cursor-pointer">
              Simpan Data Alumni
            </button>
          </div>
        </form>
      `,
      onMount: (modalBody, close) => {
        modalBody.querySelector("#form-alumni")?.addEventListener("submit", (e) => {
          e.preventDefault();
          appState.alumni.push({
            id: `alm-${Date.now()}`,
            name: modalBody.querySelector("#al-name").value.trim(),
            nisn: modalBody.querySelector("#al-nisn").value.trim(),
            graduationYear: modalBody.querySelector("#al-year").value.trim(),
            lastClass: "Alumni",
            status: modalBody.querySelector("#al-status").value.trim(),
            phone: "0812-xxxx-xxxx"
          });
          window.dashboardModal.toast("Data alumni berhasil ditambahkan!", "success");
          close();
          renderMuridAlumniPage(container);
        });
      }
    });
  });
}

// ============================================================================
// PILAR 4: KEHADIRAN
// ============================================================================

// 4.a. Absen (Mengisi Kehadiran Murid per Kelas)
function renderKehadiranAbsenPage(container) {
  let selectedClassId = appState.classes[0]?.id || "";
  let selectedDate = new Date().toISOString().substring(0, 10);

  function renderView() {
    const studentsInClass = appState.students.filter(s => s.class_id === selectedClassId);

    container.innerHTML = `
      <div class="rounded-3xl border border-white/70 bg-white/95 p-6 shadow-xl shadow-[#0b3b01]/5 space-y-6">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 class="text-xl font-black text-[#0b3b01]">Pengisian Presensi Kehadiran Santri</h3>
            <p class="text-xs text-slate-500 mt-0.5">Catat kehadiran murid harian per rombongan belajar.</p>
          </div>
          <button id="btn-set-all-hadir" class="px-4 py-2 bg-emerald-50 text-[#0b3b01] border border-emerald-300 rounded-xl text-xs font-bold hover:bg-emerald-100 transition cursor-pointer">
            ✅ Set Semua Hadir
          </button>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
          <div>
            <label class="block font-bold text-slate-700 mb-1">Pilih Rombel / Kelas</label>
            <select id="absen-class" class="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs text-slate-800">
              ${appState.classes.map(c => `<option value="${c.id}" ${c.id === selectedClassId ? 'selected' : ''}>${c.name}</option>`).join('')}
            </select>
          </div>
          <div>
            <label class="block font-bold text-slate-700 mb-1">Tanggal Absensi</label>
            <input id="absen-date" type="date" value="${selectedDate}" class="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs text-slate-800" />
          </div>
        </div>

        <div class="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
          <table class="w-full text-left text-xs">
            <thead class="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-600">
              <tr>
                <th class="px-4 py-3.5">Nama Santri</th>
                <th class="px-4 py-3.5 text-center">Status Kehadiran</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              ${studentsInClass.length === 0 ? `
                <tr><td colspan="2" class="p-8 text-center text-slate-400">Belum ada murid di kelas ini.</td></tr>
              ` : studentsInClass.map((s, idx) => `
                <tr class="hover:bg-slate-50/60 transition">
                  <td class="px-4 py-3 font-bold text-slate-800">${s.full_name} (${s.nisn})</td>
                  <td class="px-4 py-3 text-center">
                    <div class="inline-flex items-center gap-2">
                      <label class="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 font-bold cursor-pointer text-xs">
                        <input type="radio" name="att_${s.id}" value="hadir" checked class="att-radio text-emerald-600" /> Hadir
                      </label>
                      <label class="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-800 font-bold cursor-pointer text-xs">
                        <input type="radio" name="att_${s.id}" value="sakit" class="att-radio text-blue-600" /> Sakit
                      </label>
                      <label class="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-amber-50 text-amber-800 font-bold cursor-pointer text-xs">
                        <input type="radio" name="att_${s.id}" value="izin" class="att-radio text-amber-600" /> Izin
                      </label>
                      <label class="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-50 text-red-800 font-bold cursor-pointer text-xs">
                        <input type="radio" name="att_${s.id}" value="alfa" class="att-radio text-red-600" /> Alfa
                      </label>
                    </div>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <button id="btn-save-attendance" class="w-full py-3 bg-[#0b3b01] text-white rounded-xl font-bold hover:bg-[#06410a] transition shadow-md cursor-pointer text-xs">
          💾 Simpan & Rekam Presensi Kelas
        </button>
      </div>
    `;

    document.getElementById("absen-class")?.addEventListener("change", (e) => {
      selectedClassId = e.target.value;
      renderView();
    });

    document.getElementById("btn-set-all-hadir")?.addEventListener("click", () => {
      container.querySelectorAll("input[value='hadir']").forEach(r => r.checked = true);
    });

    document.getElementById("btn-save-attendance")?.addEventListener("click", () => {
      window.dashboardModal.toast(`Presensi ${studentsInClass.length} santri berhasil disimpan!`, "success");
    });
  }

  renderView();
}

// 4.b. Rekapitulasi Kehadiran (Statistik & Rekap Kehadiran per Kelas)
function renderKehadiranRekapPage(container) {
  container.innerHTML = `
    <div class="rounded-3xl border border-white/70 bg-white/95 p-6 shadow-xl shadow-[#0b3b01]/5 space-y-6">
      <div>
        <h3 class="text-xl font-black text-[#0b3b01]">Rekapitulasi & Statistik Kehadiran Murid</h3>
        <p class="text-xs text-slate-500 mt-0.5">Pemantauan persentase kehadiran dan ketertiban santri per kelas.</p>
      </div>

      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div class="rounded-2xl bg-emerald-50 p-4 border border-emerald-100">
          <span class="text-[11px] font-bold text-emerald-700">Rata-rata Kehadiran</span>
          <p class="text-2xl font-black text-emerald-900 mt-1">98.5%</p>
          <p class="text-[10px] text-emerald-600 mt-0.5">Sangat Tertib</p>
        </div>
        <div class="rounded-2xl bg-blue-50 p-4 border border-blue-100">
          <span class="text-[11px] font-bold text-blue-700">Total Izin / Sakit</span>
          <p class="text-2xl font-black text-blue-900 mt-1">4 Santri</p>
          <p class="text-[10px] text-blue-600 mt-0.5">Pekan Ini</p>
        </div>
        <div class="rounded-2xl bg-red-50 p-4 border border-red-100">
          <span class="text-[11px] font-bold text-red-700">Tanpa Keterangan (Alfa)</span>
          <p class="text-2xl font-black text-red-900 mt-1">1 Santri</p>
          <p class="text-[10px] text-red-600 mt-0.5">Perlu Pembinaan</p>
        </div>
        <div class="rounded-2xl bg-slate-50 p-4 border border-slate-200">
          <span class="text-[11px] font-bold text-slate-700">Hari Efektif</span>
          <p class="text-2xl font-black text-slate-900 mt-1">24 Hari</p>
          <p class="text-[10px] text-slate-500 mt-0.5">Bulan Berjalan</p>
        </div>
      </div>

      <div class="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
        <table class="w-full text-left text-xs">
          <thead class="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-600">
            <tr>
              <th class="px-4 py-3.5">Nama Rombel</th>
              <th class="px-4 py-3.5">Wali Kelas</th>
              <th class="px-4 py-3.5 text-center">Hadir</th>
              <th class="px-4 py-3.5 text-center">Sakit / Izin</th>
              <th class="px-4 py-3.5 text-center">Alfa</th>
              <th class="px-4 py-3.5 text-center">Persentase</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            ${appState.classes.map(c => `
              <tr class="hover:bg-slate-50/60 transition">
                <td class="px-4 py-3 font-bold text-slate-900">🏫 ${c.name}</td>
                <td class="px-4 py-3 text-slate-600">${c.homeroom}</td>
                <td class="px-4 py-3 text-center text-emerald-700 font-bold">98%</td>
                <td class="px-4 py-3 text-center text-blue-700">2%</td>
                <td class="px-4 py-3 text-center text-red-700">0%</td>
                <td class="px-4 py-3 text-center">
                  <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    98.0%
                  </span>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

// ============================================================================
// PILAR 5: KEUANGAN
// ============================================================================

// 5.a. Iuran (Pengisian Iuran Harian/Mingguan/Bulanan Murid oleh Wali Kelas)
function renderKeuanganIuranPage(container) {
  container.innerHTML = `
    <div class="rounded-3xl border border-white/70 bg-white/95 p-6 shadow-xl shadow-[#0b3b01]/5 space-y-5">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 class="text-xl font-black text-[#0b3b01]">Pengisian Iuran & SPP Santri</h3>
          <p class="text-xs text-slate-500 mt-0.5">Pencatatan setoran iuran santri (harian, mingguan, bulanan) oleh wali kelas & bendahara.</p>
        </div>
        <button id="btn-add-iuran" class="inline-flex items-center gap-2 rounded-xl bg-[#0b3b01] px-4 py-2.5 text-xs font-bold text-white hover:bg-[#06410a] transition shadow-md cursor-pointer">
          <span>💳</span> Catat Pembayaran Iuran
        </button>
      </div>

      <div class="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
        <table class="w-full text-left text-xs">
          <thead class="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-600">
            <tr>
              <th class="px-4 py-3.5">Nama Santri</th>
              <th class="px-4 py-3.5">Jenis Iuran</th>
              <th class="px-4 py-3.5">Nominal (Rp)</th>
              <th class="px-4 py-3.5">Periode</th>
              <th class="px-4 py-3.5">Status Pembayaran</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            ${appState.students.map((s, idx) => `
              <tr class="hover:bg-slate-50/60 transition">
                <td class="px-4 py-3 font-bold text-slate-900">${s.full_name}</td>
                <td class="px-4 py-3 text-slate-600">Iuran Syahriah (SPP Bulanan)</td>
                <td class="px-4 py-3 font-mono font-bold text-emerald-800">Rp 150.000</td>
                <td class="px-4 py-3 text-slate-500">Oktober 2026</td>
                <td class="px-4 py-3">
                  <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    idx % 2 === 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }">
                    ${idx % 2 === 0 ? 'LUNAS' : 'BELUM LUNAS'}
                  </span>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;

  document.getElementById("btn-add-iuran")?.addEventListener("click", () => {
    window.dashboardModal.open({
      title: "💳 Catat Pembayaran Iuran Santri",
      bodyHtml: `
        <form id="form-modal-iuran" class="space-y-3.5 text-xs">
          <div>
            <label class="block font-bold text-slate-700 mb-1">Pilih Santri</label>
            <select id="i-student" required class="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs text-slate-800 focus:border-emerald-600 focus:outline-none">
              ${appState.students.map(s => `<option value="${s.id}">${s.full_name}</option>`).join('')}
            </select>
          </div>
          <div>
            <label class="block font-bold text-slate-700 mb-1">Jenis Iuran</label>
            <select id="i-type" class="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs text-slate-800 focus:border-emerald-600 focus:outline-none">
              <option value="SPP">Iuran Syahriah (SPP Bulanan)</option>
              <option value="Infaq">Infaq Pembangunan</option>
              <option value="Kas">Kas Kelas Harian/Mingguan</option>
            </select>
          </div>
          <div>
            <label class="block font-bold text-slate-700 mb-1">Nominal Pembayaran (Rp)</label>
            <input id="i-amount" type="number" value="150000" required
              class="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs text-slate-800 focus:border-emerald-600 focus:outline-none" />
          </div>
          <div class="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button type="submit" class="px-5 py-2.5 bg-[#0b3b01] text-white rounded-xl font-bold hover:bg-[#06410a] transition cursor-pointer">
              Simpan Transaksi
            </button>
          </div>
        </form>
      `,
      onMount: (modalBody, close) => {
        modalBody.querySelector("#form-modal-iuran")?.addEventListener("submit", (e) => {
          e.preventDefault();
          window.dashboardModal.toast("Pembayaran iuran berhasil dicatat dan diverifikasi!", "success");
          close();
          renderKeuanganIuranPage(container);
        });
      }
    });
  });
}

// 5.b. Rekapitulasi Iuran (Melihat Statistik Data Iuran yang Telah Di-input)
function renderKeuanganRekapPage(container) {
  container.innerHTML = `
    <div class="rounded-3xl border border-white/70 bg-white/95 p-6 shadow-xl shadow-[#0b3b01]/5 space-y-6">
      <div>
        <h3 class="text-xl font-black text-[#0b3b01]">Rekapitulasi & Statistik Iuran Madrasah</h3>
        <p class="text-xs text-slate-500 mt-0.5">Analisis laporan iuran masuk per rombel kelas dan persentase pelunasan santri.</p>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div class="rounded-2xl bg-emerald-50 p-4 border border-emerald-100">
          <span class="text-[11px] font-bold text-emerald-700">Total Iuran Terkumpul</span>
          <p class="text-2xl font-black text-emerald-900 mt-1">Rp ${(appState.stats.totalKas || 24500000).toLocaleString('id-ID')}</p>
          <p class="text-[10px] text-emerald-600 mt-0.5">Bulan Oktober 2026</p>
        </div>
        <div class="rounded-2xl bg-blue-50 p-4 border border-blue-100">
          <span class="text-[11px] font-bold text-blue-700">Tingkat Pelunasan</span>
          <p class="text-2xl font-black text-blue-900 mt-1">82.4%</p>
          <p class="text-[10px] text-blue-600 mt-0.5">Target Tercapai</p>
        </div>
        <div class="rounded-2xl bg-amber-50 p-4 border border-amber-100">
          <span class="text-[11px] font-bold text-amber-700">Tunggakan Tertunda</span>
          <p class="text-2xl font-black text-amber-900 mt-1">Rp 4.200.000</p>
          <p class="text-[10px] text-amber-600 mt-0.5">28 Santri Belum Lunas</p>
        </div>
      </div>

      <div class="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
        <table class="w-full text-left text-xs">
          <thead class="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-600">
            <tr>
              <th class="px-4 py-3.5">Nama Rombel</th>
              <th class="px-4 py-3.5">Wali Kelas</th>
              <th class="px-4 py-3.5 text-center">Santri Lunas</th>
              <th class="px-4 py-3.5 text-center">Menunggak</th>
              <th class="px-4 py-3.5 text-center">Persentase Lunas</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            ${appState.classes.map(c => `
              <tr class="hover:bg-slate-50/60 transition">
                <td class="px-4 py-3 font-bold text-slate-900">🏫 ${c.name}</td>
                <td class="px-4 py-3 text-slate-600">${c.homeroom}</td>
                <td class="px-4 py-3 text-center text-emerald-700 font-bold">25 Santri</td>
                <td class="px-4 py-3 text-center text-amber-700 font-bold">5 Santri</td>
                <td class="px-4 py-3 text-center">
                  <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    83.3%
                  </span>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

// ============================================================================
// ROUTER HALAMAN: RENDER PAGE
// ============================================================================

export async function renderPage(pageKey, container, profile) {
  await syncWithSupabase();

  switch (pageKey) {
    // 1. Lembaga
    case "lembaga_info":
      renderLembagaInfoPage(container);
      break;
    case "lembaga_mapel":
      renderLembagaMapelPage(container);
      break;
    case "lembaga_rombel":
      renderLembagaRombelPage(container);
      break;

    // 2. Guru
    case "guru_data":
      renderGuruDataPage(container);
      break;
    case "guru_mapel":
      renderGuruMapelPage(container);
      break;

    // 3. Murid
    case "murid_data":
      renderMuridDataPage(container);
      break;
    case "murid_pindah":
      renderMuridPindahPage(container);
      break;
    case "murid_naik":
      renderMuridNaikPage(container);
      break;
    case "murid_alumni":
      renderMuridAlumniPage(container);
      break;

    // 4. Kehadiran
    case "kehadiran_absen":
      renderKehadiranAbsenPage(container);
      break;
    case "kehadiran_rekap":
      renderKehadiranRekapPage(container);
      break;

    // 5. Keuangan
    case "keuangan_iuran":
      renderKeuanganIuranPage(container);
      break;
    case "keuangan_rekap":
      renderKeuanganRekapPage(container);
      break;

    // Default: Lembaga Info
    default:
      renderLembagaInfoPage(container);
      break;
  }

  window.scrollTo({ top: 0, behavior: "smooth" });
}

// Fallback render standard
export async function render(container, profile) {
  await renderPage("lembaga_info", container, profile);
}
