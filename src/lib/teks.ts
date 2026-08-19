/** Pembantu teks yang dipakai bersama di sisi server maupun klien. */

export function keSlug(nama: string): string {
  return nama
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

/**
 * Menambahkan akhiran acak pendek supaya dua judul yang sama tidak bentrok.
 * Dipakai saat membuat kabar, agenda, dan peluang baru.
 */
export function slugUnik(nama: string): string {
  const dasar = keSlug(nama) || "tanpa-judul";
  const akhiran = Math.random().toString(36).slice(2, 7);
  return `${dasar}-${akhiran}`;
}

const ZONA = "Asia/Jakarta";

export function tanggalPanjang(nilai: Date): string {
  return new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: ZONA,
  }).format(nilai);
}

export function tanggalPendek(nilai: Date): string {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: ZONA,
  }).format(nilai);
}

export function waktuSaja(nilai: Date): string {
  return new Intl.DateTimeFormat("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: ZONA,
  }).format(nilai);
}

/** Nama bulan dan tahun, dipakai sebagai pemisah kelompok pada daftar agenda. */
export function bulanTahun(nilai: Date): string {
  return new Intl.DateTimeFormat("id-ID", {
    month: "long",
    year: "numeric",
    timeZone: ZONA,
  }).format(nilai);
}

/**
 * Mengubah Date menjadi nilai untuk <input type="datetime-local">.
 * Kolom itu hanya menerima "YYYY-MM-DDTHH:mm" dalam waktu setempat.
 */
export function keNilaiWaktuLokal(nilai: Date): string {
  const p = (n: number) => String(n).padStart(2, "0");
  return (
    `${nilai.getFullYear()}-${p(nilai.getMonth() + 1)}-${p(nilai.getDate())}` +
    `T${p(nilai.getHours())}:${p(nilai.getMinutes())}`
  );
}

/** "3 hari lagi", "hari ini", atau "sudah lewat" untuk tenggat pendaftaran. */
export function sisaWaktu(tenggat: Date, sekarang: Date): string {
  const hari = Math.ceil(
    (tenggat.getTime() - sekarang.getTime()) / (1000 * 60 * 60 * 24),
  );
  if (hari < 0) return "sudah lewat";
  if (hari === 0) return "hari ini";
  if (hari === 1) return "besok";
  return `${hari} hari lagi`;
}
