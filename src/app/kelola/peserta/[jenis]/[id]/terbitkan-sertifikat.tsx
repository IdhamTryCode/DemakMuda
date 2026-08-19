"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

import { Kolom, Label, Pesan, Tombol } from "@/components/sk";
import { terbitkanSertifikat } from "@/server/aksi-sertifikat";

export function TerbitkanSertifikat({
  pendaftaranId,
  status,
  judulBawaan,
  sertifikat,
}: {
  pendaftaranId: string;
  status: string;
  judulBawaan: string;
  sertifikat: { kode: string; dibatalkan: boolean } | null;
}) {
  const router = useRouter();
  const [buka, setBuka] = useState(false);
  const [sedang, setSedang] = useState(false);
  const [galat, setGalat] = useState<string | null>(null);

  if (sertifikat) {
    return (
      <Link
        href={`/cek/${sertifikat.kode}`}
        className="sk-raised sk-pressable rounded-sk px-3 py-2 font-mono text-xs text-ink-soft"
        title={sertifikat.dibatalkan ? "Sertifikat dibatalkan" : "Lihat sertifikat"}
      >
        {sertifikat.dibatalkan ? "dibatalkan" : sertifikat.kode}
      </Link>
    );
  }

  // Sertifikat hanya untuk yang kehadirannya sudah dicatat. Aturan ini juga
  // ditegakkan di server; di sini hanya agar tombolnya tidak menyesatkan.
  if (status !== "HADIR") {
    return (
      <span className="text-xs text-muted" title="Tandai hadir lebih dulu">
        belum hadir
      </span>
    );
  }

  if (!buka) {
    return (
      <Tombol variasi="biasa" className="text-xs" onClick={() => setBuka(true)}>
        Terbitkan sertifikat
      </Tombol>
    );
  }

  async function kirim(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setGalat(null);
    setSedang(true);
    const data = new FormData(e.currentTarget);
    data.set("pendaftaranId", pendaftaranId);
    const hasil = await terbitkanSertifikat(data);
    setSedang(false);
    if (!hasil.ok) {
      setGalat(hasil.pesan);
      return;
    }
    setBuka(false);
    router.refresh();
  }

  return (
    <form onSubmit={kirim} className="flex w-full flex-col gap-3 sm:w-80">
      {galat && <Pesan nada="galat">{galat}</Pesan>}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor={`judul-${pendaftaranId}`}>Judul sertifikat</Label>
        <Kolom
          id={`judul-${pendaftaranId}`}
          name="judul"
          defaultValue={judulBawaan}
          required
          maxLength={160}
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor={`peringkat-${pendaftaranId}`}>Peringkat (opsional)</Label>
        <Kolom
          id={`peringkat-${pendaftaranId}`}
          name="peringkat"
          maxLength={60}
          placeholder="Juara 1, Peserta, dsb."
        />
      </div>
      <div className="flex gap-2">
        <Tombol type="submit" disabled={sedang} className="text-xs">
          {sedang ? "Menerbitkan…" : "Terbitkan"}
        </Tombol>
        <Tombol
          type="button"
          variasi="biasa"
          className="text-xs"
          onClick={() => setBuka(false)}
        >
          Batal
        </Tombol>
      </div>
    </form>
  );
}
