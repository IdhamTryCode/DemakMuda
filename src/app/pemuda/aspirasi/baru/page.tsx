import type { Metadata } from "next";
import Link from "next/link";

import { FormAspirasi } from "@/app/pemuda/form-aspirasi";
import { KepalaHalaman, Kartu } from "@/components/sk";
import { wajibPeran } from "@/lib/sesi";
import { kirimAspirasi } from "@/server/aksi-aspirasi";

export const metadata: Metadata = { title: "Kirim Aspirasi" };

export default async function HalamanAspirasiBaru() {
  await wajibPeran("pemuda");

  return (
    <div className="flex flex-col gap-6">
      <KepalaHalaman
        overline="Aspirasi"
        judul="Kirim aspirasi"
        keterangan="Aspirasi Anda dibaca oleh Dispora Demak, bukan oleh umum. Nama Anda disertakan supaya dinas dapat menindaklanjuti dan menghubungi kembali."
        aksi={
          <Link
            href="/pemuda/aspirasi"
            className="sk-kartu sk-pressable px-4 py-2.5 text-sm font-medium text-ink-soft"
          >
            Aspirasi saya
          </Link>
        }
      />

      <Kartu>
        <FormAspirasi kirimkan={kirimAspirasi} />
      </Kartu>
    </div>
  );
}
