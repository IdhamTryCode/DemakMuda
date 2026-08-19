import { z } from "zod";

/**
 * Skema pemeriksaan masukan.
 *
 * Setiap Server Action wajib melewatkan masukannya ke sini sebelum menyentuh
 * basis data. Skema yang sama juga dipakai formulir di peramban, sehingga
 * tidak ada jalur masuk data yang lolos tanpa diperiksa.
 */

const teks = (min: number, maks: number, nama: string) =>
  z
    .string()
    .trim()
    .min(min, `${nama} minimal ${min} karakter.`)
    .max(maks, `${nama} maksimal ${maks} karakter.`);

/**
 * Alamat web yang hanya boleh http atau https.
 *
 * `z.url()` saja TIDAK cukup: pemeriksaannya memakai konstruktor URL bawaan,
 * yang menganggap `javascript:alert(1)`, `data:text/html,…`, dan `vbscript:`
 * sebagai alamat yang sah. Bila nilai seperti itu tersimpan lalu dipasang
 * sebagai href atau src, ia berubah menjadi jalan masuk skrip asing.
 * Karena itu skemanya dibatasi pada dua protokol saja.
 */
const urlAman = (nama: string) =>
  z
    .string()
    .trim()
    .max(500, `${nama} maksimal 500 karakter.`)
    .refine(
      (nilai) => {
        try {
          const p = new URL(nilai).protocol.toLowerCase();
          return p === "http:" || p === "https:";
        } catch {
          return false;
        }
      },
      { message: `${nama} harus diawali http:// atau https://` },
    );

export const StatusTerbitSkema = z.enum(["DRAF", "TERBIT"]);

export const BeritaSkema = z.object({
  judul: teks(6, 160, "Judul"),
  ringkasan: teks(20, 300, "Ringkasan"),
  isi: teks(50, 20000, "Isi"),
  gambarUrl: urlAman("Alamat gambar").optional().or(z.literal("")),
  status: StatusTerbitSkema,
});

export const AgendaSkema = z
  .object({
    judul: teks(6, 160, "Judul"),
    deskripsi: teks(20, 5000, "Deskripsi"),
    lokasi: z.string().trim().max(200).optional().or(z.literal("")),
    mulai: z.coerce.date({ message: "Waktu mulai tidak sah." }),
    selesai: z.coerce.date().optional().nullable(),
    kecamatanId: z.string().trim().max(20).optional().or(z.literal("")),
    status: StatusTerbitSkema,
  })
  .refine((n) => !n.selesai || n.selesai >= n.mulai, {
    message: "Waktu selesai tidak boleh mendahului waktu mulai.",
    path: ["selesai"],
  });

export const JenisPeluangSkema = z.enum([
  "LOMBA",
  "PELATIHAN",
  "BEASISWA",
  "MAGANG",
  "LOWONGAN",
]);

export const PeluangSkema = z
  .object({
    judul: teks(6, 160, "Judul"),
    jenis: JenisPeluangSkema,
    deskripsi: teks(20, 5000, "Deskripsi"),
    tautanLuar: urlAman("Tautan").optional().or(z.literal("")),
    tenggat: z.coerce.date().optional().nullable(),
    usiaMin: z.coerce.number().int().min(0).max(99).optional().nullable(),
    usiaMaks: z.coerce.number().int().min(0).max(99).optional().nullable(),
    status: StatusTerbitSkema,
  })
  .refine((n) => !n.usiaMin || !n.usiaMaks || n.usiaMaks >= n.usiaMin, {
    message: "Usia maksimal tidak boleh lebih kecil dari usia minimal.",
    path: ["usiaMaks"],
  });

export type BeritaMasukan = z.infer<typeof BeritaSkema>;
export type AgendaMasukan = z.infer<typeof AgendaSkema>;
export type PeluangMasukan = z.infer<typeof PeluangSkema>;

/** Bentuk balasan seragam untuk seluruh Server Action pada proyek ini. */
export type HasilAksi =
  | { ok: true }
  | { ok: false; pesan: string; kolom?: Record<string, string> };

/** Mengubah galat Zod menjadi pesan per kolom yang bisa ditampilkan formulir. */
export function galatKolom(galat: z.ZodError): Record<string, string> {
  const hasil: Record<string, string> = {};
  for (const isu of galat.issues) {
    const kunci = isu.path.join(".");
    if (kunci && !hasil[kunci]) hasil[kunci] = isu.message;
  }
  return hasil;
}
