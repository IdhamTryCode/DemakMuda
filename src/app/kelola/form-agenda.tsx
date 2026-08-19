"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

import { Kolom, Label, Pesan, Tombol } from "@/components/sk";
import type { HasilAksi } from "@/lib/validasi";

type Awal = {
  judul: string;
  deskripsi: string;
  lokasi: string;
  mulai: string;
  selesai: string;
  kecamatanId: string;
  status: "DRAF" | "TERBIT";
};

const KOSONG: Awal = {
  judul: "",
  deskripsi: "",
  lokasi: "",
  mulai: "",
  selesai: "",
  kecamatanId: "",
  status: "DRAF",
};

export function FormAgenda({
  awal = KOSONG,
  kecamatan,
  simpan,
}: {
  awal?: Awal;
  kecamatan: { id: string; nama: string }[];
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
    router.push("/kelola/agenda");
    router.refresh();
  }

  return (
    <form onSubmit={kirim} className="flex flex-col gap-5">
      {galat && <Pesan nada="galat">{galat}</Pesan>}

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="judul">Nama kegiatan</Label>
        <Kolom
          id="judul"
          name="judul"
          defaultValue={awal.judul}
          required
          maxLength={160}
          aria-invalid={Boolean(kolom.judul)}
        />
        {kolom.judul && <p className="text-xs text-danger">{kolom.judul}</p>}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="mulai">Mulai</Label>
          <Kolom
            id="mulai"
            name="mulai"
            type="datetime-local"
            defaultValue={awal.mulai}
            required
            aria-invalid={Boolean(kolom.mulai)}
          />
          {kolom.mulai && <p className="text-xs text-danger">{kolom.mulai}</p>}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="selesai">Selesai (opsional)</Label>
          <Kolom
            id="selesai"
            name="selesai"
            type="datetime-local"
            defaultValue={awal.selesai}
            aria-invalid={Boolean(kolom.selesai)}
          />
          {kolom.selesai && <p className="text-xs text-danger">{kolom.selesai}</p>}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="lokasi">Lokasi (opsional)</Label>
          <Kolom
            id="lokasi"
            name="lokasi"
            defaultValue={awal.lokasi}
            maxLength={200}
            placeholder="Balai Desa, Alun-alun, dsb."
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="kecamatanId">Kecamatan (opsional)</Label>
          <select
            id="kecamatanId"
            name="kecamatanId"
            defaultValue={awal.kecamatanId}
            className="sk-field w-full px-3.5 py-2.5 text-sm"
          >
            <option value="">Tidak ditentukan</option>
            {kecamatan.map((k) => (
              <option key={k.id} value={k.id}>
                {k.nama}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="deskripsi">Keterangan</Label>
        <textarea
          id="deskripsi"
          name="deskripsi"
          defaultValue={awal.deskripsi}
          required
          rows={10}
          aria-invalid={Boolean(kolom.deskripsi)}
          className="sk-field w-full px-3.5 py-2.5 font-mono text-[13px] leading-relaxed"
        />
        <p className="text-xs text-muted">
          Ditulis dengan Markdown. HTML tidak diterima.
        </p>
        {kolom.deskripsi && <p className="text-xs text-danger">{kolom.deskripsi}</p>}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="status">Status</Label>
        <select
          id="status"
          name="status"
          defaultValue={awal.status}
          className="sk-field w-full px-3.5 py-2.5 text-sm"
        >
          <option value="DRAF">Draf — belum tampil di halaman publik</option>
          <option value="TERBIT">Terbit — tampil di Agenda Demak</option>
        </select>
      </div>

      <div className="flex gap-3 pt-1">
        <Tombol type="submit" disabled={sedang}>
          {sedang ? "Menyimpan…" : "Simpan"}
        </Tombol>
        <Tombol
          type="button"
          variasi="biasa"
          onClick={() => router.push("/kelola/agenda")}
        >
          Batal
        </Tombol>
      </div>
    </form>
  );
}
