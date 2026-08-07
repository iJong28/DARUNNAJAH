// js/roles/walikelas.js
import { supabase } from "../supabase.js";
import { getCurrentProfile } from "../auth.js";
import { render as renderGuruDashboard } from "./guru.js";

async function getProblematicStudents(classId) {
    const { data: students, error: studentsError } = await supabase
        .from('profiles')
        .select('id, full_name')
        .eq('class_id', classId);

    if (studentsError) {
        console.error('Error fetching students:', studentsError);
        return [];
    }

    const problematicStudents = [];

    for (const student of students) {
        const { data: grades, error: gradesError } = await supabase
            .from('grades')
            .select('grade')
            .eq('student_id', student.id);

        if (gradesError) {
            console.error(`Error fetching grades for student ${student.id}:`, gradesError);
            continue; // Skip this student if grades can't be fetched
        }

        if (grades.length > 0) {
            const total = grades.reduce((acc, item) => acc + item.grade, 0);
            const avg = total / grades.length;
            if (avg < 60) {
                problematicStudents.push({ ...student, reason: `Rata-rata nilai: ${avg.toFixed(1)}` });
            }
        }
    }
    
    // Here you could add logic for high absence rates in the future
    
    return problematicStudents;
}

export async function render(container) {
  // Render the base Guru dashboard first
  await renderGuruDashboard(container);

  // Now, append the Wali Kelas specific widgets
  const waliKelasContainer = document.createElement('div');
  waliKelasContainer.className = "col-span-full grid gap-5 sm:grid-cols-2 lg:grid-cols-3 mt-8";
  waliKelasContainer.innerHTML = `
    <article id="class-summary-widget" class="rounded-2xl border border-white/70 bg-white/85 p-6 shadow-lg shadow-[#0b3b01]/5 backdrop-blur-sm">
      <h2 class="text-lg font-extrabold text-[#0b3b01]">Ringkasan Akademik Kelas</h2>
      <div id="class-summary-content">
        <p class="mt-3 text-sm leading-6 text-slate-600">Memuat ringkasan kelas...</p>
      </div>
    </article>
    <article id="problematic-students-widget" class="rounded-2xl border border-white/70 bg-white/85 p-6 shadow-lg shadow-[#0b3b01]/5 backdrop-blur-sm">
      <h2 class="text-lg font-extrabold text-[#0b3b01]">Daftar Siswa Perlu Perhatian</h2>
      <div id="problematic-students-content">
        <p class="mt-3 text-sm leading-6 text-slate-600">Menganalisis data siswa...</p>
      </div>
    </article>
    <article class="rounded-2xl border border-white/70 bg-white/85 p-6 shadow-lg shadow-[#0b3b01]/5 backdrop-blur-sm">
      <h2 class="text-lg font-extrabold text-[#0b3b01]">Pesan Cepat ke Wali Murid</h2>
      <p class="mt-3 text-sm leading-6 text-slate-600">Fitur untuk mengirim pengumuman singkat kepada grup wali murid kelasnya.</p>
    </article>
  `;
  container.appendChild(waliKelasContainer);

  const classSummaryContent = document.querySelector("#class-summary-content");
  const problematicStudentsContent = document.querySelector("#problematic-students-content");

  try {
    const profile = await getCurrentProfile();
    const managedClass = await getClassForWaliKelas(profile.id);

    if (!managedClass) {
      classSummaryContent.innerHTML = `<p class="mt-3 text-sm leading-6 text-slate-600">Anda tidak ditugaskan sebagai wali kelas.</p>`;
      problematicStudentsContent.innerHTML = '';
      return;
    }
    
    // Fetch students of the class for summary widget
    const { data: students, error: studentsError } = await supabase
      .from('profiles')
      .select('id, full_name')
      .eq('class_id', managedClass.id);

    if (studentsError) throw studentsError;

    classSummaryContent.innerHTML = `
      <h3 class="text-md font-bold text-slate-800">Kelas Perwalian: ${managedClass.name}</h3>
      <p class="text-sm text-slate-600 mt-2 font-semibold">Daftar Siswa:</p>
      <ul class="mt-2 space-y-1 text-sm text-slate-700">
        ${students.map(s => `<li>- ${s.full_name}</li>`).join('')}
      </ul>
    `;
    
    // Fetch and display problematic students
    const problematic = await getProblematicStudents(managedClass.id);
    if (problematic.length === 0) {
        problematicStudentsContent.innerHTML = `<p class="mt-3 text-sm leading-6 text-slate-600">Tidak ada siswa yang teridentifikasi perlu perhatian khusus saat ini.</p>`;
    } else {
        problematicStudentsContent.innerHTML = `
            <ul class="mt-3 space-y-2">
                ${problematic.map(s => `
                    <li class="rounded-lg bg-red-50 p-3">
                        <p class="font-bold text-red-800">${s.full_name}</p>
                        <p class="text-sm text-red-700">${s.reason}</p>
                    </li>
                `).join('')}
            </ul>
        `;
    }

  } catch (error) {
    console.error("Error rendering Wali Kelas dashboard:", error);
    classSummaryContent.innerHTML = `<p class="mt-3 text-sm leading-6 text-red-600">Gagal memuat data perwalian.</p>`;
    problematicStudentsContent.innerHTML = `<p class="mt-3 text-sm leading-6 text-red-600">Gagal menganalisis data siswa.</p>`;
  }
}

export const roleLabel = "Wali Kelas";
