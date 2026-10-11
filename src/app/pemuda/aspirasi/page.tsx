import type { Metadata } from "next";
import Link from "next/link";
import type { ComponentType } from "react";

import {
  IkonDiterima,
  IkonDitolak,
  IkonDiproses,
  IkonMenunggu,
} from "@/components/ikon";
import { Kartu, Overline, PanelSunk, UbinMetrik } from "@/components/sk";
import {
  LABEL_STATUS_ASPIRASI,
  WARNA_STATUS_ASPIRASI,
  type StatusAspirasi,
} from "@/lib/aspirasi";
import { prisma } from "@/lib/prisma";
import { wajibPeran } from "@/lib/sesi";
import { tanggalPendek } from "@/lib/teks";

export const metadata: Metadata = { title: "Aspirasi Saya" };

/**
 * Ikon tiap status, supaya keadaannya terbaca tanpa bergantung pada warna saja.
 * Bentuknya sengaja berbeda satu sama lain — jam, lingkaran berputar, centang,
 * silang — bukan sekadar warna yang berbeda.
 */
const IKON_STATUS: Record<StatusAspirasi, ComponentType<{ className?: string }>> = {
  BARU: IkonMenunggu,
  DIPROSES: IkonDiproses,
  SELESAI: IkonDiterima,
  DITOLAK: IkonDitolak,
};

export default async function HalamanAspirasiSaya() {
  const sesi = await wajibPeran("pemuda");

  const [daftar, perStatus] = await Promise.all([
    prisma.aspirasi.findMany({
      where: { pengirimId: sesi.user.id },
      orderBy: { dibuatPada: "desc" },
      take: 100,
      select: {
        id: true,
        judul: true,
        isi: true,
        status: true,
        tanggapan: true,
        ditanggapiPada: true,
        dibuatPada: true,
      },
    }),
    // Jumlah per status, dihitung sungguhan dari basis data.
    prisma.aspirasi.groupBy({
      by: ["status"],
      where: { pengirimId: sesi.user.id },
      _count: { _all: true },
    }),
  ]);

  const jumlah = new Map(perStatus.map((r) => [r.status, r._count._all]));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex min-w-0 flex-col gap-1">
          <Overline>Aspirasi</Overline>
          <h1 className="text-2xl font-semibold tracking-tight">Aspirasi saya</h1>
          <p className="max-w-prose text-sm text-muted">
            Usulan yang Anda sampaikan kepada Dispora Demak beserta
            tanggapannya. Halaman ini hanya dapat dibuka oleh Anda dan dinas.
          </p>
        </div>
        <Link
          href="/pemuda/aspirasi/baru"
          className="sk-btn-utama sk-pressable px-4 py-2.5 text-sm"
        >
          Kirim aspirasi
        </Link>
      </div>

      <PanelSunk className="grid grid-cols-2 gap-x-4 gap-y-5 p-5 sm:grid-cols-4">
        <UbinMetrik nilai={jumlah.get("BARU") ?? 0} label="Baru masuk" />
        <UbinMetrik nilai={jumlah.get("DIPROSES") ?? 0} label="Sedang diproses" />
        <UbinMetrik nilai={jumlah.get("SELESAI") ?? 0} label="Selesai" />
        <UbinMetrik nilai={jumlah.get("DITOLAK") ?? 0} label="Belum dapat" />
      </PanelSunk>

      {daftar.length === 0 ? (
        <Kartu className="flex flex-col items-start gap-3">
          <p className="text-sm text-muted">
            Belum ada aspirasi yang Anda kirim. Punya usulan untuk kepemudaan
            Demak? Sampaikan lewat tombol di atas.
          </p>
        </Kartu>
      ) : (
        <ul className="flex flex-col gap-4">
          {daftar.map((a) => {
            const Ikon = IKON_STATUS[a.status];
            return (
              <li key={a.id}>
                <Kartu className="flex flex-col gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${WARNA_STATUS_ASPIRASI[a.status]}`}
                    >
                      <Ikon className="h-3.5 w-3.5 shrink-0" />
                      {LABEL_STATUS_ASPIRASI[a.status]}
                    </span>
                    <span className="text-xs uppercase tracking-wider text-brass">
                      Dikirim {tanggalPendek(a.dibuatPada)}
                    </span>
                  </div>

                  <h2 className="text-base font-semibold leading-snug">
                    {a.judul}
                  </h2>
                  <p className="whitespace-pre-wrap text-sm text-ink-soft">
                    {a.isi}
                  </p>

                  {a.tanggapan ? (
                    <div className="sk-redup flex flex-col gap-1.5 p-4">
                      <span className="text-xs font-semibold uppercase tracking-wider text-muted">
                        Tanggapan dinas
                        {a.ditanggapiPada && ` · ${tanggalPendek(a.ditanggapiPada)}`}
                      </span>
                      <p className="whitespace-pre-wrap text-sm text-ink-soft">
                        {a.tanggapan}
                      </p>
                    </div>
                  ) : (
                    <p className="text-xs text-muted">
                      Belum ditanggapi. Anda akan melihat tanggapannya di sini.
                    </p>
                  )}
                </Kartu>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
