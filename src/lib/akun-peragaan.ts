import type { Peran } from "@/lib/peran";

/**
 * Akun peragaan untuk tiap peran.
 *
 * Berkas ini adalah satu-satunya sumber kebenaran: dipakai penyemai
 * (prisma/seed/akun-demo.ts) untuk membuat akunnya, dan dipakai halaman masuk
 * untuk menampilkannya. Sebelumnya daftar yang sama ditulis di dua tempat, dan
 * daftar seperti itu selalu berakhir berbeda satu sama lain.
 *
 * Kata sandinya memang tertulis terbuka. Ini data contoh, bukan rahasia, dan
 * hanya diperlihatkan ketika MODE_PERAGAAN menyala — begitu mode peragaan
 * dimatikan, tombolnya hilang dari halaman masuk tanpa perlu mengubah kode.
 */
export const SANDI_PERAGAAN = "DemakMuda2026!";

export type AkunPeragaan = {
  peran: Peran;
  nama: string;
  email: string;
  /** Apa yang bisa dilakukan peran ini, untuk keterangan di halaman masuk. */
  guna: string;
};

export const AKUN_PERAGAAN: AkunPeragaan[] = [
  {
    peran: "pemuda",
    nama: "Rani Puspitasari",
    email: "pemuda@demakmuda.test",
    guna: "Kartu Talenta, daftar kegiatan, unggah karya, kirim aspirasi.",
  },
  {
    peran: "organisasi",
    nama: "Karang Taruna Bintoro",
    email: "organisasi@demakmuda.test",
    guna: "Kelola kabar, agenda, peluang, dan halaman organisasinya sendiri.",
  },
  {
    peran: "dinas",
    nama: "Petugas Dispora Demak",
    email: "dinas@demakmuda.test",
    guna: "Peta Potensi, verifikasi organisasi, sertifikat, tanggapi aspirasi.",
  },
  {
    peran: "superadmin",
    nama: "Administrator",
    email: "admin@demakmuda.test",
    guna: "Kelola pengguna dan peran, jejak audit, seluruh isi aplikasi.",
  },
];
