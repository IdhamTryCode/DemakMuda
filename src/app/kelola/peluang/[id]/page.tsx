import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { FormPeluang } from "@/app/kelola/form-peluang";
import { Kartu } from "@/components/sk";
import { TombolArsip } from "@/components/tombol-arsip";
import { prisma } from "@/lib/prisma";
import { wajibPeran } from "@/lib/sesi";
import { keNilaiWaktuLokal } from "@/lib/teks";
import { arsipkanPeluang, ubahPeluang } from "@/server/aksi-peluang";
import { bolehMengubah } from "@/server/penjaga";

export const metadata: Metadata = { title: "Ubah Peluang" };

export default async function HalamanUbahPeluang({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const sesi = await wajibPeran("organisasi", "dinas", "superadmin");

  const [peluang, minat] = await Promise.all([
    prisma.peluang.findUnique({
      where: { id },
      select: {
        id: true,
        judul: true,
        jenis: true,
        deskripsi: true,
        tautanLuar: true,
        tenggat: true,
        usiaMin: true,
        usiaMaks: true,
        status: true,
        pembuatId: true,
        minat: { select: { id: true } },
      },
    }),
    prisma.minat.findMany({
      orderBy: { nama: "asc" },
      select: { id: true, nama: true },
    }),
  ]);

  // Peluang milik orang lain diperlakukan sama seperti yang tidak ada.
  if (
    !peluang ||
    !bolehMengubah(
      { id: sesi.user.id, nama: sesi.user.name, peran: sesi.peran },
      peluang.pembuatId,
    )
  ) {
    notFound();
  }

  async function simpan(data: FormData) {
    "use server";
    return ubahPeluang(id, data);
  }

  async function arsip() {
    "use server";
    return arsipkanPeluang(id);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold tracking-tight">Ubah peluang</h1>
        {peluang.status !== "ARSIP" && (
          <TombolArsip
            arsipkan={arsip}
            kembaliKe="/kelola/peluang"
            keterangan="Arsipkan peluang ini?"
          />
        )}
      </div>

      <Kartu>
        <FormPeluang
          minat={minat}
          simpan={simpan}
          awal={{
            judul: peluang.judul,
            jenis: peluang.jenis,
            deskripsi: peluang.deskripsi,
            tautanLuar: peluang.tautanLuar ?? "",
            tenggat: peluang.tenggat ? keNilaiWaktuLokal(peluang.tenggat) : "",
            usiaMin: peluang.usiaMin?.toString() ?? "",
            usiaMaks: peluang.usiaMaks?.toString() ?? "",
            minat: peluang.minat.map((m) => m.id),
            status: peluang.status === "TERBIT" ? "TERBIT" : "DRAF",
          }}
        />
      </Kartu>
    </div>
  );
}
