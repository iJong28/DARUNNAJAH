import { supabase } from "../supabase.js";
import { appState, saveAppState } from "./state.js";

// ============================================================================
// PILAR 1: LEMBAGA
// ============================================================================

// 1.a. Pengaturan Data Lembaga (Ringkasan Utama & Konfigurasi Profil)
export function renderLembagaInfoPage(container) {
  const inst = appState.institution;
  const totalMurid = appState.students.length;
  const totalGuru = appState.teachers.length;
  const totalRombel = appState.classes.length;
  const totalMapel = appState.subjects.length;
  const totalKas = appState.paymentRecords.filter(p => p.status === 'lunas' || p.status === 'LUNAS').reduce((a, b) => a + (b.amount || 0), 0) || 24500000;

  container.innerHTML = `
    <div class="space-y-6">
      <!-- HEADER RINGKASAN UTAMA -->
      <article class="relative overflow-hidden rounded-3xl border border-emerald-800/20 bg-gradient-to-r from-emerald-950 via-[#0b3b01] to-[#004d2e] p-6 text-white shadow-2xl">
        <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div class="flex flex-wrap items-center gap-2">
              <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-xs font-bold uppercase tracking-wider text-emerald-300 border border-emerald-400/30">
                <span class="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
                Ringkasan Utama Lembaga
              </span>
              <span class="px-2.5 py-0.5 rounded-full bg-white/10 text-[11px] text-emerald-200 font-medium">
                TA ${inst.academicYear}
              </span>
            </div>
            <h2 class="mt-3 text-2xl sm:text-3xl font-black tracking-tight">${inst.name}</h2>
            <p class="text-xs sm:text-sm text-emerald-100/80 mt-1 max-w-2xl leading-relaxed">
              ${inst.address}
            </p>
          </div>
          <div class="flex items-center gap-2">
            <button id="btn-save-institution" class="px-5 py-2.5 bg-white text-[#0b3b01] rounded-xl text-xs font-bold shadow-lg hover:bg-emerald-50 transition active:scale-95 cursor-pointer">
              💾 Simpan Perubahan Lembaga
            </button>
          </div>
        </div>

        <!-- 4 METRIK KPI RINGKASAN UTAMA -->
        <div class="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3.5">
          <div class="rounded-2xl bg-white/10 p-4 backdrop-blur-md border border-white/10">
            <span class="text-xs text-emerald-200 font-semibold uppercase tracking-wider">Total Murid</span>
            <p class="text-2xl sm:text-3xl font-black mt-1 text-white">${totalMurid} Santri</p>
            <p class="text-[11px] text-emerald-200/80 mt-1">Tersebar di ${totalRombel} Rombel</p>
          </div>
          <div class="rounded-2xl bg-white/10 p-4 backdrop-blur-md border border-white/10">
            <span class="text-xs text-emerald-200 font-semibold uppercase tracking-wider">Dewan Guru</span>
            <p class="text-2xl sm:text-3xl font-black mt-1 text-white">${totalGuru} Asatidz</p>
            <p class="text-[11px] text-emerald-200/80 mt-1">Pengajar & Wali Kelas</p>
          </div>
          <div class="rounded-2xl bg-white/10 p-4 backdrop-blur-md border border-white/10">
            <span class="text-xs text-emerald-200 font-semibold uppercase tracking-wider">Rombel & Mapel</span>
            <p class="text-2xl sm:text-3xl font-black mt-1 text-white">${totalRombel} / ${totalMapel}</p>
            <p class="text-[11px] text-emerald-200/80 mt-1">Kelas Aktif / Mata Pelajaran</p>
          </div>
          <div class="rounded-2xl bg-white/10 p-4 backdrop-blur-md border border-white/10">
            <span class="text-xs text-emerald-200 font-semibold uppercase tracking-wider">Iuran Kas Terkumpul</span>
            <p class="text-xl sm:text-2xl font-black mt-1 text-emerald-300">Rp ${totalKas.toLocaleString('id-ID')}</p>
            <p class="text-[11px] text-emerald-200/80 mt-1">Status Keuangan Terverifikasi</p>
          </div>
        </div>
      </article>

      <!-- FORMULIR PENGATURAN DATA LEMBAGA -->
      <div class="rounded-3xl border border-white/70 bg-white/95 p-6 shadow-xl shadow-[#0b3b01]/5 space-y-6">
        <div>
          <h3 class="text-lg font-black text-[#0b3b01]">Pengaturan Identitas & Legalitas Lembaga</h3>
          <p class="text-xs text-slate-500 mt-0.5">Konfigurasi data pokok madrasah untuk keperluan administrasi dan pelaporan resmi.</p>
        </div>

        <form id="form-institution-settings" class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div>
            <label class="block font-bold text-slate-700 mb-1">Nama Resmi Lembaga</label>
            <input id="inst-name" type="text" value="${inst.name}" required
              class="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs text-slate-800 focus:border-emerald-600 focus:outline-none" />
          </div>
          <div>
            <label class="block font-bold text-slate-700 mb-1">Kepala Madrasah / Pimpinan</label>
            <input id="inst-headmaster" type="text" value="${inst.headmaster}" required
              class="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs text-slate-800 focus:border-emerald-600 focus:outline-none" />
          </div>
          <div>
            <label class="block font-bold text-slate-700 mb-1">Nomor Statistik Madrasah (NSM)</label>
            <input id="inst-nsm" type="text" value="${inst.nsm}" required
              class="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs text-slate-800 focus:border-emerald-600 focus:outline-none" />
          </div>
          <div>
            <label class="block font-bold text-slate-700 mb-1">NPSN</label>
            <input id="inst-npsn" type="text" value="${inst.npsn}" required
              class="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs text-slate-800 focus:border-emerald-600 focus:outline-none" />
          </div>
          <div>
            <label class="block font-bold text-slate-700 mb-1">Jenjang & Status Akreditasi</label>
            <input id="inst-status" type="text" value="${inst.status}" required
              class="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs text-slate-800 focus:border-emerald-600 focus:outline-none" />
          </div>
          <div>
            <label class="block font-bold text-slate-700 mb-1">Tahun Ajaran Aktif</label>
            <input id="inst-academic" type="text" value="${inst.academicYear}" required
              class="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs text-slate-800 focus:border-emerald-600 focus:outline-none" />
          </div>
          <div class="md:col-span-2">
            <label class="block font-bold text-slate-700 mb-1">Alamat Lengkap</label>
            <input id="inst-address" type="text" value="${inst.address}" required
              class="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs text-slate-800 focus:border-emerald-600 focus:outline-none" />
          </div>
          <div>
            <label class="block font-bold text-slate-700 mb-1">Nomor Telepon / WhatsApp Madrasah</label>
            <input id="inst-phone" type="text" value="${inst.phone}" required
              class="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs text-slate-800 focus:border-emerald-600 focus:outline-none" />
          </div>
          <div>
            <label class="block font-bold text-slate-700 mb-1">Email Resmi Madrasah</label>
            <input id="inst-email" type="email" value="${inst.email}" required
              class="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs text-slate-800 focus:border-emerald-600 focus:outline-none" />
          </div>
          <div class="md:col-span-2">
            <label class="block font-bold text-slate-700 mb-1">Visi Madrasah</label>
            <textarea id="inst-vision" rows="2" class="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs text-slate-800 focus:border-emerald-600 focus:outline-none">${inst.vision}</textarea>
          </div>
          <div class="md:col-span-2 pt-2">
            <button type="submit" class="w-full sm:w-auto px-6 py-2.5 bg-[#0b3b01] text-white rounded-xl font-bold hover:bg-[#06410a] transition shadow-md cursor-pointer">
              Simpan Pembaruan Data Lembaga
            </button>
          </div>
        </form>
      </div>
    </div>
  `;

  // Submit Handler
  const handleSave = (e) => {
    if (e) e.preventDefault();
    inst.name = document.getElementById("inst-name").value.trim();
    inst.headmaster = document.getElementById("inst-headmaster").value.trim();
    inst.nsm = document.getElementById("inst-nsm").value.trim();
    inst.npsn = document.getElementById("inst-npsn").value.trim();
    inst.status = document.getElementById("inst-status").value.trim();
    inst.academicYear = document.getElementById("inst-academic").value.trim();
    inst.address = document.getElementById("inst-address").value.trim();
    inst.phone = document.getElementById("inst-phone").value.trim();
    inst.email = document.getElementById("inst-email").value.trim();
    inst.vision = document.getElementById("inst-vision").value.trim();

    saveAppState();
    window.dashboardModal.toast("Data lembaga berhasil disimpan!", "success");
    renderLembagaInfoPage(container);
  };

  document.getElementById("form-institution-settings")?.addEventListener("submit", handleSave);
  document.getElementById("btn-save-institution")?.addEventListener("click", handleSave);
}

// 1.b. Pengaturan Data Mapel (Tambah/Hapus Mapel)
export function renderLembagaMapelPage(container) {
  container.innerHTML = `
    <div class="rounded-3xl border border-white/70 bg-white/95 p-6 shadow-xl shadow-[#0b3b01]/5 space-y-5">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 class="text-xl font-black text-[#0b3b01]">Pengaturan Data Mata Pelajaran (Mapel)</h3>
          <p class="text-xs text-slate-500 mt-0.5">Kelola kurikulum kepesantrenan, agama, bahasa, dan sains madrasah.</p>
        </div>
        <button id="btn-add-mapel" class="inline-flex items-center gap-2 rounded-xl bg-[#0b3b01] px-4 py-2.5 text-xs font-bold text-white hover:bg-[#06410a] transition shadow-md cursor-pointer">
          <span>➕</span> Tambah Mapel Baru
        </button>
      </div>

      ${appState.subjects.length === 0 ? `
        <div class="p-12 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-300">
          <div class="text-4xl mb-2">📖</div>
          <h4 class="font-bold text-slate-800 text-sm">Belum Ada Mata Pelajaran</h4>
          <p class="text-xs text-slate-500 mt-1 max-w-sm mx-auto">Mulai tambahkan mata pelajaran pertama madrasah.</p>
          <button id="btn-empty-add-mapel" class="mt-4 px-4 py-2 bg-[#0b3b01] text-white text-xs font-bold rounded-xl cursor-pointer">
            + Tambah Mapel
          </button>
        </div>
      ` : `
        <div class="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
          <table class="w-full text-left text-xs">
            <thead class="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-600">
              <tr>
                <th class="px-4 py-3.5">Kode Mapel</th>
                <th class="px-4 py-3.5">Nama Mata Pelajaran</th>
                <th class="px-4 py-3.5">Kategori Kurikulum</th>
                <th class="px-4 py-3.5">Beban Jam</th>
                <th class="px-4 py-3.5 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              ${appState.subjects.map(s => `
                <tr class="hover:bg-slate-50/60 transition">
                  <td class="px-4 py-3 font-mono font-bold text-emerald-800">${s.code}</td>
                  <td class="px-4 py-3 font-bold text-slate-900">${s.name}</td>
                  <td class="px-4 py-3 text-slate-600">
                    <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      ${s.category}
                    </span>
                  </td>
                  <td class="px-4 py-3 text-slate-600">${s.hours}</td>
                  <td class="px-4 py-3 text-center">
                    <button class="btn-delete-mapel px-3 py-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 font-bold text-[11px] transition cursor-pointer" data-id="${s.id}" data-name="${s.name}">
                      🗑️ Hapus
                    </button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
        <div class="text-[11px] text-slate-400">Total ${appState.subjects.length} mata pelajaran aktif.</div>
      `}
    </div>
  `;

  const refresh = () => renderLembagaMapelPage(container);

  // Modal Tambah Mapel
  const openModalMapel = () => {
    window.dashboardModal.open({
      title: "➕ Tambah Mata Pelajaran Baru",
      bodyHtml: `
        <form id="form-modal-mapel" class="space-y-3.5 text-xs">
          <div>
            <label class="block font-bold text-slate-700 mb-1">Nama Mata Pelajaran</label>
            <input id="m-name" type="text" placeholder="Contoh: Fiqih Ibadah / Bahasa Arab / Biologi" required
              class="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs text-slate-800 focus:border-emerald-600 focus:outline-none" />
          </div>
          <div>
            <label class="block font-bold text-slate-700 mb-1">Kategori Kurikulum</label>
            <select id="m-cat" class="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs text-slate-800 focus:border-emerald-600 focus:outline-none">
              <option value="Agama & Kepesantrenan">Agama & Kepesantrenan</option>
              <option value="Bahasa (Arab & Inggris)">Bahasa (Arab & Inggris)</option>
              <option value="Sains & Matematika">Sains & Matematika</option>
              <option value="Ilmu Pengetahuan Sosial">Ilmu Pengetahuan Sosial</option>
              <option value="Muatan Lokal & Keterampilan">Muatan Lokal & Keterampilan</option>
            </select>
          </div>
          <div>
            <label class="block font-bold text-slate-700 mb-1">Beban Jam / Pekan</label>
            <input id="m-hours" type="text" value="4 Jam / Pekan" required
              class="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs text-slate-800 focus:border-emerald-600 focus:outline-none" />
          </div>
          <div class="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button type="submit" class="px-5 py-2.5 bg-[#0b3b01] text-white rounded-xl font-bold hover:bg-[#06410a] transition cursor-pointer">
              Simpan Mapel
            </button>
          </div>
        </form>
      `,
      onMount: (modalBody, close) => {
        modalBody.querySelector("#form-modal-mapel")?.addEventListener("submit", async (e) => {
          e.preventDefault();
          const name = modalBody.querySelector("#m-name").value.trim();
          const cat = modalBody.querySelector("#m-cat").value;
          const hours = modalBody.querySelector("#m-hours").value.trim();

          try {
            const { data, error } = await supabase.from("subjects").insert([{ name, description: cat }]).select();
            if (error) console.warn("Supabase insert subject:", error);
            appState.subjects.push({
              id: data?.[0]?.id || `sub-${Date.now()}`,
              code: `MP-${String(appState.subjects.length + 1).padStart(2, '0')}`,
              name,
              category: cat,
              hours
            });
            saveAppState();
            window.dashboardModal.toast(`Mata pelajaran ${name} berhasil ditambahkan!`, "success");
            close();
            refresh();
          } catch (err) {
            window.dashboardModal.toast(`Gagal menambahkan: ${err.message}`, "error");
          }
        });
      }
    });
  };

  document.getElementById("btn-add-mapel")?.addEventListener("click", openModalMapel);
  document.getElementById("btn-empty-add-mapel")?.addEventListener("click", openModalMapel);

  // Hapus Mapel
  container.querySelectorAll(".btn-delete-mapel").forEach(btn => {
    btn.addEventListener("click", async () => {
      const id = btn.dataset.id;
      const name = btn.dataset.name;
      if (confirm(`Apakah Anda yakin ingin menghapus mata pelajaran "${name}"?`)) {
        try {
          await supabase.from("subjects").delete().eq("id", id);
        } catch {}
        appState.subjects = appState.subjects.filter(s => s.id !== id);
        saveAppState();
        window.dashboardModal.toast(`Mata pelajaran "${name}" berhasil dihapus.`, "success");
        refresh();
      }
    });
  });
}

// 1.c. Pengaturan Rombel (Tambah/Hapus Rombel, Edit Nama Rombel, Edit Wali Kelas)
export function renderLembagaRombelPage(container) {
  container.innerHTML = `
    <div class="rounded-3xl border border-white/70 bg-white/95 p-6 shadow-xl shadow-[#0b3b01]/5 space-y-5">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 class="text-xl font-black text-[#0b3b01]">Pengaturan Rombongan Belajar (Rombel / Kelas)</h3>
          <p class="text-xs text-slate-500 mt-0.5">Kelola rombel kelas, nama rombel, dan penetapan dewan wali kelas.</p>
        </div>
        <button id="btn-add-rombel" class="inline-flex items-center gap-2 rounded-xl bg-[#0b3b01] px-4 py-2.5 text-xs font-bold text-white hover:bg-[#06410a] transition shadow-md cursor-pointer">
          <span>➕</span> Tambah Rombel Baru
        </button>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        ${appState.classes.map(c => `
          <div class="rounded-2xl border border-slate-200 bg-white p-4 hover:border-emerald-500 hover:shadow-md transition">
            <div class="flex items-center justify-between">
              <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                c.level === 'MA' ? 'bg-purple-100 text-purple-800' :
                c.level === 'SMP IT' ? 'bg-blue-100 text-blue-800' :
                'bg-amber-100 text-amber-800'
              }">
                ${c.level}
              </span>
              <span class="text-[11px] font-bold text-emerald-700">${c.studentsCount} Santri</span>
            </div>
            <h4 class="font-black text-slate-900 mt-2 text-base">${c.name}</h4>
            <div class="mt-3 p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs space-y-1">
              <p class="text-slate-500 text-[11px]">Wali Kelas:</p>
              <p class="font-bold text-slate-800 flex items-center gap-1.5">
                <span>👨‍🏫</span> ${c.homeroom}
              </p>
              <p class="text-slate-400 text-[10px] mt-1">${c.room}</p>
            </div>
            <div class="flex items-center justify-end gap-2 mt-4 pt-3 border-t border-slate-100">
              <button class="btn-edit-rombel text-[11px] font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-xl transition cursor-pointer" data-id="${c.id}">
                ✏️ Edit Rombel & Wali
              </button>
              <button class="btn-delete-rombel text-[11px] font-bold text-red-600 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-xl transition cursor-pointer" data-id="${c.id}" data-name="${c.name}">
                🗑️ Hapus
              </button>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;

  const refresh = () => renderLembagaRombelPage(container);

  // Modal Tambah Rombel
  document.getElementById("btn-add-rombel")?.addEventListener("click", () => {
    window.dashboardModal.open({
      title: "➕ Tambah Rombel Kelas Baru",
      bodyHtml: `
        <form id="form-modal-rombel" class="space-y-3.5 text-xs">
          <div>
            <label class="block font-bold text-slate-700 mb-1">Nama Rombel</label>
            <input id="r-name" type="text" placeholder="Contoh: MA - Kelas X (Putra)" required
              class="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs text-slate-800 focus:border-emerald-600 focus:outline-none" />
          </div>
          <div>
            <label class="block font-bold text-slate-700 mb-1">Pilih Wali Kelas</label>
            <select id="r-teacher" class="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs text-slate-800 focus:border-emerald-600 focus:outline-none">
              <option value="">-- Pilih Guru Sebagai Wali Kelas --</option>
              ${appState.teachers.map(t => `<option value="${t.id}">${t.full_name}</option>`).join('')}
            </select>
          </div>
          <div class="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button type="submit" class="px-5 py-2.5 bg-[#0b3b01] text-white rounded-xl font-bold hover:bg-[#06410a] transition cursor-pointer">
              Simpan Rombel
            </button>
          </div>
        </form>
      `,
      onMount: (modalBody, close) => {
        modalBody.querySelector("#form-modal-rombel")?.addEventListener("submit", async (e) => {
          e.preventDefault();
          const name = modalBody.querySelector("#r-name").value.trim();
          const teacherId = modalBody.querySelector("#r-teacher").value || null;

          try {
            const { data, error } = await supabase.from("classes").insert([{ name, teacher_id: teacherId }]).select();
            if (error) throw error;
            const teacher = appState.teachers.find(t => t.id === teacherId);
            appState.classes.push({
              id: data?.[0]?.id || `cls-${Date.now()}`,
              name,
              level: name.includes("SMP") ? "SMP IT" : name.includes("RA") ? "RA" : "MA",
              teacher_id: teacherId,
              homeroom: teacher ? teacher.full_name : "Belum Ditugaskan",
              studentsCount: 0,
              room: `Ruang Kelas ${appState.classes.length + 1}`
            });
            saveAppState();
            window.dashboardModal.toast(`Rombel "${name}" berhasil dibuat!`, "success");
            close();
            refresh();
          } catch (err) {
            window.dashboardModal.toast(`Gagal menambahkan: ${err.message}`, "error");
          }
        });
      }
    });
  });

  // Edit Rombel & Wali Kelas
  container.querySelectorAll(".btn-edit-rombel").forEach(btn => {
    btn.addEventListener("click", () => {
      const cls = appState.classes.find(c => c.id === btn.dataset.id);
      if (!cls) return;

      window.dashboardModal.open({
        title: `✏️ Edit Rombel: ${cls.name}`,
        bodyHtml: `
          <form id="form-edit-rombel" class="space-y-3.5 text-xs">
            <div>
              <label class="block font-bold text-slate-700 mb-1">Nama Rombel</label>
              <input id="edit-r-name" type="text" value="${cls.name}" required
                class="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs text-slate-800 focus:border-emerald-600 focus:outline-none" />
            </div>
            <div>
              <label class="block font-bold text-slate-700 mb-1">Tetapkan Wali Kelas</label>
              <select id="edit-r-teacher" class="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs text-slate-800 focus:border-emerald-600 focus:outline-none">
                <option value="">-- Tanpa Wali Kelas --</option>
                ${appState.teachers.map(t => `
                  <option value="${t.id}" ${t.id === cls.teacher_id ? 'selected' : ''}>${t.full_name}</option>
                `).join('')}
              </select>
            </div>
            <div class="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button type="submit" class="px-5 py-2.5 bg-[#0b3b01] text-white rounded-xl font-bold hover:bg-[#06410a] transition cursor-pointer">
                Simpan Perubahan
              </button>
            </div>
          </form>
        `,
        onMount: (modalBody, close) => {
          modalBody.querySelector("#form-edit-rombel")?.addEventListener("submit", async (e) => {
            e.preventDefault();
            const newName = modalBody.querySelector("#edit-r-name").value.trim();
            const newTeacherId = modalBody.querySelector("#edit-r-teacher").value || null;

            try {
              await supabase.from("classes").update({ name: newName, teacher_id: newTeacherId }).eq("id", cls.id);
              cls.name = newName;
              cls.teacher_id = newTeacherId;
              cls.level = newName.includes("SMP") ? "SMP IT" : newName.includes("RA") ? "RA" : "MA";
              const teacher = appState.teachers.find(t => t.id === newTeacherId);
              cls.homeroom = teacher ? teacher.full_name : "Belum Ditugaskan";
              saveAppState();
              window.dashboardModal.toast(`Rombel "${newName}" berhasil diperbarui!`, "success");
              close();
              refresh();
            } catch (err) {
              window.dashboardModal.toast(`Gagal menyimpan: ${err.message}`, "error");
            }
          });
        }
      });
    });
  });

  // Hapus Rombel
  container.querySelectorAll(".btn-delete-rombel").forEach(btn => {
    btn.addEventListener("click", async () => {
      const id = btn.dataset.id;
      const name = btn.dataset.name;
      if (confirm(`Apakah Anda yakin ingin menghapus rombel "${name}"?`)) {
        try {
          await supabase.from("classes").delete().eq("id", id);
        } catch {}
        appState.classes = appState.classes.filter(c => c.id !== id);
        saveAppState();
        window.dashboardModal.toast(`Rombel "${name}" berhasil dihapus.`, "success");
        refresh();
      }
    });
  });
}
