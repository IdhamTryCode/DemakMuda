import type { NextConfig } from "next";

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

const nextConfig: NextConfig = {
  async headers() {
    return [{ source: "/:path*", headers: HEADER_KEAMANAN }];
  },
};

export default nextConfig;
