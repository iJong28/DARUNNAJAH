// js/roles/guru.js
import { supabase } from "../supabase.js";
import { getCurrentProfile } from "../auth.js";

async function getTodaysSchedule(teacherId) {
  const today = new Date();
  // In JavaScript, getDay() returns 0 for Sunday, 1 for Monday, ..., 6 for Saturday.
  // The schema uses 1 for Monday, ..., 7 for Sunday.
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

  return data;
}

export async function render(container) {
  container.innerHTML = `
    <article id="schedule-widget" class="rounded-2xl border border-white/70 bg-white/85 p-6 shadow-lg shadow-[#0b3b01]/5 backdrop-blur-sm">
      <h2 class="text-lg font-extrabold text-[#0b3b01]">Jadwal Mengajar Hari Ini</h2>
      <div id="schedule-content">
        <p class="mt-3 text-sm leading-6 text-slate-600">Memuat jadwal...</p>
      </div>
    </article>
    <article class="rounded-2xl border border-white/70 bg-white/85 p-6 shadow-lg shadow-[#0b3b01]/5 backdrop-blur-sm">
      <h2 class="text-lg font-extrabold text-[#0b3b01]">Input Absensi Kelas</h2>
      <p class="mt-3 text-sm leading-6 text-slate-600">Akses cepat untuk masuk ke halaman pengisian absensi kelas yang diajar.</p>
    </article>
    <article class="rounded-2xl border border-white/70 bg-white/85 p-6 shadow-lg shadow-[#0b3b01]/5 backdrop-blur-sm">
      <h2 class="text-lg font-extrabold text-[#0b3b01]">Notifikasi Tugas</h2>
      <p class="mt-3 text-sm leading-6 text-slate-600">Pengingat untuk memeriksa tugas siswa yang sudah dikumpulkan.</p>
    </article>
    <article class="rounded-2xl border border-white/70 bg-white/85 p-6 shadow-lg shadow-[#0b3b01]/5 backdrop-blur-sm">
      <h2 class="text-lg font-extrabold text-[#0b3b01]">Akses Cepat Input Nilai</h2>
      <p class="mt-3 text-sm leading-6 text-slate-600">Link untuk masuk ke halaman pengisian nilai.</p>
    </article>
  `;

  const scheduleContent = document.querySelector("#schedule-content");

  try {
    const profile = await getCurrentProfile();
    if (!profile) {
      scheduleContent.innerHTML = `<p class="mt-3 text-sm leading-6 text-red-600">Tidak dapat memuat profil Anda.</p>`;
      return;
    }
    const schedule = await getTodaysSchedule(profile.id);

    if (schedule.length === 0) {
      scheduleContent.innerHTML = `<p class="mt-3 text-sm leading-6 text-slate-600">Tidak ada jadwal mengajar hari ini.</p>`;
    } else {
      scheduleContent.innerHTML = `
        <ul class="mt-3 space-y-2">
          ${schedule.map(item => `
            <li class="rounded-lg bg-green-50 p-3">
              <p class="font-bold text-green-800">${item.subjects.name}</p>
              <p class="text-sm text-green-700">Kelas: ${item.classes.name}</p>
              <p class="text-sm text-green-700">${item.start_time.substring(0, 5)} - ${item.end_time.substring(0, 5)}</p>
            </li>
          `).join('')}
        </ul>
      `;
    }
  } catch (error) {
    scheduleContent.innerHTML = `<p class="mt-3 text-sm leading-6 text-red-600">Gagal memuat jadwal.</p>`;
  }
}

export const roleLabel = "Guru";
