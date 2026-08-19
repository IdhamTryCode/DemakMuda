import type { Metadata } from "next";
import Link from "next/link";

import { FormProfil } from "@/app/pemuda/profil/form-profil";
import { Kartu } from "@/components/sk";
import { prisma } from "@/lib/prisma";
import { wajibMasuk } from "@/lib/sesi";
import { simpanProfil } from "@/server/aksi-profil";

export const metadata: Metadata = { title: "Kartu Talenta" };

function keNilaiTanggal(nilai: Date | null): string {
  if (!nilai) return "";
  const p = (n: number) => String(n).padStart(2, "0");
  return `${nilai.getFullYear()}-${p(nilai.getMonth() + 1)}-${p(nilai.getDate())}`;
}

export default async function HalamanProfil() {
  const sesi = await wajibMasuk();

  const [profil, kecamatan, desa, sekolah, minat, keterampilan] = await Promise.all([
    prisma.profilPemuda.findUnique({
      where: { userId: sesi.user.id },
      select: {
        slug: true,
        bio: true,
        telepon: true,
        tanggalLahir: true,
        jenisKelamin: true,
        kecamatanId: true,
        desaId: true,
        sekolahId: true,
        minat: { select: { id: true } },
        keterampilan: { select: { id: true } },
      },
    }),
    prisma.kecamatan.findMany({ orderBy: { nama: "asc" }, select: { id: true, nama: true } }),
    prisma.desa.findMany({
      orderBy: { nama: "asc" },
      select: { id: true, nama: true, kecamatanId: true },
    }),
    prisma.sekolah.findMany({ orderBy: { nama: "asc" }, select: { id: true, nama: true } }),
    prisma.minat.findMany({ orderBy: { nama: "asc" }, select: { id: true, nama: true } }),
    prisma.keterampilan.findMany({
      orderBy: { nama: "asc" },
      select: { id: true, nama: true },
    }),
  ]);

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-6 py-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight">Kartu Talenta</h1>
          <p className="text-sm text-muted">
            Isian di sini menjadi portofolio digital yang bisa Anda bagikan.
          </p>
        </div>
        <div className="flex gap-2">
          {profil?.slug && (
            <Link
              href={`/p/${profil.slug}`}
              className="sk-raised sk-pressable rounded-sk px-4 py-2.5 text-sm font-medium text-ink-soft"
            >
              Lihat kartu publik
            </Link>
          )}
          <Link
            href="/pemuda"
            className="sk-raised sk-pressable rounded-sk px-4 py-2.5 text-sm font-medium text-ink-soft"
          >
            Dasbor
          </Link>
        </div>
      </div>

      <Kartu>
        <FormProfil
          simpan={simpanProfil}
          kecamatan={kecamatan}
          desa={desa}
          sekolah={sekolah}
          minat={minat}
          keterampilan={keterampilan}
          awal={{
            nama: sesi.user.name,
            bio: profil?.bio ?? "",
            telepon: profil?.telepon ?? "",
            tanggalLahir: keNilaiTanggal(profil?.tanggalLahir ?? null),
            jenisKelamin: profil?.jenisKelamin ?? "",
            kecamatanId: profil?.kecamatanId ?? "",
            desaId: profil?.desaId ?? "",
            sekolahId: profil?.sekolahId ?? "",
            minat: profil?.minat.map((m) => m.id) ?? [],
            keterampilan: profil?.keterampilan.map((k) => k.id) ?? [],
          }}
        />
      </Kartu>
    </div>
  );
}
