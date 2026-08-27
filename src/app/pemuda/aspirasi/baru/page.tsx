import type { Metadata } from "next";

import { FormAspirasi } from "@/app/pemuda/form-aspirasi";
import { Kartu } from "@/components/sk";
import { wajibPeran } from "@/lib/sesi";
import { kirimAspirasi } from "@/server/aksi-aspirasi";

export const metadata: Metadata = { title: "Kirim Aspirasi" };

export default async function HalamanAspirasiBaru() {
  await wajibPeran("pemuda");

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">Kirim aspirasi</h1>
        <p className="max-w-prose text-sm text-ink-soft">
          Aspirasi Anda dibaca oleh Dispora Demak, bukan oleh umum. Nama Anda
          disertakan supaya dinas dapat menindaklanjuti dan menghubungi kembali.
        </p>
      </div>

      <Kartu>
        <FormAspirasi kirimkan={kirimAspirasi} />
      </Kartu>
    </div>
  );
}
