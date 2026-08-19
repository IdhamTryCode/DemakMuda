/**
 * Uji asap kanal Kabar.
 *
 *   npm run dev        (di terminal lain)
 *   npm run uji:kabar
 *
 * Yang dibuktikan:
 *   1. Kabar terbit tampil di halaman publik tanpa perlu masuk.
 *   2. Kabar berstatus draf TIDAK tampil di halaman publik.
 *   3. Pemuda tidak bisa membuka area pengelolaan.
 *   4. Organisasi hanya melihat kabarnya sendiri di area pengelolaan.
 *   5. Organisasi tidak bisa menyunting kabar milik orang lain.
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

async function main() {
  console.log(`Menguji ${PANGKALAN}\n`);

  console.log("halaman publik");
  const publik = await ambil("/kabar");
  periksa(publik.status === 200, "daftar kabar terbuka tanpa masuk");
  periksa(
    publik.isi.includes("Jambore Pemuda Kabupaten Demak 2026"),
    "kabar terbit tampil di daftar",
  );

  const rinci = await ambil("/kabar/jambore-pemuda-demak-2026-dibuka");
  periksa(rinci.status === 200, "halaman rinci kabar terbuka");
  periksa(
    rinci.isi.includes("Kartu Identitas Anak"),
    "isi Markdown dirender ke halaman",
  );

  // Draf tidak boleh bocor ke publik.
  const draf = await prisma.berita.create({
    data: {
      judul: "Draf uji yang tidak boleh tampil",
      slug: `draf-uji-${Date.now()}`,
      ringkasan: "Ringkasan draf uji otomatis yang seharusnya tidak terlihat publik.",
      isi: "Isi draf uji otomatis yang seharusnya tidak pernah muncul di halaman publik mana pun.",
      status: "DRAF",
      penulisId: (await prisma.user.findUniqueOrThrow({
        where: { email: "dinas@demakmuda.test" },
        select: { id: true },
      })).id,
    },
    select: { id: true, slug: true },
  });

  const publikLagi = await ambil("/kabar");
  periksa(
    !publikLagi.isi.includes("Draf uji yang tidak boleh tampil"),
    "kabar berstatus draf tidak tampil di daftar publik",
  );
  const drafRinci = await ambil(`/kabar/${draf.slug}`);
  periksa(drafRinci.status === 404, `halaman rinci draf menolak (${drafRinci.status})`);

  console.log("\npemuda");
  const kukiPemuda = await masuk("pemuda@demakmuda.test");
  const kelolaPemuda = await ambil("/kelola/kabar", kukiPemuda);
  periksa(
    kelolaPemuda.tujuan === "/pemuda",
    `ditolak dari /kelola/kabar, dipulangkan ke /pemuda (dapat ${kelolaPemuda.tujuan})`,
  );

  console.log("\norganisasi");
  const kukiOrg = await masuk("organisasi@demakmuda.test");
  const kelolaOrg = await ambil("/kelola/kabar", kukiOrg);
  periksa(kelolaOrg.status === 200, "dapat membuka /kelola/kabar");
  periksa(
    !kelolaOrg.isi.includes("Jambore Pemuda Kabupaten Demak 2026"),
    "tidak melihat kabar milik dinas di daftar kelolanya",
  );

  const punyaDinas = await prisma.berita.findFirstOrThrow({
    where: { slug: "jambore-pemuda-demak-2026-dibuka" },
    select: { id: true },
  });
  const suntingMilikOrangLain = await ambil(
    `/kelola/kabar/${punyaDinas.id}`,
    kukiOrg,
  );
  periksa(
    suntingMilikOrangLain.status === 404,
    `tidak bisa membuka penyuntingan kabar milik dinas (${suntingMilikOrangLain.status})`,
  );

  console.log("\ndinas");
  const kukiDinas = await masuk("dinas@demakmuda.test");
  const kelolaDinas = await ambil("/kelola/kabar", kukiDinas);
  periksa(
    kelolaDinas.isi.includes("Jambore Pemuda Kabupaten Demak 2026"),
    "melihat seluruh kabar di daftar kelolanya",
  );

  await prisma.berita.delete({ where: { id: draf.id } });
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
