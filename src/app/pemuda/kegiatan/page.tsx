import type { Metadata } from "next";
import Link from "next/link";
import type { ComponentType } from "react";

import {
  IkonDiterima,
  IkonDitolak,
  IkonHadir,
  IkonMenunggu,
} from "@/components/ikon";
import { KepalaHalaman, Kartu, PanelSunk, UbinMetrik } from "@/components/sk";
import { prisma } from "@/lib/prisma";
import { wajibPeran } from "@/lib/sesi";
import { tanggalPendek, waktuSaja } from "@/lib/teks";

export const metadata: Metadata = { title: "Kegiatan Saya" };

const LABEL: Record<string, string> = {
  MENUNGGU: "Menunggu konfirmasi",
  DITERIMA: "Diterima",
  DITOLAK: "Ditolak",
  HADIR: "Hadir",
};

const WARNA: Record<string, string> = {
  MENUNGGU: "bg-sunk text-muted",
  DITERIMA: "bg-accent-soft text-accent",
  DITOLAK: "bg-danger-soft text-danger",
  HADIR: "bg-brass-soft text-brass",
};

const IKON: Record<string, ComponentType<{ className?: string }>> = {
  MENUNGGU: IkonMenunggu,
  DITERIMA: IkonDiterima,
  DITOLAK: IkonDitolak,
  HADIR: IkonHadir,
};

export default async function HalamanKegiatanSaya() {
  const sesi = await wajibPeran("pemuda");

  const [pendaftaran, perStatus] = await Promise.all([
    prisma.pendaftaran.findMany({
      where: { userId: sesi.user.id },
      orderBy: { dibuatPada: "desc" },
      take: 100,
      select: {
        id: true,
        status: true,
        dibuatPada: true,
        agenda: { select: { judul: true, slug: true, mulai: true } },
        peluang: { select: { judul: true, slug: true, tenggat: true } },
      },
    }),
    // Jumlah per status, dihitung sungguhan — bukan panjang daftar yang dibatasi.
    prisma.pendaftaran.groupBy({
      by: ["status"],
      where: { userId: sesi.user.id },
      _count: { _all: true },
    }),
  ]);

  const jumlah = new Map(perStatus.map((r) => [r.status, r._count._all]));

  return (
    <div className="flex flex-col gap-6">
      <KepalaHalaman
        overline="Pemuda"
        judul="Kegiatan saya"
        keterangan="Seluruh kegiatan dan peluang yang Anda daftari."
        aksi={
          <Link
            href="/agenda"
            className="sk-btn-utama sk-pressable px-4 py-2.5 text-sm"
          >
            Jelajahi agenda
          </Link>
        }
      />

      <PanelSunk className="grid grid-cols-2 gap-x-4 gap-y-5 p-5 sm:grid-cols-4">
        <UbinMetrik nilai={jumlah.get("MENUNGGU") ?? 0} label="Menunggu" />
        <UbinMetrik nilai={jumlah.get("DITERIMA") ?? 0} label="Diterima" />
        <UbinMetrik nilai={jumlah.get("HADIR") ?? 0} label="Hadir" />
        <UbinMetrik nilai={jumlah.get("DITOLAK") ?? 0} label="Ditolak" />
      </PanelSunk>

      {pendaftaran.length === 0 ? (
        <Kartu className="flex flex-col gap-3">
          <p className="text-sm text-muted">
            Anda belum mendaftar kegiatan apa pun.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/agenda"
              className="sk-btn-utama sk-pressable px-4 py-2.5 text-sm"
            >
              Lihat agenda
            </Link>
            <Link
              href="/peluang"
              className="sk-kartu sk-pressable px-4 py-2.5 text-sm font-medium text-ink-soft"
            >
              Lihat peluang
            </Link>
          </div>
        </Kartu>
      ) : (
        <ul className="flex flex-col gap-3">
          {pendaftaran.map((p) => {
            const isAgenda = Boolean(p.agenda);
            const judul = p.agenda?.judul ?? p.peluang?.judul ?? "Kegiatan";
            const tautan = p.agenda
              ? `/agenda/${p.agenda.slug}`
              : `/peluang/${p.peluang?.slug}`;
            const waktu = p.agenda
              ? `${tanggalPendek(p.agenda.mulai)} · ${waktuSaja(p.agenda.mulai)} WIB`
              : p.peluang?.tenggat
                ? `Tenggat ${tanggalPendek(p.peluang.tenggat)}`
                : "Tanpa tenggat";
            const Ikon = IKON[p.status] ?? IkonMenunggu;

            return (
              <li key={p.id}>
                <Link href={tautan} className="block rounded-sk">
                  <Kartu className="sk-pressable flex flex-wrap items-center gap-4">
                    <div className="flex min-w-0 flex-1 flex-col gap-1">
                      <span className="text-xs uppercase tracking-wider text-brass">
                        {isAgenda ? "Agenda" : "Peluang"}
                      </span>
                      <h2 className="font-medium leading-snug">{judul}</h2>
                      <span className="text-xs text-muted">{waktu}</span>
                    </div>
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${WARNA[p.status]}`}
                    >
                      <Ikon className="h-3.5 w-3.5 shrink-0" />
                      {LABEL[p.status]}
                    </span>
                  </Kartu>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
