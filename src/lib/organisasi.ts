/** Label jenis organisasi kepemudaan, dipakai bersama direktori dan formulir. */

export const JENIS_ORGANISASI = [
  "OKP",
  "KARANG_TARUNA",
  "SANGGAR",
  "KOMUNITAS",
  "LAINNYA",
] as const;

export type JenisOrganisasi = (typeof JENIS_ORGANISASI)[number];

export const LABEL_ORGANISASI: Record<JenisOrganisasi, string> = {
  OKP: "Organisasi Kepemudaan",
  KARANG_TARUNA: "Karang Taruna",
  SANGGAR: "Sanggar",
  KOMUNITAS: "Komunitas",
  LAINNYA: "Lainnya",
};

export function adalahJenisOrganisasi(nilai: unknown): nilai is JenisOrganisasi {
  return (
    typeof nilai === "string" &&
    (JENIS_ORGANISASI as readonly string[]).includes(nilai)
  );
}

export const LABEL_KEANGGOTAAN: Record<string, string> = {
  ANGGOTA: "Anggota",
  PENGURUS: "Pengurus",
  KETUA: "Ketua",
};
