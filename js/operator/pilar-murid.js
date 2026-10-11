// ============================================================================
// PILAR 3: MURID (Data Murid, Pindah Kelas, Naik Kelas, Alumni)
// ============================================================================

import { supabase } from "../supabase.js";
import { appState, saveAppState } from "./state.js";

// 3.a. Data Murid (Tambah/Hapus Murid, Atur per Rombel)
export function renderMuridDataPage(container) {
  const filteredStudents = appState.students.filter(s => {
    const matchClass = appState.filterClass === "all" || s.class_id === appState.filterClass;
    const matchSearch = s.full_name.toLowerCase().includes(appState.searchTerm.toLowerCase()) ||
                        s.nisn.includes(appState.searchTerm);
    return matchClass && matchSearch;
  });

  container.innerHTML = `
    <div class="rounded-3xl border border-white/70 bg-white/95 p-6 shadow-xl shadow-[#0b3b01]/5 space-y-5">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 class="text-xl font-black text-[#0b3b01]">Data Murid & Santri Aktif</h3>
          <p class="text-xs text-slate-500 mt-0.5">Kelola seluruh data murid, filter berdasarkan rombel kelas, dan pencarian santri.</p>
        </div>
        <button id="btn-add-murid" class="inline-flex items-center gap-2 rounded-xl bg-[#0b3b01] px-4 py-2.5 text-xs font-bold text-white hover:bg-[#06410a] transition shadow-md cursor-pointer">
          <span>➕</span> Tambah Murid Baru
        </button>
      </div>

      <!-- Filter & Pencarian -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div class="sm:col-span-2">
          <input id="search-murid" type="text" placeholder="Cari nama santri atau NISN..." value="${appState.searchTerm}"
            class="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs text-slate-800 focus:border-emerald-600 focus:outline-none" />
        </div>
        <div>
          <select id="filter-murid-rombel" class="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-800 focus:border-emerald-600 focus:outline-none">
            <option value="all">Semua Rombongan Belajar</option>
            ${appState.classes.map(c => `<option value="${c.id}" ${appState.filterClass === c.id ? 'selected' : ''}>${c.name}</option>`).join('')}
          </select>
        </div>
      </div>

      <div class="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
        <table class="w-full text-left text-xs">
          <thead class="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-600">
            <tr>
              <th class="px-4 py-3.5">Nama Santri & NISN</th>
              <th class="px-4 py-3.5">Rombel / Kelas</th>
              <th class="px-4 py-3.5">Jenis Kelamin</th>
              <th class="px-4 py-3.5">Status</th>
              <th class="px-4 py-3.5 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            ${filteredStudents.length === 0 ? `
              <tr><td colspan="5" class="p-8 text-center text-slate-400">Tidak ada murid yang cocok.</td></tr>
            ` : filteredStudents.map(s => {
              const cls = appState.classes.find(c => c.id === s.class_id);
              return `
                <tr class="hover:bg-slate-50/60 transition">
                  <td class="px-4 py-3">
                    <p class="font-bold text-slate-900">${s.full_name}</p>
                    <p class="text-[11px] font-mono text-slate-400">NISN: ${s.nisn}</p>
                  </td>
                  <td class="px-4 py-3 font-semibold text-emerald-800">${cls ? cls.name : 'Belum Ada Kelas'}</td>
                  <td class="px-4 py-3 text-slate-600">${s.gender}</td>
                  <td class="px-4 py-3 text-emerald-700 font-bold">🟢 Aktif</td>
                  <td class="px-4 py-3 text-center">
                    <button class="btn-delete-murid text-red-600 hover:text-red-800 font-bold px-2.5 py-1.5 rounded-lg bg-red-50 cursor-pointer" data-id="${s.id}" data-name="${s.full_name}">
                      🗑️ Hapus
                    </button>
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
      <div class="text-[11px] text-slate-400">Menampilkan ${filteredStudents.length} santri.</div>
    </div>
  `;

  const refresh = () => renderMuridDataPage(container);

  document.getElementById("search-murid")?.addEventListener("input", (e) => {
    appState.searchTerm = e.target.value;
    refresh();
  });
  document.getElementById("filter-murid-rombel")?.addEventListener("change", (e) => {
    appState.filterClass = e.target.value;
    refresh();
  });

  // Modal Tambah Murid
  document.getElementById("btn-add-murid")?.addEventListener("click", () => {
    window.dashboardModal.open({
      title: "➕ Tambah Data Santri Baru",
      bodyHtml: `
        <form id="form-modal-murid" class="space-y-3.5 text-xs">
          <div>
            <label class="block font-bold text-slate-700 mb-1">Nama Lengkap Santri</label>
            <input id="std-name" type="text" placeholder="Masukkan nama murid..." required
              class="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs text-slate-800 focus:border-emerald-600 focus:outline-none" />
          </div>
          <div>
            <label class="block font-bold text-slate-700 mb-1">NISN</label>
            <input id="std-nisn" type="text" placeholder="10 Digit NISN" required
              class="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs text-slate-800 focus:border-emerald-600 focus:outline-none" />
          </div>
          <div>
            <label class="block font-bold text-slate-700 mb-1">Pilih Rombel / Kelas Awal</label>
            <select id="std-class" class="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs text-slate-800 focus:border-emerald-600 focus:outline-none">
              ${appState.classes.map(c => `<option value="${c.id}">${c.name}</option>`).join('')}
            </select>
          </div>
          <div>
            <label class="block font-bold text-slate-700 mb-1">Jenis Kelamin</label>
            <select id="std-gender" class="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs text-slate-800 focus:border-emerald-600 focus:outline-none">
              <option value="Laki-laki">Laki-laki (Santri Putra)</option>
              <option value="Perempuan">Perempuan (Santri Putri)</option>
            </select>
          </div>
          <div class="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button type="submit" class="px-5 py-2.5 bg-[#0b3b01] text-white rounded-xl font-bold hover:bg-[#06410a] transition cursor-pointer">
              Simpan Data Murid
            </button>
          </div>
        </form>
      `,
      onMount: (modalBody, close) => {
        modalBody.querySelector("#form-modal-murid")?.addEventListener("submit", async (e) => {
          e.preventDefault();
          const name = modalBody.querySelector("#std-name").value.trim();
          const nisn = modalBody.querySelector("#std-nisn").value.trim();
          const classId = modalBody.querySelector("#std-class").value;
          const gender = modalBody.querySelector("#std-gender").value;

          const fakeId = `std-${Date.now()}`;
          const newStudent = {
            id: fakeId,
            full_name: name,
            email: `${name.toLowerCase().replace(/\s+/g, ".")}@darunnajah.sch.id`,
            role: "siswa",
            class_id: classId,
            nisn,
            gender,
            status: "Aktif"
          };
          appState.students.push(newStudent);
          appState.users.push(newStudent);

          // Update student count in class
          const cls = appState.classes.find(c => c.id === classId);
          if (cls) cls.studentsCount = (cls.studentsCount || 0) + 1;

          saveAppState();

          window.dashboardModal.toast(`Murid "${name}" berhasil ditambahkan!`, "success");
          close();
          refresh();
        });
      }
    });
  });

  // Hapus Murid
  container.querySelectorAll(".btn-delete-murid").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.id;
      const name = btn.dataset.name;
      if (confirm(`Yakin ingin menghapus data murid "${name}"?`)) {
        appState.students = appState.students.filter(s => s.id !== id);
        appState.users = appState.users.filter(u => u.id !== id);
        saveAppState();
        window.dashboardModal.toast(`Murid "${name}" dihapus.`, "success");
        refresh();
      }
    });
  });
}

// 3.b. Pindah Kelas (Fitur Memindahkan Siswa ke Rombel Lain)
export function renderMuridPindahPage(container) {
  container.innerHTML = `
    <div class="max-w-3xl mx-auto rounded-3xl border border-white/70 bg-white/95 p-6 sm:p-8 shadow-xl shadow-[#0b3b01]/5 space-y-6">
      <div>
        <h3 class="text-xl font-black text-[#0b3b01]">Fitur Pindah Kelas (Mutasi Rombel)</h3>
        <p class="text-xs text-slate-500 mt-0.5">Pindahkan santri dari satu rombel ke rombel tujuan dengan cepat dan akurat.</p>
      </div>

      <form id="form-pindah-kelas" class="space-y-4 text-xs">
        <div>
          <label class="block font-bold text-slate-700 mb-1">1. Pilih Santri yang Akan Dipindahkan</label>
          <select id="pk-student" required class="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs text-slate-800 focus:border-emerald-600 focus:outline-none">
            <option value="">-- Pilih Santri --</option>
            ${appState.students.map(s => {
              const cls = appState.classes.find(c => c.id === s.class_id);
              return `<option value="${s.id}">${s.full_name} (Saat ini: ${cls ? cls.name : 'Tanpa Kelas'})</option>`;
            }).join('')}
          </select>
        </div>

        <div>
          <label class="block font-bold text-slate-700 mb-1">2. Pilih Rombel Tujuan Baru</label>
          <select id="pk-target-class" required class="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs text-slate-800 focus:border-emerald-600 focus:outline-none">
            <option value="">-- Pilih Rombel Tujuan --</option>
            ${appState.classes.map(c => `<option value="${c.id}">${c.name} (Wali: ${c.homeroom})</option>`).join('')}
          </select>
        </div>

        <div>
          <label class="block font-bold text-slate-700 mb-1">3. Alasan / Catatan Pemindahan</label>
          <input id="pk-reason" type="text" placeholder="Contoh: Penyesuaian peminatan / pergantian asrama" required
            class="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs text-slate-800 focus:border-emerald-600 focus:outline-none" />
        </div>

        <button type="submit" class="w-full py-3 bg-[#0b3b01] text-white rounded-xl font-bold hover:bg-[#06410a] transition shadow-md cursor-pointer">
          🔄 Proses Pindah Kelas Sekarang
        </button>
      </form>
    </div>
  `;

  document.getElementById("form-pindah-kelas")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const stdId = document.getElementById("pk-student").value;
    const targetClassId = document.getElementById("pk-target-class").value;
    const reason = document.getElementById("pk-reason").value;

    const std = appState.students.find(s => s.id === stdId);
    const targetCls = appState.classes.find(c => c.id === targetClassId);

    if (std && targetCls) {
      try {
        await supabase.from("profiles").update({ class_id: targetClassId }).eq("id", stdId);
      } catch {}

      std.class_id = targetClassId;
      const u = appState.users.find(x => x.id === stdId);
      if (u) u.class_id = targetClassId;
      saveAppState();

      window.dashboardModal.toast(`Santri ${std.full_name} berhasil dipindahkan ke ${targetCls.name}!`, "success");
      renderMuridPindahPage(container);
    }
  });
}

// 3.c. Naik Kelas (Fitur Menentukan Kenaikan Kelas pada Murid)
export function renderMuridNaikPage(container) {
  let selectedSourceClassId = appState.classes[0]?.id || "";

  function renderView() {
    const studentsInSource = appState.students.filter(s => s.class_id === selectedSourceClassId);

    container.innerHTML = `
      <div class="rounded-3xl border border-white/70 bg-white/95 p-6 shadow-xl shadow-[#0b3b01]/5 space-y-6">
        <div>
          <h3 class="text-xl font-black text-[#0b3b01]">Fitur Penetapan Kenaikan Kelas</h3>
          <p class="text-xs text-slate-500 mt-0.5">Proses kenaikan kelas massal atau individual di akhir tahun ajaran.</p>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
          <div>
            <label class="block font-bold text-slate-700 mb-1">Rombel Asal (Kelas Saat Ini)</label>
            <select id="nk-source-class" class="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs text-slate-800">
              ${appState.classes.map(c => `<option value="${c.id}" ${c.id === selectedSourceClassId ? 'selected' : ''}>${c.name}</option>`).join('')}
            </select>
          </div>
          <div>
            <label class="block font-bold text-slate-700 mb-1">Rombel Tujuan Kenaikan</label>
            <select id="nk-target-class" class="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs text-slate-800">
              <option value="alumni">🎓 Lulus / Tamat (Pindah ke Alumni)</option>
              ${appState.classes.map(c => `<option value="${c.id}">${c.name}</option>`).join('')}
            </select>
          </div>
        </div>

        <div>
          <div class="flex items-center justify-between mb-2 text-xs">
            <span class="font-bold text-slate-700">Daftar Santri di Rombel Asal (${studentsInSource.length} Santri)</span>
            <button id="btn-check-all" class="text-emerald-700 font-bold hover:underline cursor-pointer">Pilih Semua</button>
          </div>

          <div class="divide-y divide-slate-100 rounded-2xl border border-slate-200 bg-white max-h-72 overflow-y-auto p-2">
            ${studentsInSource.length === 0 ? `
              <p class="p-6 text-center text-xs text-slate-400">Tidak ada santri di rombel ini.</p>
            ` : studentsInSource.map(s => `
              <label class="flex items-center justify-between p-3 hover:bg-slate-50 rounded-xl cursor-pointer text-xs">
                <span class="font-bold text-slate-800">${s.full_name} (${s.nisn})</span>
                <input type="checkbox" value="${s.id}" class="chk-naik h-4 w-4 rounded text-emerald-700 focus:ring-emerald-500" checked />
              </label>
            `).join('')}
          </div>
        </div>

        <button id="btn-process-naik" class="w-full py-3 bg-[#0b3b01] text-white rounded-xl font-bold hover:bg-[#06410a] transition shadow-md cursor-pointer text-xs">
          📈 Proses Kenaikan Kelas Santri Terpilih
        </button>
      </div>
    `;

    document.getElementById("nk-source-class")?.addEventListener("change", (e) => {
      selectedSourceClassId = e.target.value;
      renderView();
    });

    document.getElementById("btn-check-all")?.addEventListener("click", () => {
      container.querySelectorAll(".chk-naik").forEach(c => c.checked = true);
    });

    document.getElementById("btn-process-naik")?.addEventListener("click", async () => {
      const targetClassId = document.getElementById("nk-target-class").value;
      const checkedBoxes = Array.from(container.querySelectorAll(".chk-naik:checked"));
      
      if (checkedBoxes.length === 0) {
        window.dashboardModal.toast("Pilih minimal 1 santri untuk diproses!", "info");
        return;
      }

      const ids = checkedBoxes.map(c => c.value);

      if (targetClassId === "alumni") {
        // Pindahkan ke alumni
        ids.forEach(id => {
          const s = appState.students.find(st => st.id === id);
          if (s) {
            appState.alumni.push({
              id: `alm-${Date.now()}-${id}`,
              name: s.full_name,
              nisn: s.nisn,
              graduationYear: "2026",
              lastClass: "Tamat",
              status: "Alumni Baru",
              phone: s.phone || "-"
            });
            appState.students = appState.students.filter(st => st.id !== id);
            appState.users = appState.users.filter(u => u.id !== id);
          }
        });
        saveAppState();
        window.dashboardModal.toast(`${ids.length} santri berhasil ditamatkan menjadi Alumni!`, "success");
      } else {
        ids.forEach(id => {
          const s = appState.students.find(st => st.id === id);
          if (s) {
            s.class_id = targetClassId;
            const u = appState.users.find(x => x.id === id);
            if (u) u.class_id = targetClassId;
          }
        });
        saveAppState();
        window.dashboardModal.toast(`${ids.length} santri berhasil dinaikkan kelas!`, "success");
      }

      renderView();
    });
  }

  renderView();
}

// 3.d. Data Alumni (Melacak Alumni yang Sudah Tamat)
export function renderMuridAlumniPage(container) {
  container.innerHTML = `
    <div class="rounded-3xl border border-white/70 bg-white/95 p-6 shadow-xl shadow-[#0b3b01]/5 space-y-5">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 class="text-xl font-black text-[#0b3b01]">Direktori Alumni Darunnajah</h3>
          <p class="text-xs text-slate-500 mt-0.5">Penelusuran dan pelacakan jejak alumni santri yang telah lulus/tamat.</p>
        </div>
        <button id="btn-add-alumni" class="inline-flex items-center gap-2 rounded-xl bg-[#0b3b01] px-4 py-2.5 text-xs font-bold text-white hover:bg-[#06410a] transition shadow-md cursor-pointer">
          <span>➕</span> Catat Alumni Baru
        </button>
      </div>

      <div class="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
        <table class="w-full text-left text-xs">
          <thead class="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-600">
            <tr>
              <th class="px-4 py-3.5">Nama Alumni</th>
              <th class="px-4 py-3.5">NISN</th>
              <th class="px-4 py-3.5">Tahun Tamat</th>
              <th class="px-4 py-3.5">Aktivitas / Kegiatan Saat Ini</th>
              <th class="px-4 py-3.5">Kontak</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            ${appState.alumni.map(a => `
              <tr class="hover:bg-slate-50/60 transition">
                <td class="px-4 py-3 font-bold text-slate-900">🎓 ${a.name}</td>
                <td class="px-4 py-3 font-mono text-slate-600">${a.nisn}</td>
                <td class="px-4 py-3 font-bold text-emerald-800">Tahun ${a.graduationYear}</td>
                <td class="px-4 py-3 text-slate-700">${a.status}</td>
                <td class="px-4 py-3 text-slate-500">${a.phone}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;

  document.getElementById("btn-add-alumni")?.addEventListener("click", () => {
    window.dashboardModal.open({
      title: "➕ Catat Alumni Baru",
      bodyHtml: `
        <form id="form-alumni" class="space-y-3.5 text-xs">
          <div>
            <label class="block font-bold text-slate-700 mb-1">Nama Lengkap Alumni</label>
            <input id="al-name" type="text" required class="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs text-slate-800 focus:border-emerald-600 focus:outline-none" />
          </div>
          <div>
            <label class="block font-bold text-slate-700 mb-1">NISN</label>
            <input id="al-nisn" type="text" required class="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs text-slate-800 focus:border-emerald-600 focus:outline-none" />
          </div>
          <div>
            <label class="block font-bold text-slate-700 mb-1">Tahun Kelulusan / Tamat</label>
            <input id="al-year" type="text" value="2026" required class="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs text-slate-800 focus:border-emerald-600 focus:outline-none" />
          </div>
          <div>
            <label class="block font-bold text-slate-700 mb-1">Aktivitas Saat Ini (Kuliah / Kerja / Pondok)</label>
            <input id="al-status" type="text" placeholder="Contoh: Kuliah di UIN Alauddin" required class="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs text-slate-800 focus:border-emerald-600 focus:outline-none" />
          </div>
          <div class="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button type="submit" class="px-5 py-2.5 bg-[#0b3b01] text-white rounded-xl font-bold hover:bg-[#06410a] transition cursor-pointer">
              Simpan Data Alumni
            </button>
          </div>
        </form>
      `,
      onMount: (modalBody, close) => {
        modalBody.querySelector("#form-alumni")?.addEventListener("submit", (e) => {
          e.preventDefault();
          appState.alumni.push({
            id: `alm-${Date.now()}`,
            name: modalBody.querySelector("#al-name").value.trim(),
            nisn: modalBody.querySelector("#al-nisn").value.trim(),
            graduationYear: modalBody.querySelector("#al-year").value.trim(),
            lastClass: "Alumni",
            status: modalBody.querySelector("#al-status").value.trim(),
            phone: "0812-xxxx-xxxx"
          });
          saveAppState();
          window.dashboardModal.toast("Data alumni berhasil ditambahkan!", "success");
          close();
          renderMuridAlumniPage(container);
        });
      }
    });
  });
}
