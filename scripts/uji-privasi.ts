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

  console.log(gagal === 0 ? "\nSemua pemeriksaan lulus." : `\n${gagal} pemeriksaan GAGAL.`);
  await prisma.$disconnect();
  process.exit(gagal === 0 ? 0 : 1);
}

main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
