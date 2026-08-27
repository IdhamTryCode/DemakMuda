import type { ComponentProps, ReactNode } from "react";

/**
 * Kepingan antarmuka bersama untuk sistem permukaan skeuomorfisme.
 * Semua kedalaman berasal dari kelas .sk-* di globals.css, tidak pernah
 * dari bayangan yang ditulis lepas di komponen.
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
  const dasar = "sk-pressable px-4 py-2.5 text-sm rounded-sk";
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
