import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { FormOrganisasi } from "@/app/kelola/form-organisasi";
import { Kartu } from "@/components/sk";
import { prisma } from "@/lib/prisma";
import { wajibPeran } from "@/lib/sesi";
import { ubahOrganisasi } from "@/server/aksi-organisasi";
import { bolehMengubah } from "@/server/penjaga";

export const metadata: Metadata = { title: "Ubah Organisasi" };

export default async function HalamanUbahOrganisasi({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const sesi = await wajibPeran("organisasi", "dinas", "superadmin");

  const [organisasi, kecamatan, desa] = await Promise.all([
    prisma.organisasi.findUnique({
      where: { id },
      select: {
        id: true,
        nama: true,
        jenis: true,
        deskripsi: true,
        kontak: true,
        logoUrl: true,
        kecamatanId: true,
        desaId: true,
        pemilikId: true,
      },
    }),
    prisma.kecamatan.findMany({ orderBy: { nama: "asc" }, select: { id: true, nama: true } }),
    prisma.desa.findMany({
      orderBy: { nama: "asc" },
      select: { id: true, nama: true, kecamatanId: true },
    }),
  ]);

  if (
    !organisasi ||
    !bolehMengubah(
      { id: sesi.user.id, nama: sesi.user.name, peran: sesi.peran },
      organisasi.pemilikId,
    )
  ) {
    notFound();
  }

  async function simpan(data: FormData) {
    "use server";
    return ubahOrganisasi(id, data);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold tracking-tight">Ubah organisasi</h1>
        <Link
          href={`/kelola/organisasi/${id}/anggota`}
          className="sk-raised sk-pressable rounded-sk px-4 py-2.5 text-sm font-medium text-ink-soft"
        >
          Kelola anggota
        </Link>
      </div>

      <Kartu>
        <FormOrganisasi
          kecamatan={kecamatan}
          desa={desa}
          simpan={simpan}
          awal={{
            nama: organisasi.nama,
            jenis: organisasi.jenis,
            deskripsi: organisasi.deskripsi ?? "",
            kontak: organisasi.kontak ?? "",
            logoUrl: organisasi.logoUrl ?? "",
            kecamatanId: organisasi.kecamatanId,
            desaId: organisasi.desaId ?? "",
          }}
        />
      </Kartu>
    </div>
  );
}
