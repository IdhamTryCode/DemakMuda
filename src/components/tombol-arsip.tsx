"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Tombol } from "@/components/sk";
import type { HasilAksi } from "@/lib/validasi";

/**
 * Tombol arsip dengan konfirmasi sebaris.
 *
 * Aksinya diserahkan pemanggil, sehingga komponen ini dipakai bersama oleh
 * Kabar, Agenda, dan Peluang tanpa mengetahui jenis isinya.
 */
export function TombolArsip({
  arsipkan,
  kembaliKe,
  keterangan,
}: {
  arsipkan: () => Promise<HasilAksi>;
  kembaliKe: string;
  keterangan: string;
}) {
  const router = useRouter();
  const [sedang, setSedang] = useState(false);
  const [minta, setMinta] = useState(false);
  const [galat, setGalat] = useState<string | null>(null);

  if (!minta) {
    return (
      <div className="flex flex-col items-end gap-1">
        <Tombol variasi="biasa" onClick={() => setMinta(true)}>
          Arsipkan
        </Tombol>
        {galat && <span className="text-xs text-danger">{galat}</span>}
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <span className="text-sm text-ink-soft">{keterangan}</span>
      <Tombol
        variasi="biasa"
        disabled={sedang}
        onClick={async () => {
          setSedang(true);
          const hasil = await arsipkan();
          setSedang(false);
          if (hasil.ok) {
            router.push(kembaliKe);
            router.refresh();
          } else {
            setGalat(hasil.pesan);
            setMinta(false);
          }
        }}
      >
        {sedang ? "Memproses…" : "Ya, arsipkan"}
      </Tombol>
      <Tombol variasi="biasa" onClick={() => setMinta(false)}>
        Batal
      </Tombol>
    </div>
  );
}
