import "server-only";

import { auth } from "@/lib/auth";
import { bacaPeran, type Peran } from "@/lib/peran";
import { headers } from "next/headers";

/**
 * Penjaga izin untuk Server Action.
 *
 * Berbeda dari lib/sesi.ts yang mengalihkan halaman, fungsi di sini
 * mengembalikan nilai supaya aksi dapat membalas dengan pesan galat.
 * Setiap Server Action WAJIB memanggil ini lebih dulu — proxy tidak
 * memvalidasi sesi ke basis data dan tidak boleh diandalkan.
 */

export type Aktor = { id: string; nama: string; peran: Peran };

export async function aktorSaatIni(): Promise<Aktor | null> {
  const sesi = await auth.api.getSession({ headers: await headers() });
  if (!sesi) return null;
  return {
    id: sesi.user.id,
    nama: sesi.user.name,
    peran: bacaPeran(sesi.user.role),
  };
}

/** Memastikan pemanggil sudah masuk dan perannya termasuk yang diizinkan. */
export async function wajibAktor(...diizinkan: Peran[]): Promise<Aktor> {
  const aktor = await aktorSaatIni();
  if (!aktor) throw new GagalIzin("Anda perlu masuk lebih dulu.");
  if (!diizinkan.includes(aktor.peran)) {
    throw new GagalIzin("Peran Anda tidak berwenang melakukan tindakan ini.");
  }
  return aktor;
}

/** Peran yang boleh mengelola isi kanal publik. */
export const PENGELOLA_ISI: Peran[] = ["organisasi", "dinas", "superadmin"];

/**
 * Pemeriksaan kepemilikan, terpisah dari pemeriksaan peran.
 *
 * Dua organisasi punya peran yang sama, jadi peran saja tidak cukup: sebuah
 * organisasi hanya boleh menyunting isinya sendiri. Dinas dan superadmin
 * dikecualikan karena memang berwenang atas seluruh isi.
 */
export function bolehMengubah(aktor: Aktor, pemilikId: string): boolean {
  if (aktor.peran === "dinas" || aktor.peran === "superadmin") return true;
  return aktor.id === pemilikId;
}

export class GagalIzin extends Error {}
