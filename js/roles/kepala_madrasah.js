// js/roles/kepala_madrasah.js
import { supabase } from "../supabase.js";

async function getAcademicSummary() {
    const { data, error } = await supabase
        .from('grades')
        .select('grade');

    if (error) {
        console.error('Error fetching academic summary:', error);
        return { averageGrade: 'N/A' };
    }

    if (data.length === 0) {
        return { averageGrade: 0 };
    }

    const total = data.reduce((acc, item) => acc + item.grade, 0);
    const averageGrade = (total / data.length).toFixed(1);
    return { averageGrade };
}

async function getFinancialSummary() {
    const today = new Date();
    const currentMonth = today.getMonth() + 1;
    const currentYear = today.getFullYear();

    const { data, error } = await supabase
        .from('payments')
        .select('amount')
        .eq('status', 'lunas')
        .eq('month', currentMonth)
        .eq('year', currentYear);

    if (error) {
        console.error('Error fetching financial summary:', error);
        return { totalRevenue: 'N/A' };
    }
    
    const totalRevenue = data.reduce((acc, item) => acc + item.amount, 0);
    return { totalRevenue };
}

export async function render(container) {
  container.innerHTML = `
    <article id="academic-summary-widget" class="rounded-2xl border border-white/70 bg-white/85 p-6 shadow-lg shadow-[#0b3b01]/5 backdrop-blur-sm">
      <h2 class="text-lg font-extrabold text-[#0b3b01]">Ringkasan Kinerja Akademik</h2>
      <div id="academic-summary-content">
        <p class="mt-3 text-sm leading-6 text-slate-600">Memuat ringkasan...</p>
      </div>
    </article>
    <article class="rounded-2xl border border-white/70 bg-white/85 p-6 shadow-lg shadow-[#0b3b01]/5 backdrop-blur-sm">
      <h2 class="text-lg font-extrabold text-[#0b3b01]">Laporan Kehadiran Guru</h2>
      <p class="mt-3 text-sm leading-6 text-slate-600">Fitur ini memerlukan skema database tambahan untuk absensi guru.</p>
    </article>
    <article id="financial-summary-widget" class="rounded-2xl border border-white/70 bg-white/85 p-6 shadow-lg shadow-[#0b3b01]/5 backdrop-blur-sm">
      <h2 class="text-lg font-extrabold text-[#0b3b01]">Ringkasan Keuangan (Bulan Ini)</h2>
      <div id="financial-summary-content">
        <p class="mt-3 text-sm leading-6 text-slate-600">Memuat ringkasan...</p>
      </div>
    </article>
    <article class="rounded-2xl border border-white/70 bg-white/85 p-6 shadow-lg shadow-[#0b3b01]/5 backdrop-blur-sm">
      <h2 class="text-lg font-extrabold text-[#0b3b01]">Alur Persetujuan</h2>
      <p class="mt-3 text-sm leading-6 text-slate-600">Fitur ini memerlukan skema database tambahan untuk alur persetujuan.</p>
    </article>
  `;

  const academicSummaryContent = document.querySelector("#academic-summary-content");
  const financialSummaryContent = document.querySelector("#financial-summary-content");

  try {
    const academicSummary = await getAcademicSummary();
    academicSummaryContent.innerHTML = `
      <p class="mt-3 text-sm text-slate-600">Rata-rata Nilai Seluruh Siswa: <span class="font-bold text-2xl text-slate-800">${academicSummary.averageGrade}</span></p>
    `;

    const financialSummary = await getFinancialSummary();
    financialSummaryContent.innerHTML = `
      <p class="mt-3 text-sm text-slate-600">Total Pemasukan SPP: <span class="font-bold text-2xl text-green-700">Rp ${financialSummary.totalRevenue.toLocaleString('id-ID')}</span></p>
    `;

  } catch (error) {
    academicSummaryContent.innerHTML = `<p class="mt-3 text-sm leading-6 text-red-600">Gagal memuat ringkasan akademik.</p>`;
    financialSummaryContent.innerHTML = `<p class="mt-3 text-sm leading-6 text-red-600">Gagal memuat ringkasan keuangan.</p>`;
  }
}

export const roleLabel = "Kepala Madrasah";
