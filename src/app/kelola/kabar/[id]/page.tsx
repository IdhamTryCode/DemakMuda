import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { FormKabar } from "@/app/kelola/form-kabar";
import { Kartu } from "@/components/sk";
import { prisma } from "@/lib/prisma";
import { wajibPeran } from "@/lib/sesi";
import { bolehMengubah } from "@/server/penjaga";
import { arsipkanKabar, ubahKabar } from "@/server/aksi-kabar";
import { TombolArsip } from "@/components/tombol-arsip";

export const metadata: Metadata = { title: "Ubah Kabar" };

export default async function HalamanUbahKabar({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const sesi = await wajibPeran("organisasi", "dinas", "superadmin");

  const kabar = await prisma.berita.findUnique({
    where: { id },
    select: {
      id: true,
      judul: true,
      ringkasan: true,
      isi: true,
      gambarUrl: true,
      status: true,
      penulisId: true,
    },
  });

  // Kabar milik orang lain diperlakukan sama seperti kabar yang tidak ada,
  // supaya halaman ini tidak bisa dipakai memastikan sebuah id itu nyata.
  if (
    !kabar ||
    !bolehMengubah({ id: sesi.user.id, nama: sesi.user.name, peran: sesi.peran }, kabar.penulisId)
  ) {
    notFound();
  }

  async function simpan(data: FormData) {
    "use server";
    return ubahKabar(id, data);
  }

  async function arsip() {
    "use server";
    return arsipkanKabar(id);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold tracking-tight">Ubah kabar</h1>
        {kabar.status !== "ARSIP" && (
          <TombolArsip
            arsipkan={arsip}
            kembaliKe="/kelola/kabar"
            keterangan="Arsipkan kabar ini?"
          />
        )}
      </div>

      <Kartu>
        <FormKabar
          simpan={simpan}
          awal={{
            judul: kabar.judul,
            ringkasan: kabar.ringkasan,
            isi: kabar.isi,
            gambarUrl: kabar.gambarUrl ?? "",
            status: kabar.status === "TERBIT" ? "TERBIT" : "DRAF",
          }}
        />
      </Kartu>
    </div>
  );
}
