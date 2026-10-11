// ============================================================================
// MODUL UTAMA PERAN: OPERATOR (SUPERADMIN)
// Mengorkestrasi 5 Pilar Manajemen Madrasah:
// 1. Pilar Lembaga   -> ../operator/pilar-lembaga.js
// 2. Pilar Guru      -> ../operator/pilar-guru.js
// 3. Pilar Murid     -> ../operator/pilar-murid.js
// 4. Pilar Kehadiran -> ../operator/pilar-kehadiran.js
// 5. Pilar Keuangan  -> ../operator/pilar-keuangan.js
// State & Storage    -> ../operator/state.js
// ============================================================================

import { syncWithSupabase } from "../operator/state.js";
import {
  renderLembagaInfoPage,
  renderLembagaMapelPage,
  renderLembagaRombelPage
} from "../operator/pilar-lembaga.js";
import {
  renderGuruDataPage,
  renderGuruMapelPage
} from "../operator/pilar-guru.js";
import {
  renderMuridDataPage,
  renderMuridPindahPage,
  renderMuridNaikPage,
  renderMuridAlumniPage
} from "../operator/pilar-murid.js";
import {
  renderKehadiranAbsenPage,
  renderKehadiranRekapPage
} from "../operator/pilar-kehadiran.js";
import {
  renderKeuanganIuranPage,
  renderKeuanganRekapPage
} from "../operator/pilar-keuangan.js";

export const roleLabel = "Operator (Superadmin)";

// ============================================================================
// STRUKTUR 5 MENU UTAMA & SUB-MENU OPERATOR
// ============================================================================

export const menuGroups = [
  {
    id: "lembaga",
    title: "Lembaga",
    icon: "🏢",
    description: "Ringkasan Utama & Data Lembaga",
    submenus: [
      { id: "lembaga_info", label: "Pengaturan Data Lembaga", icon: "🏛️", subtitle: "Profil Lembaga, Identitas Madrasah & Ringkasan Data" },
      { id: "lembaga_mapel", label: "Pengaturan Data Mapel", icon: "📖", subtitle: "Kelola Kurikulum Mata Pelajaran, Tambah & Hapus Mapel" },
      { id: "lembaga_rombel", label: "Pengaturan Rombel", icon: "🏫", subtitle: "Kelola Rombongan Belajar, Nama Kelas & Penetapan Wali Kelas" }
    ]
  },
  {
    id: "guru",
    title: "Guru",
    icon: "👨‍🏫",
    description: "Data Asatidz & Guru Mengajar",
    submenus: [
      { id: "guru_data", label: "Data Guru", icon: "👤", subtitle: "Manajemen Akun Guru, Biodata & Hak Akses Pendidik" },
      { id: "guru_mapel", label: "Mapel Ampuh", icon: "📚", subtitle: "Pengaturan Penugasan Guru Mengajar per Mapel & Kelas" }
    ]
  },
  {
    id: "murid",
    title: "Murid",
    icon: "🎓",
    description: "Database Seluruh Santri/Murid",
    submenus: [
      { id: "murid_data", label: "Data Murid", icon: "👦", subtitle: "Pusat Data Murid, Tambah/Hapus & Filter per Rombel" },
      { id: "murid_pindah", label: "Pindah Kelas", icon: "🔄", subtitle: "Fitur Mutasi dan Pemindahan Siswa Antar Rombel" },
      { id: "murid_naik", label: "Naik Kelas", icon: "📈", subtitle: "Penetapan Kenaikan Kelas Santri Akhir Tahun Ajaran" },
      { id: "murid_alumni", label: "Data Alumni", icon: "🎓", subtitle: "Fitur Pelacakan & Direktori Alumni Tamatan Madrasah" }
    ]
  },
  {
    id: "kehadiran",
    title: "Kehadiran",
    icon: "📋",
    description: "Monitoring Presensi Santri",
    submenus: [
      { id: "kehadiran_absen", label: "Absen", icon: "✍️", subtitle: "Pengisian Presensi Kehadiran Murid per Kelas" },
      { id: "kehadiran_rekap", label: "Rekapitulasi Kehadiran", icon: "📊", subtitle: "Statistik, Rekap & Persentase Kehadiran Murid per Kelas" }
    ]
  },
  {
    id: "keuangan",
    title: "Keuangan",
    icon: "💰",
    description: "Monitoring & Pengelolaan Iuran",
    submenus: [
      { id: "keuangan_iuran", label: "Iuran", icon: "💳", subtitle: "Pengisian Iuran Harian/Mingguan/Bulanan oleh Wali Kelas" },
      { id: "keuangan_rekap", label: "Rekapitulasi Iuran", icon: "📈", subtitle: "Laporan & Statistik Data Iuran Masuk per Kelas" }
    ]
  }
];

// Flat list menu items untuk router
export const menuItems = menuGroups.flatMap(g => g.submenus);

// ============================================================================
// ROUTER HALAMAN OPERATOR
// ============================================================================

export async function renderPage(pageKey, container, profile) {
  await syncWithSupabase();

  switch (pageKey) {
    // Profil Pengguna & Kata Sandi Saya
    case "profile":
      if (typeof window.renderProfileCanvas === "function") {
        window.renderProfileCanvas(container, profile);
      }
      break;

    // 1. Pilar Lembaga
    case "lembaga_info":
      renderLembagaInfoPage(container);
      break;
    case "lembaga_mapel":
      renderLembagaMapelPage(container);
      break;
    case "lembaga_rombel":
      renderLembagaRombelPage(container);
      break;

    // 2. Pilar Guru
    case "guru_data":
      renderGuruDataPage(container);
      break;
    case "guru_mapel":
      renderGuruMapelPage(container);
      break;

    // 3. Pilar Murid
    case "murid_data":
      renderMuridDataPage(container);
      break;
    case "murid_pindah":
      renderMuridPindahPage(container);
      break;
    case "murid_naik":
      renderMuridNaikPage(container);
      break;
    case "murid_alumni":
      renderMuridAlumniPage(container);
      break;

    // 4. Pilar Kehadiran
    case "kehadiran_absen":
      renderKehadiranAbsenPage(container);
      break;
    case "kehadiran_rekap":
      renderKehadiranRekapPage(container);
      break;

    // 5. Pilar Keuangan
    case "keuangan_iuran":
      renderKeuanganIuranPage(container);
      break;
    case "keuangan_rekap":
      renderKeuanganRekapPage(container);
      break;

    // Default Fallback
    default:
      renderLembagaInfoPage(container);
      break;
  }

  window.scrollTo({ top: 0, behavior: "smooth" });
}

// Fallback render standard jika dipanggil langsung
export async function render(container, profile) {
  await renderPage("lembaga_info", container, profile);
}
