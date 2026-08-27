/**
 * Aturan usia dan keterbukaan data profil.
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

/**
 * Pengguna di bawah 18 tahun diperlakukan sebagai anak menurut peraturan
 * perlindungan data pribadi, sehingga profil publiknya dibatasi.
 * Tanggal lahir yang belum diisi dianggap anak — memilih yang lebih aman.
 */
export function dibawahUmur(tanggalLahir: Date | null, sekarang: Date = new Date()): boolean {
  if (!tanggalLahir) return true;
  return umur(tanggalLahir, sekarang) < 18;
}

/** Rentang usia peserta menurut pedoman Jambore Pemuda. */
export const USIA_MIN_PESERTA = 16;
export const USIA_MAKS_PESERTA = 30;

/**
 * Apa yang boleh tampil di profil publik.
 *
 * Nomor telepon tidak pernah dibuka untuk umum, berapa pun usianya — itu data
 * kontak pribadi yang tidak dibutuhkan pengunjung. Bagi pengguna di bawah 18,
 * lokasi dipersempit sampai kecamatan saja dan usia tidak ditampilkan.
 */
export function keterbukaanProfil(tanggalLahir: Date | null) {
  const anak = dibawahUmur(tanggalLahir);
  return {
    tampilkanUsia: !anak && tanggalLahir !== null,
    tampilkanDesa: !anak,
    tampilkanSekolah: !anak,
    // Foto diri mengikuti aturan yang sama dengan desa dan sekolah. Wajah
    // seorang anak di halaman yang dapat dibuka siapa saja jauh lebih berat
    // akibatnya daripada nama kecamatannya.
    tampilkanFoto: !anak,
    tampilkanTelepon: false,
  };
}
