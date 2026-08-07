// js/roles/superadmin.js
import { render as renderOperatorDashboard } from "./operator.js";

export async function render(container) {
  // Render the base Operator dashboard first
  await renderOperatorDashboard(container);

  // Now, append the Superadmin specific widgets
  const superadminContainer = document.createElement('div');
  superadminContainer.className = "col-span-full grid gap-5 sm:grid-cols-2 lg:grid-cols-3 mt-8";
  superadminContainer.innerHTML = `
    <article class="rounded-2xl border border-white/70 bg-white/85 p-6 shadow-lg shadow-[#0b3b01]/5 backdrop-blur-sm">
      <h2 class="text-lg font-extrabold text-[#0b3b01]">Manajemen Akses Operator</h2>
      <p class="mt-3 text-sm leading-6 text-slate-600">Memberikan atau mencabut hak akses 'Operator' kepada pengguna lain.</p>
      <div class="mt-4">
        <a href="#" class="font-semibold text-[#00895f] hover:underline">Kelola Akses &rarr;</a>
      </div>
    </article>
    <article class="rounded-2xl border border-white/70 bg-white/85 p-6 shadow-lg shadow-[#0b3b01]/5 backdrop-blur-sm">
      <h2 class="text-lg font-extrabold text-[#0b3b01]">Log Audit Sistem</h2>
      <p class="mt-3 text-sm leading-6 text-slate-600">Melihat log aktivitas krusial di seluruh sistem.</p>
       <div class="mt-4">
        <a href="#" class="font-semibold text-[#00895f] hover:underline">Lihat Log &rarr;</a>
      </div>
    </article>
    <article class="rounded-2xl border border-white/70 bg-white/85 p-6 shadow-lg shadow-[#0b3b01]/5 backdrop-blur-sm">
      <h2 class="text-lg font-extrabold text-[#0b3b01]">Konfigurasi Sistem Global</h2>
      <p class="mt-3 text-sm leading-6 text-slate-600">Mengubah pengaturan tingkat tinggi aplikasi.</p>
      <div class="mt-4">
        <a href="#" class="font-semibold text-[#00895f] hover:underline">Konfigurasi &rarr;</a>
      </div>
    </article>
  `;
  container.appendChild(superadminContainer);
}

export const roleLabel = "Superadmin";
