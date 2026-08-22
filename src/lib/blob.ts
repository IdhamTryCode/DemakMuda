/**
 * Aturan penyimpanan berkas (Vercel Blob).
 *
 * Berkas ini sengaja tidak mengimpor apa pun, supaya aman dipakai bersama oleh
 * next.config.ts, skema Zod, penangan rute, dan komponen klien.
 *
 * Store-nya bersifat publik: gambar karya dan logo organisasi memang tampil di
 * halaman yang dapat dibuka tanpa masuk. Konsekuensinya tegas — siapa pun yang
 * memegang alamatnya dapat membukanya. Karena itu store ini hanya untuk berkas
 * yang memang ditujukan bagi umum, tidak pernah untuk dokumen pribadi, dan
 * nama berkasnya selalu diberi akhiran acak agar tidak dapat ditebak.
 */

const AWALAN_ID = "store_";
const RANAH_BLOB = ".public.blob.vercel-storage.com";

/**
 * Nama inang publik store blob, diturunkan dari BLOB_STORE_ID.
 *
 * Alamatnya berbentuk https://<id tanpa awalan, huruf kecil>.public.blob…
 * Ini dibuktikan dengan mengunggah berkas sungguhan, bukan diterka dari
 * dokumentasi.
 */
export function hostBlob(): string {
  const id = process.env.BLOB_STORE_ID ?? "";
  const bersih = id.startsWith(AWALAN_ID) ? id.slice(AWALAN_ID.length) : id;
  return bersih ? `${bersih.toLowerCase()}${RANAH_BLOB}` : "";
}

/**
 * Benar bila alamat ini sungguh menunjuk berkas di store milik kita.
 *
 * Pemeriksaannya bertingkat, dan tingkatannya penting:
 *
 *   1. Wajib https dan berakhiran ranah Vercel Blob. Berlaku di mana pun,
 *      termasuk bila BLOB_STORE_ID kebetulan tidak terbaca.
 *   2. Bila nama inang kita diketahui — dan di sisi peladen selalu diketahui —
 *      nama inangnya harus cocok persis.
 *
 * Tingkat kedua yang sebenarnya menutup celah: tanpa itu, store blob milik
 * siapa pun di Vercel dapat dipakai sebagai sumber gambar aplikasi ini.
 */
export function alamatBlobSah(nilai: string): boolean {
  let alamat: URL;
  try {
    alamat = new URL(nilai);
  } catch {
    return false;
  }
  if (alamat.protocol !== "https:") return false;
  if (!alamat.hostname.endsWith(RANAH_BLOB)) return false;

  const kita = hostBlob();
  if (kita && alamat.hostname !== kita) return false;

  return true;
}

/** Jenis berkas yang diterima. SVG TIDAK termasuk: ia dapat memuat skrip. */
export const JENIS_GAMBAR = ["image/jpeg", "image/png", "image/webp"] as const;

/** Batas ukuran satu gambar. Cukup untuk foto ponsel yang sudah dimampatkan. */
export const BATAS_GAMBAR = 2 * 1024 * 1024;

/** Ruang penyimpanan, satu per jenis isi. Menentukan siapa yang boleh mengisi. */
export const RUANG_BLOB = ["karya", "organisasi", "berita"] as const;
export type RuangBlob = (typeof RUANG_BLOB)[number];

/**
 * Bentuk jalur yang diterima peladen sebelum menerbitkan token unggah.
 *
 * Nama berkas datang dari peramban, jadi tidak dipercaya: hanya huruf kecil,
 * angka, dan tanda hubung, di bawah salah satu ruang yang dikenal, dengan
 * akhiran yang sepadan dengan jenis berkas yang diizinkan.
 */
export const POLA_JALUR_BLOB =
  /^(karya|organisasi|berita)\/[a-z0-9][a-z0-9-]{0,59}\.(jpg|jpeg|png|webp)$/;

/** Mengubah nama berkas dari peramban menjadi jalur yang lolos POLA_JALUR_BLOB. */
export function jalurBlob(ruang: RuangBlob, namaBerkas: string): string {
  const titik = namaBerkas.lastIndexOf(".");
  const dasar = titik > 0 ? namaBerkas.slice(0, titik) : namaBerkas;
  const akhiran = (titik > 0 ? namaBerkas.slice(titik + 1) : "").toLowerCase();

  const bersih =
    dasar
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || "berkas";

  const sah = ["jpg", "jpeg", "png", "webp"].includes(akhiran) ? akhiran : "jpg";
  return `${ruang}/${bersih}.${sah}`;
}
