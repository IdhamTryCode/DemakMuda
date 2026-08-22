/**
 * Uji asap unggah berkas.
 *
 *   npm run dev         (di terminal lain)
 *   npm run uji:unggah
 *
 * Titik beratnya bukan pada berhasilnya unggahan, melainkan pada apa yang
 * DITOLAK. Berkas tidak melewati peladen kita — peramban mengunggah langsung
 * ke penyimpanan memakai token — sehingga seluruh pembatasan harus sudah
 * tertanam di dalam token itu, dan alamat hasilnya harus diperiksa ulang
 * sebelum tersimpan.
 *
 * Yang dibuktikan:
 *   1. Token tidak terbit bagi yang belum masuk.
 *   2. Token tidak terbit untuk ruang yang bukan wewenang perannya.
 *   3. Nama berkas yang tidak sah ditolak sebelum token dibuat.
 *   4. Token yang terbit benar-benar menolak jenis dan ukuran di luar batas,
 *      dibuktikan dengan memakainya untuk melanggar batas itu.
 *   5. Alamat dari penyimpanan asing ditolak skema, sehingga tidak dapat
 *      masuk basis data lewat Server Action.
 *   6. Gambar yang sah benar-benar dirender lewat pengoptimal gambar.
 */
import "dotenv/config";

import { PrismaPg } from "@prisma/adapter-pg";
import { del, put } from "@vercel/blob";

import { PrismaClient } from "../src/generated/prisma/client";
import { hostBlob, jalurBlob } from "../src/lib/blob";
import { KaryaSkema, OrganisasiSkema } from "../src/lib/validasi";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL belum diisi.");
if (!process.env.BLOB_READ_WRITE_TOKEN) {
  throw new Error("BLOB_READ_WRITE_TOKEN belum diisi.");
}
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

/** Meminta token unggah persis seperti yang dilakukan pustaka di peramban. */
async function mintaToken(jalur: string, kuki: string) {
  const res = await fetch(`${PANGKALAN}/api/unggah`, {
    method: "POST",
    headers: { ...KEPALA_JSON, ...(kuki ? { cookie: kuki } : {}) },
    body: JSON.stringify({
      type: "blob.generate-client-token",
      payload: {
        pathname: jalur,
        callbackUrl: `${PANGKALAN}/api/unggah`,
        multipart: false,
        clientPayload: null,
      },
    }),
  });
  const data = (await res.json()) as { clientToken?: string; error?: string };
  return { status: res.status, ...data };
}

/** PNG 1x1 transparan; isinya tidak penting, jenisnya yang penting. */
const PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
  "base64",
);

async function main() {
  console.log(`Menguji ${PANGKALAN}\n`);
  await prisma.rateLimit.deleteMany();

  const inang = hostBlob();
  periksa(inang.endsWith(".public.blob.vercel-storage.com"), `inang blob dikenali (${inang})`);

  console.log("\npenerbitan token");
  const tamu = await mintaToken("karya/uji.png", "");
  periksa(tamu.status === 400 && !tamu.clientToken, "yang belum masuk tidak mendapat token");

  const kukiPemuda = await masuk("pemuda@demakmuda.test");
  const kukiOrg = await masuk("organisasi@demakmuda.test");

  const salahRuang = await mintaToken("organisasi/uji.png", kukiPemuda);
  periksa(
    salahRuang.status === 400 && !salahRuang.clientToken,
    "pemuda tidak boleh mengunggah ke ruang organisasi",
  );

  const salahRuang2 = await mintaToken("karya/uji.png", kukiOrg);
  periksa(
    salahRuang2.status === 400 && !salahRuang2.clientToken,
    "pengelola organisasi tidak boleh mengunggah ke ruang karya",
  );

  for (const jalur of [
    "karya/../rahasia.png",
    "sembarang/uji.png",
    "karya/uji.svg",
    "karya/uji.exe",
    "uji.png",
    "karya/UJI.png",
  ]) {
    const h = await mintaToken(jalur, kukiPemuda);
    periksa(h.status === 400 && !h.clientToken, `jalur "${jalur}" ditolak`);
  }

  const sah = await mintaToken("karya/uji-unggah.png", kukiPemuda);
  periksa(Boolean(sah.clientToken), "jalur yang sah mendapat token");

  console.log("\nbatas yang tertanam di dalam token");
  // Isi token tidak dibongkar — bentuknya urusan pustaka dan bisa berubah.
  // Yang diuji perilakunya: token dipakai melanggar batasnya, dan penyimpanan
  // yang harus menolak. Itulah pembuktian yang benar-benar berarti, sebab
  // penegaknya memang penyimpanan, bukan peramban.
  async function coba(
    keterangan: string,
    isi: Buffer | string,
    jenis: string,
    jalur = "karya/uji-batas.png",
  ) {
    const token = (await mintaToken(jalur, kukiPemuda)).clientToken;
    if (!token) {
      periksa(false, `${keterangan} (token tidak terbit)`);
      return;
    }
    try {
      const hasil = await put(jalur, isi, {
        access: "public",
        token,
        contentType: jenis,
        addRandomSuffix: true,
      });
      await del(hasil.url);
      return hasil;
    } catch (e) {
      return e as Error;
    }
  }

  const teks = await coba("teks", "sekadar teks biasa", "text/plain");
  periksa(teks instanceof Error, "berkas bukan gambar ditolak penyimpanan");

  const svg = await coba("svg", "<svg xmlns=\"http://www.w3.org/2000/svg\"></svg>", "image/svg+xml");
  periksa(svg instanceof Error, "SVG ditolak penyimpanan, bukan hanya oleh peramban");

  const besar = await coba("besar", Buffer.alloc(2 * 1024 * 1024 + 1024, 7), "image/png");
  periksa(besar instanceof Error, "berkas melebihi 2 MB ditolak penyimpanan");

  const wajar = await coba("wajar", PNG, "image/png");
  periksa(!(wajar instanceof Error), "gambar PNG yang wajar diterima");

  console.log("\nalamat yang boleh tersimpan");
  const dasar = {
    judul: "Karya uji penyaringan alamat",
    jenis: "PRODUK",
    deskripsi:
      "Cerita karya uji otomatis yang panjangnya cukup untuk lolos batas minimal skema Zod.",
    tautanLuar: "",
    status: "TERBIT",
  };
  const asing = [
    "https://contoh-jahat.public.blob.vercel-storage.com/karya/uji.png",
    "https://demakmuda.test/karya/uji.png",
    "http://" + inang + "/karya/uji.png",
    "javascript:alert(1)",
  ];
  for (const alamat of asing) {
    const hasil = KaryaSkema.safeParse({ ...dasar, gambarUrl: alamat });
    periksa(!hasil.success, `alamat asing ditolak: ${alamat.slice(0, 52)}`);
  }
  periksa(
    KaryaSkema.safeParse({ ...dasar, gambarUrl: `https://${inang}/karya/uji.png` }).success,
    "alamat dari penyimpanan sendiri diterima",
  );
  periksa(
    KaryaSkema.safeParse({ ...dasar, gambarUrl: "" }).success,
    "gambar tetap boleh dikosongkan",
  );
  periksa(
    !OrganisasiSkema.safeParse({
      nama: "Organisasi Uji",
      jenis: "KOMUNITAS",
      deskripsi: "",
      kontak: "",
      logoUrl: "https://contoh-jahat.example/logo.png",
      kecamatanId: "33.21.01",
      desaId: "",
    }).success,
    "logo organisasi juga menolak alamat asing",
  );

  console.log("\nunggah dan render sungguhan");
  const berkas = await put(jalurBlob("karya", "Uji Otomatis.PNG"), PNG, {
    access: "public",
    contentType: "image/png",
    addRandomSuffix: true,
  });
  periksa(new URL(berkas.url).hostname === inang, "berkas terunggah ke inang yang benar");

  const pemilik = await prisma.user.findUniqueOrThrow({
    where: { email: "pemuda@demakmuda.test" },
    select: { id: true },
  });
  const karya = await prisma.karya.create({
    data: {
      judul: "Karya uji dengan gambar",
      slug: `uji-gambar-${Date.now()}`,
      jenis: "PRODUK",
      deskripsi:
        "Karya uji otomatis yang dipakai membuktikan gambar unggahan benar-benar dirender di halaman publik.",
      gambarUrl: berkas.url,
      status: "TERBIT",
      pemilikId: pemilik.id,
    },
    select: { id: true, slug: true },
  });

  const halaman = await (await fetch(`${PANGKALAN}/karya/${karya.slug}`)).text();
  periksa(
    halaman.includes("/_next/image?url=") &&
      halaman.includes(encodeURIComponent(berkas.url).slice(0, 60)),
    "gambar dirender lewat pengoptimal gambar, bukan sebagai tautan biasa",
  );

  const daftar = await (await fetch(`${PANGKALAN}/karya`)).text();
  periksa(daftar.includes("Karya uji dengan gambar"), "karya bergambar tampil di daftar");

  await prisma.karya.delete({ where: { id: karya.id } });
  await del(berkas.url);
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
