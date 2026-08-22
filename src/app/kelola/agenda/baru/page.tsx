import type { Metadata } from "next";

import { FormAgenda } from "@/app/kelola/form-agenda";
import { Kartu } from "@/components/sk";
import { prisma } from "@/lib/prisma";
import { wajibPeran } from "@/lib/sesi";
import { buatAgenda } from "@/server/aksi-agenda";

export const metadata: Metadata = { title: "Pasang Agenda" };

export default async function HalamanAgendaBaru() {
  const sesi = await wajibPeran("organisasi", "dinas", "superadmin");

  // Hanya organisasi yang boleh dikelola pemanggil. Dinas dan superadmin
  // berwenang atas seluruhnya; pengelola organisasi hanya atas miliknya —
  // aturan yang sama persis ditegakkan ulang di Server Action-nya.
  const organisasi = await prisma.organisasi.findMany({
    where: sesi.peran === "organisasi" ? { pemilikId: sesi.user.id } : undefined,
    orderBy: { nama: "asc" },
    select: { id: true, nama: true },
  });


  const kecamatan = await prisma.kecamatan.findMany({
    orderBy: { nama: "asc" },
    select: { id: true, nama: true },
  });

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold tracking-tight">Pasang agenda</h1>
      <Kartu>
        <FormAgenda
          organisasi={organisasi} kecamatan={kecamatan} simpan={buatAgenda} />
      </Kartu>
    </div>
  );
}
