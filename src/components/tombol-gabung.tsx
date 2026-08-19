"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Pesan, Tombol } from "@/components/sk";
import { ajukanKeanggotaan } from "@/server/aksi-keanggotaan";

export function TombolGabung({ organisasiId }: { organisasiId: string }) {
  const router = useRouter();
  const [sedang, setSedang] = useState(false);
  const [galat, setGalat] = useState<string | null>(null);

  return (
    <div className="flex flex-col items-end gap-2">
      {galat && <Pesan nada="galat">{galat}</Pesan>}
      <Tombol
        disabled={sedang}
        className="px-5"
        onClick={async () => {
          setGalat(null);
          setSedang(true);
          const hasil = await ajukanKeanggotaan(organisasiId);
          setSedang(false);
          if (hasil.ok) router.refresh();
          else setGalat(hasil.pesan);
        }}
      >
        {sedang ? "Mengajukan…" : "Ajukan diri"}
      </Tombol>
    </div>
  );
}
