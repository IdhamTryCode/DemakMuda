import type { Metadata } from "next";
import Link from "next/link";

import { FormKarya } from "@/app/pemuda/form-karya";
import { Kartu } from "@/components/sk";
import { wajibPeran } from "@/lib/sesi";
import { buatKarya } from "@/server/aksi-karya";

export const metadata: Metadata = { title: "Tambah Karya" };

export default async function HalamanKaryaBaru() {
  await wajibPeran("pemuda");

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-6 py-8">
      <Link
        href="/pemuda/karya"
        className="text-sm text-accent underline underline-offset-2"
      >
        ← Karya saya
      </Link>
      <h1 className="text-2xl font-semibold tracking-tight">Tambah karya</h1>
      <Kartu>
        <FormKarya simpan={buatKarya} />
      </Kartu>
    </main>
  );
}
