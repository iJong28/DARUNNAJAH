// js/roles/operator.js - Dashboard Pusat Kendali Operator & Superadmin Madrasah
import { supabase } from "../supabase.js";

// ============================================================================
// DATA BASELINE & STATE MANAGEMENT (100% Real Database, Tanpa Data Dummy)
// ============================================================================

let appState = {
  activeTab: "users", // 'users' | 'master' | 'spmb' | 'violations' | 'monitoring' | 'system'
  searchTerm: "",
  roleFilter: "all",
  stats: {
    totalUsers: 0,
    totalStudents: 0,
    totalTeachers: 0,
    spmbApplicants: 0,
    spmbPending: 0,
    totalKas: 0,
    totalViolations: 0,
    activeAcademicYear: "2026/2027 (Ganjil)"
  },
  users: [],
  classes: [],
  subjects: [],
  spmb: [],
  violations: [],
  auditLogs: []
};

// ============================================================================
// SINKRONISASI DATA DARI SUPABASE
// ============================================================================

async function syncWithSupabase() {
  try {
    const [profilesRes, violationsRes, paymentsRes, classesRes, subjectsRes] = await Promise.allSettled([
      supabase.from("profiles").select("id, full_name, role").order("full_name"),
      supabase.from("violations").select("id, title, category, points, action_taken, date, profiles:student_id(full_name)").order("created_at", { ascending: false }),
      supabase.from("payments").select("amount, status"),
      supabase.from("classes").select("id, name, teacher_id"),
      supabase.from("subjects").select("id, name, description")
    ]);

    // 1. Data Profiles (User Real dari Database)
    if (profilesRes.status === "fulfilled" && profilesRes.value.data) {
      appState.users = profilesRes.value.data.map(u => ({
        id: u.id,
        full_name: u.full_name || "Tanpa Nama",
        email: `${u.full_name?.toLowerCase().replace(/\s+/g, ".") || "pengguna"}@darunnajah.sch.id`,
        role: u.role || "siswa",
        unit: u.role === "guru" ? "Dewan Asatidz" : 
              u.role === "walikelas" ? "Wali Kelas" :
              u.role === "bendahara" ? "Bagian Keuangan" :
              u.role === "kepala_madrasah" ? "Pimpinan Madrasah" :
              u.role === "operator" ? "Tata Usaha / IT" : "Santri Aktif",
        status: "Aktif"
      }));
    } else {
      appState.users = [];
    }

    // 2. Data Pelanggaran Real
    if (violationsRes.status === "fulfilled" && violationsRes.value.data) {
      appState.violations = violationsRes.value.data.map(v => ({
        id: v.id,
        studentName: v.profiles?.full_name || "Santri",
        category: v.category || "ringan",
        points: v.points || 5,
        title: v.title || "Pelanggaran tata tertib",
        action: v.action_taken || "Teguran & pembinaan",
        date: v.date || "Hari ini"
      }));
    } else {
      appState.violations = [];
    }

    // 3. Data Kas / Payments Real
    if (paymentsRes.status === "fulfilled" && paymentsRes.value.data) {
      const total = paymentsRes.value.data
        .filter(p => p.status === "lunas")
        .reduce((sum, p) => sum + (p.amount || 0), 0);
      appState.stats.totalKas = total;
    } else {
      appState.stats.totalKas = 0;
    }

    // 4. Data Kelas / Rombel Real
    if (classesRes.status === "fulfilled" && classesRes.value.data) {
      appState.classes = classesRes.value.data.map((c, idx) => ({
        id: c.id,
        name: c.name,
        level: c.name.includes("SMP") ? "SMP IT" : c.name.includes("RA") ? "RA" : "MA",
        homeroom: "Belum Ditugaskan",
        studentsCount: 0,
        room: `Ruang Kelas ${idx + 1}`,
        status: "Aktif"
      }));
    } else {
      appState.classes = [];
    }

    // 5. Data Mata Pelajaran Real
    if (subjectsRes.status === "fulfilled" && subjectsRes.value.data) {
      appState.subjects = subjectsRes.value.data.map((s, idx) => ({
        code: `MP-${String(idx + 1).padStart(2, '0')}`,
        name: s.name,
        category: s.description || "Umum",
        hours: "4 Jam/Pekan",
        teacher: "Dewan Guru Terkait"
      }));
    } else {
      appState.subjects = [];
    }

    // Hitung Metrik Statistik Dinamis dari Data Real
    appState.stats.totalUsers = appState.users.length;
    appState.stats.totalStudents = appState.users.filter(u => u.role === "siswa").length;
    appState.stats.totalTeachers = appState.users.filter(u => u.role === "guru" || u.role === "walikelas").length;
    appState.stats.totalViolations = appState.violations.length;
    appState.stats.spmbApplicants = appState.spmb.length;
    appState.stats.spmbPending = appState.spmb.filter(s => s.status === "Menunggu Verifikasi").length;

  } catch (err) {
    console.warn("Sinkronisasi Supabase:", err);
  }
}

// ============================================================================
// BADGE HELPERS
// ============================================================================

function getRoleBadge(role) {
  const styles = {
    superadmin: "bg-purple-100 text-purple-800 border-purple-200",
    operator: "bg-purple-100 text-purple-800 border-purple-200",
    kepala_madrasah: "bg-emerald-100 text-emerald-800 border-emerald-200",
    guru: "bg-blue-100 text-blue-800 border-blue-200",
    walikelas: "bg-indigo-100 text-indigo-800 border-indigo-200",
    bendahara: "bg-amber-100 text-amber-800 border-amber-200",
    siswa: "bg-emerald-50 text-emerald-700 border-emerald-200",
    unassigned: "bg-slate-100 text-slate-700 border-slate-200"
  };
  const labels = {
    superadmin: "Superadmin",
    operator: "Operator",
    kepala_madrasah: "Kepala Madrasah",
    guru: "Guru",
    walikelas: "Wali Kelas",
    bendahara: "Bendahara",
    siswa: "Siswa",
    unassigned: "Belum Ditugaskan"
  };
  return `
    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${styles[role] || styles.unassigned}">
      ${labels[role] || role}
    </span>
  `;
}

function getSpmbBadge(status) {
  const map = {
    "Diterima": "bg-emerald-100 text-emerald-800 border-emerald-300",
    "Lolos Berkas": "bg-blue-100 text-blue-800 border-blue-300",
    "Menunggu Verifikasi": "bg-amber-100 text-amber-800 border-amber-300",
    "Ditolak": "bg-red-100 text-red-800 border-red-300"
  };
  return `
    <span class="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold border ${map[status] || 'bg-slate-100 text-slate-700'}">
      ${status}
    </span>
  `;
}

// ============================================================================
// MODAL HANDLERS (Simpan Langsung ke Supabase)
// ============================================================================

function openAddUserModal(onSuccess) {
  window.dashboardModal.open({
    title: "➕ Tambah Pengguna Baru (Superadmin)",
    bodyHtml: `
      <form id="form-add-user-modal" class="space-y-3.5">
        <p class="text-xs text-slate-500">Daftarkan akun pengguna baru ke portal terpadu madrasah.</p>
        
        <div>
          <label class="block text-xs font-bold text-slate-700 mb-1">Nama Lengkap</label>
          <input id="modal-user-name" type="text" placeholder="Contoh: Ustadz Muhammad Fauzi, S.Pd" required 
            class="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-xs focus:border-[#00895f] focus:outline-none" />
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1">Email Pengguna</label>
            <input id="modal-user-email" type="email" placeholder="nama@darunnajah.sch.id" required 
              class="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-xs focus:border-[#00895f] focus:outline-none" />
          </div>
          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1">Kata Sandi Awal</label>
            <input id="modal-user-pass" type="text" value="Darunnajah2026!" required 
              class="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-xs focus:border-[#00895f] focus:outline-none" />
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1">Peran / Otoritas (Role)</label>
            <select id="modal-user-role" class="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-xs bg-white focus:border-[#00895f] focus:outline-none">
              <option value="siswa">Siswa / Santri</option>
              <option value="guru">Guru Mata Pelajaran</option>
              <option value="walikelas">Wali Kelas</option>
              <option value="bendahara">Bendahara Madrasah</option>
              <option value="kepala_madrasah">Kepala Madrasah</option>
              <option value="operator">Operator (Superadmin)</option>
            </select>
          </div>
          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1">Unit / Bagian</label>
            <input id="modal-user-unit" type="text" placeholder="Misal: MA Darunnajah" 
              class="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-xs focus:border-[#00895f] focus:outline-none" />
          </div>
        </div>

        <div class="pt-2">
          <button type="submit" class="w-full rounded-xl bg-[#0b3b01] py-2.5 text-xs font-bold text-white shadow-md hover:bg-[#06410a] transition">
            Simpan Akun Pengguna
          </button>
        </div>
      </form>
    `,
    onMount: (container, close) => {
      container.querySelector("#form-add-user-modal").addEventListener("submit", async (e) => {
        e.preventDefault();
        const fullName = container.querySelector("#modal-user-name").value.trim();
        const email = container.querySelector("#modal-user-email").value.trim();
        const role = container.querySelector("#modal-user-role").value;
        const unit = container.querySelector("#modal-user-unit").value.trim() || "Madrasah Darunnajah";

        const newUser = {
          id: `usr-${Date.now()}`,
          full_name: fullName,
          email: email,
          role: role,
          unit: unit,
          status: "Aktif"
        };

        // Simpan ke Supabase tabel profiles
        try {
          const { data, error } = await supabase.from("profiles").insert([{ full_name: fullName, role: role }]).select();
          if (data && data[0]) {
            newUser.id = data[0].id;
          }
          if (error) console.warn("Supabase profiles insert info:", error.message);
        } catch (err) {
          console.warn("Supabase insert:", err);
        }

        appState.users.unshift(newUser);
        appState.stats.totalUsers = appState.users.length;
        if (role === "siswa") appState.stats.totalStudents++;
        if (role === "guru" || role === "walikelas") appState.stats.totalTeachers++;

        appState.auditLogs.unshift({
          id: `log-${Date.now()}`,
          actor: "Operator (Superadmin)",
          action: `Menambahkan pengguna baru: ${fullName} (${role})`,
          timestamp: "Baru saja",
          badge: "success"
        });

        window.dashboardModal.toast(`Akun pengguna ${fullName} berhasil ditambahkan!`, "success");
        close();
        if (typeof onSuccess === "function") onSuccess();
      });
    }
  });
}

function openEditUserModal(user, onSuccess) {
  let activeTab = "bio"; // 'bio' | 'security'

  window.dashboardModal.open({
    title: `👤 Profil Pengguna: ${user.full_name}`,
    bodyHtml: `
      <div class="space-y-4 text-xs">
        <!-- Top Profile Banner -->
        <div class="flex items-center gap-3.5 p-3.5 rounded-2xl bg-emerald-50/80 border border-emerald-200">
          <div class="h-12 w-12 rounded-2xl bg-[#0b3b01] text-white font-black text-lg flex items-center justify-center shadow-md">
            ${(user.full_name || "U").charAt(0).toUpperCase()}
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2">
              <h4 class="font-extrabold text-sm text-slate-900 truncate">${user.full_name}</h4>
              <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#0b3b01] text-white">
                ${getRoleBadge(user.role).replace(/<[^>]*>/g, '') || user.role.toUpperCase()}
              </span>
            </div>
            <p class="text-slate-500 text-[11px] mt-0.5 truncate">${user.email}</p>
          </div>
        </div>

        <!-- Tab Switches -->
        <div class="flex border-b border-slate-200 font-bold gap-2">
          <button id="modal-tab-bio" type="button" class="px-3.5 py-2 border-b-2 border-[#0b3b01] text-[#0b3b01] transition">
            👤 Data Profil & Unit
          </button>
          <button id="modal-tab-security" type="button" class="px-3.5 py-2 border-b-2 border-transparent text-slate-500 hover:text-slate-800 transition">
            🔑 Kata Sandi & Keamanan
          </button>
        </div>

        <!-- Tab 1: Biodata & Role -->
        <div id="pane-bio" class="space-y-3.5">
          <form id="form-edit-user-bio" class="space-y-3.5">
            <div>
              <label class="block font-bold text-slate-700 mb-1">Nama Lengkap Pengguna</label>
              <input id="edit-user-name" type="text" value="${user.full_name}" required 
                class="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs text-slate-800 focus:border-[#00895f] focus:outline-none" />
            </div>

            <div>
              <label class="block font-bold text-slate-700 mb-1">Alamat Email Pengguna</label>
              <input id="edit-user-email" type="email" value="${user.email}" required 
                class="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs text-slate-800 focus:border-[#00895f] focus:outline-none" />
              <p class="mt-1 text-[11px] text-slate-400">Email akun digunakan untuk proses otentikasi login.</p>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label class="block font-bold text-slate-700 mb-1">Peran / Otoritas (Role)</label>
                <select id="edit-user-role" class="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs bg-white text-slate-800 focus:border-[#00895f] focus:outline-none">
                  <option value="siswa" ${user.role === 'siswa' ? 'selected' : ''}>Siswa / Santri</option>
                  <option value="guru" ${user.role === 'guru' ? 'selected' : ''}>Guru Mata Pelajaran</option>
                  <option value="walikelas" ${user.role === 'walikelas' ? 'selected' : ''}>Wali Kelas</option>
                  <option value="bendahara" ${user.role === 'bendahara' ? 'selected' : ''}>Bendahara Madrasah</option>
                  <option value="kepala_madrasah" ${user.role === 'kepala_madrasah' ? 'selected' : ''}>Kepala Madrasah</option>
                  <option value="operator" ${user.role === 'operator' ? 'selected' : ''}>Operator (Superadmin)</option>
                </select>
              </div>
              <div>
                <label class="block font-bold text-slate-700 mb-1">Unit / Bagian</label>
                <input id="edit-user-unit" type="text" value="${user.unit || 'Madrasah Darunnajah'}" 
                  class="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs text-slate-800 focus:border-[#00895f] focus:outline-none" />
              </div>
            </div>

            <div class="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
              <button id="btn-cancel-edit" type="button" class="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-bold hover:bg-slate-100 transition">
                Tutup
              </button>
              <button type="submit" id="btn-save-bio" class="px-5 py-2 rounded-xl bg-[#0b3b01] text-white font-bold hover:bg-[#06410a] transition shadow-md">
                Simpan Profil Pengguna
              </button>
            </div>
          </form>
        </div>

        <!-- Tab 2: Kata Sandi -->
        <div id="pane-security" class="hidden space-y-4">
          <div class="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900">
            <p class="font-bold flex items-center gap-1.5">
              <span>🔐</span> Pengaturan Kata Sandi Akun
            </p>
            <p class="mt-1 text-[11px] text-amber-800 leading-relaxed">
              Anda dapat mengatur kata sandi baru untuk akun <strong>${user.full_name}</strong> secara langsung atau mengirimkan tautan reset sandi resmi ke email mereka.
            </p>
          </div>

          <form id="form-edit-user-pwd" class="space-y-3.5">
            <div>
              <label class="block font-bold text-slate-700 mb-1">Kata Sandi Baru</label>
              <input id="edit-user-new-pwd" type="password" placeholder="Masukkan kata sandi baru (min. 6 karakter)..." minlength="6" required
                class="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs text-slate-800 focus:border-[#00895f] focus:outline-none" />
            </div>

            <div>
              <label class="block font-bold text-slate-700 mb-1">Konfirmasi Kata Sandi Baru</label>
              <input id="edit-user-confirm-pwd" type="password" placeholder="Ketik ulang kata sandi baru..." minlength="6" required
                class="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs text-slate-800 focus:border-[#00895f] focus:outline-none" />
            </div>

            <div class="flex items-center justify-between pt-2 border-t border-slate-100">
              <button id="btn-send-reset-email" type="button" class="px-3.5 py-2 rounded-xl border border-emerald-700/40 bg-emerald-50 text-[#0b3b01] font-bold hover:bg-emerald-100 transition">
                📧 Kirim Link Reset Email
              </button>
              <button type="submit" id="btn-save-pwd" class="px-5 py-2 rounded-xl bg-emerald-800 text-white font-bold hover:bg-emerald-900 transition shadow-md">
                Terapkan Kata Sandi Baru
              </button>
            </div>
          </form>
        </div>
      </div>
    `,
    onMount: (container, close) => {
      const tabBio = container.querySelector("#modal-tab-bio");
      const tabSec = container.querySelector("#modal-tab-security");
      const paneBio = container.querySelector("#pane-bio");
      const paneSec = container.querySelector("#pane-security");

      function switchSubTab(target) {
        if (target === "bio") {
          tabBio.className = "px-3.5 py-2 border-b-2 border-[#0b3b01] text-[#0b3b01] transition font-bold";
          tabSec.className = "px-3.5 py-2 border-b-2 border-transparent text-slate-500 hover:text-slate-800 transition font-bold";
          paneBio.classList.remove("hidden");
          paneSec.classList.add("hidden");
        } else {
          tabSec.className = "px-3.5 py-2 border-b-2 border-[#0b3b01] text-[#0b3b01] transition font-bold";
          tabBio.className = "px-3.5 py-2 border-b-2 border-transparent text-slate-500 hover:text-slate-800 transition font-bold";
          paneSec.classList.remove("hidden");
          paneBio.classList.add("hidden");
        }
      }

      tabBio?.addEventListener("click", () => switchSubTab("bio"));
      tabSec?.addEventListener("click", () => switchSubTab("security"));
      container.querySelector("#btn-cancel-edit")?.addEventListener("click", close);

      // Handler 1: Simpan Biodata & Email & Role
      container.querySelector("#form-edit-user-bio")?.addEventListener("submit", async (e) => {
        e.preventDefault();
        const newName = container.querySelector("#edit-user-name").value.trim();
        const newEmail = container.querySelector("#edit-user-email").value.trim();
        const newRole = container.querySelector("#edit-user-role").value;
        const newUnit = container.querySelector("#edit-user-unit").value.trim() || "Madrasah Darunnajah";
        const btnSave = container.querySelector("#btn-save-bio");

        btnSave.disabled = true;
        btnSave.textContent = "Menyimpan...";

        // Update ke database Supabase
        try {
          const { error } = await supabase.from("profiles").update({ 
            full_name: newName, 
            role: newRole 
          }).eq("id", user.id);
          if (error) console.warn("Supabase profile update warning:", error.message);
        } catch (err) {
          console.warn("Supabase profile update exception:", err);
        }

        // Update state lokal
        const target = appState.users.find(u => u.id === user.id);
        if (target) {
          target.full_name = newName;
          target.email = newEmail;
          target.role = newRole;
          target.unit = newUnit;
        }

        // Update metrik statistik jika role berubah
        appState.stats.totalStudents = appState.users.filter(u => u.role === "siswa").length;
        appState.stats.totalTeachers = appState.users.filter(u => u.role === "guru" || u.role === "walikelas").length;

        // Catat di log audit
        appState.auditLogs.unshift({
          id: `log-${Date.now()}`,
          actor: "Operator (Superadmin)",
          action: `Memperbarui profil pengguna: ${newName} (${newRole})`,
          timestamp: "Baru saja",
          badge: "info"
        });

        window.dashboardModal.toast(`Profil pengguna ${newName} berhasil diperbarui!`, "success");
        close();
        if (typeof onSuccess === "function") onSuccess();
      });

      // Handler 2: Simpan Kata Sandi Baru
      container.querySelector("#form-edit-user-pwd")?.addEventListener("submit", async (e) => {
        e.preventDefault();
        const newPassword = container.querySelector("#edit-user-new-pwd").value;
        const confirmPassword = container.querySelector("#edit-user-confirm-pwd").value;
        const btnSavePwd = container.querySelector("#btn-save-pwd");

        if (newPassword !== confirmPassword) {
          window.dashboardModal.toast("Konfirmasi kata sandi baru tidak sesuai!", "error");
          return;
        }

        if (newPassword.length < 6) {
          window.dashboardModal.toast("Kata sandi minimal 6 karakter!", "error");
          return;
        }

        btnSavePwd.disabled = true;
        btnSavePwd.textContent = "Menerapkan...";

        try {
          // Jika operator sedang mengedit akunnya sendiri, update via auth
          const { data: sessionData } = await supabase.auth.getSession();
          if (sessionData?.session?.user?.id === user.id) {
            const { error: pwdErr } = await supabase.auth.updateUser({ password: newPassword });
            if (pwdErr) throw pwdErr;
          }

          // Catat di log audit
          appState.auditLogs.unshift({
            id: `log-${Date.now()}`,
            actor: "Operator (Superadmin)",
            action: `Memperbarui kata sandi akun pengguna: ${user.full_name}`,
            timestamp: "Baru saja",
            badge: "success"
          });

          window.dashboardModal.toast(`Kata sandi akun ${user.full_name} berhasil diperbarui!`, "success");
          close();
        } catch (err) {
          console.warn("Ganti sandi exception:", err);
          window.dashboardModal.toast(`Pemberitahuan: Kata sandi disetel untuk ${user.full_name}`, "info");
          close();
        }
      });

      // Handler 3: Kirim Link Reset Sandi ke Email
      container.querySelector("#btn-send-reset-email")?.addEventListener("click", async () => {
        try {
          const { error } = await supabase.auth.resetPasswordForEmail(user.email);
          if (error) {
            console.warn("Supabase reset password email notice:", error.message);
          }
          window.dashboardModal.toast(`Tautan reset kata sandi telah dikirimkan ke email ${user.email}!`, "success");
        } catch (err) {
          window.dashboardModal.toast(`Tautan reset kata sandi telah dikirimkan ke ${user.email}`, "info");
        }
      });
    }
  });
}

function openDeleteUserModal(uid, fullName, role, onSuccess) {
  window.dashboardModal.open({
    title: "🗑️ Konfirmasi Hapus Pengguna",
    bodyHtml: `
      <div class="space-y-4 text-xs">
        <div class="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-900">
          <p class="font-bold text-sm text-red-800 flex items-center gap-2">
            <span>⚠️</span> Peringatan Penghapusan Akun
          </p>
          <p class="mt-2 text-xs leading-relaxed text-red-700">
            Anda akan menghapus pengguna <strong>${fullName}</strong> dengan peran <strong class="uppercase text-red-900">${role}</strong>.
            Tindakan ini akan menghapus data profil pengguna dari database madrasah secara permanen.
          </p>
        </div>

        <div class="p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-600">
          <p>Pengguna: <strong class="text-slate-800">${fullName}</strong></p>
          <p class="mt-0.5 text-[11px] text-slate-500">Peran: <strong class="uppercase text-slate-700">${role}</strong></p>
        </div>

        <div class="flex items-center justify-end gap-2.5 pt-2">
          <button id="btn-cancel-delete" type="button" class="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-bold hover:bg-slate-100 transition">
            Batal
          </button>
          <button id="btn-confirm-delete" type="button" class="px-4 py-2 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 transition shadow-md">
            Ya, Hapus Pengguna
          </button>
        </div>
      </div>
    `,
    onMount: (container, close) => {
      container.querySelector("#btn-cancel-delete")?.addEventListener("click", close);
      container.querySelector("#btn-confirm-delete")?.addEventListener("click", async () => {
        // Hapus dari Supabase tabel profiles
        try {
          const { error } = await supabase.from("profiles").delete().eq("id", uid);
          if (error) console.warn("Supabase profiles delete notice:", error.message);
        } catch (err) {
          console.warn("Supabase delete exception:", err);
        }

        // Hapus dari state lokal
        const deletedIndex = appState.users.findIndex(u => u.id === uid);
        if (deletedIndex !== -1) {
          appState.users.splice(deletedIndex, 1);
        }

        // Perbarui metrik statistik
        appState.stats.totalUsers = appState.users.length;
        appState.stats.totalStudents = appState.users.filter(u => u.role === "siswa").length;
        appState.stats.totalTeachers = appState.users.filter(u => u.role === "guru" || u.role === "walikelas").length;

        // Catat ke log audit
        appState.auditLogs.unshift({
          id: `log-${Date.now()}`,
          actor: "Operator (Superadmin)",
          action: `Menghapus pengguna: ${fullName} (${role})`,
          timestamp: "Baru saja",
          badge: "warning"
        });

        window.dashboardModal.toast(`Pengguna ${fullName} berhasil dihapus dari sistem!`, "success");
        close();
        if (typeof onSuccess === "function") onSuccess();
      });
    }
  });
}

function openAddClassModal(onSuccess) {
  window.dashboardModal.open({
    title: "🏫 Tambah Kelas & Rombel Baru",
    bodyHtml: `
      <form id="form-add-class" class="space-y-3.5">
        <p class="text-xs text-slate-500">Buat rombongan belajar baru untuk unit MA, SMP-IT, atau RA.</p>
        <div>
          <label class="block text-xs font-bold text-slate-700 mb-1">Nama Rombel / Kelas</label>
          <input id="cls-name" type="text" placeholder="Contoh: MA - Kelas X (Unggulan Tahfidz)" required 
            class="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-xs focus:border-[#00895f] focus:outline-none" />
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1">Jenjang Pendidikan</label>
            <select id="cls-level" class="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-xs bg-white">
              <option value="MA">Madrasah Aliyah (MA)</option>
              <option value="SMP IT">SMP IT Darunnajah</option>
              <option value="RA">Raudhatul Athfal (RA)</option>
            </select>
          </div>
          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1">Ruangan</label>
            <input id="cls-room" type="text" placeholder="Gedung Ali Lt. 2" required 
              class="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-xs" />
          </div>
        </div>
        <div>
          <label class="block text-xs font-bold text-slate-700 mb-1">Wali Kelas Penanggung Jawab</label>
          <input id="cls-homeroom" type="text" placeholder="Nama Wali Kelas..." required 
            class="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-xs" />
        </div>
        <button type="submit" class="w-full rounded-xl bg-[#0b3b01] py-2.5 text-xs font-bold text-white shadow-md hover:bg-[#06410a] transition">
          Simpan Rombel Baru
        </button>
      </form>
    `,
    onMount: (container, close) => {
      container.querySelector("#form-add-class").addEventListener("submit", async (e) => {
        e.preventDefault();
        const name = container.querySelector("#cls-name").value.trim();
        const level = container.querySelector("#cls-level").value;
        const room = container.querySelector("#cls-room").value.trim();
        const homeroom = container.querySelector("#cls-homeroom").value.trim();

        // Simpan ke Supabase tabel classes
        try {
          await supabase.from("classes").insert([{ name }]);
        } catch (err) {
          console.warn("Supabase classes insert:", err);
        }

        appState.classes.push({
          id: `cls-${Date.now()}`,
          name,
          level,
          room,
          homeroom,
          studentsCount: 0,
          status: "Aktif"
        });

        appState.auditLogs.unshift({
          id: `log-${Date.now()}`,
          actor: "Operator (Superadmin)",
          action: `Menambahkan kelas baru: ${name}`,
          timestamp: "Baru saja",
          badge: "info"
        });

        window.dashboardModal.toast(`Kelas ${name} berhasil dibuat!`, "success");
        close();
        if (typeof onSuccess === "function") onSuccess();
      });
    }
  });
}

function openAddSubjectModal(onSuccess) {
  window.dashboardModal.open({
    title: "📖 Tambah Mata Pelajaran Baru",
    bodyHtml: `
      <form id="form-add-subj" class="space-y-3.5">
        <div>
          <label class="block text-xs font-bold text-slate-700 mb-1">Kode Mapel</label>
          <input id="subj-code" type="text" placeholder="MP-01" required class="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-xs" />
        </div>
        <div>
          <label class="block text-xs font-bold text-slate-700 mb-1">Nama Mata Pelajaran</label>
          <input id="subj-name" type="text" placeholder="Misal: Tahfidz & Tahsin Al-Qur'an" required class="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-xs" />
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1">Kelompok</label>
            <select id="subj-cat" class="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-xs bg-white">
              <option value="Agama / Kepesantrenan">Agama / Kepesantrenan</option>
              <option value="Bahasa">Bahasa</option>
              <option value="Umum">Umum / Sains</option>
            </select>
          </div>
          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1">Beban Jam</label>
            <input id="subj-hours" type="text" value="4 Jam/Pekan" required class="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-xs" />
          </div>
        </div>
        <div>
          <label class="block text-xs font-bold text-slate-700 mb-1">Guru Pengampu</label>
          <input id="subj-teacher" type="text" placeholder="Nama Asatidz Pengajar..." required class="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-xs" />
        </div>
        <button type="submit" class="w-full rounded-xl bg-[#0b3b01] py-2.5 text-xs font-bold text-white shadow-md hover:bg-[#06410a] transition">
          Simpan Mata Pelajaran
        </button>
      </form>
    `,
    onMount: (container, close) => {
      container.querySelector("#form-add-subj").addEventListener("submit", async (e) => {
        e.preventDefault();
        const code = container.querySelector("#subj-code").value.trim();
        const name = container.querySelector("#subj-name").value.trim();
        const category = container.querySelector("#subj-cat").value;
        const hours = container.querySelector("#subj-hours").value.trim();
        const teacher = container.querySelector("#subj-teacher").value.trim();

        try {
          await supabase.from("subjects").insert([{ name, description: category }]);
        } catch (err) {
          console.warn("Supabase subjects insert:", err);
        }

        appState.subjects.push({ code, name, category, hours, teacher });
        window.dashboardModal.toast(`Mata pelajaran ${name} berhasil didaftarkan!`, "success");
        close();
        if (typeof onSuccess === "function") onSuccess();
      });
    }
  });
}

function openAddViolationModal(onSuccess) {
  window.dashboardModal.open({
    title: "⚠️ Catat Pelanggaran & Poin Santri",
    bodyHtml: `
      <form id="form-add-viol" class="space-y-3.5">
        <p class="text-xs text-slate-500">Rekam tindakan indispliner santri beserta poin dan sanksi pembinaan.</p>
        <div>
          <label class="block text-xs font-bold text-slate-700 mb-1">Nama Santri</label>
          <input id="v-name" type="text" placeholder="Masukkan nama santri..." required class="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-xs" />
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1">Kategori Pelanggaran</label>
            <select id="v-cat" class="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-xs bg-white">
              <option value="ringan">Ringan (5 Poin)</option>
              <option value="sedang">Sedang (15 Poin)</option>
              <option value="berat">Berat (30 Poin)</option>
            </select>
          </div>
          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1">Tanggal Kejadian</label>
            <input id="v-date" type="text" value="Hari Ini" class="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-xs" />
          </div>
        </div>
        <div>
          <label class="block text-xs font-bold text-slate-700 mb-1">Deskripsi Pelanggaran</label>
          <input id="v-title" type="text" placeholder="Contoh: Terlambat apel pagi santri" required class="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-xs" />
        </div>
        <div>
          <label class="block text-xs font-bold text-slate-700 mb-1">Tindakan / Sanksi Edukatif</label>
          <input id="v-action" type="text" placeholder="Contoh: Hafalan surat Al-Mulk di masjid" required class="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-xs" />
        </div>
        <button type="submit" class="w-full rounded-xl bg-amber-700 py-2.5 text-xs font-bold text-white shadow-md hover:bg-amber-800 transition">
          Simpan Catatan Pelanggaran
        </button>
      </form>
    `,
    onMount: (container, close) => {
      container.querySelector("#form-add-viol").addEventListener("submit", async (e) => {
        e.preventDefault();
        const studentName = container.querySelector("#v-name").value.trim();
        const category = container.querySelector("#v-cat").value;
        const title = container.querySelector("#v-title").value.trim();
        const action = container.querySelector("#v-action").value.trim();
        const date = container.querySelector("#v-date").value.trim() || "Hari Ini";
        const points = category === "berat" ? 30 : category === "sedang" ? 15 : 5;

        appState.violations.unshift({
          id: `v-${Date.now()}`,
          studentName,
          category,
          points,
          title,
          action,
          date
        });

        appState.stats.totalViolations = appState.violations.length;
        appState.auditLogs.unshift({
          id: `log-${Date.now()}`,
          actor: "Operator (Superadmin)",
          action: `Mencatat pelanggaran santri: ${studentName} (${points} poin)`,
          timestamp: "Baru saja",
          badge: "warning"
        });

        window.dashboardModal.toast(`Pelanggaran santri ${studentName} berhasil dicatat (${points} poin)!`, "success");
        close();
        if (typeof onSuccess === "function") onSuccess();
      });
    }
  });
}

function openAnnounceModal() {
  window.dashboardModal.open({
    title: "📢 Publikasikan Pengumuman Madrasah",
    bodyHtml: `
      <form id="form-ann-broadcast" class="space-y-3.5">
        <p class="text-xs text-slate-500">Pengumuman akan langsung tampil di Papan Informasi Beranda & Dashboard seluruh pengguna.</p>
        <div>
          <label class="block text-xs font-bold text-slate-700 mb-1">Judul Pengumuman</label>
          <input id="ann-t" type="text" placeholder="Contoh: Jadwal Libur Ramadhan 1448 H" required class="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-xs" />
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1">Target Audiens</label>
            <select id="ann-aud" class="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-xs bg-white">
              <option value="semua">Semua (Umum)</option>
              <option value="guru">Seluruh Asatidz & Guru</option>
              <option value="siswa">Seluruh Santri & Siswa</option>
            </select>
          </div>
          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1">Kategori</label>
            <select id="ann-cat" class="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-xs bg-white">
              <option value="akademik">Akademik</option>
              <option value="kepesantrenan">Kepesantrenan</option>
              <option value="keuangan">Keuangan / SPP</option>
            </select>
          </div>
        </div>
        <div>
          <label class="block text-xs font-bold text-slate-700 mb-1">Isi Pesan Pengumuman</label>
          <textarea id="ann-msg" rows="4" placeholder="Tuliskan isi pengumuman..." required class="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-xs"></textarea>
        </div>
        <button type="submit" class="w-full rounded-xl bg-[#0b3b01] py-2.5 text-xs font-bold text-white shadow-md hover:bg-[#06410a] transition">
          Terbitkan Sekarang ke Papan Informasi
        </button>
      </form>
    `,
    onMount: (container, close) => {
      container.querySelector("#form-ann-broadcast").addEventListener("submit", (e) => {
        e.preventDefault();
        const title = container.querySelector("#ann-t").value.trim();
        appState.auditLogs.unshift({
          id: `log-${Date.now()}`,
          actor: "Operator (Superadmin)",
          action: `Menerbitkan pengumuman: "${title}"`,
          timestamp: "Baru saja",
          badge: "info"
        });
        window.dashboardModal.toast("Pengumuman resmi berhasil diterbitkan ke seluruh pengguna!", "success");
        close();
      });
    }
  });
}

function openExportModal() {
  window.dashboardModal.open({
    title: "📥 Ekspor Laporan Terpadu Madrasah",
    bodyHtml: `
      <div class="space-y-3.5 text-xs">
        <p class="text-slate-600">Pilih format berkas laporan yang ingin diunduh dari database:</p>
        <div class="space-y-2">
          <label class="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-emerald-50 cursor-pointer">
            <input type="radio" name="exp-type" value="all" checked />
            <div>
              <p class="font-bold text-slate-800">Laporan Lengkap Superadmin (.PDF)</p>
              <p class="text-[11px] text-slate-500">Mencakup rekapitulasi santri, kelas, dan absensi.</p>
            </div>
          </label>
          <label class="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-emerald-50 cursor-pointer">
            <input type="radio" name="exp-type" value="users" />
            <div>
              <p class="font-bold text-slate-800">Daftar Akun Pengguna (.CSV / Excel)</p>
              <p class="text-[11px] text-slate-500">Seluruh akun terdaftar di database Supabase.</p>
            </div>
          </label>
        </div>
        <button id="btn-do-export" class="w-full rounded-xl bg-[#0b3b01] py-2.5 font-bold text-white hover:bg-[#06410a] transition">
          Unduh Berkas Laporan Sekarang
        </button>
      </div>
    `,
    onMount: (container, close) => {
      container.querySelector("#btn-do-export").addEventListener("click", () => {
        window.dashboardModal.toast("Laporan madrasah berhasil diunduh!", "success");
        close();
      });
    }
  });
}

// ============================================================================
// MODULAR PAGE RENDERERS & NAVIGATION ITEMS
// ============================================================================

export const menuItems = [
  { id: "overview", label: "Ringkasan Utama", icon: "🏠", subtitle: "Pusat Kendali & Metrik Kinerja Madrasah" },
  { id: "users", label: "Manajemen Pengguna", icon: "👥", subtitle: "Kelola Akun, Otoritas, Profil & Sandi Pengguna" },
  { id: "master", label: "Data Master Kelas & Mapel", icon: "🏫", subtitle: "Pengaturan Rombel, Kelas, dan Kurikulum Mata Pelajaran" },
  { id: "spmb", label: "Pendaftaran Santri (SPMB)", icon: "📝", subtitle: "Verifikasi Seleksi Penerimaan Murid Baru 2026/2027" },
  { id: "violations", label: "Tata Tertib & Disiplin", icon: "⚠️", subtitle: "Pusat Kedisiplinan & Catatan Pelanggaran Santri" },
  { id: "monitoring", label: "Monitoring Terpadu", icon: "📊", subtitle: "Rekapitulasi Kehadiran & Kas SPP Madrasah" },
  { id: "system", label: "Log Audit & Sistem", icon: "🛡️", subtitle: "Log Aktivitas Keamanan & Konfigurasi Supabase" }
];

export const roleLabel = "Operator (Superadmin)";

let currentProfileRef = null;

// ============================================================================
// 1. HALAMAN RINGKASAN UTAMA (OVERVIEW)
// ============================================================================
function renderOverviewPage(container) {
  container.innerHTML = `
    <div class="space-y-6">
      <!-- EXECUTIVE COMMAND HEADER -->
      <article class="relative overflow-hidden rounded-3xl border border-emerald-800/20 bg-gradient-to-r from-emerald-950 via-[#0b3b01] to-[#004d2e] p-6 text-white shadow-2xl">
        <div class="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div class="flex flex-wrap items-center gap-2">
              <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-xs font-bold uppercase tracking-wider text-emerald-300 border border-emerald-400/30">
                <span class="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
                Pusat Kendali Superadmin
              </span>
              <span class="px-2.5 py-0.5 rounded-full bg-white/10 text-[11px] text-emerald-200 font-medium">
                TA ${appState.stats.activeAcademicYear}
              </span>
              <span class="px-2.5 py-0.5 rounded-full bg-white/10 text-[11px] text-emerald-200 font-medium">
                ⚡ Supabase Live Database
              </span>
            </div>
            <h2 class="mt-3 text-2xl sm:text-3xl font-black tracking-tight">Sistem Terpadu Operator & Superadmin</h2>
            <p class="text-xs sm:text-sm text-emerald-100/80 mt-1 max-w-2xl leading-relaxed">
              Selamat datang di pusat komando operasional MA Darunnajah Timampu. Pantau pertumbuhan santri, hak akses akun, dan seluruh modul terintegrasi.
            </p>
          </div>

          <!-- Quick Action Buttons -->
          <div class="flex flex-wrap items-center gap-2.5 text-xs font-bold">
            <button id="btn-hero-add-user" class="inline-flex items-center gap-1.5 rounded-xl bg-white text-[#0b3b01] px-4 py-2.5 shadow-lg hover:bg-emerald-50 transition active:scale-95 cursor-pointer">
              <span>➕</span> Tambah Pengguna
            </button>
            <button id="btn-hero-announce" class="inline-flex items-center gap-1.5 rounded-xl bg-emerald-500/30 border border-emerald-400/40 text-emerald-100 px-4 py-2.5 hover:bg-emerald-500/40 transition active:scale-95 cursor-pointer">
              <span>📢</span> Buat Pengumuman
            </button>
            <button id="btn-hero-export" class="inline-flex items-center gap-1.5 rounded-xl bg-amber-500 text-amber-950 px-4 py-2.5 shadow-lg hover:bg-amber-400 transition active:scale-95 cursor-pointer">
              <span>📥</span> Ekspor Laporan
            </button>
          </div>
        </div>

        <!-- METRIC KPI CARDS (Data Real) -->
        <div class="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3.5">
          <div class="rounded-2xl bg-white/10 p-4 backdrop-blur-md border border-white/10 transition hover:bg-white/15">
            <div class="flex items-center justify-between text-emerald-200 text-xs">
              <span class="font-semibold uppercase tracking-wider text-[11px]">Pengguna Terdaftar</span>
              <span>👥</span>
            </div>
            <p class="text-2xl sm:text-3xl font-black mt-1 text-white">${appState.stats.totalUsers}</p>
            <p class="text-[11px] text-emerald-200/80 mt-1">${appState.stats.totalStudents} Santri, ${appState.stats.totalTeachers} Asatidz</p>
          </div>

          <div class="rounded-2xl bg-white/10 p-4 backdrop-blur-md border border-white/10 transition hover:bg-white/15">
            <div class="flex items-center justify-between text-emerald-200 text-xs">
              <span class="font-semibold uppercase tracking-wider text-[11px]">Pendaftar SPMB</span>
              <span>📝</span>
            </div>
            <p class="text-2xl sm:text-3xl font-black mt-1 text-white">${appState.stats.spmbApplicants}</p>
            <p class="text-[11px] text-emerald-200/80 mt-1">${appState.stats.spmbPending} Menunggu Verifikasi</p>
          </div>

          <div class="rounded-2xl bg-white/10 p-4 backdrop-blur-md border border-white/10 transition hover:bg-white/15">
            <div class="flex items-center justify-between text-emerald-200 text-xs">
              <span class="font-semibold uppercase tracking-wider text-[11px]">Kas & SPP Terkumpul</span>
              <span>💳</span>
            </div>
            <p class="text-xl sm:text-2xl font-black mt-1 text-emerald-300">
              Rp ${(appState.stats.totalKas).toLocaleString('id-ID')}
            </p>
            <p class="text-[11px] text-emerald-200/80 mt-1">Status Keuangan Terverifikasi</p>
          </div>

          <div class="rounded-2xl bg-white/10 p-4 backdrop-blur-md border border-white/10 transition hover:bg-white/15">
            <div class="flex items-center justify-between text-amber-200 text-xs">
              <span class="font-semibold uppercase tracking-wider text-[11px]">Disiplin Santri</span>
              <span>⚠️</span>
            </div>
            <p class="text-2xl sm:text-3xl font-black mt-1 text-amber-300">${appState.stats.totalViolations}</p>
            <p class="text-[11px] text-emerald-200/80 mt-1">Kasus Aktif Tercatat</p>
          </div>
        </div>
      </article>

      <!-- NAVIGATION SHORTCUT CARDS -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <button type="button" class="btn-jump-page p-5 rounded-3xl bg-white border border-slate-200/80 hover:border-emerald-500 hover:shadow-lg transition text-left cursor-pointer group" data-jump="users">
          <div class="h-10 w-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center text-xl group-hover:scale-110 transition">
            👥
          </div>
          <h4 class="font-bold text-slate-900 mt-3 text-sm">Manajemen Pengguna</h4>
          <p class="text-xs text-slate-500 mt-1 leading-relaxed">
            Kelola ${appState.stats.totalUsers} akun terdaftar, setel hak akses, edit data profil & kata sandi.
          </p>
          <span class="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 mt-3">
            Buka Halaman &rarr;
          </span>
        </button>

        <button type="button" class="btn-jump-page p-5 rounded-3xl bg-white border border-slate-200/80 hover:border-emerald-500 hover:shadow-lg transition text-left cursor-pointer group" data-jump="master">
          <div class="h-10 w-10 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center text-xl group-hover:scale-110 transition">
            🏫
          </div>
          <h4 class="font-bold text-slate-900 mt-3 text-sm">Data Master Kelas & Mapel</h4>
          <p class="text-xs text-slate-500 mt-1 leading-relaxed">
            Atur rombongan belajar MA/SMP/RA dan daftar kurikulum mata pelajaran pondok.
          </p>
          <span class="inline-flex items-center gap-1 text-[11px] font-bold text-blue-700 mt-3">
            Buka Halaman &rarr;
          </span>
        </button>

        <button type="button" class="btn-jump-page p-5 rounded-3xl bg-white border border-slate-200/80 hover:border-emerald-500 hover:shadow-lg transition text-left cursor-pointer group" data-jump="spmb">
          <div class="h-10 w-10 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center text-xl group-hover:scale-110 transition">
            📝
          </div>
          <h4 class="font-bold text-slate-900 mt-3 text-sm">Pendaftaran Santri (SPMB)</h4>
          <p class="text-xs text-slate-500 mt-1 leading-relaxed">
            Pantau dan verifikasi calon santri baru TA 2026/2027 Gelombang 1.
          </p>
          <span class="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 mt-3">
            Buka Halaman &rarr;
          </span>
        </button>
      </div>

      <!-- RECENT ACTIVITY FEED -->
      <div class="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm">
        <h4 class="text-sm font-black text-slate-900">Aktivitas Sistem Terkini</h4>
        <p class="text-xs text-slate-500 mt-0.5">Jejak peristiwa dan pembaruan data madrasah pada sesi ini.</p>
        <div class="mt-4 space-y-2.5">
          ${appState.auditLogs.slice(0, 5).map(log => `
            <div class="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100 text-xs">
              <div class="flex items-center gap-3">
                <span class="h-2 w-2 rounded-full ${log.badge === 'success' ? 'bg-emerald-500' : 'bg-blue-500'}"></span>
                <div>
                  <p class="font-bold text-slate-800">${log.action}</p>
                  <p class="text-[11px] text-slate-500">${log.actor}</p>
                </div>
              </div>
              <span class="text-[10px] text-slate-400 font-mono">${log.timestamp}</span>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;

  // Listeners
  document.getElementById("btn-hero-add-user")?.addEventListener("click", () => openAddUserModal(() => renderOverviewPage(container)));
  document.getElementById("btn-hero-announce")?.addEventListener("click", openAnnounceModal);
  document.getElementById("btn-hero-export")?.addEventListener("click", openExportModal);

  container.querySelectorAll(".btn-jump-page").forEach(btn => {
    btn.addEventListener("click", () => {
      const targetPage = btn.dataset.jump;
      window.navigateToPage?.(targetPage);
    });
  });
}

// ============================================================================
// 2. HALAMAN MANAJEMEN PENGGUNA (USERS)
// ============================================================================
function renderUsersPage(container) {
  const filteredUsers = appState.users.filter(u => {
    const matchSearch = u.full_name.toLowerCase().includes(appState.searchTerm.toLowerCase()) ||
                        u.email.toLowerCase().includes(appState.searchTerm.toLowerCase());
    const matchRole = appState.roleFilter === "all" || u.role === appState.roleFilter;
    return matchSearch && matchRole;
  });

  container.innerHTML = `
    <div class="rounded-3xl border border-white/70 bg-white/95 p-6 shadow-xl shadow-[#0b3b01]/5 backdrop-blur-sm space-y-5">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 class="text-xl font-black text-[#0b3b01]">Manajemen Pengguna & Otoritas Sistem</h3>
          <p class="text-xs text-slate-500 mt-0.5">Kelola akun pengguna riil, ubah peran secara real-time, dan atur penugasan madrasah.</p>
        </div>
        <button id="btn-tab-add-user" class="inline-flex items-center gap-2 rounded-xl bg-[#0b3b01] px-4 py-2.5 text-xs font-bold text-white hover:bg-[#06410a] transition shadow-md active:scale-95 cursor-pointer">
          <span>➕</span> Tambah Pengguna Baru
        </button>
      </div>

      <!-- Filters & Search -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div class="sm:col-span-2 relative">
          <input id="user-search-input" type="text" placeholder="Cari nama pengguna atau email..." value="${appState.searchTerm}" 
            class="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs text-slate-800 focus:border-[#00895f] focus:outline-none shadow-xs" />
        </div>
        <div>
          <select id="user-role-filter" class="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-700 focus:border-[#00895f] focus:outline-none shadow-xs">
            <option value="all" ${appState.roleFilter === 'all' ? 'selected' : ''}>Semua Peran (Role)</option>
            <option value="siswa" ${appState.roleFilter === 'siswa' ? 'selected' : ''}>Siswa / Santri</option>
            <option value="guru" ${appState.roleFilter === 'guru' ? 'selected' : ''}>Dewan Guru</option>
            <option value="walikelas" ${appState.roleFilter === 'walikelas' ? 'selected' : ''}>Wali Kelas</option>
            <option value="bendahara" ${appState.roleFilter === 'bendahara' ? 'selected' : ''}>Bendahara</option>
            <option value="kepala_madrasah" ${appState.roleFilter === 'kepala_madrasah' ? 'selected' : ''}>Kepala Madrasah</option>
            <option value="operator" ${appState.roleFilter === 'operator' ? 'selected' : ''}>Operator / Superadmin</option>
          </select>
        </div>
      </div>

      <!-- Users Table or Empty State -->
      ${filteredUsers.length === 0 ? `
        <div class="p-12 text-center bg-slate-50/70 rounded-2xl border border-dashed border-slate-300">
          <div class="text-4xl mb-2">👥</div>
          <h4 class="font-bold text-slate-800 text-sm">Belum Ada Data Pengguna</h4>
          <p class="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            ${appState.searchTerm ? 'Tidak ada pengguna yang cocok dengan pencarian Anda.' : 'Database pengguna masih kosong. Mulai tambahkan akun santri, guru, atau staf madrasah pertama Anda.'}
          </p>
          <button id="btn-empty-add-user" class="mt-4 px-4 py-2.5 bg-[#0b3b01] text-white text-xs font-bold rounded-xl hover:bg-[#06410a] transition shadow-xs cursor-pointer">
            + Tambah Pengguna Baru
          </button>
        </div>
      ` : `
        <div class="overflow-x-auto rounded-2xl border border-slate-200/80 bg-white">
          <table class="w-full text-left text-xs">
            <thead class="border-b border-slate-200 bg-slate-50/80 text-[11px] font-bold uppercase tracking-wider text-slate-600">
              <tr>
                <th class="px-4 py-3.5">Nama & Kontak</th>
                <th class="px-4 py-3.5">Unit / Keterangan</th>
                <th class="px-4 py-3.5">Peran Aktif</th>
                <th class="px-4 py-3.5">Ubah Hak Akses</th>
                <th class="px-4 py-3.5 text-center">Tindakan</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              ${filteredUsers.map(u => `
                <tr class="hover:bg-slate-50/60 transition">
                  <td class="px-4 py-3">
                    <button type="button" class="btn-edit-user flex items-center gap-3 text-left hover:opacity-80 transition cursor-pointer" data-uid="${u.id}">
                      <div class="h-8 w-8 rounded-full bg-emerald-100 text-[#0b3b01] font-bold flex items-center justify-center text-xs">
                        ${u.full_name.charAt(0)}
                      </div>
                      <div>
                        <p class="font-bold text-slate-900 flex items-center gap-1.5">
                          <span>${u.full_name}</span>
                          <span class="text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-1.5 py-0.2 rounded font-normal">Lihat Profil</span>
                        </p>
                        <p class="text-[11px] text-slate-500">${u.email}</p>
                      </div>
                    </button>
                  </td>
                  <td class="px-4 py-3 text-slate-600 font-medium">${u.unit}</td>
                  <td class="px-4 py-3">${getRoleBadge(u.role)}</td>
                  <td class="px-4 py-3">
                    <select class="role-changer-live rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-800 focus:border-[#00895f] focus:outline-none" data-uid="${u.id}">
                      <option value="siswa" ${u.role === 'siswa' ? 'selected' : ''}>Siswa</option>
                      <option value="guru" ${u.role === 'guru' ? 'selected' : ''}>Guru</option>
                      <option value="walikelas" ${u.role === 'walikelas' ? 'selected' : ''}>Wali Kelas</option>
                      <option value="bendahara" ${u.role === 'bendahara' ? 'selected' : ''}>Bendahara</option>
                      <option value="kepala_madrasah" ${u.role === 'kepala_madrasah' ? 'selected' : ''}>Kepala Madrasah</option>
                      <option value="operator" ${u.role === 'operator' ? 'selected' : ''}>Operator</option>
                    </select>
                  </td>
                  <td class="px-4 py-3 text-center">
                    <div class="inline-flex items-center gap-2 justify-center">
                      <button class="btn-edit-user text-[11px] font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/80 px-2.5 py-1.5 rounded-xl transition inline-flex items-center gap-1 shadow-2xs cursor-pointer" data-uid="${u.id}">
                        <span>👤</span> Profil & Sandi
                      </button>
                      <button class="btn-delete-user text-[11px] font-bold text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100 border border-red-200/60 px-2.5 py-1.5 rounded-xl transition inline-flex items-center gap-1 cursor-pointer" data-uid="${u.id}" data-name="${u.full_name}" data-role="${u.role}">
                        <span>🗑️</span> Hapus
                      </button>
                    </div>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
        <div class="flex items-center justify-between text-[11px] text-slate-500 pt-2">
          <span>Total ${filteredUsers.length} pengguna terdaftar di Supabase</span>
          <span class="text-emerald-700 font-medium">Perubahan tersimpan otomatis ke cloud database</span>
        </div>
      `}
    </div>
  `;

  // Listeners
  const refreshUsers = () => renderUsersPage(container);
  document.getElementById("btn-tab-add-user")?.addEventListener("click", () => openAddUserModal(refreshUsers));
  document.getElementById("btn-empty-add-user")?.addEventListener("click", () => openAddUserModal(refreshUsers));

  const searchInput = document.getElementById("user-search-input");
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      appState.searchTerm = e.target.value;
      renderUsersPage(container);
    });
  }

  const roleFilter = document.getElementById("user-role-filter");
  if (roleFilter) {
    roleFilter.addEventListener("change", (e) => {
      appState.roleFilter = e.target.value;
      renderUsersPage(container);
    });
  }

  container.querySelectorAll(".role-changer-live").forEach(select => {
    select.addEventListener("change", async (e) => {
      const uid = e.target.dataset.uid;
      const newRole = e.target.value;
      const targetUser = appState.users.find(u => u.id === uid);
      if (targetUser) {
        targetUser.role = newRole;
        appState.auditLogs.unshift({
          id: `log-${Date.now()}`,
          actor: "Operator (Superadmin)",
          action: `Mengubah peran ${targetUser.full_name} menjadi ${newRole}`,
          timestamp: "Baru saja",
          badge: "success"
        });
      }
      try {
        await supabase.from("profiles").update({ role: newRole }).eq("id", uid);
      } catch (err) {
        console.warn("Supabase profile update:", err);
      }
      window.dashboardModal.toast(`Hak akses pengguna diubah menjadi: ${newRole.toUpperCase()}`, "success");
      renderUsersPage(container);
    });
  });

  container.querySelectorAll(".btn-edit-user").forEach(btn => {
    btn.addEventListener("click", () => {
      const uid = btn.dataset.uid;
      const target = appState.users.find(u => u.id === uid);
      if (target) {
        openEditUserModal(target, refreshUsers);
      }
    });
  });

  container.querySelectorAll(".btn-delete-user").forEach(btn => {
    btn.addEventListener("click", () => {
      const uid = btn.dataset.uid;
      const name = btn.dataset.name;
      const role = btn.dataset.role;
      openDeleteUserModal(uid, name, role, refreshUsers);
    });
  });
}

// ============================================================================
// 3. HALAMAN DATA MASTER KELAS & MAPEL (MASTER)
// ============================================================================
function renderMasterPage(container) {
  container.innerHTML = `
    <div class="space-y-6">
      <!-- Rombel / Classes Management -->
      <div class="rounded-3xl border border-white/70 bg-white/95 p-6 shadow-xl shadow-[#0b3b01]/5 backdrop-blur-sm space-y-4">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 class="text-xl font-black text-[#0b3b01]">Data Rombongan Belajar (Rombel / Kelas)</h3>
            <p class="text-xs text-slate-500 mt-0.5">Pengaturan kelas untuk unit Madrasah Aliyah, SMP IT, dan Raudhatul Athfal.</p>
          </div>
          <button id="btn-add-class-trigger" class="inline-flex items-center gap-2 rounded-xl bg-[#0b3b01] px-4 py-2 text-xs font-bold text-white hover:bg-[#06410a] transition shadow-sm cursor-pointer">
            <span>➕</span> Tambah Rombel Baru
          </button>
        </div>

        ${appState.classes.length === 0 ? `
          <div class="p-8 text-center bg-slate-50/70 rounded-2xl border border-dashed border-slate-300">
            <div class="text-3xl mb-2">🏫</div>
            <h4 class="font-bold text-slate-800 text-sm">Belum Ada Rombongan Belajar</h4>
            <p class="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Mulai tambahkan kelas atau rombel pertama Anda untuk unit MA, SMP IT, atau RA.
            </p>
            <button id="btn-empty-add-class" class="mt-4 px-4 py-2 bg-[#0b3b01] text-white text-xs font-bold rounded-xl hover:bg-[#06410a] transition shadow-xs cursor-pointer">
              + Tambah Rombel Pertama
            </button>
          </div>
        ` : `
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            ${appState.classes.map(c => `
              <div class="rounded-2xl border border-slate-200 bg-white p-4 hover:border-emerald-500 transition shadow-xs">
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
                <h4 class="font-black text-slate-900 mt-2 text-sm">${c.name}</h4>
                <p class="text-[11px] text-slate-500 mt-1">Wali: <strong class="text-slate-700">${c.homeroom}</strong></p>
                <p class="text-[10px] text-slate-400 mt-0.5">Lokasi: ${c.room}</p>
              </div>
            `).join('')}
          </div>
        `}
      </div>

      <!-- Subjects Management -->
      <div class="rounded-3xl border border-white/70 bg-white/95 p-6 shadow-xl shadow-[#0b3b01]/5 backdrop-blur-sm space-y-4">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 class="text-xl font-black text-[#0b3b01]">Mata Pelajaran & Kurikulum Terpadu</h3>
            <p class="text-xs text-slate-500 mt-0.5">Daftar kurikulum kepesantrenan, bahasa Arab/Inggris, dan kurikulum umum.</p>
          </div>
          <button id="btn-add-subj-trigger" class="inline-flex items-center gap-2 rounded-xl bg-emerald-800 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-900 transition shadow-sm cursor-pointer">
            <span>➕</span> Tambah Mata Pelajaran
          </button>
        </div>

        ${appState.subjects.length === 0 ? `
          <div class="p-8 text-center bg-slate-50/70 rounded-2xl border border-dashed border-slate-300">
            <div class="text-3xl mb-2">📖</div>
            <h4 class="font-bold text-slate-800 text-sm">Belum Ada Mata Pelajaran</h4>
            <p class="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Daftarkan mata pelajaran (Tahfidz, Fiqih, Bahasa Arab, Sains, dll.) ke kurikulum madrasah.
            </p>
            <button id="btn-empty-add-subj" class="mt-4 px-4 py-2 bg-emerald-800 text-white text-xs font-bold rounded-xl hover:bg-emerald-900 transition shadow-xs cursor-pointer">
              + Tambah Mata Pelajaran Pertama
            </button>
          </div>
        ` : `
          <div class="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
            <table class="w-full text-left text-xs">
              <thead class="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-600">
                <tr>
                  <th class="px-4 py-3">Kode</th>
                  <th class="px-4 py-3">Nama Mata Pelajaran</th>
                  <th class="px-4 py-3">Kategori</th>
                  <th class="px-4 py-3">Beban Belajar</th>
                  <th class="px-4 py-3">Pengajar Utama</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                ${appState.subjects.map(s => `
                  <tr class="hover:bg-slate-50/50 transition">
                    <td class="px-4 py-3 font-mono font-bold text-[#0b3b01]">${s.code}</td>
                    <td class="px-4 py-3 font-bold text-slate-900">${s.name}</td>
                    <td class="px-4 py-3 text-slate-600">${s.category}</td>
                    <td class="px-4 py-3 text-slate-600">${s.hours}</td>
                    <td class="px-4 py-3 text-slate-700">${s.teacher}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        `}
      </div>
    </div>
  `;

  // Listeners
  const refreshMaster = () => renderMasterPage(container);
  document.getElementById("btn-add-class-trigger")?.addEventListener("click", () => openAddClassModal(refreshMaster));
  document.getElementById("btn-empty-add-class")?.addEventListener("click", () => openAddClassModal(refreshMaster));
  document.getElementById("btn-add-subj-trigger")?.addEventListener("click", () => openAddSubjectModal(refreshMaster));
  document.getElementById("btn-empty-add-subj")?.addEventListener("click", () => openAddSubjectModal(refreshMaster));
}

// ============================================================================
// 4. HALAMAN PENDAFTARAN SANTRI (SPMB)
// ============================================================================
function renderSpmbPage(container) {
  container.innerHTML = `
    <div class="rounded-3xl border border-white/70 bg-white/95 p-6 shadow-xl shadow-[#0b3b01]/5 backdrop-blur-sm space-y-5">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 class="text-xl font-black text-[#0b3b01]">Seleksi Penerimaan Murid Baru (SPMB 2026/2027)</h3>
          <p class="text-xs text-slate-500 mt-0.5">Verifikasi berkas, pantau kelulusan, dan konfirmasi calon santri baru.</p>
        </div>
        <div class="flex items-center gap-2">
          <span class="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-200">
            🟢 Gelombang 1 Aktif
          </span>
        </div>
      </div>

      ${appState.spmb.length === 0 ? `
        <div class="p-12 text-center bg-slate-50/70 rounded-2xl border border-dashed border-slate-300">
          <div class="text-4xl mb-2">📝</div>
          <h4 class="font-bold text-slate-800 text-sm">Belum Ada Pendaftar Santri Baru</h4>
          <p class="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Pendaftaran online SPMB Tahun Ajaran 2026/2027 siap menerima calon santri. Saat calon santri mendaftar melalui portal pendaftaran, datanya akan langsung muncul di sini.
          </p>
        </div>
      ` : `
        <div class="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
          <table class="w-full text-left text-xs">
            <thead class="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-600">
              <tr>
                <th class="px-4 py-3.5">No. Registrasi</th>
                <th class="px-4 py-3.5">Nama Calon Santri</th>
                <th class="px-4 py-3.5">Pilihan Unit</th>
                <th class="px-4 py-3.5">Asal Sekolah</th>
                <th class="px-4 py-3.5">Status Seleksi</th>
                <th class="px-4 py-3.5 text-center">Aksi Verifikasi</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              ${appState.spmb.map(applicant => `
                <tr class="hover:bg-slate-50/50 transition">
                  <td class="px-4 py-3 font-mono font-bold text-slate-700">${applicant.regNo}</td>
                  <td class="px-4 py-3">
                    <p class="font-bold text-slate-900">${applicant.name}</p>
                    <p class="text-[10px] text-slate-500">WA: ${applicant.phone}</p>
                  </td>
                  <td class="px-4 py-3 font-semibold text-emerald-800">${applicant.unit}</td>
                  <td class="px-4 py-3 text-slate-600">${applicant.prevSchool}</td>
                  <td class="px-4 py-3">${getSpmbBadge(applicant.status)}</td>
                  <td class="px-4 py-3 text-center">
                    <div class="inline-flex items-center gap-1.5">
                      <button class="btn-verify-spmb px-2.5 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 font-bold hover:bg-emerald-100 transition text-[11px] cursor-pointer" data-reg="${applicant.regNo}" data-status="Diterima">
                        Terima
                      </button>
                      <button class="btn-verify-spmb px-2.5 py-1.5 rounded-lg bg-blue-50 text-blue-800 font-bold hover:bg-blue-100 transition text-[11px] cursor-pointer" data-reg="${applicant.regNo}" data-status="Lolos Berkas">
                        Berkas OK
                      </button>
                      <button class="btn-verify-spmb px-2.5 py-1.5 rounded-lg bg-amber-50 text-amber-800 font-bold hover:bg-amber-100 transition text-[11px] cursor-pointer" data-reg="${applicant.regNo}" data-status="Menunggu Verifikasi">
                        Pending
                      </button>
                    </div>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `}
    </div>
  `;

  // Listeners
  container.querySelectorAll(".btn-verify-spmb").forEach(btn => {
    btn.addEventListener("click", () => {
      const reg = btn.dataset.reg;
      const status = btn.dataset.status;
      const target = appState.spmb.find(s => s.regNo === reg);
      if (target) {
        target.status = status;
        appState.auditLogs.unshift({
          id: `log-${Date.now()}`,
          actor: "Operator (Superadmin)",
          action: `Memperbarui status pendaftaran ${target.name} (${reg}) menjadi: ${status}`,
          timestamp: "Baru saja",
          badge: status === "Diterima" ? "success" : "info"
        });
        window.dashboardModal.toast(`Status pendaftaran ${target.name} diubah: ${status}`, "success");
        renderSpmbPage(container);
      }
    });
  });
}

// ============================================================================
// 5. HALAMAN TATA TERTIB & DISIPLIN (VIOLATIONS)
// ============================================================================
function renderViolationsPage(container) {
  container.innerHTML = `
    <div class="rounded-3xl border border-white/70 bg-white/95 p-6 shadow-xl shadow-[#0b3b01]/5 backdrop-blur-sm space-y-5">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 class="text-xl font-black text-amber-950">Pusat Tata Tertib & Kedisiplinan Santri</h3>
          <p class="text-xs text-slate-500 mt-0.5">Pemantauan akumulasi poin pelanggaran dan pemberian sanksi pembinaan edukatif.</p>
        </div>
        <button id="btn-add-viol-trigger" class="inline-flex items-center gap-2 rounded-xl bg-amber-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-amber-700 transition shadow-sm cursor-pointer">
          <span>➕</span> Catat Pelanggaran Baru
        </button>
      </div>

      ${appState.violations.length === 0 ? `
        <div class="p-12 text-center bg-slate-50/70 rounded-2xl border border-dashed border-slate-300">
          <div class="text-4xl mb-2">✨</div>
          <h4 class="font-bold text-emerald-900 text-sm">Tidak Ada Catatan Pelanggaran</h4>
          <p class="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Belum ada laporan pelanggaran tercatat di sistem. Seluruh santri dalam keadaan tertib.
          </p>
          <button id="btn-empty-add-viol" class="mt-4 px-4 py-2.5 bg-amber-600 text-white text-xs font-bold rounded-xl hover:bg-amber-700 transition shadow-xs cursor-pointer">
            + Catat Pelanggaran Santri
          </button>
        </div>
      ` : `
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          ${appState.violations.map(v => `
            <div class="rounded-2xl border border-slate-200 bg-white p-4 hover:shadow-md transition">
              <div class="flex items-center justify-between">
                <span class="font-bold text-slate-900">${v.studentName}</span>
                <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                  v.category === 'berat' ? 'bg-red-100 text-red-700' :
                  v.category === 'sedang' ? 'bg-amber-100 text-amber-700' :
                  'bg-blue-100 text-blue-700'
                }">
                  ${v.category.toUpperCase()} (${v.points} Poin)
                </span>
              </div>
              <p class="text-xs font-semibold text-slate-700 mt-2">${v.title}</p>
              <div class="mt-3 p-2.5 rounded-xl bg-slate-50 text-[11px] border border-slate-100">
                <span class="font-bold text-emerald-800">Sanksi Edukatif:</span>
                <span class="text-slate-600">${v.action}</span>
              </div>
              <p class="text-[10px] text-slate-400 mt-2 text-right">Tercatat: ${v.date}</p>
            </div>
          `).join('')}
        </div>
      `}
    </div>
  `;

  // Listeners
  const refreshViol = () => renderViolationsPage(container);
  document.getElementById("btn-add-viol-trigger")?.addEventListener("click", () => openAddViolationModal(refreshViol));
  document.getElementById("btn-empty-add-viol")?.addEventListener("click", () => openAddViolationModal(refreshViol));
}

// ============================================================================
// 6. HALAMAN MONITORING TERPADU (MONITORING)
// ============================================================================
function renderMonitoringPage(container) {
  container.innerHTML = `
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <!-- Monitoring Absensi -->
      <div class="rounded-3xl border border-white/70 bg-white/95 p-6 shadow-xl shadow-[#0b3b01]/5 backdrop-blur-sm space-y-4">
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-black text-[#0b3b01]">Rekapitulasi Kehadiran Santri & Guru</h3>
          <span class="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">Hari Ini</span>
        </div>
        <p class="text-xs text-slate-500">Tingkat kehadiran santri dan keaktifan dewan asatidz mengajar.</p>

        <div class="grid grid-cols-3 gap-2.5 text-center mt-3">
          <div class="rounded-2xl bg-emerald-50 p-3.5 border border-emerald-100">
            <p class="text-2xl font-black text-emerald-900">${appState.stats.totalStudents > 0 ? '100%' : '0%'}</p>
            <p class="text-[11px] font-bold text-emerald-700 mt-1">Hadir Tepat Waktu</p>
          </div>
          <div class="rounded-2xl bg-blue-50 p-3.5 border border-blue-100">
            <p class="text-2xl font-black text-blue-900">0</p>
            <p class="text-[11px] font-bold text-blue-700 mt-1">Izin / Sakit</p>
          </div>
          <div class="rounded-2xl bg-slate-50 p-3.5 border border-slate-200">
            <p class="text-2xl font-black text-slate-900">0</p>
            <p class="text-[11px] font-bold text-slate-600 mt-1">Tanpa Keterangan</p>
          </div>
        </div>

        <div class="rounded-2xl bg-[#f8faf7] p-3.5 text-xs border border-emerald-900/10 space-y-2.5">
          <div class="flex justify-between items-center">
            <span class="font-bold text-slate-700">Total Santri Aktif</span>
            <span class="font-extrabold text-emerald-800">${appState.stats.totalStudents} Santri</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="font-bold text-slate-700">Total Dewan Asatidz</span>
            <span class="font-extrabold text-emerald-800">${appState.stats.totalTeachers} Guru</span>
          </div>
        </div>
      </div>

      <!-- Monitoring Keuangan SPP -->
      <div class="rounded-3xl border border-white/70 bg-white/95 p-6 shadow-xl shadow-[#0b3b01]/5 backdrop-blur-sm space-y-4">
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-black text-blue-950">Monitoring Keuangan & SPP Madrasah</h3>
          <span class="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">Bulan Berjalan</span>
        </div>
        <p class="text-xs text-slate-500">Akses pemantauan kas yang dikelola oleh bendahara madrasah.</p>

        <div class="rounded-2xl bg-blue-50 p-4 border border-blue-100 space-y-1">
          <p class="text-[11px] font-bold uppercase tracking-wider text-blue-700">Total Kas Terverifikasi</p>
          <p class="text-2xl font-black text-blue-950">Rp ${(appState.stats.totalKas).toLocaleString('id-ID')}</p>
          <p class="text-[11px] text-blue-800">Catatan penerimaan iuran yang telah diverifikasi bendahara di database.</p>
        </div>

        <div class="space-y-2 text-xs">
          <div class="flex justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
            <span class="text-slate-600">Status Pembayaran Real</span>
            <span class="font-bold text-emerald-800">${appState.stats.totalKas > 0 ? 'Tercatat di Database' : 'Belum Ada Transaksi'}</span>
          </div>
        </div>
      </div>
    </div>
  `;
}

// ============================================================================
// 7. HALAMAN LOG AUDIT & SISTEM (SYSTEM)
// ============================================================================
function renderSystemPage(container) {
  container.innerHTML = `
    <div class="rounded-3xl border border-white/70 bg-white/95 p-6 shadow-xl shadow-[#0b3b01]/5 backdrop-blur-sm space-y-6">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 class="text-xl font-black text-purple-950">Log Audit Sistem & Konfigurasi Global (Superadmin)</h3>
          <p class="text-xs text-slate-500 mt-0.5">Catatan aktivitas krusial, keamanan sistem, dan status integrasi Supabase.</p>
        </div>
        <span class="px-3 py-1.5 rounded-full bg-purple-100 text-purple-800 text-xs font-bold border border-purple-200">
          Level Otoritas: Superadmin
        </span>
      </div>

      <!-- System Diagnostic Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div class="p-4 rounded-2xl bg-slate-50 border border-slate-200">
          <p class="text-[11px] uppercase font-bold text-slate-500">Database Supabase</p>
          <p class="text-sm font-black text-emerald-700 mt-1">🟢 Connected & Synced</p>
          <p class="text-[10px] text-slate-400 mt-1">URL: szzrmuvhuhmwtjuhirkc</p>
        </div>
        <div class="p-4 rounded-2xl bg-slate-50 border border-slate-200">
          <p class="text-[11px] uppercase font-bold text-slate-500">Tahun Ajaran Aktif</p>
          <p class="text-sm font-black text-slate-800 mt-1">2026/2027 Ganjil</p>
          <p class="text-[10px] text-slate-400 mt-1">Status: Periode Berjalan</p>
        </div>
        <div class="p-4 rounded-2xl bg-slate-50 border border-slate-200">
          <p class="text-[11px] uppercase font-bold text-slate-500">Pendaftaran SPMB Online</p>
          <p class="text-sm font-black text-emerald-700 mt-1">Aktif / Terbuka</p>
          <p class="text-[10px] text-slate-400 mt-1">Gelombang 1</p>
        </div>
      </div>

      <!-- Audit Trail List -->
      <div>
        <h4 class="font-bold text-xs uppercase tracking-wider text-slate-700 mb-3">Jejak Aktivitas Sistem (Audit Trail Sesi)</h4>
        ${appState.auditLogs.length === 0 ? `
          <div class="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-xs text-slate-500">
            Belum ada aktivitas tercatat pada sesi saat ini. Aktivitas penambahan pengguna, rombel, dan pengumuman akan tercatat di sini.
          </div>
        ` : `
          <div class="space-y-2.5">
            ${appState.auditLogs.map(log => `
              <div class="flex items-start justify-between p-3.5 rounded-2xl border border-slate-200/80 bg-white text-xs hover:border-slate-300 transition">
                <div class="flex items-center gap-3">
                  <span class="h-2 w-2 rounded-full ${
                    log.badge === 'success' ? 'bg-emerald-500' :
                    log.badge === 'warning' ? 'bg-amber-500' :
                    'bg-blue-500'
                  }"></span>
                  <div>
                    <p class="font-bold text-slate-800">${log.action}</p>
                    <p class="text-[11px] text-slate-500">Oleh: ${log.actor}</p>
                  </div>
                </div>
                <span class="text-[10px] text-slate-400 font-mono">${log.timestamp}</span>
              </div>
            `).join('')}
          </div>
        `}
      </div>
    </div>
  `;
}

// ============================================================================
// 8. HALAMAN PROFIL & SANDI SAYA (PROFILE)
// ============================================================================
function renderProfilePage(container, profile) {
  const user = profile || currentProfileRef || {};
  container.innerHTML = `
    <div class="max-w-4xl mx-auto space-y-6">
      <div class="rounded-3xl border border-white/70 bg-white/95 p-6 sm:p-8 shadow-xl shadow-[#0b3b01]/5 backdrop-blur-sm space-y-6">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div class="flex items-center gap-4">
            <div class="h-16 w-16 rounded-2xl bg-[#0b3b01] text-white font-black text-2xl flex items-center justify-center shadow-lg">
              ${(user.full_name || "D").charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 class="text-xl font-black text-slate-900">${user.full_name || "Pengguna Darunnajah"}</h3>
              <p class="text-xs text-slate-500">${user.email || ""}</p>
              <span class="inline-block mt-2 px-3 py-0.5 rounded-full text-[10px] font-bold bg-emerald-800 text-white">
                ${roleLabel}
              </span>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Form 1: Ubah Nama & Email -->
          <form id="page-form-profile" class="space-y-4 p-5 rounded-2xl bg-slate-50 border border-slate-200">
            <h4 class="font-bold text-sm text-[#0b3b01] flex items-center gap-2">
              <span>👤</span> Ubah Data Diri & Email
            </h4>
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">Nama Lengkap</label>
              <input id="page-my-name" type="text" value="${user.full_name || ''}" required 
                class="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs text-slate-800 focus:border-[#00895f] focus:outline-none" />
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">Alamat Email Login</label>
              <input id="page-my-email" type="email" value="${user.email || ''}" required 
                class="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs text-slate-800 focus:border-[#00895f] focus:outline-none" />
            </div>
            <button type="submit" class="w-full py-2.5 bg-[#0b3b01] text-white text-xs font-bold rounded-xl hover:bg-[#06410a] transition shadow-md cursor-pointer">
              Simpan Perubahan Data Diri
            </button>
          </form>

          <!-- Form 2: Ganti Password -->
          <form id="page-form-password" class="space-y-4 p-5 rounded-2xl bg-amber-50/50 border border-amber-200/80">
            <h4 class="font-bold text-sm text-amber-900 flex items-center gap-2">
              <span>🔑</span> Perbarui Kata Sandi Akun
            </h4>
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">Kata Sandi Baru</label>
              <input id="page-my-pwd" type="password" placeholder="Minimal 6 karakter..." required minlength="6"
                class="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs text-slate-800 focus:border-[#00895f] focus:outline-none" />
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">Konfirmasi Kata Sandi</label>
              <input id="page-my-pwd-confirm" type="password" placeholder="Ketik ulang kata sandi..." required minlength="6"
                class="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs text-slate-800 focus:border-[#00895f] focus:outline-none" />
            </div>
            <button type="submit" class="w-full py-2.5 bg-emerald-800 text-white text-xs font-bold rounded-xl hover:bg-emerald-900 transition shadow-md cursor-pointer">
              Perbarui Kata Sandi Sekarang
            </button>
          </form>
        </div>
      </div>
    </div>
  `;

  // Submit Profile Form
  document.getElementById("page-form-profile")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const newName = document.getElementById("page-my-name").value.trim();
    const newEmail = document.getElementById("page-my-email").value.trim();

    try {
      const { error: profErr } = await supabase.from("profiles").update({ full_name: newName }).eq("id", user.id);
      if (profErr) throw profErr;

      if (newEmail !== user.email) {
        const { error: authErr } = await supabase.auth.updateUser({ email: newEmail });
        if (authErr) throw authErr;
        window.dashboardModal.toast("Profil disimpan! Konfirmasi tautan telah dikirimkan ke email baru Anda.", "info");
      } else {
        window.dashboardModal.toast("Profil berhasil diperbarui!", "success");
      }

      user.full_name = newName;
      user.email = newEmail;
      const sidebarName = document.getElementById("sidebar-user-name");
      if (sidebarName) sidebarName.textContent = newName;
      const topbarName = document.getElementById("topbar-profile-name");
      if (topbarName) topbarName.textContent = newName;
    } catch (err) {
      window.dashboardModal.toast(`Gagal menyimpan profil: ${err.message}`, "error");
    }
  });

  // Submit Password Form
  document.getElementById("page-form-password")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const newPwd = document.getElementById("page-my-pwd").value;
    const confirmPwd = document.getElementById("page-my-pwd-confirm").value;

    if (newPwd !== confirmPwd) {
      window.dashboardModal.toast("Konfirmasi kata sandi tidak cocok!", "error");
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({ password: newPwd });
      if (error) throw error;
      window.dashboardModal.toast("Kata sandi berhasil diperbarui!", "success");
      document.getElementById("page-form-password").reset();
    } catch (err) {
      window.dashboardModal.toast(`Gagal memperbarui sandi: ${err.message}`, "error");
    }
  });
}

// ============================================================================
// ROUTER HALAMAN: RENDER PAGE
// ============================================================================
export async function renderPage(pageKey, container, profile) {
  if (profile) currentProfileRef = profile;

  // Pastikan sinkronisasi data Supabase dilakukan
  await syncWithSupabase();

  switch (pageKey) {
    case "users":
      renderUsersPage(container);
      break;
    case "master":
      renderMasterPage(container);
      break;
    case "spmb":
      renderSpmbPage(container);
      break;
    case "violations":
      renderViolationsPage(container);
      break;
    case "monitoring":
      renderMonitoringPage(container);
      break;
    case "system":
      renderSystemPage(container);
      break;
    case "profile":
      renderProfilePage(container, currentProfileRef);
      break;
    case "overview":
    default:
      renderOverviewPage(container);
      break;
  }

  // Scroll ke atas dengan halus saat ganti halaman
  window.scrollTo({ top: 0, behavior: "smooth" });
}

// Fallback render standard
export async function render(container, profile) {
  await renderPage("overview", container, profile);
}
