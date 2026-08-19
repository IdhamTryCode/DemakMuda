import { randomInt } from "node:crypto";

/**
 * Kode publik sertifikat.
 *
 * Dibuat untuk dibaca dan diketik ulang manusia, karena orang akan menyalinnya
 * dari lembar cetak: huruf yang mudah tertukar (0, O, 1, I, L) dibuang, dan
 * kodenya dikelompokkan per empat karakter.
 *
 * Dibangkitkan dengan randomInt dari modul crypto, bukan Math.random, supaya
 * kode berikutnya tidak dapat ditebak dari kode yang sudah terbit.
 */

const HURUF = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
const PANJANG = 8;

export function buatKodeSertifikat(): string {
  let kode = "";
  for (let i = 0; i < PANJANG; i++) {
    kode += HURUF[randomInt(HURUF.length)];
  }
  return `DM-${kode.slice(0, 4)}-${kode.slice(4)}`;
}

/**
 * Menormalkan kode yang diketik pengguna: huruf kecil, spasi, dan tanda hubung
 * yang hilang atau berlebih tetap diterima. Kesalahan mengetik tidak boleh
 * membuat sertifikat yang sah terlihat palsu.
 */
export function rapikanKode(masukan: string): string {
  const bersih = masukan
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .replace(/^DM/, "");
  if (bersih.length !== PANJANG) return masukan.trim().toUpperCase();
  return `DM-${bersih.slice(0, 4)}-${bersih.slice(4)}`;
}
