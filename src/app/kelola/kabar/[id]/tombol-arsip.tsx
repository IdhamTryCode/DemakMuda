"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Tombol } from "@/components/sk";
import { arsipkanKabar } from "@/server/aksi-kabar";

export function TombolArsip({ id }: { id: string }) {
  const router = useRouter();
  const [sedang, setSedang] = useState(false);
  const [minta, setMinta] = useState(false);

  if (!minta) {
    return (
      <Tombol variasi="biasa" onClick={() => setMinta(true)}>
        Arsipkan
      </Tombol>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-ink-soft">Arsipkan kabar ini?</span>
      <Tombol
        variasi="biasa"
        disabled={sedang}
        onClick={async () => {
          setSedang(true);
          const hasil = await arsipkanKabar(id);
          setSedang(false);
          if (hasil.ok) {
            router.push("/kelola/kabar");
            router.refresh();
          } else {
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
