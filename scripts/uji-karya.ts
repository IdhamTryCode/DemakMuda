/**
 * Uji asap Ruang Karya.
 *
 *   npm run dev        (di terminal lain)
 *   npm run uji:karya
 *
 * Yang dibuktikan:
 *   1. Karya terbit tampil di halaman publik tanpa perlu masuk.
 *   2. Karya draf maupun arsip TIDAK bocor ke halaman publik, dan halaman
 *      rincinya membalas 404 — bukan 403 yang justru menegaskan keberadaannya.
 *   3. Saringan jenis dan pencarian benar-benar menyaring, bukan sekadar
 *      tampak bekerja.
 *   4. Pemuda lain tidak dapat membuka penyuntingan karya milik orang lain.
 *   5. Alamat berprotokol javascript: dan data: tidak pernah menjadi href
 *      aktif, baik dari isi Markdown maupun dari kolom tautan.
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

const SUREL_LAIN = "uji-karya-lain@demakmuda.test";
const SANDI_LAIN = "UjiKarya2026!";

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

/** Menyapu sisa akun uji dari jalannya yang sebelumnya. */
async function bersihkan() {
  const u = await prisma.user.findUnique({
    where: { email: SUREL_LAIN },
    select: { id: true },
  });
  if (!u) return;
  await prisma.karya.deleteMany({ where: { pemilikId: u.id } });
  await prisma.aspirasi.deleteMany({ where: { pengirimId: u.id } });
  await prisma.session.deleteMany({ where: { userId: u.id } });
  await prisma.account.deleteMany({ where: { userId: u.id } });
  await prisma.user.delete({ where: { id: u.id } });
}

const KARYA_TERBIT = "Batik tulis motif mangrove Morodemak";
const KARYA_PRODUK = "Alat pengering bawang merah bertenaga surya";

async function main() {
  console.log(`Menguji ${PANGKALAN}\n`);
  await bersihkan();
  await prisma.rateLimit.deleteMany();

  const pemilik = await prisma.user.findUniqueOrThrow({
    where: { email: "pemuda@demakmuda.test" },
    select: { id: true },
  });

  console.log("halaman publik");
  const publik = await ambil("/karya");
  periksa(publik.status === 200, "daftar karya terbuka tanpa masuk");
  periksa(publik.isi.includes(KARYA_TERBIT), "karya terbit tampil di daftar");

  const rinci = await ambil("/karya/batik-tulis-motif-mangrove-morodemak");
  periksa(rinci.status === 200, "halaman rinci karya terbuka");
  periksa(rinci.isi.includes("canting"), "cerita Markdown dirender ke halaman");

  periksa(
    (await ambil("/karya/slug-yang-tidak-ada")).status === 404,
    "slug yang tidak ada membalas 404",
  );

  console.log("\nsaringan jenis");
  const seni = await ambil("/karya?jenis=SENI");
  periksa(seni.isi.includes(KARYA_TERBIT), "saringan SENI menampilkan karya seni");
  periksa(
    !seni.isi.includes(KARYA_PRODUK),
    "saringan SENI benar-benar membuang karya jenis lain",
  );
  const ngawur = await ambil("/karya?jenis=BUKAN_JENIS");
  periksa(
    ngawur.status === 200 && ngawur.isi.includes(KARYA_TERBIT),
    "nilai jenis ngawur diabaikan, bukan menggagalkan halaman",
  );

  console.log("\npencarian");
  const cari = await ambil("/karya?cari=bawang");
  periksa(cari.isi.includes(KARYA_PRODUK), "kata kunci menemukan karyanya");
  periksa(
    !cari.isi.includes(KARYA_TERBIT),
    "karya yang tidak cocok tersaring keluar",
  );
  const gabung = await ambil("/karya?cari=bawang&jenis=SENI");
  periksa(
    !gabung.isi.includes(KARYA_PRODUK),
    "jenis tetap menyaring meski sedang mencari",
  );
  const nihil = await ambil("/karya?cari=zxqwerty");
  periksa(
    nihil.status === 200 && nihil.isi.includes("Tidak ada karya yang memuat"),
    "pencarian tanpa hasil dijelaskan, bukan halaman kosong",
  );

  console.log("\ndraf dan arsip tidak bocor");
  const tersembunyi = await prisma.karya.createManyAndReturn({
    data: [
      {
        judul: "Karya draf uji yang tidak boleh tampil",
        slug: `uji-draf-${Date.now()}`,
        jenis: "LAINNYA",
        deskripsi:
          "Cerita karya draf hasil uji otomatis yang seharusnya tidak pernah terlihat oleh publik mana pun.",
        status: "DRAF",
        pemilikId: pemilik.id,
      },
      {
        judul: "Karya arsip uji yang tidak boleh tampil",
        slug: `uji-arsip-${Date.now()}`,
        jenis: "LAINNYA",
        deskripsi:
          "Cerita karya arsip hasil uji otomatis yang seharusnya tidak pernah terlihat oleh publik mana pun.",
        status: "ARSIP",
        pemilikId: pemilik.id,
      },
    ],
    select: { id: true, slug: true, judul: true, status: true },
  });

  const publikLagi = await ambil("/karya");
  for (const k of tersembunyi) {
    periksa(
      !publikLagi.isi.includes(k.judul),
      `karya ${k.status.toLowerCase()} tidak tampil di daftar publik`,
    );
    const s = (await ambil(`/karya/${k.slug}`)).status;
    periksa(s === 404, `halaman rinci karya ${k.status.toLowerCase()} membalas 404 (dapat ${s})`);
  }

  console.log("\npenyaringan tautan");
  // Ditulis langsung ke basis data, melewati Zod, persis seperti baris warisan
  // atau hasil impor yang tidak pernah melewati formulir.
  const jahat = await prisma.karya.create({
    data: {
      judul: "Uji penyaringan tautan pada karya",
      slug: `uji-tautan-${Date.now()}`,
      jenis: "LAINNYA",
      deskripsi: [
        "[klik jahat](javascript:alert(document.cookie))",
        "",
        "[data jahat](data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg==)",
        "",
        "<img src=x onerror=alert(1)>",
        "",
        "[tautan wajar](https://demakkab.go.id)",
      ].join("\n"),
      tautanLuar: "javascript:alert(1)",
      gambarUrl: "data:text/html,<script>alert(1)</script>",
      status: "TERBIT",
      pemilikId: pemilik.id,
    },
    select: { id: true, slug: true },
  });

  const dirender = (await ambil(`/karya/${jahat.slug}`)).isi;
  periksa(
    !/href="(javascript|data|vbscript):/i.test(dirender),
    "tidak ada href berprotokol javascript:, data:, atau vbscript:",
  );
  periksa(!/<img[^>]*onerror/i.test(dirender), "HTML mentah tidak menjadi tag aktif");
  periksa(
    !dirender.includes("Tautan karya"),
    "kotak tautan tidak dirender sama sekali bila kedua alamatnya ditolak",
  );
  periksa(
    dirender.includes('href="https://demakkab.go.id"'),
    "tautan http(s) yang wajar tetap berfungsi",
  );
  await prisma.karya.delete({ where: { id: jahat.id } });

  console.log("\npengelolaan milik sendiri");
  const tamu = await ambil("/pemuda/karya");
  periksa(tamu.tujuan === "/masuk", `tamu diarahkan ke /masuk (dapat ${tamu.tujuan})`);

  const kukiPemuda = await masuk("pemuda@demakmuda.test");
  const milikku = await ambil("/pemuda/karya", kukiPemuda);
  periksa(milikku.status === 200, "pemilik dapat membuka /pemuda/karya");
  periksa(milikku.isi.includes(KARYA_TERBIT), "karyanya sendiri tampil di daftar kelola");
  periksa(
    milikku.isi.includes("Karya draf uji yang tidak boleh tampil"),
    "karya drafnya sendiri tetap terlihat oleh pemiliknya",
  );

  const kukiOrg = await masuk("organisasi@demakmuda.test");
  const orgKeKarya = await ambil("/pemuda/karya", kukiOrg);
  periksa(
    orgKeKarya.tujuan === "/organisasi",
    `peran organisasi dipulangkan ke dasbornya (dapat ${orgKeKarya.tujuan})`,
  );

  console.log("\nkarya milik orang lain");
  const daftar1 = await fetch(`${PANGKALAN}/api/auth/sign-up/email`, {
    method: "POST",
    headers: KEPALA_JSON,
    body: JSON.stringify({
      name: "Pemuda Uji Karya",
      email: SUREL_LAIN,
      password: SANDI_LAIN,
    }),
  });
  periksa(daftar1.status === 200, `akun pemuda kedua dibuat (${daftar1.status})`);
  await prisma.user.update({
    where: { email: SUREL_LAIN },
    data: { emailVerified: true, role: "pemuda" },
  });

  const kukiLain = await masuk(SUREL_LAIN, SANDI_LAIN);
  const punyaOrangLain = await prisma.karya.findFirstOrThrow({
    where: { slug: "batik-tulis-motif-mangrove-morodemak" },
    select: { id: true },
  });
  const sunting = await ambil(`/pemuda/karya/${punyaOrangLain.id}`, kukiLain);
  periksa(
    sunting.status === 404,
    `penyuntingan karya milik orang lain membalas 404, bukan 403 (dapat ${sunting.status})`,
  );

  const daftarLain = await ambil("/pemuda/karya", kukiLain);
  periksa(
    !daftarLain.isi.includes(KARYA_TERBIT),
    "daftar kelola tidak memuat karya milik akun lain",
  );

  const drafOrangLain = tersembunyi.find((k) => k.status === "DRAF");
  if (drafOrangLain) {
    const s = (await ambil(`/pemuda/karya/${drafOrangLain.id}`, kukiLain)).status;
    periksa(s === 404, `draf milik orang lain tidak dapat dibuka (${s})`);
  }

  await prisma.karya.deleteMany({ where: { id: { in: tersembunyi.map((k) => k.id) } } });
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
