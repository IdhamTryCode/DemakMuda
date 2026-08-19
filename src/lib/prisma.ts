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

function buatKlien(): PrismaClient {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL belum diisi. Salin .env.example menjadi .env.");
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
