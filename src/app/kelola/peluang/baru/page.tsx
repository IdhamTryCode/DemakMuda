import type { Metadata } from "next";

import { FormPeluang } from "@/app/kelola/form-peluang";
import { Kartu } from "@/components/sk";
import { prisma } from "@/lib/prisma";
import { wajibPeran } from "@/lib/sesi";
import { buatPeluang } from "@/server/aksi-peluang";

export const metadata: Metadata = { title: "Buka Peluang" };

export default async function HalamanPeluangBaru() {
  const sesi = await wajibPeran("organisasi", "dinas", "superadmin");

  // Hanya organisasi yang boleh dikelola pemanggil. Dinas dan superadmin
  // berwenang atas seluruhnya; pengelola organisasi hanya atas miliknya —
  // aturan yang sama persis ditegakkan ulang di Server Action-nya.
  const organisasi = await prisma.organisasi.findMany({
    where: sesi.peran === "organisasi" ? { pemilikId: sesi.user.id } : undefined,
    orderBy: { nama: "asc" },
    select: { id: true, nama: true },
  });


  const minat = await prisma.minat.findMany({
    orderBy: { nama: "asc" },
    select: { id: true, nama: true },
  });

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold tracking-tight">Buka peluang</h1>
      <Kartu>
        <FormPeluang
          organisasi={organisasi} minat={minat} simpan={buatPeluang} />
      </Kartu>
    </div>
  );
}
