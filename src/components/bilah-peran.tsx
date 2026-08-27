"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { butirAktif, type ButirMenu } from "@/lib/menu";

/**
 * Bilah kedua: menu area yang sudah masuk, isinya menurut peran.
 *
 * Di ponsel ia menggulir mendatar, bukan berubah menjadi tombol hamburger.
 * Tab yang langsung dapat disentuh lebih cepat daripada laci yang harus dibuka
 * dulu, dan menunjukkan sekaligus di mana pengguna sedang berada.
 */
export function BilahPeran({ menu }: { menu: ButirMenu[] }) {
  const jalur = usePathname();
  const aktif = butirAktif(menu, jalur ?? "");

  return (
    <nav
      aria-label="Menu area Anda"
      className="mx-auto w-full max-w-[78rem] overflow-x-auto px-6"
    >
      <ul className="flex min-w-max items-center gap-1 py-1.5">
        {menu.map((m) => {
          const ini = aktif === m.href;
          return (
            <li key={m.href}>
              <Link
                href={m.href}
                aria-current={ini ? "page" : undefined}
                className={`block whitespace-nowrap rounded-full px-3.5 py-1.5 text-sm transition-colors ${
                  ini
                    ? "bg-accent text-on-accent font-medium"
                    : "text-ink-soft hover:bg-accent-soft hover:text-accent"
                }`}
              >
                {m.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
