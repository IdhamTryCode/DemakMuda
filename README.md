# DemakMuda

Portal talenta dan peluang pemuda Kabupaten Demak.

Karya untuk **Lomba Teknologi Piranti Lunak — Jambore Pemuda Kabupaten Demak 2026**.
Peserta: Idham Hanif Multaam.

Dokumen pendukung: `proposal-demakmuda.html` (proposal umum) dan
`cetak-biru-teknis.html` (rencana teknis, model data, rencana keamanan).

## Kebutuhan

- Node.js 20 atau lebih baru (diuji pada 24.x)
- Docker Desktop — untuk PostgreSQL saat pengembangan

## Menjalankan pertama kali

```bash
# 1. Pasang ketergantungan
npm install

# 2. Siapkan berkas lingkungan, lalu isi nilainya
cp .env.example .env

# 3. Nyalakan basis data (butuh Docker Desktop sudah berjalan)
npm run db:up

# 4. Buat tabel
npm run db:migrate

# 5. Isi data acuan (wilayah, minat, keterampilan)
npm run db:seed

# 6. Buat akun demo untuk keempat peran
npm run db:seed:akun

# 7. Isi kabar dan agenda contoh
npm run db:seed:isi

# 8. Jalankan aplikasi
npm run dev
```

Aplikasi terbuka di http://localhost:3000

## Perintah yang tersedia

| Perintah | Kegunaan |
| --- | --- |
| `npm run dev` | Menjalankan aplikasi untuk pengembangan |
| `npm run build` | Membangun versi produksi |
| `npm run typecheck` | Memeriksa TypeScript tanpa membangun |
| `npm run lint` | Menjalankan ESLint |
| `npm run db:up` | Menyalakan PostgreSQL lewat Docker |
| `npm run db:down` | Mematikan PostgreSQL |
| `npm run db:reset` | Menghapus basis data lalu membangunnya ulang dan menyemai dari nol |
| `npm run db:migrate` | Menerapkan perubahan skema |
| `npm run db:seed` | Mengisi data acuan; aman dijalankan berulang kali |
| `npm run db:seed:akun` | Membuat akun demo untuk keempat peran |
| `npm run db:seed:isi` | Mengisi kabar dan agenda contoh untuk peragaan |
| `npm run uji` | Menjalankan seluruh uji asap |
| `npm run uji:masuk` | Uji asap alur masuk dan pengarahan peran |
| `npm run uji:kabar` | Uji asap kanal Kabar |
| `npm run uji:agenda` | Uji asap kanal Agenda |
| `npm run uji:peluang` | Uji asap Papan Peluang |
| `npm run uji:profil` | Uji asap Kartu Talenta dan aturan privasinya |
| `npm run aset:ikon` | Membuat ikon aplikasi dari lambang Kabupaten Demak |
| `npm run db:studio` | Membuka Prisma Studio untuk melihat isi basis data |
| `npm run auth:schema` | Membangkitkan ulang model Better Auth setelah plugin berubah |

## Variabel lingkungan

Lihat `.env.example`. Berkas `.env` tidak pernah masuk ke git.

Dua nilai wajib dibangkitkan sendiri dan bersifat rahasia:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

- `BETTER_AUTH_SECRET` — kunci penandatanganan sesi.
- `NIK_PEPPER` — kunci untuk menyidik NIK. **Tidak boleh diganti setelah ada data**,
  karena sidik lama akan berhenti cocok.

## Data wilayah

`prisma/seed/wilayah.json` memuat 14 kecamatan dan 249 desa/kelurahan Kabupaten
Demak — data nyata, bukan contoh. Berkas itu dihasilkan oleh
`prisma/seed/ambil-wilayah.ts` dari [wilayah.id](https://wilayah.id) yang mengikuti
kode wilayah Kemendagri, dan ikut masuk repositori agar penyemaian tidak
bergantung pada jaringan.

Skrip pengambilnya menolak menulis berkas bila jumlahnya tidak 14 dan 249, sesuai
angka BPS Kabupaten Demak. Pemeriksaan itu bukan hiasan: sumber pertama yang
dicoba ternyata hanya memuat 233 desa/kelurahan dan tertangkap oleh pemeriksaan ini.

## Akun demo

Dibuat oleh `npm run db:seed:akun`, hanya untuk pengembangan dan peragaan.
Kata sandi seragam: `DemakMuda2026!`

| Surel | Peran | Dasbor |
| --- | --- | --- |
| `pemuda@demakmuda.test` | Pemuda | `/pemuda` |
| `organisasi@demakmuda.test` | Pengelola organisasi | `/organisasi` |
| `dinas@demakmuda.test` | Dinas | `/dinas` |
| `admin@demakmuda.test` | Superadmin | `/admin` |

Jalankan `npm run uji:masuk` (dengan `npm run dev` menyala di terminal lain)
untuk membuktikan keempatnya masuk ke dasbor yang benar dan ditolak dari dasbor
peran lain.

## Pola menambah kanal baru

Kabar dan Agenda dibangun dengan pola yang sama. Untuk kanal berikutnya,
ikuti urutan berkas ini:

1. Skema Zod di `src/lib/validasi.ts`
2. Server Action di `src/server/aksi-<kanal>.ts` — urutannya **selalu**: periksa
   peran, periksa masukan, periksa kepemilikan, ubah data, catat jejak audit
3. Halaman publik `src/app/<kanal>/` (daftar dan rinci)
4. Formulir dan pengelolaan di `src/app/kelola/<kanal>/`
5. Uji asap di `scripts/uji-<kanal>.ts`

Dua aturan yang berlaku di seluruh kanal: isi berstatus draf tidak boleh
tampil di halaman publik, dan isi milik pengguna lain dibalas **404**, bukan
403 — 403 memberi tahu penyerang bahwa sebuah id itu nyata.

## Data yang belum lengkap

Tabel `sekolah` masih kosong. Cetak biru menjanjikan daftar SMA, SMK, dan MA
se-Kabupaten Demak dari pangkalan data pendidikan, tetapi sumber yang dicoba
tidak mengembalikan hasil untuk Demak. Selama tabelnya kosong, kolom pilihan
sekolah pada formulir profil disembunyikan — bukan ditampilkan kosong.

Daftar sekolah **tidak boleh dikarang**: itu data lembaga nyata. Bila sumber
yang sahih sudah ditemukan, semai lewat pola yang sama dengan
`prisma/seed/ambil-wilayah.ts`, lengkap dengan pemeriksaan jumlah.

## Catatan keamanan

- NIK tidak pernah disimpan utuh; yang tersimpan hanya sidik HMAC dan empat digit
  terakhir untuk tampilan.
- `src/proxy.ts` hanya untuk pengalihan halaman. Pemeriksaan peran wajib diulang
  di setiap halaman dan Server Action lewat `src/lib/sesi.ts`, karena proxy hanya
  membaca kuki tanpa memvalidasi sesi ke basis data.
- Tabel `account` memerlukan kolom `issuer` yang **tidak** muncul pada keluaran
  `npm run auth:schema`. Bila menyelaraskan ulang skema autentikasi, jangan
  hilangkan kolom itu — tanpanya pendaftaran gagal.
- Paket `deepmerge-ts` dipaksa ke versi 8 lewat `overrides` pada `package.json`
  untuk menutup GHSA-ggr8-5vv4-36mx yang terbawa dari ketergantungan Prisma.
  Jangan hapus blok `overrides` tanpa memeriksa `npm audit` lebih dulu.
- Alamat web yang dikirim pengguna diperiksa dengan `urlAman` di
  `src/lib/validasi.ts`, **bukan** `z.url()` saja. Pemeriksaan bawaan Zod
  menganggap `javascript:`, `data:`, dan `vbscript:` sebagai alamat sah, dan
  nilai seperti itu berubah menjadi jalan masuk skrip begitu dipasang sebagai
  `href`. Uji regresinya ada di `scripts/uji-peluang.ts`.
- Keterbukaan Kartu Talenta diatur `keterbukaanProfil` di `src/lib/profil.ts`:
  nomor telepon tidak pernah tampil di halaman publik untuk siapa pun, dan bagi
  pengguna di bawah 18 tahun usia, desa, serta sekolah ikut disembunyikan.
  Tanggal lahir yang kosong diperlakukan sebagai anak — memilih yang lebih aman.
- Penampil Markdown (`src/components/markdown.tsx`) tidak memasang plugin
  `rehype-raw`, sehingga HTML mentah dari pengguna tidak pernah menjadi markup
  aktif. Uji regresinya ada di `scripts/uji-kabar.ts` — jangan menambahkan
  plugin itu tanpa mengganti pengamanan lain.

## Susunan berkas

```
prisma/schema.prisma   Skema basis data
prisma/seed/           Data wilayah nyata dan akun demo
src/app/globals.css    Token permukaan skeuomorfisme
src/lib/auth.ts        Konfigurasi Better Auth
src/lib/permissions.ts Matriks peran dan izin
src/lib/peran.ts       Peran dan tujuan dasbornya
src/lib/sesi.ts        Penjaga sesi dan peran di sisi server
src/lib/prisma.ts      Klien Prisma
src/proxy.ts           Pengalihan halaman (bukan penjaga izin)
src/app/               Halaman dan rute
scripts/               Uji asap
```

## Sistem desain

Antarmuka memakai skeuomorfisme modern yang halus: permukaan timbul, cekung, dan
tertekan dengan bayangan berlapis dan cahaya yang selalu datang dari atas.

Seluruh kedalaman berasal dari token dan kelas di `src/app/globals.css`
(`.sk-raised`, `.sk-inset`, `.sk-overlay`, `.sk-pressable`, `.sk-field`), tidak
pernah dari bayangan yang ditulis lepas di komponen. Mode gelap dirancang ulang,
bukan dibalik. Rincian aturannya ada pada cetak biru teknis Bagian VII.

**Mode terang adalah bawaan.** Mode gelap hanya aktif bila pengguna menekan
tombol ganti tema, dan pilihannya diingat peramban. Preferensi sistem sengaja
tidak dipakai supaya tampilan awal selalu dapat diduga saat aplikasi
diperagakan. Untuk mengubahnya menjadi mengikuti sistem, ubah `SKRIP_TEMA` di
`src/app/layout.tsx`.

Tombol ganti tema (`src/components/ganti-tema.tsx`) tidak memakai state React —
ikon dan labelnya ditukar CSS lewat `[data-theme]`, sehingga tidak ada
ketidakcocokan hidrasi maupun kedipan ikon.

## Lambang daerah

`public/demak_logo.png` adalah lambang resmi Kabupaten Demak. Dari berkas itu,
`npm run aset:ikon` menghasilkan tiga turunan:

| Berkas | Kegunaan |
| --- | --- |
| `src/app/icon.png` | Ikon tab peramban |
| `src/app/apple-icon.png` | Ikon layar utama iOS |
| `public/lambang-demak.png` | Dipakai di antarmuka |

Lambangnya berbentuk perisai tegak sedangkan ikon peramban dianggap persegi,
jadi skrip menempatkannya di tengah kanvas persegi transparan tanpa
diregangkan. Jalankan ulang hanya bila berkas lambangnya diganti.
