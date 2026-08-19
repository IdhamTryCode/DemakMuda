"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Tombol } from "@/components/sk";
import { tanggapiKeanggotaan } from "@/server/aksi-keanggotaan";

export function TombolAnggota({ keanggotaanId }: { keanggotaanId: string }) {
  const router = useRouter();
  const [sedang, setSedang] = useState(false);
  const [galat, setGalat] = useState<string | null>(null);

  async function putuskan(keputusan: "TERVERIFIKASI" | "DITOLAK") {
    setGalat(null);
    setSedang(true);
    const hasil = await tanggapiKeanggotaan(keanggotaanId, keputusan);
    setSedang(false);
    if (hasil.ok) router.refresh();
    else setGalat(hasil.pesan);
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex gap-2">
        <Tombol
          className="text-xs"
          disabled={sedang}
          onClick={() => putuskan("TERVERIFIKASI")}
        >
          Terima
        </Tombol>
        <Tombol
          variasi="biasa"
          className="text-xs"
          disabled={sedang}
          onClick={() => putuskan("DITOLAK")}
        >
          Tolak
        </Tombol>
      </div>
      {galat && <span className="text-xs text-danger">{galat}</span>}
    </div>
  );
}
