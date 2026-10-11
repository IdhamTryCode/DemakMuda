import type { Metadata } from "next";
import Link from "next/link";
import type { ComponentType } from "react";

import { IkonDiterima, IkonDiproses, IkonRiwayat } from "@/components/ikon";
import { KepalaHalaman, Kartu, PanelSunk, UbinMetrik } from "@/components/sk";
import { LABEL_JENIS_KARYA } from "@/lib/karya";
import { prisma } from "@/lib/prisma";
import { wajibPeran } from "@/lib/sesi";
import { tanggalPendek } from "@/lib/teks";

export const metadata: Metadata = { title: "Karya Saya" };

const LABEL_STATUS: Record<string, string> = {
  DRAF: "Draf",
  TERBIT: "Terbit",
  ARSIP: "Arsip",
};

const WARNA_STATUS: Record<string, string> = {
  DRAF: "bg-sunk text-muted",
  TERBIT: "bg-accent-soft text-accent",
  ARSIP: "bg-brass-soft text-brass",
};

const IKON_STATUS: Record<string, ComponentType<{ className?: string }>> = {
  DRAF: IkonDiproses,
  TERBIT: IkonDiterima,
  ARSIP: IkonRiwayat,
};

export default async function HalamanKaryaSaya() {
  const sesi = await wajibPeran("pemuda");

  // Penyaringan pemilik dilakukan di kueri. Tidak ada cabang tampilan yang
  // menyembunyikan karya orang lain — karya orang lain memang tidak diambil.
  const [daftar, perStatus] = await Promise.all([
    prisma.karya.findMany({
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
    }),
    prisma.karya.groupBy({
      by: ["status"],
      where: { pemilikId: sesi.user.id },
      _count: { _all: true },
    }),
  ]);

  const jumlah = new Map(perStatus.map((r) => [r.status, r._count._all]));

  return (
    <div className="flex flex-col gap-6">
      <KepalaHalaman
        overline="Pemuda"
        judul="Karya saya"
        keterangan="Karya yang Anda pamerkan di Ruang Karya DemakMuda."
        aksi={
          <Link
            href="/pemuda/karya/baru"
            className="sk-btn-utama sk-pressable px-4 py-2.5 text-sm"
          >
            Tambah karya
          </Link>
        }
      />

      <PanelSunk className="grid grid-cols-3 gap-x-4 gap-y-5 p-5">
        <UbinMetrik nilai={jumlah.get("DRAF") ?? 0} label="Draf" />
        <UbinMetrik nilai={jumlah.get("TERBIT") ?? 0} label="Terbit" />
        <UbinMetrik nilai={jumlah.get("ARSIP") ?? 0} label="Arsip" />
      </PanelSunk>

      {daftar.length === 0 ? (
        <Kartu className="flex flex-col items-start gap-3">
          <p className="text-sm text-muted">
            Belum ada karya. Mulai dengan menekan “Tambah karya” — satu karya
            saja sudah membuat kartu talenta Anda jauh lebih meyakinkan.
          </p>
          <Link
            href="/pemuda/karya/baru"
            className="sk-btn-utama sk-pressable px-4 py-2.5 text-sm"
          >
            Tambah karya
          </Link>
        </Kartu>
      ) : (
        <ul className="flex flex-col gap-3">
          {daftar.map((k) => {
            const Ikon = IKON_STATUS[k.status] ?? IkonDiproses;
            return (
              <li key={k.id}>
                <Kartu className="flex flex-wrap items-center gap-4">
                  <div className="flex min-w-0 flex-1 flex-col gap-1">
                    <h2 className="truncate font-medium">{k.judul}</h2>
                    <span className="text-xs text-muted">
                      {LABEL_JENIS_KARYA[k.jenis]} · {tanggalPendek(k.dibuatPada)}
                    </span>
                  </div>

                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${WARNA_STATUS[k.status]}`}
                  >
                    <Ikon className="h-3.5 w-3.5 shrink-0" />
                    {LABEL_STATUS[k.status]}
                  </span>

                  <div className="flex gap-2">
                    {k.status === "TERBIT" && (
                      <Link
                        href={`/karya/${k.slug}`}
                        className="sk-kartu sk-pressable px-3 py-2 text-xs font-medium text-ink-soft"
                      >
                        Lihat
                      </Link>
                    )}
                    <Link
                      href={`/pemuda/karya/${k.id}`}
                      className="sk-kartu sk-pressable px-3 py-2 text-xs font-medium text-ink-soft"
                    >
                      Ubah
                    </Link>
                  </div>
                </Kartu>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
