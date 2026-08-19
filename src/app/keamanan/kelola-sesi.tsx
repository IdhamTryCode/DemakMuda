"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Pesan, Tombol } from "@/components/sk";
import { cabutSesi, cabutSesiLain } from "@/server/aksi-sesi";

export function TombolCabutSesi({ sesiId }: { sesiId: string }) {
  const router = useRouter();
  const [sedang, setSedang] = useState(false);

  return (
    <Tombol
      variasi="biasa"
      className="px-3 py-1.5 text-xs"
      disabled={sedang}
      onClick={async () => {
        setSedang(true);
        const hasil = await cabutSesi(sesiId);
        setSedang(false);
        if (hasil.ok) router.refresh();
      }}
    >
      {sedang ? "…" : "Keluarkan"}
    </Tombol>
  );
}

export function TombolCabutSemua({ jumlahLain }: { jumlahLain: number }) {
  const router = useRouter();
  const [minta, setMinta] = useState(false);
  const [sedang, setSedang] = useState(false);
  const [galat, setGalat] = useState<string | null>(null);

  if (jumlahLain === 0) return null;

  if (!minta) {
    return (
      <div className="flex flex-col gap-2">
        {galat && <Pesan nada="galat">{galat}</Pesan>}
        <Tombol variasi="biasa" className="w-fit" onClick={() => setMinta(true)}>
          Keluarkan {jumlahLain} perangkat lain
        </Tombol>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <span className="text-sm text-ink-soft">
        Keluarkan seluruh perangkat lain? Perangkat ini tetap masuk.
      </span>
      <Tombol
        variasi="biasa"
        disabled={sedang}
        onClick={async () => {
          setSedang(true);
          const hasil = await cabutSesiLain();
          setSedang(false);
          if (hasil.ok) {
            setMinta(false);
            router.refresh();
          } else {
            setGalat(hasil.pesan);
            setMinta(false);
          }
        }}
      >
        {sedang ? "Memproses…" : "Ya, keluarkan"}
      </Tombol>
      <Tombol variasi="biasa" onClick={() => setMinta(false)}>
        Batal
      </Tombol>
    </div>
  );
}
