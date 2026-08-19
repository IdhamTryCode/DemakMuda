"use server";

import QRCode from "qrcode";

import { GagalIzin, wajibAktor } from "@/server/penjaga";

/**
 * Membuat kode QR dari alamat TOTP.
 *
 * Dikerjakan di server agar pustaka pembuat QR tidak ikut terkirim ke peramban.
 * Alamat yang dikirim memuat rahasia TOTP, tetapi rahasia itu memang baru saja
 * diberikan server kepada pengguna yang sama pada langkah sebelumnya — jadi
 * tidak ada yang baru terbuka di sini. Yang penting: pemanggilnya harus sudah
 * masuk, supaya rute ini tidak bisa dipakai orang luar membuat gambar apa pun.
 */
export async function buatQr(alamatTotp: string): Promise<string | null> {
  try {
    await wajibAktor("pemuda", "organisasi", "dinas", "superadmin");

    if (!alamatTotp.startsWith("otpauth://")) return null;

    return await QRCode.toString(alamatTotp, {
      type: "svg",
      margin: 1,
      width: 196,
      errorCorrectionLevel: "M",
    });
  } catch (e) {
    if (e instanceof GagalIzin) return null;
    console.error("[qr.buat]", e);
    return null;
  }
}
