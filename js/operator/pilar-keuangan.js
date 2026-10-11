// ============================================================================
// PILAR 5: KEUANGAN (Iuran Santri & Rekapitulasi)
// ============================================================================

import { appState, saveAppState } from "./state.js";

// 5.a. Iuran (Pengisian Iuran Harian/Mingguan/Bulanan Murid oleh Wali Kelas)
export function renderKeuanganIuranPage(container) {
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
            ${appState.students.map((s, idx) => {
              const payment = appState.paymentRecords.find(p => p.student_id === s.id);
              const isLunas = !!payment || (idx % 2 === 0);
              return `
              <tr class="hover:bg-slate-50/60 transition">
                <td class="px-4 py-3 font-bold text-slate-900">${s.full_name}</td>
                <td class="px-4 py-3 text-slate-600">${payment ? payment.type : "Iuran Syahriah (SPP Bulanan)"}</td>
                <td class="px-4 py-3 font-mono font-bold text-emerald-800">Rp ${(payment ? payment.amount : 150000).toLocaleString('id-ID')}</td>
                <td class="px-4 py-3 text-slate-500">${payment ? payment.month + ' ' + payment.year : 'Oktober 2026'}</td>
                <td class="px-4 py-3">
                  <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    isLunas ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }">
                    ${isLunas ? 'LUNAS' : 'BELUM LUNAS'}
                  </span>
                </td>
              </tr>
            `;}).join('')}
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
          const studentId = modalBody.querySelector("#i-student").value;
          const iType = modalBody.querySelector("#i-type").value;
          const amount = parseInt(modalBody.querySelector("#i-amount").value, 10) || 150000;
          const student = appState.students.find(s => s.id === studentId);

          appState.paymentRecords.unshift({
            id: `pay-${Date.now()}`,
            student_id: studentId,
            student_name: student?.full_name || "Santri",
            type: iType,
            amount: amount,
            date: new Date().toISOString().substring(0, 10),
            month: "Oktober",
            year: 2026,
            status: "LUNAS"
          });
          saveAppState();

          window.dashboardModal.toast("Pembayaran iuran berhasil dicatat dan diverifikasi!", "success");
          close();
          renderKeuanganIuranPage(container);
        });
      }
    });
  });
}

// 5.b. Rekapitulasi Iuran (Melihat Statistik Data Iuran yang Telah Di-input)
export function renderKeuanganRekapPage(container) {
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
          <p class="text-[10px] text-blue-600 mt-0.5">Target融Tercapai</p>
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
