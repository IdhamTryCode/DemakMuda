/** Label dan warna untuk jenis peluang, dipakai bersama daftar dan formulir. */

export const JENIS_PELUANG = [
  "LOMBA",
  "PELATIHAN",
  "BEASISWA",
  "MAGANG",
  "LOWONGAN",
] as const;

export type JenisPeluang = (typeof JENIS_PELUANG)[number];

export const LABEL_JENIS: Record<JenisPeluang, string> = {
  LOMBA: "Lomba",
  PELATIHAN: "Pelatihan",
  BEASISWA: "Beasiswa",
  MAGANG: "Magang",
  LOWONGAN: "Lowongan kerja",
};

export function adalahJenis(nilai: unknown): nilai is JenisPeluang {
  return (
    typeof nilai === "string" && (JENIS_PELUANG as readonly string[]).includes(nilai)
  );
}

/**
 * Aturan "peluang masih terbuka", satu-satunya sumbernya.
 *
 * Sebelum ini syarat di bawah ditulis ulang di enam halaman. Komentar di
 * beranda bahkan sudah memperingatkan bahayanya sendiri — "dua halaman yang
 * menghitung hal sama dengan cara berbeda akan menampilkan angka yang berbeda
 * pula" — tetapi peringatan itu tidak dapat menegakkan apa pun. Salah satu dari
 * keenamnya memang sudah menyimpang: halaman Latar memakai jamnya sendiri,
 * bukan jam yang sudah dihitung halaman itu.
 *
 * `sekarang` diminta sebagai argumen dengan alasan yang sama seperti pada
 * Agenda: satu halaman memanggilnya beberapa kali di dalam satu Promise.all,
 * dan hitungannya tidak boleh terbelah di antara dua jam yang berbeda.
 */
export function peluangMasihTerbuka(sekarang: Date) {
  // Peluang tanpa tenggat selalu dianggap masih terbuka.
  return { OR: [{ tenggat: null }, { tenggat: { gte: sekarang } }] };
}

/** Kebalikannya: peluang yang tenggatnya sudah lewat. Hanya dipakai Papan
 *  Peluang, tetapi ditaruh di sini supaya kedua sisinya tidak pernah terpisah
 *  — mengubah salah satunya tanpa yang lain akan menyisakan peluang yang tidak
 *  masuk ke daftar mana pun. */
export function peluangSudahTutup(sekarang: Date) {
  return { tenggat: { lt: sekarang } };
}
