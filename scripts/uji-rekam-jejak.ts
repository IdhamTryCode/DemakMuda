/**
 * Uji asap rekam jejak: pengalaman, prestasi, dan penyaringan talenta.
 *
 *   npm run dev              (di terminal lain)
 *   npm run uji:rekamjejak
 *
 * Fitur ini sengaja dibangun TANPA pengesahan dinas — prestasinya diisi
 * sendiri. Keputusan itu memindahkan seluruh beban kejujuran ke penandaan,
 * dan karena itu yang paling banyak diperiksa di sini justru penandaannya,
 * bukan penyimpanannya.
 *
 * Yang dibuktikan:
 *   1. Halaman pengisian menuntut pengguna sudah masuk.
 *   2. Layar penyaringan hanya untuk dinas dan superadmin.
 *   3. Prestasi tampil di kartu publik dengan penanda "Diisi sendiri", dan
 *      TIDAK PERNAH dengan kata yang menyiratkan pengesahan.
 *   4. Bukti prestasi milik pengguna di bawah umur tidak tampil ke umum,
 *      sementara prestasinya sendiri tetap tampil.
 *   5. Saringan tingkat dan saringan bukti benar-benar menyaring — dibuktikan
 *      dengan membandingkan hasilnya terhadap hitungan basis data.
 *   6. Skema menolak alamat bukti dari penyimpanan asing dan tahun yang
 *      mustahil.
 */
import "dotenv/config";

import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "../src/generated/prisma/client";
import { PengalamanSkema, PrestasiSkema } from "../src/lib/validasi";
import { tingkatKeAtas } from "../src/lib/prestasi";

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

function teksTampak(html: string): string {
  return html.replace(/<!--[\s\S]*?-->/g, "").replace(/<[^>]+>/g, " ");
}

async function main() {
  console.log(`Menguji ${PANGKALAN}\n`);

  console.log("penjagaan akses");
  periksa(
    (await ambil("/pemuda/rekam-jejak")).tujuan === "/masuk",
    "halaman rekam jejak menuntut masuk",
  );
  periksa(
    (await ambil("/dinas/talenta")).tujuan === "/masuk",
    "layar cari talenta menuntut masuk",
  );

  const kukiPemuda = await masuk("pemuda@demakmuda.test");
  periksa(
    (await ambil("/dinas/talenta", kukiPemuda)).tujuan === "/pemuda",
    "pemuda tidak boleh membuka layar cari talenta",
  );
  periksa(
    (await ambil("/pemuda/rekam-jejak", kukiPemuda)).status === 200,
    "pemuda dapat membuka halaman rekam jejaknya",
  );

  console.log("\nprestasi di kartu publik");
  const kartu = await ambil("/p/rani-puspitasari");
  const teks = teksTampak(kartu.isi);
  periksa(kartu.status === 200, "kartu publik terbuka");
  periksa(teks.includes("Diisi sendiri"), "prestasi bertanda diisi sendiri");
  periksa(
    teks.includes("tidak diperiksa Dinas Kepemudaan dan Olahraga"),
    "keterangan bahwa isinya tidak diperiksa tampil sebelum daftarnya",
  );

  // Inilah pemeriksaan yang paling penting di berkas ini. Tanpa pengesahan,
  // satu-satunya yang menahan kartu ini menjadi surat keterangan palsu adalah
  // kata-katanya sendiri. Kata "Terverifikasi" memang muncul di kartu, tetapi
  // untuk PROFIL — bukan untuk prestasi; keduanya tidak boleh tertukar.
  const bagianPrestasi = teks.slice(
    teks.indexOf("Bagian ini diisi sendiri"),
    teks.indexOf("Sertifikat terbitan DemakMuda"),
  );
  periksa(bagianPrestasi.length > 0, "bagian prestasi dapat dipisahkan dari sertifikat");
  for (const kata of ["Terverifikasi", "disahkan", "Tervalidasi", "Resmi"]) {
    periksa(
      !bagianPrestasi.includes(kata),
      `bagian prestasi tidak memakai kata "${kata}"`,
    );
  }
  periksa(
    teksTampak(kartu.isi).includes("Sertifikat terbitan DemakMuda"),
    "sertifikat berkode dipisahkan sebagai bagian tersendiri",
  );

  console.log("\nbukti prestasi pengguna di bawah umur");
  const belia = await prisma.profilPemuda.findFirst({
    where: { prestasi: { some: { buktiUrl: { not: null } } } },
    select: {
      id: true,
      slug: true,
      tanggalLahir: true,
      prestasi: {
        where: { buktiUrl: { not: null } },
        take: 1,
        select: { judul: true, buktiUrl: true },
      },
    },
  });
  if (!belia || !belia.prestasi[0]?.buktiUrl) {
    periksa(false, "ada profil berprestasi dengan bukti untuk diuji");
  } else {
    const asli = belia.tanggalLahir;
    const bukti = belia.prestasi[0].buktiUrl;
    const judul = belia.prestasi[0].judul;

    const sebagaiDewasa = await ambil(`/p/${belia.slug}`);
    periksa(
      sebagaiDewasa.isi.includes(encodeURIComponent(bukti).slice(0, 40)),
      "bukti tampil untuk pemilik dewasa",
    );

    await prisma.profilPemuda.update({
      where: { id: belia.id },
      data: { tanggalLahir: new Date(Date.now() - 15 * 365.25 * 24 * 3600 * 1000) },
    });
    const sebagaiAnak = await ambil(`/p/${belia.slug}`);
    periksa(
      !sebagaiAnak.isi.includes(encodeURIComponent(bukti).slice(0, 40)),
      "bukti TIDAK tampil untuk pemilik di bawah umur",
    );
    periksa(
      teksTampak(sebagaiAnak.isi).includes(judul),
      "prestasinya sendiri tetap tampil — yang disembunyikan hanya piagamnya",
    );

    await prisma.profilPemuda.update({
      where: { id: belia.id },
      data: { tanggalLahir: asli },
    });
  }

  console.log("\nsaringan cari talenta benar-benar menyaring");
  const kukiDinas = await masuk("dinas@demakmuda.test");
  const dasar = await ambil("/dinas/talenta", kukiDinas);
  periksa(dasar.status === 200, "dinas dapat membuka layar cari talenta");
  periksa(
    teksTampak(dasar.isi).includes("diisi sendiri"),
    "peringatan bahwa isinya belum diperiksa tampil di layar penyaringan",
  );

  // Jumlah yang tertulis di halaman dibandingkan dengan hitungan basis data
  // memakai saringan yang sama. Halaman yang menampilkan angka hasil saringan
  // sendiri, tanpa pembanding, akan lolos uji meski saringannya diabaikan.
  function jumlahDiHalaman(html: string): number | null {
    const m = teksTampak(html).match(/(\d+)\s+pemuda cocok/);
    return m ? Number(m[1]) : null;
  }

  const semua = jumlahDiHalaman(dasar.isi);
  const semuaDb = await prisma.profilPemuda.count({ where: { prestasi: { some: {} } } });
  periksa(semua !== null, "jumlah hasil tertulis di halaman");
  periksa(semua === Math.min(semuaDb, 60), `tanpa saringan cocok dengan basis data (${semua} vs ${semuaDb})`);

  const provinsi = await ambil("/dinas/talenta?tingkat=PROVINSI", kukiDinas);
  const provinsiDb = await prisma.profilPemuda.count({
    where: { prestasi: { some: { tingkat: { in: tingkatKeAtas("PROVINSI") } } } },
  });
  periksa(
    jumlahDiHalaman(provinsi.isi) === Math.min(provinsiDb, 60),
    `saringan "provinsi ke atas" cocok dengan basis data (${jumlahDiHalaman(provinsi.isi)} vs ${provinsiDb})`,
  );
  periksa(
    provinsiDb < semuaDb,
    "saringan tingkat benar-benar mempersempit, bukan mengembalikan semuanya",
  );

  const berbukti = await ambil("/dinas/talenta?bukti=1", kukiDinas);
  const berbuktiDb = await prisma.profilPemuda.count({
    where: { prestasi: { some: { buktiUrl: { not: null } } } },
  });
  periksa(
    jumlahDiHalaman(berbukti.isi) === Math.min(berbuktiDb, 60),
    `saringan "hanya yang berbukti" cocok dengan basis data (${jumlahDiHalaman(berbukti.isi)} vs ${berbuktiDb})`,
  );

  console.log("\nskema menolak masukan yang tidak sah");
  const dasarPrestasi = {
    judul: "Juara 1 Lomba Uji",
    tingkat: "KABUPATEN",
    peringkat: "Juara 1",
    penyelenggara: "Panitia uji",
    tahun: "2025",
  };
  periksa(
    PrestasiSkema.safeParse({ ...dasarPrestasi, buktiUrl: "" }).success,
    "prestasi tanpa bukti tetap diterima",
  );
  for (const jahat of [
    "https://situs-lain.example.com/piagam.png",
    "javascript:alert(1)",
    "http://thc4zy4yyhzcyzvz.public.blob.vercel-storage.com/a.png",
  ]) {
    periksa(
      !PrestasiSkema.safeParse({ ...dasarPrestasi, buktiUrl: jahat }).success,
      `bukti dari alamat asing ditolak: ${jahat.slice(0, 46)}`,
    );
  }
  periksa(
    !PrestasiSkema.safeParse({ ...dasarPrestasi, tahun: "1899" }).success,
    "tahun sebelum 1980 ditolak",
  );
  periksa(
    !PrestasiSkema.safeParse({ ...dasarPrestasi, tahun: String(new Date().getFullYear() + 5) }).success,
    "tahun jauh di masa depan ditolak",
  );
  periksa(
    !PrestasiSkema.safeParse({ ...dasarPrestasi, tingkat: "GALAKSI" }).success,
    "tingkat di luar daftar ditolak",
  );
  periksa(
    !PengalamanSkema.safeParse({
      judul: "Kepanitiaan uji",
      peran: "",
      penyelenggara: "",
      tahunMulai: "2025",
      tahunSelesai: "2020",
      keterangan: "",
    }).success,
    "pengalaman yang selesai sebelum mulai ditolak",
  );

  console.log(gagal === 0 ? "\nSemua pemeriksaan lulus." : `\n${gagal} pemeriksaan GAGAL.`);
  await prisma.$disconnect();
  process.exit(gagal === 0 ? 0 : 1);
}

main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
