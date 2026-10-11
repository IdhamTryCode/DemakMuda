import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

/**
 * Kepingan antarmuka bersama untuk sistem kaca.
 *
 * Semua permukaan berasal dari kelas .sk-* di globals.css, tidak pernah dari
 * bayangan yang ditulis lepas di komponen. Sejak bahasa visual "Pemuda Pesisir",
 * berkas ini juga memuat kepingan pola berulang yang dipakai lintas halaman:
 * Overline, Cip, UbinMetrik, dan PanelSunk.
 */

export function Kartu({
  className = "",
  ...sisa
}: ComponentProps<"div">) {
  return <div className={`sk-kartu p-6 ${className}`} {...sisa} />;
}

export function Tombol({
  className = "",
  variasi = "utama",
  ...sisa
}: ComponentProps<"button"> & { variasi?: "utama" | "biasa" }) {
  const dasar =
    "sk-pressable inline-flex min-h-10 items-center justify-center px-4 py-2.5 text-sm rounded-full";
  const gaya =
    variasi === "utama"
      ? "sk-btn-utama"
      : "sk-kartu font-medium text-ink-soft hover:text-ink";
  return <button className={`${dasar} ${gaya} ${className}`} {...sisa} />;
}

export function Kolom({
  className = "",
  ...sisa
}: ComponentProps<"input">) {
  return (
    <input
      className={`sk-field w-full px-3.5 py-2.5 text-sm ${className}`}
      {...sisa}
    />
  );
}

export function Label({
  htmlFor,
  children,
}: {
  htmlFor: string;
  children: ReactNode;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="text-xs font-semibold uppercase tracking-wider text-muted"
    >
      {children}
    </label>
  );
}

export function Pesan({
  nada,
  children,
}: {
  nada: "galat" | "berhasil";
  children: ReactNode;
}) {
  const gaya =
    nada === "galat"
      ? "bg-danger-soft text-danger border-danger/30"
      : "bg-accent-soft text-accent border-accent/30";
  return (
    <p
      role="status"
      className={`rounded-sk border px-3.5 py-2.5 text-sm ${gaya}`}
    >
      {children}
    </p>
  );
}

/**
 * Label kecil di atas judul bagian: 11 px, kapital, huruf renggang.
 *
 * Bukan judul — pembaca layar tetap mendapatkan judul sebenarnya dari <h2> di
 * sebelahnya. Dipasang sebagai teks biasa supaya tidak menambah satu tingkat
 * pada struktur heading halaman.
 */
export function Overline({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`block text-[11px] font-semibold uppercase leading-[14px] tracking-[0.12em] text-muted ${className}`}
    >
      {children}
    </span>
  );
}

/**
 * Cip penyaring berbentuk kapsul, tinggi 40 px.
 *
 * Dua keadaan saja, mengikuti DESIGN.md: normal (permukaan putih, garis
 * `line-strong`) dan aktif (aksen penuh). Diberi `href` ia menjadi tautan —
 * saringan di aplikasi ini memang bentuknya formulir GET — dan tanpa `href`
 * ia menjadi penanda biasa.
 */
export function Cip({
  href,
  aktif = false,
  className = "",
  children,
}: {
  href?: string;
  aktif?: boolean;
  className?: string;
  children: ReactNode;
}) {
  const gaya = `sk-pressable inline-flex min-h-10 items-center rounded-full px-4 text-[13px] font-medium ${
    aktif
      ? "border border-accent bg-accent text-on-accent"
      : "border border-line-strong bg-surface text-ink-soft hover:text-ink"
  } ${className}`;

  if (href) {
    return (
      <Link
        href={href}
        aria-current={aktif ? "true" : undefined}
        className={gaya}
      >
        {children}
      </Link>
    );
  }
  return <span className={gaya}>{children}</span>;
}

/**
 * Ubin metrik: satu angka besar beserta labelnya, untuk dipasang di dalam
 * PanelSunk. Angka memakai angka tabular supaya lebarnya tidak bergoyang saat
 * nilainya berubah, dan diletakkan di ATAS label — mata menangkap bilangan
 * sebelum keterangannya sempat dibaca.
 *
 * Angka nol tetap ditampilkan: ubin yang hilang saat nilainya nol membuat
 * halaman terlihat rusak, dan "belum ada" adalah keterangan yang berguna.
 */
export function UbinMetrik({
  nilai,
  label,
  keterangan,
  ikon,
  className = "",
}: {
  nilai: ReactNode;
  label: string;
  /** Kalimat kecil di bawah label, bila ubinnya perlu keterangan tambahan. */
  keterangan?: ReactNode;
  ikon?: ReactNode;
  className?: string;
}) {
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {ikon && <span className="text-accent">{ikon}</span>}
      <span className="text-[32px] font-semibold leading-9 tabular-nums tracking-[-0.02em] text-accent">
        {nilai}
      </span>
      <span className="text-[11px] font-semibold uppercase leading-[14px] tracking-[0.12em] text-muted">
        {label}
      </span>
      {keterangan && (
        <span className="text-xs leading-snug text-muted">{keterangan}</span>
      )}
    </div>
  );
}

/**
 * Kepala halaman area masuk: Overline, judul, keterangan, dan aksi di kanan.
 *
 * Pola yang sama dipakai di seluruh halaman dasbor supaya kepalanya tidak
 * berbeda-beda bentuknya antar halaman. Aksi di kanan dibungkus flex-wrap
 * supaya tidak meluber pada lebar isi yang sempit karena sidebar.
 */
export function KepalaHalaman({
  overline,
  judul,
  keterangan,
  aksi,
}: {
  overline?: ReactNode;
  judul: ReactNode;
  keterangan?: ReactNode;
  aksi?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div className="flex min-w-0 flex-col gap-1">
        {overline && <Overline>{overline}</Overline>}
        <h1 className="text-2xl font-semibold tracking-tight">{judul}</h1>
        {keterangan && (
          <p className="max-w-prose text-sm text-muted">{keterangan}</p>
        )}
      </div>
      {aksi && (
        <div className="flex flex-wrap items-center gap-2">{aksi}</div>
      )}
    </div>
  );
}

/**
 * PanelSunk sebagai wadah ubin metrik.
 */
export function PanelSunk({ className = "", ...sisa }: ComponentProps<"div">) {
  return <div className={`sk-redup ${className}`} {...sisa} />;
}
