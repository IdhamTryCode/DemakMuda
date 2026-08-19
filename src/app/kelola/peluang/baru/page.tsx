import type { Metadata } from "next";

import { FormPeluang } from "@/app/kelola/form-peluang";
import { Kartu } from "@/components/sk";
import { prisma } from "@/lib/prisma";
import { wajibPeran } from "@/lib/sesi";
import { buatPeluang } from "@/server/aksi-peluang";

export const metadata: Metadata = { title: "Buka Peluang" };

export default async function HalamanPeluangBaru() {
  await wajibPeran("organisasi", "dinas", "superadmin");

  const minat = await prisma.minat.findMany({
    orderBy: { nama: "asc" },
    select: { id: true, nama: true },
  });

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold tracking-tight">Buka peluang</h1>
      <Kartu>
        <FormPeluang minat={minat} simpan={buatPeluang} />
      </Kartu>
    </div>
  );
}
