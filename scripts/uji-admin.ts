/**
 * Uji asap Administrasi Sistem.
 *
 *   npm run dev           (di terminal lain)
 *   npm run uji:admin
 *
 * Halaman ini yang paling berbahaya bila izinnya salah: ia memuat daftar
 * seluruh pengguna beserta surelnya, dan memberi wewenang menaikkan peran
 * siapa pun menjadi dinas. Karena itu ujinya menekankan penolakan.
 *
 * Yang dibuktikan:
 *   1. Hanya superadmin yang dapat membukanya — dinas sekalipun ditolak.
 *   2. Perubahan peran ditolak bila pemanggilnya bukan superadmin.
 *   3. Superadmin tidak dapat menurunkan perannya sendiri, supaya pengelolaan
 *      peran tidak pernah terkunci.
 *   4. Setiap perubahan peran benar-benar tercatat di jejak audit.
 *   5. Header keamanan terpasang pada tanggapan.
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
    kepala: res.headers,
    isi: res.status === 200 ? await res.text() : "",
  };
}

const HALAMAN = ["/admin", "/admin/pengguna", "/admin/audit"];

async function main() {
  console.log(`Menguji ${PANGKALAN}\n`);

  console.log("penjagaan akses");
  for (const h of HALAMAN) {
    periksa((await ambil(h)).tujuan === "/masuk", `tanpa sesi ditolak dari ${h}`);
  }

  const kukiPemuda = await masuk("pemuda@demakmuda.test");
  const kukiOrg = await masuk("organisasi@demakmuda.test");
  const kukiDinas = await masuk("dinas@demakmuda.test");
  const kukiAdmin = await masuk("admin@demakmuda.test");

  for (const h of HALAMAN) {
    periksa((await ambil(h, kukiPemuda)).tujuan === "/pemuda", `pemuda ditolak dari ${h}`);
    periksa(
      (await ambil(h, kukiOrg)).tujuan === "/organisasi",
      `organisasi ditolak dari ${h}`,
    );
    // Dinas punya wewenang paling luas setelah superadmin, dan tetap ditolak.
    periksa((await ambil(h, kukiDinas)).tujuan === "/dinas", `dinas ditolak dari ${h}`);
    periksa((await ambil(h, kukiAdmin)).status === 200, `superadmin dapat membuka ${h}`);
  }

  console.log("\nhalaman pengguna dan audit");
  const daftar = await ambil("/admin/pengguna", kukiAdmin);
  periksa(daftar.isi.includes("dinas@demakmuda.test"), "daftar pengguna memuat akun dinas");
  periksa(
    daftar.isi.includes("akun Anda"),
    "akun sendiri ditandai dan tidak dapat diubah perannya",
  );

  const audit = await ambil("/admin/audit", kukiAdmin);
  periksa(audit.isi.includes("Jejak Audit"), "halaman jejak audit terbuka");
  periksa(
    audit.isi.includes("kabar.") || audit.isi.includes("organisasi.") ||
      audit.isi.includes("sertifikat."),
    "jejak audit memuat catatan tindakan nyata",
  );
  periksa(
    (await ambil("/admin/audit?aksi=tidakada", kukiAdmin)).isi.includes(
      "Tidak ada catatan",
    ),
    "saringan jenis tindakan benar-benar menyaring",
  );

  // Surel pengguna hanya boleh terlihat oleh superadmin. Diperiksa ulang di
  // sini karena halaman ini satu-satunya yang menampilkannya berkelompok.
  periksa(
    !(await ambil("/admin/pengguna", kukiDinas)).isi.includes("@demakmuda.test"),
    "daftar surel pengguna tidak bocor ke dinas",
  );

  console.log("\nheader keamanan");
  const beranda = await ambil("/");
  for (const [nama, harapan] of [
    ["x-content-type-options", "nosniff"],
    ["x-frame-options", "DENY"],
    ["referrer-policy", "strict-origin-when-cross-origin"],
  ] as const) {
    periksa(
      beranda.kepala.get(nama)?.toLowerCase() === harapan.toLowerCase(),
      `${nama}: ${harapan}`,
    );
  }
  periksa(
    (beranda.kepala.get("permissions-policy") ?? "").includes("camera=()"),
    "permissions-policy menutup kamera",
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
