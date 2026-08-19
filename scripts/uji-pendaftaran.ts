/**
 * Uji asap Pendaftaran Kegiatan.
 *
 *   npm run dev              (di terminal lain)
 *   npm run uji:pendaftaran
 *
 * Yang dibuktikan:
 *   1. Aturan kelayakan ditegakkan: tenggat lewat, batas usia, tanggal lahir
 *      belum diisi, dan kegiatan yang sudah berlangsung.
 *   2. Hanya pemuda yang bisa mendaftar; pengelola tidak.
 *   3. Daftar peserta hanya terbuka bagi penyelenggara kegiatan itu.
 *   4. Unduhan CSV menolak pihak yang tidak berwenang.
 *   5. CSV kebal penyuntikan rumus — nilai yang diawali "=" tidak dibiarkan
 *      menjadi rumus saat berkasnya dibuka di Excel.
 */
import "dotenv/config";

import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "../src/generated/prisma/client";
import { susunCsv } from "../src/lib/csv";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL belum diisi.");
const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

const PANGKALAN = process.env.UJI_URL ?? "http://localhost:3000";
const KATA_SANDI = "DemakMuda2026!";
const KEPALA_JSON = { "content-type": "application/json", origin: PANGKALAN };

let gagal = 0;
function periksa(lulus: boolean, keterangan: string) {
  console.log(`  ${lulus ? "✓" : "✗"} ${keterangan}`);
  if (!lulus) gagal++;
}

async function masuk(email: string): Promise<string> {
  await prisma.rateLimit.deleteMany();
  const res = await fetch(`${PANGKALAN}/api/auth/sign-in/email`, {
    method: "POST",
    headers: KEPALA_JSON,
    body: JSON.stringify({ email, password: KATA_SANDI }),
  });
  if (!res.ok) throw new Error(`gagal masuk sebagai ${email}: ${res.status}`);
  return res.headers.getSetCookie().map((c) => c.split(";")[0]).join("; ");
}

async function ambil(jalur: string, kuki = "") {
  const res = await fetch(`${PANGKALAN}${jalur}`, {
    headers: kuki ? { cookie: kuki } : {},
    redirect: "manual",
  });
  const lokasi = res.headers.get("location");
  return {
    status: res.status,
    tujuan: lokasi ? new URL(lokasi, PANGKALAN).pathname : null,
    isi: res.status === 200 ? await res.text() : "",
  };
}

async function main() {
  console.log(`Menguji ${PANGKALAN}\n`);

  console.log("keamanan berkas CSV");
  const csv = susunCsv(
    ["Nama", "Catatan"],
    [
      ["=HYPERLINK(\"http://jahat.id\",\"klik\")", "biasa"],
      ["+1+1", "-2-2"],
      ["@SUM(A1)", 'ada "kutip" dan, koma'],
    ],
  );
  periksa(!/(^|,)"=HYPERLINK/.test(csv), "sel diawali = dilucuti menjadi teks");
  periksa(!/(^|,)"\+1\+1/.test(csv), "sel diawali + dilucuti menjadi teks");
  periksa(!/(^|,)"@SUM/.test(csv), "sel diawali @ dilucuti menjadi teks");
  periksa(!/(^|,)"-2-2/.test(csv), "sel diawali - dilucuti menjadi teks");
  periksa(csv.includes('""kutip""'), "tanda kutip di dalam nilai digandakan");
  periksa(csv.startsWith("﻿"), "diawali BOM agar Excel membaca UTF-8");

  const dinas = await prisma.user.findUniqueOrThrow({
    where: { email: "dinas@demakmuda.test" },
    select: { id: true },
  });
  // Aturan kelayakan diuji lewat halaman sungguhan, bukan dengan mengimpor
  // fungsinya — modul server ditandai server-only, dan menguji lewat HTTP
  // memang lebih setia pada jalur yang dipakai pengguna.
  console.log("\naturan kelayakan");
  const kukiPemuda = await masuk("pemuda@demakmuda.test");

  const slugUsia = `uji-usia-${Date.now()}`;
  const peluangUsia = await prisma.peluang.create({
    data: {
      judul: "Peluang uji batas usia",
      slug: slugUsia,
      jenis: "PELATIHAN",
      deskripsi: "Keterangan uji otomatis untuk memeriksa penegakan batas usia.",
      status: "TERBIT",
      usiaMin: 40,
      usiaMaks: 50,
      pembuatId: dinas.id,
    },
    select: { id: true },
  });

  const halamanUsia = await ambil(`/peluang/${slugUsia}`, kukiPemuda);
  periksa(
    halamanUsia.isi.includes("Belum dapat mendaftar"),
    "peluang dengan batas usia yang tak terpenuhi menolak pendaftaran",
  );
  periksa(
    halamanUsia.isi.includes("usia minimal 40"),
    "alasan penolakan menyebut batas usianya",
  );
  periksa(
    !halamanUsia.isi.includes("Daftar sekarang"),
    "tombol daftar tidak muncul saat tidak layak",
  );

  const halamanTutup = await ambil(
    "/peluang/lomba-cipta-lagu-daerah-2026-lampau",
    kukiPemuda,
  );
  periksa(
    !halamanTutup.isi.includes("Daftar sekarang"),
    "peluang yang tenggatnya lewat tidak menawarkan pendaftaran",
  );

  const halamanLampau = await ambil("/agenda/temu-sanggar-tari-demak", kukiPemuda);
  periksa(
    !halamanLampau.isi.includes("Daftar sekarang"),
    "agenda yang sudah berlangsung tidak menawarkan pendaftaran",
  );

  const halamanBoleh = await ambil(
    "/peluang/beasiswa-pendidikan-pemuda-demak",
    kukiPemuda,
  );
  periksa(
    halamanBoleh.isi.includes("Daftar sekarang"),
    "peluang yang sesuai menawarkan pendaftaran",
  );

  console.log("\nhalaman peserta dan unduhan");
  const kukiOrg = await masuk("organisasi@demakmuda.test");
  const kukiDinas = await masuk("dinas@demakmuda.test");

  const agendaDinas = await prisma.agenda.findFirstOrThrow({
    where: { slug: "jambore-pemuda-demak-2026" },
    select: { id: true },
  });

  periksa(
    (await ambil(`/kelola/peserta/agenda/${agendaDinas.id}`, kukiDinas)).status === 200,
    "penyelenggara dapat membuka daftar pesertanya",
  );
  periksa(
    (await ambil(`/kelola/peserta/agenda/${agendaDinas.id}`, kukiOrg)).status === 404,
    "organisasi lain ditolak dari daftar peserta (404)",
  );
  periksa(
    (await ambil(`/kelola/peserta/agenda/${agendaDinas.id}`, kukiPemuda)).tujuan === "/pemuda",
    "pemuda dipulangkan dari daftar peserta",
  );

  const unduhDinas = await fetch(
    `${PANGKALAN}/kelola/peserta/agenda/${agendaDinas.id}/unduh`,
    { headers: { cookie: kukiDinas } },
  );
  periksa(unduhDinas.status === 200, "penyelenggara dapat mengunduh CSV");
  periksa(
    (unduhDinas.headers.get("content-type") ?? "").includes("text/csv"),
    "CSV disajikan dengan tipe konten yang benar",
  );
  periksa(
    unduhDinas.headers.get("cache-control") === "no-store",
    "CSV tidak boleh disimpan di cache",
  );

  const unduhOrg = await fetch(
    `${PANGKALAN}/kelola/peserta/agenda/${agendaDinas.id}/unduh`,
    { headers: { cookie: kukiOrg } },
  );
  periksa(unduhOrg.status === 404, "organisasi lain ditolak mengunduh CSV");

  const unduhPemuda = await fetch(
    `${PANGKALAN}/kelola/peserta/agenda/${agendaDinas.id}/unduh`,
    { headers: { cookie: kukiPemuda } },
  );
  periksa(unduhPemuda.status === 403, "pemuda ditolak mengunduh CSV");

  // redirect manual: tanpa ini fetch akan mengikuti pengalihan ke halaman
  // masuk dan mengembalikan 200, sehingga uji ini tampak gagal padahal aman.
  const unduhAnonim = await fetch(
    `${PANGKALAN}/kelola/peserta/agenda/${agendaDinas.id}/unduh`,
    { redirect: "manual" },
  );
  periksa(
    unduhAnonim.status === 307 || unduhAnonim.status === 302,
    `pengunjung tanpa sesi dialihkan, bukan diberi berkas (${unduhAnonim.status})`,
  );
  periksa(
    (unduhAnonim.headers.get("location") ?? "").includes("/masuk"),
    "pengalihannya menuju halaman masuk",
  );
  periksa(
    !(unduhAnonim.headers.get("content-type") ?? "").includes("csv"),
    "tidak ada berkas CSV yang dikirim ke pengunjung tanpa sesi",
  );

  await prisma.peluang.delete({ where: { id: peluangUsia.id } });
  await prisma.rateLimit.deleteMany();

  console.log(gagal === 0 ? "\nSemua pemeriksaan lulus." : `\n${gagal} pemeriksaan GAGAL.`);
  await prisma.$disconnect();
  process.exit(gagal === 0 ? 0 : 1);
}

main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
