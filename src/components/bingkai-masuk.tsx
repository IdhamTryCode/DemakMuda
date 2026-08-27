import Link from "next/link";
import type { ReactNode } from "react";

import { BilahPeran } from "@/components/bilah-peran";
import { GantiTema } from "@/components/ganti-tema";
import { Lonceng } from "@/components/lonceng";
import { LogoDemak } from "@/components/logo-demak";
import { TombolKeluar } from "@/components/tombol-keluar";
import { MENU_PERAN, MENU_PUBLIK } from "@/lib/menu";
import { LABEL_PERAN } from "@/lib/peran";
import { wajibMasuk } from "@/lib/sesi";

/**
 * Kerangka untuk seluruh area yang sudah masuk.
 *
 * Dua baris bilah, bukan sidebar. Sidebar memberi hasil yang sama tetapi
 * membawa kesan perkakas internal, sedangkan aplikasi ini dipakai khalayak
 * umum. Dua baris bilah adalah pola yang sama yang dipakai apple.com — bilah
 * global tipis, ditambah bilah kedua yang isinya menyesuaikan halaman.
 *
 * Keduanya dibungkus SATU wadah yang menempel, bukan dua wadah menempel yang
 * ditumpuk: menumpuk dua elemen sticky menuntut menghitung tinggi yang satu
 * untuk menggeser yang lain, dan angka itu selalu meleset begitu tinggi
 * bilahnya berubah.
 */
export async function BingkaiMasuk({ children }: { children: ReactNode }) {
  const sesi = await wajibMasuk();
  const menu = MENU_PERAN[sesi.peran];

  return (
    <>
      <div className="sticky top-0 z-40">
        <header className="sk-bilah">
          <div className="mx-auto flex w-full max-w-[78rem] flex-wrap items-center gap-x-5 gap-y-2 px-6 py-2.5">
            <Link href="/" className="rounded-sk">
              <LogoDemak ukuran={34} />
            </Link>

            {/* Menu publik disembunyikan di layar sempit — bilah kedua yang
                lebih sering dipakai, dan dua baris menu yang menggulir
                sekaligus justru membingungkan. */}
            <nav aria-label="Menu publik" className="hidden items-center gap-1 lg:flex">
              {MENU_PUBLIK.map((m) => (
                <Link
                  key={m.href}
                  href={m.href}
                  className="whitespace-nowrap rounded-full px-2.5 py-1.5 text-sm text-ink-soft transition-colors hover:bg-accent-soft hover:text-accent"
                >
                  {m.label}
                </Link>
              ))}
            </nav>

            <div className="ml-auto flex items-center gap-2">
              <span className="hidden text-xs text-muted sm:inline">
                {LABEL_PERAN[sesi.peran]}
              </span>
              <Lonceng />
              <GantiTema />
              <TombolKeluar />
            </div>
          </div>
        </header>

        <div className="sk-bilah border-t border-line">
          <BilahPeran menu={menu} />
        </div>
      </div>

      <main className="mx-auto w-full max-w-[78rem] flex-1 px-6 py-8">
        {children}
      </main>
    </>
  );
}
