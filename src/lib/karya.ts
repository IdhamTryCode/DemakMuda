/** Label untuk jenis karya, dipakai bersama daftar publik dan formulir. */

export const JENIS_KARYA = [
  "PRODUK",
  "SENI",
  "TULISAN",
  "PROYEK",
  "LAINNYA",
] as const;

export type JenisKarya = (typeof JENIS_KARYA)[number];

export const LABEL_JENIS_KARYA: Record<JenisKarya, string> = {
  PRODUK: "Produk",
  SENI: "Seni & budaya",
  TULISAN: "Tulisan",
  PROYEK: "Proyek",
  LAINNYA: "Lainnya",
};

export function adalahJenisKarya(nilai: unknown): nilai is JenisKarya {
  return (
    typeof nilai === "string" && (JENIS_KARYA as readonly string[]).includes(nilai)
  );
}
