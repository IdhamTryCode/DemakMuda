/**
 * Uji asap Rekam Prestasi.
 *
 *   npm run dev            (di terminal lain)
 *   npm run uji:sertifikat
 *
 * Yang dibuktikan:
 *   1. Kode sertifikat tidak memuat huruf yang mudah tertukar, dan kesalahan
 *      penulisan yang wajar tetap ditemukan.
 *   2. Halaman pemeriksaan terbuka untuk umum dan menjawab jujur untuk kode
 *      yang tidak terdaftar.
 *   3. Sertifikat yang dibatalkan tetap dapat diperiksa, tetapi hasilnya
 *      menyatakan dibatalkan — bukan hilang seolah tidak pernah ada.
 *   4. Sertifikat yang dibatalkan tidak lagi tampil di Kartu Talenta publik.
 */
import "dotenv/config";

import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "../src/generated/prisma/client";
import { buatKodeSertifikat, rapikanKode } from "../src/lib/kode-sertifikat";

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

async function main() {
  console.log(`Menguji ${PANGKALAN}\n`);

  console.log("kode sertifikat");
  const contoh = Array.from({ length: 200 }, () => buatKodeSertifikat());
  periksa(
    contoh.every((k) => /^DM-[A-Z2-9]{4}-[A-Z2-9]{4}$/.test(k)),
    "bentuk kode selalu DM-XXXX-XXXX",
  );
  periksa(
    contoh.every((k) => !/[01OIL]/.test(k.replace(/^DM-/, ""))),
    "huruf yang mudah tertukar (0 O 1 I L) tidak dipakai",
  );
  periksa(new Set(contoh).size === contoh.length, "200 kode berturut-turut tidak kembar");

  const asli = "DM-ABCD-2345";
  periksa(rapikanKode("dm-abcd-2345") === asli, "huruf kecil tetap dikenali");
  periksa(rapikanKode("DMABCD2345") === asli, "tanpa tanda hubung tetap dikenali");
  periksa(rapikanKode("  dm abcd 2345 ") === asli, "spasi berlebih tetap dikenali");

  console.log("\nhalaman pemeriksaan");
  periksa((await ambil("/cek")).status === 200, "halaman periksa terbuka tanpa masuk");

  const takAda = await ambil("/cek/DM-ZZZZ-9999");
  periksa(takAda.status === 200, "kode tak terdaftar dijawab, bukan 404");
  periksa(
    takAda.isi.includes("Tidak ada sertifikat dengan kode ini"),
    "jawabannya menyatakan kode tidak terdaftar",
  );

  // Terbitkan sertifikat langsung di basis data untuk menguji halaman publiknya.
  const dinas = await prisma.user.findUniqueOrThrow({
    where: { email: "dinas@demakmuda.test" },
    select: { id: true },
  });
  const pemuda = await prisma.user.findUniqueOrThrow({
    where: { email: "pemuda@demakmuda.test" },
    select: { id: true },
  });

  const kode = buatKodeSertifikat();
  const sertifikat = await prisma.sertifikat.create({
    data: {
      kode,
      judul: "Peserta Uji Rekam Prestasi",
      peringkat: "Juara 1",
      penerimaId: pemuda.id,
      penerbitId: dinas.id,
    },
    select: { id: true },
  });

  const sah = await ambil(`/cek/${kode}`);
  periksa(sah.status === 200, "sertifikat sah dapat diperiksa");
  periksa(sah.isi.includes("Sertifikat sah"), "hasilnya menyatakan sah");
  periksa(sah.isi.includes("Rani Puspitasari"), "nama penerima tampil");
  periksa(sah.isi.includes("Juara 1"), "peringkat tampil");
  periksa(sah.isi.includes("<svg"), "kode QR ikut dibangkitkan");

  periksa(
    (await ambil(`/cek/${kode.toLowerCase().replace(/-/g, "")}`)).isi.includes("Sertifikat sah"),
    "kode yang ditulis tanpa hubung dan huruf kecil tetap ditemukan",
  );

  const kartu = await ambil("/p/rani-puspitasari");
  periksa(
    kartu.isi.includes("Peserta Uji Rekam Prestasi"),
    "sertifikat tampil di Kartu Talenta publik",
  );

  console.log("\nsertifikat dibatalkan");
  await prisma.sertifikat.update({
    where: { id: sertifikat.id },
    data: { dibatalkanPada: new Date(), alasanPembatalan: "Uji otomatis" },
  });

  const batal = await ambil(`/cek/${kode}`);
  periksa(batal.status === 200, "sertifikat batal tetap dapat diperiksa");
  periksa(batal.isi.includes("Dibatalkan"), "hasilnya menyatakan dibatalkan");
  periksa(batal.isi.includes("Uji otomatis"), "alasan pembatalan tampil");
  periksa(
    !batal.isi.includes("Sertifikat sah"),
    "tidak lagi dinyatakan sah",
  );

  const kartuSetelah = await ambil("/p/rani-puspitasari");
  periksa(
    !kartuSetelah.isi.includes("Peserta Uji Rekam Prestasi"),
    "sertifikat batal tidak lagi tampil di Kartu Talenta",
  );

  await prisma.sertifikat.delete({ where: { id: sertifikat.id } });

  console.log(gagal === 0 ? "\nSemua pemeriksaan lulus." : `\n${gagal} pemeriksaan GAGAL.`);
  await prisma.$disconnect();
  process.exit(gagal === 0 ? 0 : 1);
}

main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
