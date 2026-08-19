import "dotenv/config";
import { defineConfig } from "prisma/config";

/**
 * Alamat basis data untuk perkakas Prisma (migrasi dan penyemaian).
 *
 * Dua hal yang ditangani di sini:
 *
 * 1. Nama variabel. Integrasi basis data di Vercel tidak selalu menyuntikkan
 *    DATABASE_URL; Neon dan Vercel Postgres kerap memakai nama lain. Daripada
 *    penerbitan gagal hanya karena nama variabel, seluruh nama yang lazim
 *    diperiksa.
 *
 * 2. Sambungan langsung. Migrasi tidak boleh lewat penggabung sambungan
 *    (connection pooler): pada mode transaksi, pernyataan tersiapkan yang
 *    dipakai Prisma bisa gagal di tengah jalan. Karena itu alamat tanpa
 *    penggabung didahulukan bila tersedia.
 */
const NAMA_TANPA_POOL = [
  "DATABASE_URL_UNPOOLED",
  "POSTGRES_URL_NON_POOLING",
  "DIRECT_DATABASE_URL",
];

const NAMA_BIASA = ["DATABASE_URL", "POSTGRES_PRISMA_URL", "POSTGRES_URL"];

function alamatBasisData(): string {
  for (const nama of [...NAMA_TANPA_POOL, ...NAMA_BIASA]) {
    const nilai = process.env[nama];
    if (nilai) return nilai;
  }
  throw new Error(
    "Alamat basis data tidak ditemukan. Setel salah satu variabel berikut: " +
      [...NAMA_TANPA_POOL, ...NAMA_BIASA].join(", ") +
      ". Pada Vercel, periksa Settings → Environment Variables dan pastikan " +
      "variabelnya berlaku untuk lingkungan yang sedang dibangun.",
  );
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: alamatBasisData(),
  },
});
