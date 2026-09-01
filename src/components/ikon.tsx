import {
  BadgeCheck,
  Bell,
  Check,
  CircleDashed,
  Clock,
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
 * ATURAN PEMAKAIAN. Ikon hanya dipasang di tempat yang membedakan KEADAAN yang
 * lambat dibaca kalau hanya berupa tulisan: menunggu, diterima, ditolak,
 * terverifikasi. Ikon TIDAK dipasang sebagai hiasan di samping tulisan yang
 * sudah menerangkan dirinya sendiri — kalender di sebelah tanggal tidak
 * menambah apa pun, dan ikon awan, roda gigi, atau jabat tangan tidak pernah
 * dipakai sama sekali.
 *
 * Ikon tidak pernah berdiri sendiri sebagai satu-satunya keterangan. Selalu ada
 * tulisan di sebelahnya, atau `aria-label` pada tombol yang memuatnya — sebab
 * bentuk saja tidak terbaca oleh pembaca layar, dan tidak semua orang mengenali
 * arti bentuk yang sama.
 */
const UKURAN = 15;
const TEBAL = 1.75;

/** Sifat bersama seluruh ikon di bawah. `aria-hidden` disengaja: keterangannya
 *  selalu datang dari tulisan di sebelahnya, bukan dari ikonnya. */
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

/** Terverifikasi Dispora. Dipakai pada Kartu Talenta dan halaman organisasi. */
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
