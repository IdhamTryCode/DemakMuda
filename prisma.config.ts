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

/**
 * Sengaja TIDAK melempar galat bila alamatnya tidak ada.
 *
 * Berkas konfigurasi ini dimuat oleh setiap perintah Prisma, termasuk
 * `prisma generate` yang sama sekali tidak memerlukan basis data. Melempar di
 * sini akan menggagalkan pemasangan ketergantungan — bukan hanya migrasi.
 * Perintah yang benar-benar butuh alamat akan gagal sendiri dengan pesannya.
 */
function alamatBasisData(): string | undefined {
  for (const nama of [...NAMA_TANPA_POOL, ...NAMA_BIASA]) {
    const nilai = process.env[nama];
    if (nilai) return nilai;
  }
  console.warn(
    "[prisma] Alamat basis data tidak ditemukan. Variabel yang dicari: " +
      [...NAMA_TANPA_POOL, ...NAMA_BIASA].join(", ") +
      ". Perintah yang memerlukan basis data akan gagal.",
  );
  return undefined;
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
