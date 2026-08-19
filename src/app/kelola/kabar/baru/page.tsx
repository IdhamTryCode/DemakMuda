import type { Metadata } from "next";

import { FormKabar } from "@/app/kelola/form-kabar";
import { Kartu } from "@/components/sk";
import { buatKabar } from "@/server/aksi-kabar";
import { wajibPeran } from "@/lib/sesi";

export const metadata: Metadata = { title: "Tulis Kabar" };

export default async function HalamanKabarBaru() {
  await wajibPeran("organisasi", "dinas", "superadmin");

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold tracking-tight">Tulis kabar</h1>
      <Kartu>
        <FormKabar simpan={buatKabar} />
      </Kartu>
    </div>
  );
}
