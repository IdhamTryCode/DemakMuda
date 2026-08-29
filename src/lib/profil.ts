/**
 * Umur dan keterbukaan data profil.
 *
 * Umur dihitung dari tanggal lahir, tidak pernah disimpan sebagai kolom
 * tersendiri — kolom seperti itu akan basi diam-diam setiap tahun.
 */

export function umur(tanggalLahir: Date, sekarang: Date = new Date()): number {
  let n = sekarang.getFullYear() - tanggalLahir.getFullYear();
  const belumUlangTahun =
    sekarang.getMonth() < tanggalLahir.getMonth() ||
    (sekarang.getMonth() === tanggalLahir.getMonth() &&
      sekarang.getDate() < tanggalLahir.getDate());
  if (belumUlangTahun) n -= 1;
  return n;
}

/** Rentang usia peserta menurut pedoman Jambore Pemuda. */
export const USIA_MIN_PESERTA = 16;
export const USIA_MAKS_PESERTA = 30;

/**
 * Apa yang boleh tampil di profil publik.
 *
 * Nomor telepon tidak pernah dibuka untuk umum — itu data kontak pribadi yang
 * tidak dibutuhkan pengunjung mana pun, dan tidak ada satu pun keadaan yang
 * membuatnya pantas dipajang.
 *
 * PEMBATASAN MENURUT USIA SUDAH DICABUT
 *
 * Sebelumnya foto, usia, desa, sekolah, dan bukti piagam disembunyikan bagi
 * pengguna di bawah delapan belas tahun. Pemilik produk mencabutnya pada
 * 29 Agustus 2026 dengan alasan aplikasi ini memang ditujukan bagi pemuda
 * Demak dari segala umur, termasuk anak sekolah dasar, dan pembatasan itu
 * membuat kartu mereka tampak kosong.
 *
 * Keberatan sudah disampaikan dan ditolak, jadi keputusannya bukan kelalaian:
 * halaman /p/[slug] terbuka untuk seluruh internet tanpa perlu masuk, sehingga
 * gabungan nama, wajah, umur, desa, dan sekolah seorang anak kini dapat dibaca
 * siapa pun. UU No. 27/2022 tentang Pelindungan Data Pribadi mengatur data
 * anak secara khusus dan menuntut persetujuan orang tua atau wali.
 *
 * Fungsinya sengaja DIPERTAHANKAN meski isinya kini tetap. Ia satu-satunya
 * tempat aturan keterbukaan ditulis, dipakai kartu publik dan layar penyaringan
 * dinas; membubarkannya berarti menyebarkan keputusan ini ke banyak berkas dan
 * membuat pemulihannya jauh lebih mahal daripada mengubah satu baris di sini.
 */
export function keterbukaanProfil(tanggalLahir: Date | null) {
  return {
    tampilkanUsia: tanggalLahir !== null,
    tampilkanDesa: true,
    tampilkanSekolah: true,
    tampilkanFoto: true,
    tampilkanBukti: true,
    tampilkanTelepon: false,
  };
}
