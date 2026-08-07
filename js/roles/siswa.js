// js/roles/siswa.js
import { supabase } from "../supabase.js";
import { getCurrentProfile } from "../auth.js";

async function getLatestGrades(studentId) {
  const { data, error } = await supabase
    .from("grades")
    .select(`
      grade,
      assignments (
        title,
        subjects ( name )
      )
    `)
    .eq("student_id", studentId)
    .order("created_at", { ascending: false })
    .limit(5);

  if (error) {
    console.error("Error fetching grades:", error);
    return [];
  }

  return data;
}

export async function render(container) {
  container.innerHTML = `
    <article id="schedule-widget" class="rounded-2xl border border-white/70 bg-white/85 p-6 shadow-lg shadow-[#0b3b01]/5 backdrop-blur-sm">
      <h2 class="text-lg font-extrabold text-[#0b3b01]">Jadwal Pelajaran Hari Ini</h2>
      <div id="schedule-content">
        <p class="mt-3 text-sm leading-6 text-slate-600">Memuat jadwal...</p>
      </div>
    </article>
    <article id="attendance-widget" class="rounded-2xl border border-white/70 bg-white/85 p-6 shadow-lg shadow-[#0b3b01]/5 backdrop-blur-sm">
      <h2 class="text-lg font-extrabold text-[#0b3b01]">Ringkasan Absensi</h2>
      <div id="attendance-content">
        <p class="mt-3 text-sm leading-6 text-slate-600">Memuat absensi...</p>
      </div>
    </article>
    <article id="assignments-widget" class="rounded-2xl border border-white/70 bg-white/85 p-6 shadow-lg shadow-[#0b3b01]/5 backdrop-blur-sm">
      <h2 class="text-lg font-extrabold text-[#0b3b01]">Tugas Mendatang</h2>
      <div id="assignments-content">
        <p class="mt-3 text-sm leading-6 text-slate-600">Memuat tugas...</p>
      </div>
    </article>
    <article id="spp-widget" class="rounded-2xl border border-white/70 bg-white/85 p-6 shadow-lg shadow-[#0b3b01]/5 backdrop-blur-sm">
      <h2 class="text-lg font-extrabold text-[#0b3b01]">Status Pembayaran SPP</h2>
      <div id="spp-content">
        <p class="mt-3 text-sm leading-6 text-slate-600">Memuat status SPP...</p>
      </div>
    </article>
    <article id="grades-widget" class="rounded-2xl border border-white/70 bg-white/85 p-6 shadow-lg shadow-[#0b3b01]/5 backdrop-blur-sm">
      <h2 class="text-lg font-extrabold text-[#0b3b01]">Nilai Terakhir</h2>
      <div id="grades-content">
        <p class="mt-3 text-sm leading-6 text-slate-600">Memuat nilai...</p>
      </div>
    </article>
  `;

  const scheduleContent = document.querySelector("#schedule-content");
  const attendanceContent = document.querySelector("#attendance-content");
  const assignmentsContent = document.querySelector("#assignments-content");
  const sppContent = document.querySelector("#spp-content");
  const gradesContent = document.querySelector("#grades-content");

  try {
    const profile = await getCurrentProfile();
    if (!profile) {
      scheduleContent.innerHTML = `<p class="mt-3 text-sm leading-6 text-red-600">Tidak dapat memuat profil Anda.</p>`;
      attendanceContent.innerHTML = '';
      assignmentsContent.innerHTML = '';
      sppContent.innerHTML = '';
      gradesContent.innerHTML = '';
      return;
    }

    // Load Schedule, Attendance, Assignments, SPP Status and Grades
    if (!profile.class_id) {
      scheduleContent.innerHTML = `<p class="mt-3 text-sm leading-6 text-slate-600">Anda tidak terdaftar di kelas manapun.</p>`;
      assignmentsContent.innerHTML = `<p class="mt-3 text-sm leading-6 text-slate-600">Anda tidak terdaftar di kelas manapun.</p>`;
    } else {
      const schedule = await getTodaysSchedule(profile.class_id);
      if (schedule.length === 0) {
        scheduleContent.innerHTML = `<p class="mt-3 text-sm leading-6 text-slate-600">Tidak ada jadwal pelajaran hari ini.</p>`;
      } else {
        scheduleContent.innerHTML = `
          <ul class="mt-3 space-y-2">
            ${schedule.map(item => `
              <li class="rounded-lg bg-green-50 p-3">
                <p class="font-bold text-green-800">${item.subjects.name}</p>
                <p class="text-sm text-green-700">Guru: ${item.profiles.full_name}</p>
                <p class="text-sm text-green-700">${item.start_time.substring(0, 5)} - ${item.end_time.substring(0, 5)}</p>
              </li>
            `).join('')}
          </ul>
        `;
      }
      const assignments = await getUpcomingAssignments(profile.class_id);
      if (assignments.length === 0) {
        assignmentsContent.innerHTML = `<p class="mt-3 text-sm leading-6 text-slate-600">Tidak ada tugas mendatang.</p>`;
      } else {
        assignmentsContent.innerHTML = `
          <ul class="mt-3 space-y-2">
            ${assignments.map(item => `
              <li class="rounded-lg bg-blue-50 p-3">
                <p class="font-bold text-blue-800">${item.title}</p>
                <p class="text-sm text-blue-700">Pelajaran: ${item.subjects.name}</p>
                <p class="text-sm text-blue-700">Tenggat: ${new Date(item.due_date).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
              </li>
            `).join('')}
          </ul>
        `;
      }
    }

    const attendance = await getAttendanceSummary(profile.id);
    attendanceContent.innerHTML = `
      <ul class="mt-3 space-y-1 text-sm text-slate-600">
        <li>Sakit: <span class="font-bold">${attendance.sakit}</span> hari</li>
        <li>Izin: <span class="font-bold">${attendance.izin}</span> hari</li>
        <li>Alfa: <span class="font-bold">${attendance.alfa}</span> hari</li>
      </ul>
    `;

    const sppStatus = await getSppStatus(profile.id);
    if (sppStatus) {
      sppContent.innerHTML = `
        <p class="mt-3 text-sm font-bold ${sppStatus.status === 'lunas' ? 'text-green-600' : 'text-red-600'}">
          ${sppStatus.status === 'lunas' ? 'Lunas' : 'Belum Lunas'}
        </p>
      `;
    } else {
      sppContent.innerHTML = `<p class="mt-3 text-sm leading-6 text-red-600">Gagal memuat status SPP.</p>`;
    }

    const grades = await getLatestGrades(profile.id);
    if (grades.length === 0) {
      gradesContent.innerHTML = `<p class="mt-3 text-sm leading-6 text-slate-600">Belum ada nilai yang dimasukkan.</p>`;
    } else {
      gradesContent.innerHTML = `
        <ul class="mt-3 space-y-2">
          ${grades.map(item => `
            <li class="rounded-lg bg-yellow-50 p-3">
              <div class="flex justify-between items-center">
                <div>
                  <p class="font-bold text-yellow-800">${item.assignments.title}</p>
                  <p class="text-sm text-yellow-700">${item.assignments.subjects.name}</p>
                </div>
                <p class="text-2xl font-extrabold text-yellow-900">${item.grade}</p>
              </div>
            </li>
          `).join('')}
        </ul>
      `;
    }

  } catch (error) {
    scheduleContent.innerHTML = `<p class="mt-3 text-sm leading-6 text-red-600">Gagal memuat jadwal.</p>`;
    attendanceContent.innerHTML = `<p class="mt-3 text-sm leading-6 text-red-600">Gagal memuat absensi.</p>`;
    assignmentsContent.innerHTML = `<p class="mt-3 text-sm leading-6 text-red-600">Gagal memuat tugas.</p>`;
    sppContent.innerHTML = `<p class="mt-3 text-sm leading-6 text-red-600">Gagal memuat status SPP.</p>`;
    gradesContent.innerHTML = `<p class="mt-3 text-sm leading-6 text-red-600">Gagal memuat nilai.</p>`;
  }
}

export const roleLabel = "Siswa";
