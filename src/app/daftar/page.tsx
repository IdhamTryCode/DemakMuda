import type { Metadata } from "next";
import Link from "next/link";

import { FormDaftar } from "@/app/daftar/form-daftar";
import { BingkaiAuth } from "@/components/bingkai-auth";

export const metadata: Metadata = {
  title: "Daftar",
};

export default function HalamanDaftar() {
  return (
    <BingkaiAuth
      judul="Buat akun"
      keterangan="Untuk pemuda Kabupaten Demak berusia 16 sampai 30 tahun."
      kaki={
        <>
          Sudah punya akun?{" "}
          <Link
            href="/masuk"
            className="font-medium text-accent underline underline-offset-2"
          >
            Masuk di sini
          </Link>
        </>
      }
    >
      <FormDaftar />
    </BingkaiAuth>
  );
}
