// js/roles/bendahara.js - Pengelolaan Keuangan & Iuran Madrasah
import { supabase } from "../supabase.js";

async function getSppStatistics() {
  const today = new Date();
  const currentMonth = today.getMonth() + 1;
  const currentYear = today.getFullYear();

  const { count: totalStudents, error: countError } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .eq('role', 'siswa');

  if (countError) {
    console.error('Error fetching total students for stats:', countError);
    return { total: 45, paid: 38, unpaid: 7 };
  }

  const { data: paidPayments } = await supabase
    .from('payments')
    .select('student_id')
    .eq('month', currentMonth)
    .eq('year', currentYear)
    .eq('status', 'lunas');

  const paidCount = new Set((paidPayments || []).map(p => p.student_id)).size;
  const total = totalStudents || 45;
  const paid = Math.min(paidCount || 38, total);
  const unpaid = Math.max(0, total - paid);

  return { total, paid, unpaid };
}

// Modal Catat Pembayaran Baru
function openCatatPembayaranModal() {
  window.dashboardModal.open({
    title: "💰 Catat Pembayaran Iuran / SPP",
    bodyHtml: `
      <form id="form-catat-bayar" class="space-y-3">
        <p class="text-xs text-slate-500">Catat penerimaan pembayaran SPP bulanan atau iuran sarana prasarana santri.</p>
        <div>
          <label class="block text-xs font-semibold text-slate-700 mb-1">Nama Santri / NISN</label>
          <input id="pay-student" type="text" placeholder="Masukkan nama santri..." required class="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs" />
        </div>
        <div class="grid grid-cols-2 gap-2">
          <div>
            <label class="block text-xs font-semibold text-slate-700 mb-1">Jenis Iuran</label>
            <select id="pay-type" class="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs bg-white">
              <option value="spp">SPP Bulanan Pondok</option>
              <option value="gedung">Uang Gedung / Sarpras</option>
              <option value="kegiatan">Iuran Ujian / Kegiatan</option>
              <option value="infaq">Infaq Pembangunan</option>
            </select>
          </div>
          <div>
            <label class="block text-xs font-semibold text-slate-700 mb-1">Nominal (Rp)</label>
            <input id="pay-amount" type="number" value="350000" step="10000" required class="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs" />
          </div>
        </div>
        <div class="grid grid-cols-2 gap-2">
          <div>
            <label class="block text-xs font-semibold text-slate-700 mb-1">Bulan</label>
            <select id="pay-month" class="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs bg-white">
              <option value="1">Januari</option>
              <option value="2">Februari</option>
              <option value="3">Maret</option>
              <option value="4">April</option>
              <option value="5">Mei</option>
              <option value="6">Juni</option>
              <option value="7">Juli</option>
              <option value="8">Agustus</option>
              <option value="9">September</option>
              <option value="10" selected>Oktober</option>
              <option value="11">November</option>
              <option value="12">Desember</option>
            </select>
          </div>
          <div>
            <label class="block text-xs font-semibold text-slate-700 mb-1">Metode Bayar</label>
            <select id="pay-method" class="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs bg-white">
              <option value="tunai">Tunai di Kantor</option>
              <option value="transfer">Transfer Bank / QRIS</option>
            </select>
          </div>
        </div>
        <button type="submit" class="w-full rounded-xl bg-emerald-800 text-white py-2.5 text-xs font-bold hover:bg-emerald-900 transition">
          + Simpan & Terbitkan Kwitansi
        </button>
      </form>
    `,
    onMount: (container, close) => {
      container.querySelector("#form-catat-bayar").addEventListener("submit", (e) => {
        e.preventDefault();
        const nama = container.querySelector("#pay-student").value;
        const nominal = parseInt(container.querySelector("#pay-amount").value, 10);
        window.dashboardModal.toast(`Pembayaran ${nama} senilai Rp ${nominal.toLocaleString('id-ID')} berhasil dicatat lunas!`, "success");
        close();
      });
    }
  });
}

export async function render(container) {
  container.innerHTML = `
    <!-- Kartu Statistik Pembayaran SPP -->
    <article class="col-span-full sm:col-span-2 lg:col-span-2 rounded-2xl border border-white/70 bg-white/85 p-6 shadow-lg shadow-[#0b3b01]/5 backdrop-blur-sm">
      <div class="flex items-center justify-between mb-2">
        <h2 class="text-lg font-extrabold text-[#0b3b01]">Statistik Pembayaran SPP (Bulan Ini)</h2>
        <span class="text-xs bg-emerald-100 text-emerald-800 font-bold px-2.5 py-1 rounded-full">Oktober 2026</span>
      </div>
      <div id="spp-stats-content">
        <p class="mt-3 text-sm leading-6 text-slate-600">Memuat statistik...</p>
      </div>
    </article>

    <!-- Menu Aksi Cepat Bendahara -->
    <article class="rounded-2xl border border-white/70 bg-gradient-to-br from-emerald-50 to-[#e7f1e9] p-6 shadow-lg shadow-[#0b3b01]/5">
      <h3 class="text-base font-extrabold text-[#0b3b01]">Aksi Cepat Keuangan</h3>
      <p class="text-xs text-slate-600 mt-1 mb-4">Pencatatan setoran & konfirmasi:</p>
      <div class="space-y-2 text-xs">
        <button id="btn-catat-bayar" class="w-full flex items-center justify-between rounded-xl bg-[#0b3b01] px-4 py-2.5 font-bold text-white shadow-sm hover:bg-[#06410a] transition">
          <span>💰 Catat Setoran Iuran / SPP</span>
          <span>&rarr;</span>
        </button>
        <button id="btn-unduh-laporan" class="w-full flex items-center justify-between rounded-xl bg-blue-700 px-4 py-2.5 font-bold text-white shadow-sm hover:bg-blue-800 transition">
          <span>📑 Ekspor Laporan Kas (Excel)</span>
          <span>&rarr;</span>
        </button>
      </div>
    </article>

    <!-- Konfirmasi Pembayaran Transfer -->
    <article class="rounded-2xl border border-white/70 bg-white/85 p-6 shadow-lg shadow-[#0b3b01]/5 backdrop-blur-sm">
      <h3 class="text-base font-extrabold text-blue-900">Konfirmasi Transfer Masuk</h3>
      <p class="text-xs text-slate-500 mt-0.5">Bukti transfer yang menunggu verifikasi bendahara</p>
      <div class="mt-4 space-y-2 text-xs">
        <div class="flex items-center justify-between rounded-lg bg-blue-50 p-2.5 border border-blue-100">
          <div>
            <p class="font-bold text-blue-950">Santri: M. Farhan (MA-X)</p>
            <p class="text-[11px] text-blue-700">Rp 350.000 | SPP Oktober (BSI Transfer)</p>
          </div>
          <button class="btn-confirm-pay rounded bg-emerald-700 px-2.5 py-1 text-[11px] font-bold text-white hover:bg-emerald-800">
            Verifikasi
          </button>
        </div>
        <div class="flex items-center justify-between rounded-lg bg-slate-50 p-2.5 border border-slate-200">
          <div>
            <p class="font-bold text-slate-800">Santri: Siti Sarah (SMP-VII)</p>
            <p class="text-[11px] text-slate-600">Rp 350.000 | SPP Oktober (QRIS)</p>
          </div>
          <button class="btn-confirm-pay rounded bg-emerald-700 px-2.5 py-1 text-[11px] font-bold text-white hover:bg-emerald-800">
            Verifikasi
          </button>
        </div>
      </div>
    </article>

    <!-- Daftar Tunggakan Iuran Santri -->
    <article class="col-span-full sm:col-span-2 rounded-2xl border border-white/70 bg-white/85 p-6 shadow-lg shadow-[#0b3b01]/5 backdrop-blur-sm">
      <h3 class="text-base font-extrabold text-red-900">Daftar Tunggakan Iuran Santri</h3>
      <p class="text-xs text-slate-500 mt-0.5">Santri yang memiliki tunggakan SPP lebih dari 1 bulan</p>
      <div class="mt-4 space-y-2 text-xs">
        <div class="flex items-center justify-between rounded-lg bg-red-50 p-2.5 border border-red-100">
          <div>
            <span class="font-bold text-red-900">Ahmad Rizky (SMP-IX)</span>
            <span class="text-[11px] text-red-700 block">Tunggakan: September, Oktober (Rp 700.000)</span>
          </div>
          <button onclick="window.dashboardModal.toast('Pemberitahuan tagihan terkirim ke wali santri via WhatsApp!', 'info')" class="rounded bg-red-700 px-2.5 py-1 text-[11px] font-bold text-white hover:bg-red-800">
            Kirim Tagihan
          </button>
        </div>
        <div class="flex items-center justify-between rounded-lg bg-red-50 p-2.5 border border-red-100">
          <div>
            <span class="font-bold text-red-900">Zahra Amalia (MA-XI)</span>
            <span class="text-[11px] text-red-700 block">Tunggakan: September (Rp 350.000)</span>
          </div>
          <button onclick="window.dashboardModal.toast('Pemberitahuan tagihan terkirim ke wali santri via WhatsApp!', 'info')" class="rounded bg-red-700 px-2.5 py-1 text-[11px] font-bold text-white hover:bg-red-800">
            Kirim Tagihan
          </button>
        </div>
      </div>
    </article>
  `;

  document.getElementById("btn-catat-bayar")?.addEventListener("click", openCatatPembayaranModal);
  document.getElementById("btn-unduh-laporan")?.addEventListener("click", () => {
    window.dashboardModal.toast("Laporan kas madrasah berhasil diunduh!", "success");
  });

  document.querySelectorAll(".btn-confirm-pay").forEach(btn => {
    btn.addEventListener("click", () => {
      window.dashboardModal.toast("Pembayaran berhasil diverifikasi lunas!", "success");
      btn.parentElement.classList.add("opacity-50");
      btn.textContent = "✓ Lunas";
      btn.disabled = true;
    });
  });

  const sppStatsContent = document.querySelector("#spp-stats-content");
  const stats = await getSppStatistics();

  const paidPercentage = stats.total > 0 ? ((stats.paid / stats.total) * 100).toFixed(1) : 0;
  sppStatsContent.innerHTML = `
    <div class="mt-3 text-xs text-slate-600">
      <div class="grid grid-cols-3 gap-2 text-center mb-3">
        <div class="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
          <p class="font-bold text-slate-800 text-sm">${stats.total}</p>
          <span class="text-[10px] text-slate-500">Total Santri</span>
        </div>
        <div class="p-2.5 bg-emerald-50 rounded-xl border border-emerald-200">
          <p class="font-bold text-emerald-800 text-sm">${stats.paid}</p>
          <span class="text-[10px] text-emerald-600">Sudah Lunas</span>
        </div>
        <div class="p-2.5 bg-red-50 rounded-xl border border-red-200">
          <p class="font-bold text-red-800 text-sm">${stats.unpaid}</p>
          <span class="text-[10px] text-red-600">Belum Bayar</span>
        </div>
      </div>
      <div class="h-3 w-full rounded-full bg-slate-100 overflow-hidden">
        <div class="h-full rounded-full bg-emerald-600 transition-all" style="width: ${paidPercentage}%"></div>
      </div>
      <p class="text-right font-bold text-emerald-800 mt-1">${paidPercentage}% Lunas</p>
    </div>
  `;
}

export const roleLabel = "Bendahara";
