# DemakMuda

Portal talenta dan peluang pemuda Kabupaten Demak. Satu tempat resmi untuk
menemukan kegiatan, peluang, dan komunitas kepemudaan — tanpa perlu mengenal
pengurusnya lebih dahulu.

**Berjalan di <https://demakmuda.space>**

Karya perorangan untuk Lomba Teknologi Piranti Lunak, Jambore Pemuda Kabupaten
Demak 2026. Peserta: Idham Hanif Multazam.

---

## Masalah yang diangkat

Di Kabupaten Demak ada ribuan pemuda dan banyak kegiatan untuk mereka. Yang
tidak ada adalah pintunya. Informasi kegiatan tersebar di grup pesan dan status
yang hilang keesokan harinya, dan poster diteruskan berkali-kali sampai
tanggalnya tidak lagi terbaca. Akibatnya satu: yang tahu hanya yang kenal orang
di dalam.

Aplikasi ini mengumpulkan informasi itu ke satu tempat, membuka jalan masuk ke
komunitas lewat jalur yang sama bagi semua orang, dan membuat keikutsertaan
meninggalkan bukti yang dapat diperiksa siapa pun.

## Bagian aplikasi

| Bagian | Isi |
| --- | --- |
| Beranda dan Papan Peluang | Kegiatan, lomba, beasiswa, pelatihan, dan magang beserta tenggat pendaftarannya |
| Direktori Organisasi | Organisasi kepemudaan terverifikasi, disaring menurut jenis dan kecamatan, dengan pengajuan keanggotaan yang disetujui pengurus |
| Kartu Talenta | Profil publik beralamat tetap dan berkode QR: bidang minat, keterampilan, keanggotaan, dan rekam jejak |
| Rekam jejak dan sertifikat berkode | Prestasi serta pengalaman beserta buktinya, ditambah sertifikat kegiatan yang keasliannya dapat diperiksa lewat kodenya |
| Panduan Karier | Sembilan pertanyaan singkat, lalu panduan tiga langkah yang disusun model bahasa dari jawaban itu beserta isi Kartu Talenta pemiliknya |
| Ruang Karya dan Ruang Aspirasi | Etalase karya pemuda, dan saluran usul yang ditanggapi dinas dengan status terlacak |
| Peta Potensi dan Cari Talenta | Sebaran pemuda terdata per kecamatan, serta penyaringan menurut bidang, wilayah, dan tingkat prestasi |

Enam yang pertama untuk pemuda dan organisasi. Yang terakhir untuk dinas.

## Teknologi

| Lapis | Perangkat |
| --- | --- |
| Antarmuka | Next.js 16 (App Router) · React 19 · Tailwind CSS 4 |
| Basis data | PostgreSQL · Prisma 7 dengan `@prisma/adapter-pg` |
| Autentikasi | Better Auth 1.7 · peran · autentikasi dua langkah |
| Pemeriksaan masukan | Zod 4 |
| Penyimpanan berkas | Vercel Blob |
| Model bahasa | MiniMax-M2.5 lewat antarmuka serasi-OpenAI |
| Penempatan | Vercel, wilayah Singapura (`sin1`) |

Halaman digambar di peladen, sehingga ringan dibuka pada jaringan seluler.
Tidak ada yang perlu dipasang di sisi pengguna — cukup dibuka di peramban, di
ponsel maupun komputer.

---

## Pemasangan

### Kebutuhan

- **Node.js 20** atau lebih baru (diuji pada 24.x)
- **Docker Desktop** — hanya untuk PostgreSQL saat pengembangan
- **Git**

### Langkah

**Bila Anda menerima folder ini apa adanya** (misalnya dari flash disk), lewati
langkah 1 — kodenya sudah lengkap. Masuk ke foldernya, lalu mulai dari langkah 2.

```bash
# 1. Ambil kode — hanya bila belum punya foldernya
git clone https://github.com/IdhamTryCode/DemakMuda.git
cd DemakMuda

# 2. Pasang ketergantungan
npm install

# 3. Siapkan berkas lingkungan
cp .env.example .env
```

> Pada langkah 2, Prisma menampilkan peringatan bahwa `DATABASE_URL` belum
> ditemukan. **Itu wajar dan tidak menggagalkan apa pun** — berkas `.env` memang
> baru dibuat pada langkah berikutnya. Pemasangannya tetap selesai dan klien
> Prisma tetap dibangkitkan.

Buka `.env`, lalu isi dua nilai yang wajib dibangkitkan sendiri:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Jalankan dua kali, lalu tempelkan hasilnya ke `BETTER_AUTH_SECRET` dan
`NIK_PEPPER`. Nilai lain boleh dibiarkan seperti contohnya untuk pengembangan.

```bash
# 4. Nyalakan basis data (Docker Desktop harus sudah berjalan)
npm run db:up

# 5. Buat tabelnya
npm run db:migrate

# 6. Isi data acuan: 14 kecamatan, 249 desa, 175 sekolah, minat, keterampilan
npm run db:seed

# 7. Buat akun peragaan untuk keempat peran
npm run db:seed:akun

# 8. Isi kabar, agenda, peluang, karya, dan aspirasi contoh
npm run db:seed:isi

# 9. Jalankan
npm run dev
```

Aplikasi terbuka di <http://localhost:3000>.

> Langkah 4 sampai 8 cukup sekali. Untuk membangun ulang dari nol,
> `npm run db:reset` menjalankan seluruhnya berurutan.

---

## Cara memakai

### Akun peragaan

Dibuat oleh `npm run db:seed:akun`, hanya untuk pengembangan dan peragaan.
Kata sandi seragam: `DemakMuda2026!`

| Surel | Peran | Dasbor |
| --- | --- | --- |
| `pemuda@demakmuda.test` | Pemuda | `/pemuda` |
| `organisasi@demakmuda.test` | Pengelola organisasi | `/organisasi` |
| `dinas@demakmuda.test` | Dinas | `/dinas` |
| `admin@demakmuda.test` | Superadmin | `/admin` |

Saat `MODE_PERAGAAN="true"`, keempatnya juga tercantum pada halaman masuk lewat
tombol "Lihat akun peragaan".

### Alur utama, dari sisi pemuda

1. **Daftar** di `/daftar`, lalu **lengkapi Kartu Talenta** di `/pemuda/profil`
   — kecamatan, bidang minat, dan keterampilan.
2. **Cari kegiatan** di `/agenda` atau peluang di `/peluang`, lalu daftar.
3. **Minta gabung organisasi** dari halaman organisasinya di `/direktori`.
   Keputusannya di tangan pengurus, bukan sistem.
4. Setelah kegiatan selesai dan kehadiran ditandai panitia, **sertifikat
   berkode** terbit dan menempel sendiri ke Kartu Talenta.
5. **Periksa keaslian sertifikat** siapa pun di `/cek`, cukup dengan kodenya.

### Alur dari sisi dinas

Masuk sebagai `dinas@demakmuda.test`, lalu buka `/dinas` untuk Peta Potensi
(sebaran pemuda terdata per kecamatan) dan `/dinas/talenta` untuk Cari Talenta
(penyaringan menurut bidang, kecamatan, tingkat prestasi, dan ada tidaknya
bukti).

### Menyegarkan data peragaan

Tanggal pada isi contoh dihitung relatif terhadap **hari penyemaian**, bukan
terhadap tanggal tetap. Karena itu jalankan ulang menjelang hari peragaan:

```bash
npm run db:seed:isi
```

Aman diulang berapa kali pun dan tidak menyentuh akun. Tanpa ini, halaman
Agenda perlahan menjadi kosong dan Papan Peluang penuh peluang yang sudah
tutup — persis kebalikan dari yang ingin diperlihatkan. Untuk menguji keadaan
pada tanggal tertentu, isi `ACUAN_SEMAI=2026-09-14`.

---

## Variabel lingkungan

Seluruhnya dijelaskan di `.env.example`. Berkas `.env` tidak pernah masuk ke git.

### Wajib

| Variabel | Guna |
| --- | --- |
| `DATABASE_URL` | Alamat PostgreSQL |
| `BETTER_AUTH_SECRET` | Kunci penandatanganan sesi |
| `BETTER_AUTH_URL` | Alamat pangkalan aplikasi, dipakai autentikasi |
| `NIK_PEPPER` | Kunci untuk menyidik NIK. **Tidak boleh diganti setelah ada data**, karena sidik lama akan berhenti cocok |

### Pilihan

| Variabel | Bila kosong |
| --- | --- |
| `MINIMAX_API_KEY` | Panduan Karier menolak dengan kalimat yang menjelaskan keadaannya, bukan halaman galat. Enam bagian lain tidak terpengaruh |
| `GOOGLE_CLIENT_ID` dan `GOOGLE_CLIENT_SECRET` | Tombol "Lanjutkan dengan Google" tidak dirender sama sekali |
| `BLOB_READ_WRITE_TOKEN` dan `BLOB_STORE_ID` | Unggah gambar tidak tersedia |
| `MODE_PERAGAAN` | Verifikasi surel diwajibkan, dan daftar akun peragaan tidak tampil |
| `FITUR_PANDUAN` | Panduan Karier tidak tampil di menu maupun beranda |

**Masuk dengan Google** memerlukan alamat balik berikut didaftarkan di Google
Cloud Console, satu untuk tiap lingkungan:

```
https://www.demakmuda.space/api/auth/callback/google
http://localhost:3000/api/auth/callback/google
```

Akun Google yang surelnya sama dengan akun surel-sandi yang sudah ada otomatis
ditautkan; nama dan surel akun lama tidak diubah oleh penautan itu.

## Saklar fitur

`src/lib/fitur.ts` memuat satu saklar:

| Saklar | Bawaan | Efek |
| --- | --- | --- |
| `FITUR_PANDUAN` | mati | Menyembunyikan Panduan Karier dari menu publik dan dari kartu beranda |

Yang disembunyikan **jalan masuknya, bukan fiturnya**. Halaman
`/pemuda/panduan` tetap hidup dan dapat dibuka langsung lewat alamatnya, dengan
penjagaan sesi yang sama seperti biasa. Itu disengaja: fitur yang halamannya
ikut dimatikan tidak dapat diperiksa sendiri sebelum saklarnya dinyalakan.

Nilainya sengaja **tidak** berawalan `NEXT_PUBLIC_`, sehingga tidak pernah ikut
ke peramban — saklar yang ikut ke peramban akan terbaca siapa pun yang membuka
sumber halaman. Karena itu pula ia dibaca hanya dari komponen peladen, dan
disimpan terpisah dari `src/lib/menu.ts` yang ikut diimpor komponen klien.

Menyalakannya: isi `FITUR_PANDUAN="true"` lalu terbitkan ulang. Keduanya diuji
oleh `npm run uji:panduan`, yang memeriksa kedua keadaan saklar.

---

## Penerbitan ke produksi

Aplikasi ditempatkan di Vercel, wilayah `sin1`, sewilayah dengan basis datanya
di Neon. Selisihnya terukur: waktu buka turun dari 3,8 detik menjadi 0,16 detik
setelah keduanya disatukan wilayahnya.

1. Hubungkan repositori ke Vercel, lalu isi seluruh variabel lingkungan di
   **Settings → Environment Variables**.
2. Pastikan `BETTER_AUTH_URL` berisi alamat produksi yang sesungguhnya. Bila
   dibiarkan kosong, aplikasi memakai alamat bawaan Vercel — dan alamat balik
   OAuth ikut salah.
3. Terapkan migrasi ke basis data produksi:
   ```bash
   DATABASE_URL="<alamat produksi>" npx prisma migrate deploy
   ```
4. Semai data acuan sekali:
   ```bash
   DATABASE_URL="<alamat produksi>" npm run db:seed
   ```

Perubahan skema dibuat sebagai berkas migrasi, bukan `db push`:

```bash
npx prisma migrate diff \
  --from-config-datasource --to-schema prisma/schema.prisma \
  --script > prisma/migrations/<cap-waktu>_<nama>/migration.sql
npx prisma migrate deploy
npx prisma generate
```

---

## Pengujian

Dua puluh dua rangkaian uji asap, dijalankan terhadap aplikasi yang sedang
menyala. Nyalakan `npm run dev` di terminal lain, lalu:

```bash
npm run uji
```

Salah satunya menjalankan peramban sungguhan: mengisi formulir, menekan
tombolnya, lalu memeriksa apakah basis datanya berubah seperti yang dijanjikan.
Yang lain memeriksa matriks akses seluruh halaman terhadap seluruh peran, dan
menyisir halaman publik mencari kalimat yang seharusnya tidak pernah bocor ke
sana.

| Perintah | Yang diuji |
| --- | --- |
| `npm run uji:masuk` | Alur masuk, pengarahan peran, pembatasan laju, masuk dengan Google |
| `npm run uji:kabar` | Kanal Kabar, termasuk penampil Markdown |
| `npm run uji:agenda` | Kanal Agenda |
| `npm run uji:peluang` | Papan Peluang dan penyaringan alamat luar |
| `npm run uji:profil` | Kartu Talenta dan aturan privasinya |
| `npm run uji:pendaftaran` | Pendaftaran kegiatan dan unduhan daftar peserta |
| `npm run uji:sertifikat` | Rekam prestasi dan pemeriksaan keaslian |
| `npm run uji:direktori` | Direktori Organisasi dan verifikasinya |
| `npm run uji:peta` | Peta Potensi Pemuda |
| `npm run uji:admin` | Administrasi sistem dan header keamanan |
| `npm run uji:dualangkah` | Autentikasi dua langkah, dengan kode TOTP sungguhan |
| `npm run uji:privasi` | Perlindungan data, halaman 404, dan penegakan SSL |
| `npm run uji:pencarian` | Pencarian dan status HTTP halaman rinci |
| `npm run uji:karya` | Ruang Karya |
| `npm run uji:aspirasi` | Ruang Aspirasi, terutama agar isinya tidak bocor |
| `npm run uji:akses` | Matriks akses seluruh halaman terhadap seluruh peran |
| `npm run uji:unggah` | Penerbitan token unggah, batasnya, penyaringan alamat |
| `npm run uji:keanggotaan` | Alur gabung organisasi sampai keputusan pengurus |
| `npm run uji:notifikasi` | Pemberitahuan sampai ke penerimanya, tidak ke orang lain |
| `npm run uji:rekamjejak` | Prestasi dan pengalaman beserta buktinya |
| `npm run uji:tombol` | Setiap tombol menuju tempat yang benar |
| `npm run uji:panduan` | Panduan Karier: pembersihan jawaban model, kerahasiaan, saklar fitur |

Panggilan ke MiniMax **sengaja tidak** ikut diuji: ia memakan kuota, memakan
puluhan detik, dan hasilnya berbeda tiap kali. Yang diuji justru bagian yang
menentukan apakah jawabannya layak ditampilkan.

Selain itu:

```bash
npm run typecheck   # TypeScript, tanpa membangun
npm run lint        # ESLint
npm run build       # Membangun versi produksi
```

> Jalankan `npm run build` **sekali lebih dahulu** sebelum `npm run typecheck`
> pada salinan yang benar-benar baru. Next.js membangkitkan berkas tipe
> (`next-env.d.ts` dan `.next/types`) saat membangun, dan tanpa berkas itu
> pemeriksa tipe melaporkan nama seperti `LayoutProps` tidak dikenal. Keduanya
> memang tidak ikut ke dalam repositori karena dibangkitkan ulang setiap kali.

## Perintah lain

| Perintah | Kegunaan |
| --- | --- |
| `npm run db:up` / `db:down` | Menyalakan dan mematikan PostgreSQL lewat Docker |
| `npm run db:reset` | Menghapus basis data lalu membangunnya ulang dan menyemai dari nol |
| `npm run db:migrate` | Menerapkan perubahan skema |
| `npm run db:studio` | Membuka Prisma Studio untuk melihat isi basis data |
| `npm run db:seed:gambar` | Membangkitkan dan mengunggah gambar contoh |
| `npm run aset:ikon` | Membuat ikon aplikasi dari lambang Kabupaten Demak |
| `npm run auth:schema` | Membangkitkan ulang model Better Auth setelah plugin berubah |

---

## Susunan berkas

```
prisma/schema.prisma      Skema basis data
prisma/migrations/        Migrasi, satu folder per perubahan
prisma/seed/              Data wilayah nyata, sekolah, dan akun peragaan
src/app/                  Halaman dan rute
src/app/globals.css       Token warna dan kepingan sistem visual
src/components/           Kepingan antarmuka bersama
src/lib/auth.ts           Konfigurasi Better Auth
src/lib/permissions.ts    Matriks peran dan izin
src/lib/peran.ts          Peran dan tujuan dasbornya
src/lib/sesi.ts           Penjaga sesi dan peran di sisi peladen
src/lib/fitur.ts          Saklar fitur
src/lib/prisma.ts         Klien Prisma
src/lib/tautan.ts         Penyaring alamat luar saat dirender
src/proxy.ts              Pengalihan halaman (BUKAN penjaga izin)
src/server/aksi-*.ts      Server Action, satu berkas per kanal
scripts/uji-*.ts          Uji asap
```

## Pola menambah kanal baru

Ikuti urutan berkas ini:

1. Skema Zod di `src/lib/validasi.ts`
2. Server Action di `src/server/aksi-<kanal>.ts` — urutannya **selalu**: periksa
   peran, periksa masukan, periksa kepemilikan, ubah data, catat jejak audit
3. Halaman publik `src/app/<kanal>/` (daftar dan rinci)
4. Formulir dan pengelolaan di `src/app/kelola/<kanal>/`
5. Uji asap di `scripts/uji-<kanal>.ts`

Dua aturan yang berlaku di seluruh kanal: isi berstatus draf tidak boleh tampil
di halaman publik, dan isi milik pengguna lain dibalas **404**, bukan 403 — 403
memberi tahu penyerang bahwa sebuah id itu nyata.

Untuk halaman rinci dinamis, `revalidatePath` perlu dipanggil dengan pola
rutenya (`revalidatePath("/direktori/[slug]", "page")`), bukan hanya alamat
daftarnya — tanpa itu halaman rinci dapat menyajikan angka lama.

Catatan rute: `/organisasi` sudah dipakai sebagai dasbor peran, sehingga
direktori publiknya berada di `/direktori`.

**Keadaan memuat (`loading.tsx`) hanya boleh menaungi halaman daftar.** Berkas
itu membuka batas Suspense, dan tanggapan yang sudah mulai mengalir tidak dapat
lagi mengubah statusnya menjadi 404 — halaman rinci untuk isi yang tidak ada
akan membalas 200. Karena itu halaman daftar ditempatkan di grup rute
`(daftar)/`, terpisah dari `[slug]/`. Alasan yang sama menempatkan beranda di
grup `(beranda)/`: `loading.tsx` di akar menaungi seluruh aplikasi dan membuat
pengalihan peran kehilangan header `Location`.

**Hati-hati dengan kunci `OR` ganda pada satu `where` Prisma.** Bila dua syarat
sama-sama di-spread sebagai `OR`, yang belakangan menimpa yang pertama tanpa
peringatan — pernah membuat pencarian di Papan Peluang diabaikan diam-diam.
Bungkus keduanya di dalam `AND: [...]`.

## Tiga kanal yang menyimpang dari pola

**Ruang Karya** pemiliknya pemuda, bukan pengelola isi, sehingga pengelolaannya
berada di `src/app/pemuda/karya/` — bukan di `/kelola`. Dinas dan superadmin
tetap boleh menyuntingnya untuk keperluan moderasi, dan itu ditangani
`bolehMengubah()`, bukan cabang khusus di dalam aksinya.

Alamat luar (`gambarUrl`, `tautanLuar`) diperiksa dua kali: oleh `urlAman()`
saat masuk, dan oleh `tautanAman()` di `src/lib/tautan.ts` tepat sebelum
dipasang sebagai `href`. Lapis kedua bukan pengulangan yang sia-sia — baris
warisan atau hasil impor tidak pernah melewati lapis pertama.

**Ruang Aspirasi** adalah satu-satunya kanal yang isinya tidak pernah publik.
Hanya pengirimnya dan dinas yang boleh membacanya; peran organisasi sengaja
dikecualikan, karena membiarkan pengelola organisasi membaca keluhan warga
berarti membuka keluhan itu kepada pihak yang mungkin justru dikeluhkan.

Karena itu `src/server/aksi-aspirasi.ts` tidak memuat satu pun `revalidatePath`
ke halaman publik. Bila suatu saat ada, itu tanda ada kebocoran. Isi aspirasi
juga tidak pernah masuk jejak audit — hanya judulnya.

**Panduan Karier** satu-satunya kanal yang memanggil layanan luar. Pemuda
menjawab sembilan pertanyaan di `src/lib/panduan.ts` — ditulis sebagai DATA,
bukan sebagai formulir, sehingga formulir dan penyusun prompt membacanya
bersama dan tidak mungkin melenceng.

Kliennya di `src/lib/minimax.ts`, dipisahkan dari Server Action-nya supaya
bagian yang paling mungkin gagal dapat diuji tanpa basis data dan tanpa sesi.
Tiga penjagaan di sana lahir dari pengujian sungguhan:

- **Blok penalaran dibuang.** Modelnya menuliskan proses berpikirnya di dalam
  jawaban, dibungkus `<think>`. Pada percobaan pertama blok itu menghabiskan
  seluruh jatah token sehingga jawabannya tidak sempat keluar.
- **Aksara non-Latin ditolak.** Tanpa larangan tegas di system prompt, modelnya
  menyisipkan kata Tionghoa ke tengah kalimat Indonesia. Jawaban yang tercampur
  ditolak seluruhnya, tidak dibersihkan sebagian — kalimat yang bolong di tengah
  lebih buruk daripada meminta orang mengulang.
- **Batas waktu 45 detik.** Panggilan percobaan berpertanyaan pendek selesai 5,8
  detik, dan atas dasar itu batasnya semula dipasang 25 detik. Permintaan yang
  sesungguhnya memakan 23 detik di mesin sendiri dan 72 detik di produksi.

Panduannya bersifat **pribadi**: tidak pernah tampil di Kartu Talenta publik,
tidak dapat dibuka pengelola organisasi maupun dinas, dan jawaban surveinya
tidak ikut dicatat ke jejak audit — hanya nama model dan panjang hasilnya.
Pembuatannya dibatasi sekali sehari per pemuda, dihitung dari dua puluh empat
jam terakhir dan bukan dari pergantian tanggal, supaya yang mengisi pukul 23.50
tidak mendapat jatah kedua sepuluh menit kemudian.

---

## Catatan keamanan

- **Urutan pemeriksaan tetap** di setiap Server Action: periksa peran, periksa
  masukan, periksa kepemilikan, ubah data, catat jejak audit. Tidak boleh
  dibalik.
- `src/proxy.ts` **hanya** untuk pengalihan halaman. Ia membaca kuki tanpa
  memvalidasi sesi ke basis data, sehingga kuki palsu pun lolos di sana.
  Pemeriksaan peran wajib diulang di setiap halaman dan Server Action lewat
  `src/lib/sesi.ts`.
- **NIK tidak pernah disimpan utuh**; yang tersimpan hanya sidik HMAC dan empat
  digit terakhir untuk tampilan.
- **Nomor telepon tidak pernah tampil di halaman publik**, untuk siapa pun dan
  berapa pun usianya. Keterbukaan Kartu Talenta diatur `keterbukaanProfil` di
  `src/lib/profil.ts` — satu-satunya sumber aturannya.
- Halaman `/privasi` menjelaskan data yang dikumpulkan. **Setiap janji di sana
  harus cocok dengan yang dikerjakan kode** — `npm run uji:privasi`
  memeriksanya terhadap basis data, bukan sekadar memastikan halamannya
  terbuka. Halaman privasi yang tidak jujur lebih buruk daripada tidak ada.
- **Autentikasi dua langkah** diwajibkan bagi peran dinas dan superadmin;
  selama belum dipasang, dasbor mereka dialihkan ke `/keamanan`. Di
  `MODE_PERAGAAN` kewajiban itu turun menjadi anjuran, dinyatakan terbuka di
  halamannya. Dua langkah belum aktif sampai kodenya diverifikasi — tanpa
  aturan itu, salah memindai berarti terkunci dari akun sendiri.
- **Masuk dengan Google** memakai `prompt=select_account`, supaya perangkat yang
  dipakai bergantian satu keluarga selalu menawarkan pilihan akun. Pengguna baru
  dari Google diantar ke halaman profil, bukan dasbor.
- Alamat web yang dikirim pengguna diperiksa `urlAman` di `src/lib/validasi.ts`,
  **bukan** `z.url()` saja. Pemeriksaan bawaan Zod menganggap `javascript:`,
  `data:`, dan `vbscript:` sebagai alamat sah.
- Pencabutan sesi merujuk sesi lewat **id, bukan token**. Token adalah
  kredensial; menyematkannya ke halaman berarti ia ikut tercetak di sumbernya.
- `/admin` dan turunannya hanya untuk superadmin; **dinas pun ditolak**, karena
  halaman itu memuat surel seluruh pengguna. Superadmin juga tidak dapat
  mengubah peran akunnya sendiri.
- **Kode sertifikat** dibangkitkan `randomInt` dari modul `crypto`, bukan
  `Math.random`. Huruf yang mudah tertukar (`0 O 1 I L`) tidak dipakai karena
  kode ini diketik ulang orang dari lembar cetak.
- Sertifikat **tidak pernah dihapus**, hanya dibatalkan. Kode yang sudah
  tercetak tetap dapat diperiksa, dan hasilnya membedakan "pernah terbit lalu
  dibatalkan" dari "tidak pernah ada".
- Unduhan daftar peserta (`src/lib/csv.ts`) melucuti sel yang diawali `=`, `+`,
  `-`, atau `@` menjadi teks, supaya nama peserta yang ditulis `=HYPERLINK(...)`
  tidak dijalankan Excel sebagai rumus di komputer panitia.
- Penampil Markdown tidak memasang `rehype-raw`, sehingga HTML mentah dari
  pengguna tidak pernah menjadi markup aktif.
- Tabel `account` memerlukan kolom `issuer` yang **tidak** muncul pada keluaran
  `npm run auth:schema`. Jangan menghilangkannya saat menyelaraskan skema.
- Paket `deepmerge-ts` dipaksa ke versi 8 lewat `overrides` untuk menutup
  GHSA-ggr8-5vv4-36mx yang terbawa dari ketergantungan Prisma.
- Header keamanan diatur di `next.config.ts`. HSTS tidak dicantumkan karena
  Vercel sudah mengirimkannya. **Kebijakan Keamanan Konten (CSP) sengaja belum
  dipasang** — keputusan yang ditunda secara sadar, bukan terlewat.

## Penyimpanan berkas

Gambar kabar, gambar karya, dan logo organisasi disimpan di Vercel Blob.
Berkasnya **tidak melewati peladen kita**: peramban mengunggah langsung memakai
token berumur pendek dari `/api/unggah`, lalu alamat hasilnya dikirim balik
lewat formulir.

Store-nya **publik dengan sengaja**, karena gambarnya memang tampil di halaman
yang dapat dibuka tanpa masuk. Konsekuensinya tegas: siapa pun yang memegang
alamatnya dapat membukanya. Karena itu store ini hanya untuk berkas yang
ditujukan bagi umum — tidak pernah untuk dokumen pribadi.

Tiga hal yang tidak boleh hilang saat menyentuh bagian ini:

1. **Kolom gambar hanya menerima alamat dari store kita sendiri**, diperiksa
   `alamatBlobSah()` di `src/lib/blob.ts` — sebelum menyimpan dan sekali lagi
   sebelum merender.
2. **`remotePatterns` dikunci ke satu nama inang**, bukan pola bintang seluruh
   ranah Vercel Blob. Dengan pola bintang, store milik siapa pun di Vercel dapat
   disalurkan lewat pengoptimal gambar kita.
3. **SVG ditolak** di daftar jenis pada token, di saringan peramban, dan lewat
   `dangerouslyAllowSVG` yang dibiarkan mati. SVG dapat memuat skrip.

`npm run db:seed:gambar` membangkitkan gambar geometris abstrak dari palet
aplikasi — bukan foto, dan tidak ada yang berpura-pura menjadi rekaman tempat
atau orang sungguhan.

## Data

`prisma/seed/wilayah.json` memuat **14 kecamatan dan 249 desa/kelurahan**
Kabupaten Demak, dan `prisma/seed/sekolah.json` memuat **175 SMA dan SMK** —
keduanya data nyata dari pangkalan data publik resmi pemerintah, bukan contoh.
Berkasnya ikut masuk repositori agar penyemaian tidak bergantung pada jaringan.

Skrip pengambilnya menolak menulis berkas bila jumlahnya tidak cocok dengan
angka BPS. Pemeriksaan itu bukan hiasan: sumber pertama yang dicoba ternyata
hanya memuat 233 desa/kelurahan dan tertangkap oleh pemeriksaan ini.

**Data orang seluruhnya fiktif** dan dibuat khusus untuk peragaan. Memakai data
pribadi orang sungguhan untuk keperluan lomba tidak dapat dibenarkan.

## Sistem visual

Namanya **sistem kaca**, dan hanya satu unsur yang benar-benar berupa kaca:
bilah navigasi. Selebihnya permukaan rata dengan garis rambut. Kedalaman
dipakai sesedikit mungkin, supaya yang sedikit itu berarti.

Seluruh warna dan kepingan berasal dari `src/app/globals.css` — `.sk-kartu`,
`.sk-redup`, `.sk-bilah`, `.sk-btn-utama`, `.sk-field`, `.sk-pressable`,
`.sk-overlay` — tidak pernah dari gaya yang ditulis lepas di komponen. Warna
hijau dan kuningannya diambil dari Masjid Agung Demak.

**Mode terang adalah bawaan.** Mode gelap hanya aktif bila pengguna menekan
tombol ganti tema, dan pilihannya diingat peramban. Preferensi sistem sengaja
tidak dipakai supaya tampilan awal selalu dapat diduga saat diperagakan. Mode
gelap dirancang ulang, bukan dibalik.

Tombol ganti tema tidak memakai state React — ikon dan labelnya ditukar CSS
lewat `[data-theme]`, sehingga tidak ada ketidakcocokan hidrasi maupun kedipan
ikon.

Ikon memakai lucide-react (lisensi ISC), dibungkus `src/components/ikon.tsx`
supaya ukuran dan tebal garisnya seragam. Ikon hanya dipakai untuk membedakan
keadaan, tidak sebagai hiasan.

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

---

## Nama dan filosofinya

Namanya dibangun dari kisah **soko tatal** Masjid Agung Demak. Ketika satu tiang
masjid kurang, Sunan Kalijaga tidak mencari kayu yang lebih besar.
Dikumpulkannya tatal — serpihan kayu sisa yang dianggap tidak berguna — lalu
diikatnya menjadi satu tiang yang menyangga masjid itu sampai hari ini.

Potensi pemuda Demak sudah ada, hanya berserak. Yang dibutuhkan bukan menambah,
melainkan menyatukan.

*Nyawiji dadi soko* — bersatu menjadi tiang.
