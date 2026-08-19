"use client";

import Link from "next/link";
import { useEffect } from "react";

import { Kartu, Tombol } from "@/components/sk";

/**
 * Halaman kesalahan tak terduga.
 *
 * Dua hal yang sengaja TIDAK dilakukan di sini:
 *
 * - Menampilkan pesan galat aslinya. Pesan itu kerap memuat nama tabel, kolom,
 *   atau potongan kueri — keterangan yang berguna bagi penyerang dan tidak
 *   berarti apa-apa bagi pengunjung.
 *
 * - Menyembunyikan bahwa ada yang salah. Halaman kosong membuat orang mengira
 *   dirinya yang keliru, lalu mencoba berulang kali.
 *
 * Yang ditampilkan adalah `digest`: penanda yang dibuat Next.js dan dapat
 * dicocokkan dengan catatan di peladen, sehingga pengunjung punya sesuatu yang
 * dapat disebutkan saat melapor tanpa membocorkan apa pun.
 */
export default function HalamanGalat({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[galat halaman]", error);
  }, [error]);

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center gap-6 px-6 py-16">
      <div className="flex flex-col gap-3">
        <span className="font-mono text-sm text-brass">Terjadi kesalahan</span>
        <h1 className="text-3xl font-semibold tracking-tight">
          Halaman ini gagal dimuat
        </h1>
        <p className="max-w-prose text-base text-ink-soft">
          Kesalahan ada di sisi kami, bukan pada yang Anda lakukan. Coba muat
          ulang halamannya — bila masih gagal, kembali ke beranda dan coba
          beberapa saat lagi.
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <Tombol onClick={reset} className="px-5">
          Coba muat ulang
        </Tombol>
        <Link
          href="/"
          className="sk-raised sk-pressable rounded-sk px-5 py-2.5 text-sm font-medium text-ink-soft"
        >
          Ke beranda
        </Link>
      </div>

      {error.digest && (
        <Kartu className="flex flex-col gap-2">
          <h2 className="text-base font-semibold">Bila ingin melaporkannya</h2>
          <p className="text-sm text-ink-soft">
            Sebutkan kode berikut kepada Dinas Kepemudaan dan Olahraga. Kode ini
            membantu menemukan catatan kesalahannya, dan tidak memuat data Anda.
          </p>
          <p className="w-fit rounded-sk bg-sunk px-3 py-2 font-mono text-sm tabular-nums text-ink-soft">
            {error.digest}
          </p>
        </Kartu>
      )}
    </main>
  );
}
