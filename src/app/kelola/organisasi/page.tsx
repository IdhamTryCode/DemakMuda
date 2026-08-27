import type { Metadata } from "next";
import Link from "next/link";

import { TombolVerifikasi } from "@/app/kelola/organisasi/tombol-verifikasi";
import { Kartu } from "@/components/sk";
import { LABEL_ORGANISASI } from "@/lib/organisasi";
import { prisma } from "@/lib/prisma";
import { wajibPeran } from "@/lib/sesi";

export const metadata: Metadata = { title: "Kelola Organisasi" };

const WARNA: Record<string, string> = {
  MENUNGGU: "bg-sunk text-muted",
  TERVERIFIKASI: "bg-accent-soft text-accent",
  DITOLAK: "bg-danger-soft text-danger",
};

const LABEL_STATUS: Record<string, string> = {
  MENUNGGU: "menunggu verifikasi",
  TERVERIFIKASI: "terverifikasi",
  DITOLAK: "ditolak",
};

export default async function HalamanKelolaOrganisasi() {
  const sesi = await wajibPeran("organisasi", "dinas", "superadmin");
  const bolehVerifikasi = sesi.peran === "dinas" || sesi.peran === "superadmin";

  const daftar = await prisma.organisasi.findMany({
    where: bolehVerifikasi ? undefined : { pemilikId: sesi.user.id },
    // Yang menunggu verifikasi ditaruh paling atas supaya tidak terlewat dinas.
    orderBy: [{ statusVerifikasi: "asc" }, { dibuatPada: "desc" }],
    take: 100,
    select: {
      id: true,
      nama: true,
      slug: true,
      jenis: true,
      statusVerifikasi: true,
      kecamatan: { select: { nama: true } },
      pemilik: { select: { name: true } },
      _count: {
        select: {
          keanggotaan: { where: { status: "MENUNGGU" } },
        },
      },
    },
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight">
            Kelola Organisasi
          </h1>
          <p className="text-sm text-muted">
            {bolehVerifikasi
              ? "Seluruh organisasi, termasuk yang menunggu verifikasi."
              : "Organisasi yang Anda kelola."}
          </p>
        </div>
        <Link
          href="/kelola/organisasi/baru"
          className="sk-btn-utama sk-pressable rounded-sk px-4 py-2.5 text-sm"
        >
          Daftarkan organisasi
        </Link>
      </div>

      {daftar.length === 0 ? (
        <Kartu>
          <p className="text-sm text-muted">
            Belum ada organisasi. Mulai dengan menekan “Daftarkan organisasi”.
          </p>
        </Kartu>
      ) : (
        <ul className="flex flex-col gap-3">
          {daftar.map((o) => (
            <li key={o.id}>
              <Kartu className="flex flex-wrap items-center gap-4">
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <h2 className="truncate font-medium">{o.nama}</h2>
                  <span className="text-xs text-muted">
                    {LABEL_ORGANISASI[o.jenis]} · {o.kecamatan.nama}
                    {bolehVerifikasi && ` · ${o.pemilik.name}`}
                  </span>
                </div>

                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-medium ${WARNA[o.statusVerifikasi]}`}
                >
                  {LABEL_STATUS[o.statusVerifikasi]}
                </span>

                <div className="flex flex-wrap items-center gap-2">
                  {o.statusVerifikasi === "MENUNGGU" && bolehVerifikasi && (
                    <TombolVerifikasi id={o.id} />
                  )}
                  <Link
                    href={`/kelola/organisasi/${o.id}/anggota`}
                    className="sk-kartu sk-pressable rounded-sk px-3 py-2 text-xs font-medium text-ink-soft"
                  >
                    Anggota
                    {o._count.keanggotaan > 0 && (
                      <span className="ml-1.5 rounded-full bg-brass-soft px-1.5 text-brass">
                        {o._count.keanggotaan}
                      </span>
                    )}
                  </Link>
                  {o.statusVerifikasi === "TERVERIFIKASI" && (
                    <Link
                      href={`/direktori/${o.slug}`}
                      className="sk-kartu sk-pressable rounded-sk px-3 py-2 text-xs font-medium text-ink-soft"
                    >
                      Lihat
                    </Link>
                  )}
                  <Link
                    href={`/kelola/organisasi/${o.id}`}
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
