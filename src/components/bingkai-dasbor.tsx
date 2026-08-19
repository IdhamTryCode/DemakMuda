import type { ReactNode } from "react";

import { GantiTema } from "@/components/ganti-tema";
import { LogoDemak } from "@/components/logo-demak";
import { Kartu } from "@/components/sk";
import { TombolKeluar } from "@/components/tombol-keluar";
import { LABEL_PERAN, type Peran } from "@/lib/peran";

export function BingkaiDasbor({
  peran,
  nama,
  children,
}: {
  peran: Peran;
  nama: string;
  children?: ReactNode;
}) {
  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 px-6 py-8">
      <nav className="flex items-center justify-between gap-4">
        <LogoDemak ukuran={36} />
        <div className="flex items-center gap-3">
          <GantiTema />
          <TombolKeluar />
        </div>
      </nav>

      <header className="sk-raised flex flex-wrap items-center gap-4 px-6 py-5">
        <div className="flex flex-col gap-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-brass">
            {LABEL_PERAN[peran]}
          </span>
          <h1 className="text-2xl font-semibold tracking-tight">{nama}</h1>
        </div>
      </header>

      <Kartu>
        <div className="flex flex-col gap-3">
          <h2 className="text-lg font-semibold">Dasbor sedang dibangun</h2>
          <p className="max-w-prose text-sm text-ink-soft">
            Halaman ini membuktikan alur masuk dan pengarahan peran sudah
            berjalan. Isinya menyusul sesuai urutan pada cetak biru teknis.
          </p>
          {children}
        </div>
      </Kartu>
    </main>
  );
}
