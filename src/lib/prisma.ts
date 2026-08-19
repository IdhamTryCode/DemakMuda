import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "@/generated/prisma/client";

/**
 * Klien Prisma yang dibuat saat pertama kali dipakai, bukan saat modul dimuat.
 *
 * Penting untuk penerbitan: `next build` mengimpor seluruh modul halaman untuk
 * mengumpulkan datanya. Bila klien dibuat di tingkat modul, build akan menuntut
 * DATABASE_URL ada pada tahap build — padahal basis data baru diperlukan saat
 * aplikasi melayani permintaan.
 */
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

/**
 * Saat melayani permintaan, alamat ber-penggabung sambungan justru yang
 * diinginkan — kebalikan dari migrasi (lihat prisma.config.ts). Nama variabel
 * yang lazim dipakai integrasi Vercel ikut diperiksa supaya penerbitan tidak
 * gagal hanya karena penamaan.
 */
const NAMA_ALAMAT = [
  "DATABASE_URL",
  "POSTGRES_PRISMA_URL",
  "POSTGRES_URL",
  "DATABASE_URL_UNPOOLED",
  "POSTGRES_URL_NON_POOLING",
];

function buatKlien(): PrismaClient {
  const connectionString = NAMA_ALAMAT.map((n) => process.env[n]).find(Boolean);
  if (!connectionString) {
    throw new Error(
      `Alamat basis data belum diisi. Setel salah satu dari: ${NAMA_ALAMAT.join(", ")}.`,
    );
  }
  return new PrismaClient({ adapter: new PrismaPg({ connectionString }) });
}

function klien(): PrismaClient {
  // Next.js memuat ulang modul saat pengembangan, sehingga tanpa penyimpanan di
  // globalThis akan lahir banyak koneksi basis data sampai kuotanya habis.
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = buatKlien();
  }
  return globalForPrisma.prisma;
}

export const prisma = new Proxy({} as PrismaClient, {
  get(_sasaran, kunci, penerima) {
    const nyata = klien();
    const nilai = Reflect.get(nyata, kunci, penerima);
    // Metode seperti $transaction harus tetap terikat ke klien aslinya.
    return typeof nilai === "function" ? nilai.bind(nyata) : nilai;
  },
});
