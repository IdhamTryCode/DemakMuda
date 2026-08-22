/**
 * Menyemai data acuan DemakMuda.
 *
 *   npm run db:seed
 *
 * Aman dijalankan berulang kali: semua operasi memakai upsert, sehingga
 * perintah ini dapat dipakai mengembalikan basis data ke kondisi demo.
 *
 * Isinya seluruhnya data nyata atau daftar acuan — belum ada data pengguna.
 * Data contoh untuk demo disemai terpisah pada tahap berikutnya.
 */
import "dotenv/config";

import { readFileSync } from "node:fs";
import { join } from "node:path";

import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient, type JenisDesa } from "../../src/generated/prisma/client";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL belum diisi. Salin .env.example menjadi .env.");
}
const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

type BerkasWilayah = {
  jumlahKecamatan: number;
  jumlahDesaKelurahan: number;
  kecamatan: {
    id: string;
    nama: string;
    slug: string;
    desa: { id: string; nama: string; jenis: JenisDesa }[];
  }[];
};

/** Bidang minat yang relevan bagi pemuda Demak. Dipakai menyaring peluang. */
const MINAT = [
  "Teknologi Informasi",
  "Kewirausahaan",
  "Seni dan Budaya",
  "Olahraga",
  "Lingkungan dan Kebencanaan",
  "Pendidikan",
  "Kesehatan",
  "Pertanian dan Perikanan",
  "Pariwisata",
  "Jurnalistik dan Media",
  "Keagamaan",
  "Sosial dan Kerelawanan",
  "Desain dan Industri Kreatif",
  "Kepemimpinan dan Organisasi",
];

/** Keterampilan yang dapat dicantumkan pemuda pada Kartu Talenta. */
const KETERAMPILAN = [
  "Desain Grafis",
  "Pemrograman",
  "Videografi",
  "Fotografi",
  "Menulis",
  "Berbicara di Depan Umum",
  "Bahasa Inggris",
  "Bahasa Arab",
  "Tari Tradisional",
  "Musik",
  "Kuliner",
  "Menjahit",
  "Membatik",
  "Pemasaran Digital",
  "Manajemen Acara",
  "Pertolongan Pertama",
  "Pertukangan",
  "Budidaya Perikanan",
];

function keSlug(nama: string): string {
  return nama
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

async function semaiWilayah() {
  const berkas = join(import.meta.dirname, "wilayah.json");
  const data = JSON.parse(readFileSync(berkas, "utf8")) as BerkasWilayah;

  for (const kec of data.kecamatan) {
    await prisma.kecamatan.upsert({
      where: { id: kec.id },
      update: { nama: kec.nama, slug: kec.slug },
      create: { id: kec.id, nama: kec.nama, slug: kec.slug },
    });

    for (const desa of kec.desa) {
      await prisma.desa.upsert({
        where: { id: desa.id },
        update: { nama: desa.nama, jenis: desa.jenis, kecamatanId: kec.id },
        create: {
          id: desa.id,
          nama: desa.nama,
          jenis: desa.jenis,
          kecamatanId: kec.id,
        },
      });
    }
  }

  const jumlahKecamatan = await prisma.kecamatan.count();
  const jumlahDesa = await prisma.desa.count();
  console.log(`Wilayah: ${jumlahKecamatan} kecamatan, ${jumlahDesa} desa/kelurahan`);

  // Kegagalan di sini berarti data tidak utuh — lebih baik ketahuan sekarang
  // daripada saat aplikasi diperagakan.
  if (jumlahKecamatan !== data.jumlahKecamatan) {
    throw new Error(
      `Kecamatan tersemai ${jumlahKecamatan}, seharusnya ${data.jumlahKecamatan}.`,
    );
  }
  if (jumlahDesa !== data.jumlahDesaKelurahan) {
    throw new Error(
      `Desa tersemai ${jumlahDesa}, seharusnya ${data.jumlahDesaKelurahan}.`,
    );
  }
}

async function semaiMinatDanKeterampilan() {
  for (const nama of MINAT) {
    const slug = keSlug(nama);
    await prisma.minat.upsert({
      where: { slug },
      update: { nama },
      create: { nama, slug },
    });
  }
  for (const nama of KETERAMPILAN) {
    const slug = keSlug(nama);
    await prisma.keterampilan.upsert({
      where: { slug },
      update: { nama },
      create: { nama, slug },
    });
  }
  console.log(
    `Acuan: ${await prisma.minat.count()} minat, ` +
      `${await prisma.keterampilan.count()} keterampilan`,
  );
}

type BerkasSekolah = {
  npsn: string;
  nama: string;
  jenjang: "SMA" | "SMK" | "MA";
  status: "NEGERI" | "SWASTA";
  alamat: string;
  desa: string;
  kodeKecamatan: string;
}[];

/**
 * Menyemai SMA, SMK, dan MA se-Kabupaten Demak.
 *
 * Sumbernya memakai kode wilayahnya sendiri (032101…032114), bukan kode
 * Kemendagri yang dipakai tabel kecamatan kita. Pemetaan antara keduanya TIDAK
 * diasumsikan berurutan sama — itu tebakan yang kebetulan sering benar dan
 * diam-diam salah sekali dua kali. Sebagai gantinya pemetaannya diturunkan
 * dari datanya sendiri: nama desa tiap sekolah dicocokkan ke tabel desa, lalu
 * kecamatan yang paling banyak cocok itulah pasangannya.
 *
 * Bila kecocokan terkuatnya pun lemah, penyemaian berhenti dan melapor.
 */
async function semaiSekolah() {
  const berkas = join(import.meta.dirname, "sekolah.json");
  const data = JSON.parse(readFileSync(berkas, "utf8")) as BerkasSekolah;

  const desa = await prisma.desa.findMany({
    select: { nama: true, kecamatanId: true },
  });
  const perDesa = new Map<string, string[]>();
  for (const d of desa) {
    const kunci = d.nama.toLowerCase();
    perDesa.set(kunci, [...(perDesa.get(kunci) ?? []), d.kecamatanId]);
  }

  // Kode sumber -> berapa kali tiap kecamatan kita muncul di antara desanya.
  const suara = new Map<string, Map<string, number>>();
  for (const sekolah of data) {
    const calon = perDesa.get(sekolah.desa.toLowerCase()) ?? [];
    const kotak = suara.get(sekolah.kodeKecamatan) ?? new Map<string, number>();
    for (const kecamatanId of calon) {
      kotak.set(kecamatanId, (kotak.get(kecamatanId) ?? 0) + 1);
    }
    suara.set(sekolah.kodeKecamatan, kotak);
  }

  const pemetaan = new Map<string, string>();
  for (const [kode, kotak] of suara) {
    const urut = [...kotak.entries()].sort((a, b) => b[1] - a[1]);
    const menang = urut[0];
    const total = data.filter((x) => x.kodeKecamatan === kode).length;
    if (!menang || menang[1] < total * 0.4) {
      throw new Error(
        `Kecamatan sumber ${kode} tidak dapat dipetakan dengan yakin ` +
          `(cocok terbaik ${menang?.[1] ?? 0} dari ${total} sekolah).`,
      );
    }
    pemetaan.set(kode, menang[0]);
  }

  const terpakai = new Set(pemetaan.values());
  if (terpakai.size !== pemetaan.size) {
    throw new Error("Dua kecamatan sumber terpetakan ke kecamatan yang sama.");
  }

  for (const sekolah of data) {
    const kecamatanId = pemetaan.get(sekolah.kodeKecamatan);
    if (!kecamatanId) throw new Error(`Kecamatan ${sekolah.kodeKecamatan} tidak dipetakan.`);

    await prisma.sekolah.upsert({
      where: { npsn: sekolah.npsn },
      update: { nama: sekolah.nama, jenjang: sekolah.jenjang, kecamatanId },
      create: {
        npsn: sekolah.npsn,
        nama: sekolah.nama,
        jenjang: sekolah.jenjang,
        kecamatanId,
      },
    });
  }

  const jumlah = await prisma.sekolah.count();
  const perJenjang = await prisma.sekolah.groupBy({
    by: ["jenjang"],
    _count: { _all: true },
  });
  console.log(
    `Sekolah: ${jumlah} (` +
      perJenjang.map((j) => `${j.jenjang} ${j._count._all}`).join(", ") +
      ")",
  );

  if (jumlah < data.length) {
    throw new Error(`Sekolah tersemai ${jumlah}, seharusnya ${data.length}.`);
  }
}

async function main() {
  await semaiWilayah();
  await semaiMinatDanKeterampilan();
  await semaiSekolah();
  console.log("Penyemaian selesai.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
