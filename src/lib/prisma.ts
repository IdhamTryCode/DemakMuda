import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "@/generated/prisma/client";

// Next.js memuat ulang modul saat pengembangan, sehingga tanpa penyimpanan di
// globalThis akan lahir banyak koneksi basis data sampai kuotanya habis.
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function buatKlien() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL belum diisi. Salin .env.example menjadi .env.");
  }
  return new PrismaClient({ adapter: new PrismaPg({ connectionString }) });
}

export const prisma = globalForPrisma.prisma ?? buatKlien();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
