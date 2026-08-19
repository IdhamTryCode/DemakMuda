/**
 * Penyusun berkas CSV untuk unduhan daftar peserta.
 *
 * Dua hal yang ditangani di sini:
 *
 * 1. Pengutipan biasa — koma, tanda kutip, dan baris baru di dalam nilai.
 *
 * 2. Penyuntikan rumus. Sel yang diawali `=`, `+`, `-`, `@`, tab, atau carriage
 *    return akan diperlakukan Excel dan LibreOffice sebagai rumus, bukan teks.
 *    Nama peserta yang ditulis `=HYPERLINK(...)` bisa berubah menjadi perintah
 *    yang berjalan di komputer panitia saat berkas dibuka. Karena isi CSV ini
 *    berasal dari isian pengguna, setiap sel berisiko diawali tanda kutip
 *    tunggal supaya tetap dibaca sebagai teks.
 */

const AWALAN_BERBAHAYA = ["=", "+", "-", "@", "\t", "\r"];

function amankanSel(nilai: unknown): string {
  const teks = nilai === null || nilai === undefined ? "" : String(nilai);
  const aman = AWALAN_BERBAHAYA.some((a) => teks.startsWith(a)) ? `'${teks}` : teks;
  return `"${aman.replace(/"/g, '""')}"`;
}

export function susunCsv(kepala: string[], baris: unknown[][]): string {
  const isi = [kepala, ...baris].map((b) => b.map(amankanSel).join(",")).join("\r\n");
  // Byte Order Mark supaya Excel di Windows membaca UTF-8 dengan benar,
  // tanpa ini nama berhuruf beraksen tampil rusak.
  return `﻿${isi}\r\n`;
}

/** Nama berkas yang aman dipakai di header Content-Disposition. */
export function namaBerkasAman(dasar: string): string {
  return (
    dasar
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 60) || "daftar-peserta"
  );
}
