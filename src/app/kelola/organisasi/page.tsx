import type { Metadata } from "next";
import Link from "next/link";
import type { ComponentType } from "react";

import { TombolVerifikasi } from "@/app/kelola/organisasi/tombol-verifikasi";
import { IkonDitolak, IkonMenunggu, IkonTerverifikasi } from "@/components/ikon";
import { KepalaHalaman, Kartu, PanelSunk, UbinMetrik } from "@/components/sk";
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
  MENUNGGU: "Menunggu verifikasi",
  TERVERIFIKASI: "Terverifikasi",
  DITOLAK: "Ditolak",
};

const IKON_STATUS: Record<string, ComponentType<{ className?: string }>> = {
  MENUNGGU: IkonMenunggu,
  TERVERIFIKASI: IkonTerverifikasi,
  DITOLAK: IkonDitolak,
};

export default async function HalamanKelolaOrganisasi() {
  const sesi = await wajibPeran("organisasi", "dinas", "superadmin");
  const bolehVerifikasi = sesi.peran === "dinas" || sesi.peran === "superadmin";
  const cakupan = bolehVerifikasi ? {} : { pemilikId: sesi.user.id };

  const [daftar, perStatus] = await Promise.all([
    prisma.organisasi.findMany({
      where: cakupan,
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
    }),
    prisma.organisasi.groupBy({
      by: ["statusVerifikasi"],
      where: cakupan,
      _count: { _all: true },
    }),
  ]);

  const jumlah = new Map(perStatus.map((r) => [r.statusVerifikasi, r._count._all]));

  return (
    <div className="flex flex-col gap-6">
      <KepalaHalaman
        overline="Kelola"
        judul="Organisasi"
        keterangan={
          bolehVerifikasi
            ? "Seluruh organisasi, termasuk yang menunggu verifikasi."
            : "Organisasi yang Anda kelola."
        }
        aksi={
          <Link
            href="/kelola/organisasi/baru"
            className="sk-btn-utama sk-pressable px-4 py-2.5 text-sm"
          >
            Daftarkan organisasi
          </Link>
        }
      />

      <PanelSunk className="grid grid-cols-3 gap-x-4 gap-y-5 p-5">
        <UbinMetrik nilai={jumlah.get("MENUNGGU") ?? 0} label="Menunggu" />
        <UbinMetrik nilai={jumlah.get("TERVERIFIKASI") ?? 0} label="Terverifikasi" />
        <UbinMetrik nilai={jumlah.get("DITOLAK") ?? 0} label="Ditolak" />
      </PanelSunk>

      {daftar.length === 0 ? (
        <Kartu className="flex flex-col items-start gap-3">
          <p className="text-sm text-muted">
            Belum ada organisasi. Mulai dengan menekan “Daftarkan organisasi”.
          </p>
          <Link
            href="/kelola/organisasi/baru"
            className="sk-btn-utama sk-pressable px-4 py-2.5 text-sm"
          >
            Daftarkan organisasi
          </Link>
        </Kartu>
      ) : (
        <ul className="flex flex-col gap-3">
          {daftar.map((o) => {
            const Ikon = IKON_STATUS[o.statusVerifikasi] ?? IkonMenunggu;
            return (
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
                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${WARNA[o.statusVerifikasi]}`}
                  >
                    <Ikon className="h-3.5 w-3.5 shrink-0" />
                    {LABEL_STATUS[o.statusVerifikasi]}
                  </span>

                  <div className="flex flex-wrap items-center gap-2">
                    {o.statusVerifikasi === "MENUNGGU" && bolehVerifikasi && (
                      <TombolVerifikasi id={o.id} />
                    )}
                    <Link
                      href={`/kelola/organisasi/${o.id}/anggota`}
                      className="sk-kartu sk-pressable px-3 py-2 text-xs font-medium text-ink-soft"
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
                        className="sk-kartu sk-pressable px-3 py-2 text-xs font-medium text-ink-soft"
                      >
                        Lihat
                      </Link>
                    )}
                    <Link
                      href={`/kelola/organisasi/${o.id}`}
                      className="sk-kartu sk-pressable px-3 py-2 text-xs font-medium text-ink-soft"
                    >
                      Ubah
                    </Link>
                  </div>
                </Kartu>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
