import { getCurrentProfile, signOut } from "./auth.js";
import { isSupabaseConfigured } from "./supabase.js";
import { loadNavbar } from "./navbar.js";

const dashboardName = document.querySelector("#dashboard-name");
const dashboardRole = document.querySelector("#dashboard-role");
const dashboardMenu = document.querySelector("#dashboard-menu");
const dashboardRoleContent = document.querySelector("#dashboard-role-content");
const dashboardError = document.querySelector("#dashboard-error");

function showError(message) {
  dashboardError.textContent = message;
  dashboardError.hidden = false;
  dashboardError.classList.remove("hidden");
}


function clearError() {
  dashboardError.textContent = "";
  dashboardError.hidden = true;
  dashboardError.classList.add("hidden");
}

function renderCommonWidgets() {
  dashboardMenu.innerHTML = `
    <article class="rounded-2xl border border-white/70 bg-white/85 p-6 shadow-lg shadow-[#0b3b01]/5 backdrop-blur-sm">
      <h2 class="text-lg font-extrabold text-[#0b3b01]">Papan Informasi Umum</h2>
      <p class="mt-3 text-sm leading-6 text-slate-600">Pengumuman penting dari Operator atau Kepala Madrasah.</p>
    </article>
    <article class="rounded-2xl border border-white/70 bg-white/85 p-6 shadow-lg shadow-[#0b3b01]/5 backdrop-blur-sm">
      <h2 class="text-lg font-extrabold text-[#0b3b01]">Kalender Kegiatan</h2>
      <p class="mt-3 text-sm leading-6 text-slate-600">Kegiatan penting pesantren (ujian, hari libur, acara).</p>
    </article>
    <article class="rounded-2xl border border-white/70 bg-white/85 p-6 shadow-lg shadow-[#0b3b01]/5 backdrop-blur-sm">
      <h2 class="text-lg font-extrabold text-[#0b3b01]">Akses Cepat</h2>
      <p class="mt-3 text-sm leading-6 text-slate-600">Tombol/link menuju halaman penting lainnya.</p>
      <div class="mt-4 flex flex-col space-y-2">
        <a href="#" class="text-[#00895f] hover:underline">Profil Saya</a>
        <a href="#" class="text-[#00895f] hover:underline">Ganti Password</a>
        <button id="logout-button" class="w-fit text-left text-[#00895f] hover:underline">Logout</button>
      </div>
    </article>
  `;

  document.getElementById("logout-button").addEventListener("click", async () => {
    await signOut();
    window.location.replace("login.html");
  });
}

async function loadRoleDashboard(role) {
  try {
    const roleModule = await import(`./roles/${role}.js`);
    
    dashboardRole.textContent = roleModule.roleLabel || role;
    dashboardRoleContent.innerHTML = ''; // Clear previous role content
    roleModule.render(dashboardRoleContent);

  } catch (err) {
    console.error(`Gagal memuat modul untuk peran: ${role}`, err);
    dashboardRoleContent.innerHTML = '';
    showError("Tampilan untuk peran Anda tidak dapat dimuat atau tidak ditemukan.");
  }
}

async function loadDashboard() {
  clearError();
  if (!isSupabaseConfigured) {
    showError("Supabase belum dikonfigurasi. Hubungi administrator.");
    return;
  }

  try {
    await loadNavbar();
    const profile = await getCurrentProfile();

    if (!profile) {
      window.location.replace("login.html");
      return;
    }

    dashboardName.textContent = profile.full_name || "Pengguna Darunnajah";
    renderCommonWidgets(); // Render common widgets for all roles
    await loadRoleDashboard(profile.role);

  } catch (error) {
    if (error?.code === "PGRST116") {
      window.location.replace("login.html");
      return;
    }
    showError("Dashboard tidak dapat dimuat. Silakan coba lagi.");
  }
}

loadDashboard();
