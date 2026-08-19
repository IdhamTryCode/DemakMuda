import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { TombolAnggota } from "@/app/kelola/organisasi/[id]/anggota/tombol-anggota";
import { Kartu } from "@/components/sk";
import { LABEL_KEANGGOTAAN } from "@/lib/organisasi";
import { prisma } from "@/lib/prisma";
import { wajibPeran } from "@/lib/sesi";
import { tanggalPendek } from "@/lib/teks";
import { bolehMengubah } from "@/server/penjaga";

export const metadata: Metadata = { title: "Anggota Organisasi" };

const WARNA: Record<string, string> = {
  MENUNGGU: "bg-sunk text-muted",
  TERVERIFIKASI: "bg-accent-soft text-accent",
  DITOLAK: "bg-danger-soft text-danger",
};

export default async function HalamanAnggota({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const sesi = await wajibPeran("organisasi", "dinas", "superadmin");

  const organisasi = await prisma.organisasi.findUnique({
    where: { id },
    select: {
      nama: true,
      pemilikId: true,
      keanggotaan: {
        orderBy: [{ status: "asc" }, { dibuatPada: "asc" }],
        take: 300,
        select: {
          id: true,
          status: true,
          peran: true,
          dibuatPada: true,
          user: {
            select: {
              name: true,
              email: true,
              profil: { select: { slug: true, kecamatan: { select: { nama: true } } } },
            },
          },
        },
      },
    },
  });

  if (
    !organisasi ||
    !bolehMengubah(
      { id: sesi.user.id, nama: sesi.user.name, peran: sesi.peran },
      organisasi.pemilikId,
    )
  ) {
    notFound();
  }

  const menunggu = organisasi.keanggotaan.filter((k) => k.status === "MENUNGGU");

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-brass">
            Anggota
          </span>
          <h1 className="text-2xl font-semibold tracking-tight">{organisasi.nama}</h1>
          <p className="text-sm text-muted">
            {organisasi.keanggotaan.length} pengajuan dan anggota
            {menunggu.length > 0 && ` · ${menunggu.length} menunggu tanggapan`}
          </p>
        </div>
        <Link
          href="/kelola/organisasi"
          className="sk-raised sk-pressable rounded-sk px-4 py-2.5 text-sm font-medium text-ink-soft"
        >
          Kembali
        </Link>
      </div>

      {organisasi.keanggotaan.length === 0 ? (
        <Kartu>
          <p className="text-sm text-muted">Belum ada yang mengajukan diri.</p>
        </Kartu>
      ) : (
        <ul className="flex flex-col gap-3">
          {organisasi.keanggotaan.map((k) => (
            <li key={k.id}>
              <Kartu className="flex flex-wrap items-center gap-4">
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-medium">{k.user.name}</h2>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${WARNA[k.status]}`}
                    >
                      {k.status.toLowerCase()}
                    </span>
                    {k.status === "TERVERIFIKASI" && k.peran !== "ANGGOTA" && (
                      <span className="text-xs text-brass">
                        {LABEL_KEANGGOTAAN[k.peran]}
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-muted">
                    {k.user.email}
                    {k.user.profil?.kecamatan && ` · ${k.user.profil.kecamatan.nama}`}
                    {` · mengajukan ${tanggalPendek(k.dibuatPada)}`}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {k.user.profil?.slug && (
                    <Link
                      href={`/p/${k.user.profil.slug}`}
                      className="sk-raised sk-pressable rounded-sk px-3 py-2 text-xs font-medium text-ink-soft"
                    >
                      Kartu Talenta
                    </Link>
                  )}
                  {k.status === "MENUNGGU" && <TombolAnggota keanggotaanId={k.id} />}
                </div>
              </Kartu>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
