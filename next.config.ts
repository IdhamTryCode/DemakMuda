import type { NextConfig } from "next";

import { hostBlob } from "./src/lib/blob";

/**
 * Header keamanan (cetak biru Bagian IV lapis 5).
 *
 * Strict-Transport-Security tidak dicantumkan di sini karena Vercel sudah
 * mengirimkannya sendiri pada seluruh tanggapan.
 *
 * Kebijakan Keamanan Konten (CSP) sengaja BELUM dipasang. Ia menuntut
 * penyaluran nonce lewat proxy dan mudah merusak halaman bila dipasang
 * tergesa-gesa; keputusannya ditunda secara sadar, bukan terlewat.
 */
const HEADER_KEAMANAN = [
  // Menolak peramban menebak jenis berkas dari isinya, yang bisa mengubah
  // unggahan tak berbahaya menjadi skrip yang dijalankan.
  { key: "X-Content-Type-Options", value: "nosniff" },

  // Melarang halaman disematkan di dalam bingkai situs lain, sehingga tidak
  // dapat dipakai menjebak pengguna mengklik sesuatu yang tak terlihat.
  { key: "X-Frame-Options", value: "DENY" },

  // Alamat halaman ini tidak dibocorkan lengkap ke situs luar — penting karena
  // sebagian alamat memuat pengenal, misalnya kode sertifikat.
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },

  // Aplikasi ini tidak memerlukan kamera, mikrofon, lokasi, maupun pembayaran.
  // Menutupnya membuat permintaan izin dari skrip pihak mana pun ditolak.
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
  },
];

/**
 * Pengoptimal gambar hanya boleh mengambil dari satu inang: store blob milik
 * aplikasi ini. Memakai pola bintang untuk seluruh ranah Vercel Blob akan
 * membuat store milik siapa pun di Vercel dapat disalurkan lewat pengoptimal
 * kita — persis pintu yang ingin ditutup.
 *
 * dangerouslyAllowSVG sengaja dibiarkan mati (bawaannya memang mati): SVG
 * dapat memuat skrip, dan jenisnya pun sudah ditolak saat unggah.
 */
const INANG_BLOB = hostBlob();

// Tanpa BLOB_STORE_ID, daftar inang menjadi kosong dan SELURUH gambar unggahan
// dibalas 400 oleh pengoptimal. Kegagalan seperti itu baru ketahuan setelah
// terbit, jadi diberi peringatan yang terlihat di catatan pembangunan.
if (!INANG_BLOB) {
  console.warn(
    "[next.config] BLOB_STORE_ID kosong — gambar unggahan tidak akan tampil. " +
      "Pasang variabelnya di Vercel (Storage → Blob) dan di .env lokal.",
  );
}

const nextConfig: NextConfig = {
  images: {
    remotePatterns: INANG_BLOB
      ? [{ protocol: "https", hostname: INANG_BLOB, pathname: "/**", search: "" }]
      : [],
  },
  async headers() {
    return [{ source: "/:path*", headers: HEADER_KEAMANAN }];
  },
};

export default nextConfig;
