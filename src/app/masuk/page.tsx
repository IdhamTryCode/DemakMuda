import type { Metadata } from "next";
import Link from "next/link";

import { FormMasuk } from "@/app/masuk/form-masuk";
import { BingkaiAuth } from "@/components/bingkai-auth";
import { MODE_PERAGAAN } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Masuk",
};

/** Hanya menerima alamat internal, agar parameter ini tidak bisa dipakai
 *  mengalihkan pengguna ke situs lain setelah berhasil masuk. */
function tujuanAman(nilai: string | undefined): string {
  if (!nilai || !nilai.startsWith("/") || nilai.startsWith("//")) {
    return "/tujuan";
  }
  return nilai;
}

export default async function HalamanMasuk({
  searchParams,
}: {
  searchParams: Promise<{ lanjut?: string }>;
}) {
  const { lanjut } = await searchParams;

  return (
    <BingkaiAuth
      judul="Masuk"
      keterangan="Portal talenta dan peluang pemuda Kabupaten Demak."
      kaki={
        <>
          Belum punya akun?{" "}
          <Link
            href="/daftar"
            className="font-medium text-accent underline underline-offset-2"
          >
            Daftar di sini
          </Link>
        </>
      }
    >
      <FormMasuk lanjut={tujuanAman(lanjut)} modePeragaan={MODE_PERAGAAN} />
    </BingkaiAuth>
  );
}
