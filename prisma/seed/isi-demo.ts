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

/** Tanggal acuan tetap supaya kondisi demo selalu sama setiap disemai ulang. */
const ACUAN = new Date("2026-08-19T00:00:00+07:00");

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
async function semaiKeikutsertaan() {
  const peluang = await prisma.peluang.findFirstOrThrow({
    where: { slug: "lomba-teknologi-piranti-lunak-2026" },
    select: { id: true, judul: true, pembuatId: true },
  });
  const agenda = await prisma.agenda.findFirstOrThrow({
    where: { slug: "pelatihan-pemasaran-digital-angkatan-3" },
    select: { id: true, pembuatId: true },
  });
  const pemuda = await prisma.user.findMany({
    where: { email: { startsWith: "contoh-" } },
    orderBy: { email: "asc" },
    take: 18,
    select: { id: true },
  });

  const STATUS = ["HADIR", "DITERIMA", "MENUNGGU", "DITOLAK"] as const;

  for (const [i, p] of pemuda.entries()) {
    const status = STATUS[i % STATUS.length];
    const sasaran = i % 2 === 0 ? { peluangId: peluang.id } : { agendaId: agenda.id };

    const pendaftaran = await prisma.pendaftaran.upsert({
      where:
        i % 2 === 0
          ? { userId_peluangId: { userId: p.id, peluangId: peluang.id } }
          : { userId_agendaId: { userId: p.id, agendaId: agenda.id } },
      update: { status },
      create: { userId: p.id, status, ...sasaran },
      select: { id: true },
    });

    // Sertifikat hanya untuk yang hadir — aturan yang sama seperti di aplikasi.
    if (status === "HADIR") {
      const kode = `DM-CTH${String(i).padStart(1, "0")}-${String(1000 + i)}`;
      await prisma.sertifikat.upsert({
        where: { kode },
        update: {},
        create: {
          kode,
          judul: peluang.judul,
          peringkat: i === 0 ? "Juara 1" : "Peserta",
          penerimaId: p.id,
          penerbitId: peluang.pembuatId,
          pendaftaranId: pendaftaran.id,
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
    take: 3,
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
  },
];

async function semaiAspirasi() {
  const pengirim = await prisma.user.findUnique({
    where: { email: "pemuda@demakmuda.test" },
    select: { id: true },
  });
  const penanggap = await prisma.user.findUnique({
    where: { email: "dinas@demakmuda.test" },
    select: { id: true },
  });
  if (!pengirim) throw new Error("Akun pemuda@demakmuda.test belum ada.");

  for (const a of ASPIRASI) {
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
        pengirimId: pengirim.id,
        dibuatPada: geser(-a.hariLalu, 9),
      },
    });
  }

  const jumlah = await prisma.aspirasi.count();
  console.log(`Aspirasi: ${jumlah}`);
  if (jumlah < ASPIRASI.length) {
    throw new Error(`Aspirasi tersemai ${jumlah}, seharusnya minimal ${ASPIRASI.length}.`);
  }
}

async function main() {
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

  console.log("Penyemaian isi contoh selesai.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
