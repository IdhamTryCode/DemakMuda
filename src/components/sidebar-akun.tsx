"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ComponentType } from "react";

import {
  IkonAdmin,
  IkonAgenda,
  IkonAkun,
  IkonAspirasi,
  IkonBeranda,
  IkonCari,
  IkonKabar,
  IkonKarya,
  IkonKomunitas,
  IkonPanahKanan,
  IkonPeluang,
  IkonPeta,
  IkonRiwayat,
} from "@/components/ikon";
import { LogoDemak } from "@/components/logo-demak";
import { butirAktif, type ButirMenu } from "@/lib/menu";

/**
 * Sidebar area masuk, hanya untuk layar lg ke atas.
 *
 * Satu sidebar untuk keempat peran; isinya dari MENU_PERAN dan butir aktifnya
 * dari butirAktif(), sama seperti bilah peran di ponsel — bukan daftar menu
 * kedua yang ditulis tangan, yang pasti menyimpang begitu menu berubah.
 *
 * Di bawah lg ia tidak tampil sama sekali; di sana kerangkanya tetap dua bilah
 * dan dok bawah.
 */
const IKON: Record<string, ComponentType<{ className?: string }>> = {
  "/pemuda": IkonBeranda,
  "/pemuda/kegiatan": IkonAgenda,
  "/pemuda/karya": IkonKarya,
  "/pemuda/aspirasi": IkonAspirasi,
  "/pemuda/rekam-jejak": IkonRiwayat,
  "/pemuda/profil": IkonAkun,
  "/organisasi": IkonKomunitas,
  "/dinas": IkonPeta,
  "/dinas/talenta": IkonCari,
  "/admin": IkonAdmin,
  "/admin/pengguna": IkonKomunitas,
  "/admin/audit": IkonRiwayat,
  "/kelola/kabar": IkonKabar,
  "/kelola/agenda": IkonAgenda,
  "/kelola/peluang": IkonPeluang,
  "/kelola/organisasi": IkonKomunitas,
  "/kelola/aspirasi": IkonAspirasi,
  "/kelola/karya": IkonKarya,
};

export function SidebarAkun({ menu }: { menu: ButirMenu[] }) {
  const jalur = usePathname() ?? "";
  const aktif = butirAktif(menu, jalur);

  return (
    <aside className="hidden lg:sticky lg:top-0 lg:flex lg:h-dvh lg:w-60 lg:shrink-0 lg:flex-col lg:gap-6 lg:overflow-y-auto lg:border-r lg:border-line lg:bg-surface lg:px-4 lg:py-5">
      <Link href="/" className="rounded-sk px-1">
        <LogoDemak ukuran={30} ringkas />
      </Link>

      <nav aria-label="Menu area Anda" className="flex min-h-0 flex-1 flex-col gap-1">
        {menu.map((m) => {
          const Ikon = IKON[m.href] ?? IkonPanahKanan;
          const ini = aktif === m.href;
          return (
            <Link
              key={m.href}
              href={m.href}
              aria-current={ini ? "page" : undefined}
              className={`flex items-center gap-3 rounded-sk px-3 py-2 text-sm transition-colors ${
                ini
                  ? "bg-accent font-medium text-on-accent"
                  : "text-ink-soft hover:bg-sunk hover:text-ink"
              }`}
            >
              <Ikon className="h-4 w-4 shrink-0" />
              <span className="truncate">{m.label}</span>
            </Link>
          );
        })}
      </nav>

      <Link
        href="/"
        className="flex items-center gap-3 rounded-sk px-3 py-2 text-sm text-ink-soft transition-colors hover:bg-sunk hover:text-ink"
      >
        <IkonBeranda className="h-4 w-4 shrink-0" />
        <span className="truncate">Lihat portal publik</span>
      </Link>
    </aside>
  );
}
