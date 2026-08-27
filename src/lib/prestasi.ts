/**
 * Tingkat prestasi, dan artinya bagi penyaringan talenta.
 *
 * Urutan larik ini BUKAN sekadar urutan tampilan — ia urutan bobot, dari yang
 * paling sempit ke yang paling luas. Penyaringan memakainya untuk arti
 * "kabupaten ke atas". Prisma tidak menyediakan pembanding lebih-besar untuk
 * enum, jadi perbandingannya dihitung di sini menjadi daftar nilai, lalu
 * diserahkan sebagai `in`.
 */

export const TINGKAT_PRESTASI = [
  "DESA",
  "KECAMATAN",
  "KABUPATEN",
  "PROVINSI",
  "NASIONAL",
  "INTERNASIONAL",
] as const;

export type TingkatPrestasi = (typeof TINGKAT_PRESTASI)[number];

export const LABEL_TINGKAT: Record<TingkatPrestasi, string> = {
  DESA: "Desa",
  KECAMATAN: "Kecamatan",
  KABUPATEN: "Kabupaten",
  PROVINSI: "Provinsi",
  NASIONAL: "Nasional",
  INTERNASIONAL: "Internasional",
};

export function adalahTingkat(nilai: unknown): nilai is TingkatPrestasi {
  return (
    typeof nilai === "string" &&
    (TINGKAT_PRESTASI as readonly string[]).includes(nilai)
  );
}

/** Tingkat ini dan semua yang lebih tinggi darinya. */
export function tingkatKeAtas(minimal: TingkatPrestasi): TingkatPrestasi[] {
  return TINGKAT_PRESTASI.slice(TINGKAT_PRESTASI.indexOf(minimal));
}

/**
 * Tahun paling awal yang masuk akal untuk prestasi maupun pengalaman pemuda.
 *
 * Batas atasnya sengaja tidak ditulis tetap, melainkan dihitung dari tahun
 * berjalan — batas tetap akan basi diam-diam dan menolak isian yang sah.
 */
export const TAHUN_PALING_AWAL = 1980;

export function tahunMasukAkal(nilai: number, sekarang = new Date()): boolean {
  return (
    Number.isInteger(nilai) &&
    nilai >= TAHUN_PALING_AWAL &&
    nilai <= sekarang.getFullYear() + 1
  );
}
