"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Pesan, Tombol } from "@/components/sk";
import { batalkanPendaftaran, daftarKegiatan } from "@/server/aksi-pendaftaran";

export function TombolDaftar({
  mode,
  jenis,
  id,
  pendaftaranId,
}: {
  mode: "daftar" | "batal";
  jenis: "agenda" | "peluang";
  id: string;
  pendaftaranId?: string;
}) {
  const router = useRouter();
  const [sedang, setSedang] = useState(false);
  const [galat, setGalat] = useState<string | null>(null);
  const [mintaBatal, setMintaBatal] = useState(false);

  async function jalankan() {
    setGalat(null);
    setSedang(true);

    const data = new FormData();
    data.set("jenis", jenis);
    data.set("id", id);

    const hasil =
      mode === "daftar"
        ? await daftarKegiatan(data)
        : await batalkanPendaftaran(pendaftaranId!);

    setSedang(false);
    if (!hasil.ok) {
      setGalat(hasil.pesan);
      setMintaBatal(false);
      return;
    }
    router.refresh();
  }

  if (mode === "batal" && !mintaBatal) {
    return (
      <div className="flex flex-col gap-2">
        {galat && <Pesan nada="galat">{galat}</Pesan>}
        <Tombol variasi="biasa" onClick={() => setMintaBatal(true)}>
          Batalkan pendaftaran
        </Tombol>
      </div>
    );
  }

  if (mode === "batal") {
    return (
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-sm text-ink-soft">Batalkan pendaftaran Anda?</span>
        <Tombol variasi="biasa" disabled={sedang} onClick={jalankan}>
          {sedang ? "Memproses…" : "Ya, batalkan"}
        </Tombol>
        <Tombol variasi="biasa" onClick={() => setMintaBatal(false)}>
          Tidak
        </Tombol>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-end gap-2">
      {galat && <Pesan nada="galat">{galat}</Pesan>}
      <Tombol disabled={sedang} onClick={jalankan} className="px-5">
        {sedang ? "Mendaftarkan…" : "Daftar sekarang"}
      </Tombol>
    </div>
  );
}
