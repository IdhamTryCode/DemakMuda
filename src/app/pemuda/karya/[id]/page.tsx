import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { FormKarya } from "@/app/pemuda/form-karya";
import { Kartu } from "@/components/sk";
import { TombolArsip } from "@/components/tombol-arsip";
import { prisma } from "@/lib/prisma";
import { wajibPeran } from "@/lib/sesi";
import { arsipkanKarya, ubahKarya } from "@/server/aksi-karya";

export const metadata: Metadata = { title: "Ubah Karya" };

export default async function HalamanUbahKarya({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const sesi = await wajibPeran("pemuda");

  // Kepemilikan menjadi bagian dari kueri, bukan pemeriksaan sesudahnya.
  // Karya milik orang lain karena itu tidak dapat dibedakan dari karya yang
  // tidak ada: keduanya sama-sama 404.
  const karya = await prisma.karya.findFirst({
    where: { id, pemilikId: sesi.user.id },
    select: {
      id: true,
      judul: true,
      jenis: true,
      deskripsi: true,
      gambarUrl: true,
      tautanLuar: true,
      status: true,
    },
  });
  if (!karya) notFound();

  async function simpan(data: FormData) {
    "use server";
    return ubahKarya(id, data);
  }

  async function arsip() {
    "use server";
    return arsipkanKarya(id);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold tracking-tight">Ubah karya</h1>
        {karya.status !== "ARSIP" && (
          <TombolArsip
            arsipkan={arsip}
            kembaliKe="/pemuda/karya"
            keterangan="Arsipkan karya ini?"
          />
        )}
      </div>

      <Kartu>
        <FormKarya
          simpan={simpan}
          awal={{
            judul: karya.judul,
            jenis: karya.jenis,
            deskripsi: karya.deskripsi,
            gambarUrl: karya.gambarUrl ?? "",
            tautanLuar: karya.tautanLuar ?? "",
            status: karya.status === "DRAF" ? "DRAF" : "TERBIT",
          }}
        />
      </Kartu>
    </div>
  );
}
