import Link from "next/link";
import type { ReactNode } from "react";

import { GantiTema } from "@/components/ganti-tema";
import { LogoDemak } from "@/components/logo-demak";
import { Kartu } from "@/components/sk";

/** Bingkai bersama untuk halaman masuk dan daftar. */
export function BingkaiAuth({
  judul,
  keterangan,
  children,
  kaki,
}: {
  judul: string;
  keterangan: string;
  children: ReactNode;
  kaki: ReactNode;
}) {
  return (
    <>
      <header className="mx-auto flex w-full max-w-md items-center justify-between gap-4 px-6 pt-6">
        <Link href="/" className="rounded-sk">
          <LogoDemak ukuran={36} />
        </Link>
        <GantiTema />
      </header>

      <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center gap-6 px-6 py-10">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-semibold tracking-tight">{judul}</h1>
          <p className="text-sm text-muted">{keterangan}</p>
        </div>

        <Kartu>{children}</Kartu>

        <p className="text-center text-sm text-muted">{kaki}</p>
      </main>
    </>
  );
}
