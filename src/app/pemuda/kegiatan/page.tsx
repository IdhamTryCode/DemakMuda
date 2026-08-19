import type { Metadata } from "next";
import Link from "next/link";

import { Kartu } from "@/components/sk";
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

export default async function HalamanKegiatanSaya() {
  const sesi = await wajibPeran("pemuda");

  const pendaftaran = await prisma.pendaftaran.findMany({
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
  });

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-6 py-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight">Kegiatan Saya</h1>
          <p className="text-sm text-muted">
            Seluruh kegiatan dan peluang yang Anda daftari.
          </p>
        </div>
        <Link
          href="/pemuda"
          className="sk-raised sk-pressable rounded-sk px-4 py-2.5 text-sm font-medium text-ink-soft"
        >
          Dasbor
        </Link>
      </div>

      {pendaftaran.length === 0 ? (
        <Kartu className="flex flex-col gap-3">
          <p className="text-sm text-muted">
            Anda belum mendaftar kegiatan apa pun.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/agenda"
              className="sk-raised sk-pressable rounded-sk px-4 py-2.5 text-sm font-medium text-ink-soft"
            >
              Lihat agenda
            </Link>
            <Link
              href="/peluang"
              className="sk-btn-utama sk-pressable rounded-sk px-4 py-2.5 text-sm"
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
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${WARNA[p.status]}`}
                    >
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
