"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { LABEL_PERAN, PERAN } from "@/lib/peran";
import { ubahPeran } from "@/server/aksi-pengguna";

export function PilihPeran({
  userId,
  peran,
  diriSendiri,
}: {
  userId: string;
  peran: string;
  diriSendiri: boolean;
}) {
  const router = useRouter();
  const [sedang, setSedang] = useState(false);
  const [galat, setGalat] = useState<string | null>(null);

  if (diriSendiri) {
    return (
      <span
        className="text-xs text-muted"
        title="Peran akun sendiri tidak dapat diubah, agar pengelolaan peran tidak terkunci"
      >
        akun Anda
      </span>
    );
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <label className="sr-only" htmlFor={`peran-${userId}`}>
        Ubah peran pengguna
      </label>
      <select
        id={`peran-${userId}`}
        defaultValue={peran}
        disabled={sedang}
        onChange={async (e) => {
          setGalat(null);
          setSedang(true);
          const hasil = await ubahPeran(userId, e.target.value);
          setSedang(false);
          if (hasil.ok) router.refresh();
          else setGalat(hasil.pesan);
        }}
        className="sk-field px-3 py-2 text-xs"
      >
        {PERAN.map((p) => (
          <option key={p} value={p}>
            {LABEL_PERAN[p]}
          </option>
        ))}
      </select>
      {galat && <span className="max-w-56 text-right text-xs text-danger">{galat}</span>}
    </div>
  );
}
