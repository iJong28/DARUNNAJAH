// js/roles/operator.js
import { supabase } from "../supabase.js";

async function getSystemStats() {
    const { count, error } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

    if (error) {
        console.error('Error fetching system stats:', error);
        return { totalUsers: 'N/A' };
    }
    return { totalUsers: count };
}

export async function render(container) {
  container.innerHTML = `
    <article class="rounded-2xl border border-white/70 bg-white/85 p-6 shadow-lg shadow-[#0b3b01]/5 backdrop-blur-sm">
      <h2 class="text-lg font-extrabold text-[#0b3b01]">Manajemen Pengguna</h2>
      <p class="mt-3 text-sm leading-6 text-slate-600">Akses cepat untuk menambah, mengubah, atau menonaktifkan akun pengguna.</p>
      <div class="mt-4">
        <a href="#" class="font-semibold text-[#00895f] hover:underline">Kelola Pengguna &rarr;</a>
      </div>
    </article>
    <article class="rounded-2xl border border-white/70 bg-white/85 p-6 shadow-lg shadow-[#0b3b01]/5 backdrop-blur-sm">
      <h2 class="text-lg font-extrabold text-[#0b3b01]">Manajemen Konten</h2>
      <p class="mt-3 text-sm leading-6 text-slate-600">Buat pengumuman baru untuk ditampilkan di papan informasi umum.</p>
       <div class="mt-4">
        <a href="#" class="font-semibold text-[#00895f] hover:underline">Buat Pengumuman &rarr;</a>
      </div>
    </article>
    <article id="system-stats-widget" class="rounded-2xl border border-white/70 bg-white/85 p-6 shadow-lg shadow-[#0b3b01]/5 backdrop-blur-sm">
      <h2 class="text-lg font-extrabold text-[#0b3b01]">Statistik Sistem</h2>
      <div id="system-stats-content">
        <p class="mt-3 text-sm leading-6 text-slate-600">Memuat statistik...</p>
      </div>
    </article>
    <article class="rounded-2xl border border-white/70 bg-white/85 p-6 shadow-lg shadow-[#0b3b01]/5 backdrop-blur-sm">
      <h2 class="text-lg font-extrabold text-[#0b3b01]">Manajemen Data Master</h2>
      <p class="mt-3 text-sm leading-6 text-slate-600">Pengelolaan data kelas, mata pelajaran, dan tahun ajaran.</p>
      <div class="mt-4">
        <a href="#" class="font-semibold text-[#00895f] hover:underline">Kelola Data Master &rarr;</a>
      </div>
    </article>
  `;

  const systemStatsContent = document.querySelector("#system-stats-content");

  try {
    const stats = await getSystemStats();
    systemStatsContent.innerHTML = `
        <p class="mt-3 text-sm text-slate-600">Total Pengguna Terdaftar: <span class="font-bold text-2xl text-slate-800">${stats.totalUsers}</span></p>
    `;
  } catch (error) {
    systemStatsContent.innerHTML = `<p class="mt-3 text-sm leading-6 text-red-600">Gagal memuat statistik sistem.</p>`;
  }
}

export const roleLabel = "Operator";
