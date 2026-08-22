/**
 * Matriks akses seluruh halaman terhadap seluruh peran.
 *
 *   npm run dev        (di terminal lain)
 *   npm run uji:akses
 *
 * Uji lain memeriksa satu kanal secara mendalam. Berkas ini memeriksa yang
 * sebaliknya: setiap halaman, dibuka oleh setiap peran, dibandingkan dengan
 * satu tabel harapan yang ditulis terbuka di bawah.
 *
 * Gunanya bukan menambah pemeriksaan, melainkan menutup celah yang paling
 * mudah lolos — halaman baru yang lupa dijaga. Halaman yang tidak tercantum di
 * tabel akan dilaporkan sebagai tertinggal, sehingga tabel ini tidak dapat
 * diam-diam ketinggalan zaman.
 *
 * Arti nilai pada tabel:
 *   "200"        halaman terbuka
 *   "404"        ada, tetapi bukan milik peran ini — sengaja tidak dibedakan
 *                dari halaman yang memang tidak ada
 *   "->/alamat"  dialihkan ke alamat itu
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

const PERAN = ["tamu", "pemuda", "organisasi", "dinas", "superadmin"] as const;
type Peran = (typeof PERAN)[number];

const SUREL: Record<Exclude<Peran, "tamu">, string> = {
  pemuda: "pemuda@demakmuda.test",
  organisasi: "organisasi@demakmuda.test",
  dinas: "dinas@demakmuda.test",
  superadmin: "admin@demakmuda.test",
};

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

/** Membalas "200", "404", "->/alamat", atau kode statusnya apa adanya. */
async function buka(jalur: string, kuki: string): Promise<string> {
  const res = await fetch(`${PANGKALAN}${jalur}`, {
    headers: kuki ? { cookie: kuki } : {},
    redirect: "manual",
  });
  const lokasi = res.headers.get("location");
  if (lokasi) return `->${new URL(lokasi, PANGKALAN).pathname}`;
  return String(res.status);
}

const DASBOR: Record<Exclude<Peran, "tamu">, string> = {
  pemuda: "->/pemuda",
  organisasi: "->/organisasi",
  dinas: "->/dinas",
  superadmin: "->/admin",
};

/** Hanya berguna sebelum masuk; yang sudah masuk dipulangkan ke /tujuan. */
function halamanTamu() {
  return {
    tamu: "200",
    pemuda: "->/tujuan",
    organisasi: "->/tujuan",
    dinas: "->/tujuan",
    superadmin: "->/tujuan",
  } as Record<Peran, string>;
}

/** Terbuka untuk semua, termasuk yang belum masuk. */
function publik() {
  return {
    tamu: "200",
    pemuda: "200",
    organisasi: "200",
    dinas: "200",
    superadmin: "200",
  } as Record<Peran, string>;
}

/** Hanya peran tertentu; sisanya dipulangkan ke dasbornya sendiri. */
function hanya(...diizinkan: Exclude<Peran, "tamu">[]) {
  const hasil: Record<Peran, string> = {
    tamu: "->/masuk",
    pemuda: DASBOR.pemuda,
    organisasi: DASBOR.organisasi,
    dinas: DASBOR.dinas,
    superadmin: DASBOR.superadmin,
  };
  for (const p of diizinkan) hasil[p] = "200";
  return hasil;
}

async function main() {
  console.log(`Menguji ${PANGKALAN}\n`);
  await prisma.rateLimit.deleteMany();

  // Pengenal nyata dari basis data, supaya yang diuji halaman sungguhan.
  const [
    kabar,
    agenda,
    peluang,
    karya,
    organisasi,
    organisasiTerbit,
    profil,
    sertifikat,
    aspirasi,
  ] = await Promise.all([
      prisma.berita.findFirstOrThrow({
        where: { status: "TERBIT" },
        select: { id: true, slug: true },
      }),
      prisma.agenda.findFirstOrThrow({
        where: { status: "TERBIT" },
        select: { id: true, slug: true },
      }),
      prisma.peluang.findFirstOrThrow({
        where: { status: "TERBIT" },
        select: { id: true, slug: true },
      }),
      prisma.karya.findFirstOrThrow({
        where: { status: "TERBIT", pemilik: { email: "pemuda@demakmuda.test" } },
        select: { id: true, slug: true },
      }),
      prisma.organisasi.findFirstOrThrow({
        where: { pemilik: { email: "organisasi@demakmuda.test" } },
        select: { id: true, slug: true },
      }),
      // Halaman direktori publik hanya menampilkan yang sudah terverifikasi,
      // jadi contoh untuk halaman itu harus dipilih dengan syarat yang sama —
      // kalau tidak, ujinya melapor 404 padahal aplikasinya benar.
      prisma.organisasi.findFirstOrThrow({
        where: { statusVerifikasi: "TERVERIFIKASI" },
        select: { slug: true },
      }),
      prisma.profilPemuda.findFirstOrThrow({ select: { slug: true } }),
      prisma.sertifikat.findFirstOrThrow({ select: { kode: true } }),
      prisma.aspirasi.findFirstOrThrow({ select: { id: true } }),
    ]);

  // Kabar milik dinas, dipakai menguji bahwa organisasi tidak dapat
  // menyunting isi milik orang lain.
  const kabarDinas = await prisma.berita.findFirstOrThrow({
    where: { penulis: { email: "dinas@demakmuda.test" } },
    select: { id: true },
  });

  const TABEL: { jalur: string; pola: string; harap: Record<Peran, string> }[] = [
    // ── Halaman publik ──
    { jalur: "/", pola: "/", harap: publik() },
    { jalur: "/kabar", pola: "/kabar", harap: publik() },
    { jalur: `/kabar/${kabar.slug}`, pola: "/kabar/[slug]", harap: publik() },
    { jalur: "/agenda", pola: "/agenda", harap: publik() },
    { jalur: `/agenda/${agenda.slug}`, pola: "/agenda/[slug]", harap: publik() },
    { jalur: "/peluang", pola: "/peluang", harap: publik() },
    { jalur: `/peluang/${peluang.slug}`, pola: "/peluang/[slug]", harap: publik() },
    { jalur: "/karya", pola: "/karya", harap: publik() },
    { jalur: `/karya/${karya.slug}`, pola: "/karya/[slug]", harap: publik() },
    { jalur: "/direktori", pola: "/direktori", harap: publik() },
    {
      jalur: `/direktori/${organisasiTerbit.slug}`,
      pola: "/direktori/[slug]",
      harap: publik(),
    },
    { jalur: `/p/${profil.slug}`, pola: "/p/[slug]", harap: publik() },
    { jalur: "/cek", pola: "/cek", harap: publik() },
    { jalur: `/cek/${sertifikat.kode}`, pola: "/cek/[kode]", harap: publik() },
    { jalur: "/privasi", pola: "/privasi", harap: publik() },
    { jalur: "/latar", pola: "/latar", harap: publik() },
    // Yang sudah masuk tidak perlu melihat halaman masuk lagi; proxy
    // memulangkannya ke /tujuan, yang lalu mengantar ke dasbor perannya.
    { jalur: "/masuk", pola: "/masuk", harap: halamanTamu() },
    { jalur: "/daftar", pola: "/daftar", harap: halamanTamu() },
    { jalur: "/masuk/dua-langkah", pola: "/masuk/dua-langkah", harap: publik() },

    // ── Butuh masuk, tanpa batasan peran ──
    {
      jalur: "/keamanan",
      pola: "/keamanan",
      harap: {
        tamu: "->/masuk",
        pemuda: "200",
        organisasi: "200",
        dinas: "200",
        superadmin: "200",
      },
    },
    {
      jalur: "/tujuan",
      pola: "/tujuan",
      harap: {
        tamu: "->/masuk",
        pemuda: DASBOR.pemuda,
        organisasi: DASBOR.organisasi,
        dinas: DASBOR.dinas,
        superadmin: DASBOR.superadmin,
      },
    },

    // ── Dasbor tiap peran ──
    { jalur: "/pemuda", pola: "/pemuda", harap: hanya("pemuda") },
    { jalur: "/organisasi", pola: "/organisasi", harap: hanya("organisasi") },
    // Superadmin sengaja ikut diberi Peta Potensi: ia berwenang atas seluruh
    // isi, dan memaksanya berganti akun hanya untuk melihat angka tidak ada
    // gunanya.
    { jalur: "/dinas", pola: "/dinas", harap: hanya("dinas", "superadmin") },
    { jalur: "/admin", pola: "/admin", harap: hanya("superadmin") },
    { jalur: "/admin/pengguna", pola: "/admin/pengguna", harap: hanya("superadmin") },
    { jalur: "/admin/audit", pola: "/admin/audit", harap: hanya("superadmin") },

    // ── Area pemuda ──
    // Kartu Talenta terbuka bagi siapa pun yang sudah masuk — seorang
    // pengelola organisasi bisa saja sekaligus pemuda Demak. Yang dijaga bukan
    // siapa boleh mengisinya, melainkan angka Peta Potensi, yang hanya
    // menghitung profil milik akun berperan pemuda.
    {
      jalur: "/pemuda/profil",
      pola: "/pemuda/profil",
      harap: {
        tamu: "->/masuk",
        pemuda: "200",
        organisasi: "200",
        dinas: "200",
        superadmin: "200",
      },
    },
    { jalur: "/pemuda/kegiatan", pola: "/pemuda/kegiatan", harap: hanya("pemuda") },
    { jalur: "/pemuda/karya", pola: "/pemuda/karya", harap: hanya("pemuda") },
    { jalur: "/pemuda/karya/baru", pola: "/pemuda/karya/baru", harap: hanya("pemuda") },
    {
      jalur: `/pemuda/karya/${karya.id}`,
      pola: "/pemuda/karya/[id]",
      harap: hanya("pemuda"),
    },
    { jalur: "/pemuda/aspirasi", pola: "/pemuda/aspirasi", harap: hanya("pemuda") },
    {
      jalur: "/pemuda/aspirasi/baru",
      pola: "/pemuda/aspirasi/baru",
      harap: hanya("pemuda"),
    },

    // ── Area pengelolaan isi ──
    {
      jalur: "/kelola/kabar",
      pola: "/kelola/kabar",
      harap: hanya("organisasi", "dinas", "superadmin"),
    },
    {
      jalur: "/kelola/kabar/baru",
      pola: "/kelola/kabar/baru",
      harap: hanya("organisasi", "dinas", "superadmin"),
    },
    {
      // Milik dinas: organisasi harus dapat 404, bukan 403.
      jalur: `/kelola/kabar/${kabarDinas.id}`,
      pola: "/kelola/kabar/[id]",
      harap: {
        ...hanya("organisasi", "dinas", "superadmin"),
        organisasi: "404",
      },
    },
    {
      jalur: "/kelola/agenda",
      pola: "/kelola/agenda",
      harap: hanya("organisasi", "dinas", "superadmin"),
    },
    {
      jalur: "/kelola/agenda/baru",
      pola: "/kelola/agenda/baru",
      harap: hanya("organisasi", "dinas", "superadmin"),
    },
    {
      jalur: `/kelola/agenda/${agenda.id}`,
      pola: "/kelola/agenda/[id]",
      harap: {
        ...hanya("organisasi", "dinas", "superadmin"),
        organisasi: "404",
      },
    },
    {
      jalur: "/kelola/peluang",
      pola: "/kelola/peluang",
      harap: hanya("organisasi", "dinas", "superadmin"),
    },
    {
      jalur: "/kelola/peluang/baru",
      pola: "/kelola/peluang/baru",
      harap: hanya("organisasi", "dinas", "superadmin"),
    },
    {
      jalur: `/kelola/peluang/${peluang.id}`,
      pola: "/kelola/peluang/[id]",
      harap: {
        ...hanya("organisasi", "dinas", "superadmin"),
        organisasi: "404",
      },
    },
    {
      jalur: "/kelola/organisasi",
      pola: "/kelola/organisasi",
      harap: hanya("organisasi", "dinas", "superadmin"),
    },
    {
      jalur: "/kelola/organisasi/baru",
      pola: "/kelola/organisasi/baru",
      harap: hanya("organisasi", "dinas", "superadmin"),
    },
    {
      jalur: `/kelola/organisasi/${organisasi.id}`,
      pola: "/kelola/organisasi/[id]",
      harap: hanya("organisasi", "dinas", "superadmin"),
    },
    {
      jalur: `/kelola/organisasi/${organisasi.id}/anggota`,
      pola: "/kelola/organisasi/[id]/anggota",
      harap: hanya("organisasi", "dinas", "superadmin"),
    },
    {
      jalur: `/kelola/peserta/peluang/${peluang.id}`,
      pola: "/kelola/peserta/[jenis]/[id]",
      harap: {
        ...hanya("organisasi", "dinas", "superadmin"),
        organisasi: "404",
      },
    },

    // ── Moderasi Ruang Karya dan Ruang Aspirasi: organisasi dikecualikan ──
    {
      jalur: "/kelola/karya",
      pola: "/kelola/karya",
      harap: hanya("dinas", "superadmin"),
    },
    {
      jalur: "/kelola/aspirasi",
      pola: "/kelola/aspirasi",
      harap: hanya("dinas", "superadmin"),
    },
    {
      jalur: `/kelola/aspirasi/${aspirasi.id}`,
      pola: "/kelola/aspirasi/[id]",
      harap: hanya("dinas", "superadmin"),
    },
  ];

  const kuki: Record<Peran, string> = {
    tamu: "",
    pemuda: await masuk(SUREL.pemuda),
    organisasi: await masuk(SUREL.organisasi),
    dinas: await masuk(SUREL.dinas),
    superadmin: await masuk(SUREL.superadmin),
  };

  for (const baris of TABEL) {
    const salah: string[] = [];
    for (const p of PERAN) {
      const dapat = await buka(baris.jalur, kuki[p]);
      if (dapat !== baris.harap[p]) {
        salah.push(`${p}: harap ${baris.harap[p]}, dapat ${dapat}`);
      }
    }
    periksa(salah.length === 0, `${baris.pola.padEnd(34)} ${salah.join(" · ")}`);
  }

  // Tema lomba harus dinyatakan di halaman yang dibuka lebih dulu, bukan hanya
  // tersirat dari fungsinya. Pemeriksaan ini menjaga pernyataan itu tidak
  // hilang tanpa sengaja saat salinan halaman disunting.
  console.log("\npernyataan tema");
  const beranda = await (await fetch(`${PANGKALAN}/`)).text();
  const latar = await (await fetch(`${PANGKALAN}/latar`)).text();

  for (const kata of ["bonus demografi", "Generasi Emas 2045"]) {
    periksa(
      beranda.toLowerCase().includes(kata.toLowerCase()),
      `beranda menyebut "${kata}"`,
    );
  }
  periksa(beranda.includes("/latar"), "beranda menautkan halaman Latar");

  for (const kata of [
    "Bonus demografi",
    "Generasi Emas 2045",
    "Terdata",
    "Tersalurkan",
    "Terbukti",
    "Terdengar",
  ]) {
    periksa(latar.includes(kata), `halaman Latar memuat "${kata}"`);
  }

  // Angka cakupan wilayah pada halaman Latar diambil dari basis data, bukan
  // ditulis tetap. Bila nanti tidak cocok, yang salah halamannya.
  const [jumlahKecamatan, jumlahDesa] = await Promise.all([
    prisma.kecamatan.count(),
    prisma.desa.count(),
  ]);
  // React memisahkan potongan teks bertetangga dengan komentar <!-- -->, jadi
  // "14 kecamatan" muncul sebagai "14<!-- --> kecamatan" pada markup. Komentar
  // itu dibuang dulu, kalau tidak pemeriksaan ini gagal padahal halamannya benar.
  const latarBersih = latar.replace(/<!--.*?-->/g, "");
  periksa(
    latarBersih.includes(`${jumlahKecamatan} kecamatan`) &&
      latarBersih.includes(`${jumlahDesa} desa`),
    `cakupan wilayah pada halaman Latar cocok dengan basis data (${jumlahKecamatan}/${jumlahDesa})`,
  );

  // Tabel di atas tidak boleh tertinggal dari daftar rute yang sebenarnya.
  console.log("\nkelengkapan tabel");
  const { readdirSync, statSync } = await import("node:fs");
  const { join } = await import("node:path");

  function telusuri(dir: string, awalan = ""): string[] {
    const hasil: string[] = [];
    for (const nama of readdirSync(dir)) {
      const penuh = join(dir, nama);
      if (statSync(penuh).isDirectory()) {
        // Grup rute seperti (daftar) tidak muncul pada alamat.
        const bagian = nama.startsWith("(") ? awalan : `${awalan}/${nama}`;
        hasil.push(...telusuri(penuh, bagian));
      } else if (nama === "page.tsx") {
        hasil.push(awalan === "" ? "/" : awalan);
      }
    }
    return hasil;
  }

  const rute = telusuri("src/app").sort();
  const diuji = new Set(TABEL.map((b) => b.pola));
  const tertinggal = rute.filter((r) => !diuji.has(r));
  periksa(
    tertinggal.length === 0,
    `seluruh ${rute.length} halaman tercantum di tabel${tertinggal.length ? `; belum: ${tertinggal.join(", ")}` : ""}`,
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
