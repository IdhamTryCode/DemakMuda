import type { Metadata } from "next";

import { FormKarya } from "@/app/pemuda/form-karya";
import { Kartu } from "@/components/sk";
import { wajibPeran } from "@/lib/sesi";
import { buatKarya } from "@/server/aksi-karya";

export const metadata: Metadata = { title: "Tambah Karya" };

export default async function HalamanKaryaBaru() {
  await wajibPeran("pemuda");

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold tracking-tight">Tambah karya</h1>
      <Kartu>
        <FormKarya simpan={buatKarya} />
      </Kartu>
    </div>
  );
}
