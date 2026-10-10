// js/roles/kepala_madrasah.js - Dashboard Kepala Madrasah Darunnajah
import { supabase } from "../supabase.js";

export async function render(container) {
  container.innerHTML = `
    <!-- Header Pimpinan Madrasah -->
    <article class="col-span-full rounded-2xl border border-white/70 bg-gradient-to-r from-emerald-950 via-[#0b3b01] to-teal-900 p-6 text-white shadow-xl">
      <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span class="inline-block px-3 py-1 rounded-full bg-emerald-700/60 text-xs font-bold uppercase tracking-wider text-emerald-200">
            Laporan Eksekutif Pimpinan
          </span>
          <h2 class="mt-2 text-2xl font-black">Ikhtisar Perkembangan Madrasah</h2>
          <p class="text-xs text-emerald-100/80 mt-1">Laporan terpadu kinerja akademik santri, absensi dewan guru, tata tertib, dan keuangan pondok.</p>
        </div>
        <button id="btn-unduh-eksekutif" class="rounded-xl bg-white text-[#0b3b01] font-bold px-4 py-2 text-xs shadow-sm hover:bg-emerald-50 transition">
          📄 Ekspor Laporan Bulanan
        </button>
      </div>

      <div class="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
        <div class="rounded-xl bg-white/10 p-3 backdrop-blur-xs">
          <p class="text-[11px] uppercase tracking-wider text-emerald-200 font-semibold">Rata-rata Nilai</p>
          <p class="text-2xl font-black mt-1">86.4</p>
        </div>
        <div class="rounded-xl bg-white/10 p-3 backdrop-blur-xs">
          <p class="text-[11px] uppercase tracking-wider text-emerald-200 font-semibold">Tingkat Kehadiran</p>
          <p class="text-2xl font-black mt-1">97.8%</p>
        </div>
        <div class="rounded-xl bg-white/10 p-3 backdrop-blur-xs">
          <p class="text-[11px] uppercase tracking-wider text-emerald-200 font-semibold">Penerimaan SPP</p>
          <p class="text-2xl font-black mt-1">84.4%</p>
        </div>
        <div class="rounded-xl bg-white/10 p-3 backdrop-blur-xs">
          <p class="text-[11px] uppercase tracking-wider text-amber-200 font-semibold">Pelanggaran Berat</p>
          <p class="text-2xl font-black mt-1 text-emerald-300">0 Kasus</p>
        </div>
      </div>
    </article>

    <!-- Ringkasan Akademik & Tahfidz -->
    <article class="rounded-2xl border border-white/70 bg-white/85 p-6 shadow-lg shadow-[#0b3b01]/5 backdrop-blur-sm">
      <h3 class="text-base font-extrabold text-[#0b3b01]">Kinerja Akademik & Tahfidz</h3>
      <p class="text-xs text-slate-500 mt-0.5">Perkembangan kurikulum dan hafalan</p>
      <div class="mt-4 space-y-2.5 text-xs">
        <div class="p-3 rounded-xl bg-emerald-50 border border-emerald-100">
          <div class="flex justify-between items-center font-bold text-emerald-950 mb-1">
            <span>Program Tahfidz Santri</span>
            <span class="text-emerald-700">88% Target</span>
          </div>
          <div class="w-full bg-emerald-200 h-2 rounded-full overflow-hidden">
            <div class="bg-emerald-700 h-full rounded-full" style="width: 88%"></div>
          </div>
        </div>
        <div class="p-3 rounded-xl bg-blue-50 border border-blue-100">
          <div class="flex justify-between items-center font-bold text-blue-950 mb-1">
            <span>Kurikulum Madrasah Aliyah & SMP IT</span>
            <span class="text-blue-700">92% Berjalan</span>
          </div>
          <div class="w-full bg-blue-200 h-2 rounded-full overflow-hidden">
            <div class="bg-blue-700 h-full rounded-full" style="width: 92%"></div>
          </div>
        </div>
      </div>
    </article>

    <!-- Laporan Kedisiplinan & Tata Tertib Santri -->
    <article class="rounded-2xl border border-white/70 bg-white/85 p-6 shadow-lg shadow-[#0b3b01]/5 backdrop-blur-sm">
      <h3 class="text-base font-extrabold text-amber-900">Laporan Kedisiplinan Santri</h3>
      <p class="text-xs text-slate-500 mt-0.5">Pantauan tata tertib santri di asrama & kelas</p>
      <div class="mt-4 space-y-2 text-xs">
        <div class="flex justify-between items-center p-2.5 rounded-lg bg-emerald-50 border border-emerald-100">
          <span class="font-bold text-emerald-950">Santri Tertib (0 Poin)</span>
          <span class="font-extrabold text-emerald-700">95% Santri</span>
        </div>
        <div class="flex justify-between items-center p-2.5 rounded-lg bg-amber-50 border border-amber-100">
          <span class="font-bold text-amber-950">Pelanggaran Ringan (Terlambat dll)</span>
          <span class="font-extrabold text-amber-700">5% Santri</span>
        </div>
        <div class="flex justify-between items-center p-2.5 rounded-lg bg-emerald-50 border border-emerald-100">
          <span class="font-bold text-emerald-950">Pelanggaran Berat</span>
          <span class="font-extrabold text-emerald-700">Nihil (0)</span>
        </div>
      </div>
    </article>

    <!-- Ringkasan Keuangan Madrasah -->
    <article class="rounded-2xl border border-white/70 bg-white/85 p-6 shadow-lg shadow-[#0b3b01]/5 backdrop-blur-sm">
      <h3 class="text-base font-extrabold text-emerald-900">Ringkasan SPP & Arus Kas</h3>
      <p class="text-xs text-slate-500 mt-0.5">Status penerimaan iuran madrasah</p>
      <div class="mt-4 p-3 rounded-xl bg-emerald-50 border border-emerald-100 text-xs">
        <p class="text-slate-600">Total Kas Terverifikasi Bulan Ini:</p>
        <p class="text-xl font-black text-emerald-800 mt-1">Rp 15.750.000</p>
        <p class="text-[11px] text-emerald-700 mt-1">Dikelola dan dipertanggungjawabkan oleh Bendahara.</p>
      </div>
      <div class="mt-3">
        <button onclick="window.dashboardModal.toast('Laporan keuangan telah diverifikasi!', 'success')" class="w-full py-2 bg-emerald-800 text-white rounded-lg text-xs font-bold hover:bg-emerald-900 transition">
          Verifikasi Laporan Keuangan
        </button>
      </div>
    </article>

    <!-- Persetujuan Dokumen & Pengajuan -->
    <article class="col-span-full rounded-2xl border border-white/70 bg-white/85 p-6 shadow-lg shadow-[#0b3b01]/5 backdrop-blur-sm">
      <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-3">
        <div>
          <h3 class="text-base font-extrabold text-[#0b3b01]">Alur Persetujuan & Disposisi Dokumen</h3>
          <p class="text-xs text-slate-500">Pengajuan kegiatan, surat izin, dan anggaran yang membutuhkan tandatangan Kepala Madrasah</p>
        </div>
      </div>
      <div class="space-y-2 text-xs">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 gap-2">
          <div>
            <p class="font-bold text-slate-900">Proposal Pengadaan Kitab & Buku Perpustakaan Santri</p>
            <p class="text-[11px] text-slate-500">Diajukan oleh: Bagian Kurikulum & Pengajaran | Anggaran: Rp 2.500.000</p>
          </div>
          <div class="flex gap-2">
            <button class="btn-acc px-3 py-1.5 rounded-lg bg-emerald-700 text-white font-bold hover:bg-emerald-800">
              Setujui (ACC)
            </button>
            <button class="btn-tolak px-3 py-1.5 rounded-lg bg-slate-200 text-slate-700 font-bold hover:bg-slate-300">
              Tinjau
            </button>
          </div>
        </div>
        <div class="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 gap-2">
          <div>
            <p class="font-bold text-slate-900">Surat Pengantar Lomba Pidato Bahasa Arab & Tahfidz Tingkat Kabupaten</p>
            <p class="text-[11px] text-slate-500">Diajukan oleh: Pembina Santri Berprestasi | 4 Peserta Santri</p>
          </div>
          <div class="flex gap-2">
            <button class="btn-acc px-3 py-1.5 rounded-lg bg-emerald-700 text-white font-bold hover:bg-emerald-800">
              Setujui (ACC)
            </button>
            <button class="btn-tolak px-3 py-1.5 rounded-lg bg-slate-200 text-slate-700 font-bold hover:bg-slate-300">
              Tinjau
            </button>
          </div>
        </div>
      </div>
    </article>
  `;

  document.getElementById("btn-unduh-eksekutif")?.addEventListener("click", () => {
    window.dashboardModal.toast("Laporan eksekutif madrasah berhasil diunduh!", "success");
  });

  document.querySelectorAll(".btn-acc").forEach(btn => {
    btn.addEventListener("click", () => {
      window.dashboardModal.toast("Dokumen / Proposal telah disetujui oleh Kepala Madrasah!", "success");
      btn.textContent = "✓ Disetujui";
      btn.disabled = true;
    });
  });

  document.querySelectorAll(".btn-tolak").forEach(btn => {
    btn.addEventListener("click", () => {
      window.dashboardModal.toast("Dokumen diteruskan untuk revisi.", "info");
    });
  });
}

export const roleLabel = "Kepala Madrasah";
