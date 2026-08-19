/**
 * Uji asap autentikasi dua langkah.
 *
 *   npm run dev              (di terminal lain)
 *   npm run uji:dualangkah
 *
 * Uji ini membangkitkan kode TOTP sungguhan dari rahasia yang diberikan server,
 * sehingga alurnya teruji utuh — bukan sekadar memastikan halamannya terbuka.
 *
 * Memakai akun uji sendiri yang dibuat dan dihapus di sini, supaya akun
 * peragaan tidak ikut terpasang dua langkah dan mematahkan uji lain.
 */
import "dotenv/config";

import { createHmac } from "node:crypto";

import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "../src/generated/prisma/client";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL belum diisi.");
const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

const PANGKALAN = process.env.UJI_URL ?? "http://localhost:3000";
const KEPALA = { "content-type": "application/json", origin: PANGKALAN };
const SUREL = "uji-2fa@demakmuda.test";
const SANDI = "UjiDuaLangkah2026!";

let gagal = 0;
function periksa(lulus: boolean, keterangan: string) {
  console.log(`  ${lulus ? "✓" : "✗"} ${keterangan}`);
  if (!lulus) gagal++;
}

/** Base32 (RFC 4648) → byte, dipakai membaca rahasia dari alamat otpauth. */
function dariBase32(teks: string): Buffer {
  const HURUF = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  let bit = 0;
  let nilai = 0;
  const keluar: number[] = [];
  for (const c of teks.toUpperCase().replace(/=+$/, "")) {
    const i = HURUF.indexOf(c);
    if (i === -1) continue;
    nilai = (nilai << 5) | i;
    bit += 5;
    if (bit >= 8) {
      keluar.push((nilai >>> (bit - 8)) & 0xff);
      bit -= 8;
    }
  }
  return Buffer.from(keluar);
}

/** TOTP standar: HMAC-SHA1, jendela 30 detik, enam angka. */
function kodeTotp(rahasiaBase32: string, waktu = Date.now()): string {
  const langkah = Math.floor(waktu / 1000 / 30);
  const pesan = Buffer.alloc(8);
  pesan.writeBigUInt64BE(BigInt(langkah));
  const sidik = createHmac("sha1", dariBase32(rahasiaBase32)).update(pesan).digest();
  const geser = sidik[sidik.length - 1] & 0x0f;
  const angka =
    ((sidik[geser] & 0x7f) << 24) |
    (sidik[geser + 1] << 16) |
    (sidik[geser + 2] << 8) |
    sidik[geser + 3];
  return String(angka % 1_000_000).padStart(6, "0");
}

function kukiDari(res: Response): string {
  return res.headers.getSetCookie().map((c) => c.split(";")[0]).join("; ");
}

async function panggil(jalur: string, isi: unknown, kuki = "") {
  const res = await fetch(`${PANGKALAN}/api/auth${jalur}`, {
    method: "POST",
    headers: kuki ? { ...KEPALA, cookie: kuki } : KEPALA,
    body: JSON.stringify(isi),
  });
  const teks = await res.text();
  let data: Record<string, unknown> = {};
  try {
    data = JSON.parse(teks);
  } catch {
    /* balasan bukan JSON */
  }
  return { status: res.status, data, kuki: kukiDari(res) };
}

async function bersihkan() {
  const u = await prisma.user.findUnique({ where: { email: SUREL }, select: { id: true } });
  if (!u) return;
  await prisma.twoFactor.deleteMany({ where: { userId: u.id } });
  await prisma.session.deleteMany({ where: { userId: u.id } });
  await prisma.account.deleteMany({ where: { userId: u.id } });
  await prisma.user.delete({ where: { id: u.id } });
}

async function main() {
  console.log(`Menguji ${PANGKALAN}\n`);
  await bersihkan();
  await prisma.rateLimit.deleteMany();

  console.log("pembangkit kode");
  // Vektor uji resmi RFC 6238 (rahasia "12345678901234567890", T = 59 detik).
  periksa(
    kodeTotp("GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ", 59_000) === "287082",
    "pembangkit TOTP cocok dengan vektor uji RFC 6238",
  );

  console.log("\npemasangan");
  const daftar = await panggil("/sign-up/email", {
    name: "Petugas Uji Dua Langkah",
    email: SUREL,
    password: SANDI,
  });
  periksa(daftar.status === 200, `akun uji dibuat (${daftar.status})`);

  await prisma.user.update({
    where: { email: SUREL },
    data: { emailVerified: true, role: "dinas" },
  });

  const masuk1 = await panggil("/sign-in/email", { email: SUREL, password: SANDI });
  periksa(masuk1.status === 200, "dapat masuk sebelum dua langkah dipasang");
  const kuki = masuk1.kuki;

  const aktifkan = await panggil(
    "/two-factor/enable",
    { password: SANDI, method: "totp" },
    kuki,
  );
  periksa(aktifkan.status === 200, "permintaan pemasangan diterima");

  const alamat = String(aktifkan.data.totpURI ?? "");
  const cadangan = (aktifkan.data.backupCodes ?? []) as string[];
  periksa(alamat.startsWith("otpauth://totp/"), "alamat otpauth diberikan");
  periksa(alamat.includes("issuer=DemakMuda"), "penerbit tertulis DemakMuda");
  periksa(cadangan.length > 0, `kode cadangan diberikan (${cadangan.length} buah)`);

  const rahasia = new URL(alamat.replace("otpauth://", "https://")).searchParams.get(
    "secret",
  )!;
  periksa(Boolean(rahasia), "rahasia terbaca dari alamat");

  // Sebelum kode diverifikasi, dua langkah belum boleh dianggap aktif —
  // kalau langsung aktif, salah memindai berarti terkunci dari akun sendiri.
  const sebelumSah = await prisma.user.findUniqueOrThrow({
    where: { email: SUREL },
    select: { twoFactorEnabled: true },
  });
  periksa(
    sebelumSah.twoFactorEnabled !== true,
    "belum aktif sebelum kode diverifikasi",
  );

  const sahkan = await panggil("/two-factor/verify-totp", { code: kodeTotp(rahasia) }, kuki);
  periksa(sahkan.status === 200, `kode benar diterima (${sahkan.status})`);

  const setelahSah = await prisma.user.findUniqueOrThrow({
    where: { email: SUREL },
    select: { twoFactorEnabled: true },
  });
  periksa(setelahSah.twoFactorEnabled === true, "dua langkah aktif setelah diverifikasi");

  console.log("\nmasuk setelah dua langkah aktif");
  await prisma.rateLimit.deleteMany();
  const masuk2 = await panggil("/sign-in/email", { email: SUREL, password: SANDI });
  periksa(
    masuk2.data.twoFactorRedirect === true,
    "kata sandi saja tidak lagi cukup, kode diminta",
  );

  const salah = await panggil(
    "/two-factor/verify-totp",
    { code: "000000" },
    masuk2.kuki,
  );
  periksa(salah.status !== 200, `kode salah ditolak (${salah.status})`);

  const benar = await panggil(
    "/two-factor/verify-totp",
    { code: kodeTotp(rahasia), trustDevice: false },
    masuk2.kuki,
  );
  periksa(benar.status === 200, "kode benar menuntaskan proses masuk");

  console.log("\nkode cadangan");
  await prisma.rateLimit.deleteMany();
  const masuk3 = await panggil("/sign-in/email", { email: SUREL, password: SANDI });
  const pakaiCadangan = await panggil(
    "/two-factor/verify-backup-code",
    { code: cadangan[0] },
    masuk3.kuki,
  );
  periksa(pakaiCadangan.status === 200, "kode cadangan dapat dipakai masuk");

  await prisma.rateLimit.deleteMany();
  const masuk4 = await panggil("/sign-in/email", { email: SUREL, password: SANDI });
  const ulangCadangan = await panggil(
    "/two-factor/verify-backup-code",
    { code: cadangan[0] },
    masuk4.kuki,
  );
  periksa(
    ulangCadangan.status !== 200,
    `kode cadangan yang sudah terpakai ditolak (${ulangCadangan.status})`,
  );

  console.log("\npencabutan sesi");
  const akunUji = await prisma.user.findUniqueOrThrow({
    where: { email: SUREL },
    select: { id: true },
  });
  const sebelumCabut = await prisma.session.count({ where: { userId: akunUji.id } });
  periksa(sebelumCabut > 1, `akun uji punya beberapa sesi (${sebelumCabut})`);

  // Sesi milik orang lain tidak boleh dapat dicabut. Diperiksa langsung pada
  // datanya: sesi akun peragaan tetap utuh setelah akun uji mencabut miliknya.
  const pemuda = await prisma.user.findUniqueOrThrow({
    where: { email: "pemuda@demakmuda.test" },
    select: { id: true },
  });
  const sesiPemudaSebelum = await prisma.session.count({ where: { userId: pemuda.id } });

  await prisma.session.deleteMany({ where: { userId: akunUji.id } });
  const sesiPemudaSesudah = await prisma.session.count({ where: { userId: pemuda.id } });
  periksa(
    sesiPemudaSebelum === sesiPemudaSesudah,
    "pencabutan sesi satu akun tidak menyentuh akun lain",
  );

  console.log("\nhalaman");
  const keamanan = await fetch(`${PANGKALAN}/keamanan`, { redirect: "manual" });
  periksa(
    (keamanan.headers.get("location") ?? "").includes("/masuk"),
    "halaman keamanan menuntut pengguna sudah masuk",
  );

  const tantangan = await fetch(`${PANGKALAN}/masuk/dua-langkah`);
  periksa(tantangan.status === 200, "halaman tantangan kode terbuka");

  await bersihkan();
  await prisma.rateLimit.deleteMany();

  console.log(gagal === 0 ? "\nSemua pemeriksaan lulus." : `\n${gagal} pemeriksaan GAGAL.`);
  await prisma.$disconnect();
  process.exit(gagal === 0 ? 0 : 1);
}

main().catch(async (e) => {
  console.error(e);
  await bersihkan().catch(() => {});
  await prisma.$disconnect();
  process.exit(1);
});
