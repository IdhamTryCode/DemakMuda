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

async function main() {
  await semaiWilayah();
  await semaiMinatDanKeterampilan();
  console.log("Penyemaian selesai.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
