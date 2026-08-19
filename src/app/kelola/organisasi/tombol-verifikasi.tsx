"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Tombol } from "@/components/sk";
import { verifikasiOrganisasi } from "@/server/aksi-organisasi";

/** Tombol verifikasi organisasi, hanya dirender untuk dinas dan superadmin. */
export function TombolVerifikasi({ id }: { id: string }) {
  const router = useRouter();
  const [sedang, setSedang] = useState(false);
  const [galat, setGalat] = useState<string | null>(null);

  async function putuskan(keputusan: "TERVERIFIKASI" | "DITOLAK") {
    setGalat(null);
    setSedang(true);
    const hasil = await verifikasiOrganisasi(id, keputusan);
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
          Verifikasi
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
