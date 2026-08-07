// js/roles/bendahara.js
import { supabase } from "../supabase.js";

async function getStudentsInArrears() {
    const today = new Date();
    const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const month = lastMonth.getMonth() + 1;
    const year = lastMonth.getFullYear();

    // Get all students
    const { data: students, error: studentsError } = await supabase
        .from('profiles')
        .select('id, full_name')
        .eq('role', 'siswa');

    if (studentsError) {
        console.error('Error fetching students:', studentsError);
        return [];
    }

    // Get students who have paid for the previous month
    const { data: payments, error: paymentsError } = await supabase
        .from('payments')
        .select('student_id')
        .eq('month', month)
        .eq('year', year)
        .eq('status', 'lunas');

    if (paymentsError) {
        console.error('Error fetching payments for arrears check:', paymentsError);
        return []; // Return empty to avoid showing incorrect arrears
    }
    
    const paidStudentIds = new Set(payments.map(p => p.student_id));
    const studentsInArrears = students.filter(s => !paidStudentIds.has(s.id));

    return studentsInArrears;
}


export async function render(container) {
  container.innerHTML = `
    <article id="spp-stats-widget" class="rounded-2xl border border-white/70 bg-white/85 p-6 shadow-lg shadow-[#0b3b01]/5 backdrop-blur-sm">
      <h2 class="text-lg font-extrabold text-[#0b3b01]">Statistik Pembayaran SPP (Bulan Ini)</h2>
      <div id="spp-stats-content">
        <p class="mt-3 text-sm leading-6 text-slate-600">Memuat statistik...</p>
      </div>
    </article>
    <article id="pending-payments-widget" class="rounded-2xl border border-white/70 bg-white/85 p-6 shadow-lg shadow-[#0b3b01]/5 backdrop-blur-sm">
      <h2 class="text-lg font-extrabold text-[#0b3b01]">Konfirmasi Pembayaran Terbaru</h2>
      <div id="pending-payments-content">
        <p class="mt-3 text-sm leading-6 text-slate-600">Memuat data...</p>
      </div>
    </article>
    <article id="arrears-widget" class="col-span-full rounded-2xl border border-white/70 bg-white/85 p-6 shadow-lg shadow-[#0b3b01]/5 backdrop-blur-sm">
      <h2 class="text-lg font-extrabold text-[#0b3b01]">Daftar Tunggakan (Bulan Lalu)</h2>
      <div id="arrears-content">
        <p class="mt-3 text-sm leading-6 text-slate-600">Menganalisis data tunggakan...</p>
      </div>
    </article>
  `;

  const sppStatsContent = document.querySelector("#spp-stats-content");
  const pendingPaymentsContent = document.querySelector("#pending-payments-content");
  const arrearsContent = document.querySelector("#arrears-content");

  try {
    // Load SPP Stats, Pending Payments, and Arrears in parallel
    const [stats, pending, arrears] = await Promise.all([
      getSppStatistics(),
      getPendingPayments(),
      getStudentsInArrears()
    ]);

    // Render SPP Stats
    if (stats) {
        const paidPercentage = stats.total > 0 ? ((stats.paid / stats.total) * 100).toFixed(1) : 0;
        sppStatsContent.innerHTML = `
            <div class="mt-3 text-sm text-slate-600">
                <p>Total Siswa: <span class="font-bold">${stats.total}</span></p>
                <p>Sudah Bayar: <span class="font-bold text-green-600">${stats.paid}</span></p>
                <p>Belum Bayar: <span class="font-bold text-red-600">${stats.unpaid}</span></p>
                <div class="mt-2 h-4 w-full rounded-full bg-gray-200">
                  <div class="h-full rounded-full bg-green-500" style="width: ${paidPercentage}%"></div>
                </div>
                <p class="text-right font-bold">${paidPercentage}%</p>
            </div>
        `;
    } else {
        sppStatsContent.innerHTML = `<p class="mt-3 text-sm leading-6 text-red-600">Gagal memuat statistik.</p>`;
    }

    // Render Pending Payments
    if (pending.length === 0) {
        pendingPaymentsContent.innerHTML = `<p class="mt-3 text-sm leading-6 text-slate-600">Tidak ada pembayaran yang perlu dikonfirmasi.</p>`;
    } else {
        pendingPaymentsContent.innerHTML = `
            <ul class="mt-3 space-y-2">
                ${pending.map(p => `
                    <li class="flex items-center justify-between rounded-lg bg-yellow-50 p-3">
                        <div>
                            <p class="font-bold text-yellow-800">${p.profiles.full_name}</p>
                            <p class="text-sm text-yellow-700">Jumlah: Rp ${p.amount.toLocaleString('id-ID')}</p>
                        </div>
                        <button class="text-sm font-semibold text-green-600 hover:underline" data-id="${p.id}">Konfirmasi</button>
                    </li>
                `).join('')}
            </ul>
        `;
    }
    
    // Render Arrears List
    if (arrears.length === 0) {
        arrearsContent.innerHTML = `<p class="mt-3 text-sm leading-6 text-slate-600">Tidak ada siswa yang menunggak pembayaran bulan lalu.</p>`;
    } else {
        arrearsContent.innerHTML = `
            <ul class="mt-3 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                ${arrears.map(s => `
                    <li class="rounded-lg bg-red-50 p-2 text-center">
                        <p class="font-semibold text-red-800 text-sm">${s.full_name}</p>
                    </li>
                `).join('')}
            </ul>
        `;
    }

  } catch (error) {
    sppStatsContent.innerHTML = `<p class="mt-3 text-sm leading-6 text-red-600">Gagal memuat statistik.</p>`;
    pendingPaymentsContent.innerHTML = `<p class="mt-3 text-sm leading-6 text-red-600">Gagal memuat data pembayaran.</p>`;
    arrearsContent.innerHTML = `<p class="mt-3 text-sm leading-6 text-red-600">Gagal memuat data tunggakan.</p>`;
  }
}

export const roleLabel = "Bendahara";
