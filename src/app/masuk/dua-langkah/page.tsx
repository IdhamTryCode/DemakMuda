import type { Metadata } from "next";
import Link from "next/link";

import { FormDuaLangkah } from "@/app/masuk/dua-langkah/form-dua-langkah";
import { BingkaiAuth } from "@/components/bingkai-auth";

export const metadata: Metadata = { title: "Verifikasi Dua Langkah" };

/** Hanya menerima alamat internal, sama seperti halaman masuk. */
function tujuanAman(nilai: string | undefined): string {
  if (!nilai || !nilai.startsWith("/") || nilai.startsWith("//")) return "/tujuan";
  return nilai;
}

export default async function HalamanDuaLangkah({
  searchParams,
}: {
  searchParams: Promise<{ lanjut?: string }>;
}) {
  const { lanjut } = await searchParams;

  return (
    <BingkaiAuth
      judul="Verifikasi dua langkah"
      keterangan="Masukkan kode yang sedang tampil di aplikasi autentikator Anda."
      kaki={
        <>
          Bukan Anda?{" "}
          <Link
            href="/masuk"
            className="font-medium text-accent underline underline-offset-2"
          >
            Kembali ke halaman masuk
          </Link>
        </>
      }
    >
      <FormDuaLangkah lanjut={tujuanAman(lanjut)} />
    </BingkaiAuth>
  );
}
