import Link from "next/link";
import type { ReactNode } from "react";

import { BilahAtas } from "@/components/bilah-atas";


/** Bingkai untuk seluruh halaman yang dapat dibuka tanpa masuk. */
export async function BingkaiPublik({
  aktif,
  children,
}: {
  aktif?: string;
  children: ReactNode;
}) {
  return (
    <>
      <div className="sticky top-0 z-40">
        <BilahAtas aktif={aktif} />
      </div>

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
