import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { FormAgenda } from "@/app/kelola/form-agenda";
import { Kartu } from "@/components/sk";
import { TombolArsip } from "@/components/tombol-arsip";
import { prisma } from "@/lib/prisma";
import { keNilaiWaktuLokal } from "@/lib/teks";
import { wajibPeran } from "@/lib/sesi";
import { arsipkanAgenda, ubahAgenda } from "@/server/aksi-agenda";
import { bolehMengubah } from "@/server/penjaga";

export const metadata: Metadata = { title: "Ubah Agenda" };

export default async function HalamanUbahAgenda({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const sesi = await wajibPeran("organisasi", "dinas", "superadmin");

  const [agenda, kecamatan] = await Promise.all([
    prisma.agenda.findUnique({
      where: { id },
      select: {
        id: true,
        judul: true,
        deskripsi: true,
        lokasi: true,
        mulai: true,
        selesai: true,
        kecamatanId: true,
        status: true,
        pembuatId: true,
      },
    }),
    prisma.kecamatan.findMany({
      orderBy: { nama: "asc" },
      select: { id: true, nama: true },
    }),
  ]);

  // Agenda milik orang lain diperlakukan sama seperti yang tidak ada.
  if (
    !agenda ||
    !bolehMengubah(
      { id: sesi.user.id, nama: sesi.user.name, peran: sesi.peran },
      agenda.pembuatId,
    )
  ) {
    notFound();
  }

  async function simpan(data: FormData) {
    "use server";
    return ubahAgenda(id, data);
  }

  async function arsip() {
    "use server";
    return arsipkanAgenda(id);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold tracking-tight">Ubah agenda</h1>
        {agenda.status !== "ARSIP" && (
          <TombolArsip
            arsipkan={arsip}
            kembaliKe="/kelola/agenda"
            keterangan="Arsipkan agenda ini?"
          />
        )}
      </div>

      <Kartu>
        <FormAgenda
          kecamatan={kecamatan}
          simpan={simpan}
          awal={{
            judul: agenda.judul,
            deskripsi: agenda.deskripsi,
            lokasi: agenda.lokasi ?? "",
            mulai: keNilaiWaktuLokal(agenda.mulai),
            selesai: agenda.selesai ? keNilaiWaktuLokal(agenda.selesai) : "",
            kecamatanId: agenda.kecamatanId ?? "",
            status: agenda.status === "TERBIT" ? "TERBIT" : "DRAF",
          }}
        />
      </Kartu>
    </div>
  );
}
