"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

import { Kolom, Label, Pesan, Tombol } from "@/components/sk";
import { JENIS_KARYA, LABEL_JENIS_KARYA, type JenisKarya } from "@/lib/karya";
import type { HasilAksi } from "@/lib/validasi";

type Awal = {
  judul: string;
  jenis: JenisKarya;
  deskripsi: string;
  gambarUrl: string;
  tautanLuar: string;
  status: "DRAF" | "TERBIT";
};

const KOSONG: Awal = {
  judul: "",
  jenis: "PRODUK",
  deskripsi: "",
  gambarUrl: "",
  tautanLuar: "",
  status: "TERBIT",
};

export function FormKarya({
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
    router.push("/pemuda/karya");
    router.refresh();
  }

  return (
    <form onSubmit={kirim} className="flex flex-col gap-5">
      {galat && <Pesan nada="galat">{galat}</Pesan>}

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="judul">Judul karya</Label>
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
        <Label htmlFor="jenis">Jenis</Label>
        <select
          id="jenis"
          name="jenis"
          defaultValue={awal.jenis}
          className="sk-field w-full px-3.5 py-2.5 text-sm"
        >
          {JENIS_KARYA.map((j) => (
            <option key={j} value={j}>
              {LABEL_JENIS_KARYA[j]}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="deskripsi">Cerita di balik karya</Label>
        <textarea
          id="deskripsi"
          name="deskripsi"
          defaultValue={awal.deskripsi}
          required
          rows={12}
          aria-invalid={Boolean(kolom.deskripsi)}
          className="sk-field w-full px-3.5 py-2.5 font-mono text-[13px] leading-relaxed"
        />
        <p className="text-xs text-muted">
          Ceritakan apa yang Anda buat, bagaimana prosesnya, dan apa manfaatnya.
          Ditulis dengan Markdown. HTML tidak diterima.
        </p>
        {kolom.deskripsi && <p className="text-xs text-danger">{kolom.deskripsi}</p>}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="tautanLuar">Tautan karya (opsional)</Label>
        <Kolom
          id="tautanLuar"
          name="tautanLuar"
          type="url"
          defaultValue={awal.tautanLuar}
          placeholder="https://…"
          aria-invalid={Boolean(kolom.tautanLuar)}
        />
        <p className="text-xs text-muted">
          Misalnya kanal video, toko daring, atau repositori kode.
        </p>
        {kolom.tautanLuar && <p className="text-xs text-danger">{kolom.tautanLuar}</p>}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="gambarUrl">Alamat gambar (opsional)</Label>
        <Kolom
          id="gambarUrl"
          name="gambarUrl"
          type="url"
          defaultValue={awal.gambarUrl}
          placeholder="https://…"
          aria-invalid={Boolean(kolom.gambarUrl)}
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
          <option value="TERBIT">Terbit — tampil di Ruang Karya</option>
          <option value="DRAF">Draf — hanya Anda yang dapat melihatnya</option>
        </select>
      </div>

      <div className="flex gap-3 pt-1">
        <Tombol type="submit" disabled={sedang}>
          {sedang ? "Menyimpan…" : "Simpan"}
        </Tombol>
        <Tombol
          type="button"
          variasi="biasa"
          onClick={() => router.push("/pemuda/karya")}
        >
          Batal
        </Tombol>
      </div>
    </form>
  );
}
