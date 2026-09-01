import type { ComponentType } from "react";

import Link from "next/link";

import {
  IkonDiterima,
  IkonDitolak,
  IkonMenunggu,
} from "@/components/ikon";
import { TombolDaftar } from "@/components/tombol-daftar";
import { Kartu } from "@/components/sk";
import { dapatkanSesi } from "@/lib/sesi";
import { bacaPeran } from "@/lib/peran";
import { periksaKelayakan, pendaftaranSaya, type SasaranPendaftaran } from "@/server/pendaftaran";

const LABEL_STATUS: Record<string, string> = {
  MENUNGGU: "Menunggu konfirmasi panitia",
  DITERIMA: "Pendaftaran Anda diterima",
  DITOLAK: "Pendaftaran Anda ditolak",
  HADIR: "Kehadiran Anda sudah tercatat",
};

const IKON_STATUS: Record<string, ComponentType<{ className?: string }>> = {
  MENUNGGU: IkonMenunggu,
  DITERIMA: IkonDiterima,
  DITOLAK: IkonDitolak,
  HADIR: IkonDiterima,
};

/**
 * Panel pendaftaran pada halaman agenda dan peluang.
 *
 * Menentukan apa yang tampil, bukan apa yang diizinkan — penegakan sebenarnya
 * ada di Server Action. Keduanya memakai periksaKelayakan yang sama supaya
 * tidak pernah berbeda pendapat.
 */
export async function PanelDaftar({ sasaran }: { sasaran: SasaranPendaftaran }) {
  const sesi = await dapatkanSesi();

  if (!sesi) {
    return (
      <Kartu className="flex flex-wrap items-center justify-between gap-4">
        <p className="text-sm text-ink-soft">
          Masuk untuk mendaftar kegiatan ini.
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

  if (bacaPeran(sesi.user.role) !== "pemuda") {
    return null;
  }

  const sudah = await pendaftaranSaya(sesi.user.id, sasaran);
  if (sudah) {
    const Ikon = IKON_STATUS[sudah.status];
    return (
      <Kartu className="flex flex-col gap-3">
        <div className="flex flex-col gap-1">
          <h2 className="text-base font-semibold">Anda sudah terdaftar</h2>
          <p className="flex items-start gap-2 text-sm text-ink-soft">
            {Ikon && <Ikon className="mt-0.5 shrink-0" />}
            {LABEL_STATUS[sudah.status]}
          </p>
        </div>
        {sudah.status !== "HADIR" && (
          <TombolDaftar
            mode="batal"
            pendaftaranId={sudah.id}
            jenis={sasaran.jenis}
            id={sasaran.id}
          />
        )}
      </Kartu>
    );
  }

  const kelayakan = await periksaKelayakan(sesi.user.id, sasaran);
  if (!kelayakan.boleh) {
    return (
      <Kartu className="flex flex-col gap-1">
        <h2 className="text-base font-semibold">Belum dapat mendaftar</h2>
        <p className="text-sm text-ink-soft">{kelayakan.alasan}</p>
      </Kartu>
    );
  }

  return (
    <Kartu className="flex flex-wrap items-center justify-between gap-4">
      <div className="flex flex-col gap-1">
        <h2 className="text-base font-semibold">Ikut kegiatan ini</h2>
        <p className="text-sm text-ink-soft">
          Pendaftaran memakai data pada Kartu Talenta Anda.
        </p>
      </div>
      <TombolDaftar mode="daftar" jenis={sasaran.jenis} id={sasaran.id} />
    </Kartu>
  );
}
