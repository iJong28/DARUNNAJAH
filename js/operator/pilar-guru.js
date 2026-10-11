// ============================================================================
// PILAR 2: GURU (Data Guru & Mapel Ampuh)
// ============================================================================

import { supabase, supabaseUrl, supabaseAnonKey } from "../supabase.js";
import { appState, saveAppState } from "./state.js";

// 2.a. Data Guru (Akun & Biodata Guru)
export function renderGuruDataPage(container) {
  container.innerHTML = `
    <div class="rounded-3xl border border-white/70 bg-white/95 p-6 shadow-xl shadow-[#0b3b01]/5 space-y-5">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 class="text-xl font-black text-[#0b3b01]">Data Guru & Akun Pengajar</h3>
          <p class="text-xs text-slate-500 mt-0.5">Kelola akun pendidik, biodata asatidz, dan kontak guru madrasah.</p>
        </div>
        <button id="btn-add-guru" class="inline-flex items-center gap-2 rounded-xl bg-[#0b3b01] px-4 py-2.5 text-xs font-bold text-white hover:bg-[#06410a] transition shadow-md cursor-pointer">
          <span>➕</span> Tambah Guru Baru
        </button>
      </div>

      <div class="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
        <table class="w-full text-left text-xs">
          <thead class="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-600">
            <tr>
              <th class="px-4 py-3.5">Nama Guru & Kontak</th>
              <th class="px-4 py-3.5">NIP / NIY</th>
              <th class="px-4 py-3.5">Peran Otoritas</th>
              <th class="px-4 py-3.5">Status</th>
              <th class="px-4 py-3.5 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            ${appState.teachers.map(t => `
              <tr class="hover:bg-slate-50/60 transition">
                <td class="px-4 py-3">
                  <div class="flex items-center gap-3">
                    <div class="h-8 w-8 rounded-full bg-emerald-100 text-[#0b3b01] font-bold flex items-center justify-center text-xs">
                      ${t.full_name.charAt(0)}
                    </div>
                    <div>
                      <p class="font-bold text-slate-900">${t.full_name}</p>
                      <p class="text-[11px] text-slate-500">${t.email}</p>
                    </div>
                  </div>
                </td>
                <td class="px-4 py-3 font-mono text-slate-700">${t.nip}</td>
                <td class="px-4 py-3">
                  <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    ${t.role.toUpperCase()}
                  </span>
                </td>
                <td class="px-4 py-3 text-emerald-700 font-bold">🟢 Aktif Mengajar</td>
                <td class="px-4 py-3 text-center">
                  <div class="inline-flex items-center gap-1.5 justify-center">
                    <button class="btn-edit-guru text-[11px] font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1.5 rounded-xl transition cursor-pointer" data-id="${t.id}">
                      ✏️ Edit
                    </button>
                    <button class="btn-delete-guru text-[11px] font-bold text-red-600 bg-red-50 hover:bg-red-100 px-2.5 py-1.5 rounded-xl transition cursor-pointer" data-id="${t.id}" data-name="${t.full_name}">
                      🗑️ Hapus
                    </button>
                  </div>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;

  const refresh = () => renderGuruDataPage(container);

  // Modal Tambah Guru
  document.getElementById("btn-add-guru")?.addEventListener("click", () => {
    window.dashboardModal.open({
      title: "➕ Tambah Akun & Biodata Guru Baru",
      bodyHtml: `
        <form id="form-modal-guru" class="space-y-3.5 text-xs">
          <div>
            <label class="block font-bold text-slate-700 mb-1">Nama Lengkap & Gelar <span class="text-red-500">*</span></label>
            <input id="g-name" type="text" placeholder="Contoh: Ustadz Ahmad Fauzan, S.Pd." required
              class="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs text-slate-800 focus:border-emerald-600 focus:outline-none" />
          </div>

          <div>
            <label class="block font-bold text-slate-700 mb-1">
              Email Aktif Guru <span class="text-emerald-700 font-semibold">(Digunakan untuk Login)</span> <span class="text-red-500">*</span>
            </label>
            <input id="g-email" type="email" placeholder="Contoh: ustadz.fauzan@gmail.com atau fauzan@darunnajah.sch.id" required
              class="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs text-slate-800 focus:border-emerald-600 focus:outline-none" />
            <p class="mt-1 text-[10px] text-slate-500">Email ini akan digunakan oleh guru sebagai username login ke sistem.</p>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="block font-bold text-slate-700 mb-1">Kata Sandi Awal <span class="text-red-500">*</span></label>
              <input id="g-password" type="text" value="Password123!" placeholder="Minimal 6 karakter" required minlength="6"
                class="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs font-mono text-slate-800 focus:border-emerald-600 focus:outline-none" />
              <p class="mt-0.5 text-[10px] text-slate-400">Dapat diganti oleh guru setelah login.</p>
            </div>
            <div>
              <label class="block font-bold text-slate-700 mb-1">NIP / NIY <span class="text-red-500">*</span></label>
              <input id="g-nip" type="text" placeholder="Nomor Induk Pegawai" required
                class="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs text-slate-800 focus:border-emerald-600 focus:outline-none" />
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="block font-bold text-slate-700 mb-1">Nomor WhatsApp / HP</label>
              <input id="g-phone" type="tel" placeholder="Contoh: 081234567890"
                class="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs text-slate-800 focus:border-emerald-600 focus:outline-none" />
            </div>
            <div>
              <label class="block font-bold text-slate-700 mb-1">Peran Akun <span class="text-red-500">*</span></label>
              <select id="g-role" class="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs text-slate-800 focus:border-emerald-600 focus:outline-none">
                <option value="guru">Dewan Guru (Pengajar)</option>
                <option value="walikelas">Wali Kelas</option>
                <option value="kepala_madrasah">Kepala Madrasah</option>
              </select>
            </div>
          </div>

          <div class="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button id="btn-submit-guru-modal" type="submit" class="px-5 py-2.5 bg-[#0b3b01] text-white rounded-xl font-bold hover:bg-[#06410a] transition cursor-pointer shadow-md">
              💾 Daftarkan & Simpan Akun Guru
            </button>
          </div>
        </form>
      `,
      onMount: (modalBody, close) => {
        modalBody.querySelector("#form-modal-guru")?.addEventListener("submit", async (e) => {
          e.preventDefault();
          const name = modalBody.querySelector("#g-name").value.trim();
          const email = modalBody.querySelector("#g-email").value.trim().toLowerCase();
          const password = modalBody.querySelector("#g-password").value;
          const nip = modalBody.querySelector("#g-nip").value.trim();
          const phone = modalBody.querySelector("#g-phone").value.trim() || "0812-3456-7890";
          const role = modalBody.querySelector("#g-role").value;
          const submitBtn = modalBody.querySelector("#btn-submit-guru-modal");

          if (!email || !password) {
            window.dashboardModal.toast("Email dan kata sandi wajib diisi!", "error");
            return;
          }

          submitBtn.disabled = true;
          submitBtn.textContent = "Mendaftarkan akun...";

          try {
            let newUserId = `usr-${Date.now()}`;

            // Daftarkan langsung ke Supabase Auth melalui REST API endpoint jika online
            if (supabaseUrl && supabaseAnonKey) {
              try {
                const signupRes = await fetch(`${supabaseUrl}/auth/v1/signup`, {
                  method: "POST",
                  headers: {
                    "apikey": supabaseAnonKey,
                    "Content-Type": "application/json"
                  },
                  body: JSON.stringify({
                    email,
                    password,
                    data: {
                      full_name: name,
                      role: role
                    }
                  })
                });

                const signupData = await signupRes.json();
                if (signupRes.ok && signupData?.user?.id) {
                  newUserId = signupData.user.id;
                }
              } catch (authErr) {
                console.warn("Supabase auth signup:", authErr);
              }
            }

            // Tambahkan ke state lokal agar tabel langsung terupdate
            const newTeacherObj = {
              id: newUserId,
              full_name: name,
              email: email,
              role: role,
              nip: nip,
              phone: phone,
              gender: "Laki-laki",
              status: "Aktif Mengajar"
            };

            appState.teachers.unshift(newTeacherObj);
            appState.users.unshift(newTeacherObj);
            saveAppState();

            window.dashboardModal.toast(`Akun guru "${name}" (${email}) berhasil didaftarkan dan disimpan!`, "success");
            close();
            refresh();
          } catch (err) {
            console.error("Gagal menambahkan guru:", err);
            window.dashboardModal.toast(err?.message || "Gagal mendaftarkan akun guru.", "error");
          } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = "💾 Daftarkan & Simpan Akun Guru";
          }
        });
      }
    });
  });

  // Edit Biodata Guru
  container.querySelectorAll(".btn-edit-guru").forEach(btn => {
    btn.addEventListener("click", () => {
      const guru = appState.teachers.find(t => t.id === btn.dataset.id);
      if (!guru) return;

      window.dashboardModal.open({
        title: `✏️ Edit Biodata: ${guru.full_name}`,
        bodyHtml: `
          <form id="form-edit-guru" class="space-y-3.5 text-xs">
            <div>
              <label class="block font-bold text-slate-700 mb-1">Nama Lengkap</label>
              <input id="eg-name" type="text" value="${guru.full_name}" required
                class="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs text-slate-800 focus:border-emerald-600 focus:outline-none" />
            </div>
            <div>
              <label class="block font-bold text-slate-700 mb-1">Email Akun (Digunakan untuk Login)</label>
              <input id="eg-email" type="email" value="${guru.email}" readonly
                class="w-full rounded-xl border border-slate-200 bg-slate-100 px-3.5 py-2.5 text-xs text-slate-600 font-mono cursor-not-allowed" />
              <p class="mt-0.5 text-[10px] text-slate-400">Email otentikasi login guru.</p>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label class="block font-bold text-slate-700 mb-1">NIP / NIY</label>
                <input id="eg-nip" type="text" value="${guru.nip}" required
                  class="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs text-slate-800 focus:border-emerald-600 focus:outline-none" />
              </div>
              <div>
                <label class="block font-bold text-slate-700 mb-1">Nomor WhatsApp / HP</label>
                <input id="eg-phone" type="tel" value="${guru.phone || ''}" placeholder="0812-xxxx-xxxx"
                  class="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs text-slate-800 focus:border-emerald-600 focus:outline-none" />
              </div>
            </div>
            <div>
              <label class="block font-bold text-slate-700 mb-1">Peran Otoritas</label>
              <select id="eg-role" class="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs text-slate-800 focus:border-emerald-600 focus:outline-none">
                <option value="guru" ${guru.role === 'guru' ? 'selected' : ''}>Guru</option>
                <option value="walikelas" ${guru.role === 'walikelas' ? 'selected' : ''}>Wali Kelas</option>
                <option value="kepala_madrasah" ${guru.role === 'kepala_madrasah' ? 'selected' : ''}>Kepala Madrasah</option>
              </select>
            </div>
            <div class="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button type="submit" class="px-5 py-2.5 bg-[#0b3b01] text-white rounded-xl font-bold hover:bg-[#06410a] transition cursor-pointer shadow-md">
                Simpan Perubahan
              </button>
            </div>
          </form>
        `,
        onMount: (modalBody, close) => {
          modalBody.querySelector("#form-edit-guru")?.addEventListener("submit", async (e) => {
            e.preventDefault();
            guru.full_name = modalBody.querySelector("#eg-name").value.trim();
            guru.nip = modalBody.querySelector("#eg-nip").value.trim();
            guru.phone = modalBody.querySelector("#eg-phone").value.trim() || guru.phone;
            guru.role = modalBody.querySelector("#eg-role").value;

            // Sinkronkan ke appState.users juga
            const uIdx = appState.users.findIndex(u => u.id === guru.id);
            if (uIdx !== -1) {
              appState.users[uIdx].full_name = guru.full_name;
              appState.users[uIdx].nip = guru.nip;
              appState.users[uIdx].phone = guru.phone;
              appState.users[uIdx].role = guru.role;
            }

            saveAppState();

            try {
              await supabase.from("profiles").update({ full_name: guru.full_name, role: guru.role }).eq("id", guru.id);
            } catch (supErr) {
              console.warn("Supabase profile update:", supErr);
            }

            window.dashboardModal.toast("Biodata guru berhasil diperbarui dan disimpan!", "success");
            close();
            refresh();
          });
        }
      });
    });
  });

  // Hapus Guru
  container.querySelectorAll(".btn-delete-guru").forEach(btn => {
    btn.addEventListener("click", async () => {
      const id = btn.dataset.id;
      const name = btn.dataset.name;
      if (confirm(`Apakah Anda yakin ingin menghapus data guru "${name}"?`)) {
        appState.teachers = appState.teachers.filter(t => t.id !== id);
        appState.users = appState.users.filter(u => u.id !== id);
        saveAppState();

        try {
          await supabase.from("profiles").delete().eq("id", id);
        } catch {}

        window.dashboardModal.toast(`Data guru "${name}" berhasil dihapus.`, "success");
        refresh();
      }
    });
  });
}

// 2.b. Mapel Ampuh (Pengaturan Guru Mengajar Mapel Apa dan di Kelas Mana)
export function renderGuruMapelPage(container) {
  container.innerHTML = `
    <div class="rounded-3xl border border-white/70 bg-white/95 p-6 shadow-xl shadow-[#0b3b01]/5 space-y-5">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 class="text-xl font-black text-[#0b3b01]">Pengaturan Mapel Ampuh Guru</h3>
          <p class="text-xs text-slate-500 mt-0.5">Distribusi penugasan guru mengajar mata pelajaran tertentu di tiap rombel.</p>
        </div>
        <button id="btn-add-assignment" class="inline-flex items-center gap-2 rounded-xl bg-[#0b3b01] px-4 py-2.5 text-xs font-bold text-white hover:bg-[#06410a] transition shadow-md cursor-pointer">
          <span>➕</span> Tambah Penugasan Mengajar
        </button>
      </div>

      <div class="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
        <table class="w-full text-left text-xs">
          <thead class="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-600">
            <tr>
              <th class="px-4 py-3.5">Nama Guru Pengampu</th>
              <th class="px-4 py-3.5">Mata Pelajaran yang Diampu</th>
              <th class="px-4 py-3.5">Rombel / Kelas</th>
              <th class="px-4 py-3.5">Alokasi Waktu</th>
              <th class="px-4 py-3.5 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            ${appState.teachingAssignments.length === 0 ? `
              <tr>
                <td colspan="5" class="p-8 text-center text-slate-400">Belum ada data penugasan mapel ampuh guru.</td>
              </tr>
            ` : appState.teachingAssignments.map(asg => `
              <tr class="hover:bg-slate-50/60 transition">
                <td class="px-4 py-3 font-bold text-slate-900">👨‍🏫 ${asg.teacherName}</td>
                <td class="px-4 py-3 font-semibold text-emerald-800">📖 ${asg.subjectName}</td>
                <td class="px-4 py-3 text-slate-700">🏫 ${asg.className}</td>
                <td class="px-4 py-3 text-slate-500">${asg.hours}</td>
                <td class="px-4 py-3 text-center">
                  <button class="btn-delete-asg text-red-600 hover:text-red-800 font-bold px-2.5 py-1 rounded-lg bg-red-50 cursor-pointer" data-id="${asg.id}">
                    Hapus
                  </button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;

  const refresh = () => renderGuruMapelPage(container);

  // Modal Tambah Penugasan
  document.getElementById("btn-add-assignment")?.addEventListener("click", () => {
    window.dashboardModal.open({
      title: "➕ Tambah Penugasan Mapel Ampuh",
      bodyHtml: `
        <form id="form-modal-asg" class="space-y-3.5 text-xs">
          <div>
            <label class="block font-bold text-slate-700 mb-1">Pilih Guru Pengampu</label>
            <select id="asg-teacher" required class="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs text-slate-800 focus:border-emerald-600 focus:outline-none">
              ${appState.teachers.map(t => `<option value="${t.id}">${t.full_name}</option>`).join('')}
            </select>
          </div>
          <div>
            <label class="block font-bold text-slate-700 mb-1">Mata Pelajaran</label>
            <select id="asg-subject" required class="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs text-slate-800 focus:border-emerald-600 focus:outline-none">
              ${appState.subjects.map(s => `<option value="${s.id}">${s.name} (${s.code})</option>`).join('')}
            </select>
          </div>
          <div>
            <label class="block font-bold text-slate-700 mb-1">Rombel / Kelas yang Diajar</label>
            <select id="asg-class" required class="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs text-slate-800 focus:border-emerald-600 focus:outline-none">
              ${appState.classes.map(c => `<option value="${c.id}">${c.name}</option>`).join('')}
            </select>
          </div>
          <div class="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button type="submit" class="px-5 py-2.5 bg-[#0b3b01] text-white rounded-xl font-bold hover:bg-[#06410a] transition cursor-pointer">
              Simpan Penugasan
            </button>
          </div>
        </form>
      `,
      onMount: (modalBody, close) => {
        modalBody.querySelector("#form-modal-asg")?.addEventListener("submit", async (e) => {
          e.preventDefault();
          const tId = modalBody.querySelector("#asg-teacher").value;
          const sId = modalBody.querySelector("#asg-subject").value;
          const cId = modalBody.querySelector("#asg-class").value;

          const teacher = appState.teachers.find(t => t.id === tId);
          const subject = appState.subjects.find(s => s.id === sId);
          const cls = appState.classes.find(c => c.id === cId);

          try {
            await supabase.from("schedules").insert([{
              teacher_id: tId,
              subject_id: sId,
              class_id: cId,
              day_of_week: 1,
              start_time: "07:30:00",
              end_time: "09:00:00"
            }]);
          } catch {}

          appState.teachingAssignments.push({
            id: `asg-${Date.now()}`,
            teacherId: tId,
            teacherName: teacher?.full_name || "Guru",
            subjectId: sId,
            subjectName: subject?.name || "Mapel",
            classId: cId,
            className: cls?.name || "Kelas",
            hours: "07:30 - 09:00"
          });
          saveAppState();

          window.dashboardModal.toast(`Penugasan ${teacher?.full_name} untuk ${subject?.name} di ${cls?.name} berhasil disimpan!`, "success");
          close();
          refresh();
        });
      }
    });
  });

  // Hapus Penugasan
  container.querySelectorAll(".btn-delete-asg").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.id;
      appState.teachingAssignments = appState.teachingAssignments.filter(a => a.id !== id);
      saveAppState();
      window.dashboardModal.toast("Penugasan mengajar dihapus.", "info");
      refresh();
    });
  });
}
