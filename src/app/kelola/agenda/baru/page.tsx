import type { Metadata } from "next";

import { FormAgenda } from "@/app/kelola/form-agenda";
import { Kartu } from "@/components/sk";
import { prisma } from "@/lib/prisma";
import { wajibPeran } from "@/lib/sesi";
import { buatAgenda } from "@/server/aksi-agenda";

export const metadata: Metadata = { title: "Pasang Agenda" };

export default async function HalamanAgendaBaru() {
  await wajibPeran("organisasi", "dinas", "superadmin");

  const kecamatan = await prisma.kecamatan.findMany({
    orderBy: { nama: "asc" },
    select: { id: true, nama: true },
  });

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold tracking-tight">Pasang agenda</h1>
      <Kartu>
        <FormAgenda kecamatan={kecamatan} simpan={buatAgenda} />
      </Kartu>
    </div>
  );
}
