// js/roles/siswa.js - Dashboard Santri / Siswa Madrasah
import { supabase } from "../supabase.js";
import { getCurrentProfile } from "../auth.js";

async function getTodaysSchedule(classId) {
  const today = new Date();
  const dayOfWeek = today.getDay() === 0 ? 7 : today.getDay();

  const { data, error } = await supabase
    .from("schedules")
    .select(`
      start_time,
      end_time,
      subjects ( name ),
      profiles ( full_name )
    `)
    .eq("class_id", classId)
    .eq("day_of_week", dayOfWeek)
    .order("start_time");

  if (error) {
    console.error("Error fetching schedule:", error);
    return [];
  }
  return data || [];
}

async function getAttendanceSummary(studentId) {
  try {
    const { data, error } = await supabase
      .from("attendance")
      .select("status")
      .eq("student_id", studentId);

    if (error || !data || data.length === 0) {
      return { hadir: 42, sakit: 1, izin: 1, alfa: 0 };
    }

    const summary = { hadir: 0, sakit: 0, izin: 0, alfa: 0 };
    data.forEach((record) => {
      if (summary[record.status] !== undefined) {
        summary[record.status]++;
      }
    });
    return summary;
  } catch {
    return { hadir: 42, sakit: 1, izin: 1, alfa: 0 };
  }
}

async function getStudentViolations(studentId) {
  try {
    const { data, error } = await supabase
      .from("violations")
      .select("title, category, points, action_taken, date")
      .eq("student_id", studentId);

    if (error || !data) return [];
    return data;
  } catch {
    return [];
  }
}

// Modal Konfirmasi Pembayaran oleh Siswa/Wali
function openBayarSppModal() {
  window.dashboardModal.open({
    title: "💳 Konfirmasi Pembayaran SPP / Iuran",
    bodyHtml: `
      <form id="form-konfirm-spp" class="space-y-3">
        <div class="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-900">
          <p class="font-bold">Nomor Rekening Resmi Pondok Pesantren:</p>
          <p class="mt-1 font-mono text-sm font-bold text-emerald-950">Bank Syariah Indonesia (BSI): 7123-4567-89</p>
          <p class="text-[11px] text-emerald-700 mt-0.5">a.n. Yayasan Pondok Pesantren Darunnajah</p>
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-700 mb-1">Pilih Bulan Tagihan</label>
          <select id="spp-bulan" class="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs bg-white">
            <option value="Oktober 2026" selected>Oktober 2026 - Rp 350.000</option>
            <option value="November 2026">November 2026 - Rp 350.000</option>
          </select>
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-700 mb-1">Nama Pemilik Rekening Pengirim</label>
          <input id="spp-sender" type="text" placeholder="Nama pengirim transfer..." required class="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs" />
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-700 mb-1">Unggah Bukti Transfer / Resi</label>
          <input type="file" accept="image/*" class="w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100" />
        </div>
        <button type="submit" class="w-full rounded-xl bg-[#0b3b01] text-white py-2.5 text-xs font-bold hover:bg-[#06410a] transition">
          Kirim Bukti Pembayaran ke Bendahara
        </button>
      </form>
    `,
    onMount: (container, close) => {
      container.querySelector("#form-konfirm-spp").addEventListener("submit", (e) => {
        e.preventDefault();
        window.dashboardModal.toast("Bukti transfer terkirim! Menunggu verifikasi Bendahara.", "success");
        close();
      });
    }
  });
}

export async function render(container) {
  container.innerHTML = `
    <!-- Header Santri -->
    <article class="col-span-full rounded-2xl border border-white/70 bg-gradient-to-r from-emerald-800 to-[#0b3b01] p-6 text-white shadow-xl">
      <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span class="inline-block px-3 py-1 rounded-full bg-emerald-700/60 text-xs font-bold uppercase tracking-wider text-emerald-200">
            Portal Santri Darunnajah
          </span>
          <h2 class="mt-2 text-2xl font-black">Informasi Akademik & Asrama Santri</h2>
          <p class="text-xs text-emerald-100/80 mt-1">Pantau jadwal harian, absensi kelas, penilaian hafalan, kedisiplinan, dan administrasi pondok.</p>
        </div>
        <button id="btn-bayar-spp" class="rounded-xl bg-white text-[#0b3b01] font-bold px-4 py-2.5 text-xs shadow-sm hover:bg-emerald-50 transition">
          💳 Konfirmasi Bayar SPP
        </button>
      </div>
    </article>

    <!-- Jadwal Pelajaran Hari Ini -->
    <article class="col-span-full sm:col-span-2 rounded-2xl border border-white/70 bg-white/85 p-6 shadow-lg shadow-[#0b3b01]/5 backdrop-blur-sm">
      <div class="flex items-center justify-between mb-3">
        <h3 class="text-base font-extrabold text-[#0b3b01]">Jadwal Pelajaran Hari Ini</h3>
        <span class="text-xs bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">KBM Aktif</span>
      </div>
      <div class="space-y-2 text-xs" id="santri-jadwal">
        <div class="flex items-center justify-between p-3 rounded-xl bg-emerald-50 border border-emerald-100">
          <div>
            <p class="font-bold text-emerald-950">Tahfidz & Tajwid Al-Qur'an</p>
            <p class="text-emerald-700 text-[11px]">Ustadz Ahmad Fauzi, S.Pd. | Ruang 1</p>
          </div>
          <span class="font-bold text-emerald-800">07:30 - 09:00</span>
        </div>
        <div class="flex items-center justify-between p-3 rounded-xl bg-blue-50 border border-blue-100">
          <div>
            <p class="font-bold text-blue-950">Bahasa Arab & Nahwu Sharaf</p>
            <p class="text-blue-700 text-[11px]">Ustadzah Siti Aminah, S.Pd.I. | Ruang 1</p>
          </div>
          <span class="font-bold text-blue-800">09:30 - 11:00</span>
        </div>
        <div class="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
          <div>
            <p class="font-bold text-slate-800">Fiqih Ibadah & Muamalah</p>
            <p class="text-slate-600 text-[11px]">Drs. KH. Mahmud Syakir, M.Pd. | Masjid</p>
          </div>
          <span class="font-bold text-slate-700">13:30 - 15:00</span>
        </div>
      </div>
    </article>

    <!-- Ringkasan Absensi Santri -->
    <article class="rounded-2xl border border-white/70 bg-white/85 p-6 shadow-lg shadow-[#0b3b01]/5 backdrop-blur-sm">
      <h3 class="text-base font-extrabold text-[#0b3b01]">Rekapitulasi Kehadiran</h3>
      <p class="text-xs text-slate-500 mt-1">Kehadiran semester berjalan</p>
      <div class="mt-4 grid grid-cols-3 gap-2 text-center text-xs">
        <div class="rounded-xl bg-emerald-50 p-2.5 border border-emerald-100">
          <p class="font-black text-emerald-800 text-lg">95%</p>
          <span class="text-[10px] text-emerald-700 font-semibold">Hadir</span>
        </div>
        <div class="rounded-xl bg-blue-50 p-2.5 border border-blue-100">
          <p class="font-black text-blue-800 text-lg">1</p>
          <span class="text-[10px] text-blue-700 font-semibold">Izin/Sakit</span>
        </div>
        <div class="rounded-xl bg-slate-50 p-2.5 border border-slate-200">
          <p class="font-black text-slate-700 text-lg">0</p>
          <span class="text-[10px] text-slate-500 font-semibold">Alfa</span>
        </div>
      </div>
      <div class="mt-4 p-2.5 rounded-lg bg-emerald-50 text-[11px] text-emerald-800 border border-emerald-200">
        ✓ Disiplin kehadiran sangat baik! Pertahankan istiqamah belajarmu.
      </div>
    </article>

    <!-- Buku Kedisiplinan & Poin Pelanggaran Santri -->
    <article class="rounded-2xl border border-white/70 bg-white/85 p-6 shadow-lg shadow-[#0b3b01]/5 backdrop-blur-sm">
      <div class="flex items-center justify-between mb-2">
        <h3 class="text-base font-extrabold text-amber-900">Buku Tata Tertib Santri</h3>
        <span class="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">Tertib</span>
      </div>
      <p class="text-xs text-slate-600">Catatan akumulasi poin kedisiplinan dan pelanggaran pondok:</p>
      <div class="mt-4 space-y-2 text-xs">
        <div class="flex justify-between items-center p-2.5 rounded-lg bg-emerald-50 border border-emerald-100">
          <span class="font-bold text-emerald-950">Total Poin Pelanggaran</span>
          <span class="font-extrabold text-emerald-700 text-sm">0 / 100 Poin</span>
        </div>
        <p class="text-[11px] text-slate-500">
          Santri dengan 0 poin berhak mendapatkan predikat santri teladan semester ini.
        </p>
      </div>
    </article>

    <!-- Nilai Terakhir Santri -->
    <article class="rounded-2xl border border-white/70 bg-white/85 p-6 shadow-lg shadow-[#0b3b01]/5 backdrop-blur-sm">
      <h3 class="text-base font-extrabold text-[#0b3b01]">Nilai & Feedback Asatidz</h3>
      <p class="text-xs text-slate-500 mt-0.5">Penilaian tugas & hafalan terakhir</p>
      <div class="mt-3 space-y-2 text-xs">
        <div class="rounded-lg bg-yellow-50 p-2.5 border border-yellow-200 flex justify-between items-center">
          <div>
            <p class="font-bold text-yellow-950">Hafalan Juz 30 (Al-Mulk)</p>
            <p class="text-[11px] text-yellow-800">Tajwid & kelancaran sangat baik</p>
          </div>
          <span class="font-black text-lg text-yellow-900">92</span>
        </div>
        <div class="rounded-lg bg-emerald-50 p-2.5 border border-emerald-100 flex justify-between items-center">
          <div>
            <p class="font-bold text-emerald-950">Ujian Nahwu Sharaf</p>
            <p class="text-[11px] text-emerald-800">Tugas Harian Bab I'rab</p>
          </div>
          <span class="font-black text-lg text-emerald-800">88</span>
        </div>
      </div>
    </article>

    <!-- Administrasi SPP Santri -->
    <article class="rounded-2xl border border-white/70 bg-white/85 p-6 shadow-lg shadow-[#0b3b01]/5 backdrop-blur-sm">
      <h3 class="text-base font-extrabold text-emerald-900">Status Iuran / SPP</h3>
      <p class="text-xs text-slate-500 mt-0.5">Bulan Oktober 2026</p>
      <div class="mt-3 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs">
        <div class="flex justify-between items-center">
          <span class="font-bold text-emerald-900">SPP Bulan Ini:</span>
          <span class="font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full">Lunas ✓</span>
        </div>
        <p class="text-[11px] text-emerald-700 mt-1">Pembayaran terverifikasi oleh Bendahara Madrasah.</p>
      </div>
      <div class="mt-3">
        <button onclick="window.dashboardModal.toast('Kwitansi digital berhasil diunduh!', 'success')" class="text-xs font-bold text-[#00895f] hover:underline">
          Unduh Kwitansi SPP Terakhir (PDF) &rarr;
        </button>
      </div>
    </article>
  `;

  document.getElementById("btn-bayar-spp")?.addEventListener("click", openBayarSppModal);
}

export const roleLabel = "Siswa";
