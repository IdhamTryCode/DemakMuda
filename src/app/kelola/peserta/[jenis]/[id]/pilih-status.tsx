"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { ubahStatusPeserta } from "@/server/aksi-pendaftaran";

const PILIHAN = [
  { nilai: "MENUNGGU", label: "Menunggu" },
  { nilai: "DITERIMA", label: "Diterima" },
  { nilai: "DITOLAK", label: "Ditolak" },
  { nilai: "HADIR", label: "Hadir" },
];

export function PilihStatusPeserta({
  pendaftaranId,
  status,
}: {
  pendaftaranId: string;
  status: string;
}) {
  const router = useRouter();
  const [sedang, setSedang] = useState(false);
  const [galat, setGalat] = useState<string | null>(null);

  return (
    <div className="flex flex-col items-end gap-1">
      <label className="sr-only" htmlFor={`status-${pendaftaranId}`}>
        Ubah status peserta
      </label>
      <select
        id={`status-${pendaftaranId}`}
        defaultValue={status}
        disabled={sedang}
        onChange={async (e) => {
          setGalat(null);
          setSedang(true);
          const hasil = await ubahStatusPeserta(pendaftaranId, e.target.value);
          setSedang(false);
          if (hasil.ok) router.refresh();
          else setGalat(hasil.pesan);
        }}
        className="sk-field px-3 py-2 text-xs"
      >
        {PILIHAN.map((p) => (
          <option key={p.nilai} value={p.nilai}>
            {p.label}
          </option>
        ))}
      </select>
      {galat && <span className="text-xs text-danger">{galat}</span>}
    </div>
  );
}
