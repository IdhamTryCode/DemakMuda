import type { ComponentType } from "react";

import Link from "next/link";

import {
  IkonDiterima,
  IkonDitolak,
  IkonMenunggu,
} from "@/components/ikon";
import { Kartu } from "@/components/sk";
import { TombolGabung } from "@/components/tombol-gabung";
import { bacaPeran } from "@/lib/peran";
import { prisma } from "@/lib/prisma";
import { dapatkanSesi } from "@/lib/sesi";

const PESAN: Record<string, string> = {
  MENUNGGU: "Pengajuan Anda sedang diperiksa pengurus organisasi.",
  TERVERIFIKASI: "Anda tercatat sebagai anggota organisasi ini.",
  DITOLAK: "Pengajuan Anda sebelumnya tidak disetujui pengurus.",
};

// Ikon di sini membedakan tiga keadaan yang kalimatnya sama-sama panjang dan
// sama-sama abu-abu. Tulisannya tetap ada dan tetap lengkap; ikonnya hanya
// mempercepat mata menemukan yang mana.
const IKON: Record<string, ComponentType<{ className?: string }>> = {
  MENUNGGU: IkonMenunggu,
  TERVERIFIKASI: IkonDiterima,
  DITOLAK: IkonDitolak,
};

/** Panel pengajuan keanggotaan pada halaman organisasi. */
export async function PanelGabung({
  organisasiId,
  nama,
}: {
  organisasiId: string;
  nama: string;
}) {
  const sesi = await dapatkanSesi();

  if (!sesi) {
    return (
      <Kartu className="flex flex-wrap items-center justify-between gap-4">
        <p className="text-sm text-ink-soft">
          Masuk untuk mengajukan diri sebagai anggota.
        </p>
        <Link
          href="/masuk"
          className="sk-btn-utama sk-pressable rounded-sk px-5 py-2.5 text-sm"
        >
          Masuk
        </Link>
      </Kartu>
    );
  }

  if (bacaPeran(sesi.user.role) !== "pemuda") return null;

  const keanggotaan = await prisma.keanggotaan.findUnique({
    where: { organisasiId_userId: { organisasiId, userId: sesi.user.id } },
    select: { status: true },
  });

  if (keanggotaan) {
    const Ikon = IKON[keanggotaan.status];
    return (
      <Kartu className="flex flex-col gap-1">
        <h2 className="text-base font-semibold">Keanggotaan</h2>
        <p className="flex items-start gap-2 text-sm text-ink-soft">
          {Ikon && <Ikon className="mt-0.5 shrink-0" />}
          {PESAN[keanggotaan.status]}
        </p>
      </Kartu>
    );
  }

  return (
    <Kartu className="flex flex-wrap items-center justify-between gap-4">
      <div className="flex flex-col gap-1">
        <h2 className="text-base font-semibold">Ingin bergabung?</h2>
        <p className="text-sm text-ink-soft">
          Ajukan diri sebagai anggota {nama}. Pengurus yang akan menyetujui.
        </p>
      </div>
      <TombolGabung organisasiId={organisasiId} />
    </Kartu>
  );
}
