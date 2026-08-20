/**
 * Membuat satu akun demo untuk tiap peran.
 *
 *   npm run db:seed:akun
 *
 * Akun dibuat lewat API Better Auth agar kata sandinya melewati proses
 * penyandian yang sama dengan pendaftaran biasa — tidak pernah disisipkan
 * langsung ke tabel.
 *
 * HANYA untuk pengembangan dan peragaan. Skrip menolak berjalan di produksi.
 * Kata sandinya memang tertulis di sini dengan sengaja: ini data contoh, bukan
 * rahasia, dan cetak biru mensyaratkan kondisi demo dapat diulang persis.
 */
import "dotenv/config";

import { PrismaPg } from "@prisma/adapter-pg";

import { auth } from "../../src/lib/auth";
import { PrismaClient } from "../../src/generated/prisma/client";
import { AKUN_PERAGAAN, SANDI_PERAGAAN } from "../../src/lib/akun-peragaan";
import { PERAN } from "../../src/lib/peran";

if (process.env.NODE_ENV === "production") {
  throw new Error("Akun demo tidak boleh dibuat di lingkungan produksi.");
}

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL belum diisi. Salin .env.example menjadi .env.");
}
const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

// Daftar akunnya tinggal di src/lib/akun-peragaan.ts karena halaman masuk juga
// memerlukannya. Dua daftar yang sama di dua tempat selalu berakhir berbeda.
const KATA_SANDI = SANDI_PERAGAAN;
const AKUN = AKUN_PERAGAAN;

async function buatAkun(akun: (typeof AKUN)[number]) {
  const sudahAda = await prisma.user.findUnique({ where: { email: akun.email } });

  if (!sudahAda) {
    await auth.api.signUpEmail({
      body: { name: akun.nama, email: akun.email, password: KATA_SANDI },
    });
  }

  // Peran dan status verifikasi disetel langsung: pendaftaran biasa selalu
  // menghasilkan peran "pemuda" yang belum terverifikasi, sedangkan akun demo
  // harus siap dipakai masuk tanpa langkah tambahan.
  await prisma.user.update({
    where: { email: akun.email },
    data: { role: akun.peran, emailVerified: true, name: akun.nama },
  });
}

async function main() {
  for (const akun of AKUN) {
    await buatAkun(akun);
    console.log(`  ${akun.peran.padEnd(11)} ${akun.email}`);
  }

  const jumlah = await prisma.user.count({
    where: { email: { in: AKUN.map((a) => a.email) } },
  });
  if (jumlah !== PERAN.length) {
    throw new Error(`Akun demo terbentuk ${jumlah}, seharusnya ${PERAN.length}.`);
  }

  console.log(`\n${jumlah} akun demo siap. Kata sandi seragam: ${KATA_SANDI}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
