import type { Metadata } from "next";

import { FormOrganisasi } from "@/app/kelola/form-organisasi";
import { Kartu } from "@/components/sk";
import { prisma } from "@/lib/prisma";
import { wajibPeran } from "@/lib/sesi";
import { buatOrganisasi } from "@/server/aksi-organisasi";

export const metadata: Metadata = { title: "Daftarkan Organisasi" };

export default async function HalamanOrganisasiBaru() {
  const sesi = await wajibPeran("organisasi", "dinas", "superadmin");
  const perluVerifikasi = sesi.peran === "organisasi";

  const [kecamatan, desa] = await Promise.all([
    prisma.kecamatan.findMany({ orderBy: { nama: "asc" }, select: { id: true, nama: true } }),
    prisma.desa.findMany({
      orderBy: { nama: "asc" },
      select: { id: true, nama: true, kecamatanId: true },
    }),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">
          Daftarkan organisasi
        </h1>
        {perluVerifikasi && (
          <p className="text-sm text-muted">
            Organisasi baru menunggu verifikasi Dinas Kepemudaan dan Olahraga
            sebelum tampil di direktori publik.
          </p>
        )}
      </div>
      <Kartu>
        <FormOrganisasi kecamatan={kecamatan} desa={desa} simpan={buatOrganisasi} />
      </Kartu>
    </div>
  );
}
