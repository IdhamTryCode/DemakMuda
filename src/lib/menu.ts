import type { Peran } from "@/lib/peran";

/**
 * Isi kedua bilah navigasi.
 *
 * Bilah pertama sama di seluruh aplikasi. Bilah kedua menyesuaikan peran, dan
 * itulah yang menutup cacat lama: sebelum ini, sub-halaman di area yang sudah
 * masuk hanya punya satu tautan — kembali ke dasbor. Pindah antar-halaman
 * selalu butuh dua langkah, dan tidak ada yang memberi tahu sedang di mana.
 */
export type ButirMenu = { href: string; label: string };

export const MENU_PUBLIK: ButirMenu[] = [
  { href: "/kabar", label: "Kabar" },
  { href: "/agenda", label: "Agenda" },
  { href: "/peluang", label: "Peluang" },
  { href: "/karya", label: "Karya" },
  { href: "/direktori", label: "Organisasi" },
  { href: "/cek", label: "Cek sertifikat" },
];

/**
 * Menu tiap peran. Urutannya bukan urutan abjad melainkan urutan pemakaian:
 * yang paling sering dibuka diletakkan paling kiri.
 */
export const MENU_PERAN: Record<Peran, ButirMenu[]> = {
  pemuda: [
    { href: "/pemuda", label: "Beranda" },
    { href: "/pemuda/kegiatan", label: "Kegiatan saya" },
    { href: "/pemuda/karya", label: "Karya saya" },
    { href: "/pemuda/aspirasi", label: "Aspirasi saya" },
    { href: "/pemuda/profil", label: "Kartu Talenta" },
  ],
  organisasi: [
    { href: "/organisasi", label: "Beranda" },
    { href: "/kelola/kabar", label: "Kabar" },
    { href: "/kelola/agenda", label: "Agenda" },
    { href: "/kelola/peluang", label: "Peluang" },
    { href: "/kelola/organisasi", label: "Organisasi" },
  ],
  dinas: [
    { href: "/dinas", label: "Peta Potensi" },
    { href: "/kelola/aspirasi", label: "Aspirasi" },
    { href: "/kelola/karya", label: "Karya" },
    { href: "/kelola/kabar", label: "Kabar" },
    { href: "/kelola/agenda", label: "Agenda" },
    { href: "/kelola/peluang", label: "Peluang" },
    { href: "/kelola/organisasi", label: "Organisasi" },
  ],
  superadmin: [
    { href: "/admin", label: "Beranda" },
    { href: "/admin/pengguna", label: "Pengguna" },
    { href: "/admin/audit", label: "Jejak audit" },
    { href: "/dinas", label: "Peta Potensi" },
    { href: "/kelola/aspirasi", label: "Aspirasi" },
    { href: "/kelola/karya", label: "Karya" },
    { href: "/kelola/kabar", label: "Kabar" },
  ],
};

/**
 * Butir mana yang sedang aktif.
 *
 * Yang cocok paling panjang menang, supaya /pemuda/karya menandai "Karya saya"
 * dan bukan "Beranda" — keduanya sama-sama berawalan /pemuda.
 */
export function butirAktif(menu: ButirMenu[], jalur: string): string | null {
  let aktif: string | null = null;
  for (const m of menu) {
    if (jalur === m.href || jalur.startsWith(`${m.href}/`)) {
      if (!aktif || m.href.length > aktif.length) aktif = m.href;
    }
  }
  return aktif;
}
