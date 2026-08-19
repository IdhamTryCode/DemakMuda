import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth, MODE_PERAGAAN, PERAN_WAJIB_2FA } from "@/lib/auth";
import { bacaPeran, dasborUntuk, type Peran } from "@/lib/peran";

/**
 * Pemeriksaan sesi di sisi server.
 *
 * PENTING: proxy (src/proxy.ts) hanya membaca kuki dan tidak memvalidasi sesi ke
 * basis data, sehingga tidak boleh menjadi penjaga satu-satunya. Setiap halaman dan
 * Server Action yang membutuhkan izin wajib memanggil salah satu fungsi di
 * bawah ini, yang selalu memuat sesi lengkap dari basis data.
 */

export async function dapatkanSesi() {
  return auth.api.getSession({ headers: await headers() });
}

/** Memastikan pengguna sudah masuk. Bila belum, dialihkan ke halaman masuk. */
export async function wajibMasuk() {
  const sesi = await dapatkanSesi();
  if (!sesi) redirect("/masuk");
  return { ...sesi, peran: bacaPeran(sesi.user.role) };
}

/**
 * Peran dinas dan superadmin memegang data seluruh pemuda, sehingga wajib
 * memakai autentikasi dua langkah. Selama belum dipasang, mereka diantar ke
 * halaman keamanan dan tidak dapat membuka apa pun yang lain.
 *
 * Di mode peragaan aturan ini dilonggarkan menjadi anjuran, karena memaksa
 * pendaftaran autentikator di depan juri hanya akan menghambat peragaan —
 * dan itu dinyatakan terbuka pada halamannya, bukan disembunyikan.
 */
function wajibDuaLangkah(sesi: { user: { role?: string | null; twoFactorEnabled?: boolean | null } }) {
  if (MODE_PERAGAAN) return false;
  const peran = bacaPeran(sesi.user.role);
  return PERAN_WAJIB_2FA.includes(peran) && sesi.user.twoFactorEnabled !== true;
}

/**
 * Memastikan pengguna sudah masuk DAN perannya termasuk yang diizinkan.
 * Peran yang tidak cocok dikembalikan ke dasbornya sendiri, bukan diberi
 * halaman kosong, agar tidak membocorkan keberadaan halaman ini.
 */
export async function wajibPeran(...diizinkan: Peran[]) {
  const sesi = await wajibMasuk();
  if (!diizinkan.includes(sesi.peran)) {
    redirect(dasborUntuk(sesi.peran));
  }
  if (wajibDuaLangkah(sesi)) {
    redirect("/keamanan");
  }
  return sesi;
}

/** Benar bila pengguna ini semestinya memasang dua langkah tetapi belum. */
export function perluPasangDuaLangkah(sesi: {
  user: { role?: string | null; twoFactorEnabled?: boolean | null };
}): boolean {
  const peran = bacaPeran(sesi.user.role);
  return PERAN_WAJIB_2FA.includes(peran) && sesi.user.twoFactorEnabled !== true;
}
