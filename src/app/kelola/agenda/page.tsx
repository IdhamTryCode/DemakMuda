import type { Metadata } from "next";
import Link from "next/link";

import { Kartu } from "@/components/sk";
import { prisma } from "@/lib/prisma";
import { tanggalPendek, waktuSaja } from "@/lib/teks";
import { wajibPeran } from "@/lib/sesi";

export const metadata: Metadata = { title: "Kelola Agenda" };

const WARNA_STATUS: Record<string, string> = {
  DRAF: "bg-sunk text-muted",
  TERBIT: "bg-accent-soft text-accent",
  ARSIP: "bg-brass-soft text-brass",
};

export default async function HalamanKelolaAgenda() {
  const sesi = await wajibPeran("organisasi", "dinas", "superadmin");
  const hanyaMilikSendiri = sesi.peran === "organisasi";

  const daftar = await prisma.agenda.findMany({
    where: hanyaMilikSendiri ? { pembuatId: sesi.user.id } : undefined,
    orderBy: { mulai: "desc" },
    take: 100,
    select: {
      id: true,
      judul: true,
      slug: true,
      status: true,
      mulai: true,
      kecamatan: { select: { nama: true } },
      pembuat: { select: { name: true } },
      _count: { select: { pendaftaran: true } },
    },
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight">Kelola Agenda</h1>
          <p className="text-sm text-muted">
            {hanyaMilikSendiri
              ? "Kegiatan yang Anda pasang."
              : "Seluruh agenda di DemakMuda."}
          </p>
        </div>
        <Link
          href="/kelola/agenda/baru"
          className="sk-btn-utama sk-pressable rounded-sk px-4 py-2.5 text-sm"
        >
          Pasang agenda
        </Link>
      </div>

      {daftar.length === 0 ? (
        <Kartu>
          <p className="text-sm text-muted">
            Belum ada agenda. Mulai dengan menekan “Pasang agenda”.
          </p>
        </Kartu>
      ) : (
        <ul className="flex flex-col gap-3">
          {daftar.map((a) => (
            <li key={a.id}>
              <Kartu className="flex flex-wrap items-center gap-4">
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <h2 className="truncate font-medium">{a.judul}</h2>
                  <span className="text-xs text-muted">
                    {tanggalPendek(a.mulai)} · {waktuSaja(a.mulai)} WIB
                    {a.kecamatan && ` · ${a.kecamatan.nama}`}
                    {!hanyaMilikSendiri && ` · ${a.pembuat.name}`}
                  </span>
                </div>

                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-medium ${WARNA_STATUS[a.status]}`}
                >
                  {a.status.toLowerCase()}
                </span>

                <div className="flex gap-2">
                  <Link
                    href={`/kelola/peserta/agenda/${a.id}`}
                    className="sk-raised sk-pressable rounded-sk px-3 py-2 text-xs font-medium text-ink-soft"
                  >
                    Peserta ({a._count.pendaftaran})
                  </Link>
                  {a.status === "TERBIT" && (
                    <Link
                      href={`/agenda/${a.slug}`}
                      className="sk-raised sk-pressable rounded-sk px-3 py-2 text-xs font-medium text-ink-soft"
                    >
                      Lihat
                    </Link>
                  )}
                  <Link
                    href={`/kelola/agenda/${a.id}`}
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
    </div>
  );
}
