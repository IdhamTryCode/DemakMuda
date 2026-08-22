import { z } from "zod";

import { alamatBlobSah } from "@/lib/blob";

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

/**
 * Alamat berkas hasil unggahan.
 *
 * Berbeda dari urlAman() yang menerima alamat http(s) mana pun, skema ini
 * hanya menerima berkas yang benar-benar berada di penyimpanan milik aplikasi
 * ini. Bedanya bukan soal kerapian: kolom yang isinya dipasang sebagai sumber
 * gambar dan menerima alamat sembarang membuat aplikasi ini menjadi perantara
 * permintaan ke peladen mana pun yang ditulis pengguna.
 *
 * Karena batasnya sempit dan pasti, gambarnya kini aman dirender sungguhan —
 * sesuatu yang sebelumnya sengaja tidak dilakukan.
 */
const urlUnggahan = (nama: string) =>
  z
    .string()
    .trim()
    .max(500, `${nama} maksimal 500 karakter.`)
    .refine(alamatBlobSah, {
      message: `${nama} harus berupa berkas yang diunggah lewat DemakMuda.`,
    });

export const StatusTerbitSkema = z.enum(["DRAF", "TERBIT"]);

export const BeritaSkema = z.object({
  judul: teks(6, 160, "Judul"),
  ringkasan: teks(20, 300, "Ringkasan"),
  isi: teks(50, 20000, "Isi"),
  gambarUrl: urlUnggahan("Gambar kabar").optional().or(z.literal("")),
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

export const OrganisasiSkema = z.object({
  nama: teks(4, 120, "Nama organisasi"),
  jenis: z.enum([
    "OKP",
    "KARANG_TARUNA",
    "SANGGAR",
    "KLUB_OLAHRAGA",
    "KOMUNITAS",
    "LAINNYA",
  ]),
  deskripsi: z
    .string()
    .trim()
    .max(3000, "Deskripsi maksimal 3000 karakter.")
    .optional()
    .or(z.literal("")),
  kontak: z
    .string()
    .trim()
    .max(120, "Kontak maksimal 120 karakter.")
    .optional()
    .or(z.literal("")),
  logoUrl: urlUnggahan("Logo organisasi").optional().or(z.literal("")),
  kecamatanId: z.string().trim().min(1, "Kecamatan wajib dipilih.").max(20),
  desaId: z.string().trim().max(30).optional().or(z.literal("")),
});

export type OrganisasiMasukan = z.infer<typeof OrganisasiSkema>;

export const ProfilSkema = z.object({
  nama: teks(3, 120, "Nama"),
  bio: z.string().trim().max(500, "Bio maksimal 500 karakter.").optional().or(z.literal("")),
  telepon: z
    .string()
    .trim()
    .max(20, "Nomor telepon maksimal 20 karakter.")
    .regex(/^[0-9+\-\s()]*$/, "Nomor telepon hanya boleh angka dan tanda + - ( ).")
    .optional()
    .or(z.literal("")),
  tanggalLahir: z.coerce.date().optional().nullable(),
  jenisKelamin: z.enum(["LAKI_LAKI", "PEREMPUAN"]).optional().or(z.literal("")),
  kecamatanId: z.string().trim().max(20).optional().or(z.literal("")),
  desaId: z.string().trim().max(30).optional().or(z.literal("")),
  sekolahId: z.string().trim().max(40).optional().or(z.literal("")),
}).refine(
  (n) => {
    if (!n.tanggalLahir) return true;
    const t = n.tanggalLahir.getTime();
    const seratusTahun = 100 * 365.25 * 24 * 60 * 60 * 1000;
    return t < Date.now() && t > Date.now() - seratusTahun;
  },
  { message: "Tanggal lahir tidak masuk akal.", path: ["tanggalLahir"] },
);

export const JenisKaryaSkema = z.enum([
  "PRODUK",
  "SENI",
  "TULISAN",
  "PROYEK",
  "LAINNYA",
]);

export const KaryaSkema = z.object({
  judul: teks(6, 160, "Judul"),
  jenis: JenisKaryaSkema,
  deskripsi: teks(30, 10000, "Cerita karya"),
  gambarUrl: urlUnggahan("Gambar karya").optional().or(z.literal("")),
  tautanLuar: urlAman("Tautan karya").optional().or(z.literal("")),
  status: StatusTerbitSkema,
});

export const AspirasiSkema = z.object({
  judul: teks(10, 160, "Judul aspirasi"),
  isi: teks(40, 5000, "Isi aspirasi"),
});

export const StatusAspirasiSkema = z.enum([
  "BARU",
  "DIPROSES",
  "SELESAI",
  "DITOLAK",
]);

/**
 * Tanggapan dinas atas sebuah aspirasi.
 *
 * Statusnya boleh berubah, tetapi tidak boleh berubah diam-diam: begitu
 * aspirasi digeser dari BARU, pengirimnya berhak tahu alasannya. Karena itu
 * tanggapan menjadi wajib pada setiap status selain BARU.
 */
export const TanggapanSkema = z
  .object({
    status: StatusAspirasiSkema,
    tanggapan: z
      .string()
      .trim()
      .max(5000, "Tanggapan maksimal 5000 karakter.")
      .optional()
      .or(z.literal("")),
  })
  .refine((n) => n.status === "BARU" || (n.tanggapan?.length ?? 0) >= 10, {
    message: "Tulis tanggapan minimal 10 karakter sebelum mengubah status.",
    path: ["tanggapan"],
  });

export type ProfilMasukan = z.infer<typeof ProfilSkema>;

export type BeritaMasukan = z.infer<typeof BeritaSkema>;
export type AgendaMasukan = z.infer<typeof AgendaSkema>;
export type PeluangMasukan = z.infer<typeof PeluangSkema>;
export type KaryaMasukan = z.infer<typeof KaryaSkema>;
export type AspirasiMasukan = z.infer<typeof AspirasiSkema>;

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
