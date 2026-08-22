/**
 * Uji asap alur keanggotaan organisasi, dari ujung ke ujung.
 *
 *   npm run dev              (di terminal lain)
 *   npm run uji:keanggotaan
 *
 * Alur ini melibatkan dua orang yang berbeda dan tiga halaman yang berbeda,
 * dan itulah jenis alur yang paling mudah tampak benar di kode tetapi putus di
 * tengah. Uji ini menelusurinya seperti pengguna: apa yang dilihat pemuda
 * sebelum mengajukan, apa yang dilihat pengurus setelah pengajuan masuk, dan
 * apa yang dilihat pemuda setelah pengurus memutuskan.
 *
 * Catatan: penekanan tombolnya sendiri tidak disimulasikan. Server Action
 * dipanggil lewat pengenal yang dibangkitkan saat pembangunan, sehingga
 * memanggilnya dari skrip berarti menguji hal yang salah. Yang diubah di sini
 * adalah keadaan basis datanya — persis yang dilakukan aksi itu — lalu setiap
 * halaman diperiksa apakah benar-benar memperlihatkan keadaan barunya.
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

const SUREL_UJI = "uji-keanggotaan@demakmuda.test";
const SANDI_UJI = "UjiKeanggotaan2026!";
const NAMA_UJI = "Pemuda Uji Keanggotaan";

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

async function bersihkan() {
  const u = await prisma.user.findUnique({
    where: { email: SUREL_UJI },
    select: { id: true },
  });
  if (!u) return;
  await prisma.keanggotaan.deleteMany({ where: { userId: u.id } });
  await prisma.session.deleteMany({ where: { userId: u.id } });
  await prisma.account.deleteMany({ where: { userId: u.id } });
  await prisma.user.delete({ where: { id: u.id } });
}

async function main() {
  console.log(`Menguji ${PANGKALAN}\n`);
  await bersihkan();
  await prisma.rateLimit.deleteMany();

  // Organisasi terverifikasi milik akun peragaan organisasi — pengurusnya
  // itulah yang nanti menanggapi pengajuan.
  const organisasi = await prisma.organisasi.findFirstOrThrow({
    where: {
      statusVerifikasi: "TERVERIFIKASI",
      pemilik: { email: "organisasi@demakmuda.test" },
    },
    select: { id: true, slug: true, nama: true },
  });
  console.log(`Organisasi sasaran: ${organisasi.nama}\n`);

  const daftar = await fetch(`${PANGKALAN}/api/auth/sign-up/email`, {
    method: "POST",
    headers: KEPALA_JSON,
    body: JSON.stringify({ name: NAMA_UJI, email: SUREL_UJI, password: SANDI_UJI }),
  });
  periksa(daftar.status === 200, `akun pemuda uji dibuat (${daftar.status})`);
  const pemuda = await prisma.user.update({
    where: { email: SUREL_UJI },
    data: { emailVerified: true, role: "pemuda" },
    select: { id: true },
  });

  const kukiPemuda = await masuk(SUREL_UJI, SANDI_UJI);
  const kukiOrg = await masuk("organisasi@demakmuda.test");

  console.log("sebelum mengajukan");
  const sebelum = await ambil(`/direktori/${organisasi.slug}`, kukiPemuda);
  periksa(sebelum.status === 200, "halaman organisasi terbuka bagi pemuda");
  periksa(sebelum.isi.includes("Ingin bergabung?"), "ajakan bergabung ditawarkan");

  const tamu = await ambil(`/direktori/${organisasi.slug}`);
  periksa(
    tamu.isi.includes("Masuk untuk mengajukan diri"),
    "tamu diminta masuk lebih dulu, bukan diberi tombol yang pasti gagal",
  );

  const pengurusLihat = await ambil(`/direktori/${organisasi.slug}`, kukiOrg);
  periksa(
    !pengurusLihat.isi.includes("Ingin bergabung?"),
    "pengelola organisasi tidak ditawari bergabung ke organisasi",
  );

  console.log("\npengajuan masuk");
  const keanggotaan = await prisma.keanggotaan.create({
    data: { organisasiId: organisasi.id, userId: pemuda.id },
    select: { id: true },
  });

  const sedang = await ambil(`/direktori/${organisasi.slug}`, kukiPemuda);
  periksa(
    sedang.isi.includes("sedang diperiksa pengurus"),
    "pemuda melihat pengajuannya sedang diperiksa",
  );
  periksa(
    !sedang.isi.includes("Ingin bergabung?"),
    "ajakan bergabung tidak muncul lagi setelah mengajukan",
  );

  const dasborOrg = await ambil("/organisasi", kukiOrg);
  periksa(
    dasborOrg.isi.includes("permintaan bergabung menunggu tanggapan"),
    "dasbor pengurus memberitahukan ada permintaan menunggu",
  );

  const halamanAnggota = await ambil(
    `/kelola/organisasi/${organisasi.id}/anggota`,
    kukiOrg,
  );
  periksa(halamanAnggota.status === 200, "pengurus dapat membuka daftar anggota");
  periksa(halamanAnggota.isi.includes(NAMA_UJI), "nama pengaju tampil di daftar");
  periksa(
    halamanAnggota.isi.includes(SUREL_UJI),
    "surel pengaju tampil, supaya pengurus dapat menghubungi",
  );

  // Pengurus organisasi lain tidak boleh melihat, apalagi menanggapi.
  const punyaDinas = await prisma.organisasi.findFirst({
    where: { pemilik: { email: "dinas@demakmuda.test" } },
    select: { id: true },
  });
  if (punyaDinas) {
    const s = (await ambil(`/kelola/organisasi/${punyaDinas.id}/anggota`, kukiOrg))
      .status;
    periksa(s === 404, `daftar anggota organisasi lain membalas 404 (dapat ${s})`);
  }

  console.log("\nsetelah diterima");
  await prisma.keanggotaan.update({
    where: { id: keanggotaan.id },
    data: { status: "TERVERIFIKASI" },
  });

  const sesudah = await ambil(`/direktori/${organisasi.slug}`, kukiPemuda);
  periksa(
    sesudah.isi.includes("tercatat sebagai anggota"),
    "pemuda melihat dirinya sudah tercatat sebagai anggota",
  );

  const dasborPemuda = await ambil("/pemuda", kukiPemuda);
  periksa(
    dasborPemuda.isi.includes("Organisasi saya") &&
      dasborPemuda.isi.includes(organisasi.nama),
    "keanggotaan tampil di dasbor pemuda, bukan hanya di halaman organisasinya",
  );

  const daftarUmum = await ambil("/direktori");
  periksa(
    daftarUmum.status === 200 && daftarUmum.isi.includes(organisasi.nama),
    "organisasi tetap tampil di direktori publik",
  );

  console.log("\nsetelah ditolak");
  await prisma.keanggotaan.update({
    where: { id: keanggotaan.id },
    data: { status: "DITOLAK" },
  });
  const ditolak = await ambil(`/direktori/${organisasi.slug}`, kukiPemuda);
  periksa(
    ditolak.isi.includes("tidak disetujui pengurus"),
    "penolakan pun disampaikan, bukan dibiarkan tanpa kabar",
  );
  periksa(
    !ditolak.isi.includes("Ingin bergabung?"),
    "yang ditolak tidak dapat langsung mengajukan ulang berkali-kali",
  );

  const dasborTolak = await ambil("/pemuda", kukiPemuda);
  periksa(
    dasborTolak.isi.includes("Tidak disetujui"),
    "penolakan pun terbaca dari dasbor pemuda",
  );

  console.log("\nkeanggotaan sebagai syarat mendaftar");
  // Inilah akibat nyata dari bergabung. Tanpa ini, keanggotaan hanya daftar
  // nama: yang bergabung tidak memperoleh apa pun yang tidak dimiliki orang
  // lain, dan pembatasannya tidak pernah benar-benar diuji.
  const kegiatan = await prisma.agenda.findFirst({
    where: { khususAnggota: true, status: "TERBIT" },
    select: { id: true, slug: true, organisasiId: true },
  });

  if (!kegiatan?.organisasiId) {
    periksa(false, "ada kegiatan khusus anggota pada data contoh");
  } else {
    const halaman = await ambil(`/agenda/${kegiatan.slug}`);
    periksa(halaman.isi.includes("Khusus anggota"), "pembatasannya dinyatakan terbuka");

    // Rani anggota terverifikasi organisasi penyelenggaranya.
    const kukiRani = await masuk("pemuda@demakmuda.test");
    const bagiAnggota = await ambil(`/agenda/${kegiatan.slug}`, kukiRani);
    periksa(
      bagiAnggota.isi.includes("Ikut kegiatan ini"),
      "anggota terverifikasi ditawari mendaftar",
    );

    // Akun uji belum menjadi anggota organisasi itu.
    const bukanAnggota = await ambil(`/agenda/${kegiatan.slug}`, kukiPemuda);
    periksa(
      bukanAnggota.isi.includes("Belum dapat mendaftar") &&
        bukanAnggota.isi.includes("khusus anggota"),
      "yang bukan anggota ditolak, dengan alasan yang jelas",
    );
    periksa(
      !bukanAnggota.isi.includes("Ikut kegiatan ini"),
      "tombol daftar tidak ditawarkan kepada yang bukan anggota",
    );

    // Aturannya harus ditegakkan Server Action, bukan sekadar disembunyikan
    // dari layar — tombol yang hilang tetap dapat dilewati dengan mengirim
    // permintaannya langsung.
    //
    // Modulnya sendiri tidak dapat diimpor ke sini: ia memakai "server-only",
    // dan itu memang penjagaan yang benar. Jadi yang diperiksa keterhubungannya
    // — bahwa aturan keanggotaan tinggal di berkas yang sama yang dipanggil
    // Server Action pendaftaran, sehingga keduanya tidak mungkin berbeda.
    // Keadaan "khusus anggota tanpa penyelenggara" harus mustahil, bukan
    // sekadar tidak dibuat. Skema Zod dan Server Action hanya menjaga satu
    // jalur masuk; penyemai dan perbaikan lewat konsol tidak melewatinya.
    // Batasan di basis datalah yang menutupnya di semua jalur.
    const pembuat = await prisma.user.findFirstOrThrow({
      where: { role: "dinas" },
      select: { id: true },
    });
    let ditolak = false;
    try {
      await prisma.agenda.create({
        data: {
          judul: "Uji batasan khusus anggota",
          slug: `uji-batasan-${Date.now()}`,
          deskripsi: "Dibuat uji otomatis; seharusnya ditolak basis data.",
          mulai: new Date(),
          khususAnggota: true,
          organisasiId: null,
          pembuatId: pembuat.id,
        },
      });
    } catch {
      ditolak = true;
    }
    periksa(
      ditolak,
      "basis data menolak kegiatan khusus anggota tanpa penyelenggara",
    );

    const { readFileSync } = await import("node:fs");
    const aturan = readFileSync("src/server/pendaftaran.ts", "utf8");
    const aksi = readFileSync("src/server/aksi-pendaftaran.ts", "utf8");
    periksa(
      aturan.includes("bolehSebagaiAnggota") &&
        aturan.includes("TERVERIFIKASI"),
      "aturan keanggotaan tinggal di modul kelayakan bersama",
    );
    periksa(
      aksi.includes("periksaKelayakan") && aksi.includes("kelayakan.boleh"),
      "Server Action pendaftaran menegakkan aturan yang sama sebelum menyimpan",
    );
  }

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
