"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { authClient } from "@/lib/auth-client";

/**
 * Menu akun pada bilah atas.
 *
 * Sebelum ini bilahnya hanya memuat nama peran sebagai tulisan mati dan satu
 * tombol Keluar. Akibatnya halaman /keamanan — tempat memasang verifikasi dua
 * langkah dan menutup sesi di perangkat lain — TIDAK PUNYA SATU PUN TAUTAN dari
 * mana pun di aplikasi ini. Ia hanya dapat dibuka dengan mengetik alamatnya,
 * dan itu berarti fitur keamanannya praktis tidak ada bagi hampir semua orang.
 *
 * Menu ini pintunya. Bentuknya mengikuti kebiasaan yang sudah dikenal orang:
 * lingkaran berinisial di pojok kanan, ditekan, keluar daftar.
 */
export function MenuAkun({
  nama,
  peran,
  fotoUrl,
  butir,
}: {
  nama: string;
  peran: string;
  /** Foto profilnya bila sudah diunggah. Inisial hanya cadangan. */
  fotoUrl: string | null;
  /** Tautan menurut peran, disiapkan di sisi peladen. */
  butir: { href: string; label: string; keterangan?: string }[];
}) {
  const router = useRouter();
  const bungkus = useRef<HTMLDivElement>(null);
  const [buka, setBuka] = useState(false);
  const [sedangKeluar, setSedangKeluar] = useState(false);

  useEffect(() => {
    if (!buka) return;

    function diLuar(e: MouseEvent) {
      if (!bungkus.current?.contains(e.target as Node)) setBuka(false);
    }
    function tombol(e: KeyboardEvent) {
      if (e.key === "Escape") setBuka(false);
    }

    document.addEventListener("mousedown", diLuar);
    document.addEventListener("keydown", tombol);
    return () => {
      document.removeEventListener("mousedown", diLuar);
      document.removeEventListener("keydown", tombol);
    };
  }, [buka]);

  // Fotonya bila ada; kalau belum, inisial — bukan siluet orang.
  //
  // Siluet ditolak dengan sengaja. Ia sama untuk semua orang, jadi tidak
  // membawa keterangan apa pun, dan yang lebih buruk: bentuknya persis seperti
  // gambar yang gagal dimuat, sehingga orang mengira ada yang rusak. Inisial
  // setidaknya menyebut siapa yang sedang masuk.
  const inisial =
    nama
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((k) => k[0]?.toUpperCase() ?? "")
      .join("") || "?";

  return (
    <div ref={bungkus} className="relative">
      <button
        type="button"
        onClick={() => setBuka((s) => !s)}
        aria-expanded={buka}
        aria-haspopup="menu"
        aria-label={`Menu akun ${nama}`}
        className="sk-pressable flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-accent text-xs font-semibold text-on-accent"
      >
        {fotoUrl ? (
          <Image
            src={fotoUrl}
            alt=""
            width={36}
            height={36}
            className="h-full w-full object-cover"
          />
        ) : (
          inisial
        )}
      </button>

      <div
        hidden={!buka}
        role="menu"
        className="sk-overlay absolute right-0 top-[calc(100%+0.6rem)] z-50 w-[min(17rem,calc(100vw-2rem))] overflow-hidden"
      >
        <div className="flex flex-col gap-0.5 border-b border-line px-4 py-3">
          <span className="truncate text-sm font-semibold">{nama}</span>
          <span className="text-xs text-muted">{peran}</span>
        </div>

        <div className="flex flex-col py-1">
          {butir.map((b) => (
            <Link
              key={b.href}
              href={b.href}
              role="menuitem"
              onClick={() => setBuka(false)}
              className="flex flex-col gap-0.5 px-4 py-2.5 transition-colors hover:bg-sunk"
            >
              <span className="text-sm">{b.label}</span>
              {b.keterangan && (
                <span className="text-xs text-muted">{b.keterangan}</span>
              )}
            </Link>
          ))}
        </div>

        <div className="border-t border-line p-1">
          <button
            type="button"
            role="menuitem"
            disabled={sedangKeluar}
            onClick={async () => {
              setSedangKeluar(true);
              await authClient.signOut();
              router.push("/masuk");
              router.refresh();
            }}
            className="w-full rounded-sk px-3 py-2.5 text-left text-sm text-danger transition-colors hover:bg-danger-soft disabled:opacity-60"
          >
            {sedangKeluar ? "Keluar…" : "Keluar"}
          </button>
        </div>
      </div>
    </div>
  );
}
