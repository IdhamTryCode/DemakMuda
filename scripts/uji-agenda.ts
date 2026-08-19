/**
 * Uji asap kanal Agenda.
 *
 *   npm run dev         (di terminal lain)
 *   npm run uji:agenda
 *
 * Yang dibuktikan:
 *   1. Agenda mendatang tampil, agenda lampau tidak, dan sebaliknya.
 *   2. Penyaringan kecamatan benar-benar menyaring, bukan hiasan.
 *   3. Agenda berstatus draf tidak bocor ke halaman publik.
 *   4. Pemuda tidak bisa membuka pengelolaan agenda.
 *   5. Organisasi tidak bisa menyunting agenda milik orang lain.
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

const MENDATANG = "Jambore Pemuda Tingkat Kabupaten Demak 2026";
const LAMPAU = "Temu sanggar tari se-Kabupaten Demak";
const DI_SAYUNG = "Aksi tanam mangrove pesisir Sayung";

async function main() {
  console.log(`Menguji ${PANGKALAN}\n`);

  console.log("halaman publik");
  const mendatang = await ambil("/agenda");
  periksa(mendatang.status === 200, "daftar agenda terbuka tanpa masuk");
  periksa(mendatang.isi.includes(MENDATANG), "agenda mendatang tampil");
  periksa(!mendatang.isi.includes(LAMPAU), "agenda lampau tidak tampil di daftar mendatang");

  const lampau = await ambil("/agenda?waktu=lalu");
  periksa(lampau.isi.includes(LAMPAU), "agenda lampau tampil saat disaring lampau");
  periksa(!lampau.isi.includes(MENDATANG), "agenda mendatang tidak tampil di daftar lampau");

  const sayung = await prisma.kecamatan.findFirstOrThrow({
    where: { slug: "sayung" },
    select: { id: true },
  });
  const disaring = await ambil(`/agenda?kecamatan=${sayung.id}`);
  periksa(disaring.isi.includes(DI_SAYUNG), "agenda Sayung tampil saat disaring Sayung");
  periksa(
    !disaring.isi.includes(MENDATANG),
    "agenda kecamatan lain tersaring keluar",
  );

  const rinci = await ambil("/agenda/tanam-mangrove-pesisir-sayung");
  periksa(rinci.status === 200, "halaman rinci agenda terbuka");
  periksa(rinci.isi.includes("Pesisir Desa Bedono"), "lokasi tampil di rincian");

  // Draf tidak boleh bocor.
  const dinas = await prisma.user.findUniqueOrThrow({
    where: { email: "dinas@demakmuda.test" },
    select: { id: true },
  });
  const draf = await prisma.agenda.create({
    data: {
      judul: "Draf agenda uji yang tidak boleh tampil",
      slug: `draf-agenda-uji-${Date.now()}`,
      deskripsi: "Keterangan draf agenda uji otomatis yang seharusnya tersembunyi.",
      mulai: new Date(Date.now() + 86400000),
      status: "DRAF",
      pembuatId: dinas.id,
    },
    select: { id: true, slug: true },
  });

  const setelahDraf = await ambil("/agenda");
  periksa(
    !setelahDraf.isi.includes("Draf agenda uji yang tidak boleh tampil"),
    "agenda draf tidak tampil di daftar publik",
  );
  const drafRinci = await ambil(`/agenda/${draf.slug}`);
  periksa(drafRinci.status === 404, `halaman rinci draf menolak (${drafRinci.status})`);

  console.log("\npemuda");
  const kukiPemuda = await masuk("pemuda@demakmuda.test");
  const kelolaPemuda = await ambil("/kelola/agenda", kukiPemuda);
  periksa(
    kelolaPemuda.tujuan === "/pemuda",
    `ditolak dari /kelola/agenda (dapat ${kelolaPemuda.tujuan})`,
  );

  console.log("\norganisasi");
  const kukiOrg = await masuk("organisasi@demakmuda.test");
  const kelolaOrg = await ambil("/kelola/agenda", kukiOrg);
  periksa(kelolaOrg.status === 200, "dapat membuka /kelola/agenda");
  periksa(
    !kelolaOrg.isi.includes(MENDATANG),
    "tidak melihat agenda milik dinas di daftar kelolanya",
  );

  const agendaDinas = await prisma.agenda.findFirstOrThrow({
    where: { slug: "jambore-pemuda-demak-2026" },
    select: { id: true },
  });
  const sunting = await ambil(`/kelola/agenda/${agendaDinas.id}`, kukiOrg);
  periksa(
    sunting.status === 404,
    `tidak bisa menyunting agenda milik dinas (${sunting.status})`,
  );

  await prisma.agenda.delete({ where: { id: draf.id } });
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
