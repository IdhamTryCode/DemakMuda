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

# 7. Isi kabar, agenda, peluang, karya, dan aspirasi contoh
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
| `npm run db:seed` | Mengisi data acuan (wilayah, minat, keterampilan, 175 sekolah); aman diulang |
| `npm run db:seed:akun` | Membuat akun demo untuk keempat peran |
| `npm run db:seed:isi` | Mengisi kabar, agenda, peluang, karya, dan aspirasi contoh untuk peragaan |
| `npm run db:seed:gambar` | Membangkitkan dan mengunggah gambar contoh untuk kabar, karya, dan organisasi |
| `npm run uji` | Menjalankan seluruh uji asap |
| `npm run uji:masuk` | Uji asap alur masuk dan pengarahan peran |
| `npm run uji:kabar` | Uji asap kanal Kabar |
| `npm run uji:agenda` | Uji asap kanal Agenda |
| `npm run uji:peluang` | Uji asap Papan Peluang |
| `npm run uji:profil` | Uji asap Kartu Talenta dan aturan privasinya |
| `npm run uji:pendaftaran` | Uji asap Pendaftaran Kegiatan dan unduhan peserta |
| `npm run uji:sertifikat` | Uji asap Rekam Prestasi dan pemeriksaan keaslian |
| `npm run uji:direktori` | Uji asap Direktori Organisasi dan verifikasinya |
| `npm run uji:peta` | Uji asap Peta Potensi Pemuda |
| `npm run uji:admin` | Uji asap administrasi sistem dan header keamanan |
| `npm run uji:dualangkah` | Uji asap autentikasi dua langkah, dengan kode TOTP sungguhan |
| `npm run uji:privasi` | Uji asap perlindungan data dan halaman 404 |
| `npm run uji:pencarian` | Uji asap pencarian dan status HTTP halaman rinci |
| `npm run uji:karya` | Uji asap Ruang Karya, termasuk penyaringan tautan |
| `npm run uji:aspirasi` | Uji asap Ruang Aspirasi, terutama agar isinya tidak bocor ke publik |
| `npm run uji:akses` | Matriks akses seluruh halaman terhadap seluruh peran |
| `npm run uji:unggah` | Uji asap unggah berkas: penerbitan token, batasnya, dan penyaringan alamat |
| `npm run uji:keanggotaan` | Uji asap alur gabung organisasi dari pengajuan sampai keputusan pengurus |
| `npm run uji:notifikasi` | Uji asap pemberitahuan: sampai ke penerimanya, tidak ke orang lain |
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

Untuk halaman rinci dinamis, `revalidatePath` perlu dipanggil dengan pola
rutenya (`revalidatePath("/direktori/[slug]", "page")`), bukan hanya alamat
daftarnya — tanpa itu halaman rinci dapat menyajikan angka lama.

Catatan rute: `/organisasi` sudah dipakai sebagai dasbor peran, sehingga
direktori publiknya berada di `/direktori`.

**Keadaan memuat (`loading.tsx`) hanya boleh menaungi halaman daftar.** Berkas
itu membuka batas Suspense, dan tanggapan yang sudah mulai mengalir tidak dapat
lagi mengubah statusnya menjadi 404 — halaman rinci untuk isi yang tidak ada
akan membalas 200. Karena itu halaman daftar ditempatkan di grup rute
`(daftar)/`, terpisah dari `[slug]/`. Dijaga oleh `npm run uji:pencarian`.

**Hati-hati dengan kunci `OR` ganda pada satu `where` Prisma.** Bila dua syarat
sama-sama di-spread sebagai `OR`, yang belakangan menimpa yang pertama tanpa
peringatan — pernah membuat pencarian di Papan Peluang diabaikan diam-diam.
Bungkus keduanya di dalam `AND: [...]`.

## Dua kanal yang menyimpang dari pola

**Ruang Karya** pemiliknya pemuda, bukan pengelola isi, sehingga
pengelolaannya berada di `src/app/pemuda/karya/` — bukan di `/kelola`. Dinas
dan superadmin tetap boleh menyuntingnya untuk keperluan moderasi, dan itu
ditangani `bolehMengubah()`, bukan cabang khusus di dalam aksinya.

Alamat luar (`gambarUrl`, `tautanLuar`) diperiksa dua kali: oleh `urlAman()`
saat masuk, dan oleh `tautanAman()` di `src/lib/tautan.ts` tepat sebelum
dipasang sebagai `href`. Lapis kedua bukan pengulangan yang sia-sia — baris
warisan atau hasil impor tidak pernah melewati lapis pertama. Gambar sengaja
**tidak** dimuat sebagai `<img>`: memuat berkas dari peladen mana pun yang
ditulis pengguna akan menjadikan aplikasi ini perantara permintaan ke jaringan
dalam.

**Ruang Aspirasi** adalah satu-satunya kanal yang isinya tidak pernah publik.
Hanya pengirimnya dan dinas yang boleh membacanya; peran organisasi sengaja
dikecualikan, karena membiarkan pengelola organisasi membaca keluhan warga
berarti membuka keluhan itu kepada pihak yang mungkin justru dikeluhkan.

Karena itu `src/server/aksi-aspirasi.ts` tidak memuat satu pun
`revalidatePath` ke halaman publik. Bila suatu saat ada, itu tanda ada
kebocoran yang perlu diperiksa. Isi aspirasi juga tidak pernah masuk jejak
audit — hanya judulnya. Dijaga oleh `npm run uji:aspirasi`, yang menyisir
seluruh halaman publik mencari kalimat yang hanya ada di dalam aspirasi.

Pengiriman aspirasi dibatasi jeda lima menit antar-kiriman dan lima kiriman
per akun per hari, dan Ruang Karya dibatasi tiga puluh karya per akun.

## Menyegarkan data peragaan sebelum dipertunjukkan

Tanggal pada isi contoh dihitung relatif terhadap **hari penyemaian**, bukan
terhadap tanggal tetap. Agenda dan peluang disemai tersebar di sekitar hari itu:
sebagian sudah lewat, sebagian sedang berjalan, sebagian masih jauh.

Karena itu jalankan ulang penyemaian isi menjelang hari peragaan:

```bash
npm run db:seed:isi
```

Aman diulang berapa kali pun dan tidak menyentuh akun. Tanpa ini, halaman
Agenda perlahan menjadi kosong dan Papan Peluang penuh peluang yang sudah
tutup — persis kebalikan dari yang ingin diperlihatkan.

Untuk menguji keadaan pada tanggal tertentu, isi `ACUAN_SEMAI`:

```bash
ACUAN_SEMAI=2026-09-14 npm run db:seed:isi
```

## Data yang belum lengkap

Tabel `sekolah` masih kosong. Cetak biru menjanjikan daftar SMA, SMK, dan MA
se-Kabupaten Demak dari pangkalan data pendidikan, tetapi sumber yang dicoba
tidak mengembalikan hasil untuk Demak. Selama tabelnya kosong, kolom pilihan
sekolah pada formulir profil disembunyikan — bukan ditampilkan kosong.

Daftar sekolah **tidak boleh dikarang**: itu data lembaga nyata. Bila sumber
yang sahih sudah ditemukan, semai lewat pola yang sama dengan
`prisma/seed/ambil-wilayah.ts`, lengkap dengan pemeriksaan jumlah.

## Penyimpanan berkas

Gambar kabar, gambar karya, dan logo organisasi disimpan di Vercel Blob.
Perlu dua variabel lingkungan, keduanya dipasang otomatis oleh integrasi
Vercel dan harus disalin ke `.env` untuk pengembangan lokal:

| Variabel | Guna |
| --- | --- |
| `BLOB_READ_WRITE_TOKEN` | Rahasia. Dipakai menerbitkan token unggah dan menghapus berkas |
| `BLOB_STORE_ID` | Bukan rahasia. Menurunkan nama inang yang dipakai `next.config.ts` |

**Store-nya publik dengan sengaja**, karena gambarnya memang tampil di halaman
yang dapat dibuka tanpa masuk. Konsekuensinya tegas: siapa pun yang memegang
alamatnya dapat membukanya. Karena itu store ini hanya untuk berkas yang
ditujukan bagi umum — tidak pernah untuk dokumen pribadi.

Tiga hal yang tidak boleh hilang saat menyentuh bagian ini:

1. **Kolom gambar hanya menerima alamat dari store kita sendiri.** Diperiksa
   `alamatBlobSah()` di `src/lib/blob.ts`, dipakai skema Zod sebelum menyimpan
   dan sekali lagi sebelum merender. Tanpa itu, kolom yang dipasang sebagai
   sumber gambar menjadikan aplikasi ini perantara permintaan ke peladen mana
   pun yang ditulis pengguna.
2. **`remotePatterns` dikunci ke satu nama inang**, bukan pola bintang seluruh
   ranah Vercel Blob. Dengan pola bintang, store milik siapa pun di Vercel
   dapat disalurkan lewat pengoptimal gambar kita.
3. **SVG ditolak** di daftar jenis pada token, di saringan peramban, dan lewat
   `dangerouslyAllowSVG` yang dibiarkan mati. SVG dapat memuat skrip.

Berkas tidak melewati peladen kita: peramban mengunggah langsung ke Vercel Blob
memakai token berumur pendek dari `/api/unggah`, lalu alamat hasilnya dikirim
balik lewat formulir dan disimpan Server Action yang sudah ada. `onUploadCompleted`
sengaja tidak dipakai — callback itu diam-diam mati di localhost kecuali
`VERCEL_BLOB_CALLBACK_URL` diarahkan ke terowongan, sehingga alurnya akan berbeda
antara mesin pengembang dan produksi.

### Gambar contoh

`npm run db:seed:gambar` membangkitkan gambar geometris abstrak dari palet
aplikasi — bukan foto, dan tidak ada yang berpura-pura menjadi rekaman tempat
atau orang sungguhan. Bentuknya ditentukan slug, jadi satu isi selalu mendapat
gambar yang sama, dan jalurnya tetap sehingga penyemaian ulang menimpa alih-alih
menumpuk berkas yatim. Baris yang gambarnya sudah diunggah pengguna dilewati.

Perlu diketahui: alamat blob dilayani dengan cache panjang. Setelah menimpa
sebuah gambar, salinan lama masih dapat terlihat beberapa saat.

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
- Halaman `/privasi` menjelaskan data yang dikumpulkan. **Setiap janji di sana
  harus cocok dengan yang dikerjakan kode** — `npm run uji:privasi` memeriksanya
  terhadap basis data, bukan sekadar memastikan halamannya terbuka. Bila
  perilaku aplikasi berubah, ubah halaman itu juga; halaman privasi yang tidak
  jujur lebih buruk daripada tidak ada.
- **Autentikasi dua langkah** diwajibkan bagi peran dinas dan superadmin: selama
  belum dipasang, dasbor mereka dialihkan ke `/keamanan`. Di `MODE_PERAGAAN`
  kewajiban itu turun menjadi anjuran — dinyatakan terbuka di halamannya, karena
  memaksa pendaftaran autentikator di depan juri hanya menghambat peragaan.
- Dua langkah **belum aktif sampai kodenya diverifikasi**. Tanpa aturan itu,
  salah memindai berarti pengguna terkunci dari akunnya sendiri.
- Pencabutan sesi merujuk sesi lewat **id, bukan token**. Token adalah
  kredensial; menyematkannya ke halaman agar bisa dipakai tombol berarti ia ikut
  tercetak di sumber halaman.
- Header keamanan diatur di `next.config.ts`. HSTS **tidak** dicantumkan karena
  Vercel sudah mengirimkannya sendiri. Kebijakan Keamanan Konten (CSP) sengaja
  belum dipasang — keputusan yang ditunda secara sadar, bukan terlewat.
- `/admin` dan turunannya hanya untuk superadmin; **dinas pun ditolak**, karena
  halaman itu memuat surel seluruh pengguna dan memberi wewenang menaikkan
  siapa pun menjadi dinas.
- Superadmin tidak dapat mengubah peran akunnya sendiri. Tanpa aturan itu, satu
  kesalahan klik bisa mengunci pengelolaan peran tanpa jalan kembali.
- Kode sertifikat dibangkitkan dengan `randomInt` dari modul `crypto`, bukan
  `Math.random`, supaya kode berikutnya tidak dapat ditebak dari kode yang sudah
  terbit. Huruf yang mudah tertukar (`0 O 1 I L`) tidak dipakai karena kode ini
  akan diketik ulang orang dari lembar cetak.
- Sertifikat **tidak pernah dihapus**, hanya dibatalkan. Kode yang sudah
  tercetak tetap dapat diperiksa, dan hasilnya jujur membedakan "pernah terbit
  lalu dibatalkan" dari "tidak pernah ada".
- Unduhan daftar peserta (`src/lib/csv.ts`) melucuti sel yang diawali `=`, `+`,
  `-`, atau `@` menjadi teks. Tanpa itu, nama peserta yang ditulis
  `=HYPERLINK(...)` akan dijalankan Excel sebagai rumus di komputer panitia.
  Rutenya juga memeriksa sesi dan kepemilikan sendiri, serta memakai
  `cache-control: no-store` karena isinya data pribadi.
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
src/lib/tautan.ts      Penyaring alamat luar saat dirender
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
