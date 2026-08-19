/**
 * Uji asap Papan Peluang.
 *
 *   npm run dev          (di terminal lain)
 *   npm run uji:peluang
 *
 * Selain alur biasa, berkas ini menguji satu celah yang pernah ada:
 * `z.url()` bawaan menerima `javascript:` dan `data:` sebagai alamat sah.
 * Bila pemeriksaan protokol di lib/validasi.ts dilonggarkan, uji di bawah
 * akan gagal — itulah gunanya.
 */
import "dotenv/config";

import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "../src/generated/prisma/client";
import { PeluangSkema } from "../src/lib/validasi";

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

const LOMBA = "Lomba Teknologi Piranti Lunak Jambore Pemuda 2026";
const BEASISWA = "Beasiswa pendidikan bagi pemuda berprestasi Demak";
const TUTUP = "Lomba cipta lagu bertema Demak";

function dasarPeluang() {
  return {
    judul: "Peluang uji protokol tautan",
    jenis: "LOMBA",
    deskripsi: "Keterangan uji otomatis yang cukup panjang untuk lolos batas minimal.",
    tenggat: null,
    usiaMin: null,
    usiaMaks: null,
    status: "DRAF",
  };
}

async function main() {
  console.log(`Menguji ${PANGKALAN}\n`);

  console.log("penyaringan protokol tautan");
  const berbahaya = [
    "javascript:alert(document.cookie)",
    "JaVaScRiPt:alert(1)",
    "data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg==",
    "vbscript:msgbox(1)",
    "file:///C:/Windows/win.ini",
  ];
  for (const t of berbahaya) {
    const hasil = PeluangSkema.safeParse({ ...dasarPeluang(), tautanLuar: t });
    periksa(!hasil.success, `ditolak: ${t.slice(0, 42)}`);
  }
  for (const t of ["https://demakkab.go.id", "http://contoh.id/daftar"]) {
    const hasil = PeluangSkema.safeParse({ ...dasarPeluang(), tautanLuar: t });
    periksa(hasil.success, `diterima: ${t}`);
  }

  console.log("\nhalaman publik");
  const semua = await ambil("/peluang");
  periksa(semua.status === 200, "papan peluang terbuka tanpa masuk");
  periksa(semua.isi.includes(LOMBA), "peluang yang masih dibuka tampil");
  periksa(!semua.isi.includes(TUTUP), "peluang yang tenggatnya lewat tidak tampil");

  const sudahTutup = await ambil("/peluang?tutup=1");
  periksa(sudahTutup.isi.includes(TUTUP), "peluang lewat tampil saat disaring tutup");
  periksa(!sudahTutup.isi.includes(LOMBA), "peluang terbuka tidak tampil di daftar tutup");

  const perJenis = await ambil("/peluang?jenis=BEASISWA");
  periksa(perJenis.isi.includes(BEASISWA), "saringan jenis BEASISWA menampilkan beasiswa");
  periksa(!perJenis.isi.includes(LOMBA), "saringan jenis menyingkirkan jenis lain");

  const jenisNgawur = await ambil("/peluang?jenis=NGAWUR");
  periksa(
    jenisNgawur.status === 200 && jenisNgawur.isi.includes(LOMBA),
    "jenis karangan diabaikan, bukan menggagalkan halaman",
  );

  const perMinat = await ambil("/peluang?minat=pendidikan");
  periksa(perMinat.isi.includes(BEASISWA), "saringan minat pendidikan menampilkan beasiswa");
  periksa(!perMinat.isi.includes(LOMBA), "saringan minat menyingkirkan bidang lain");

  const rinci = await ambil("/peluang/lomba-teknologi-piranti-lunak-2026");
  periksa(rinci.status === 200, "halaman rinci peluang terbuka");
  periksa(rinci.isi.includes("Kartu Talenta") === false, "isi rinci sesuai peluangnya");
  periksa(
    rinci.isi.includes("Jambore Pemuda Tingkat Kabupaten Demak 2026"),
    "tautan ke agenda terkait tampil",
  );

  // Draf tidak boleh bocor.
  const dinas = await prisma.user.findUniqueOrThrow({
    where: { email: "dinas@demakmuda.test" },
    select: { id: true },
  });
  const draf = await prisma.peluang.create({
    data: {
      judul: "Draf peluang uji yang tidak boleh tampil",
      slug: `draf-peluang-uji-${Date.now()}`,
      jenis: "LOMBA",
      deskripsi: "Keterangan draf peluang uji otomatis yang seharusnya tersembunyi.",
      status: "DRAF",
      pembuatId: dinas.id,
    },
    select: { id: true, slug: true },
  });
  const setelahDraf = await ambil("/peluang");
  periksa(
    !setelahDraf.isi.includes("Draf peluang uji yang tidak boleh tampil"),
    "peluang draf tidak tampil di daftar publik",
  );
  periksa(
    (await ambil(`/peluang/${draf.slug}`)).status === 404,
    "halaman rinci draf menolak",
  );

  console.log("\npemuda");
  const kukiPemuda = await masuk("pemuda@demakmuda.test");
  const kelolaPemuda = await ambil("/kelola/peluang", kukiPemuda);
  periksa(
    kelolaPemuda.tujuan === "/pemuda",
    `ditolak dari /kelola/peluang (dapat ${kelolaPemuda.tujuan})`,
  );

  console.log("\norganisasi");
  const kukiOrg = await masuk("organisasi@demakmuda.test");
  const kelolaOrg = await ambil("/kelola/peluang", kukiOrg);
  periksa(kelolaOrg.status === 200, "dapat membuka /kelola/peluang");
  periksa(
    !kelolaOrg.isi.includes(LOMBA),
    "tidak melihat peluang milik dinas di daftar kelolanya",
  );

  const punyaDinas = await prisma.peluang.findFirstOrThrow({
    where: { slug: "lomba-teknologi-piranti-lunak-2026" },
    select: { id: true },
  });
  periksa(
    (await ambil(`/kelola/peluang/${punyaDinas.id}`, kukiOrg)).status === 404,
    "tidak bisa menyunting peluang milik dinas",
  );

  await prisma.peluang.delete({ where: { id: draf.id } });
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
