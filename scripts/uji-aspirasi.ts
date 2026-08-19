/**
 * Uji asap Ruang Aspirasi.
 *
 *   npm run dev           (di terminal lain)
 *   npm run uji:aspirasi
 *
 * Aspirasi adalah satu-satunya kanal yang isinya TIDAK PERNAH publik, jadi
 * penekanan uji ini berbeda dari kanal lain. Yang dibuktikan:
 *   1. Isi aspirasi tidak muncul di satu pun halaman yang dapat dibuka tamu.
 *   2. Pengirim hanya melihat aspirasinya sendiri.
 *   3. Peran organisasi tidak dapat membaca aspirasi sama sekali — bukan
 *      sekadar tautannya disembunyikan dari menu.
 *   4. Dinas melihat seluruh aspirasi dan dapat menanggapinya.
 *   5. Saringan status benar-benar menyaring.
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

const SUREL_LAIN = "uji-aspirasi-lain@demakmuda.test";
const SANDI_LAIN = "UjiAspirasi2026!";

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
    where: { email: SUREL_LAIN },
    select: { id: true },
  });
  if (!u) return;
  await prisma.aspirasi.deleteMany({ where: { pengirimId: u.id } });
  await prisma.karya.deleteMany({ where: { pemilikId: u.id } });
  await prisma.session.deleteMany({ where: { userId: u.id } });
  await prisma.account.deleteMany({ where: { userId: u.id } });
  await prisma.user.delete({ where: { id: u.id } });
}

const JUDUL_BARU = "Lapangan futsal desa perlu penerangan";
const JUDUL_SELESAI = "Data organisasi kepemudaan desa sulit dicari";
/** Kalimat yang hanya ada di dalam isi aspirasi, tidak di judulnya. */
const KALIMAT_RAHASIA = "Kami dari karang taruna siap ikut menjaga";

async function main() {
  console.log(`Menguji ${PANGKALAN}\n`);
  await bersihkan();
  await prisma.rateLimit.deleteMany();

  console.log("tidak bocor ke halaman publik");
  for (const jalur of [
    "/",
    "/kabar",
    "/agenda",
    "/peluang",
    "/karya",
    "/direktori",
    "/kabar?cari=lapangan",
    "/peluang?cari=lapangan",
    "/karya?cari=lapangan",
  ]) {
    const h = await ambil(jalur);
    const bocor =
      h.isi.includes(KALIMAT_RAHASIA) || h.isi.includes(JUDUL_BARU);
    periksa(!bocor, `${jalur} tidak memuat isi aspirasi`);
  }

  console.log("\ntamu");
  for (const jalur of ["/pemuda/aspirasi", "/pemuda/aspirasi/baru", "/kelola/aspirasi"]) {
    const h = await ambil(jalur);
    periksa(h.tujuan === "/masuk", `${jalur} mengarahkan tamu ke /masuk (dapat ${h.tujuan})`);
  }

  console.log("\npengirim");
  const kukiPemuda = await masuk("pemuda@demakmuda.test");
  const milikku = await ambil("/pemuda/aspirasi", kukiPemuda);
  periksa(milikku.status === 200, "pengirim dapat membuka /pemuda/aspirasi");
  periksa(milikku.isi.includes(JUDUL_BARU), "aspirasinya sendiri tampil");
  periksa(
    milikku.isi.includes("Direktori organisasi kepemudaan kini tersedia"),
    "tanggapan dinas terbaca oleh pengirimnya",
  );
  periksa(
    (await ambil("/pemuda/aspirasi/baru", kukiPemuda)).status === 200,
    "formulir kirim aspirasi terbuka",
  );

  const dasbor = await ambil("/pemuda", kukiPemuda);
  periksa(
    dasbor.isi.includes("Ruang Aspirasi") && dasbor.isi.includes("Ruang Karya"),
    "dasbor pemuda memuat pintu masuk kedua kanal baru",
  );

  console.log("\npengirim lain");
  const daftar = await fetch(`${PANGKALAN}/api/auth/sign-up/email`, {
    method: "POST",
    headers: KEPALA_JSON,
    body: JSON.stringify({
      name: "Pemuda Uji Aspirasi",
      email: SUREL_LAIN,
      password: SANDI_LAIN,
    }),
  });
  periksa(daftar.status === 200, `akun pemuda kedua dibuat (${daftar.status})`);
  await prisma.user.update({
    where: { email: SUREL_LAIN },
    data: { emailVerified: true, role: "pemuda" },
  });

  const kukiLain = await masuk(SUREL_LAIN, SANDI_LAIN);
  const daftarLain = await ambil("/pemuda/aspirasi", kukiLain);
  periksa(daftarLain.status === 200, "akun kedua dapat membuka halamannya sendiri");
  periksa(
    !daftarLain.isi.includes(KALIMAT_RAHASIA),
    "tidak melihat isi aspirasi milik akun lain",
  );

  const punyaOrangLain = await prisma.aspirasi.findUniqueOrThrow({
    where: { id: "aspirasi-demo-1" },
    select: { id: true },
  });
  const intip = await ambil(`/kelola/aspirasi/${punyaOrangLain.id}`, kukiLain);
  periksa(
    intip.tujuan === "/pemuda",
    `pemuda ditolak dari halaman tanggapan dinas (dapat ${intip.tujuan ?? intip.status})`,
  );

  console.log("\norganisasi");
  const kukiOrg = await masuk("organisasi@demakmuda.test");
  const orgDaftar = await ambil("/kelola/aspirasi", kukiOrg);
  periksa(
    orgDaftar.tujuan === "/organisasi",
    `organisasi dipulangkan dari /kelola/aspirasi (dapat ${orgDaftar.tujuan ?? orgDaftar.status})`,
  );
  const orgRinci = await ambil(`/kelola/aspirasi/${punyaOrangLain.id}`, kukiOrg);
  periksa(
    orgRinci.tujuan === "/organisasi",
    `organisasi dipulangkan dari halaman rinci aspirasi (dapat ${orgRinci.tujuan ?? orgRinci.status})`,
  );
  const orgKabar = await ambil("/kelola/kabar", kukiOrg);
  periksa(
    orgKabar.status === 200 && !orgKabar.isi.includes("/kelola/aspirasi"),
    "menu Aspirasi tidak ditawarkan kepada organisasi",
  );

  console.log("\ndinas");
  const kukiDinas = await masuk("dinas@demakmuda.test");
  const dinasDaftar = await ambil("/kelola/aspirasi", kukiDinas);
  periksa(dinasDaftar.status === 200, "dinas dapat membuka /kelola/aspirasi");
  periksa(dinasDaftar.isi.includes(JUDUL_BARU), "aspirasi baru tampil di daftar dinas");
  periksa(
    dinasDaftar.isi.includes(JUDUL_SELESAI),
    "aspirasi yang sudah selesai tetap tercatat",
  );
  periksa(
    dinasDaftar.isi.includes("/kelola/aspirasi"),
    "menu Aspirasi ditawarkan kepada dinas",
  );

  const dinasRinci = await ambil(`/kelola/aspirasi/${punyaOrangLain.id}`, kukiDinas);
  periksa(dinasRinci.status === 200, "halaman tanggapan terbuka bagi dinas");
  periksa(
    dinasRinci.isi.includes(KALIMAT_RAHASIA),
    "isi lengkap aspirasi terbaca oleh dinas",
  );
  periksa(
    (await ambil("/kelola/aspirasi/id-yang-tidak-ada", kukiDinas)).status === 404,
    "id yang tidak ada membalas 404",
  );

  console.log("\nsaringan status");
  const saringBaru = await ambil("/kelola/aspirasi?status=BARU", kukiDinas);
  periksa(saringBaru.isi.includes(JUDUL_BARU), "saringan BARU menampilkan yang baru");
  periksa(
    !saringBaru.isi.includes(JUDUL_SELESAI),
    "saringan BARU benar-benar membuang status lain",
  );
  const saringNgawur = await ambil("/kelola/aspirasi?status=NGAWUR", kukiDinas);
  periksa(
    saringNgawur.status === 200 && saringNgawur.isi.includes(JUDUL_BARU),
    "nilai status ngawur diabaikan, bukan menggagalkan halaman",
  );

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
