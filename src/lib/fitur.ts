/**
 * Saklar fitur.
 *
 * Hanya boleh dibaca dari komponen peladen. Nilainya TIDAK berawalan
 * NEXT_PUBLIC_, jadi ia tidak pernah ikut ke peramban — dan itu disengaja:
 * saklar yang ikut ke peramban akan terbaca siapa pun yang membuka sumber
 * halaman, sehingga fitur yang disembunyikan justru mengumumkan dirinya.
 *
 * Karena itu berkas ini sengaja terpisah dari src/lib/menu.ts. Modul menu ikut
 * diimpor komponen klien (bilah-peran.tsx), dan process.env di sana bernilai
 * undefined — saklar yang ditaruh di sana akan bernilai berbeda antara peladen
 * dan peramban, lalu memicu ketidakcocokan hidrasi yang sulit ditelusuri.
 */

/**
 * Panduan Karier tampil di navigasi.
 *
 * Bawaannya MATI. Halamannya sendiri tetap hidup dan dapat dibuka langsung
 * lewat alamatnya — yang disembunyikan hanya jalan masuknya dari menu dan
 * beranda, bukan fiturnya. Menyalakannya cukup dengan mengisi
 * FITUR_PANDUAN="true" lalu menerbitkan ulang.
 */
export const PANDUAN_TAMPIL = process.env.FITUR_PANDUAN === "true";
