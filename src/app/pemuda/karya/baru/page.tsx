import type { Metadata } from "next";
import Link from "next/link";

import { FormKarya } from "@/app/pemuda/form-karya";
import { KepalaHalaman, Kartu } from "@/components/sk";
import { wajibPeran } from "@/lib/sesi";
import { buatKarya } from "@/server/aksi-karya";

export const metadata: Metadata = { title: "Tambah Karya" };

export default async function HalamanKaryaBaru() {
  await wajibPeran("pemuda");

  return (
    <div className="flex flex-col gap-6">
      <KepalaHalaman
        overline="Karya"
        judul="Tambah karya"
        aksi={
          <Link
            href="/pemuda/karya"
            className="sk-kartu sk-pressable px-4 py-2.5 text-sm font-medium text-ink-soft"
          >
            Karya saya
          </Link>
        }
      />
      <Kartu>
        <FormKarya simpan={buatKarya} />
      </Kartu>
    </div>
  );
}
