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

/**
 * Menaikkan mode SSL yang lemah menjadi `verify-full`.
 *
 * Alamat Neon yang disalurkan integrasi Vercel memakai `sslmode=require`. Pada
 * pustaka `pg` yang terpasang sekarang, nilai itu diperlakukan sama dengan
 * `verify-full`: tersandi DAN sertifikat servernya diperiksa. Tetapi pustakanya
 * sendiri sudah memperingatkan bahwa pada versi mayor berikutnya `require`,
 * `prefer`, dan `verify-ca` akan mengikuti arti libpq — tersandi, tetapi
 * sertifikatnya TIDAK lagi diperiksa.
 *
 * Artinya keamanan sambungan ke basis data akan menurun sendiri pada suatu
 * pembaruan dependensi, tanpa galat, tanpa build merah, dan tanpa satu baris
 * pun berubah di sini. Kegagalan yang tidak berbunyi seperti itu justru yang
 * paling berbahaya.
 *
 * Variabelnya sendiri tidak dapat disunting di Vercel — ia dikelola integrasi
 * Neon dan terkunci — jadi penegakannya dilakukan di sini, di satu-satunya
 * tempat alamat itu dipakai. Ditulis di sini pula ia selamat dari rotasi
 * kredensial, yang menulis ulang nilai variabelnya.
 *
 * Alamat tanpa `sslmode` sengaja dibiarkan apa adanya: basis data lokal di
 * Docker tidak melayani SSL, dan memaksakannya di sana hanya akan memutus
 * sambungan pengembangan.
 */
const MODE_SSL_LEMAH = /([?&]sslmode=)(require|prefer|verify-ca)(?=&|$)/i;

export function tegakkanSslPenuh(alamat: string): string {
  return alamat.replace(MODE_SSL_LEMAH, "$1verify-full");
}

function buatKlien(): PrismaClient {
  const alamat = NAMA_ALAMAT.map((n) => process.env[n]).find(Boolean);
  if (!alamat) {
    throw new Error(
      `Alamat basis data belum diisi. Setel salah satu dari: ${NAMA_ALAMAT.join(", ")}.`,
    );
  }
  const connectionString = tegakkanSslPenuh(alamat);
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
