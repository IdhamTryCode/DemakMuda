import type { Metadata } from "next";
import Link from "next/link";

import { Kartu } from "@/components/sk";
import { LABEL_JENIS_KARYA } from "@/lib/karya";
import { prisma } from "@/lib/prisma";
import { wajibPeran } from "@/lib/sesi";
import { tanggalPendek } from "@/lib/teks";

export const metadata: Metadata = { title: "Karya Saya" };

const WARNA_STATUS: Record<string, string> = {
  DRAF: "bg-sunk text-muted",
  TERBIT: "bg-accent-soft text-accent",
  ARSIP: "bg-brass-soft text-brass",
};

export default async function HalamanKaryaSaya() {
  const sesi = await wajibPeran("pemuda");

  // Penyaringan pemilik dilakukan di kueri. Tidak ada cabang tampilan yang
  // menyembunyikan karya orang lain — karya orang lain memang tidak diambil.
  const daftar = await prisma.karya.findMany({
    where: { pemilikId: sesi.user.id },
    orderBy: { dibuatPada: "desc" },
    take: 100,
    select: {
      id: true,
      judul: true,
      slug: true,
      jenis: true,
      status: true,
      dibuatPada: true,
    },
  });

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 px-6 py-8">
      <Link href="/pemuda" className="text-sm text-accent underline underline-offset-2">
        ← Dasbor
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight">Karya saya</h1>
          <p className="text-sm text-muted">
            Karya yang Anda pamerkan di Ruang Karya DemakMuda.
          </p>
        </div>
        <Link
          href="/pemuda/karya/baru"
          className="sk-btn-utama sk-pressable rounded-sk px-4 py-2.5 text-sm"
        >
          Tambah karya
        </Link>
      </div>

      {daftar.length === 0 ? (
        <Kartu>
          <p className="text-sm text-muted">
            Belum ada karya. Mulai dengan menekan “Tambah karya” — satu karya
            saja sudah membuat kartu talenta Anda jauh lebih meyakinkan.
          </p>
        </Kartu>
      ) : (
        <ul className="flex flex-col gap-3">
          {daftar.map((k) => (
            <li key={k.id}>
              <Kartu className="flex flex-wrap items-center gap-4">
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <h2 className="truncate font-medium">{k.judul}</h2>
                  <span className="text-xs text-muted">
                    {LABEL_JENIS_KARYA[k.jenis]} · {tanggalPendek(k.dibuatPada)}
                  </span>
                </div>

                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-medium ${WARNA_STATUS[k.status]}`}
                >
                  {k.status.toLowerCase()}
                </span>

                <div className="flex gap-2">
                  {k.status === "TERBIT" && (
                    <Link
                      href={`/karya/${k.slug}`}
                      className="sk-raised sk-pressable rounded-sk px-3 py-2 text-xs font-medium text-ink-soft"
                    >
                      Lihat
                    </Link>
                  )}
                  <Link
                    href={`/pemuda/karya/${k.id}`}
                    className="sk-raised sk-pressable rounded-sk px-3 py-2 text-xs font-medium text-ink-soft"
                  >
                    Ubah
                  </Link>
                </div>
              </Kartu>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
