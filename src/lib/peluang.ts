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
