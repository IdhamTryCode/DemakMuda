import Link from "next/link";

import { dapatkanSesi } from "@/lib/sesi";
import { jumlahBelumDibaca } from "@/server/notifikasi";

/**
 * Lonceng pemberitahuan untuk bilah dasbor.
 *
 * Dipasang di seluruh dasbor peran supaya kabar sampai di mana pun pengguna
 * berada, tidak hanya di halaman yang kebetulan berkaitan.
 *
 * Angkanya dibatasi tampil sampai "9+" — yang penting pengguna tahu ada yang
 * menunggu, bukan tahu persis berapa banyak.
 */
export async function Lonceng() {
  const sesi = await dapatkanSesi();
  if (!sesi) return null;

  const belum = await jumlahBelumDibaca(sesi.user.id);

  return (
    <Link
      href="/notifikasi"
      aria-label={
        belum > 0
          ? `Pemberitahuan, ${belum} belum dibaca`
          : "Pemberitahuan"
      }
      className="sk-raised sk-pressable relative rounded-sk px-3 py-2.5 text-sm font-medium text-ink-soft hover:text-ink"
    >
      <span aria-hidden="true">🔔</span>
      {belum > 0 && (
        <span className="absolute -right-1.5 -top-1.5 min-w-5 rounded-full bg-accent px-1.5 py-0.5 text-center text-[11px] font-semibold leading-none text-on-accent">
          {belum > 9 ? "9+" : belum}
        </span>
      )}
    </Link>
  );
}
