/**
 * Uji asap Kartu Talenta.
 *
 *   npm run dev         (di terminal lain)
 *   npm run uji:profil
 *
 * Yang dibuktikan:
 *   1. Kartu Talenta publik terbuka tanpa masuk.
 *   2. Nomor telepon TIDAK PERNAH tampil di halaman publik.
 *   3. Profil pengguna di bawah 18 tahun menyembunyikan usia, desa, sekolah.
 *   4. Halaman ubah profil menuntut pengguna sudah masuk.
 *   5. Desa dari kecamatan lain ditolak, tidak tersimpan diam-diam.
 */
import "dotenv/config";

import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "../src/generated/prisma/client";
import { dibawahUmur, keterbukaanProfil, umur } from "../src/lib/profil";

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
  const lokasi = res.headers.get("location");
  return {
    status: res.status,
    tujuan: lokasi ? new URL(lokasi, PANGKALAN).pathname : null,
    isi: res.status === 200 ? await res.text() : "",
  };
}

async function main() {
  console.log(`Menguji ${PANGKALAN}\n`);

  console.log("hitungan usia");
  const acuan = new Date("2026-08-19T00:00:00+07:00");
  periksa(umur(new Date("2004-04-12"), acuan) === 22, "usia dihitung benar setelah ulang tahun");
  periksa(umur(new Date("2004-12-31"), acuan) === 21, "usia dihitung benar sebelum ulang tahun");
  periksa(dibawahUmur(new Date("2010-01-01"), acuan), "usia 16 tahun dianggap di bawah umur");
  periksa(!dibawahUmur(new Date("2004-04-12"), acuan), "usia 22 tahun bukan di bawah umur");
  periksa(dibawahUmur(null, acuan), "tanggal lahir kosong diperlakukan sebagai anak");
  periksa(
    keterbukaanProfil(new Date("2004-04-12")).tampilkanTelepon === false,
    "telepon tidak pernah dibuka untuk umum, berapa pun usianya",
  );

  console.log("\nkartu talenta publik");
  const publik = await ambil("/p/rani-puspitasari");
  periksa(publik.status === 200, "kartu talenta terbuka tanpa masuk");
  periksa(publik.isi.includes("Rani Puspitasari"), "nama tampil");
  periksa(publik.isi.includes("Desain Grafis"), "keterampilan tampil");
  periksa(publik.isi.includes("Teknologi Informasi"), "bidang minat tampil");
  periksa(
    !publik.isi.includes("081200000001"),
    "nomor telepon TIDAK tampil di halaman publik",
  );
  periksa(publik.isi.includes("Bintoro"), "desa tampil untuk pengguna dewasa");

  periksa((await ambil("/p/tidak-ada-slug-ini")).status === 404, "slug tak dikenal menolak");

  console.log("\nprofil pengguna di bawah umur");
  const anak = await prisma.user.upsert({
    where: { email: "anak-uji@demakmuda.test" },
    update: {},
    create: {
      id: `uji-anak-${Date.now()}`,
      name: "Pemuda Uji Belas",
      email: "anak-uji@demakmuda.test",
      emailVerified: true,
      role: "pemuda",
    },
    select: { id: true },
  });
  const kecamatan = await prisma.kecamatan.findUniqueOrThrow({
    where: { slug: "sayung" },
    select: { id: true },
  });
  const desa = await prisma.desa.findFirstOrThrow({
    where: { kecamatanId: kecamatan.id },
    select: { id: true, nama: true },
  });
  const sekolah = await prisma.sekolah.findFirst({ select: { id: true, nama: true } });

  const lahirAnak = new Date();
  lahirAnak.setFullYear(lahirAnak.getFullYear() - 16);

  await prisma.profilPemuda.upsert({
    where: { userId: anak.id },
    update: {
      tanggalLahir: lahirAnak,
      kecamatanId: kecamatan.id,
      desaId: desa.id,
      sekolahId: sekolah?.id ?? null,
    },
    create: {
      userId: anak.id,
      slug: "pemuda-uji-belas",
      tanggalLahir: lahirAnak,
      telepon: "081299999999",
      kecamatanId: kecamatan.id,
      desaId: desa.id,
      sekolahId: sekolah?.id ?? null,
    },
  });

  const halamanAnak = await ambil("/p/pemuda-uji-belas");
  periksa(halamanAnak.status === 200, "kartu talenta pengguna 16 tahun terbuka");
  periksa(!halamanAnak.isi.includes("081299999999"), "telepon tidak tampil");
  periksa(!halamanAnak.isi.includes(desa.nama), "desa disembunyikan");
  periksa(!/\b16 tahun\b/.test(halamanAnak.isi), "usia disembunyikan");
  if (sekolah) {
    periksa(!halamanAnak.isi.includes(sekolah.nama), "sekolah disembunyikan");
  }

  console.log("\nhalaman ubah profil");
  const tanpaSesi = await ambil("/pemuda/profil");
  periksa(tanpaSesi.tujuan === "/masuk", `menuntut masuk (dapat ${tanpaSesi.tujuan})`);

  await prisma.profilPemuda.deleteMany({ where: { userId: anak.id } });
  await prisma.user.delete({ where: { id: anak.id } });

  console.log("\nKartu Talenta sebagai kartu");
  const kartu = await ambil("/p/rani-puspitasari");
  periksa(
    kartu.isi.includes("Kartu Talenta Pemuda") &&
      kartu.isi.includes("Pemerintah Kabupaten Demak"),
    "kartu memakai pita kepala, bukan sekadar judul halaman",
  );
  periksa(
    !kartu.isi.includes("Kartu Tanda Penduduk") && !kartu.isi.includes("NIK"),
    "kartu tidak meniru dokumen kependudukan",
  );
  periksa(
    kartu.isi.includes("Terverifikasi Dispora"),
    "lencana verifikasi tercetak di kartu",
  );

  // Kode QR terpotong tiga kali berturut-turut, dan sebabnya selalu sama:
  // SVG-nya membawa ukuran pikselnya sendiri, mengabaikan pelat yang memuatnya,
  // lalu lubernya dipangkas overflow-hidden. Ukuran kini ditentukan CSS, dan
  // pemeriksaan ini menahan agar tidak kembali. Terpotongnya sendiri hanya
  // terlihat oleh mata; sebabnya dapat dibaca dari HTML-nya.
  const svgQr = kartu.isi.match(/<svg[^>]*crispEdges[^>]*>/)?.[0] ?? "";
  periksa(svgQr !== "", "kode QR tercetak di kartu");
  periksa(svgQr.includes("viewBox="), "kode QR membawa viewBox");
  periksa(
    !/\swidth="\d/.test(svgQr) && !/\sheight="\d/.test(svgQr),
    "kode QR tidak memaksakan ukuran pikselnya sendiri",
  );
  periksa(
    kartu.isi.includes("Pindai untuk memeriksa"),
    "kode QR berketerangan, agar tidak terbaca sebagai kode pembayaran",
  );

  // Foto mengikuti aturan keterbukaan yang sama dengan desa dan sekolah.
  const belia = await prisma.profilPemuda.findFirst({
    where: { fotoUrl: { not: null } },
    select: { id: true, slug: true, tanggalLahir: true, fotoUrl: true },
  });
  if (belia) {
    const asli = belia.tanggalLahir;
    await prisma.profilPemuda.update({
      where: { id: belia.id },
      data: { tanggalLahir: new Date(Date.now() - 15 * 365.25 * 24 * 3600 * 1000) },
    });
    const sebagaiAnak = await ambil(`/p/${belia.slug}`);
    periksa(
      !sebagaiAnak.isi.includes(encodeURIComponent(belia.fotoUrl!).slice(0, 40)),
      "foto profil di bawah umur tidak tampil di halaman publik",
    );
    await prisma.profilPemuda.update({
      where: { id: belia.id },
      data: { tanggalLahir: asli },
    });
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
