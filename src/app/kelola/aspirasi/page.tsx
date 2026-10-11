import type { Metadata } from "next";
import Link from "next/link";
import type { ComponentType } from "react";

import {
  IkonDiterima,
  IkonDitolak,
  IkonDiproses,
  IkonMenunggu,
} from "@/components/ikon";
import {
  Cip,
  KepalaHalaman,
  Kartu,
  Overline,
  PanelSunk,
  UbinMetrik,
} from "@/components/sk";
import {
  LABEL_STATUS_ASPIRASI,
  STATUS_ASPIRASI,
  WARNA_STATUS_ASPIRASI,
  adalahStatusAspirasi,
  type StatusAspirasi,
} from "@/lib/aspirasi";
import { prisma } from "@/lib/prisma";
import { wajibPeran } from "@/lib/sesi";
import { cuplikan, tanggalPendek } from "@/lib/teks";

export const metadata: Metadata = { title: "Ruang Aspirasi" };

const IKON_STATUS: Record<StatusAspirasi, ComponentType<{ className?: string }>> = {
  BARU: IkonMenunggu,
  DIPROSES: IkonDiproses,
  SELESAI: IkonDiterima,
  DITOLAK: IkonDitolak,
};

export default async function HalamanKelolaAspirasi({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  // Tata letak /kelola juga membuka pintu bagi peran organisasi, jadi
  // penjagaan di sini bukan pengulangan yang sia-sia: aspirasi ditujukan
  // kepada dinas, dan organisasi tidak berhak membacanya.
  await wajibPeran("dinas", "superadmin");

  const { status } = await searchParams;
  const saring = adalahStatusAspirasi(status) ? status : undefined;

  const [daftar, perStatus] = await Promise.all([
    prisma.aspirasi.findMany({
      where: saring ? { status: saring } : undefined,
      // Yang belum ditanggapi naik lebih dulu, lalu yang terbaru.
      orderBy: [{ status: "asc" }, { dibuatPada: "desc" }],
      take: 100,
      select: {
        id: true,
        judul: true,
        isi: true,
        status: true,
        dibuatPada: true,
        pengirim: { select: { name: true } },
      },
    }),
    prisma.aspirasi.groupBy({ by: ["status"], _count: { _all: true } }),
  ]);

  const jumlah = new Map(perStatus.map((r) => [r.status, r._count._all]));

  return (
    <div className="flex flex-col gap-6">
      <KepalaHalaman
        overline="Kelola"
        judul="Ruang Aspirasi"
        keterangan="Usulan yang masuk dari pemuda Demak. Isinya tidak pernah tampil di halaman publik."
      />

      <PanelSunk className="grid grid-cols-2 gap-x-4 gap-y-5 p-5 sm:grid-cols-4">
        <UbinMetrik nilai={jumlah.get("BARU") ?? 0} label="Baru masuk" />
        <UbinMetrik nilai={jumlah.get("DIPROSES") ?? 0} label="Sedang diproses" />
        <UbinMetrik nilai={jumlah.get("SELESAI") ?? 0} label="Selesai" />
        <UbinMetrik nilai={jumlah.get("DITOLAK") ?? 0} label="Tidak dilanjutkan" />
      </PanelSunk>

      <div className="flex flex-wrap items-center gap-2">
        <Overline>Status</Overline>
        <Cip href="/kelola/aspirasi" aktif={!saring}>
          Semua
        </Cip>
        {STATUS_ASPIRASI.map((s) => (
          <Cip key={s} href={`/kelola/aspirasi?status=${s}`} aktif={saring === s}>
            {LABEL_STATUS_ASPIRASI[s]}
          </Cip>
        ))}
      </div>

      {daftar.length === 0 ? (
        <Kartu>
          <p className="text-sm text-muted">
            {saring
              ? `Tidak ada aspirasi berstatus ${LABEL_STATUS_ASPIRASI[saring]}.`
              : "Belum ada aspirasi yang masuk."}
          </p>
        </Kartu>
      ) : (
        <ul className="flex flex-col gap-3">
          {daftar.map((a) => {
            const Ikon = IKON_STATUS[a.status];
            return (
              <li key={a.id}>
                <Link href={`/kelola/aspirasi/${a.id}`} className="block rounded-sk">
                  <Kartu className="sk-pressable flex flex-col gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${WARNA_STATUS_ASPIRASI[a.status]}`}
                      >
                        <Ikon className="h-3.5 w-3.5 shrink-0" />
                        {LABEL_STATUS_ASPIRASI[a.status]}
                      </span>
                      <span className="text-xs uppercase tracking-wider text-brass">
                        {tanggalPendek(a.dibuatPada)}
                      </span>
                    </div>
                    <h2 className="font-medium leading-snug">{a.judul}</h2>
                    <p className="max-w-prose text-sm text-ink-soft">
                      {cuplikan(a.isi, 160)}
                    </p>
                    <span className="text-xs text-muted">
                      Dari {a.pengirim.name}
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
