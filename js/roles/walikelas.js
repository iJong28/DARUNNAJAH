// js/roles/walikelas.js - Dashboard Wali Kelas Madrasah
import { supabase } from "../supabase.js";
import { getCurrentProfile } from "../auth.js";
import { render as renderGuruDashboard } from "./guru.js";

async function getClassForWaliKelas(teacherId) {
  const { data, error } = await supabase
    .from('classes')
    .select('id, name')
    .eq('teacher_id', teacherId)
    .maybeSingle();

  if (error) {
    console.error('Error fetching class for wali kelas:', error);
    return null;
  }
  return data;
}

// Modal: Pengumuman ke Wali Murid
function openBroadcastModal(className) {
  window.dashboardModal.open({
    title: `📢 Pesan & Pengumuman Wali Murid (${className})`,
    bodyHtml: `
      <form id="form-broadcast" class="space-y-3">
        <p class="text-xs text-slate-500">Kirim informasi akademik atau pengumuman pondok ke kontak wali murid santri binaan.</p>
        <div>
          <label class="block text-xs font-semibold text-slate-700 mb-1">Judul / Perihal</label>
          <input id="broad-title" type="text" placeholder="Misal: Agenda Pertemuan Wali Santri & Pembagian Raport" required class="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs" />
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-700 mb-1">Isi Pesan Informasi</label>
          <textarea id="broad-msg" rows="4" placeholder="Tuliskan isi pesan untuk wali santri..." required class="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"></textarea>
        </div>
        <div class="rounded-lg bg-emerald-50 p-2.5 border border-emerald-100 text-[11px] text-emerald-800">
          💡 Pesan ini akan dicatat di sistem dan dapat disinkronkan ke grup WhatsApp wali murid.
        </div>
        <button type="submit" class="w-full rounded-xl bg-[#0b3b01] text-white py-2.5 text-xs font-bold hover:bg-[#06410a] transition">
          Kirim Pesan ke Wali Santri
        </button>
      </form>
    `,
    onMount: (container, close) => {
      container.querySelector("#form-broadcast").addEventListener("submit", (e) => {
        e.preventDefault();
        window.dashboardModal.toast("Pesan pengumuman berhasil disimpan dan disiarkan!", "success");
        close();
      });
    }
  });
}

// Modal: Input Pembinaan Santri
function openPembinaanModal(santriName) {
  window.dashboardModal.open({
    title: `🛡️ Catatan Pembinaan Santri: ${santriName}`,
    bodyHtml: `
      <form id="form-bina" class="space-y-3">
        <p class="text-xs text-slate-500">Catat konseling, progres hafalan, atau pembinaan kedisiplinan santri.</p>
        <div>
          <label class="block text-xs font-semibold text-slate-700 mb-1">Kategori Pembinaan</label>
          <select class="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs bg-white">
            <option>Kedisiplinan & Tata Tertib</option>
            <option>Peningkatan Akademik / Hafalan</option>
            <option>Konseling Pribadi / Asrama</option>
          </select>
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-700 mb-1">Hasil Bimbingan / Solusi</label>
          <textarea rows="3" placeholder="Catatan bimbingan santri..." required class="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"></textarea>
        </div>
        <button type="submit" class="w-full rounded-xl bg-blue-700 text-white py-2 text-xs font-bold hover:bg-blue-800 transition">
          Simpan Catatan Pembinaan
        </button>
      </form>
    `,
    onMount: (container, close) => {
      container.querySelector("#form-bina").addEventListener("submit", (e) => {
        e.preventDefault();
        window.dashboardModal.toast("Catatan pembinaan santri tersimpan rapi!", "success");
        close();
      });
    }
  });
}

export async function render(container) {
  // Render modul dasar guru terlebih dahulu
  await renderGuruDashboard(container);

  // Widget khusus Wali Kelas
  const waliKelasContainer = document.createElement('div');
  waliKelasContainer.className = "col-span-full grid gap-5 sm:grid-cols-2 lg:grid-cols-3 mt-8";
  waliKelasContainer.innerHTML = `
    <!-- Header Wali Kelas -->
    <div class="col-span-full rounded-2xl bg-gradient-to-r from-emerald-800 to-teal-900 p-5 text-white shadow-md">
      <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <span class="inline-block px-2.5 py-0.5 rounded-full bg-white/20 text-[11px] font-bold text-emerald-100 uppercase tracking-wider">
            Perwalian Kelas
          </span>
          <h3 id="wk-class-title" class="text-xl font-black mt-1">Kelas Perwalian: MA Kelas X (Putra)</h3>
          <p class="text-xs text-white/80 mt-0.5">Memantau absensi, grafik nilai, dan kedisiplinan santri binaan.</p>
        </div>
        <button id="btn-broadcast-wk" class="rounded-xl bg-white text-emerald-950 px-4 py-2 text-xs font-bold shadow-sm hover:bg-emerald-50 transition">
          📢 Kirim Pesan ke Wali Murid
        </button>
      </div>
    </div>

    <!-- Ringkasan Akademik & Kehadiran Kelas -->
    <article class="rounded-2xl border border-white/70 bg-white/85 p-6 shadow-lg shadow-[#0b3b01]/5 backdrop-blur-sm">
      <h3 class="text-base font-extrabold text-[#0b3b01]">Rekapitulasi Kehadiran Kelas</h3>
      <div class="mt-4 space-y-2 text-xs">
        <div class="flex justify-between items-center p-2 rounded-lg bg-emerald-50 border border-emerald-100">
          <span class="font-bold text-emerald-900">Kehadiran Rata-rata</span>
          <span class="font-extrabold text-emerald-700 text-sm">98.2%</span>
        </div>
        <div class="flex justify-between items-center p-2 rounded-lg bg-blue-50 border border-blue-100">
          <span class="font-bold text-blue-900">Total Santri Binaan</span>
          <span class="font-extrabold text-blue-700 text-sm">24 Santri</span>
        </div>
        <div class="flex justify-between items-center p-2 rounded-lg bg-slate-50 border border-slate-200">
          <span class="font-bold text-slate-700">Rata-rata Nilai Semester</span>
          <span class="font-extrabold text-slate-800 text-sm">84.5</span>
        </div>
      </div>
    </article>

    <!-- Pemantauan Kedisiplinan & Pelanggaran Kelas -->
    <article class="rounded-2xl border border-white/70 bg-white/85 p-6 shadow-lg shadow-[#0b3b01]/5 backdrop-blur-sm">
      <h3 class="text-base font-extrabold text-amber-900">Kedisiplinan & Poin Tatib</h3>
      <p class="text-xs text-slate-600 mt-1">Santri kelas yang memerlukan bimbingan khusus:</p>
      <div class="mt-4 space-y-2 text-xs" id="wk-students-attention">
        <div class="flex items-center justify-between rounded-lg bg-amber-50 p-2.5 border border-amber-100">
          <div>
            <p class="font-bold text-amber-950">Ahmad Zaki</p>
            <p class="text-[11px] text-amber-800">2x Terlambat Sholat Subuh (10 Poin)</p>
          </div>
          <button class="btn-bina rounded bg-amber-600 px-2 py-1 text-[11px] font-bold text-white hover:bg-amber-700" data-name="Ahmad Zaki">
            Bimbing
          </button>
        </div>
        <div class="flex items-center justify-between rounded-lg bg-emerald-50 p-2.5 border border-emerald-100">
          <div>
            <p class="font-bold text-emerald-950">23 Santri Lainnya</p>
            <p class="text-[11px] text-emerald-700">0 Poin Pelanggaran (Tertib)</p>
          </div>
          <span class="text-emerald-700 font-bold text-xs">✓ Baik</span>
        </div>
      </div>
    </article>

    <!-- Buku Pembinaan Wali Kelas -->
    <article class="rounded-2xl border border-white/70 bg-white/85 p-6 shadow-lg shadow-[#0b3b01]/5 backdrop-blur-sm">
      <h3 class="text-base font-extrabold text-[#0b3b01]">Laporan Wali Santri</h3>
      <p class="text-xs text-slate-600 mt-1">
        Siapkan rekap perkembangan santri untuk laporan berkala kepada orang tua/wali santri pondok.
      </p>
      <div class="mt-4 space-y-2">
        <button onclick="window.dashboardModal.toast('Laporan perkembangan kelas berhasil diunduh!', 'success')" class="w-full rounded-xl border border-emerald-600 bg-emerald-50/50 py-2 text-xs font-bold text-emerald-800 hover:bg-emerald-100 transition">
          📄 Unduh Raport Kedisiplinan & Nilai
        </button>
      </div>
    </article>
  `;

  container.appendChild(waliKelasContainer);

  const className = "MA Kelas X";
  document.getElementById("btn-broadcast-wk")?.addEventListener("click", () => openBroadcastModal(className));

  document.querySelectorAll(".btn-bina").forEach(btn => {
    btn.addEventListener("click", () => openPembinaanModal(btn.dataset.name));
  });
}

export const roleLabel = "Wali Kelas";
