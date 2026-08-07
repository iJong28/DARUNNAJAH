# Persiapan Penuh Vibe Coding — Sistem Aplikasi Sekolah Terpadu

Konteks: kamu mau bikin beberapa aplikasi sekolah yang nanti digabung jadi satu sistem pusat. Ini paling penting untuk direncanakan dari awal, karena kalau tiap aplikasi dibangun sendiri-sendiri tanpa rencana, penggabungannya nanti jadi mimpi buruk. Panduan ini fokus ke tools gratis dan cocok untuk kamu yang baru dikit-dikit ngerti HTML.

---

## 1. Prinsip Utama Sebelum Mulai

Karena tujuannya sistem terpadu, tentukan dulu 3 hal ini di awal — jangan ditunda:

1. **Satu database & satu sistem login (auth) untuk semua aplikasi.** Ini kunci utama supaya nanti gampang digabung. Semua modul (absensi, nilai, perpustakaan, dll) connect ke database yang sama.
2. **Satu tech stack yang konsisten.** Jangan aplikasi A pakai teknologi beda dari aplikasi B. Ini bikin integrasi jadi susah.
3. **Struktur modular.** Tiap aplikasi = 1 folder/proyek terpisah, tapi semuanya "bicara" ke database pusat yang sama lewat API.

---

## 2. Tools Gratis yang Kamu Perlu

### AI Coding Assistant (otak vibe coding)
- **Claude.ai** (yang kamu pakai sekarang) — bisa buatin kode langsung di chat, cocok untuk belajar & prototyping cepat, gratis dengan limit harian.
- **Claude Code** — versi command-line, lebih powerful untuk proyek yang mulai besar (ada tier gratis terbatas).
- Alternatif: ChatGPT (gratis), atau tools "vibe coding" instan seperti **bolt.new** / **v0.dev** — bisa langsung generate aplikasi web dari deskripsi teks, ada tier gratis.

### Code Editor
- **Visual Studio Code (VS Code)** — gratis, standar industri, banyak extension AI (misal Claude Code extension / GitHub Copilot free tier untuk pelajar).

### Version Control (wajib, apalagi sistem multi-aplikasi)
- **Git** (tool-nya) + **GitHub** (tempat nyimpen kode online) — gratis untuk repo publik/privat (akun personal).

### Database + Auth Terpusat
- **Supabase** — gratis, berbasis PostgreSQL, sudah termasuk sistem login/auth siap pakai. Ini pilihan paling pas untuk "satu database dipakai banyak aplikasi".
- Alternatif: **Firebase** (Google) — juga gratis dengan tier awal, punya auth + database.

### Hosting (biar aplikasi bisa diakses online)
- **Vercel** atau **Netlify** — gratis, otomatis deploy dari GitHub, cocok untuk aplikasi web (frontend).
- Kalau perlu server backend terpisah: **Railway** atau **Render** (ada tier gratis, dengan batas jam aktif).

### Desain UI (opsional tapi membantu)
- **Figma** — gratis, buat sketsa tampilan sebelum minta AI generate kode-nya.

---

## 3. Langkah Setup (Sekali Saja di Awal)

1. Install **VS Code** → [code.visualstudio.com](https://code.visualstudio.com)
2. Install **Node.js** (dibutuhkan hampir semua proyek web modern) → [nodejs.org](https://nodejs.org) (pilih versi LTS)
3. Install **Git** → [git-scm.com](https://git-scm.com)
4. Buat akun **GitHub** → [github.com](https://github.com)
5. Buat akun **Supabase** → [supabase.com](https://supabase.com) — bikin 1 project untuk jadi database pusat semua aplikasi sekolahmu
6. Buat akun **Vercel** → [vercel.com](https://vercel.com), connect ke akun GitHub kamu

Setelah ini semua siap, kamu tinggal mengulang alur kerja yang sama untuk tiap modul aplikasi.

---

## 4. Alur Kerja Vibe Coding (Workflow)

1. **Rencanakan dulu sebelum ngoding.** Tulis: aplikasi ini buat siapa (guru/siswa/admin?), fitur utamanya apa saja, data apa yang perlu disimpan di database.
2. **Mulai dari 1 fitur kecil**, jangan minta AI buatin seluruh sistem sekaligus. Contoh: "buatkan halaman login yang connect ke Supabase" dulu, baru lanjut fitur berikutnya.
3. **Selalu tes hasilnya sebelum lanjut ke fitur berikutnya.** Jangan numpuk banyak fitur belum dicek — kalau ada bug, susah dilacak dari mana.
4. **Commit ke GitHub tiap ada progress yang jalan.** Ini backup + histori kalau ada yang rusak.
5. **Ulangi proses ini untuk tiap modul aplikasi**, tapi selalu connect ke Supabase project yang sama supaya nanti gampang disatukan.

---

## 5. Tips Khusus untuk Kamu (Basic HTML)

- Minta AI jelasin kode yang di-generate, jangan cuma copy-paste — biar makin paham sambil jalan.
- Kalau bingung istilah teknis (API, backend, database, dll), tanya langsung ke AI-nya sebelum lanjut — jangan skip.
- Belajar dasar **React** akan sangat membantu (framework paling umum dipakai bareng AI coding tools sekarang), bisa lewat **freeCodeCamp** (gratis, [freecodecamp.org](https://freecodecamp.org)).
- Simpan prompt-prompt yang berhasil (di catatan terpisah) — ini jadi semacam "resep" yang bisa dipakai ulang untuk modul aplikasi berikutnya.

---

## 6. Struktur Proyek yang Disarankan (untuk Sistem Terpadu)

```
sistem-sekolah/
├── app-absensi/        (proyek terpisah, connect ke Supabase yang sama)
├── app-nilai/           (proyek terpisah, connect ke Supabase yang sama)
├── app-perpustakaan/    (proyek terpisah, connect ke Supabase yang sama)
└── dashboard-pusat/     (nanti jadi "pintu masuk" yang menggabungkan semua)
```

Tiap folder di atas = repo GitHub sendiri, di-deploy sendiri ke Vercel, tapi semuanya baca/tulis ke 1 Supabase project yang sama. Dengan begini, "dashboard-pusat" nanti tinggal narik data dari database yang sudah terhubung semua, tanpa perlu migrasi ulang.

---

**Langkah pertama yang disarankan:** mulai dari 1 aplikasi paling sederhana dulu (misal absensi), sampai selesai dan jalan, baru lanjut ke modul berikutnya. Ini lebih aman daripada coba bikin semuanya sekaligus.
