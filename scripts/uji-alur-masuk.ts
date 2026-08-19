/**
 * Uji asap alur masuk dan pengarahan peran.
 *
 *   npm run dev          (di terminal lain)
 *   npm run uji:masuk
 *
 * Memeriksa tiga hal untuk tiap peran:
 *   1. Akun dapat masuk dengan kata sandi yang benar.
 *   2. /tujuan mengantar ke dasbor yang sesuai perannya.
 *   3. Dasbor milik peran lain menolak dan memulangkan ke dasbor sendiri.
 *
 * Nomor 3 adalah yang terpenting: ia membuktikan penjagaan dilakukan di sisi
 * server, bukan sekadar menyembunyikan tautan di layar.
 */
import "dotenv/config";

import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "../src/generated/prisma/client";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL belum diisi.");
const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

/**
 * Pembatasan laju membatasi percobaan masuk sampai lima kali per menit, sedangkan
 * uji ini perlu masuk berkali-kali. Penghitungnya dinolkan di antara tahap agar
 * yang diuji tetap alur perannya. Pembatasan lajunya sendiri diuji terpisah di akhir.
 */
async function nolkanPembatasLaju() {
  await prisma.rateLimit.deleteMany();
}

const PANGKALAN = process.env.UJI_URL ?? "http://localhost:3000";
const KATA_SANDI = "DemakMuda2026!";

/**
 * Header Origin wajib ada. Better Auth menolak permintaan tanpa Origin sebagai
 * perlindungan lintas situs — peramban selalu mengirimnya, skrip tidak.
 * Menghapus baris ini akan membuat seluruh uji gagal dengan 403.
 */
const KEPALA_JSON = {
  "content-type": "application/json",
  origin: PANGKALAN,
};

const KASUS = [
  { peran: "pemuda", email: "pemuda@demakmuda.test", dasbor: "/pemuda" },
  { peran: "organisasi", email: "organisasi@demakmuda.test", dasbor: "/organisasi" },
  { peran: "dinas", email: "dinas@demakmuda.test", dasbor: "/dinas" },
  { peran: "superadmin", email: "admin@demakmuda.test", dasbor: "/admin" },
];

let gagal = 0;

function periksa(lulus: boolean, keterangan: string) {
  console.log(`  ${lulus ? "✓" : "✗"} ${keterangan}`);
  if (!lulus) gagal++;
}

async function masuk(email: string): Promise<string | null> {
  const res = await fetch(`${PANGKALAN}/api/auth/sign-in/email`, {
    method: "POST",
    headers: KEPALA_JSON,
    body: JSON.stringify({ email, password: KATA_SANDI }),
  });
  if (!res.ok) return null;

  const kuki = res.headers
    .getSetCookie()
    .map((c) => c.split(";")[0])
    .join("; ");
  return kuki || null;
}

async function lokasiSetelah(jalur: string, kuki: string): Promise<string | null> {
  const res = await fetch(`${PANGKALAN}${jalur}`, {
    headers: { cookie: kuki },
    redirect: "manual",
  });
  const lokasi = res.headers.get("location");
  return lokasi ? new URL(lokasi, PANGKALAN).pathname : null;
}

async function main() {
  console.log(`Menguji ${PANGKALAN}\n`);

  for (const kasus of KASUS) {
    console.log(`${kasus.peran} (${kasus.email})`);

    await nolkanPembatasLaju();
    const kuki = await masuk(kasus.email);
    periksa(kuki !== null, "dapat masuk");
    if (!kuki) continue;

    const tujuan = await lokasiSetelah("/tujuan", kuki);
    periksa(tujuan === kasus.dasbor, `/tujuan mengantar ke ${kasus.dasbor} (dapat ${tujuan})`);

    for (const lain of KASUS.filter((k) => k.peran !== kasus.peran)) {
      const hasil = await lokasiSetelah(lain.dasbor, kuki);

      // Kekecualian yang disengaja: matriks peran memberi superadmin hak
      // lihatPetaPotensi, sehingga ia memang boleh membuka dasbor dinas.
      if (kasus.peran === "superadmin" && lain.dasbor === "/dinas") {
        periksa(hasil === null, "superadmin diizinkan membuka /dinas (Peta Potensi)");
        continue;
      }

      periksa(
        hasil === kasus.dasbor,
        `ditolak dari ${lain.dasbor}, dipulangkan ke ${kasus.dasbor} (dapat ${hasil})`,
      );
    }
    console.log();
  }

  console.log("tanpa sesi");
  const tanpaSesi = await lokasiSetelah("/pemuda", "");
  periksa(tanpaSesi === "/masuk", `/pemuda mengalihkan ke /masuk (dapat ${tanpaSesi})`);

  await nolkanPembatasLaju();
  const sandiSalah = await fetch(`${PANGKALAN}/api/auth/sign-in/email`, {
    method: "POST",
    headers: KEPALA_JSON,
    body: JSON.stringify({ email: KASUS[0].email, password: "salah-sekali" }),
  });
  periksa(
    sandiSalah.status === 401,
    `kata sandi salah ditolak (status ${sandiSalah.status})`,
  );

  console.log("\npembatasan laju");
  await nolkanPembatasLaju();
  let kena429 = false;
  for (let i = 0; i < 8; i++) {
    const res = await fetch(`${PANGKALAN}/api/auth/sign-in/email`, {
      method: "POST",
      headers: KEPALA_JSON,
      body: JSON.stringify({ email: KASUS[0].email, password: "salah-lagi" }),
    });
    if (res.status === 429) {
      kena429 = true;
      periksa(true, `percobaan masuk beruntun ditahan pada percobaan ke-${i + 1}`);
      break;
    }
  }
  periksa(kena429, "pembatasan laju menahan percobaan masuk beruntun");
  await nolkanPembatasLaju();

  console.log(gagal === 0 ? "\nSemua pemeriksaan lulus." : `\n${gagal} pemeriksaan GAGAL.`);
  await prisma.$disconnect();
  process.exit(gagal === 0 ? 0 : 1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
