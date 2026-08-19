/**
 * Uji asap pencarian, halaman kesalahan, dan keadaan memuat.
 *
 *   npm run dev             (di terminal lain)
 *   npm run uji:pencarian
 *
 * Penekanannya pada pencarian: penyaring yang tampak bekerja padahal tidak
 * adalah bug yang mudah lolos, karena halamannya tetap menampilkan sesuatu.
 * Karena itu tiap pemeriksaan menuntut dua hal sekaligus — yang cocok muncul,
 * dan yang tidak cocok benar-benar hilang.
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
  const res = await fetch(`${PANGKALAN}${jalur}`);
  return { status: res.status, isi: res.status === 200 ? await res.text() : "" };
}

const KABAR_MANGROVE = "Karang taruna se-Kecamatan Sayung tanam seribu mangrove";
const KABAR_JAMBORE = "Jambore Pemuda Kabupaten Demak 2026 resmi dibuka";
const PELUANG_LOMBA = "Lomba Teknologi Piranti Lunak Jambore Pemuda 2026";
const PELUANG_BEASISWA = "Beasiswa pendidikan bagi pemuda berprestasi Demak";

async function main() {
  console.log(`Menguji ${PANGKALAN}\n`);

  console.log("pencarian kabar");
  const semua = await ambil("/kabar");
  periksa(semua.isi.includes(KABAR_MANGROVE), "tanpa pencarian, semua kabar tampil");

  const cariMangrove = await ambil("/kabar?cari=mangrove");
  periksa(cariMangrove.isi.includes(KABAR_MANGROVE), "kata dari judul menemukan kabarnya");
  periksa(
    !cariMangrove.isi.includes(KABAR_JAMBORE),
    "kabar yang tidak cocok benar-benar tersaring keluar",
  );

  periksa(
    (await ambil("/kabar?cari=MANGROVE")).isi.includes(KABAR_MANGROVE),
    "pencarian tidak membedakan huruf besar-kecil",
  );

  // Kata "abrasi" hanya ada di isi kabar, tidak di judul maupun ringkasan.
  periksa(
    (await ambil("/kabar?cari=abrasi")).isi.includes(KABAR_MANGROVE),
    "kata yang hanya ada di isi kabar tetap ditemukan",
  );

  const kosong = await ambil("/kabar?cari=zxqwerty");
  periksa(kosong.status === 200, "pencarian tanpa hasil tetap membalas 200");
  periksa(
    kosong.isi.includes("Tidak ada kabar yang memuat"),
    "pencarian tanpa hasil menjelaskan keadaannya",
  );

  console.log("\npencarian peluang");
  const cariBeasiswa = await ambil("/peluang?cari=beasiswa");
  periksa(cariBeasiswa.isi.includes(PELUANG_BEASISWA), "kata kunci menemukan peluangnya");
  periksa(
    !cariBeasiswa.isi.includes(PELUANG_LOMBA),
    "peluang yang tidak cocok tersaring keluar",
  );

  console.log("\npencarian digabung dengan saringan lain");
  // "pemuda" muncul pada beasiswa maupun lomba; jenis menyaringnya lebih jauh.
  const gabung = await ambil("/peluang?cari=pemuda&jenis=BEASISWA");
  periksa(gabung.isi.includes(PELUANG_BEASISWA), "gabungan pencarian dan jenis menemukan");
  periksa(
    !gabung.isi.includes(PELUANG_LOMBA),
    "jenis tetap menyaring meski sedang mencari",
  );
  periksa(
    gabung.isi.includes('name="cari"') && gabung.isi.includes('value="pemuda"'),
    "kata pencarian tidak hilang dari formulir saat saringan lain dipakai",
  );

  const takCocok = await ambil("/peluang?cari=beasiswa&jenis=MAGANG");
  periksa(
    takCocok.isi.includes("Tidak ada peluang yang memuat"),
    "gabungan yang tidak menyisakan apa pun dijelaskan",
  );

  console.log("\npencarian tidak dapat dipakai menyusup");
  const nakal = await ambil(`/kabar?cari=${encodeURIComponent("' OR 1=1 --")}`);
  periksa(nakal.status === 200, "masukan menyerupai SQL tidak menggagalkan halaman");
  periksa(
    !nakal.isi.includes(KABAR_MANGROVE),
    "masukan menyerupai SQL tidak mengembalikan seluruh isi",
  );

  const skrip = await ambil(`/kabar?cari=${encodeURIComponent("<script>alert(1)</script>")}`);
  periksa(
    !/<script>alert\(1\)<\/script>/.test(skrip.isi),
    "kata pencarian tidak menjadi markup aktif saat ditampilkan kembali",
  );

  console.log("\nstatus HTTP halaman rinci");
  // Keadaan memuat (loading.tsx) membuka batas Suspense, dan tanggapan yang
  // sudah mulai mengalir tidak dapat lagi mengubah statusnya menjadi 404.
  // Karena itu keadaan memuat dibatasi pada halaman daftar lewat grup rute.
  // Uji ini menjaga pembatasan itu tidak hilang tanpa sengaja.
  for (const jalur of [
    "/kabar/slug-yang-tidak-ada",
    "/agenda/slug-yang-tidak-ada",
    "/peluang/slug-yang-tidak-ada",
    "/direktori/slug-yang-tidak-ada",
    "/p/slug-yang-tidak-ada",
  ]) {
    const s = (await fetch(`${PANGKALAN}${jalur}`)).status;
    periksa(s === 404, `${jalur} membalas 404, bukan ${s}`);
  }

  for (const jalur of ["/kabar", "/agenda", "/peluang", "/direktori"]) {
    const s = (await fetch(`${PANGKALAN}${jalur}`)).status;
    periksa(s === 200, `${jalur} tetap membalas 200`);
  }

  console.log("\nhalaman pendukung");
  periksa((await fetch(`${PANGKALAN}/alamat-ngawur-123`)).status === 404, "404 masih bekerja");

  const berkasAda = await prisma.berita.count();
  periksa(berkasAda > 0, `basis data terisi untuk pengujian (${berkasAda} kabar)`);

  console.log(gagal === 0 ? "\nSemua pemeriksaan lulus." : `\n${gagal} pemeriksaan GAGAL.`);
  await prisma.$disconnect();
  process.exit(gagal === 0 ? 0 : 1);
}

main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
