"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

import { PemilihGambar } from "@/components/pemilih-gambar";
import { Kolom, Label, Pesan, Tombol } from "@/components/sk";
import type { HasilAksi } from "@/lib/validasi";

type Awal = {
  judul: string;
  ringkasan: string;
  isi: string;
  gambarUrl: string;
  status: "DRAF" | "TERBIT";
};

const KOSONG: Awal = {
  judul: "",
  ringkasan: "",
  isi: "",
  gambarUrl: "",
  status: "DRAF",
};

export function FormKabar({
  awal = KOSONG,
  simpan,
}: {
  awal?: Awal;
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
    router.push("/kelola/kabar");
    router.refresh();
  }

  return (
    <form onSubmit={kirim} className="flex flex-col gap-5">
      {galat && <Pesan nada="galat">{galat}</Pesan>}

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="judul">Judul</Label>
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

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="ringkasan">Ringkasan</Label>
        <textarea
          id="ringkasan"
          name="ringkasan"
          defaultValue={awal.ringkasan}
          required
          rows={2}
          maxLength={300}
          aria-invalid={Boolean(kolom.ringkasan)}
          className="sk-field w-full px-3.5 py-2.5 text-sm"
        />
        <p className="text-xs text-muted">
          Satu atau dua kalimat yang tampil di daftar kabar.
        </p>
        {kolom.ringkasan && <p className="text-xs text-danger">{kolom.ringkasan}</p>}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="isi">Isi</Label>
        <textarea
          id="isi"
          name="isi"
          defaultValue={awal.isi}
          required
          rows={14}
          aria-invalid={Boolean(kolom.isi)}
          className="sk-field w-full px-3.5 py-2.5 font-mono text-[13px] leading-relaxed"
        />
        <p className="text-xs text-muted">
          Ditulis dengan Markdown. <code>**tebal**</code>, <code>## judul</code>,{" "}
          <code>- daftar</code>. HTML tidak diterima.
        </p>
        {kolom.isi && <p className="text-xs text-danger">{kolom.isi}</p>}
      </div>

      <div className="flex flex-col gap-1.5">
        <PemilihGambar
          nama="gambarUrl"
          ruang="berita"
          awal={awal.gambarUrl}
          label="Gambar kabar (opsional)"
          keterangan="JPG, PNG, atau WEBP, maksimal 2 MB. Tampil di daftar Kabar dan di atas isinya."
        />
        {kolom.gambarUrl && <p className="text-xs text-danger">{kolom.gambarUrl}</p>}
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
          <option value="TERBIT">Terbit — tampil di Kabar Demak</option>
        </select>
      </div>

      <div className="flex gap-3 pt-1">
        <Tombol type="submit" disabled={sedang}>
          {sedang ? "Menyimpan…" : "Simpan"}
        </Tombol>
        <Tombol
          type="button"
          variasi="biasa"
          onClick={() => router.push("/kelola/kabar")}
        >
          Batal
        </Tombol>
      </div>
    </form>
  );
}
