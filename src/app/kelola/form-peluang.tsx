"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

import { Kolom, Label, Pesan, Tombol } from "@/components/sk";
import { JENIS_PELUANG, LABEL_JENIS, type JenisPeluang } from "@/lib/peluang";
import type { HasilAksi } from "@/lib/validasi";

type Awal = {
  judul: string;
  jenis: JenisPeluang;
  deskripsi: string;
  tautanLuar: string;
  tenggat: string;
  usiaMin: string;
  usiaMaks: string;
  minat: string[];
  status: "DRAF" | "TERBIT";
};

const KOSONG: Awal = {
  judul: "",
  jenis: "LOMBA",
  deskripsi: "",
  tautanLuar: "",
  tenggat: "",
  usiaMin: "16",
  usiaMaks: "30",
  minat: [],
  status: "DRAF",
};

export function FormPeluang({
  awal = KOSONG,
  minat,
  simpan,
}: {
  awal?: Awal;
  minat: { id: string; nama: string }[];
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
    router.push("/kelola/peluang");
    router.refresh();
  }

  return (
    <form onSubmit={kirim} className="flex flex-col gap-5">
      {galat && <Pesan nada="galat">{galat}</Pesan>}

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="judul">Judul peluang</Label>
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
          <Label htmlFor="jenis">Jenis</Label>
          <select
            id="jenis"
            name="jenis"
            defaultValue={awal.jenis}
            className="sk-field w-full px-3.5 py-2.5 text-sm"
          >
            {JENIS_PELUANG.map((j) => (
              <option key={j} value={j}>
                {LABEL_JENIS[j]}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="tenggat">Tenggat pendaftaran (opsional)</Label>
          <Kolom
            id="tenggat"
            name="tenggat"
            type="datetime-local"
            defaultValue={awal.tenggat}
            aria-invalid={Boolean(kolom.tenggat)}
          />
          {kolom.tenggat && <p className="text-xs text-danger">{kolom.tenggat}</p>}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="usiaMin">Usia minimal</Label>
          <Kolom
            id="usiaMin"
            name="usiaMin"
            type="number"
            min={0}
            max={99}
            defaultValue={awal.usiaMin}
            aria-invalid={Boolean(kolom.usiaMin)}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="usiaMaks">Usia maksimal</Label>
          <Kolom
            id="usiaMaks"
            name="usiaMaks"
            type="number"
            min={0}
            max={99}
            defaultValue={awal.usiaMaks}
            aria-invalid={Boolean(kolom.usiaMaks)}
          />
          {kolom.usiaMaks && <p className="text-xs text-danger">{kolom.usiaMaks}</p>}
        </div>
      </div>

      <fieldset className="flex flex-col gap-2">
        <legend className="text-xs font-semibold uppercase tracking-wider text-muted">
          Bidang minat
        </legend>
        <p className="text-xs text-muted">
          Menentukan pemuda mana yang melihat peluang ini saat menyaring.
        </p>
        <div className="flex flex-wrap gap-2 pt-1">
          {minat.map((m) => (
            <label
              key={m.id}
              className="sk-raised sk-pressable flex cursor-pointer items-center gap-2 rounded-full px-3 py-1.5 text-sm text-ink-soft has-checked:bg-accent-soft has-checked:text-accent"
            >
              <input
                type="checkbox"
                name="minat"
                value={m.id}
                defaultChecked={awal.minat.includes(m.id)}
                className="accent-accent"
              />
              {m.nama}
            </label>
          ))}
        </div>
      </fieldset>

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
        <Label htmlFor="tautanLuar">Tautan pendaftaran (opsional)</Label>
        <Kolom
          id="tautanLuar"
          name="tautanLuar"
          type="url"
          defaultValue={awal.tautanLuar}
          placeholder="https://…"
          aria-invalid={Boolean(kolom.tautanLuar)}
        />
        <p className="text-xs text-muted">Hanya menerima alamat http:// atau https://</p>
        {kolom.tautanLuar && <p className="text-xs text-danger">{kolom.tautanLuar}</p>}
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
          <option value="TERBIT">Terbit — tampil di Papan Peluang</option>
        </select>
      </div>

      <div className="flex gap-3 pt-1">
        <Tombol type="submit" disabled={sedang}>
          {sedang ? "Menyimpan…" : "Simpan"}
        </Tombol>
        <Tombol
          type="button"
          variasi="biasa"
          onClick={() => router.push("/kelola/peluang")}
        >
          Batal
        </Tombol>
      </div>
    </form>
  );
}
