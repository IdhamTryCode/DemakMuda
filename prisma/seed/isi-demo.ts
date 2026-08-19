/**
 * Menyemai isi contoh untuk peragaan: kabar, agenda, dan peluang.
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

  console.log("Penyemaian isi contoh selesai.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
