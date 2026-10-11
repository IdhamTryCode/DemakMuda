import {
  BadgeCheck,
  Bell,
  Briefcase,
  CalendarDays,
  CalendarCheck,
  Check,
  ChevronDown,
  ChevronRight,
  CircleDashed,
  CircleHelp,
  CircleUser,
  Clock,
  History,
  House,
  Map,
  MapPin,
  MessageSquare,
  Newspaper,
  Palette,
  Search,
  Settings,
  ShieldCheck,
  SlidersHorizontal,
  Users,
  X,
} from "lucide-react";

/**
 * Ikon aplikasi.
 *
 * Seluruh ikon berasal dari Lucide (lisensi ISC) dan diimpor lewat berkas ini,
 * tidak pernah langsung dari `lucide-react`. Alasannya satu: ukuran dan tebal
 * garisnya ditetapkan di sini, sekali. Ikon yang diimpor langsung akan memakai
 * bawaan Lucide — 24 piksel, tebal 2 — yang terlalu berat untuk antarmuka yang
 * seluruhnya rata dan bergaris rambut.
 *
 * ATURAN PEMAKAIAN. Ikon dipasang untuk membedakan KEADAAN yang lambat dibaca
 * kalau hanya berupa tulisan: menunggu, diterima, ditolak, terverifikasi. Di
 * luar itu ia dipakai di tiga tempat yang bentuknya memang ikonik dan berulang
 * — ubin metrik, dok navigasi bawah, dan metadata kartu — karena di sana ikon
 * menolong pemindaian cepat, bukan menghias. Di luar keempat hal itu ikon TIDAK
 * dipasang: roda gigi di sebelah kata "Pengaturan" dan kalender di sebelah
 * tanggal yang sudah tertulis tidak menambah apa pun.
 *
 * Ikon tidak pernah berdiri sendiri sebagai satu-satunya keterangan. Selalu ada
 * tulisan di sebelahnya, atau `aria-label` pada tombol yang memuatnya — sebab
 * bentuk saja tidak terbaca oleh pembaca layar, dan tidak semua orang mengenali
 * arti bentuk yang sama.
 */
const UKURAN = 15;
const TEBAL = 1.75;

/** Sifat bersama seluruh ikon di bawah. `aria-hidden` disengaja: keterangannya
 *  selalu datang dari tulisan di sebelahnya, bukan dari ikonnya.
 *
 *  Ukuran bawaan 15 px cukup untuk ikon di samping teks. Ubin metrik dan dok
 *  bawah memakai ikon yang lebih besar; keduanya menimpanya lewat `className`
 *  (mis. `className="h-6 w-6"`), bukan dengan mengubah bawaan di sini. */
const SIFAT = {
  size: UKURAN,
  strokeWidth: TEBAL,
  "aria-hidden": true,
  focusable: false,
} as const;

/** Pemberitahuan. Menggantikan emoji 🔔, yang bentuknya berbeda di tiap
 *  sistem operasi dan satu-satunya benda berwarna penuh di antarmuka ini. */
export function IkonLonceng({ className }: { className?: string }) {
  return <Bell {...SIFAT} className={className} />;
}

/** Terverifikasi. Dipakai pada Kartu Talenta dan halaman organisasi. */
export function IkonTerverifikasi({ className }: { className?: string }) {
  return <BadgeCheck {...SIFAT} className={className} />;
}

/** Menunggu diperiksa — pengajuan keanggotaan dan pendaftaran kegiatan. */
export function IkonMenunggu({ className }: { className?: string }) {
  return <Clock {...SIFAT} className={className} />;
}

/** Diterima atau selesai. */
export function IkonDiterima({ className }: { className?: string }) {
  return <Check {...SIFAT} className={className} />;
}

/** Ditolak atau dibatalkan. */
export function IkonDitolak({ className }: { className?: string }) {
  return <X {...SIFAT} className={className} />;
}

/** Sedang diproses — dipakai untuk aspirasi yang sudah dibaca dinas. */
export function IkonDiproses({ className }: { className?: string }) {
  return <CircleDashed {...SIFAT} className={className} />;
}

/* ── Ikon pola berulang ────────────────────────────────────────────────────
 *
 * Pemetaan dari Material Symbols di mockup ke Lucide. Ditambahkan sekaligus
 * pada fase token karena berkas ini tidak lagi disentuh oleh fase tata letak
 * berikutnya — supaya halaman tidak perlu mengimpor `lucide-react` langsung.
 */

/** Beranda — butir dok bawah. Dari `home`. */
export function IkonBeranda({ className }: { className?: string }) {
  return <House {...SIFAT} className={className} />;
}

/** Komunitas dan organisasi — dok bawah, cip jenis, ubin metrik. Dari `groups`. */
export function IkonKomunitas({ className }: { className?: string }) {
  return <Users {...SIFAT} className={className} />;
}

/** Agenda dan tanggal kegiatan. Dari `calendar_today`. */
export function IkonAgenda({ className }: { className?: string }) {
  return <CalendarDays {...SIFAT} className={className} />;
}

/** Sertifikat dan pemeriksaan keaslian — dok bawah. Dari `verified_user`. */
export function IkonSertifikat({ className }: { className?: string }) {
  return <ShieldCheck {...SIFAT} className={className} />;
}

/** Akun dan pengguna — dok bawah, menu akun. Dari `account_circle`. */
export function IkonAkun({ className }: { className?: string }) {
  return <CircleUser {...SIFAT} className={className} />;
}

/** Lokasi, kecamatan, desa — metadata kartu. Dari `location_on`. */
export function IkonLokasi({ className }: { className?: string }) {
  return <MapPin {...SIFAT} className={className} />;
}

/** Peluang — beasiswa, lomba, magang. Dari `work_outline`. */
export function IkonPeluang({ className }: { className?: string }) {
  return <Briefcase {...SIFAT} className={className} />;
}

/** Penunjuk arah "lihat rincian". Dari `chevron_right`. */
export function IkonPanahKanan({ className }: { className?: string }) {
  return <ChevronRight {...SIFAT} className={className} />;
}

/** Membuka dan menutup bagian — tanya-jawab halaman sertifikat. Dari
 *  `expand_more`. */
export function IkonBuka({ className }: { className?: string }) {
  return <ChevronDown {...SIFAT} className={className} />;
}

/** Pertanyaan yang jawabannya bisa dibuka. Dari `help_outline`. */
export function IkonTanya({ className }: { className?: string }) {
  return <CircleHelp {...SIFAT} className={className} />;
}

/** Saringan — kepala panel saringan direktori. Dari `tune`. */
export function IkonFilter({ className }: { className?: string }) {
  return <SlidersHorizontal {...SIFAT} className={className} />;
}

/** Kabar dan pengumuman. Dari `campaign`. */
export function IkonKabar({ className }: { className?: string }) {
  return <Newspaper {...SIFAT} className={className} />;
}

/** Peta sebaran. Dari `map`. */
export function IkonPeta({ className }: { className?: string }) {
  return <Map {...SIFAT} className={className} />;
}

/** Pencarian dan penyaringan talenta. Dari `search`. */
export function IkonCari({ className }: { className?: string }) {
  return <Search {...SIFAT} className={className} />;
}

/** Aspirasi dan tanggapan. Dari `chat_bubble_outline`. */
export function IkonAspirasi({ className }: { className?: string }) {
  return <MessageSquare {...SIFAT} className={className} />;
}

/** Karya pemuda. Dari `palette`. */
export function IkonKarya({ className }: { className?: string }) {
  return <Palette {...SIFAT} className={className} />;
}

/** Administrasi sistem. Dari `settings`. */
export function IkonAdmin({ className }: { className?: string }) {
  return <Settings {...SIFAT} className={className} />;
}

/** Riwayat dan catatan — rekam jejak serta jejak audit. Dari `history`. */
export function IkonRiwayat({ className }: { className?: string }) {
  return <History {...SIFAT} className={className} />;
}

/** Sudah dihadiri — pendaftaran kegiatan yang kehadirannya tercatat. Dari
 *  `event_available`. */
export function IkonHadir({ className }: { className?: string }) {
  return <CalendarCheck {...SIFAT} className={className} />;
}
