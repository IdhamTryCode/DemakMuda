"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ComponentType } from "react";

import {
  IkonAkun,
  IkonAgenda,
  IkonBeranda,
  IkonKomunitas,
  IkonSertifikat,
} from "@/components/ikon";
import { MENU_DOK } from "@/lib/menu";

/**
 * Dok navigasi bawah untuk ponsel.
 *
 * Hanya tampil di bawah 640 px; di atas itu bilah atas sudah memuat menu yang
 * sama. Butir "Akun" tidak ada di MENU_DOK karena tujuannya bergantung apakah
 * pengguna sudah masuk — dan itu hanya diketahui komponen peladen — jadi ia
 * disisipkan lewat properti.
 */
const IKON: Record<string, ComponentType<{ className?: string }>> = {
  "/": IkonBeranda,
  "/direktori": IkonKomunitas,
  "/agenda": IkonAgenda,
  "/cek": IkonSertifikat,
};

/**
 * Butir aktif. Beranda dihitung persis, bukan berawalan: hampir semua alamat
 * berawalan "/", jadi pencocokan berawalan akan menyalakan Beranda di setiap
 * halaman.
 */
function aktif(href: string, jalur: string) {
  if (href === "/") return jalur === "/";
  return jalur === href || jalur.startsWith(`${href}/`);
}

export function DokBawah({ akunHref }: { akunHref: string }) {
  const jalur = usePathname() ?? "";
  const butir = [...MENU_DOK, { href: akunHref, label: "Akun" }];

  return (
    <nav
      aria-label="Navigasi utama"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-line bg-surface/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl sm:hidden"
    >
      <ul className="flex items-stretch px-1">
        {butir.map((m) => {
          const Ikon = IKON[m.href] ?? IkonAkun;
          const ini = aktif(m.href, jalur);
          return (
            <li key={m.href} className="flex-1">
              <Link
                href={m.href}
                aria-current={ini ? "page" : undefined}
                className={`flex min-h-14 flex-col items-center justify-center gap-1 px-1 text-[11px] leading-none ${
                  ini ? "font-semibold text-accent" : "text-muted"
                }`}
              >
                <Ikon className="h-[22px] w-[22px]" />
                <span>{m.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
