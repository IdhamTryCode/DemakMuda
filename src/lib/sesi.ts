import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
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
 * Memastikan pengguna sudah masuk DAN perannya termasuk yang diizinkan.
 * Peran yang tidak cocok dikembalikan ke dasbornya sendiri, bukan diberi
 * halaman kosong, agar tidak membocorkan keberadaan halaman ini.
 */
export async function wajibPeran(...diizinkan: Peran[]) {
  const sesi = await wajibMasuk();
  if (!diizinkan.includes(sesi.peran)) {
    redirect(dasborUntuk(sesi.peran));
  }
  return sesi;
}
