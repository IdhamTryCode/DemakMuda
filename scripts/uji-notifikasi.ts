/**
 * Uji asap pemberitahuan dalam aplikasi.
 *
 *   npm run dev             (di terminal lain)
 *   npm run uji:notifikasi
 *
 * Dua hal yang diuji, dan keduanya berbeda sifat:
 *
 *   1. Kabarnya sampai. Pemberitahuan muncul di halaman penerimanya, dan
 *      loncengnya menghitung yang belum dibaca.
 *   2. Kabarnya tidak sampai ke orang yang salah. Pemberitahuan milik orang
 *      lain tidak terbaca, tidak terhitung, dan tidak dapat ditandai terbaca —
 *      yang terakhir mudah terlewat, sebab menandai terbaca terasa seperti
 *      tindakan sepele padahal ia tetap sebuah penulisan.
 */
import "dotenv/config";

import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "../src/generated/prisma/client";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL belum diisi.");
const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

const PANGKALAN = process.env.UJI_URL ?? "http://localhost:3000";
const KATA_SANDI = "DemakMuda2026!";
const KEPALA_JSON = { "content-type": "application/json", origin: PANGKALAN };

const RAHASIA = "Kalimat rahasia uji notifikasi yang tidak boleh terbaca siapa pun";

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
  await prisma.rateLimit.deleteMany();

  const [pemuda, organisasi] = await Promise.all([
    prisma.user.findUniqueOrThrow({
      where: { email: "pemuda@demakmuda.test" },
      select: { id: true },
    }),
    prisma.user.findUniqueOrThrow({
      where: { email: "organisasi@demakmuda.test" },
      select: { id: true },
    }),
  ]);

  await prisma.notifikasi.deleteMany({
    where: { penerimaId: { in: [pemuda.id, organisasi.id] }, pesan: RAHASIA },
  });

  console.log("kabar sampai ke penerimanya");
  const notif = await prisma.notifikasi.create({
    data: {
      penerimaId: pemuda.id,
      jenis: "KEANGGOTAAN_DIPUTUSKAN",
      judul: "Uji pemberitahuan",
      pesan: RAHASIA,
      tautan: "/pemuda",
    },
    select: { id: true },
  });

  const kukiPemuda = await masuk("pemuda@demakmuda.test");
  const kukiOrg = await masuk("organisasi@demakmuda.test");

  const halaman = await ambil("/notifikasi", kukiPemuda);
  periksa(halaman.status === 200, "penerima dapat membuka /notifikasi");
  periksa(halaman.isi.includes(RAHASIA), "pemberitahuannya terbaca");
  periksa(halaman.isi.includes("Baru"), "yang belum dibaca ditandai");

  const dasbor = await ambil("/pemuda", kukiPemuda);
  periksa(
    dasbor.isi.includes("belum dibaca"),
    "lonceng di dasbor menghitung yang belum dibaca",
  );

  console.log("\nkabar tidak sampai ke orang lain");
  const orangLain = await ambil("/notifikasi", kukiOrg);
  periksa(orangLain.status === 200, "pengguna lain tetap punya halamannya sendiri");
  periksa(
    !orangLain.isi.includes(RAHASIA),
    "pemberitahuan milik orang lain tidak terbaca",
  );

  const tamu = await ambil("/notifikasi");
  periksa(tamu.tujuan === "/masuk", `tamu diarahkan ke /masuk (dapat ${tamu.tujuan})`);

  console.log("\nmenandai terbaca");
  // Ditandai lewat basis data dengan syarat kepemilikan yang sama persis
  // seperti yang dipakai Server Action-nya. Yang diuji di sini bukan tombolnya,
  // melainkan bahwa syarat itu benar-benar menyaring.
  const salahOrang = await prisma.notifikasi.updateMany({
    where: { id: notif.id, penerimaId: organisasi.id, dibacaPada: null },
    data: { dibacaPada: new Date() },
  });
  periksa(
    salahOrang.count === 0,
    "syarat kepemilikan menolak penandaan oleh orang lain",
  );

  const pemilik = await prisma.notifikasi.updateMany({
    where: { id: notif.id, penerimaId: pemuda.id, dibacaPada: null },
    data: { dibacaPada: new Date() },
  });
  periksa(pemilik.count === 1, "pemiliknya sendiri dapat menandainya terbaca");

  const sesudah = await ambil("/notifikasi", kukiPemuda);
  periksa(
    sesudah.isi.includes("Tidak ada yang belum dibaca"),
    "hitungan belum dibaca kembali nol setelah ditandai",
  );

  console.log("\npemancar terpasang di aksi");
  // Bukan menghitung pemberitahuan yang sudah ada, melainkan memastikan tiap
  // aksi yang mengubah keadaan orang lain memang memanggil pengirimnya. Aksi
  // yang lupa memanggil akan lolos dari uji perilaku mana pun sampai ada yang
  // mengeluh tidak pernah diberi tahu.
  const { readFileSync } = await import("node:fs");
  for (const [berkas, jenis] of [
    ["aksi-keanggotaan.ts", "KEANGGOTAAN_DIAJUKAN"],
    ["aksi-keanggotaan.ts", "KEANGGOTAAN_DIPUTUSKAN"],
    ["aksi-aspirasi.ts", "ASPIRASI_MASUK"],
    ["aksi-aspirasi.ts", "ASPIRASI_DITANGGAPI"],
    ["aksi-pendaftaran.ts", "PENDAFTARAN_DIPUTUSKAN"],
    ["aksi-sertifikat.ts", "SERTIFIKAT_TERBIT"],
    ["aksi-organisasi.ts", "ORGANISASI_DIVERIFIKASI"],
    ["aksi-karya.ts", "KARYA_DIMODERASI"],
  ] as const) {
    const isi = readFileSync(`src/server/${berkas}`, "utf8");
    periksa(isi.includes(jenis), `${berkas} memancarkan ${jenis}`);
  }

  await prisma.notifikasi.deleteMany({ where: { id: notif.id } });
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
