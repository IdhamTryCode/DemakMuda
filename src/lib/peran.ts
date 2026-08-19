/**
 * Peran pengguna dan tujuan dasbornya.
 *
 * Berkas ini sengaja tidak mengimpor apa pun dari sisi server, supaya aman
 * dipakai di middleware, komponen server, maupun komponen klien.
 */

export const PERAN = ["pemuda", "organisasi", "dinas", "superadmin"] as const;

export type Peran = (typeof PERAN)[number];

export const PERAN_BAWAAN: Peran = "pemuda";

/** Tujuan setelah masuk, satu dasbor untuk tiap peran. */
export const DASBOR: Record<Peran, string> = {
  pemuda: "/pemuda",
  organisasi: "/organisasi",
  dinas: "/dinas",
  superadmin: "/admin",
};

export const LABEL_PERAN: Record<Peran, string> = {
  pemuda: "Pemuda",
  organisasi: "Pengelola Organisasi",
  dinas: "Dinas Kepemudaan dan Olahraga",
  superadmin: "Administrator Sistem",
};

/** Area pengelolaan isi, dipakai bersama oleh organisasi, dinas, dan superadmin. */
export const AWALAN_KELOLA = "/kelola";

/** Seluruh awalan alamat yang menuntut pengguna sudah masuk. */
export const AWALAN_TERLINDUNGI = [...Object.values(DASBOR), AWALAN_KELOLA];

export function adalahPeran(nilai: unknown): nilai is Peran {
  return typeof nilai === "string" && (PERAN as readonly string[]).includes(nilai);
}

/**
 * Peran yang tercatat pada akun. Akun tanpa peran diperlakukan sebagai pemuda,
 * sama seperti peran bawaan pada konfigurasi Better Auth.
 */
export function bacaPeran(nilai: unknown): Peran {
  return adalahPeran(nilai) ? nilai : PERAN_BAWAAN;
}

export function dasborUntuk(nilai: unknown): string {
  return DASBOR[bacaPeran(nilai)];
}
