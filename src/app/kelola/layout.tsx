import Link from "next/link";

import { GantiTema } from "@/components/ganti-tema";
import { LogoDemak } from "@/components/logo-demak";
import { dasborUntuk } from "@/lib/peran";
import { wajibPeran } from "@/lib/sesi";

/**
 * Area pengelolaan isi. Penjagaan peran dilakukan di sini sekali untuk seluruh
 * halaman di bawahnya, dan diulang lagi di tiap Server Action lewat
 * server/penjaga.ts — halaman dan aksi dijaga terpisah, tidak saling
 * mengandalkan.
 */
export default async function TataLetakKelola({
  children,
}: LayoutProps<"/kelola">) {
  const sesi = await wajibPeran("organisasi", "dinas", "superadmin");

  return (
    <>
      <header className="border-b border-line bg-surface">
        <div className="mx-auto flex w-full max-w-4xl flex-wrap items-center gap-4 px-6 py-4">
          <Link href="/" className="rounded-sk">
            <LogoDemak ukuran={40} />
          </Link>
          <nav className="flex gap-1 sm:pl-4">
            <Link
              href="/kelola/kabar"
              className="rounded-sk px-3 py-2 text-sm font-medium text-ink-soft hover:text-ink"
            >
              Kabar
            </Link>
          </nav>
          <div className="ml-auto flex items-center gap-3">
            <GantiTema />
            <Link
              href={dasborUntuk(sesi.peran)}
              className="sk-raised sk-pressable rounded-sk px-4 py-2.5 text-sm font-medium text-ink-soft"
            >
              Dasbor
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-8">{children}</main>
    </>
  );
}
