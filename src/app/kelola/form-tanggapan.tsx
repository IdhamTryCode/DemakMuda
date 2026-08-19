"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

import { Label, Pesan, Tombol } from "@/components/sk";
import {
  LABEL_STATUS_ASPIRASI,
  STATUS_ASPIRASI,
  type StatusAspirasi,
} from "@/lib/aspirasi";
import type { HasilAksi } from "@/lib/validasi";

export function FormTanggapan({
  awal,
  simpan,
}: {
  awal: { status: StatusAspirasi; tanggapan: string };
  simpan: (data: FormData) => Promise<HasilAksi>;
}) {
  const router = useRouter();
  const [galat, setGalat] = useState<string | null>(null);
  const [kolom, setKolom] = useState<Record<string, string>>({});
  const [sedang, setSedang] = useState(false);

  async function kirim(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setGalat(null);
    setKolom({});
    setSedang(true);

    const hasil = await simpan(new FormData(e.currentTarget));
    setSedang(false);

    if (!hasil.ok) {
      setGalat(hasil.pesan);
      setKolom(hasil.kolom ?? {});
      return;
    }
    router.push("/kelola/aspirasi");
    router.refresh();
  }

  return (
    <form onSubmit={kirim} className="flex flex-col gap-5">
      {galat && <Pesan nada="galat">{galat}</Pesan>}

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="status">Status</Label>
        <select
          id="status"
          name="status"
          defaultValue={awal.status}
          className="sk-field w-full px-3.5 py-2.5 text-sm"
        >
          {STATUS_ASPIRASI.map((s) => (
            <option key={s} value={s}>
              {LABEL_STATUS_ASPIRASI[s]}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="tanggapan">Tanggapan untuk pengirim</Label>
        <textarea
          id="tanggapan"
          name="tanggapan"
          defaultValue={awal.tanggapan}
          rows={8}
          maxLength={5000}
          aria-invalid={Boolean(kolom.tanggapan)}
          className="sk-field w-full px-3.5 py-2.5 text-sm leading-relaxed"
        />
        <p className="text-xs text-muted">
          Wajib diisi untuk setiap status selain &ldquo;Baru masuk&rdquo;.
          Tanggapan ini langsung terbaca oleh pengirimnya.
        </p>
        {kolom.tanggapan && <p className="text-xs text-danger">{kolom.tanggapan}</p>}
      </div>

      <div className="flex gap-3 pt-1">
        <Tombol type="submit" disabled={sedang}>
          {sedang ? "Menyimpan…" : "Simpan tanggapan"}
        </Tombol>
        <Tombol
          type="button"
          variasi="biasa"
          onClick={() => router.push("/kelola/aspirasi")}
        >
          Batal
        </Tombol>
      </div>
    </form>
  );
}
