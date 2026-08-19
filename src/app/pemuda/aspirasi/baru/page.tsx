import type { Metadata } from "next";
import Link from "next/link";

import { FormAspirasi } from "@/app/pemuda/form-aspirasi";
import { Kartu } from "@/components/sk";
import { wajibPeran } from "@/lib/sesi";
import { kirimAspirasi } from "@/server/aksi-aspirasi";

export const metadata: Metadata = { title: "Kirim Aspirasi" };

export default async function HalamanAspirasiBaru() {
  await wajibPeran("pemuda");

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-6 py-8">
      <Link
        href="/pemuda/aspirasi"
        className="text-sm text-accent underline underline-offset-2"
      >
        ← Aspirasi saya
      </Link>

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
    </main>
  );
}
