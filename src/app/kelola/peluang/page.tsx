import type { Metadata } from "next";
import Link from "next/link";
import type { ComponentType } from "react";

import { IkonDiterima, IkonDiproses, IkonRiwayat } from "@/components/ikon";
import { KepalaHalaman, Kartu, PanelSunk, UbinMetrik } from "@/components/sk";
import { LABEL_JENIS } from "@/lib/peluang";
import { prisma } from "@/lib/prisma";
import { wajibPeran } from "@/lib/sesi";
import { sisaWaktu, tanggalPendek } from "@/lib/teks";

export const metadata: Metadata = { title: "Kelola Peluang" };

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

export default async function HalamanKelolaPeluang() {
  const sesi = await wajibPeran("organisasi", "dinas", "superadmin");
  const hanyaMilikSendiri = sesi.peran === "organisasi";
  const sekarang = new Date();
  const cakupan = hanyaMilikSendiri ? { pembuatId: sesi.user.id } : {};

  const [daftar, perStatus] = await Promise.all([
    prisma.peluang.findMany({
      where: cakupan,
      orderBy: { dibuatPada: "desc" },
      take: 100,
      select: {
        id: true,
        judul: true,
        slug: true,
        jenis: true,
        status: true,
        tenggat: true,
        pembuat: { select: { name: true } },
        _count: { select: { pendaftaran: true } },
      },
    }),
    prisma.peluang.groupBy({
      by: ["status"],
      where: cakupan,
      _count: { _all: true },
    }),
  ]);

  const jumlah = new Map(perStatus.map((r) => [r.status, r._count._all]));

  return (
    <div className="flex flex-col gap-6">
      <KepalaHalaman
        overline="Kelola"
        judul="Peluang"
        keterangan={
          hanyaMilikSendiri
            ? "Peluang yang Anda buka."
            : "Seluruh peluang di DemakMuda."
        }
        aksi={
          <Link
            href="/kelola/peluang/baru"
            className="sk-btn-utama sk-pressable px-4 py-2.5 text-sm"
          >
            Buka peluang
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
            Belum ada peluang. Mulai dengan menekan “Buka peluang”.
          </p>
          <Link
            href="/kelola/peluang/baru"
            className="sk-btn-utama sk-pressable px-4 py-2.5 text-sm"
          >
            Buka peluang
          </Link>
        </Kartu>
      ) : (
        <ul className="flex flex-col gap-3">
          {daftar.map((p) => {
            const Ikon = IKON_STATUS[p.status] ?? IkonDiproses;
            return (
              <li key={p.id}>
                <Kartu className="flex flex-wrap items-center gap-4">
                  <div className="flex min-w-0 flex-1 flex-col gap-1">
                    <h2 className="truncate font-medium">{p.judul}</h2>
                    <span className="text-xs text-muted">
                      {LABEL_JENIS[p.jenis]}
                      {p.tenggat
                        ? ` · tutup ${tanggalPendek(p.tenggat)} (${sisaWaktu(p.tenggat, sekarang)})`
                        : " · tanpa tenggat"}
                      {!hanyaMilikSendiri && ` · ${p.pembuat.name}`}
                    </span>
                  </div>

                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${WARNA_STATUS[p.status]}`}
                  >
                    <Ikon className="h-3.5 w-3.5 shrink-0" />
                    {LABEL_STATUS[p.status]}
                  </span>

                  <div className="flex gap-2">
                    <Link
                      href={`/kelola/peserta/peluang/${p.id}`}
                      className="sk-kartu sk-pressable px-3 py-2 text-xs font-medium text-ink-soft"
                    >
                      Peserta ({p._count.pendaftaran})
                    </Link>
                    {p.status === "TERBIT" && (
                      <Link
                        href={`/peluang/${p.slug}`}
                        className="sk-kartu sk-pressable px-3 py-2 text-xs font-medium text-ink-soft"
                      >
                        Lihat
                      </Link>
                    )}
                    <Link
                      href={`/kelola/peluang/${p.id}`}
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
