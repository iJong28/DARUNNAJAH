import { getCurrentProfile, signOut } from "./auth.js";
import { isSupabaseConfigured, supabase } from "./supabase.js";

const dashboardError = document.querySelector("#dashboard-error");
const mainPageContainer = document.querySelector("#main-page-container");

function showError(message) {
  if (!dashboardError) return;
  dashboardError.textContent = message;
  dashboardError.hidden = false;
  dashboardError.classList.remove("hidden");
}

function clearError() {
  if (!dashboardError) return;
  dashboardError.textContent = "";
  dashboardError.hidden = true;
  dashboardError.classList.add("hidden");
}

export function getRoleLabel(role) {
  const map = {
    superadmin: "Operator (Superadmin)",
    operator: "Operator (Superadmin)",
    kepala_madrasah: "Kepala Madrasah",
    guru: "Dewan Guru",
    walikelas: "Wali Kelas",
    bendahara: "Bendahara Madrasah",
    siswa: "Santri / Siswa",
    unassigned: "Belum Ditugaskan"
  };
  return map[role] || (role ? role.toUpperCase() : "Pengguna");
}

let activeProfileState = null;

// ============================================================================
// MODAL & TOAST SYSTEM
// ============================================================================

const modalBackdrop = document.querySelector("#dashboard-modal-backdrop");
const modalTitle = document.querySelector("#dashboard-modal-title");
const modalBody = document.querySelector("#dashboard-modal-body");
const modalCloseBtn = document.querySelector("#dashboard-modal-close");
const toastEl = document.querySelector("#dashboard-toast");
const toastMsg = document.querySelector("#dashboard-toast-message");

let currentModalCleanup = null;

export function openDashboardModal({ title, bodyHtml, onMount }) {
  if (!modalBackdrop || !modalBody || !modalTitle) return;

  modalTitle.textContent = title || "Dialog Sistem";
  modalBody.innerHTML = bodyHtml || "";

  modalBackdrop.classList.remove("hidden");
  modalBackdrop.classList.add("flex");
  document.body.classList.add("overflow-hidden");

  if (onMount) {
    currentModalCleanup = onMount(modalBody, closeDashboardModal);
  }
}

export function closeDashboardModal() {
  if (!modalBackdrop) return;
  modalBackdrop.classList.add("hidden");
  modalBackdrop.classList.remove("flex");
  document.body.classList.remove("overflow-hidden");

  if (currentModalCleanup) {
    currentModalCleanup();
    currentModalCleanup = null;
  }
}

if (modalCloseBtn) {
  modalCloseBtn.addEventListener("click", closeDashboardModal);
}
if (modalBackdrop) {
  modalBackdrop.addEventListener("click", (e) => {
    if (e.target === modalBackdrop) {
      closeDashboardModal();
    }
  });
}

let toastTimer = null;
export function showToast(message, type = "success") {
  if (!toastEl || !toastMsg) return;

  toastMsg.textContent = message;
  toastEl.className = "fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-2xl px-5 py-3.5 text-xs font-bold text-white shadow-2xl transition duration-300";

  if (type === "success") {
    toastEl.classList.add("bg-[#0b3b01]", "border", "border-emerald-500/50");
  } else if (type === "error") {
    toastEl.classList.add("bg-red-700", "border", "border-red-500/50");
  } else {
    toastEl.classList.add("bg-slate-800", "border", "border-slate-600");
  }

  toastEl.classList.remove("hidden", "opacity-0", "translate-y-4");
  toastEl.classList.add("opacity-100", "translate-y-0");

  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toastEl.classList.add("opacity-0", "translate-y-4");
    setTimeout(() => toastEl.classList.add("hidden"), 300);
  }, 3500);
}

// Global modal hook
window.dashboardModal = {
  open: openDashboardModal,
  close: closeDashboardModal,
  toast: showToast,
  openMyProfile: openMyProfileModal
};

// ============================================================================
// MODAL CEPAT PROFIL & KATA SANDI
// ============================================================================

export function openMyProfileModal(profile, initialTab = "profile") {
  const userProf = profile || activeProfileState || {};
  let currentTab = initialTab;

  openDashboardModal({
    title: "👤 Profil & Pengaturan Akun Saya",
    bodyHtml: `
      <div class="space-y-4">
        <!-- Tab Navigation -->
        <div class="flex border-b border-slate-200 text-xs font-bold gap-2">
          <button id="modal-tab-profile" type="button" class="px-3.5 py-2 border-b-2 ${currentTab === 'profile' ? 'border-[#0b3b01] text-[#0b3b01]' : 'border-transparent text-slate-500 hover:text-slate-800'} transition cursor-pointer">
            👤 Data Diri & Email
          </button>
          <button id="modal-tab-password" type="button" class="px-3.5 py-2 border-b-2 ${currentTab === 'password' ? 'border-[#0b3b01] text-[#0b3b01]' : 'border-transparent text-slate-500 hover:text-slate-800'} transition cursor-pointer">
            🔑 Ganti Kata Sandi
          </button>
        </div>

        <!-- Section 1: Profil & Email -->
        <div id="section-profile" class="${currentTab === 'profile' ? 'block' : 'hidden'} space-y-4">
          <div class="flex items-center gap-3.5 p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-100">
            <div class="h-12 w-12 rounded-2xl bg-[#0b3b01] text-white font-black text-lg flex items-center justify-center shadow-md">
              ${(userProf.full_name || "D").charAt(0).toUpperCase()}
            </div>
            <div>
              <p class="font-extrabold text-sm text-slate-900">${userProf.full_name || "Pengguna Darunnajah"}</p>
              <span class="inline-flex mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-800 text-white">
                ${getRoleLabel(userProf.role)}
              </span>
            </div>
          </div>

          <form id="form-my-profile" class="space-y-3.5 text-xs">
            <div>
              <label class="block font-bold text-slate-700 mb-1">Nama Lengkap</label>
              <input id="my-name" type="text" value="${userProf.full_name || ''}" required 
                class="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs text-slate-800 focus:border-[#00895f] focus:outline-none" />
            </div>

            <div>
              <label class="block font-bold text-slate-700 mb-1">Alamat Email Akun</label>
              <input id="my-email" type="email" value="${userProf.email || ''}" required 
                class="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs text-slate-800 focus:border-[#00895f] focus:outline-none" />
              <p class="mt-1 text-[11px] text-slate-400">Email digunakan untuk otentikasi login ke sistem.</p>
            </div>

            <div class="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
              <button id="btn-close-prof-modal" type="button" class="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-bold hover:bg-slate-100 transition cursor-pointer">
                Tutup
              </button>
              <button id="btn-submit-profile" type="submit" class="px-5 py-2 rounded-xl bg-[#0b3b01] text-white font-bold hover:bg-[#06410a] transition shadow-md cursor-pointer">
                Simpan Perubahan Profil
              </button>
            </div>
          </form>
        </div>

        <!-- Section 2: Ganti Kata Sandi -->
        <div id="section-password" class="${currentTab === 'password' ? 'block' : 'hidden'} space-y-4">
          <div class="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs">
            <p class="font-bold flex items-center gap-1.5">
              <span>🔒</span> Tips Keamanan Kata Sandi
            </p>
            <p class="mt-1 text-[11px] text-amber-800 leading-relaxed">
              Gunakan minimal 6 karakter dengan kombinasi huruf dan angka agar akun Anda tetap terlindungi.
            </p>
          </div>

          <form id="form-my-password" class="space-y-3.5 text-xs">
            <div>
              <label class="block font-bold text-slate-700 mb-1">Kata Sandi Baru</label>
              <input id="my-new-pwd" type="password" placeholder="Masukkan kata sandi baru (min. 6 karakter)..." required minlength="6"
                class="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs text-slate-800 focus:border-[#00895f] focus:outline-none" />
            </div>

            <div>
              <label class="block font-bold text-slate-700 mb-1">Konfirmasi Kata Sandi Baru</label>
              <input id="my-confirm-pwd" type="password" placeholder="Ketik ulang kata sandi baru..." required minlength="6"
                class="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs text-slate-800 focus:border-[#00895f] focus:outline-none" />
            </div>

            <div class="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
              <button id="btn-close-pwd-modal" type="button" class="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-bold hover:bg-slate-100 transition cursor-pointer">
                Batal
              </button>
              <button id="btn-submit-pwd" type="submit" class="px-5 py-2 rounded-xl bg-emerald-800 text-white font-bold hover:bg-emerald-900 transition shadow-md cursor-pointer">
                Perbarui Kata Sandi
              </button>
            </div>
          </form>
        </div>
      </div>
    `,
    onMount: (container, close) => {
      const tabProf = container.querySelector("#modal-tab-profile");
      const tabPwd = container.querySelector("#modal-tab-password");
      const secProf = container.querySelector("#section-profile");
      const secPwd = container.querySelector("#section-password");

      function switchTab(tab) {
        if (tab === "profile") {
          tabProf.className = "px-3.5 py-2 border-b-2 border-[#0b3b01] text-[#0b3b01] transition font-bold cursor-pointer";
          tabPwd.className = "px-3.5 py-2 border-b-2 border-transparent text-slate-500 hover:text-slate-800 transition font-bold cursor-pointer";
          secProf.classList.remove("hidden");
          secPwd.classList.add("hidden");
        } else {
          tabPwd.className = "px-3.5 py-2 border-b-2 border-[#0b3b01] text-[#0b3b01] transition font-bold cursor-pointer";
          tabProf.className = "px-3.5 py-2 border-b-2 border-transparent text-slate-500 hover:text-slate-800 transition font-bold cursor-pointer";
          secPwd.classList.remove("hidden");
          secProf.classList.add("hidden");
        }
      }

      tabProf?.addEventListener("click", () => switchTab("profile"));
      tabPwd?.addEventListener("click", () => switchTab("password"));
      container.querySelector("#btn-close-prof-modal")?.addEventListener("click", close);
      container.querySelector("#btn-close-pwd-modal")?.addEventListener("click", close);

      container.querySelector("#form-my-profile")?.addEventListener("submit", async (e) => {
        e.preventDefault();
        const newName = container.querySelector("#my-name").value.trim();
        const newEmail = container.querySelector("#my-email").value.trim();
        const submitBtn = container.querySelector("#btn-submit-profile");

        submitBtn.disabled = true;
        submitBtn.textContent = "Menyimpan...";

        try {
          const { error: profError } = await supabase
            .from("profiles")
            .update({ full_name: newName })
            .eq("id", userProf.id);

          if (profError) throw profError;

          if (newEmail !== userProf.email) {
            try {
              await supabase.auth.updateUser({ email: newEmail });
              showToast("Tautan konfirmasi dikirim ke email baru!", "info");
            } catch {}
          }

          userProf.full_name = newName;
          userProf.email = newEmail;
          
          const sidebarName = document.getElementById("sidebar-user-name");
          if (sidebarName) sidebarName.textContent = newName;
          const topbarName = document.getElementById("topbar-profile-name");
          if (topbarName) topbarName.textContent = newName;

          showToast("Profil & informasi akun berhasil diperbarui!", "success");
          close();
        } catch (err) {
          showToast(`Gagal memperbarui profil: ${err?.message || "Terjadi kendala"}`, "error");
        } finally {
          submitBtn.disabled = false;
          submitBtn.textContent = "Simpan Perubahan Profil";
        }
      });

      container.querySelector("#form-my-password")?.addEventListener("submit", async (e) => {
        e.preventDefault();
        const newPassword = container.querySelector("#my-new-pwd").value;
        const confirmPassword = container.querySelector("#my-confirm-pwd").value;
        const submitBtn = container.querySelector("#btn-submit-pwd");

        if (newPassword !== confirmPassword) {
          showToast("Konfirmasi kata sandi tidak cocok!", "error");
          return;
        }

        submitBtn.disabled = true;
        submitBtn.textContent = "Memperbarui sandi...";

        try {
          const { error } = await supabase.auth.updateUser({ password: newPassword });
          if (error) throw error;
          showToast("Kata sandi akun Anda berhasil diperbarui!", "success");
          close();
        } catch (err) {
          showToast(`Gagal memperbarui sandi: ${err?.message || "Terjadi kesalahan"}`, "error");
        } finally {
          submitBtn.disabled = false;
          submitBtn.textContent = "Perbarui Kata Sandi";
        }
      });
    }
  });
}

// ============================================================================
// HALAMAN PENUH: PROFIL & KATA SANDI SAYA
// ============================================================================

export function renderProfileCanvas(container, profile) {
  const userProf = profile || activeProfileState || {};
  const initial = (userProf.full_name || "D").charAt(0).toUpperCase();

  container.innerHTML = `
    <div class="space-y-6">
      <!-- HEADER PROFIL & IDENTITAS AKUN -->
      <article class="relative overflow-hidden rounded-3xl border border-emerald-800/20 bg-gradient-to-r from-emerald-950 via-[#0b3b01] to-[#004d2e] p-6 text-white shadow-2xl">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div class="flex items-center gap-4">
            <div id="page-profile-avatar" class="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl bg-white/20 text-white font-black text-2xl sm:text-3xl flex items-center justify-center border border-white/30 shadow-lg backdrop-blur-md">
              ${initial}
            </div>
            <div>
              <div class="flex flex-wrap items-center gap-2">
                <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-xs font-bold uppercase tracking-wider text-emerald-300 border border-emerald-400/30">
                  <span class="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  ${getRoleLabel(userProf.role)}
                </span>
                <span class="px-2.5 py-0.5 rounded-full bg-white/10 text-[11px] text-emerald-200 font-medium">
                  🟢 Akun Aktif & Terverifikasi
                </span>
              </div>
              <h2 id="page-profile-heading-name" class="mt-2 text-2xl sm:text-3xl font-black tracking-tight">${userProf.full_name || "Pengguna Darunnajah"}</h2>
              <p id="page-profile-heading-email" class="text-xs sm:text-sm text-emerald-200/90 mt-0.5">${userProf.email || "-"}</p>
            </div>
          </div>
          <div class="text-xs text-emerald-200/80 bg-white/10 p-3.5 rounded-2xl border border-white/10 backdrop-blur-md">
            <p class="font-bold text-white mb-0.5">ID Pengguna:</p>
            <p class="font-mono text-[11px]">${userProf.id || "-"}</p>
          </div>
        </div>
      </article>

      <!-- DUA KARTU FORM: DATA DIRI & KEAMANAN SANDI -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- 1. INFORMASI PRIBADI & KONTAK -->
        <div class="rounded-3xl border border-white/70 bg-white/95 p-6 shadow-xl shadow-[#0b3b01]/5 space-y-5">
          <div>
            <h3 class="text-lg font-black text-[#0b3b01]">Informasi Akun & Data Diri</h3>
            <p class="text-xs text-slate-500 mt-0.5">Perbarui nama lengkap dan alamat email yang Anda gunakan untuk login.</p>
          </div>

          <form id="form-canvas-profile" class="space-y-4 text-xs">
            <div>
              <label class="block font-bold text-slate-700 mb-1">Nama Lengkap & Gelar</label>
              <input id="canvas-my-name" type="text" value="${userProf.full_name || ''}" required 
                class="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs text-slate-800 focus:border-emerald-600 focus:outline-none" />
            </div>

            <div>
              <label class="block font-bold text-slate-700 mb-1">Alamat Email (Username Login)</label>
              <input id="canvas-my-email" type="email" value="${userProf.email || ''}" required 
                class="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs text-slate-800 focus:border-emerald-600 focus:outline-none" />
              <p class="mt-1 text-[11px] text-slate-400">Email ini digunakan sebagai username saat masuk ke sistem.</p>
            </div>

            <div>
              <label class="block font-bold text-slate-700 mb-1">Peran Otoritas Akun</label>
              <input type="text" value="${getRoleLabel(userProf.role)}" readonly 
                class="w-full rounded-xl border border-slate-200 bg-slate-100 px-3.5 py-2.5 text-xs text-slate-600 font-semibold cursor-not-allowed" />
              <p class="mt-1 text-[11px] text-slate-400">Hak akses ditentukan oleh manajemen sistem madrasah.</p>
            </div>

            <div class="pt-3 border-t border-slate-100 flex justify-end">
              <button id="btn-save-canvas-profile" type="submit" class="px-5 py-2.5 bg-[#0b3b01] text-white rounded-xl font-bold hover:bg-[#06410a] transition shadow-md cursor-pointer">
                💾 Simpan Perubahan Profil
              </button>
            </div>
          </form>
        </div>

        <!-- 2. KEAMANAN & GANTI KATA SANDI -->
        <div class="rounded-3xl border border-white/70 bg-white/95 p-6 shadow-xl shadow-[#0b3b01]/5 space-y-5">
          <div>
            <h3 class="text-lg font-black text-[#0b3b01]">Keamanan & Ganti Kata Sandi</h3>
            <p class="text-xs text-slate-500 mt-0.5">Perbarui kata sandi Anda secara berkala untuk menjaga keamanan akun.</p>
          </div>

          <div class="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs">
            <p class="font-bold flex items-center gap-1.5">
              <span>🔒</span> Panduan Kata Sandi Aman
            </p>
            <p class="mt-1 text-[11px] text-amber-800 leading-relaxed">
              Gunakan minimal 6 karakter. Pastikan kata sandi baru mudah diingat oleh Anda namun sulit ditebak oleh orang lain.
            </p>
          </div>

          <form id="form-canvas-password" class="space-y-4 text-xs">
            <div>
              <label class="block font-bold text-slate-700 mb-1">Kata Sandi Baru</label>
              <input id="canvas-my-new-pwd" type="password" placeholder="Masukkan kata sandi baru (min. 6 karakter)..." required minlength="6"
                class="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs text-slate-800 focus:border-emerald-600 focus:outline-none" />
            </div>

            <div>
              <label class="block font-bold text-slate-700 mb-1">Konfirmasi Kata Sandi Baru</label>
              <input id="canvas-my-confirm-pwd" type="password" placeholder="Ketik ulang kata sandi baru..." required minlength="6"
                class="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs text-slate-800 focus:border-emerald-600 focus:outline-none" />
            </div>

            <div class="pt-3 border-t border-slate-100 flex justify-end">
              <button id="btn-submit-canvas-pwd" type="submit" class="px-5 py-2.5 bg-emerald-800 text-white rounded-xl font-bold hover:bg-emerald-900 transition shadow-md cursor-pointer">
                🔑 Perbarui Kata Sandi Saya
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `;

  // Submit profil
  const formProfile = container.querySelector("#form-canvas-profile");
  formProfile?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const newName = container.querySelector("#canvas-my-name").value.trim();
    const newEmail = container.querySelector("#canvas-my-email").value.trim();
    const submitBtn = container.querySelector("#btn-save-canvas-profile");

    submitBtn.disabled = true;
    submitBtn.textContent = "Menyimpan...";

    try {
      const { error: profError } = await supabase
        .from("profiles")
        .update({ full_name: newName })
        .eq("id", userProf.id);

      if (profError) throw profError;

      if (newEmail !== userProf.email) {
        try {
          await supabase.auth.updateUser({ email: newEmail });
          showToast("Tautan konfirmasi dikirim ke email baru!", "info");
        } catch {}
      }

      userProf.full_name = newName;
      userProf.email = newEmail;

      // Update Header elements
      const headingName = container.querySelector("#page-profile-heading-name");
      if (headingName) headingName.textContent = newName;
      const headingEmail = container.querySelector("#page-profile-heading-email");
      if (headingEmail) headingEmail.textContent = newEmail;
      const avatarEl = container.querySelector("#page-profile-avatar");
      if (avatarEl) avatarEl.textContent = newName.charAt(0).toUpperCase();

      // Update sidebar & topbar
      const sidebarName = document.getElementById("sidebar-user-name");
      if (sidebarName) sidebarName.textContent = newName;
      const sidebarAvatar = document.getElementById("sidebar-user-avatar");
      if (sidebarAvatar) sidebarAvatar.textContent = newName.charAt(0).toUpperCase();
      const topbarName = document.getElementById("topbar-profile-name");
      if (topbarName) topbarName.textContent = newName;

      showToast("Profil berhasil diperbarui dan disimpan!", "success");
    } catch (err) {
      showToast(`Gagal memperbarui profil: ${err?.message || "Terjadi kendala"}`, "error");
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = "💾 Simpan Perubahan Profil";
    }
  });

  // Submit sandi
  const formPassword = container.querySelector("#form-canvas-password");
  formPassword?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const newPassword = container.querySelector("#canvas-my-new-pwd").value;
    const confirmPassword = container.querySelector("#canvas-my-confirm-pwd").value;
    const submitBtn = container.querySelector("#btn-submit-canvas-pwd");

    if (newPassword !== confirmPassword) {
      showToast("Konfirmasi kata sandi tidak cocok!", "error");
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = "Memperbarui sandi...";

    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      showToast("Kata sandi akun Anda berhasil diperbarui!", "success");
      container.querySelector("#canvas-my-new-pwd").value = "";
      container.querySelector("#canvas-my-confirm-pwd").value = "";
    } catch (err) {
      showToast(`Gagal memperbarui sandi: ${err?.message || "Terjadi kesalahan"}`, "error");
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = "🔑 Perbarui Kata Sandi Saya";
    }
  });
}

window.renderProfileCanvas = renderProfileCanvas;

// ============================================================================
// FULL LEFT SIDEBAR NAVIGATION & MODULAR PAGE ROUTER
// ============================================================================

function setupSidebarNavigation(profile, roleModule) {
  const sidebarNavMenu = document.getElementById("sidebar-nav-menu");
  const sidebarUserName = document.getElementById("sidebar-user-name");
  const sidebarUserAvatar = document.getElementById("sidebar-user-avatar");
  const sidebarUserRoleBadge = document.getElementById("sidebar-user-role-badge");
  const topbarProfileName = document.getElementById("topbar-profile-name");
  const topbarPageTitle = document.getElementById("topbar-page-title");
  const topbarPageSubtitle = document.getElementById("topbar-page-subtitle");
  
  const appSidebar = document.getElementById("app-sidebar");
  const sidebarBackdrop = document.getElementById("sidebar-backdrop");
  const btnToggleSidebarMobile = document.getElementById("btn-toggle-sidebar-mobile");
  const btnCloseSidebarMobile = document.getElementById("btn-close-sidebar-mobile");

  // Isi data profile di sidebar
  const fullName = profile?.full_name || "Pengguna Darunnajah";
  if (sidebarUserName) sidebarUserName.textContent = fullName;
  if (sidebarUserAvatar) sidebarUserAvatar.textContent = fullName.charAt(0).toUpperCase();
  if (sidebarUserRoleBadge) sidebarUserRoleBadge.textContent = getRoleLabel(profile?.role);
  if (topbarProfileName) topbarProfileName.textContent = fullName;

  // Cek apakah modul peran menyediakan menuGroups berjenjang atau menuItems datar
  const groups = roleModule?.menuGroups || null;
  const items = roleModule?.menuItems || (groups ? groups.flatMap(g => g.submenus) : [
    { id: "lembaga_info", label: "Pengaturan Data Lembaga", icon: "🏛️", subtitle: "Pusat Kendali & Data Lembaga" }
  ]);

  // Render menu ke sidebar sebelah kiri
  if (sidebarNavMenu) {
    if (groups) {
      sidebarNavMenu.innerHTML = groups.map((g, gIdx) => `
        <div class="sidebar-menu-group space-y-1">
          <button
            type="button"
            class="btn-group-toggle w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold text-emerald-100 hover:bg-white/10 transition text-left cursor-pointer"
            data-group="${g.id}"
          >
            <span class="flex items-center gap-2.5">
              <span class="text-base">${g.icon}</span>
              <span class="tracking-tight">${g.title}</span>
            </span>
            <span class="group-chevron text-[10px] text-emerald-300/70 transition-transform duration-200">▼</span>
          </button>
          <div class="group-submenus pl-3 space-y-0.5 ${gIdx === 0 ? '' : 'hidden'}" id="submenus-${g.id}">
            ${g.submenus.map(sub => `
              <button
                type="button"
                data-page="${sub.id}"
                data-group="${g.id}"
                class="sidebar-nav-item w-full flex items-center gap-2.5 px-3 py-1.5 rounded-xl text-[11px] font-medium text-emerald-100/75 hover:bg-white/10 hover:text-white transition text-left cursor-pointer"
              >
                <span class="text-xs">${sub.icon}</span>
                <span class="truncate">${sub.label}</span>
              </button>
            `).join('')}
          </div>
        </div>
      `).join('');
    } else {
      sidebarNavMenu.innerHTML = items.map(item => `
        <button
          type="button"
          data-page="${item.id}"
          class="sidebar-nav-item w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-emerald-100/80 hover:bg-white/10 hover:text-white transition text-left cursor-pointer"
        >
          <span class="text-base">${item.icon}</span>
          <span class="truncate">${item.label}</span>
        </button>
      `).join('');
    }
  }

  // Handler toggle accordion grup menu
  document.querySelectorAll(".btn-group-toggle").forEach(btn => {
    btn.addEventListener("click", () => {
      const groupId = btn.dataset.group;
      const subContainer = document.getElementById(`submenus-${groupId}`);
      const chevron = btn.querySelector(".group-chevron");
      if (subContainer) {
        const isHidden = subContainer.classList.contains("hidden");
        if (isHidden) {
          subContainer.classList.remove("hidden");
          if (chevron) chevron.style.transform = "rotate(0deg)";
        } else {
          subContainer.classList.add("hidden");
          if (chevron) chevron.style.transform = "rotate(-90deg)";
        }
      }
    });
  });

  // Mobile sidebar controls
  function openMobileSidebar() {
    if (!appSidebar || !sidebarBackdrop) return;
    appSidebar.classList.remove("-translate-x-full");
    sidebarBackdrop.classList.remove("hidden");
    document.body.classList.add("overflow-hidden", "md:overflow-auto");
  }

  function closeMobileSidebar() {
    if (!appSidebar || !sidebarBackdrop) return;
    appSidebar.classList.add("-translate-x-full");
    sidebarBackdrop.classList.add("hidden");
    document.body.classList.remove("overflow-hidden", "md:overflow-auto");
  }

  btnToggleSidebarMobile?.addEventListener("click", openMobileSidebar);
  btnCloseSidebarMobile?.addEventListener("click", closeMobileSidebar);
  sidebarBackdrop?.addEventListener("click", closeMobileSidebar);

  // Router halaman utama
  let activePageId = items[0]?.id || "lembaga_info";

  async function navigateToPage(pageId) {
    activePageId = pageId;

    // Cari info menu
    let pageMeta = items.find(m => m.id === pageId);
    if (pageId === "profile") {
      pageMeta = {
        id: "profile",
        label: "Profil & Sandi Saya",
        icon: "👤",
        subtitle: "Pengaturan Akun, Informasi Kontak, dan Keamanan Kata Sandi"
      };
    } else if (!pageMeta) {
      pageMeta = items[0];
    }

    // Jika menu berada dalam grup, buka accordion grupnya secara otomatis
    const activeBtn = document.querySelector(`.sidebar-nav-item[data-page="${pageId}"]`);
    if (activeBtn) {
      const parentGroup = activeBtn.dataset.group;
      if (parentGroup) {
        const subContainer = document.getElementById(`submenus-${parentGroup}`);
        if (subContainer && subContainer.classList.contains("hidden")) {
          subContainer.classList.remove("hidden");
          const groupBtn = document.querySelector(`.btn-group-toggle[data-group="${parentGroup}"] .group-chevron`);
          if (groupBtn) groupBtn.style.transform = "rotate(0deg)";
        }
      }
    }

    // Update Topbar
    if (topbarPageTitle) topbarPageTitle.textContent = pageMeta.label;
    if (topbarPageSubtitle) topbarPageSubtitle.textContent = pageMeta.subtitle;

    // Update styling tombol aktif di sidebar
    document.querySelectorAll(".sidebar-nav-item").forEach(btn => {
      const isTarget = btn.dataset.page === pageId;
      if (isTarget) {
        btn.className = "sidebar-nav-item w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[11px] font-bold bg-white/20 text-white shadow-xs ring-1 ring-white/20 transition text-left cursor-pointer";
      } else {
        btn.className = "sidebar-nav-item w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[11px] font-medium text-emerald-100/75 hover:bg-white/10 hover:text-white transition text-left cursor-pointer";
      }
    });

    // Indikator loading singkat di main canvas
    if (mainPageContainer) {
      mainPageContainer.innerHTML = `
        <div class="p-12 text-center text-slate-400">
          <span class="inline-block animate-spin text-2xl mb-2">⏳</span>
          <p class="text-xs">Memuat halaman ${pageMeta.label}...</p>
        </div>
      `;

      try {
        if (pageId === "profile") {
          renderProfileCanvas(mainPageContainer, profile || activeProfileState);
        } else if (typeof roleModule?.renderPage === "function") {
          await roleModule.renderPage(pageId, mainPageContainer, profile);
        } else if (typeof roleModule?.render === "function") {
          await roleModule.render(mainPageContainer, profile);
        }
      } catch (err) {
        console.error("Gagal merender halaman:", err);
        mainPageContainer.innerHTML = `
          <div class="p-8 rounded-2xl bg-red-50 border border-red-200 text-red-900 text-xs">
            <h4 class="font-bold text-sm">Gagal Menampilkan Halaman</h4>
            <p class="mt-1">${err?.message || "Terjadi kesalahan saat memuat tampilan halaman."}</p>
          </div>
        `;
      }
    }

    // Tutup mobile drawer jika terbuka
    closeMobileSidebar();
  }

  // Pasang global jump hook
  window.navigateToPage = navigateToPage;

  // Klik tombol menu di sidebar
  document.querySelectorAll(".sidebar-nav-item").forEach(btn => {
    btn.addEventListener("click", () => {
      const page = btn.dataset.page;
      navigateToPage(page);
    });
  });

  // Tombol Profil di sidebar dan topbar
  document.getElementById("btn-sidebar-profile")?.addEventListener("click", () => {
    navigateToPage("profile");
  });
  document.getElementById("topbar-btn-profile")?.addEventListener("click", () => {
    navigateToPage("profile");
  });

  // Tombol Logout di sidebar
  document.getElementById("btn-sidebar-logout")?.addEventListener("click", async () => {
    await signOut();
    window.location.replace("login.html");
  });

  // Buka halaman default pertama kali
  navigateToPage(items[0]?.id || "lembaga_info");
}

// ============================================================================
// MAIN APPLICATION INITIALIZER
// ============================================================================

async function loadDashboard() {
  clearError();
  if (!isSupabaseConfigured) {
    showError("Supabase belum dikonfigurasi. Hubungi administrator madrasah.");
    return;
  }

  try {
    const profile = await getCurrentProfile();

    if (!profile) {
      window.location.replace("login.html");
      return;
    }

    activeProfileState = profile;

    // Normalisasi role (operator & superadmin)
    const rawRole = profile.role;
    if (!rawRole || rawRole === "unassigned") {
      if (mainPageContainer) {
        mainPageContainer.innerHTML = `
          <article class="rounded-3xl border border-amber-200 bg-amber-50 p-8 text-amber-900 shadow-sm max-w-xl mx-auto text-center space-y-3">
            <div class="text-4xl">⏳</div>
            <h3 class="text-lg font-black">Akun Menunggu Penugasan Peran (Role)</h3>
            <p class="text-xs leading-relaxed text-amber-800">
              Akun Anda telah berhasil terdaftar dan masuk, namun belum diberikan hak akses (Kepala Madrasah, Guru, Siswa, dll.) oleh Operator. Silakan hubungi Administrator Madrasah.
            </p>
          </article>
        `;
      }
      return;
    }

    const targetRole = (rawRole === "superadmin" || rawRole === "operator") ? "operator" : rawRole;

    try {
      const roleModule = await import(`./roles/${targetRole}.js`);
      setupSidebarNavigation(profile, roleModule);
    } catch (err) {
      console.error(`Gagal memuat modul peran: ${targetRole}`, err);
      showError(`Modul untuk peran "${targetRole}" tidak dapat dimuat atau belum tersedia.`);
    }

  } catch (error) {
    console.error("Dashboard error:", error);
    showError(`Dashboard mengalami kendala saat dimuat (${error?.message || "Koneksi terputus"}). Silakan muat ulang halaman atau login kembali.`);
  }
}

loadDashboard();
