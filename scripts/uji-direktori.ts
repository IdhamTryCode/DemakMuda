/**
 * Uji asap Direktori Organisasi.
 *
 *   npm run dev           (di terminal lain)
 *   npm run uji:direktori
 *
 * Yang dibuktikan:
 *   1. Hanya organisasi terverifikasi yang tampil di direktori publik.
 *   2. Organisasi yang menunggu verifikasi tidak bocor, termasuk halaman
 *      rincinya.
 *   3. Penyaringan kecamatan dan jenis benar-benar menyaring.
 *   4. Pengelola hanya melihat dan menyunting organisasinya sendiri; dinas
 *      melihat seluruhnya karena ia yang memverifikasi.
 *   5. Daftar anggota organisasi orang lain ditolak.
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

const TERVERIFIKASI = "Karang Taruna Bintoro";
const MENUNGGU = "Forum Pemuda Wedung";
const DI_SAYUNG = "Komunitas Mangrove Sayung";

async function main() {
  console.log(`Menguji ${PANGKALAN}\n`);

  console.log("direktori publik");
  const publik = await ambil("/direktori");
  periksa(publik.status === 200, "direktori terbuka tanpa masuk");
  periksa(publik.isi.includes(TERVERIFIKASI), "organisasi terverifikasi tampil");
  periksa(
    !publik.isi.includes(MENUNGGU),
    "organisasi yang menunggu verifikasi TIDAK tampil",
  );

  periksa(
    (await ambil("/direktori/forum-pemuda-wedung")).status === 404,
    "halaman rinci organisasi belum terverifikasi menolak (404)",
  );

  const rinci = await ambil("/direktori/karang-taruna-bintoro");
  periksa(rinci.status === 200, "halaman rinci organisasi terverifikasi terbuka");
  periksa(rinci.isi.includes("Bintoro"), "lokasi tampil di rincian");

  const sayung = await prisma.kecamatan.findFirstOrThrow({
    where: { slug: "sayung" },
    select: { id: true },
  });
  const disaring = await ambil(`/direktori?kecamatan=${sayung.id}`);
  periksa(disaring.isi.includes(DI_SAYUNG), "saringan kecamatan menampilkan yang cocok");
  periksa(
    !disaring.isi.includes(TERVERIFIKASI),
    "saringan kecamatan menyingkirkan kecamatan lain",
  );

  const perJenis = await ambil("/direktori?jenis=SANGGAR");
  periksa(
    perJenis.isi.includes("Sanggar Tari Nusa Bintoro"),
    "saringan jenis SANGGAR menampilkan sanggar",
  );
  periksa(
    !perJenis.isi.includes(TERVERIFIKASI),
    "saringan jenis menyingkirkan jenis lain",
  );
  periksa(
    (await ambil("/direktori?jenis=NGAWUR")).status === 200,
    "jenis karangan diabaikan, bukan menggagalkan halaman",
  );

  console.log("\npengelolaan");
  const kukiOrg = await masuk("organisasi@demakmuda.test");
  const kukiDinas = await masuk("dinas@demakmuda.test");
  const kukiPemuda = await masuk("pemuda@demakmuda.test");

  periksa(
    (await ambil("/kelola/organisasi", kukiPemuda)).tujuan === "/pemuda",
    "pemuda ditolak dari pengelolaan organisasi",
  );

  const daftarOrg = await ambil("/kelola/organisasi", kukiOrg);
  periksa(daftarOrg.status === 200, "pengelola dapat membuka daftar organisasinya");
  periksa(
    !daftarOrg.isi.includes("Sanggar Tari Nusa Bintoro"),
    "pengelola tidak melihat organisasi milik dinas",
  );

  const daftarDinas = await ambil("/kelola/organisasi", kukiDinas);
  periksa(
    daftarDinas.isi.includes(MENUNGGU),
    "dinas melihat organisasi yang menunggu verifikasi",
  );

  const punyaDinas = await prisma.organisasi.findFirstOrThrow({
    where: { slug: "sanggar-tari-nusa-bintoro" },
    select: { id: true },
  });
  periksa(
    (await ambil(`/kelola/organisasi/${punyaDinas.id}`, kukiOrg)).status === 404,
    "pengelola tidak bisa menyunting organisasi milik dinas",
  );
  periksa(
    (await ambil(`/kelola/organisasi/${punyaDinas.id}/anggota`, kukiOrg)).status === 404,
    "pengelola tidak bisa melihat anggota organisasi milik dinas",
  );

  const punyaOrg = await prisma.organisasi.findFirstOrThrow({
    where: { slug: "karang-taruna-bintoro" },
    select: { id: true },
  });
  periksa(
    (await ambil(`/kelola/organisasi/${punyaOrg.id}/anggota`, kukiOrg)).status === 200,
    "pengelola dapat melihat anggota organisasinya sendiri",
  );

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
