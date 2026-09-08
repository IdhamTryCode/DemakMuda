import type { Metadata } from "next";
import Link from "next/link";

import { FormMasuk } from "@/app/masuk/form-masuk";
import { BingkaiAuth } from "@/components/bingkai-auth";
import { MASUK_GOOGLE, MODE_PERAGAAN } from "@/lib/auth";

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

/**
 * Better Auth memulangkan kegagalan masuk-dengan-Google ke halaman ini dengan
 * parameter "error" berisi kode. Kodenya dipakai hanya untuk MEMILIH kalimat,
 * tidak pernah dicetak — nilainya datang dari alamat, dan alamat dapat ditulis
 * siapa saja.
 */
function pesanGalatGoogle(kode: string | undefined): string | undefined {
  if (!kode) return undefined;
  if (kode === "access_denied") return "Masuk dengan Google dibatalkan.";
  return "Masuk dengan Google tidak berhasil. Coba lagi, atau masuk dengan surel dan kata sandi.";
}

export default async function HalamanMasuk({
  searchParams,
}: {
  searchParams: Promise<{ lanjut?: string; error?: string }>;
}) {
  const { lanjut, error } = await searchParams;

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
      <FormMasuk
        lanjut={tujuanAman(lanjut)}
        modePeragaan={MODE_PERAGAAN}
        googleAktif={MASUK_GOOGLE}
        galatAwal={pesanGalatGoogle(error)}
      />
    </BingkaiAuth>
  );
}
