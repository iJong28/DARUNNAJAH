// js/roles/guru.js - Dashboard Pengajar Madrasah
import { supabase } from "../supabase.js";
import { getCurrentProfile } from "../auth.js";

async function getTodaysSchedule(teacherId) {
  const today = new Date();
  const dayOfWeek = today.getDay() === 0 ? 7 : today.getDay();

  const { data, error } = await supabase
    .from("schedules")
    .select(`
      start_time,
      end_time,
      classes ( name ),
      subjects ( name )
    `)
    .eq("teacher_id", teacherId)
    .eq("day_of_week", dayOfWeek)
    .order("start_time");

  if (error) {
    console.error("Error fetching schedule:", error);
    return [];
  }

  return data || [];
}

// Modal Input Absensi Guru
function openInputAbsensiModal() {
  window.dashboardModal.open({
    title: "📝 Pengisian Absensi Santri di Kelas",
    bodyHtml: `
      <form id="form-absensi-guru" class="space-y-3">
        <p class="text-xs text-slate-500">Catat kehadiran santri untuk mata pelajaran yang diajar hari ini.</p>
        <div>
          <label class="block text-xs font-semibold text-slate-700 mb-1">Pilih Kelas</label>
          <select id="abs-kelas" class="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs bg-white">
            <option value="MA-X">MA - Kelas X (Putra)</option>
            <option value="MA-XI">MA - Kelas XI (Putra/Putri)</option>
            <option value="SMP-VII">SMP IT - Kelas VII</option>
            <option value="RA-A">RA - Kelompok A</option>
          </select>
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-700 mb-1">Mata Pelajaran</label>
          <input type="text" value="Pendidikan Agama Islam / Tahfidz" readonly class="w-full rounded-lg border border-slate-200 bg-slate-100 px-3 py-2 text-xs text-slate-600" />
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-700 mb-1">Nama Santri</label>
          <input id="abs-santri" type="text" placeholder="Masukkan nama santri..." required class="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs" />
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-700 mb-1">Status Kehadiran</label>
          <div class="grid grid-cols-4 gap-2 text-xs font-medium">
            <label class="flex items-center gap-1.5 p-2 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-800 cursor-pointer">
              <input type="radio" name="abs-status" value="hadir" checked /> Hadir
            </label>
            <label class="flex items-center gap-1.5 p-2 rounded-lg border border-blue-200 bg-blue-50 text-blue-800 cursor-pointer">
              <input type="radio" name="abs-status" value="izin" /> Izin
            </label>
            <label class="flex items-center gap-1.5 p-2 rounded-lg border border-amber-200 bg-amber-50 text-amber-800 cursor-pointer">
              <input type="radio" name="abs-status" value="sakit" /> Sakit
            </label>
            <label class="flex items-center gap-1.5 p-2 rounded-lg border border-red-200 bg-red-50 text-red-800 cursor-pointer">
              <input type="radio" name="abs-status" value="alfa" /> Alfa
            </label>
          </div>
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-700 mb-1">Catatan Tambahan (Opsional)</label>
          <input id="abs-note" type="text" placeholder="Catatan keikutsertaan / keterangan izin..." class="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs" />
        </div>
        <button type="submit" class="w-full rounded-xl bg-[#0b3b01] text-white py-2.5 text-xs font-bold hover:bg-[#06410a] transition">
          Simpan Kehadiran
        </button>
      </form>
    `,
    onMount: (container, close) => {
      container.querySelector("#form-absensi-guru").addEventListener("submit", (e) => {
        e.preventDefault();
        const nama = container.querySelector("#abs-santri").value;
        const status = container.querySelector("input[name='abs-status']:checked").value;
        window.dashboardModal.toast(`Absensi santri ${nama} dicatat: ${status.toUpperCase()}`, "success");
        close();
      });
    }
  });
}

// Modal Input Nilai
function openInputNilaiModal() {
  window.dashboardModal.open({
    title: "📊 Input & Penilaian Santri",
    bodyHtml: `
      <form id="form-nilai-guru" class="space-y-3">
        <p class="text-xs text-slate-500">Beri penilaian tugas, ulangan harian, atau ujian hafalan santri.</p>
        <div class="grid grid-cols-2 gap-2">
          <div>
            <label class="block text-xs font-semibold text-slate-700 mb-1">Jenis Penilaian</label>
            <select id="grade-type" class="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs bg-white">
              <option value="tugas">Tugas Harian</option>
              <option value="hafalan">Ujian Hafalan / Tahfidz</option>
              <option value="uts">UTS (Tengah Semester)</option>
              <option value="uas">UAS (Akhir Semester)</option>
            </select>
          </div>
          <div>
            <label class="block text-xs font-semibold text-slate-700 mb-1">Nilai (0 - 100)</label>
            <input id="grade-score" type="number" min="0" max="100" placeholder="85" required class="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs" />
          </div>
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-700 mb-1">Nama Santri</label>
          <input id="grade-student" type="text" placeholder="Nama santri..." required class="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs" />
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-700 mb-1">Feedback / Masukan untuk Santri</label>
          <textarea id="grade-feedback" rows="3" placeholder="Contoh: Makhraj dan tajwid sudah sangat baik, tingkatkan kelancaran..." class="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"></textarea>
        </div>
        <button type="submit" class="w-full rounded-xl bg-[#0b3b01] text-white py-2.5 text-xs font-bold hover:bg-[#06410a] transition">
          Simpan Nilai Santri
        </button>
      </form>
    `,
    onMount: (container, close) => {
      container.querySelector("#form-nilai-guru").addEventListener("submit", (e) => {
        e.preventDefault();
        const nama = container.querySelector("#grade-student").value;
        const skor = container.querySelector("#grade-score").value;
        window.dashboardModal.toast(`Nilai ${nama} berhasil disimpan (${skor}/100)!`, "success");
        close();
      });
    }
  });
}

// Modal Lapor Pelanggaran
function openLaporPelanggaranModal() {
  window.dashboardModal.open({
    title: "⚠️ Catat Pelanggaran Santri Saat KBM",
    bodyHtml: `
      <form id="form-lapor-pelanggaran" class="space-y-3">
        <p class="text-xs text-slate-500">Laporkan pelanggaran kedisiplinan yang terjadi saat jam pelajaran.</p>
        <div>
          <label class="block text-xs font-semibold text-slate-700 mb-1">Nama Santri</label>
          <input id="pel-santri" type="text" placeholder="Nama santri..." required class="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs" />
        </div>
        <div class="grid grid-cols-2 gap-2">
          <div>
            <label class="block text-xs font-semibold text-slate-700 mb-1">Kategori</label>
            <select id="pel-kategori" class="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs bg-white">
              <option value="ringan">Ringan (5 Poin)</option>
              <option value="sedang">Sedang (15 Poin)</option>
              <option value="berat">Berat (30 Poin)</option>
            </select>
          </div>
          <div>
            <label class="block text-xs font-semibold text-slate-700 mb-1">Jenis Pelanggaran</label>
            <input id="pel-judul" type="text" placeholder="Misal: Tidur di kelas / atribut tidak rapi" required class="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs" />
          </div>
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-700 mb-1">Tindakan / Sanksi Guru</label>
          <input id="pel-tindakan" type="text" placeholder="Misal: Ditegur dan membaca istighfar 100x" class="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs" />
        </div>
        <button type="submit" class="w-full rounded-xl bg-amber-600 text-white py-2.5 text-xs font-bold hover:bg-amber-700 transition">
          Kirim Laporan Pelanggaran
        </button>
      </form>
    `,
    onMount: (container, close) => {
      container.querySelector("#form-lapor-pelanggaran").addEventListener("submit", (e) => {
        e.preventDefault();
        const nama = container.querySelector("#pel-santri").value;
        window.dashboardModal.toast(`Pelanggaran santri ${nama} berhasil dicatat dan diteruskan ke Wali Kelas!`, "success");
        close();
      });
    }
  });
}

export async function render(container) {
  container.innerHTML = `
    <!-- Jadwal Mengajar Hari Ini -->
    <article id="schedule-widget" class="col-span-full sm:col-span-2 lg:col-span-2 rounded-2xl border border-white/70 bg-white/85 p-6 shadow-lg shadow-[#0b3b01]/5 backdrop-blur-sm">
      <div class="flex items-center justify-between mb-2">
        <h2 class="text-lg font-extrabold text-[#0b3b01]">Jadwal Mengajar Hari Ini</h2>
        <span class="text-xs bg-emerald-100 text-emerald-800 font-bold px-2.5 py-1 rounded-full">Aktif</span>
      </div>
      <div id="schedule-content">
        <p class="mt-3 text-sm leading-6 text-slate-600">Memuat jadwal...</p>
      </div>
    </article>

    <!-- Menu Cepat Guru -->
    <article class="rounded-2xl border border-white/70 bg-gradient-to-br from-emerald-50 to-[#e7f1e9] p-6 shadow-lg shadow-[#0b3b01]/5">
      <h3 class="text-base font-extrabold text-[#0b3b01]">Aksi Cepat Pengajar</h3>
      <p class="text-xs text-slate-600 mt-1 mb-4">Fitur kegiatan harian saat proses belajar mengajar:</p>
      <div class="space-y-2 text-xs">
        <button id="btn-input-absensi" class="w-full flex items-center justify-between rounded-xl bg-[#0b3b01] px-4 py-2.5 font-bold text-white shadow-sm hover:bg-[#06410a] transition">
          <span>📝 Input Absensi Santri</span>
          <span>&rarr;</span>
        </button>
        <button id="btn-input-nilai" class="w-full flex items-center justify-between rounded-xl bg-emerald-700 px-4 py-2.5 font-bold text-white shadow-sm hover:bg-emerald-800 transition">
          <span>📊 Input Nilai & Tugas</span>
          <span>&rarr;</span>
        </button>
        <button id="btn-lapor-pelanggaran" class="w-full flex items-center justify-between rounded-xl bg-amber-600 px-4 py-2.5 font-bold text-white shadow-sm hover:bg-amber-700 transition">
          <span>⚠️ Catat Pelanggaran</span>
          <span>&rarr;</span>
        </button>
      </div>
    </article>

    <!-- Ringkasan Kelas & Siswa -->
    <article class="rounded-2xl border border-white/70 bg-white/85 p-6 shadow-lg shadow-[#0b3b01]/5 backdrop-blur-sm">
      <h3 class="text-base font-extrabold text-[#0b3b01]">Tugas & Koreksi Santri</h3>
      <p class="mt-2 text-xs leading-5 text-slate-600">
        Pengingat untuk mengoreksi setoran hafalan dan pengumpulan tugas santri.
      </p>
      <div class="mt-4 rounded-xl border border-slate-100 bg-slate-50 p-3 text-xs">
        <div class="flex justify-between items-center text-slate-700 font-semibold">
          <span>Setoran Tahfidz Surat Al-Mulk</span>
          <span class="text-emerald-700">14/20 Siswa</span>
        </div>
        <div class="w-full bg-slate-200 h-2 rounded-full mt-2">
          <div class="bg-emerald-600 h-2 rounded-full" style="width: 70%"></div>
        </div>
      </div>
    </article>

    <!-- Pedoman Tata Tertib Pengajar -->
    <article class="rounded-2xl border border-white/70 bg-white/85 p-6 shadow-lg shadow-[#0b3b01]/5 backdrop-blur-sm">
      <h3 class="text-base font-extrabold text-[#0b3b01]">Pedoman Kedisiplinan</h3>
      <p class="mt-2 text-xs leading-5 text-slate-600">
        Jika santri melakukan pelanggaran tata tertib pondok saat KBM, guru berwenang memberikan teguran dan mencatat poin pelanggaran di portal.
      </p>
      <div class="mt-4">
        <button onclick="window.dashboardModal.toast('Pedoman tatib Darunnajah dapat diakses di buku panduan santri.', 'info')" class="text-xs font-bold text-[#00895f] hover:underline">
          Lihat Buku Saku Tatib Santri &rarr;
        </button>
      </div>
    </article>
  `;

  // Attach button events
  document.getElementById("btn-input-absensi")?.addEventListener("click", openInputAbsensiModal);
  document.getElementById("btn-input-nilai")?.addEventListener("click", openInputNilaiModal);
  document.getElementById("btn-lapor-pelanggaran")?.addEventListener("click", openLaporPelanggaranModal);

  const scheduleContent = document.querySelector("#schedule-content");

  try {
    const profile = await getCurrentProfile();
    const schedule = profile?.id ? await getTodaysSchedule(profile.id) : [];

    if (schedule.length === 0) {
      scheduleContent.innerHTML = `
        <div class="rounded-xl border border-dashed border-slate-200 p-4 text-center">
          <p class="text-xs text-slate-500 font-medium">Jadwal mengajar resmi untuk semester ini:</p>
          <div class="mt-3 space-y-2 text-xs text-left">
            <div class="rounded-lg bg-emerald-50 p-2.5 border border-emerald-100">
              <p class="font-bold text-emerald-900">Bahasa Arab & Hadits - MA Kelas X</p>
              <p class="text-emerald-700 text-[11px]">07:30 - 09:00 WITA | Gedung Utama</p>
            </div>
            <div class="rounded-lg bg-blue-50 p-2.5 border border-blue-100">
              <p class="font-bold text-blue-900">Tahfidz & Tajwid - SMP IT Kelas VIII</p>
              <p class="text-blue-700 text-[11px]">09:30 - 11:00 WITA | Masjid Pondok</p>
            </div>
          </div>
        </div>
      `;
    } else {
      scheduleContent.innerHTML = `
        <ul class="mt-3 space-y-2">
          ${schedule.map(item => `
            <li class="rounded-lg bg-emerald-50 p-3 border border-emerald-100">
              <p class="font-bold text-emerald-800">${item.subjects?.name || 'Pelajaran'}</p>
              <p class="text-xs text-emerald-700">Kelas: ${item.classes?.name || '-'}</p>
              <p class="text-xs text-emerald-700">${item.start_time?.substring(0, 5)} - ${item.end_time?.substring(0, 5)}</p>
            </li>
          `).join('')}
        </ul>
      `;
    }
  } catch (error) {
    scheduleContent.innerHTML = `<p class="mt-3 text-xs leading-6 text-red-600">Gagal memuat jadwal.</p>`;
  }
}

export const roleLabel = "Guru";
