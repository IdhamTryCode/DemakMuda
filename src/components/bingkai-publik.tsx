import Link from "next/link";
import type { ReactNode } from "react";

import { GantiTema } from "@/components/ganti-tema";
import { LogoDemak } from "@/components/logo-demak";
import { dasborUntuk } from "@/lib/peran";
import { dapatkanSesi } from "@/lib/sesi";

const MENU = [
  { href: "/kabar", label: "Kabar" },
  { href: "/agenda", label: "Agenda" },
  { href: "/peluang", label: "Peluang" },
  { href: "/karya", label: "Karya" },
  { href: "/direktori", label: "Organisasi" },
  { href: "/cek", label: "Cek sertifikat" },
];

/** Bingkai untuk seluruh halaman yang dapat dibuka tanpa masuk. */
export async function BingkaiPublik({
  aktif,
  children,
}: {
  aktif?: string;
  children: ReactNode;
}) {
  const sesi = await dapatkanSesi();

  return (
    <>
      <header className="sk-bilah sticky top-0 z-40">
        <div className="mx-auto flex w-full max-w-[78rem] flex-wrap items-center gap-x-5 gap-y-2 px-6 py-2.5">
          <Link href="/" className="rounded-sk">
            <LogoDemak ukuran={34} />
          </Link>

          {/* flex-wrap wajib: enam menu tidak muat pada lebar ponsel, dan tanpa
              ini seluruh halaman publik meluber ke samping. whitespace-nowrap
              menjaga satu label tidak patah di tengah kata. */}
          <nav className="order-3 -mx-6 flex w-[calc(100%+3rem)] gap-1 overflow-x-auto px-6 pb-1 sm:order-2 sm:mx-0 sm:w-auto sm:flex-1 sm:overflow-visible sm:px-0 sm:pb-0">
            {MENU.map((m) => {
              const sedangAktif = aktif === m.href;
              return (
                <Link
                  key={m.href}
                  href={m.href}
                  aria-current={sedangAktif ? "page" : undefined}
                  className={`whitespace-nowrap rounded-full px-3 py-1.5 text-sm transition-colors ${
                    sedangAktif
                      ? "bg-accent text-on-accent font-medium"
                      : "text-ink-soft hover:bg-accent-soft hover:text-accent"
                  }`}
                >
                  {m.label}
                </Link>
              );
            })}
          </nav>

          <div className="order-2 ml-auto flex items-center gap-3 sm:order-3 sm:ml-0">
            <GantiTema />
            {sesi ? (
              <Link
                href={dasborUntuk(sesi.user.role)}
                className="sk-kartu sk-pressable rounded-full px-4 py-2 text-sm font-medium text-ink-soft"
              >
                Dasbor
              </Link>
            ) : (
              <Link
                href="/masuk"
                className="sk-btn-utama sk-pressable px-4 py-2 text-sm"
              >
                Masuk
              </Link>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[78rem] flex-1 px-6 py-8">{children}</main>

      <footer className="flex flex-col items-center gap-2 border-t border-line px-6 py-6 text-center text-xs text-muted">
        <span>DemakMuda — Portal talenta dan peluang pemuda Kabupaten Demak</span>
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
          <Link href="/latar" className="text-accent underline underline-offset-2">
            Latar dan tujuan
          </Link>
          <Link href="/privasi" className="text-accent underline underline-offset-2">
            Perlindungan data
          </Link>
        </div>
      </footer>
    </>
  );
}
