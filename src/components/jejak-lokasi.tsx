"use client";

import { usePathname } from "next/navigation";

import { butirAktif, type ButirMenu } from "@/lib/menu";

/**
 * Jejak lokasi untuk strip area masuk.
 *
 * Menyebut bagian mana yang sedang dibuka, diambil dari menu peran yang sama
 * dengan sidebar — bukan daftar kedua yang ditulis tangan. Bila tidak ada butir
 * yang cocok, tidak ada yang ditampilkan: lebih baik kosong daripada menebak.
 */
export function JejakLokasi({ menu }: { menu: ButirMenu[] }) {
  const jalur = usePathname() ?? "";
  const aktif = butirAktif(menu, jalur);
  const label = menu.find((m) => m.href === aktif)?.label;

  if (!label) return null;

  return <span className="truncate text-sm font-medium text-ink">{label}</span>;
}
