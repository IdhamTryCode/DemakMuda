/**
 * Menyemai isi contoh untuk peragaan: kabar, agenda, peluang, karya, dan
 * aspirasi.
 *
 *   npm run db:seed:isi
 *
 * Aman dijalankan berulang kali. Isinya disusun agar menyerupai keadaan
 * sebenarnya di Kabupaten Demak, tetapi seluruhnya karangan sendiri —
 * tidak memakai identitas organisasi nyata tanpa izin.
 *
 * HANYA untuk pengembangan dan peragaan.
 */
import "dotenv/config";

import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "../../src/generated/prisma/client";

if (process.env.NODE_ENV === "production") {
  throw new Error("Isi contoh tidak boleh disemai di lingkungan produksi.");
}

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL belum diisi.");
const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

/**
 * Tanggal acuan penyemaian.
 *
 * Semula dipatok tetap supaya kondisi peragaan selalu sama. Justru itu yang
 * membuatnya rapuh: waktu nyata terus berjalan sementara acuannya diam,
 * sehingga agenda yang disemai sebagai "mendatang" perlahan berpindah menjadi
 * lampau. Beberapa hari setelah penyemaian, halaman Agenda mulai tampak
 * kosong dan Papan Peluang penuh peluang yang sudah tutup — persis kebalikan
 * dari yang ingin diperlihatkan.
 *
 * Sekarang acuannya mengikuti hari penyemaian, tengah malam waktu setempat.
 * Kondisi peragaan tetap dapat diulang persis, hanya saja relatif terhadap
 * hari itu. Isi ACUAN_SEMAI bila perlu menguji tanggal tertentu.
 */
const ACUAN = (() => {
  const dari = process.env.ACUAN_SEMAI;
  const d = dari ? new Date(dari) : new Date();
  if (Number.isNaN(d.getTime())) {
    throw new Error(`ACUAN_SEMAI bukan tanggal yang sah: ${dari}`);
  }
  d.setHours(0, 0, 0, 0);
  return d;
})();

function geser(hari: number, jam = 8): Date {
  const d = new Date(ACUAN);
  d.setDate(d.getDate() + hari);
  d.setHours(jam, 0, 0, 0);
  return d;
}

const KABAR = [
  {
    slug: "jambore-pemuda-demak-2026-dibuka",
    judul: "Jambore Pemuda Kabupaten Demak 2026 resmi dibuka pendaftarannya",
    ringkasan:
      "Pendaftaran dibuka untuk pemuda berusia 16 sampai 30 tahun dari seluruh kecamatan, dengan sepuluh kategori lomba.",
    isi: `Dinas Kepemudaan dan Olahraga Kabupaten Demak membuka pendaftaran Jambore Pemuda Tingkat Kabupaten Demak Tahun 2026.

## Siapa yang boleh ikut

Pemuda dan pemudi berusia **16 sampai 30 tahun** yang berdomisili di Kabupaten Demak sesuai alamat pada KTP atau Kartu Identitas Anak.

## Yang perlu disiapkan

- Kartu Tanda Penduduk asli bagi yang berusia 17 tahun ke atas
- Kartu Identitas Anak asli bagi yang berusia 16 tahun
- Surat pengantar dari sekolah atau organisasi pengirim

Materi yang dibawakan peserta wajib mengangkat kearifan dan keunggulan Kabupaten Demak.`,
    hariTerbit: -6,
  },
  {
    slug: "pelatihan-digital-marketing-umkm-muda",
    judul: "Pelatihan pemasaran digital untuk wirausaha muda Demak",
    ringkasan:
      "Pelatihan tiga hari bagi pelaku usaha muda yang ingin memperluas pasar produk unggulan daerah lewat kanal digital.",
    isi: `Pelatihan ini ditujukan bagi pemuda Demak yang sudah menjalankan usaha kecil dan ingin memperluas jangkauan pasarnya.

## Materi

1. Memotret produk dengan peralatan seadanya
2. Menulis keterangan produk yang menjual
3. Mengelola lapak di ruang jual daring
4. Menghitung ongkos kirim dan margin

Peserta diutamakan yang menekuni produk unggulan daerah seperti jambu air citra, belimbing, batik Demak, dan olahan hasil laut.`,
    hariTerbit: -3,
  },
  {
    slug: "karang-taruna-tanam-mangrove-sayung",
    judul: "Karang taruna se-Kecamatan Sayung tanam seribu mangrove",
    ringkasan:
      "Kegiatan penanaman dilakukan serentak di pesisir sebagai tanggapan atas abrasi yang terus menggerus tambak warga.",
    isi: `Sekitar dua ratus pemuda dari berbagai desa di Kecamatan Sayung mengikuti penanaman mangrove di kawasan pesisir.

Kegiatan ini menjadi bagian dari upaya menahan abrasi yang selama bertahun-tahun menggerus tambak dan permukiman warga pesisir.

> Yang kami tanam hari ini baru terasa manfaatnya sepuluh tahun lagi. Justru karena itu harus dimulai sekarang.

Panitia membuka kesempatan bagi organisasi kepemudaan lain yang ingin mengikuti kegiatan serupa pada gelombang berikutnya.`,
    hariTerbit: -1,
  },
  {
    slug: "mabar-badminton-mingguan-gor-demak",
    judul: "Mabar bulu tangkis mingguan di GOR Demak kini terbuka untuk umum",
    ringkasan:
      "Setiap Rabu malam, empat lapangan dibuka bagi siapa saja yang ingin main bareng tanpa perlu punya klub.",
    isi: `Yang selama ini bingung mencari lawan main sekarang tidak perlu lagi menunggu diajak. Mabar bulu tangkis di GOR Demak dibuka untuk umum setiap Rabu malam.

## Cara ikut

- Datang langsung, daftar di meja panitia
- Bawa raket sendiri; kok disediakan panitia
- Iuran lapangan dibagi rata, biasanya di bawah sepuluh ribu per orang

Pemain dikelompokkan menurut kemampuan, jadi yang baru belajar tidak langsung berhadapan dengan pemain klub.

Panitia mencatat, dalam tiga pekan pertama jumlah yang datang naik dari dua belas menjadi lebih dari empat puluh orang.`,
    hariTerbit: -2,
  },
  {
    slug: "turnamen-futsal-antarkecamatan-dibuka",
    judul: "Turnamen futsal antar-kecamatan kembali digelar setelah dua tahun vakum",
    ringkasan:
      "Empat belas kecamatan diundang mengirim satu tim. Babak penyisihan dimainkan dengan sistem grup di dua lapangan.",
    isi: `Setelah dua tahun tidak berjalan, turnamen futsal antar-kecamatan kembali digelar tahun ini.

## Ketentuan tim

- Satu kecamatan satu tim, maksimal dua belas pemain
- Seluruh pemain berusia 16 sampai 30 tahun dan berdomisili di kecamatan yang diwakili
- Setiap tim wajib menyertakan satu ofisial pendamping

Babak penyisihan memakai sistem grup di dua lapangan, dilanjutkan gugur mulai perempat final.

Pendaftaran dibuka lewat kanal Peluang di DemakMuda dan ditutup sepekan sebelum babak pertama.`,
    hariTerbit: -4,
  },
  {
    slug: "komunitas-lari-demak-runners-tembus-seratus",
    judul: "Demak Runners tembus seratus anggota aktif",
    ringkasan:
      "Komunitas lari yang dimulai delapan orang pada 2024 kini rutin berlatih tiga kali sepekan di tiga titik berbeda.",
    isi: `Komunitas lari Demak Runners mencatat seratus anggota aktif pada bulan ini. Dua tahun lalu, kegiatannya dimulai hanya oleh delapan orang yang berlari mengelilingi alun-alun setiap Minggu pagi.

## Jadwal latihan

- Selasa sore, trek pendek di sekitar alun-alun
- Kamis sore, latihan interval di lapangan
- Minggu pagi, lari jarak jauh dengan rute berpindah-pindah

Yang baru mulai tidak perlu khawatir tertinggal — selalu ada pendamping di kelompok paling belakang.

Komunitas ini juga menjadi penyelenggara Fun Run pesisir yang tahun lalu diikuti lebih dari tiga ratus peserta.`,
    hariTerbit: -8,
  },
  {
    slug: "gelanggang-esports-pemuda-demak",
    judul: "Turnamen e-sports pemuda Demak diikuti tiga puluh dua tim",
    ringkasan:
      "Babak final dimainkan di panggung terbuka alun-alun dan disiarkan langsung, ditonton ratusan orang.",
    isi: `Turnamen e-sports antar-pemuda Kabupaten Demak diikuti tiga puluh dua tim dari sebelas kecamatan.

Babak penyisihan dimainkan daring selama sepekan, sementara babak final dipindahkan ke panggung terbuka di alun-alun agar dapat ditonton langsung.

> Yang menarik bukan hanya pertandingannya. Banyak yang baru pertama kali bertemu langsung dengan tim yang selama ini hanya dikenal lewat nama dalam permainan.

Panitia berencana menjadikannya agenda tahunan, dengan tambahan kategori untuk pelajar.`,
    hariTerbit: -11,
  },
  {
    slug: "panggung-musik-pemuda-alun-alun-demak",
    judul: "Panggung musik pemuda kembali mengisi malam Minggu di alun-alun",
    ringkasan:
      "Enam grup musik pelajar dan pemuda tampil bergantian, dari akustik sampai musik pesisir yang digarap ulang.",
    isi: `Malam Minggu di Alun-alun Simpang Enam kembali diisi panggung musik pemuda setelah lama hanya berupa pasar malam.

Enam grup tampil bergantian sejak selepas isya. Tiga di antaranya membawakan lagu daerah pesisir yang digarap ulang dengan aransemen baru.

## Yang boleh tampil

Grup musik pelajar dan pemuda asal Kabupaten Demak, dengan pendaftaran lewat kanal Agenda DemakMuda. Tidak dipungut biaya, dan peralatan panggung disediakan penyelenggara.

Jadwal berikutnya diumumkan setiap awal bulan.`,
    hariTerbit: -14,
  },
  {
    slug: "nobar-final-liga-pemuda-demak",
    judul: "Nonton bareng final liga pemuda digelar di lapangan desa",
    ringkasan:
      "Layar lebar dipasang di lapangan desa, terbuka untuk umum dan tanpa biaya masuk.",
    isi: `Karang taruna bersama beberapa komunitas olahraga menggelar nonton bareng final liga pemuda di lapangan desa.

Layar lebar dan pengeras suara dipasang sejak sore. Panitia menyediakan tikar, sementara warung sekitar membuka lapak sampai tengah malam.

Kegiatan ini terbuka untuk umum dan tidak dipungut biaya. Panitia hanya meminta penonton membawa pulang sampahnya masing-masing.`,
    hariTerbit: -18,
  },
  {
    slug: "sanggar-tari-regenerasi-penari-muda",
    judul: "Sanggar tari se-Demak sepakat susun kalender pentas bersama",
    ringkasan:
      "Sembilan sanggar bertemu di pendopo dan menyepakati satu kalender pentas agar jadwalnya tidak saling bertabrakan.",
    isi: `Sembilan sanggar tari dari berbagai kecamatan bertemu untuk menyusun kalender pentas bersama.

Selama ini jadwal pentas kerap bertabrakan, sehingga penonton terpecah dan penari yang tergabung di lebih dari satu sanggar harus memilih.

## Yang disepakati

1. Satu kalender pentas bersama yang diperbarui tiap tiga bulan
2. Pementasan gabungan dua kali setahun
3. Kelas dasar terbuka bagi pemuda yang belum pernah menari

Kalendernya akan dimuat di kanal Agenda DemakMuda agar dapat dilihat siapa saja.`,
    hariTerbit: -21,
  },
  {
    slug: "beasiswa-atlet-muda-demak-dibuka",
    judul: "Beasiswa bagi atlet muda berprestasi Demak dibuka tahun ini",
    ringkasan:
      "Diperuntukkan bagi atlet pelajar yang pernah mewakili kabupaten dan hendak melanjutkan ke perguruan tinggi.",
    isi: `Bantuan biaya pendidikan bagi atlet muda berprestasi dibuka untuk tahun ajaran mendatang.

## Yang dapat mendaftar

- Atlet yang pernah mewakili Kabupaten Demak pada kejuaraan tingkat provinsi atau lebih tinggi
- Berusia paling banyak 25 tahun saat mendaftar
- Sedang atau akan menempuh pendidikan tinggi

Pendaftar melampirkan bukti prestasi, surat keterangan dari klub atau sekolah, dan rencana studi singkat.

Berkas dikirim lewat kanal Peluang DemakMuda.`,
    hariTerbit: -9,
  },
  {
    slug: "pelatihan-wasit-bulu-tangkis-angkatan-pertama",
    judul: "Pelatihan wasit bulu tangkis angkatan pertama diikuti dua puluh peserta",
    ringkasan:
      "Kabupaten Demak selama ini kekurangan wasit bersertifikat, sehingga turnamen sering meminjam wasit dari luar daerah.",
    isi: `Pelatihan wasit bulu tangkis angkatan pertama diikuti dua puluh pemuda dari sembilan kecamatan.

Selama ini turnamen di Kabupaten Demak kerap meminjam wasit dari luar daerah, yang membuat biaya penyelenggaraan naik dan jadwal sulit diatur.

## Materi pelatihan

1. Peraturan permainan dan pembaruannya
2. Posisi dan isyarat tangan
3. Penanganan protes dan kejadian tidak biasa
4. Praktik memimpin pertandingan

Peserta yang lulus akan dilibatkan sebagai wasit pada turnamen antar-kecamatan mendatang.`,
    hariTerbit: -16,
  },
  {
    slug: "festival-kuliner-pesisir-wedung",
    judul: "Festival kuliner pesisir Wedung angkat olahan hasil laut warga",
    ringkasan:
      "Dua puluh lapak diisi wirausaha muda, seluruhnya menyajikan olahan hasil tambak dan laut setempat.",
    isi: `Festival kuliner pesisir digelar dua hari di Kecamatan Wedung dengan dua puluh lapak yang seluruhnya diisi wirausaha muda setempat.

Syaratnya satu: bahan utamanya hasil tambak atau laut dari perairan Demak. Ada bandeng presto, otak-otak, kerupuk ikan, sampai olahan rumput laut.

> Kami ingin menunjukkan bahwa hasil laut Demak bisa diolah jadi apa saja, bukan hanya dijual mentah ke luar daerah.

Penyelenggara mencatat perputaran uang selama dua hari melampaui perkiraan awal panitia.`,
    hariTerbit: -25,
  },
  {
    slug: "donor-darah-pemuda-demak-rutin",
    judul: "Donor darah pemuda kini digelar rutin tiap dua bulan",
    ringkasan:
      "Kegiatan yang semula insidental dijadwalkan tetap setelah permintaan darah dari rumah sakit daerah terus meningkat.",
    isi: `Kegiatan donor darah yang selama ini digelar hanya saat ada permintaan mendadak kini dijadwalkan tetap setiap dua bulan.

Perubahan ini diambil setelah kebutuhan darah di rumah sakit daerah terus meningkat, terutama golongan O dan B.

## Yang perlu disiapkan pendonor

- Berusia 17 sampai 60 tahun dan berat badan minimal 45 kilogram
- Tidur cukup dan sudah makan sebelum datang
- Membawa kartu identitas

Jadwal setiap gelombang diumumkan di kanal Agenda DemakMuda.`,
    hariTerbit: -30,
  },
  {
    slug: "gowes-santai-kota-wali-rute-baru",
    judul: "Gowes santai Kota Wali buka rute baru menyusuri tanggul",
    ringkasan:
      "Rute sepanjang tujuh belas kilometer disusun bersama komunitas gowes dan sudah ditelusuri untuk memastikan keamanannya.",
    isi: `Gowes santai Minggu pagi kini punya rute baru sepanjang tujuh belas kilometer yang menyusuri tanggul di sisi utara.

Rute ini disusun bersama komunitas gowes setempat dan ditelusuri lebih dulu untuk mencatat titik yang perlu diwaspadai.

## Catatan rute

- Enam kilometer pertama beraspal halus, cocok untuk pemula
- Ruas tanggul berpasir, sebaiknya memakai ban lebar
- Titik istirahat di kilometer sembilan, ada warung yang buka sejak pagi

Rombongan berangkat bersama dari alun-alun dan tidak saling meninggalkan.`,
    hariTerbit: -35,
  },
];

const AGENDA = [
  {
    slug: "jambore-pemuda-demak-2026",
    judul: "Jambore Pemuda Tingkat Kabupaten Demak 2026",
    deskripsi: `Puncak kegiatan kepemudaan Kabupaten Demak tahun ini, diikuti perwakilan dari seluruh kecamatan.

## Rangkaian kegiatan

- Pembukaan dan pentas seni daerah
- Sepuluh kategori lomba kepemudaan
- Temu organisasi kepemudaan se-kabupaten

Peserta wajib membawa identitas asli sesuai ketentuan panitia.`,
    lokasi: "Alun-alun Simpang Enam Demak",
    kecamatanSlug: "demak",
    hariMulai: 19,
    jamMulai: 7,
    hariSelesai: 27,
    jamSelesai: 16,
  },
  {
    slug: "pelatihan-pemasaran-digital-angkatan-3",
    judul: "Pelatihan pemasaran digital angkatan ketiga",
    deskripsi: `Pelatihan tiga hari bagi wirausaha muda Demak yang ingin memperluas pasar produk unggulan daerah.

Peserta diminta membawa perangkat sendiri dan contoh produk yang akan dipasarkan.`,
    lokasi: "Aula Dinas Kepemudaan dan Olahraga",
    kecamatanSlug: "demak",
    hariMulai: 8,
    jamMulai: 8,
    hariSelesai: 10,
    jamSelesai: 15,
  },
  {
    slug: "tanam-mangrove-pesisir-sayung",
    judul: "Aksi tanam mangrove pesisir Sayung",
    deskripsi: `Penanaman mangrove serentak oleh karang taruna se-Kecamatan Sayung sebagai upaya menahan abrasi.

Peserta disarankan memakai pakaian lapangan dan membawa air minum sendiri.`,
    lokasi: "Pesisir Desa Bedono",
    kecamatanSlug: "sayung",
    hariMulai: 3,
    jamMulai: 6,
    hariSelesai: 3,
    jamSelesai: 11,
  },
  {
    slug: "temu-sanggar-tari-demak",
    judul: "Temu sanggar tari se-Kabupaten Demak",
    deskripsi: `Pertemuan pengelola sanggar tari untuk menyusun kalender pentas bersama dan regenerasi penari muda.`,
    lokasi: "Pendopo Kabupaten Demak",
    kecamatanSlug: "demak",
    hariMulai: -8,
    jamMulai: 9,
    hariSelesai: -8,
    jamSelesai: 12,
  },
  {
    slug: "mabar-badminton-gor-demak",
    judul: "Mabar bulu tangkis terbuka di GOR Demak",
    deskripsi: `Main bareng bulu tangkis, terbuka untuk siapa saja tanpa perlu punya klub.

## Cara ikut

- Datang langsung dan daftar di meja panitia
- Bawa raket sendiri; kok disediakan panitia
- Iuran lapangan dibagi rata antar-pemain yang hadir

Pemain dikelompokkan menurut kemampuan, jadi yang baru belajar tidak langsung berhadapan dengan pemain klub. Empat lapangan dipakai bergantian.`,
    lokasi: "GOR Demak, Jalan Sultan Fatah",
    kecamatanSlug: "demak",
    hariMulai: 1,
    jamMulai: 19,
    hariSelesai: 1,
    jamSelesai: 22,
  },
  {
    slug: "mabar-futsal-lintas-komunitas-mranggen",
    judul: "Mabar futsal lintas komunitas Mranggen",
    deskripsi: `Main bareng futsal tanpa tim tetap. Pemain yang datang dibagi ulang tiap babak supaya semua kebagian bermain.

Yang datang sendirian tetap dapat ikut — justru itu tujuannya. Sepatu dalam ruangan wajib, dan panitia menyediakan rompi pembeda.`,
    lokasi: "Lapangan futsal Bandungrejo",
    kecamatanSlug: "mranggen",
    hariMulai: 2,
    jamMulai: 20,
    hariSelesai: 2,
    jamSelesai: 23,
  },
  {
    slug: "senam-bersama-car-free-day-demak",
    judul: "Senam bersama saat car free day",
    deskripsi: `Senam pagi bersama di ruas jalan yang ditutup untuk kendaraan. Terbuka untuk segala usia dan tanpa biaya.

Instruktur bergantian tiap pekan, dari senam aerobik sampai senam poco-poco.`,
    lokasi: "Ruas Jalan Sultan Fatah",
    kecamatanSlug: "demak",
    hariMulai: 2,
    jamMulai: 6,
    hariSelesai: 2,
    jamSelesai: 8,
  },
  {
    slug: "gowes-santai-kota-wali",
    judul: "Gowes santai Kota Wali rute tanggul",
    deskripsi: `Bersepeda santai sejauh tujuh belas kilometer menyusuri tanggul di sisi utara.

## Catatan rute

- Enam kilometer pertama beraspal halus, cocok untuk pemula
- Ruas tanggul berpasir, sebaiknya memakai ban lebar
- Titik istirahat di kilometer sembilan

Rombongan berangkat dan pulang bersama. Helm sangat dianjurkan.`,
    lokasi: "Titik kumpul Alun-alun Simpang Enam",
    kecamatanSlug: "demak",
    hariMulai: 4,
    jamMulai: 6,
    hariSelesai: 4,
    jamSelesai: 10,
  },
  {
    slug: "mabar-mobile-legends-dan-nobar-final",
    judul: "Mabar Mobile Legends dan nonton bareng babak final",
    deskripsi: `Main bareng terbuka sejak sore, dilanjutkan nonton bareng babak final turnamen pemuda di layar besar.

Peserta membawa perangkat sendiri. Panitia menyediakan colokan, kursi, dan jaringan cadangan.

Terbuka untuk umum, tanpa biaya masuk.`,
    lokasi: "Gedung Serbaguna Pemuda Demak",
    kecamatanSlug: "demak",
    hariMulai: 5,
    jamMulai: 19,
    hariSelesai: 5,
    jamSelesai: 23,
  },
  {
    slug: "mabar-tenis-meja-karangtengah",
    judul: "Mabar tenis meja Karangtengah",
    deskripsi: `Main bareng tenis meja dengan sistem rotasi: yang kalah bergantian dengan yang menunggu.

Empat meja disiapkan. Bet dapat dipinjam bagi yang belum punya.`,
    lokasi: "Balai Desa Karangsari",
    kecamatanSlug: "karangtengah",
    hariMulai: 6,
    jamMulai: 16,
    hariSelesai: 6,
    jamSelesai: 19,
  },
  {
    slug: "sparing-sepak-bola-u23-wonosalam",
    judul: "Sparing sepak bola U-23 antar-desa Wonosalam",
    deskripsi: `Pertandingan persahabatan antar-desa untuk menjaring pemain menjelang turnamen antar-kecamatan.

Pemain berusia paling banyak 23 tahun dan berdomisili di desa yang diwakili. Wasit disediakan panitia.`,
    lokasi: "Lapangan Desa Jogoloyo",
    kecamatanSlug: "wonosalam",
    hariMulai: 7,
    jamMulai: 15,
    hariSelesai: 7,
    jamSelesai: 17,
  },
  {
    slug: "fun-run-pesisir-morodemak",
    judul: "Fun Run pesisir Morodemak lima kilometer",
    deskripsi: `Lari santai lima kilometer menyusuri jalan pesisir, berangkat saat matahari baru terbit.

## Yang perlu diketahui

- Tidak ada batas waktu; berjalan kaki pun boleh
- Titik air minum di kilometer dua dan empat
- Peserta anak-anak wajib didampingi orang tua

Kaus peserta disediakan bagi yang mendaftar lebih awal.`,
    lokasi: "Pantai Morodemak",
    kecamatanSlug: "bonang",
    hariMulai: 9,
    jamMulai: 6,
    hariSelesai: 9,
    jamSelesai: 9,
  },
  {
    slug: "latihan-bersama-pencak-silat-dempet",
    judul: "Latihan bersama pencak silat antar-padepokan",
    deskripsi: `Latihan gabungan beberapa padepokan untuk menyeragamkan gerak dasar sebelum kejuaraan daerah.

Terbuka juga bagi pemuda yang belum pernah berlatih sama sekali — ada kelompok tersendiri untuk pemula.`,
    lokasi: "Balai Desa Botosengon",
    kecamatanSlug: "dempet",
    hariMulai: 10,
    jamMulai: 15,
    hariSelesai: 10,
    jamSelesai: 17,
  },
  {
    slug: "nobar-final-liga-pemuda-lapangan-desa",
    judul: "Nonton bareng final liga pemuda di lapangan desa",
    deskripsi: `Layar lebar dipasang di lapangan desa sejak sore. Terbuka untuk umum dan tanpa biaya masuk.

Panitia menyediakan tikar. Penonton diminta membawa pulang sampahnya masing-masing.`,
    lokasi: "Lapangan Desa Bandungrejo",
    kecamatanSlug: "mranggen",
    hariMulai: 11,
    jamMulai: 19,
    hariSelesai: 11,
    jamSelesai: 22,
  },
  {
    slug: "turnamen-voli-antardesa-guntur",
    judul: "Turnamen voli antar-desa Kecamatan Guntur",
    deskripsi: `Turnamen bola voli antar-desa dengan sistem gugur, dimainkan tiga hari berturut-turut pada sore hari.

Setiap desa mengirim satu tim putra dan satu tim putri. Pemain berusia 16 sampai 30 tahun.`,
    lokasi: "Lapangan Desa Bogosari",
    kecamatanSlug: "guntur",
    hariMulai: 12,
    jamMulai: 15,
    hariSelesai: 14,
    jamSelesai: 18,
  },
  {
    slug: "kelas-fotografi-ponsel-demak",
    judul: "Kelas fotografi dengan ponsel untuk pemula",
    deskripsi: `Kelas sehari bagi pemuda yang ingin memotret produk atau kegiatan dengan ponsel biasa.

## Yang dipelajari

1. Membaca arah cahaya
2. Menyusun bingkai foto
3. Menyunting seperlunya tanpa berlebihan

Peserta cukup membawa ponsel sendiri. Tidak diperlukan kamera khusus.`,
    lokasi: "Aula Dinas Kepemudaan dan Olahraga",
    kecamatanSlug: "demak",
    hariMulai: 13,
    jamMulai: 9,
    hariSelesai: 13,
    jamSelesai: 12,
  },
  {
    slug: "panggung-musik-pemuda-alun-alun",
    judul: "Panggung musik pemuda malam Minggu",
    deskripsi: `Enam grup musik pelajar dan pemuda tampil bergantian sejak selepas isya.

Peralatan panggung disediakan penyelenggara. Grup yang ingin tampil pada gelombang berikutnya dapat mendaftar lewat kanal Agenda.`,
    lokasi: "Panggung terbuka Alun-alun Simpang Enam",
    kecamatanSlug: "demak",
    hariMulai: 16,
    jamMulai: 19,
    hariSelesai: 16,
    jamSelesai: 22,
  },
  {
    slug: "donor-darah-pemuda-demak",
    judul: "Donor darah pemuda gelombang kelima",
    deskripsi: `Kegiatan donor darah rutin dua bulanan bekerja sama dengan unit transfusi darah setempat.

## Yang perlu disiapkan

- Berusia 17 sampai 60 tahun dan berat badan minimal 45 kilogram
- Tidur cukup dan sudah makan sebelum datang
- Membawa kartu identitas`,
    lokasi: "Aula Kantor Kecamatan Demak",
    kecamatanSlug: "demak",
    hariMulai: 17,
    jamMulai: 8,
    hariSelesai: 17,
    jamSelesai: 12,
  },
  {
    slug: "festival-kuliner-pesisir-wedung",
    judul: "Festival kuliner pesisir Wedung",
    deskripsi: `Dua puluh lapak wirausaha muda menyajikan olahan hasil tambak dan laut setempat, digelar dua hari.

Ada panggung musik kecil pada malam hari dan kelas memasak singkat setiap sore.`,
    lokasi: "Lapangan Desa Berahan Wetan",
    kecamatanSlug: "wedung",
    hariMulai: 22,
    jamMulai: 10,
    hariSelesai: 23,
    jamSelesai: 22,
  },
  {
    slug: "turnamen-badminton-bupati-cup-lampau",
    judul: "Turnamen bulu tangkis Bupati Cup",
    deskripsi: `Turnamen bulu tangkis terbuka se-Kabupaten Demak. Sudah selesai; halaman ini disimpan sebagai catatan.`,
    lokasi: "GOR Demak, Jalan Sultan Fatah",
    kecamatanSlug: "demak",
    hariMulai: -15,
    jamMulai: 8,
    hariSelesai: -13,
    jamSelesai: 21,
  },
  {
    slug: "pentas-seni-pelajar-karanganyar",
    judul: "Pentas seni pelajar Kecamatan Karanganyar",
    deskripsi: `Pentas seni tahunan pelajar tingkat kecamatan: tari, musik, dan teater. Sudah berlangsung.`,
    lokasi: "Balai Desa Cangkring",
    kecamatanSlug: "karanganyar",
    hariMulai: -5,
    jamMulai: 13,
    hariSelesai: -5,
    jamSelesai: 17,
  },
];

async function semaiAgenda(pembuatId: string) {
  for (const a of AGENDA) {
    const kecamatan = await prisma.kecamatan.findUnique({
      where: { slug: a.kecamatanSlug },
      select: { id: true },
    });

    const isi = {
      judul: a.judul,
      deskripsi: a.deskripsi,
      lokasi: a.lokasi,
      mulai: geser(a.hariMulai, a.jamMulai),
      selesai: geser(a.hariSelesai, a.jamSelesai),
      kecamatanId: kecamatan?.id ?? null,
      status: "TERBIT" as const,
    };

    await prisma.agenda.upsert({
      where: { slug: a.slug },
      update: isi,
      create: { ...isi, slug: a.slug, pembuatId },
    });
  }

  const mendatang = await prisma.agenda.count({
    where: { status: "TERBIT", mulai: { gte: ACUAN } },
  });
  console.log(`Agenda terbit: ${await prisma.agenda.count({ where: { status: "TERBIT" } })} (${mendatang} mendatang)`);
}

const PELUANG = [
  {
    slug: "lomba-teknologi-piranti-lunak-2026",
    judul: "Lomba Teknologi Piranti Lunak Jambore Pemuda 2026",
    jenis: "LOMBA" as const,
    deskripsi: `Merancang, mengembangkan, dan mengimplementasikan aplikasi digital bertema kepemudaan.

## Ketentuan pokok

- Peserta perorangan, laki-laki atau perempuan
- Karya wajib mengangkat kearifan dan keunggulan Kabupaten Demak
- Karya sekurang-kurangnya 70 persen selesai sebelum hari penilaian

Penilaian mencakup kualitas dan keandalan, inovasi, antarmuka, keamanan, dokumentasi, serta kompatibilitas.`,
    hariTenggat: 3,
    usiaMin: 16,
    usiaMaks: 30,
    minat: ["teknologi-informasi", "desain-dan-industri-kreatif"],
    agendaSlug: "jambore-pemuda-demak-2026",
  },
  {
    slug: "pelatihan-pemasaran-digital-umkm-muda",
    judul: "Pelatihan pemasaran digital untuk wirausaha muda",
    jenis: "PELATIHAN" as const,
    deskripsi: `Pelatihan tiga hari tanpa biaya bagi pemuda Demak yang menjalankan usaha kecil.

Peserta akan belajar memotret produk, menulis keterangan yang menjual, dan mengelola lapak daring. Diutamakan yang menekuni produk unggulan daerah.`,
    hariTenggat: 15,
    usiaMin: 18,
    usiaMaks: 30,
    minat: ["kewirausahaan"],
    agendaSlug: "pelatihan-pemasaran-digital-angkatan-3",
  },
  {
    slug: "beasiswa-pendidikan-pemuda-demak",
    judul: "Beasiswa pendidikan bagi pemuda berprestasi Demak",
    jenis: "BEASISWA" as const,
    deskripsi: `Bantuan biaya pendidikan bagi pemuda Demak yang melanjutkan ke jenjang perguruan tinggi.

Pendaftar melampirkan bukti prestasi, keterangan tidak mampu bila ada, serta surat rekomendasi dari sekolah atau organisasi.`,
    hariTenggat: 40,
    usiaMin: 17,
    usiaMaks: 25,
    minat: ["pendidikan"],
    agendaSlug: null,
  },
  {
    slug: "magang-pengelolaan-media-sosial-dispora",
    judul: "Magang pengelolaan media sosial di Dispora Demak",
    jenis: "MAGANG" as const,
    deskripsi: `Kesempatan magang tiga bulan membantu pengelolaan kanal informasi kepemudaan.

Cocok bagi pemuda yang tertarik pada jurnalistik, desain, atau videografi. Tersedia uang saku dan sertifikat.`,
    hariTenggat: 21,
    usiaMin: 18,
    usiaMaks: 27,
    minat: ["jurnalistik-dan-media", "desain-dan-industri-kreatif"],
    agendaSlug: null,
  },
  {
    slug: "lomba-cipta-lagu-daerah-2026-lampau",
    judul: "Lomba cipta lagu bertema Demak",
    jenis: "LOMBA" as const,
    deskripsi: `Lomba menciptakan lagu bertema Kabupaten Demak. Pendaftaran sudah ditutup dan penilaian telah selesai.`,
    hariTenggat: -12,
    usiaMin: 16,
    usiaMaks: 30,
    minat: ["seni-dan-budaya"],
    agendaSlug: null,
  },
  {
    slug: "turnamen-bulu-tangkis-pemuda-cup-2026",
    judul: "Turnamen bulu tangkis Pemuda Cup 2026",
    jenis: "LOMBA" as const,
    deskripsi: `Turnamen bulu tangkis terbuka se-Kabupaten Demak, nomor tunggal dan ganda.

## Ketentuan

- Peserta berdomisili di Kabupaten Demak
- Satu orang boleh turun paling banyak di dua nomor
- Kok disediakan panitia; raket dibawa sendiri

Babak penyisihan memakai sistem gugur. Wasit dipimpin lulusan pelatihan wasit angkatan pertama.`,
    hariTenggat: 9,
    usiaMin: 16,
    usiaMaks: 30,
    minat: ["olahraga"],
    agendaSlug: null,
  },
  {
    slug: "turnamen-futsal-antarkecamatan-2026",
    judul: "Turnamen futsal antar-kecamatan Demak 2026",
    jenis: "LOMBA" as const,
    deskripsi: `Empat belas kecamatan diundang mengirim satu tim.

## Ketentuan tim

- Maksimal dua belas pemain dan satu ofisial pendamping
- Seluruh pemain berdomisili di kecamatan yang diwakili
- Kartu identitas diperiksa sebelum pertandingan pertama

Babak penyisihan sistem grup di dua lapangan, dilanjutkan gugur mulai perempat final.`,
    hariTenggat: 11,
    usiaMin: 16,
    usiaMaks: 30,
    minat: ["olahraga"],
    agendaSlug: null,
  },
  {
    slug: "turnamen-e-sports-pemuda-demak",
    judul: "Turnamen e-sports pemuda Demak",
    jenis: "LOMBA" as const,
    deskripsi: `Turnamen beregu lima orang. Babak penyisihan dimainkan daring, babak final di panggung terbuka alun-alun.

Setiap tim mendaftarkan satu pemain cadangan. Panitia menyediakan perangkat dan jaringan pada babak final.`,
    hariTenggat: 4,
    usiaMin: 16,
    usiaMaks: 30,
    minat: ["teknologi-informasi", "olahraga"],
    agendaSlug: null,
  },
  {
    slug: "lomba-fotografi-pesona-demak",
    judul: "Lomba fotografi Pesona Demak",
    jenis: "LOMBA" as const,
    deskripsi: `Lomba foto bertema kehidupan sehari-hari dan bentang alam Kabupaten Demak.

## Ketentuan karya

- Foto diambil di wilayah Kabupaten Demak dalam satu tahun terakhir
- Penyuntingan seperlunya diperbolehkan; menambah atau menghapus objek tidak
- Setiap peserta mengirim paling banyak tiga karya

Foto dari ponsel diterima dan dinilai setara dengan foto dari kamera.`,
    hariTenggat: 18,
    usiaMin: 16,
    usiaMaks: 30,
    minat: ["desain-dan-industri-kreatif", "pariwisata"],
    agendaSlug: null,
  },
  {
    slug: "lomba-cipta-konten-wisata-demak",
    judul: "Lomba cipta konten wisata religi dan pesisir Demak",
    jenis: "LOMBA" as const,
    deskripsi: `Membuat video pendek yang memperkenalkan satu tempat di Kabupaten Demak.

Durasi paling lama tiga menit. Boleh dibuat dengan ponsel. Penilaian menekankan kejelasan cerita, bukan kemewahan peralatan.`,
    hariTenggat: 6,
    usiaMin: 16,
    usiaMaks: 30,
    minat: ["jurnalistik-dan-media", "pariwisata"],
    agendaSlug: null,
  },
  {
    slug: "pelatihan-wasit-bulu-tangkis",
    judul: "Pelatihan wasit bulu tangkis angkatan kedua",
    jenis: "PELATIHAN" as const,
    deskripsi: `Pelatihan dua hari untuk menyiapkan wasit bersertifikat di Kabupaten Demak.

## Materi

1. Peraturan permainan dan pembaruannya
2. Posisi dan isyarat tangan
3. Penanganan protes dan kejadian tidak biasa
4. Praktik memimpin pertandingan

Peserta yang lulus akan dilibatkan pada turnamen antar-kecamatan.`,
    hariTenggat: 25,
    usiaMin: 17,
    usiaMaks: 30,
    minat: ["olahraga"],
    agendaSlug: null,
  },
  {
    slug: "pelatihan-pertolongan-pertama-kegiatan-olahraga",
    judul: "Pelatihan pertolongan pertama untuk panitia kegiatan olahraga",
    jenis: "PELATIHAN" as const,
    deskripsi: `Pelatihan sehari bagi pemuda yang kerap menjadi panitia kegiatan olahraga atau kegiatan lapangan.

Materi meliputi penanganan cedera ringan, pingsan, dehidrasi, dan cara memanggil pertolongan lanjutan. Diakhiri praktik berpasangan.`,
    hariTenggat: 14,
    usiaMin: 17,
    usiaMaks: 30,
    minat: ["kesehatan", "sosial-dan-kerelawanan"],
    agendaSlug: null,
  },
  {
    slug: "pelatihan-barista-kopi-demak",
    judul: "Pelatihan barista dasar untuk wirausaha muda",
    jenis: "PELATIHAN" as const,
    deskripsi: `Pelatihan empat hari bagi pemuda yang ingin membuka atau bekerja di kedai kopi.

Materi mencakup pengenalan biji, penakaran, penyeduhan manual, dan penghitungan harga jual. Peserta praktik langsung dengan alat sungguhan.`,
    hariTenggat: 20,
    usiaMin: 18,
    usiaMaks: 30,
    minat: ["kewirausahaan"],
    agendaSlug: null,
  },
  {
    slug: "beasiswa-atlet-muda-berprestasi",
    judul: "Beasiswa bagi atlet muda berprestasi Demak",
    jenis: "BEASISWA" as const,
    deskripsi: `Bantuan biaya pendidikan bagi atlet yang pernah mewakili Kabupaten Demak pada kejuaraan tingkat provinsi atau lebih tinggi.

Pendaftar melampirkan bukti prestasi, surat keterangan dari klub atau sekolah, serta rencana studi singkat.`,
    hariTenggat: 35,
    usiaMin: 17,
    usiaMaks: 25,
    minat: ["olahraga", "pendidikan"],
    agendaSlug: null,
  },
  {
    slug: "magang-pengelolaan-wisata-religi",
    judul: "Magang pengelolaan wisata religi dan pesisir",
    jenis: "MAGANG" as const,
    deskripsi: `Magang tiga bulan membantu pengelolaan kunjungan wisata, mulai dari pendataan pengunjung sampai pemanduan rombongan.

Cocok bagi pemuda yang tertarik pada pariwisata dan pelayanan tamu. Tersedia uang saku dan sertifikat.`,
    hariTenggat: 28,
    usiaMin: 18,
    usiaMaks: 28,
    minat: ["pariwisata", "kepemimpinan-dan-organisasi"],
    agendaSlug: null,
  },
  {
    slug: "lowongan-pelatih-renang-pemula",
    judul: "Lowongan pelatih renang untuk kelas pemula",
    jenis: "LOWONGAN" as const,
    deskripsi: `Dibutuhkan dua pelatih renang untuk kelas anak dan pemula, tiga kali sepekan pada sore hari.

## Syarat

- Mampu berenang gaya dada dan gaya bebas dengan benar
- Bersedia mengikuti pelatihan keselamatan air yang disediakan
- Sabar menghadapi peserta yang takut air

Pengalaman melatih bukan keharusan.`,
    hariTenggat: 30,
    usiaMin: 18,
    usiaMaks: 30,
    minat: ["olahraga", "pendidikan"],
    agendaSlug: null,
  },
  {
    slug: "lowongan-admin-media-sosial-umkm",
    judul: "Lowongan pengelola media sosial untuk UMKM Demak",
    jenis: "LOWONGAN" as const,
    deskripsi: `Beberapa pelaku usaha kecil di Demak membuka lowongan pengelola media sosial paruh waktu.

Tugasnya menyusun jadwal unggahan, memotret produk, dan membalas pesan calon pembeli. Dapat dikerjakan dari rumah dengan beberapa kali kunjungan ke tempat usaha.`,
    hariTenggat: 12,
    usiaMin: 17,
    usiaMaks: 30,
    minat: ["jurnalistik-dan-media", "kewirausahaan"],
    agendaSlug: null,
  },
];

async function semaiPeluang(pembuatId: string) {
  for (const p of PELUANG) {
    const minat = await prisma.minat.findMany({
      where: { slug: { in: p.minat } },
      select: { id: true, slug: true },
    });
    // Slug yang salah ketik akan diam-diam menghasilkan peluang tanpa bidang,
    // dan penyaringan minat jadi tampak rusak tanpa sebab. Lebih baik berhenti.
    if (minat.length !== p.minat.length) {
      const ketemu = new Set(minat.map((m) => m.slug));
      throw new Error(
        `Minat tidak dikenal pada peluang "${p.slug}": ` +
          p.minat.filter((s) => !ketemu.has(s)).join(", "),
      );
    }
    const agenda = p.agendaSlug
      ? await prisma.agenda.findUnique({
          where: { slug: p.agendaSlug },
          select: { id: true },
        })
      : null;

    const isi = {
      judul: p.judul,
      jenis: p.jenis,
      deskripsi: p.deskripsi,
      tenggat: geser(p.hariTenggat, 23),
      usiaMin: p.usiaMin,
      usiaMaks: p.usiaMaks,
      status: "TERBIT" as const,
      agendaId: agenda?.id ?? null,
    };

    await prisma.peluang.upsert({
      where: { slug: p.slug },
      update: { ...isi, minat: { set: minat.map((m) => ({ id: m.id })) } },
      create: {
        ...isi,
        slug: p.slug,
        pembuatId,
        minat: { connect: minat.map((m) => ({ id: m.id })) },
      },
    });
  }

  const terbuka = await prisma.peluang.count({
    where: { status: "TERBIT", OR: [{ tenggat: null }, { tenggat: { gte: ACUAN } }] },
  });
  console.log(
    `Peluang terbit: ${await prisma.peluang.count({ where: { status: "TERBIT" } })} (${terbuka} masih dibuka)`,
  );
}

/**
 * Profil contoh untuk akun pemuda demo, supaya Kartu Talenta tidak kosong
 * saat diperagakan. Tanggal lahirnya dibuat pasti di atas 18 tahun agar
 * halaman publiknya menampilkan bagian yang lengkap.
 */
async function semaiProfil() {
  const pemuda = await prisma.user.findUnique({
    where: { email: "pemuda@demakmuda.test" },
    select: { id: true },
  });
  if (!pemuda) return;

  const kecamatan = await prisma.kecamatan.findUniqueOrThrow({
    where: { slug: "demak" },
    select: { id: true },
  });
  const desa = await prisma.desa.findFirstOrThrow({
    where: { kecamatanId: kecamatan.id, nama: "Bintoro" },
    select: { id: true },
  });
  const minat = await prisma.minat.findMany({
    where: { slug: { in: ["teknologi-informasi", "desain-dan-industri-kreatif"] } },
    select: { id: true },
  });
  const keterampilan = await prisma.keterampilan.findMany({
    where: { slug: { in: ["desain-grafis", "fotografi", "pemrograman"] } },
    select: { id: true },
  });

  const isi = {
    bio: "Suka desain grafis dan sedang belajar membuat aplikasi. Aktif di karang taruna desa.",
    telepon: "081200000001",
    tanggalLahir: new Date("2004-04-12T00:00:00+07:00"),
    jenisKelamin: "PEREMPUAN" as const,
    kecamatanId: kecamatan.id,
    desaId: desa.id,
    // Diverifikasi supaya lencana pada Kartu Talenta ikut terlihat saat
    // diperagakan — bagian yang membedakan kartu ini dari sekadar halaman
    // profil yang diisi sendiri.
    statusVerifikasi: "TERVERIFIKASI" as const,
    diverifikasiPada: geser(-30, 10),
  };

  await prisma.profilPemuda.upsert({
    where: { userId: pemuda.id },
    update: {
      ...isi,
      minat: { set: minat.map((m) => ({ id: m.id })) },
      keterampilan: { set: keterampilan.map((k) => ({ id: k.id })) },
    },
    create: {
      ...isi,
      userId: pemuda.id,
      slug: "rani-puspitasari",
      minat: { connect: minat.map((m) => ({ id: m.id })) },
      keterampilan: { connect: keterampilan.map((k) => ({ id: k.id })) },
    },
  });

  console.log("Profil contoh: rani-puspitasari");
}

const ORGANISASI = [
  {
    slug: "karang-taruna-bintoro",
    nama: "Karang Taruna Bintoro",
    jenis: "KARANG_TARUNA" as const,
    kecamatanSlug: "demak",
    desaNama: "Bintoro",
    kontak: "0813-0000-0002",
    deskripsi: `Karang taruna Kelurahan Bintoro, bergerak di kegiatan sosial, kebersihan lingkungan, dan pembinaan olahraga pemuda.

Rutin mengadakan kerja bakti bulanan dan turnamen antar-RT.`,
    pemilikEmail: "organisasi@demakmuda.test",
    status: "TERVERIFIKASI" as const,
  },
  {
    slug: "sanggar-tari-nusa-bintoro",
    nama: "Sanggar Tari Nusa Bintoro",
    jenis: "SANGGAR" as const,
    kecamatanSlug: "demak",
    desaNama: "Katonsari",
    kontak: "sanggarnusa@contoh.id",
    deskripsi: `Sanggar tari yang menekuni tari tradisional pesisiran dan tari kreasi bertema Demak.

Latihan terbuka setiap Minggu sore untuk pemuda usia 16 sampai 25 tahun.`,
    pemilikEmail: "dinas@demakmuda.test",
    status: "TERVERIFIKASI" as const,
  },
  {
    slug: "komunitas-mangrove-sayung",
    nama: "Komunitas Mangrove Sayung",
    jenis: "KOMUNITAS" as const,
    kecamatanSlug: "sayung",
    desaNama: "Bedono",
    kontak: "0813-0000-0003",
    deskripsi: `Komunitas pemuda pesisir yang menanam dan merawat mangrove sebagai upaya menahan abrasi di Kecamatan Sayung.`,
    pemilikEmail: "dinas@demakmuda.test",
    status: "TERVERIFIKASI" as const,
  },
  {
    slug: "forum-pemuda-wedung",
    nama: "Forum Pemuda Wedung",
    jenis: "OKP" as const,
    kecamatanSlug: "wedung",
    desaNama: null,
    kontak: null,
    deskripsi: `Forum lintas organisasi kepemudaan di Kecamatan Wedung. Masih menunggu verifikasi dinas.`,
    pemilikEmail: "organisasi@demakmuda.test",
    status: "MENUNGGU" as const,
  },
  {
    slug: "pb-garuda-muda-demak",
    nama: "PB Garuda Muda Demak",
    jenis: "KLUB_OLAHRAGA" as const,
    kecamatanSlug: "demak",
    desaNama: "Bintoro",
    kontak: "0813-0000-0011",
    deskripsi: `Perkumpulan bulu tangkis dengan latihan rutin tiga kali sepekan di GOR Demak.

Menerima anggota baru sepanjang tahun, dari yang belum pernah memegang raket sampai pemain turnamen. Kelompok pemula berlatih terpisah supaya tidak kewalahan.

Klub ini juga yang menjalankan mabar terbuka setiap Rabu malam.`,
    pemilikEmail: "organisasi@demakmuda.test",
    status: "TERVERIFIKASI" as const,
  },
  {
    slug: "futsal-club-bahurekso-mranggen",
    nama: "Futsal Club Bahurekso Mranggen",
    jenis: "KLUB_OLAHRAGA" as const,
    kecamatanSlug: "mranggen",
    desaNama: "Bandungrejo",
    kontak: "0813-0000-0012",
    deskripsi: `Klub futsal pemuda Mranggen yang berdiri sejak 2019. Berlatih dua kali sepekan dan rutin mengikuti turnamen antar-kecamatan.

Menjalankan mabar lintas komunitas setiap Selasa malam, terbuka bagi siapa saja yang datang sendirian sekalipun.`,
    pemilikEmail: "organisasi@demakmuda.test",
    status: "TERVERIFIKASI" as const,
  },
  {
    slug: "ps-tunas-bahari-bonang",
    nama: "PS Tunas Bahari Bonang",
    jenis: "KLUB_OLAHRAGA" as const,
    kecamatanSlug: "bonang",
    desaNama: "Betahwalang",
    kontak: "0813-0000-0013",
    deskripsi: `Klub sepak bola pemuda pesisir dengan dua kelompok umur: U-17 dan U-23.

Latihan sore hari di lapangan desa, menyesuaikan jadwal melaut sebagian pemainnya. Rutin menggelar sparing antar-desa menjelang turnamen.`,
    pemilikEmail: "dinas@demakmuda.test",
    status: "TERVERIFIKASI" as const,
  },
  {
    slug: "demak-runners",
    nama: "Demak Runners",
    jenis: "KLUB_OLAHRAGA" as const,
    kecamatanSlug: "demak",
    desaNama: "Betokan",
    kontak: "demakrunners@contoh.id",
    deskripsi: `Komunitas lari dengan seratus anggota aktif, dimulai dari delapan orang pada 2024.

## Jadwal latihan

- Selasa sore, trek pendek di sekitar alun-alun
- Kamis sore, latihan interval di lapangan
- Minggu pagi, lari jarak jauh dengan rute berpindah

Selalu ada pendamping di kelompok paling belakang, jadi yang baru mulai tidak ditinggal.`,
    pemilikEmail: "organisasi@demakmuda.test",
    status: "TERVERIFIKASI" as const,
  },
  {
    slug: "gowes-kota-wali",
    nama: "Gowes Kota Wali",
    jenis: "KLUB_OLAHRAGA" as const,
    kecamatanSlug: "demak",
    desaNama: "Bolo",
    kontak: "0813-0000-0014",
    deskripsi: `Komunitas sepeda santai yang berkumpul setiap Minggu pagi di alun-alun.

Rute berganti tiap pekan, dari jalan kampung sampai tanggul pesisir. Rombongan berangkat dan pulang bersama, tanpa balapan.`,
    pemilikEmail: "dinas@demakmuda.test",
    status: "TERVERIFIKASI" as const,
  },
  {
    slug: "klub-voli-tirta-guntur",
    nama: "Klub Voli Tirta Guntur",
    jenis: "KLUB_OLAHRAGA" as const,
    kecamatanSlug: "guntur",
    desaNama: "Bogosari",
    kontak: "0813-0000-0015",
    deskripsi: `Klub bola voli putra dan putri yang membina pemain dari tingkat desa sampai mewakili kecamatan.

Menjadi penyelenggara turnamen voli antar-desa yang digelar setiap tahun.`,
    pemilikEmail: "organisasi@demakmuda.test",
    status: "TERVERIFIKASI" as const,
  },
  {
    slug: "padepokan-pencak-silat-wira-dempet",
    nama: "Padepokan Pencak Silat Wira Dempet",
    jenis: "KLUB_OLAHRAGA" as const,
    kecamatanSlug: "dempet",
    desaNama: "Botosengon",
    kontak: "0813-0000-0016",
    deskripsi: `Padepokan pencak silat yang membina pesilat muda untuk kejuaraan sekaligus merawat jurus tradisi setempat.

Latihan terbuka dua kali sepekan, dengan kelompok tersendiri bagi yang belum pernah berlatih sama sekali.`,
    pemilikEmail: "dinas@demakmuda.test",
    status: "TERVERIFIKASI" as const,
  },
  {
    slug: "klub-tenis-meja-karangtengah",
    nama: "Klub Tenis Meja Karangtengah",
    jenis: "KLUB_OLAHRAGA" as const,
    kecamatanSlug: "karangtengah",
    desaNama: "Karangsari",
    kontak: "0813-0000-0017",
    deskripsi: `Klub tenis meja dengan empat meja di balai desa, dipakai bergantian sejak sore sampai malam.

Bet dapat dipinjam bagi yang belum punya. Mabar terbuka setiap akhir pekan dengan sistem rotasi.`,
    pemilikEmail: "organisasi@demakmuda.test",
    status: "TERVERIFIKASI" as const,
  },
  {
    slug: "demak-esports-community",
    nama: "Demak E-Sports Community",
    jenis: "KOMUNITAS" as const,
    kecamatanSlug: "demak",
    desaNama: "Cabean",
    kontak: "demakesports@contoh.id",
    deskripsi: `Komunitas e-sports yang menaungi tim-tim pemuda Demak dan menyelenggarakan turnamen antar-kecamatan.

Selain bertanding, komunitas ini menjalankan kelas singkat tentang penyiaran langsung dan penyuntingan video pertandingan.`,
    pemilikEmail: "organisasi@demakmuda.test",
    status: "TERVERIFIKASI" as const,
  },
  {
    slug: "komunitas-fotografi-lensa-demak",
    nama: "Komunitas Fotografi Lensa Demak",
    jenis: "KOMUNITAS" as const,
    kecamatanSlug: "demak",
    desaNama: "Bango",
    kontak: "0813-0000-0018",
    deskripsi: `Komunitas fotografi yang rutin berkeliling memotret kehidupan sehari-hari di Kabupaten Demak.

Menerima anggota yang hanya bermodal ponsel. Setiap bulan diadakan pembahasan karya bersama, bukan penilaian.`,
    pemilikEmail: "dinas@demakmuda.test",
    status: "TERVERIFIKASI" as const,
  },
  {
    slug: "karang-taruna-batursari",
    nama: "Karang Taruna Batursari",
    jenis: "KARANG_TARUNA" as const,
    kecamatanSlug: "mranggen",
    desaNama: "Batursari",
    kontak: "0813-0000-0019",
    deskripsi: `Karang taruna desa terpadat di Kabupaten Demak, dengan kegiatan yang terbagi menurut dusun.

Menjalankan bank sampah, kelas belajar sore untuk anak, dan nonton bareng di lapangan desa.`,
    pemilikEmail: "organisasi@demakmuda.test",
    status: "TERVERIFIKASI" as const,
  },
  {
    slug: "karang-taruna-bedono",
    nama: "Karang Taruna Bedono",
    jenis: "KARANG_TARUNA" as const,
    kecamatanSlug: "sayung",
    desaNama: "Bedono",
    kontak: "0813-0000-0020",
    deskripsi: `Karang taruna desa pesisir yang sebagian besar kegiatannya berkaitan dengan air: penanaman mangrove, pembersihan saluran, dan kesiapsiagaan banjir rob.`,
    pemilikEmail: "dinas@demakmuda.test",
    status: "TERVERIFIKASI" as const,
  },
  {
    slug: "okp-pemuda-tani-wonosalam",
    nama: "OKP Pemuda Tani Wonosalam",
    jenis: "OKP" as const,
    kecamatanSlug: "wonosalam",
    desaNama: "Jogoloyo",
    kontak: "0813-0000-0021",
    deskripsi: `Organisasi pemuda yang menekuni pertanian, dari pembibitan sampai pemasaran hasil panen.

Mengelola lahan percontohan seluas setengah hektare untuk uji coba varietas dan cara tanam.`,
    pemilikEmail: "organisasi@demakmuda.test",
    status: "MENUNGGU" as const,
  },
  {
    slug: "sanggar-musik-pesisir-wedung",
    nama: "Sanggar Musik Pesisir Wedung",
    jenis: "SANGGAR" as const,
    kecamatanSlug: "wedung",
    desaNama: "Berahan Wetan",
    kontak: null,
    deskripsi: `Sanggar musik yang menggarap ulang lagu-lagu pesisir dengan aransemen baru.

Sering tampil pada panggung musik pemuda dan festival kuliner pesisir.`,
    pemilikEmail: "dinas@demakmuda.test",
    status: "TERVERIFIKASI" as const,
  },
  {
    slug: "komunitas-literasi-baca-demak",
    nama: "Komunitas Literasi Baca Demak",
    jenis: "KOMUNITAS" as const,
    kecamatanSlug: "karanganyar",
    desaNama: "Cangkring",
    kontak: "0813-0000-0022",
    deskripsi: `Menjalankan perpustakaan jalanan setiap Minggu pagi dan kelas menulis bulanan untuk pelajar.

Koleksi bukunya berasal dari sumbangan warga dan dikelola bergantian oleh anggota.`,
    pemilikEmail: "organisasi@demakmuda.test",
    status: "TERVERIFIKASI" as const,
  },
  {
    slug: "klub-renang-tirta-mijen",
    nama: "Klub Renang Tirta Mijen",
    jenis: "KLUB_OLAHRAGA" as const,
    kecamatanSlug: "mijen",
    desaNama: "Bakung",
    kontak: null,
    deskripsi: `Klub renang yang baru berdiri tahun ini, dengan kelas anak dan kelas pemula dewasa.

Berkasnya belum lengkap sehingga pengajuan verifikasinya belum dapat diterima dinas.`,
    pemilikEmail: "organisasi@demakmuda.test",
    status: "DITOLAK" as const,
  },
];

async function semaiOrganisasi() {
  for (const o of ORGANISASI) {
    const pemilik = await prisma.user.findUniqueOrThrow({
      where: { email: o.pemilikEmail },
      select: { id: true },
    });
    const kecamatan = await prisma.kecamatan.findUniqueOrThrow({
      where: { slug: o.kecamatanSlug },
      select: { id: true },
    });
    const desa = o.desaNama
      ? await prisma.desa.findFirst({
          where: { kecamatanId: kecamatan.id, nama: o.desaNama },
          select: { id: true },
        })
      : null;

    // Nama desa yang salah ketik akan menghasilkan organisasi tanpa desa dan
    // sulit disadari; lebih baik berhenti di sini.
    if (o.desaNama && !desa) {
      throw new Error(`Desa "${o.desaNama}" tidak ada di Kecamatan ${o.kecamatanSlug}.`);
    }

    const isi = {
      nama: o.nama,
      jenis: o.jenis,
      deskripsi: o.deskripsi,
      kontak: o.kontak,
      kecamatanId: kecamatan.id,
      desaId: desa?.id ?? null,
      statusVerifikasi: o.status,
    };

    await prisma.organisasi.upsert({
      where: { slug: o.slug },
      update: isi,
      create: { ...isi, slug: o.slug, pemilikId: pemilik.id },
    });
  }

  const terverifikasi = await prisma.organisasi.count({
    where: { statusVerifikasi: "TERVERIFIKASI" },
  });
  console.log(
    `Organisasi: ${await prisma.organisasi.count()} (${terverifikasi} terverifikasi)`,
  );
}

/**
 * Pemuda contoh untuk mengisi Peta Potensi.
 *
 * Tanpa ini dasbor dinas hanya menampilkan satu profil, dan grafiknya terlihat
 * seperti aplikasi yang tidak dipakai siapa pun — padahal yang ingin
 * diperlihatkan justru kegunaannya sebagai bahan perencanaan.
 *
 * Seluruh nama di bawah adalah karangan. Sebarannya sengaja tidak rata:
 * kecamatan besar mendapat lebih banyak, dan dua kecamatan sengaja dibiarkan
 * kosong supaya panel "kecamatan yang belum terjangkau" tetap bermakna —
 * itulah keadaan yang sebenarnya akan dihadapi dinas.
 *
 * Dibangkitkan secara pasti (tanpa acak) agar penyemaian ulang selalu
 * menghasilkan kondisi peragaan yang sama persis.
 */
const NAMA_DEPAN = [
  "Aditya", "Bagus", "Citra", "Dwi", "Eka", "Fajar", "Gilang", "Hana",
  "Indra", "Joko", "Kartika", "Lestari", "Maulana", "Nisa", "Oktavia",
  "Prasetyo", "Rahmawati", "Slamet", "Tri", "Umar", "Vina", "Wahyu",
  "Yudha", "Zahra", "Anisa", "Bayu",
];
const NAMA_BELAKANG = [
  "Pratama", "Wijaya", "Saputra", "Ramadhani", "Nugroho", "Susanti",
  "Hidayat", "Kusuma", "Lestari", "Maulida", "Firmansyah", "Anggraini",
  "Setiawan", "Rahayu",
];

/** Bobot sebaran: kecamatan besar lebih banyak, dua terakhir dibiarkan kosong. */
const BOBOT: Record<string, number> = {
  mranggen: 9,
  demak: 8,
  sayung: 7,
  wonosalam: 5,
  bonang: 5,
  karangawen: 4,
  guntur: 4,
  wedung: 4,
  karangtengah: 3,
  gajah: 3,
  karanganyar: 2,
  dempet: 2,
  // mijen dan kebonagung sengaja nol
};

async function semaiPemudaContoh() {
  const [minat, keterampilan, kecamatan] = await Promise.all([
    prisma.minat.findMany({ select: { id: true }, orderBy: { slug: "asc" } }),
    prisma.keterampilan.findMany({ select: { id: true }, orderBy: { slug: "asc" } }),
    prisma.kecamatan.findMany({ select: { id: true, slug: true } }),
  ]);
  const perSlug = new Map(kecamatan.map((k) => [k.slug, k.id]));

  let n = 0;
  for (const [slug, banyak] of Object.entries(BOBOT)) {
    const kecamatanId = perSlug.get(slug);
    if (!kecamatanId) throw new Error(`Kecamatan "${slug}" tidak ada.`);

    for (let i = 0; i < banyak; i++) {
      const nama = `${NAMA_DEPAN[n % NAMA_DEPAN.length]} ${NAMA_BELAKANG[(n * 3) % NAMA_BELAKANG.length]}`;
      const email = `contoh-${n + 1}@demakmuda.test`;
      // Usia 17 sampai 29, berputar supaya rentangnya terwakili.
      const lahir = new Date(ACUAN);
      lahir.setFullYear(lahir.getFullYear() - (17 + (n % 13)));

      const user = await prisma.user.upsert({
        where: { email },
        update: { name: nama },
        create: {
          id: `contoh-pemuda-${n + 1}`,
          name: nama,
          email,
          emailVerified: true,
          role: "pemuda",
        },
        select: { id: true },
      });

      const minatDipilih = [minat[n % minat.length], minat[(n * 5 + 3) % minat.length]];
      const keterampilanDipilih = [
        keterampilan[n % keterampilan.length],
        keterampilan[(n * 7 + 2) % keterampilan.length],
      ];

      const isi = {
        tanggalLahir: lahir,
        // Ditulis sebagai dua nilai literal terpisah, bukan `as const` pada
        // hasil ternari — TypeScript tidak menerima penegasan const di sana.
        jenisKelamin: n % 2 === 0 ? ("LAKI_LAKI" as const) : ("PEREMPUAN" as const),
        kecamatanId,
      };

      await prisma.profilPemuda.upsert({
        where: { userId: user.id },
        update: {
          ...isi,
          minat: { set: [...new Set(minatDipilih.map((m) => m.id))].map((id) => ({ id })) },
          keterampilan: {
            set: [...new Set(keterampilanDipilih.map((k) => k.id))].map((id) => ({ id })),
          },
        },
        create: {
          ...isi,
          userId: user.id,
          slug: `contoh-pemuda-${n + 1}`,
          minat: { connect: [...new Set(minatDipilih.map((m) => m.id))].map((id) => ({ id })) },
          keterampilan: {
            connect: [...new Set(keterampilanDipilih.map((k) => k.id))].map((id) => ({ id })),
          },
        },
      });
      n++;
    }
  }

  console.log(`Pemuda contoh: ${n} profil di ${Object.keys(BOBOT).length} kecamatan`);
}

/** Pendaftaran dan sertifikat contoh, supaya panel keikutsertaan tidak kosong. */
/**
 * Pendaftaran dan sertifikat contoh.
 *
 * Disebar ke beberapa peluang dan agenda sekaligus, bukan ditumpuk pada satu
 * kegiatan: daftar peserta yang hanya berisi satu acara membuat halaman
 * pengelolaan tampak seperti belum pernah dipakai, padahal justru sebaran
 * itulah yang ingin diperlihatkan kepada dinas.
 *
 * Dibangkitkan secara pasti (tanpa acak) agar penyemaian ulang selalu
 * menghasilkan kondisi peragaan yang sama persis.
 */
const PELUANG_DIIKUTI = [
  "lomba-teknologi-piranti-lunak-2026",
  "turnamen-bulu-tangkis-pemuda-cup-2026",
  "turnamen-futsal-antarkecamatan-2026",
  "turnamen-e-sports-pemuda-demak",
  "lomba-cipta-lagu-daerah-2026-lampau",
  "pelatihan-barista-kopi-demak",
];

const AGENDA_DIIKUTI = [
  "pelatihan-pemasaran-digital-angkatan-3",
  "mabar-badminton-gor-demak",
  "mabar-futsal-lintas-komunitas-mranggen",
  "fun-run-pesisir-morodemak",
  "turnamen-voli-antardesa-guntur",
  "kelas-fotografi-ponsel-demak",
];

async function semaiKeikutsertaan() {
  const peluang = await Promise.all(
    PELUANG_DIIKUTI.map((slug) =>
      prisma.peluang.findFirstOrThrow({
        where: { slug },
        select: { id: true, judul: true, pembuatId: true },
      }),
    ),
  );
  const agenda = await Promise.all(
    AGENDA_DIIKUTI.map((slug) =>
      prisma.agenda.findFirstOrThrow({
        where: { slug },
        select: { id: true, judul: true, pembuatId: true },
      }),
    ),
  );

  const pemuda = await prisma.user.findMany({
    where: { email: { startsWith: "contoh-" } },
    orderBy: { email: "asc" },
    take: 48,
    select: { id: true },
  });

  const STATUS = ["HADIR", "DITERIMA", "MENUNGGU", "HADIR", "DITOLAK", "DITERIMA"] as const;
  let nomorSertifikat = 0;

  for (const [i, p] of pemuda.entries()) {
    // Tiap pemuda mendaftar ke satu peluang dan satu agenda, dipilih dengan
    // langkah yang berbeda supaya pasangannya tidak selalu sama.
    const sasaranPeluang = peluang[i % peluang.length];
    const sasaranAgenda = agenda[(i * 5 + 2) % agenda.length];

    const statusPeluang = STATUS[i % STATUS.length];
    const statusAgenda = STATUS[(i * 3 + 1) % STATUS.length];

    const daftarPeluang = await prisma.pendaftaran.upsert({
      where: { userId_peluangId: { userId: p.id, peluangId: sasaranPeluang.id } },
      update: { status: statusPeluang },
      create: { userId: p.id, status: statusPeluang, peluangId: sasaranPeluang.id },
      select: { id: true },
    });

    await prisma.pendaftaran.upsert({
      where: { userId_agendaId: { userId: p.id, agendaId: sasaranAgenda.id } },
      update: { status: statusAgenda },
      create: { userId: p.id, status: statusAgenda, agendaId: sasaranAgenda.id },
      select: { id: true },
    });

    // Sertifikat hanya untuk yang hadir — aturan yang sama seperti di aplikasi.
    if (statusPeluang === "HADIR") {
      nomorSertifikat++;
      // Kunci upsert-nya pendaftaran, bukan kode. Sertifikat berelasi satu-satu
      // dengan pendaftaran, jadi menyemai ulang dengan penomoran yang berubah
      // akan menabrak batasan unik bila yang dipakai kodenya.
      const kode = `DM-CTH-${String(1000 + i)}`;
      await prisma.sertifikat.upsert({
        where: { pendaftaranId: daftarPeluang.id },
        update: {},
        create: {
          kode,
          judul: sasaranPeluang.judul,
          peringkat:
            nomorSertifikat === 1
              ? "Juara 1"
              : nomorSertifikat === 2
                ? "Juara 2"
                : nomorSertifikat === 3
                  ? "Juara 3"
                  : "Peserta",
          penerimaId: p.id,
          penerbitId: sasaranPeluang.pembuatId,
          pendaftaranId: daftarPeluang.id,
        },
      });
    }
  }

  console.log(
    `Keikutsertaan: ${await prisma.pendaftaran.count()} pendaftaran, ` +
      `${await prisma.sertifikat.count()} sertifikat`,
  );
}


/**
 * Karya contoh untuk Ruang Karya.
 *
 * Semuanya karangan sendiri dan dilekatkan pada akun peragaan, bukan pada
 * orang sungguhan. Slug dipakai sebagai kunci upsert supaya penyemaian ulang
 * tidak menggandakan isinya.
 */
const KARYA = [
  {
    slug: "batik-tulis-motif-mangrove-morodemak",
    judul: "Batik tulis motif mangrove Morodemak",
    jenis: "SENI" as const,
    deskripsi: `Motif ini lahir dari kebiasaan menunggu perahu pulang di tanggul Morodemak. Akar mangrove yang saling silang saya sederhanakan menjadi garis lengkung berulang, lalu diberi isen titik yang meniru gelembung lumpur saat air surut.

## Prosesnya

- Sketsa di kertas roti, tiga kali gambar ulang sampai jaraknya rata
- Canting halus untuk garis akar, canting sedang untuk isen
- Pewarnaan dua kali celup: indigo untuk air, soga untuk lumpur

Selembar kain dua meter perlu sekitar sebelas hari kerja. Sepuluh lembar pertama sudah dipesan pengunjung pameran kecamatan.`,
    hariLalu: 24,
  },
  {
    slug: "alat-pengering-bawang-merah-tenaga-surya",
    judul: "Alat pengering bawang merah bertenaga surya",
    jenis: "PRODUK" as const,
    deskripsi: `Petani bawang di lahan sekitar rumah selalu kesulitan ketika panen bertemu musim hujan. Bawang yang dijemur di halaman busuk sebelum sempat kering.

Alat ini berupa kotak kayu berlapis plastik UV dengan rak bertingkat dan satu kipas kecil bertenaga panel surya 20 watt. Udara panas masuk dari bawah dan keluar lewat cerobong di belakang, sehingga uap air tidak mengendap di dalam.

## Hasil uji

Pada tiga kali percobaan dengan muatan 15 kilogram, kadar air turun dari sekitar 80 persen menjadi 12 persen dalam dua hari, dibanding empat sampai lima hari bila dijemur terbuka. Biaya bahan seluruhnya di bawah satu juta rupiah.

Rencana berikutnya: menambah termometer sederhana supaya petani tahu kapan harus membalik rak.`,
    hariLalu: 12,
  },
  {
    slug: "peta-jalur-sepeda-kota-wali",
    judul: "Peta jalur sepeda Kota Wali",
    jenis: "PROYEK" as const,
    deskripsi: `Bersama enam teman komunitas gowes, kami memetakan jalur sepeda yang aman dari alun-alun sampai kawasan pesisir. Setiap ruas ditelusuri langsung, dicatat lebar bahu jalannya, titik lubang, dan jam paling padat kendaraan.

Hasilnya sebuah peta cetak lipat dan berkas digital yang boleh dipakai siapa saja. Tiga rute disusun menurut jarak: 8 kilometer, 17 kilometer, dan 30 kilometer.

Yang paling banyak menolong justru catatan kecilnya: di mana ada warung yang buka pagi, dan di mana sebaiknya berhenti sebelum jalan menyempit.`,
    hariLalu: 40,
  },
  {
    slug: "kumpulan-cerpen-anak-tambak",
    judul: "Anak Tambak, kumpulan sembilan cerpen",
    jenis: "TULISAN" as const,
    deskripsi: `Sembilan cerita pendek tentang anak-anak yang tumbuh di antara petak tambak: soal menunggu bapak pulang melaut, soal sekolah yang jauh, soal air pasang yang tiap tahun naik sedikit lagi.

Ditulis selama dua tahun, sebagian besar di teras belakang rumah selepas magrib. Tiga di antaranya pernah dimuat di buletin sekolah, sisanya baru selesai tahun ini.

Naskahnya masih dirapikan sebelum dicetak terbatas untuk perpustakaan desa.`,
    hariLalu: 5,
  },
  {
    slug: "jersey-sablon-manual-tim-kampung",
    judul: "Jersey sablon manual untuk tim kampung",
    jenis: "PRODUK" as const,
    deskripsi: `Berawal dari tim futsal RT yang mau seragam tapi tidak sanggup bayar harga percetakan. Saya coba sablon manual di rumah dengan rakel dan meja kayu buatan sendiri.

## Yang saya pelajari sambil jalan

1. Tinta plastisol perlu suhu pengeringan yang cukup, kalau tidak akan luntur setelah dua kali cuci
2. Bahan kaus yang murah menyerap tinta berlebihan sehingga gambar melebar
3. Nomor punggung lebih baik dicetak terpisah supaya bisa dipakai untuk ukuran apa pun

Sekarang sudah tujuh tim kampung yang memesan. Harga per potong kira-kira setengah harga percetakan, dan pengerjaannya tiga hari.`,
    hariLalu: 9,
  },
  {
    slug: "aplikasi-catat-latihan-badminton",
    judul: "Aplikasi pencatat latihan bulu tangkis",
    jenis: "PROYEK" as const,
    deskripsi: `Klub tempat saya berlatih mencatat kehadiran dan skor latihan di buku tulis, dan buku itu hilang dua kali dalam setahun.

Saya buat aplikasi sederhana yang berjalan di peramban ponsel: mencatat kehadiran, hasil pertandingan latihan, dan peringkat internal yang diperbarui otomatis.

## Yang membuatnya dipakai

- Tidak perlu memasang apa pun, cukup buka tautan
- Tetap bisa diisi saat sinyal hilang, lalu tersinkron sendiri
- Pelatih bisa melihat siapa yang jarang datang tanpa membuka satu per satu

Sudah dipakai dua klub selama empat bulan, dan buku tulisnya tidak lagi dibawa ke lapangan.`,
    hariLalu: 17,
  },
  {
    slug: "dokumenter-pendek-tambak-pasang",
    judul: "Pasang, dokumenter pendek tentang tambak yang hilang",
    jenis: "PROYEK" as const,
    deskripsi: `Film pendek berdurasi empat belas menit tentang tiga keluarga petambak yang lahannya perlahan tenggelam.

Diambil dengan satu kamera pinjaman dan mikrofon jepit selama enam kali kunjungan. Tidak ada narasi; hanya percakapan sehari-hari dan suara air.

Bagian yang paling sulit bukan pengambilan gambar, melainkan meyakinkan narasumber bahwa filmnya tidak akan dipakai untuk apa pun selain diputar di balai desa.

Pemutaran pertama dihadiri sekitar delapan puluh orang.`,
    hariLalu: 33,
  },
  {
    slug: "mural-gapura-desa-bertema-mangrove",
    judul: "Mural gapura desa bertema mangrove",
    jenis: "SENI" as const,
    deskripsi: `Gapura desa yang catnya sudah mengelupas kami lukis ulang bersama sebelas pemuda selama tiga akhir pekan.

Temanya mangrove dan burung pesisir, dipilih lewat musyawarah RT karena banyak warga ingin gambarnya berkaitan dengan lingkungan sekitar, bukan sekadar hiasan.

## Bahan

- Cat tembok eksterior, tiga warna dasar dicampur sendiri
- Kuas besar untuk bidang, kuas kecil untuk garis
- Lapisan pelindung bening supaya tahan hujan

Biayanya patungan warga dan sisa kas karang taruna.`,
    hariLalu: 46,
  },
  {
    slug: "kopi-robusta-demak-sangrai-rumahan",
    judul: "Kopi robusta sangrai rumahan Kota Wali",
    jenis: "PRODUK" as const,
    deskripsi: `Menyangrai kopi robusta dengan wajan besi di dapur rumah, lalu dikemas dalam ukuran seratus dan dua ratus gram.

Awalnya hanya untuk diminum sendiri. Setelah beberapa teman minta dibuatkan, saya mulai mencatat suhu dan waktu sangrai supaya rasanya tidak berubah-ubah tiap batch.

## Catatan sangrai

- Sangrai sedang, sekitar dua belas menit, untuk seduhan tubruk
- Sangrai lebih gelap untuk campuran susu
- Didiamkan tiga hari sebelum dikemas supaya gas keluar dulu

Sekarang rutin habis dua puluh kilogram sebulan lewat pesanan langsung.`,
    hariLalu: 20,
  },
  {
    slug: "lagu-anak-muda-kota-wali",
    judul: "Kota Wali, lagu untuk yang merantau",
    jenis: "SENI" as const,
    deskripsi: `Lagu ini ditulis untuk teman-teman seangkatan yang pergi bekerja ke luar kota dan hanya pulang saat lebaran.

Liriknya menyebut hal-hal kecil yang biasanya baru terasa setelah jauh: bunyi bedug, jalan yang tergenang tiap musim hujan, dan warung yang selalu buka lebih awal daripada yang lain.

Aransemennya sederhana, gitar dan satu perkusi. Direkam sekali jadi di ruang latihan sanggar, lengkap dengan suara motor lewat yang akhirnya kami biarkan saja.`,
    hariLalu: 28,
  },
  {
    slug: "panduan-latihan-futsal-untuk-pemula",
    judul: "Panduan latihan futsal untuk tim kampung",
    jenis: "TULISAN" as const,
    deskripsi: `Panduan dua puluh delapan halaman yang saya susun setelah tiga tahun melatih tim kampung tanpa latar belakang kepelatihan formal.

## Isinya

1. Dua belas menu latihan yang bisa dijalankan tanpa peralatan khusus
2. Cara membagi tim latihan supaya yang lemah tidak selalu kalah dan menyerah
3. Pemanasan dan pendinginan yang benar-benar dikerjakan, bukan sekadar formalitas
4. Penanganan cedera ringan yang paling sering terjadi

Ditulis dengan bahasa sehari-hari, karena pembacanya kebanyakan bukan pelatih melainkan kapten tim yang merangkap segalanya.`,
    hariLalu: 14,
  },
  {
    slug: "kaligrafi-kayu-jati-limbah-mebel",
    judul: "Kaligrafi kayu dari limbah potongan mebel",
    jenis: "SENI" as const,
    deskripsi: `Potongan jati sisa produksi mebel biasanya dibakar atau dibuang. Saya kumpulkan dari tiga bengkel di sekitar rumah dan susun menjadi panel kaligrafi.

Setiap potongan dipilih menurut serat dan warnanya, bukan diseragamkan dengan cat. Justru perbedaan warna itu yang membentuk bayangan pada hurufnya.

Satu panel berukuran enam puluh kali sembilan puluh sentimeter memerlukan sekitar dua ratus potongan dan dua pekan pengerjaan.`,
    hariLalu: 37,
  },
  {
    slug: "kanal-video-tutorial-servis-motor",
    judul: "Kanal video tutorial servis motor harian",
    jenis: "LAINNYA" as const,
    deskripsi: `Kanal video berisi tutorial perawatan motor yang bisa dikerjakan sendiri di rumah: ganti oli, setel rantai, bersihkan karburator, ganti kampas rem.

Dibuat karena banyak teman membayar mahal untuk pekerjaan yang sebenarnya sepuluh menit. Semua video direkam dengan ponsel di teras rumah, tanpa musik dan tanpa basa-basi pembuka.

Setelah delapan bulan ada tiga puluh empat video, dan yang paling sering ditonton justru yang paling sederhana: cara memeriksa tekanan ban tanpa alat ukur.`,
    hariLalu: 7,
  },
];

async function semaiKarya() {
  const pemilikUtama = await prisma.user.findUnique({
    where: { email: "pemuda@demakmuda.test" },
    select: { id: true },
  });
  if (!pemilikUtama) throw new Error("Akun pemuda@demakmuda.test belum ada.");

  // Karya kedua dan seterusnya disebar ke akun contoh supaya daftar publik
  // tidak tampak seolah hanya satu orang yang mengisi Ruang Karya.
  const lain = await prisma.user.findMany({
    where: { email: { startsWith: "contoh-" } },
    orderBy: { email: "asc" },
    take: 9,
    select: { id: true },
  });

  let n = 0;
  for (const k of KARYA) {
    const pemilikId =
      n === 0 ? pemilikUtama.id : (lain[(n - 1) % lain.length]?.id ?? pemilikUtama.id);

    await prisma.karya.upsert({
      where: { slug: k.slug },
      update: {
        judul: k.judul,
        jenis: k.jenis,
        deskripsi: k.deskripsi,
        status: "TERBIT",
      },
      create: {
        slug: k.slug,
        judul: k.judul,
        jenis: k.jenis,
        deskripsi: k.deskripsi,
        status: "TERBIT",
        pemilikId,
        dibuatPada: geser(-k.hariLalu, 10),
      },
    });
    n++;
  }

  const jumlah = await prisma.karya.count({ where: { status: "TERBIT" } });
  console.log(`Karya terbit: ${jumlah}`);
  if (jumlah < KARYA.length) {
    throw new Error(`Karya tersemai ${jumlah}, seharusnya minimal ${KARYA.length}.`);
  }
}

/**
 * Aspirasi contoh, seluruhnya dari akun peragaan pemuda@demakmuda.test.
 *
 * Sengaja dibuat bertingkat: satu masih BARU, satu sedang DIPROSES, satu sudah
 * SELESAI, supaya alur tanggapan dinas dapat diperagakan tanpa perlu mengarang
 * data di depan juri.
 */
const ASPIRASI = [
  {
    id: "aspirasi-demo-1",
    judul: "Lapangan futsal desa perlu penerangan agar bisa dipakai malam hari",
    isi: `Lapangan di belakang balai desa kami ramai dipakai anak muda setiap sore, tetapi begitu magrib langsung kosong karena gelap total.

Padahal banyak yang baru pulang kerja selepas pukul lima. Kalau ada empat titik lampu saja di sisi lapangan, pemakaiannya bisa bertambah tiga sampai empat jam setiap hari.

Kami dari karang taruna siap ikut menjaga dan membersihkan, asal pemasangan awalnya dibantu.`,
    status: "BARU" as const,
    hariLalu: 2,
    tanggapan: null as string | null,
    pengirim: null as number | null,
  },
  {
    id: "aspirasi-demo-2",
    judul: "Pelatihan pemasaran daring sebaiknya diadakan juga di kecamatan pesisir",
    isi: `Pelatihan pemasaran digital selama ini hampir selalu diadakan di kota. Bagi kami yang tinggal di kecamatan pesisir, ongkos dan waktu perjalanan pulang pergi sering lebih besar daripada manfaat pelatihan sehariannya.

Usul kami: adakan satu angkatan di kecamatan pesisir, atau sediakan rekaman materinya supaya bisa dipelajari ulang.

Peminatnya ada. Di grup pemuda desa kami saja sudah lebih dari tiga puluh orang yang menyatakan mau ikut.`,
    status: "DIPROSES" as const,
    hariLalu: 16,
    tanggapan: `Terima kasih atas usulannya. Rencana pelatihan angkatan kedua memang sedang disusun, dan lokasi di wilayah pesisir sudah masuk pertimbangan.

Saat ini kami sedang mendata calon peserta per kecamatan. Mohon menunggu pengumuman resminya di kanal Kabar DemakMuda.`,
    pengirim: null as number | null,
  },
  {
    id: "aspirasi-demo-3",
    judul: "Data organisasi kepemudaan desa sulit dicari dan sering tidak mutakhir",
    isi: `Ketika ingin mengajak kerja sama organisasi pemuda dari desa lain, kami hampir selalu kesulitan mencari kontaknya. Informasi yang beredar biasanya nomor pengurus lama yang sudah tidak menjabat.

Kalau ada satu daftar resmi yang bisa diperbarui sendiri oleh masing-masing organisasi, koordinasi antar-desa akan jauh lebih mudah.`,
    status: "SELESAI" as const,
    hariLalu: 30,
    tanggapan: `Usulan ini sudah ditindaklanjuti. Direktori organisasi kepemudaan kini tersedia di menu Organisasi, dan setiap pengurus dapat memperbarui datanya sendiri setelah akunnya diverifikasi dinas.

Silakan sampaikan kembali bila masih ada organisasi yang belum terdaftar.`,
    pengirim: null as number | null,
  },
  {
    id: "aspirasi-demo-4",
    judul: "Jam buka GOR terlalu singkat bagi yang bekerja sampai sore",
    isi: `GOR tutup pukul sembilan malam, sedangkan banyak dari kami baru sampai sekitar pukul delapan setelah pulang kerja. Praktis hanya kebagian satu jam, itu pun sudah termasuk pemanasan.

Kalau jam tutupnya bisa digeser menjadi pukul sebelas pada hari Rabu dan Jumat saja, mabar bulu tangkis yang sekarang berjalan bisa menampung dua kali lebih banyak pemain.

Kami bersedia ikut menanggung tambahan biaya listrik lewat iuran lapangan.`,
    status: "DIPROSES" as const,
    hariLalu: 8,
    tanggapan: `Usulan penambahan jam operasional sedang kami bahas dengan pengelola GOR, terutama menyangkut biaya listrik dan petugas jaga malam.

Uji coba perpanjangan jam pada dua hari tertentu kemungkinan dapat dijalankan bulan depan. Hasilnya akan kami umumkan lewat kanal Kabar.`,
    pengirim: 3,
  },
  {
    id: "aspirasi-demo-5",
    judul: "Perlu turnamen olahraga antar-kecamatan yang rutin, bukan sekali setahun",
    isi: `Turnamen antar-kecamatan biasanya hanya digelar menjelang hari besar. Setelah itu tidak ada lagi yang dikejar, dan tim-tim desa bubar sendiri karena tidak ada jadwal pertandingan.

Kalau ada liga kecil yang berjalan sepanjang tahun, meski hanya sebulan sekali, pembinaan pemain jadi lebih berkelanjutan. Cabang yang paling siap menurut kami futsal, voli, dan bulu tangkis.

Kami siap membantu menyusun jadwal dan mencari lapangan.`,
    status: "BARU" as const,
    hariLalu: 5,
    tanggapan: null as string | null,
    pengirim: 7,
  },
  {
    id: "aspirasi-demo-6",
    judul: "Sediakan jaringan internet gratis di balai desa untuk belajar",
    isi: `Banyak pelajar dan mahasiswa di desa kami mengerjakan tugas dengan kuota seadanya. Sebagian menumpang di warung kopi yang jauh dan harus membeli minuman setiap kali.

Kalau balai desa menyediakan jaringan gratis pada sore sampai malam, tempat itu bisa sekaligus menjadi ruang belajar bersama. Ruangannya sudah ada dan hampir selalu kosong di luar jam kerja.

Pengaturan jadwal dan penjagaan bisa kami bantu lewat karang taruna.`,
    status: "BARU" as const,
    hariLalu: 11,
    tanggapan: null as string | null,
    pengirim: 12,
  },
  {
    id: "aspirasi-demo-7",
    judul: "Lapangan voli desa rusak dan berbahaya untuk dipakai",
    isi: `Permukaan lapangan voli di desa kami retak di beberapa bagian dan tiang netnya miring. Sudah ada dua pemain yang terkilir dalam sebulan terakhir.

Kami sudah menambal seadanya dengan semen, tetapi retaknya kembali muncul setelah hujan. Sepertinya perlu perbaikan yang benar, bukan tambalan.`,
    status: "SELESAI" as const,
    hariLalu: 44,
    tanggapan: `Perbaikan lapangan sudah dilaksanakan melalui anggaran pemeliharaan sarana olahraga desa, meliputi pengecoran ulang permukaan dan penggantian tiang net.

Terima kasih atas laporannya. Bila ada sarana olahraga lain yang rusak, silakan sampaikan lewat kanal ini agar dapat dijadwalkan.`,
    pengirim: 5,
  },
  {
    id: "aspirasi-demo-8",
    judul: "Mohon dibuka kelas pelatihan kepelatihan olahraga untuk pemuda desa",
    isi: `Di desa kami banyak yang melatih tim anak-anak tanpa pernah belajar cara melatih. Semuanya berdasarkan pengalaman bermain sendiri.

Kalau ada pelatihan dasar kepelatihan, minimal tentang cara menyusun program latihan dan mencegah cedera, kualitas pembinaan di tingkat desa akan naik banyak.`,
    status: "DITOLAK" as const,
    hariLalu: 52,
    tanggapan: `Terima kasih atas usulannya. Untuk tahun anggaran berjalan, pelatihan kepelatihan berlisensi belum dapat kami selenggarakan karena penyelenggaraannya berada di kewenangan induk cabang olahraga, bukan dinas.

Sebagai gantinya, pelatihan pertolongan pertama untuk panitia kegiatan olahraga sudah dibuka dan terbuka bagi pelatih desa. Usulan ini kami catat untuk pengajuan anggaran tahun berikutnya.`,
    pengirim: 9,
  },
  {
    id: "aspirasi-demo-9",
    judul: "Informasi beasiswa sering terlambat sampai ke desa",
    isi: `Beberapa kali kami baru tahu ada beasiswa setelah pendaftarannya tutup. Pengumumannya biasanya hanya ditempel di kantor kecamatan atau beredar di grup tertentu.

Kalau seluruh informasi beasiswa dikumpulkan di satu tempat dengan tenggat yang jelas, dan bisa dilihat siapa saja tanpa harus masuk grup tertentu, kesempatan akan lebih merata.`,
    status: "SELESAI" as const,
    hariLalu: 38,
    tanggapan: `Sudah ditindaklanjuti. Seluruh informasi beasiswa, lomba, pelatihan, magang, dan lowongan kini dikumpulkan di kanal Peluang DemakMuda beserta tenggatnya, dan dapat dibuka siapa saja tanpa perlu masuk.

Peluang yang tenggatnya lewat tetap dapat ditelusuri lewat saringan pada halaman yang sama.`,
    pengirim: 1,
  },
];

async function semaiAspirasi() {
  const utama = await prisma.user.findUnique({
    where: { email: "pemuda@demakmuda.test" },
    select: { id: true },
  });
  const penanggap = await prisma.user.findUnique({
    where: { email: "dinas@demakmuda.test" },
    select: { id: true },
  });
  if (!utama) throw new Error("Akun pemuda@demakmuda.test belum ada.");

  // Sebagian aspirasi dilekatkan pada akun contoh supaya daftar dinas tidak
  // tampak seolah hanya satu orang yang pernah mengirim.
  const lain = await prisma.user.findMany({
    where: { email: { startsWith: "contoh-" } },
    orderBy: { email: "asc" },
    take: 20,
    select: { id: true },
  });

  for (const a of ASPIRASI) {
    const pengirimId =
      a.pengirim === null ? utama.id : (lain[a.pengirim % lain.length]?.id ?? utama.id);

    const isiAspirasi = {
      judul: a.judul,
      isi: a.isi,
      status: a.status,
      tanggapan: a.tanggapan,
      ditanggapiPada: a.tanggapan ? geser(-a.hariLalu + 3, 11) : null,
      penanggapId: a.tanggapan ? (penanggap?.id ?? null) : null,
    };

    await prisma.aspirasi.upsert({
      where: { id: a.id },
      update: isiAspirasi,
      create: {
        id: a.id,
        ...isiAspirasi,
        pengirimId,
        dibuatPada: geser(-a.hariLalu, 9),
      },
    });
  }

  const jumlah = await prisma.aspirasi.count();
  const belumDitanggapi = await prisma.aspirasi.count({ where: { status: "BARU" } });
  console.log(`Aspirasi: ${jumlah} (${belumDitanggapi} menunggu tanggapan)`);
  if (jumlah < ASPIRASI.length) {
    throw new Error(`Aspirasi tersemai ${jumlah}, seharusnya minimal ${ASPIRASI.length}.`);
  }
}

/**
 * Riwayat dan pemberitahuan untuk akun peragaan.
 *
 * Tanpa ini, akun pemuda peragaan tampak seperti akun yang baru dibuat: tidak
 * tergabung di organisasi mana pun, tidak pernah mendaftar kegiatan, tidak
 * punya sertifikat, dan loncengnya kosong. Padahal justru riwayat itulah yang
 * ingin diperlihatkan — aplikasi yang sudah dipakai, bukan yang baru dipasang.
 *
 * Pemberitahuannya sengaja dibuat SESUAI dengan keadaan yang benar-benar ada
 * di basis data. Pemberitahuan "sertifikat terbit" yang tidak berpasangan
 * dengan sertifikat sungguhan akan ketahuan begitu tautannya ditekan, dan itu
 * jenis kejanggalan yang paling merusak saat diperagakan.
 *
 * Sebagian ditandai sudah dibaca dan sebagian belum, supaya perbedaan
 * keduanya terlihat pada panel loncengnya.
 */
async function semaiKisahPeragaan() {
  const [rani, pengurus, petugas] = await Promise.all([
    prisma.user.findUnique({
      where: { email: "pemuda@demakmuda.test" },
      select: { id: true, name: true },
    }),
    prisma.user.findUnique({
      where: { email: "organisasi@demakmuda.test" },
      select: { id: true },
    }),
    prisma.user.findMany({
      where: { email: { in: ["dinas@demakmuda.test", "admin@demakmuda.test"] } },
      select: { id: true },
    }),
  ]);
  if (!rani || !pengurus) throw new Error("Akun peragaan belum lengkap.");

  // ── Keanggotaan Rani ──
  const bintoro = await prisma.organisasi.findUniqueOrThrow({
    where: { slug: "karang-taruna-bintoro" },
    select: { id: true, nama: true, slug: true },
  });
  const pelari = await prisma.organisasi.findUniqueOrThrow({
    where: { slug: "demak-runners" },
    select: { id: true, nama: true, slug: true },
  });

  await prisma.keanggotaan.upsert({
    where: { organisasiId_userId: { organisasiId: bintoro.id, userId: rani.id } },
    update: { status: "TERVERIFIKASI", peran: "PENGURUS" },
    create: {
      organisasiId: bintoro.id,
      userId: rani.id,
      status: "TERVERIFIKASI",
      peran: "PENGURUS",
      dibuatPada: geser(-60, 10),
    },
  });
  await prisma.keanggotaan.upsert({
    where: { organisasiId_userId: { organisasiId: pelari.id, userId: rani.id } },
    update: { status: "MENUNGGU" },
    create: {
      organisasiId: pelari.id,
      userId: rani.id,
      status: "MENUNGGU",
      dibuatPada: geser(-2, 20),
    },
  });

  // ── Permintaan gabung yang menunggu tanggapan pengurus ──
  const calon = await prisma.user.findMany({
    where: { email: { startsWith: "contoh-" } },
    orderBy: { email: "asc" },
    take: 3,
    select: { id: true, name: true },
  });
  const organisasiPengurus = await prisma.organisasi.findMany({
    where: { pemilikId: pengurus.id, statusVerifikasi: "TERVERIFIKASI" },
    orderBy: { nama: "asc" },
    take: 3,
    select: { id: true, nama: true },
  });
  for (const [i, c] of calon.entries()) {
    const sasaran = organisasiPengurus[i % organisasiPengurus.length];
    if (!sasaran) continue;
    await prisma.keanggotaan.upsert({
      where: { organisasiId_userId: { organisasiId: sasaran.id, userId: c.id } },
      update: { status: "MENUNGGU" },
      create: {
        organisasiId: sasaran.id,
        userId: c.id,
        status: "MENUNGGU",
        dibuatPada: geser(-i - 1, 9),
      },
    });
  }

  // ── Satu kegiatan khusus anggota, supaya pembatasannya dapat diperagakan ──
  //
  // Dilekatkan pada Karang Taruna Bintoro, tempat Rani menjadi pengurus. Jadi
  // Rani boleh mendaftar sementara pemuda lain ditolak dengan alasan yang jelas
  // — perbedaan yang tidak akan terlihat bila keduanya sama-sama boleh.
  const rapatAnggota = await prisma.agenda.findUnique({
    where: { slug: "nobar-final-liga-pemuda-lapangan-desa" },
    select: { id: true },
  });
  if (rapatAnggota) {
    await prisma.agenda.update({
      where: { id: rapatAnggota.id },
      data: { organisasiId: bintoro.id, khususAnggota: true },
    });
  }

  // Sisa kegiatan milik pengurus diberi atribusi organisasi, tanpa dibatasi.
  // Kolom organisasiId sudah lama ada di skema tetapi tidak pernah terisi,
  // sehingga halaman kegiatan selalu menyebut nama akun pembuatnya alih-alih
  // nama organisasinya.
  for (const [slug, organisasiId] of [
    ["mabar-badminton-gor-demak", bintoro.id],
    ["fun-run-pesisir-morodemak", pelari.id],
    ["gowes-santai-kota-wali", pelari.id],
  ] as const) {
    const a = await prisma.agenda.findUnique({ where: { slug }, select: { id: true } });
    if (a) await prisma.agenda.update({ where: { id: a.id }, data: { organisasiId } });
  }

  // ── Kegiatan yang pernah diikuti Rani ──
  const badminton = await prisma.peluang.findUniqueOrThrow({
    where: { slug: "turnamen-bulu-tangkis-pemuda-cup-2026" },
    select: { id: true, judul: true, pembuatId: true },
  });
  const lagu = await prisma.peluang.findUniqueOrThrow({
    where: { slug: "lomba-cipta-lagu-daerah-2026-lampau" },
    select: { id: true, judul: true, pembuatId: true },
  });
  const mabar = await prisma.agenda.findUniqueOrThrow({
    where: { slug: "mabar-badminton-gor-demak" },
    select: { id: true, judul: true },
  });

  await prisma.pendaftaran.upsert({
    where: { userId_peluangId: { userId: rani.id, peluangId: badminton.id } },
    update: { status: "DITERIMA" },
    create: {
      userId: rani.id,
      peluangId: badminton.id,
      status: "DITERIMA",
      dibuatPada: geser(-5, 14),
    },
  });
  await prisma.pendaftaran.upsert({
    where: { userId_agendaId: { userId: rani.id, agendaId: mabar.id } },
    update: { status: "DITERIMA" },
    create: {
      userId: rani.id,
      agendaId: mabar.id,
      status: "DITERIMA",
      dibuatPada: geser(-3, 19),
    },
  });
  const ikutLagu = await prisma.pendaftaran.upsert({
    where: { userId_peluangId: { userId: rani.id, peluangId: lagu.id } },
    update: { status: "HADIR" },
    create: {
      userId: rani.id,
      peluangId: lagu.id,
      status: "HADIR",
      dibuatPada: geser(-40, 10),
    },
    select: { id: true },
  });

  // ── Sertifikat Rani, berpasangan dengan kehadirannya di atas ──
  const KODE_RANI = "DM-RANI-2026";
  await prisma.sertifikat.upsert({
    where: { pendaftaranId: ikutLagu.id },
    update: {},
    create: {
      kode: KODE_RANI,
      judul: lagu.judul,
      peringkat: "Juara 2",
      penerimaId: rani.id,
      penerbitId: lagu.pembuatId,
      pendaftaranId: ikutLagu.id,
      terbitPada: geser(-12, 11),
    },
  });

  // ── Pemberitahuan ──
  const aspirasiDitanggapi = await prisma.aspirasi.findMany({
    where: { pengirimId: rani.id, tanggapan: { not: null } },
    orderBy: { dibuatPada: "desc" },
    select: { id: true, judul: true },
  });
  const aspirasiBaru = await prisma.aspirasi.findMany({
    where: { status: "BARU" },
    orderBy: { dibuatPada: "desc" },
    take: 3,
    select: { id: true, judul: true },
  });

  type Kabar = {
    id: string;
    penerimaId: string;
    jenis:
      | "KEANGGOTAAN_DIAJUKAN"
      | "KEANGGOTAAN_DIPUTUSKAN"
      | "ASPIRASI_MASUK"
      | "ASPIRASI_DITANGGAPI"
      | "PENDAFTARAN_DIPUTUSKAN"
      | "SERTIFIKAT_TERBIT"
      | "ORGANISASI_DIVERIFIKASI";
    judul: string;
    pesan: string;
    tautan: string;
    jamLalu: number;
    terbaca: boolean;
  };

  const kabar: Kabar[] = [
    {
      id: "notif-demo-rani-1",
      penerimaId: rani.id,
      jenis: "SERTIFIKAT_TERBIT",
      judul: "Sertifikat Anda terbit",
      pesan: `${lagu.judul} — kode ${KODE_RANI}`,
      tautan: `/cek/${KODE_RANI}`,
      jamLalu: 3,
      terbaca: false,
    },
    {
      id: "notif-demo-rani-2",
      penerimaId: rani.id,
      jenis: "KEANGGOTAAN_DIPUTUSKAN",
      judul: "Pengajuan keanggotaan diterima",
      pesan: `Anda kini tercatat sebagai anggota ${bintoro.nama}.`,
      tautan: `/direktori/${bintoro.slug}`,
      jamLalu: 20,
      terbaca: false,
    },
    {
      id: "notif-demo-rani-3",
      penerimaId: rani.id,
      jenis: "PENDAFTARAN_DIPUTUSKAN",
      judul: "Pendaftaran Anda diterima",
      pesan: badminton.judul,
      tautan: "/pemuda/kegiatan",
      jamLalu: 52,
      terbaca: true,
    },
  ];

  aspirasiDitanggapi.forEach((a, i) => {
    kabar.push({
      id: `notif-demo-rani-aspirasi-${i + 1}`,
      penerimaId: rani.id,
      jenis: "ASPIRASI_DITANGGAPI",
      judul: "Aspirasi Anda ditanggapi dinas",
      pesan: a.judul,
      tautan: "/pemuda/aspirasi",
      jamLalu: 70 + i * 40,
      terbaca: i > 0,
    });
  });

  calon.forEach((c, i) => {
    const sasaran = organisasiPengurus[i % organisasiPengurus.length];
    if (!sasaran) return;
    kabar.push({
      id: `notif-demo-pengurus-${i + 1}`,
      penerimaId: pengurus.id,
      jenis: "KEANGGOTAAN_DIAJUKAN",
      judul: "Permintaan bergabung baru",
      pesan: `${c.name} mengajukan diri sebagai anggota ${sasaran.nama}.`,
      tautan: `/kelola/organisasi/${sasaran.id}/anggota`,
      jamLalu: 6 + i * 18,
      terbaca: i === 2,
    });
  });

  kabar.push({
    id: "notif-demo-pengurus-verifikasi",
    penerimaId: pengurus.id,
    jenis: "ORGANISASI_DIVERIFIKASI",
    judul: "Organisasi Anda terverifikasi",
    pesan: `${bintoro.nama} kini tampil di Direktori Organisasi.`,
    tautan: `/kelola/organisasi/${bintoro.id}`,
    jamLalu: 96,
    terbaca: true,
  });

  for (const p of petugas) {
    aspirasiBaru.forEach((a, i) => {
      kabar.push({
        id: `notif-demo-dinas-${p.id.slice(-6)}-${i + 1}`,
        penerimaId: p.id,
        jenis: "ASPIRASI_MASUK",
        judul: "Aspirasi baru masuk",
        pesan: a.judul,
        tautan: `/kelola/aspirasi/${a.id}`,
        jamLalu: 8 + i * 26,
        terbaca: false,
      });
    });
  }

  for (const k of kabar) {
    const dibuatPada = new Date(ACUAN.getTime() - k.jamLalu * 60 * 60 * 1000);
    const isi = {
      jenis: k.jenis,
      judul: k.judul,
      pesan: k.pesan,
      tautan: k.tautan,
      dibacaPada: k.terbaca
        ? new Date(dibuatPada.getTime() + 30 * 60 * 1000)
        : null,
    };
    await prisma.notifikasi.upsert({
      where: { id: k.id },
      update: isi,
      create: { id: k.id, ...isi, penerimaId: k.penerimaId, dibuatPada },
    });
  }

  const khusus = await prisma.agenda.count({ where: { khususAnggota: true } });
  const beratribusi = await prisma.agenda.count({
    where: { organisasiId: { not: null } },
  });
  console.log(
    `Penyelenggara: ${beratribusi} agenda beratribusi organisasi ` +
      `(${khusus} khusus anggota)`,
  );

  const belum = await prisma.notifikasi.count({ where: { dibacaPada: null } });
  console.log(
    `Kisah peragaan: ${await prisma.notifikasi.count()} pemberitahuan ` +
      `(${belum} belum dibaca), sertifikat ${KODE_RANI}`,
  );
}

async function main() {
  console.log(`Acuan tanggal: ${ACUAN.toLocaleDateString("id-ID", { dateStyle: "full" })}`);
  const penulis = await prisma.user.findUnique({
    where: { email: "dinas@demakmuda.test" },
    select: { id: true },
  });
  if (!penulis) {
    throw new Error(
      "Akun demo belum ada. Jalankan `npm run db:seed:akun` lebih dulu.",
    );
  }

  for (const k of KABAR) {
    await prisma.berita.upsert({
      where: { slug: k.slug },
      update: {
        judul: k.judul,
        ringkasan: k.ringkasan,
        isi: k.isi,
        status: "TERBIT",
        terbitPada: geser(k.hariTerbit),
      },
      create: {
        slug: k.slug,
        judul: k.judul,
        ringkasan: k.ringkasan,
        isi: k.isi,
        status: "TERBIT",
        terbitPada: geser(k.hariTerbit),
        penulisId: penulis.id,
      },
    });
  }

  const jumlah = await prisma.berita.count({ where: { status: "TERBIT" } });
  console.log(`Kabar terbit: ${jumlah}`);
  if (jumlah < KABAR.length) {
    throw new Error(`Kabar tersemai ${jumlah}, seharusnya minimal ${KABAR.length}.`);
  }

  await semaiAgenda(penulis.id);
  await semaiPeluang(penulis.id);
  await semaiProfil();
  await semaiOrganisasi();
  await semaiPemudaContoh();
  await semaiKeikutsertaan();
  await semaiKarya();
  await semaiAspirasi();
  await semaiKisahPeragaan();

  console.log("Penyemaian isi contoh selesai.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
