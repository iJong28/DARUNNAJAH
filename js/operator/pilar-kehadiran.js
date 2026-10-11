// ============================================================================
// PILAR 4: KEHADIRAN (Presensi Harian & Rekapitulasi)
// ============================================================================

import { appState, saveAppState } from "./state.js";

// 4.a. Absen (Mengisi Kehadiran Murid per Kelas)
export function renderKehadiranAbsenPage(container) {
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
      const records = [];
      studentsInClass.forEach(s => {
        const checkedRadio = container.querySelector(`input[name="att_${s.id}"]:checked`);
        records.push({
          id: `att-${Date.now()}-${s.id}`,
          student_id: s.id,
          student_name: s.full_name,
          class_id: selectedClassId,
          date: selectedDate,
          status: checkedRadio ? checkedRadio.value : "hadir"
        });
      });
      appState.attendanceRecords = [
        ...appState.attendanceRecords.filter(r => !(r.class_id === selectedClassId && r.date === selectedDate)),
        ...records
      ];
      saveAppState();
      window.dashboardModal.toast(`Presensi ${studentsInClass.length} santri berhasil disimpan!`, "success");
    });
  }

  renderView();
}

// 4.b. Rekapitulasi Kehadiran (Statistik & Rekap Kehadiran per Kelas)
export function renderKehadiranRekapPage(container) {
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
