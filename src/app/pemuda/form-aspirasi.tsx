"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

import { Kolom, Label, Pesan, Tombol } from "@/components/sk";
import type { HasilAksi } from "@/lib/validasi";

export function FormAspirasi({
  kirimkan,
}: {
  kirimkan: (data: FormData) => Promise<HasilAksi>;
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

    const hasil = await kirimkan(new FormData(e.currentTarget));
    setSedang(false);

    if (!hasil.ok) {
      setGalat(hasil.pesan);
      setKolom(hasil.kolom ?? {});
      return;
    }
    router.push("/pemuda/aspirasi");
    router.refresh();
  }

  return (
    <form onSubmit={kirim} className="flex flex-col gap-5">
      {galat && <Pesan nada="galat">{galat}</Pesan>}

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="judul">Pokok aspirasi</Label>
        <Kolom
          id="judul"
          name="judul"
          defaultValue=""
          required
          maxLength={160}
          placeholder="Satu kalimat yang merangkum usulan Anda"
          aria-invalid={Boolean(kolom.judul)}
        />
        {kolom.judul && <p className="text-xs text-danger">{kolom.judul}</p>}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="isi">Uraian</Label>
        <textarea
          id="isi"
          name="isi"
          required
          rows={10}
          maxLength={5000}
          aria-invalid={Boolean(kolom.isi)}
          className="sk-field w-full px-3.5 py-2.5 text-sm leading-relaxed"
        />
        <p className="text-xs text-muted">
          Jelaskan keadaannya, di mana terjadinya, dan apa yang Anda usulkan.
          Semakin jelas uraiannya, semakin mudah ditindaklanjuti.
        </p>
        {kolom.isi && <p className="text-xs text-danger">{kolom.isi}</p>}
      </div>

      <div className="flex gap-3 pt-1">
        <Tombol type="submit" disabled={sedang}>
          {sedang ? "Mengirim…" : "Kirim aspirasi"}
        </Tombol>
        <Tombol
          type="button"
          variasi="biasa"
          onClick={() => router.push("/pemuda/aspirasi")}
        >
          Batal
        </Tombol>
      </div>
    </form>
  );
}
