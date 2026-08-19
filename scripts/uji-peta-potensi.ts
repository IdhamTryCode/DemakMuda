/**
 * Uji asap Peta Potensi Pemuda.
 *
 *   npm run dev          (di terminal lain)
 *   npm run uji:peta
 *
 * Yang dibuktikan:
 *   1. Hanya dinas dan superadmin yang boleh membukanya — dasbor ini memuat
 *      ringkasan seluruh pemuda, jadi salah izin di sini berarti kebocoran.
 *   2. Angkanya benar-benar dihitung dari basis data, bukan tetap.
 *   3. Kecamatan yang belum terjangkau ikut ditampilkan, bukan disembunyikan
 *      karena nilainya nol.
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

/** Teks tampak, tanpa penanda komentar yang disisipkan React di antara nilai. */
function teksTampak(html: string): string {
  return html.replace(/<!--[\s\S]*?-->/g, "").replace(/<[^>]+>/g, " ");
}

async function main() {
  console.log(`Menguji ${PANGKALAN}\n`);

  console.log("penjagaan akses");
  periksa((await ambil("/dinas")).tujuan === "/masuk", "tanpa sesi dialihkan ke halaman masuk");

  const kukiPemuda = await masuk("pemuda@demakmuda.test");
  periksa(
    (await ambil("/dinas", kukiPemuda)).tujuan === "/pemuda",
    "pemuda dipulangkan ke dasbornya sendiri",
  );

  const kukiOrg = await masuk("organisasi@demakmuda.test");
  periksa(
    (await ambil("/dinas", kukiOrg)).tujuan === "/organisasi",
    "pengelola organisasi dipulangkan ke dasbornya sendiri",
  );

  const kukiDinas = await masuk("dinas@demakmuda.test");
  const halaman = await ambil("/dinas", kukiDinas);
  periksa(halaman.status === 200, "dinas dapat membuka Peta Potensi");

  // Matriks peran memberi superadmin hak lihatPetaPotensi, jadi ia memang boleh
  // membukanya — bukan dialihkan ke dasbornya sendiri.
  const kukiAdmin = await masuk("admin@demakmuda.test");
  periksa(
    (await ambil("/dinas", kukiAdmin)).status === 200,
    "superadmin juga dapat membuka Peta Potensi",
  );

  console.log("\nangka dihitung dari basis data");
  const teks = teksTampak(halaman.isi);

  const jumlahPemuda = await prisma.user.count({ where: { role: "pemuda" } });
  const jumlahKecamatan = await prisma.kecamatan.count();
  const terjangkau = (
    await prisma.profilPemuda.groupBy({ by: ["kecamatanId"], _count: { _all: true } })
  ).filter((s) => s.kecamatanId !== null).length;

  periksa(
    new RegExp(`\\b${jumlahPemuda}\\b`).test(teks),
    `jumlah pemuda terdaftar tampil (${jumlahPemuda})`,
  );
  periksa(
    teks.includes(`${terjangkau}/${jumlahKecamatan}`),
    `jangkauan kecamatan tampil (${terjangkau}/${jumlahKecamatan})`,
  );

  const kosong = await prisma.kecamatan.findMany({
    where: { profil: { none: {} } },
    select: { nama: true },
  });
  periksa(kosong.length > 0, `ada kecamatan tanpa pemuda untuk diuji (${kosong.length})`);
  for (const k of kosong.slice(0, 3)) {
    periksa(
      teks.includes(k.nama),
      `kecamatan tanpa pemuda tetap ditampilkan: ${k.nama}`,
    );
  }

  periksa(
    teks.includes("Kecamatan yang belum terjangkau"),
    "panel wilayah belum terjangkau muncul",
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
