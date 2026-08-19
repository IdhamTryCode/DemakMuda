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
      <header className="border-b border-line bg-surface">
        <div className="mx-auto flex w-full max-w-5xl flex-wrap items-center gap-4 px-6 py-4">
          <Link href="/" className="rounded-sk">
            <LogoDemak ukuran={40} />
          </Link>

          <nav className="order-3 flex w-full gap-1 sm:order-2 sm:w-auto sm:flex-1 sm:pl-4">
            {MENU.map((m) => {
              const sedangAktif = aktif === m.href;
              return (
                <Link
                  key={m.href}
                  href={m.href}
                  aria-current={sedangAktif ? "page" : undefined}
                  className={`rounded-sk px-3 py-2 text-sm font-medium transition-colors ${
                    sedangAktif
                      ? "bg-accent-soft text-accent"
                      : "text-ink-soft hover:text-ink"
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
                className="sk-raised sk-pressable rounded-sk px-4 py-2.5 text-sm font-medium text-ink-soft"
              >
                Dasbor
              </Link>
            ) : (
              <Link
                href="/masuk"
                className="sk-btn-utama sk-pressable rounded-sk px-4 py-2.5 text-sm"
              >
                Masuk
              </Link>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-8">{children}</main>

      <footer className="border-t border-line px-6 py-6 text-center text-xs text-muted">
        DemakMuda — Portal talenta dan peluang pemuda Kabupaten Demak
      </footer>
    </>
  );
}
