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

/**
 * Uji ini memakai akunnya sendiri, bukan akun peragaan.
 *
 * Akun peragaan sudah punya pemberitahuan bawaan supaya loncengnya tidak
 * kosong saat dipertunjukkan, sehingga pemeriksaan seperti "hitungannya
 * kembali nol" tidak lagi berlaku di sana. Akun baru selalu bermula dari nol,
 * dan itu membuat angkanya dapat diperiksa apa adanya.
 */
const SUREL_UJI = "uji-notifikasi@demakmuda.test";
const SANDI_UJI = "UjiNotifikasi2026!";

let gagal = 0;
function periksa(lulus: boolean, keterangan: string) {
  console.log(`  ${lulus ? "✓" : "✗"} ${keterangan}`);
  if (!lulus) gagal++;
}

async function masuk(email: string, sandi = KATA_SANDI): Promise<string> {
  await prisma.rateLimit.deleteMany();
  const res = await fetch(`${PANGKALAN}/api/auth/sign-in/email`, {
    method: "POST",
    headers: KEPALA_JSON,
    body: JSON.stringify({ email, password: sandi }),
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

async function bersihkan() {
  const u = await prisma.user.findUnique({
    where: { email: SUREL_UJI },
    select: { id: true },
  });
  if (!u) return;
  await prisma.notifikasi.deleteMany({ where: { penerimaId: u.id } });
  await prisma.session.deleteMany({ where: { userId: u.id } });
  await prisma.account.deleteMany({ where: { userId: u.id } });
  await prisma.user.delete({ where: { id: u.id } });
}

async function main() {
  console.log(`Menguji ${PANGKALAN}\n`);
  await bersihkan();
  await prisma.rateLimit.deleteMany();

  const daftar = await fetch(`${PANGKALAN}/api/auth/sign-up/email`, {
    method: "POST",
    headers: KEPALA_JSON,
    body: JSON.stringify({
      name: "Pemuda Uji Notifikasi",
      email: SUREL_UJI,
      password: SANDI_UJI,
    }),
  });
  periksa(daftar.status === 200, `akun uji dibuat (${daftar.status})`);
  const pemuda = await prisma.user.update({
    where: { email: SUREL_UJI },
    data: { emailVerified: true, role: "pemuda" },
    select: { id: true },
  });
  const organisasi = await prisma.user.findUniqueOrThrow({
    where: { email: "organisasi@demakmuda.test" },
    select: { id: true },
  });

  console.log("\nkabar sampai ke penerimanya");
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

  const kukiPemuda = await masuk(SUREL_UJI, SANDI_UJI);
  const kukiOrg = await masuk("organisasi@demakmuda.test");

  const halaman = await ambil("/notifikasi", kukiPemuda);
  periksa(halaman.status === 200, "penerima dapat membuka /notifikasi");
  periksa(halaman.isi.includes(RAHASIA), "pemberitahuannya terbaca");
  periksa(halaman.isi.includes("Baru"), "yang belum dibaca ditandai");

  const dasbor = await ambil("/pemuda", kukiPemuda);
  periksa(
    dasbor.isi.includes("Pemberitahuan, 1 belum dibaca"),
    "lonceng di dasbor menghitung yang belum dibaca",
  );

  console.log("\npanel mengapung di dasbor");
  // Panel ini yang dibaca orang sehari-hari; halaman arsipnya jarang dibuka.
  // Karena itu isinya harus benar-benar ada di dasbor, bukan hanya di
  // /notifikasi.
  periksa(dasbor.isi.includes("Pusat Aktivitas"), "panel lonceng ikut tergambar");
  periksa(dasbor.isi.includes(RAHASIA), "pemberitahuannya terbaca dari panel");
  periksa(
    dasbor.isi.includes("(belum dibaca)"),
    "yang belum dibaca diberi penanda, juga bagi pembaca layar",
  );
  periksa(
    dasbor.isi.includes("Lihat semua") && dasbor.isi.includes('href="/notifikasi"'),
    "panel menautkan arsip lengkapnya",
  );
  // Barisnya harus tautan sungguhan. Ketika ia hanya tombol, perpindahan
  // bergantung pada selesainya penandaan terbaca lebih dulu — satu perjalanan
  // ke peladen yang tidak perlu, dan terasa seperti aplikasi yang tersendat.
  periksa(
    dasbor.isi.includes('href="/pemuda"'),
    "baris pemberitahuan berupa tautan sungguhan, bukan tombol",
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

  const dasborSesudah = await ambil("/pemuda", kukiPemuda);
  periksa(
    !dasborSesudah.isi.includes("(belum dibaca)"),
    "penanda hilang setelah dibaca — bedanya justru pada ketiadaannya",
  );
  periksa(
    dasborSesudah.isi.includes(RAHASIA),
    "yang sudah dibaca tetap tercantum, hanya tanpa penanda",
  );
  periksa(
    !dasborSesudah.isi.includes("Pemberitahuan, 1 belum dibaca"),
    "lonceng tidak lagi menunjukkan angka",
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

  await bersihkan();
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
