/**
 * Uji asap halaman perlindungan data dan halaman 404.
 *
 *   npm run dev            (di terminal lain)
 *   npm run uji:privasi
 *
 * Halaman privasi hanya berguna bila isinya benar. Karena itu uji ini tidak
 * sekadar memastikan halamannya terbuka, melainkan mencocokkan janji yang
 * tertulis di sana dengan yang benar-benar dikerjakan aplikasi.
 */
import "dotenv/config";

import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "../src/generated/prisma/client";
import { tegakkanSslPenuh } from "../src/lib/prisma";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL belum diisi.");
const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

const PANGKALAN = process.env.UJI_URL ?? "http://localhost:3000";

let gagal = 0;
function periksa(lulus: boolean, keterangan: string) {
  console.log(`  ${lulus ? "✓" : "✗"} ${keterangan}`);
  if (!lulus) gagal++;
}

async function ambil(jalur: string) {
  const res = await fetch(`${PANGKALAN}${jalur}`, { redirect: "manual" });
  return { status: res.status, isi: res.status === 200 ? await res.text() : "" };
}

function teks(html: string) {
  return html.replace(/<!--[\s\S]*?-->/g, "").replace(/<[^>]+>/g, " ");
}

async function main() {
  console.log(`Menguji ${PANGKALAN}\n`);

  console.log("halaman perlindungan data");
  const privasi = await ambil("/privasi");
  periksa(privasi.status === 200, "terbuka tanpa masuk");

  const t = teks(privasi.isi);
  for (const bagian of [
    "Yang kami simpan",
    "Bila Anda di bawah 18 tahun",
    "Yang tidak kami lakukan",
    "Hak Anda",
    "Cara kami menjaganya",
  ]) {
    periksa(t.includes(bagian), `memuat bagian "${bagian}"`);
  }

  console.log("\njanji di halaman cocok dengan perilaku aplikasi");

  // Janji: nomor telepon tidak pernah tampil di halaman publik.
  const berTelepon = await prisma.profilPemuda.findFirst({
    where: { telepon: { not: null } },
    select: { slug: true, telepon: true },
  });
  if (berTelepon?.telepon) {
    const kartu = await ambil(`/p/${berTelepon.slug}`);
    periksa(
      !kartu.isi.includes(berTelepon.telepon),
      "janji ditepati: telepon tidak tampil di Kartu Talenta publik",
    );
  } else {
    periksa(false, "tidak ada profil bertelepon untuk menguji janji ini");
  }

  // Janji: NIK tidak diminta pada tahap ini.
  const kolomNik = await prisma.profilPemuda.count({ where: { nikHash: { not: null } } });
  periksa(kolomNik === 0, "janji ditepati: tidak ada NIK tersimpan");

  // Janji: sertifikat tetap dapat diperiksa lewat kodenya.
  const sertifikat = await prisma.sertifikat.findFirst({
    where: { dibatalkanPada: null },
    select: { kode: true },
  });
  if (sertifikat) {
    periksa(
      (await ambil(`/cek/${sertifikat.kode}`)).isi.includes("Sertifikat sah"),
      "janji ditepati: sertifikat dapat diperiksa lewat kodenya",
    );
  }

  console.log("\ntautan dari tempat yang tepat");
  periksa(
    (await ambil("/daftar")).isi.includes("/privasi"),
    "formulir pendaftaran menautkan halaman perlindungan data",
  );
  periksa(
    (await ambil("/kabar")).isi.includes("/privasi"),
    "footer halaman publik menautkan halaman perlindungan data",
  );

  console.log("\nhalaman 404");
  const hilang = await fetch(`${PANGKALAN}/alamat-yang-pasti-tidak-ada-123`);
  periksa(hilang.status === 404, `alamat tak dikenal membalas 404 (${hilang.status})`);
  const isi404 = await hilang.text();
  periksa(isi404.includes("Halaman ini tidak ada"), "halaman 404 berbahasa Indonesia");
  periksa(isi404.includes("/cek"), "halaman 404 menawarkan pemeriksaan sertifikat");

  // Sambungan ke basis data harus tersandi DAN sertifikatnya diperiksa. Alamat
  // dari integrasi Neon datang dengan sslmode=require, yang pada pustaka pg
  // sekarang berarti verify-full — tetapi akan berubah arti menjadi lebih lemah
  // pada versi mayor berikutnya, tanpa galat dan tanpa build merah. Penegakannya
  // ada di src/lib/prisma.ts, dan pemeriksaan ini yang menahannya tetap ada.
  //
  // Ditulis sebagai uji karena kegagalannya senyap: regex yang tidak cocok tidak
  // melempar apa pun, ia hanya diam-diam tidak mengubah apa-apa. Bentuk pertama
  // yang ditulis untuk fungsi ini memang begitu, dan hanya ketahuan karena diuji.
  console.log("\npenegakan mode SSL sambungan basis data");
  const contohSsl: [string, string, string][] = [
    ["require dinaikkan menjadi verify-full", "postgres://u@h/db?sslmode=require", "postgres://u@h/db?sslmode=verify-full"],
    ["prefer dinaikkan", "postgres://u@h/db?sslmode=prefer", "postgres://u@h/db?sslmode=verify-full"],
    ["verify-ca dinaikkan", "postgres://u@h/db?sslmode=verify-ca", "postgres://u@h/db?sslmode=verify-full"],
    ["dikenali di tengah parameter lain", "postgres://u@h/db?a=1&sslmode=require&b=2", "postgres://u@h/db?a=1&sslmode=verify-full&b=2"],
    ["verify-full dibiarkan apa adanya", "postgres://u@h/db?sslmode=verify-full", "postgres://u@h/db?sslmode=verify-full"],
    ["alamat lokal tanpa SSL tidak dipaksa", "postgres://u@localhost:5432/db", "postgres://u@localhost:5432/db"],
    ["disable dibiarkan, itu pilihan sadar", "postgres://u@h/db?sslmode=disable", "postgres://u@h/db?sslmode=disable"],
    ["parameter bernama mirip tidak tersentuh", "postgres://u@h/db?xsslmode=require", "postgres://u@h/db?xsslmode=require"],
  ];
  for (const [keterangan, masuk, harap] of contohSsl) {
    periksa(tegakkanSslPenuh(masuk) === harap, keterangan);
  }

  console.log(gagal === 0 ? "\nSemua pemeriksaan lulus." : `\n${gagal} pemeriksaan GAGAL.`);
  await prisma.$disconnect();
  process.exit(gagal === 0 ? 0 : 1);
}

main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
