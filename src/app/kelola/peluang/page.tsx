import type { Metadata } from "next";
import Link from "next/link";

import { Kartu } from "@/components/sk";
import { LABEL_JENIS } from "@/lib/peluang";
import { prisma } from "@/lib/prisma";
import { wajibPeran } from "@/lib/sesi";
import { sisaWaktu, tanggalPendek } from "@/lib/teks";

export const metadata: Metadata = { title: "Kelola Peluang" };

const WARNA_STATUS: Record<string, string> = {
  DRAF: "bg-sunk text-muted",
  TERBIT: "bg-accent-soft text-accent",
  ARSIP: "bg-brass-soft text-brass",
};

export default async function HalamanKelolaPeluang() {
  const sesi = await wajibPeran("organisasi", "dinas", "superadmin");
  const hanyaMilikSendiri = sesi.peran === "organisasi";
  const sekarang = new Date();

  const daftar = await prisma.peluang.findMany({
    where: hanyaMilikSendiri ? { pembuatId: sesi.user.id } : undefined,
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
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight">Kelola Peluang</h1>
          <p className="text-sm text-muted">
            {hanyaMilikSendiri
              ? "Peluang yang Anda buka."
              : "Seluruh peluang di DemakMuda."}
          </p>
        </div>
        <Link
          href="/kelola/peluang/baru"
          className="sk-btn-utama sk-pressable rounded-sk px-4 py-2.5 text-sm"
        >
          Buka peluang
        </Link>
      </div>

      {daftar.length === 0 ? (
        <Kartu>
          <p className="text-sm text-muted">
            Belum ada peluang. Mulai dengan menekan “Buka peluang”.
          </p>
        </Kartu>
      ) : (
        <ul className="flex flex-col gap-3">
          {daftar.map((p) => (
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
                  className={`rounded-full px-2.5 py-1 text-xs font-medium ${WARNA_STATUS[p.status]}`}
                >
                  {p.status.toLowerCase()}
                </span>

                <div className="flex gap-2">
                  <Link
                    href={`/kelola/peserta/peluang/${p.id}`}
                    className="sk-kartu sk-pressable rounded-sk px-3 py-2 text-xs font-medium text-ink-soft"
                  >
                    Peserta ({p._count.pendaftaran})
                  </Link>
                  {p.status === "TERBIT" && (
                    <Link
                      href={`/peluang/${p.slug}`}
                      className="sk-kartu sk-pressable rounded-sk px-3 py-2 text-xs font-medium text-ink-soft"
                    >
                      Lihat
                    </Link>
                  )}
                  <Link
                    href={`/kelola/peluang/${p.id}`}
                    className="sk-kartu sk-pressable rounded-sk px-3 py-2 text-xs font-medium text-ink-soft"
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
