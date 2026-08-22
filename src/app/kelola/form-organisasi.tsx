"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, type FormEvent } from "react";

import { PemilihGambar } from "@/components/pemilih-gambar";
import { Kolom, Label, Pesan, Tombol } from "@/components/sk";
import {
  JENIS_ORGANISASI,
  LABEL_ORGANISASI,
  type JenisOrganisasi,
} from "@/lib/organisasi";
import type { HasilAksi } from "@/lib/validasi";

type Desa = { id: string; nama: string; kecamatanId: string };

type Awal = {
  nama: string;
  jenis: JenisOrganisasi;
  deskripsi: string;
  kontak: string;
  logoUrl: string;
  kecamatanId: string;
  desaId: string;
};

const KOSONG: Awal = {
  nama: "",
  jenis: "KARANG_TARUNA",
  deskripsi: "",
  kontak: "",
  logoUrl: "",
  kecamatanId: "",
  desaId: "",
};

export function FormOrganisasi({
  awal = KOSONG,
  kecamatan,
  desa,
  simpan,
}: {
  awal?: Awal;
  kecamatan: { id: string; nama: string }[];
  desa: Desa[];
  simpan: (data: FormData) => Promise<HasilAksi>;
}) {
  const router = useRouter();
  const [galat, setGalat] = useState<string | null>(null);
  const [kolom, setKolom] = useState<Record<string, string>>({});
  const [sedang, setSedang] = useState(false);
  const [kecamatanId, setKecamatanId] = useState(awal.kecamatanId);

  const desaTerpilih = useMemo(
    () => desa.filter((d) => d.kecamatanId === kecamatanId),
    [desa, kecamatanId],
  );

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
    router.push("/kelola/organisasi");
    router.refresh();
  }

  return (
    <form onSubmit={kirim} className="flex flex-col gap-5">
      {galat && <Pesan nada="galat">{galat}</Pesan>}

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="nama">Nama organisasi</Label>
        <Kolom
          id="nama"
          name="nama"
          defaultValue={awal.nama}
          required
          maxLength={120}
          aria-invalid={Boolean(kolom.nama)}
        />
        {kolom.nama && <p className="text-xs text-danger">{kolom.nama}</p>}
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
            {JENIS_ORGANISASI.map((j) => (
              <option key={j} value={j}>
                {LABEL_ORGANISASI[j]}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="kontak">Kontak (opsional)</Label>
          <Kolom
            id="kontak"
            name="kontak"
            defaultValue={awal.kontak}
            maxLength={120}
            placeholder="Nomor telepon atau surel pengurus"
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="kecamatanId">Kecamatan</Label>
          <select
            id="kecamatanId"
            name="kecamatanId"
            value={kecamatanId}
            onChange={(e) => setKecamatanId(e.target.value)}
            required
            className="sk-field w-full px-3.5 py-2.5 text-sm"
          >
            <option value="">Pilih kecamatan</option>
            {kecamatan.map((k) => (
              <option key={k.id} value={k.id}>
                {k.nama}
              </option>
            ))}
          </select>
          {kolom.kecamatanId && (
            <p className="text-xs text-danger">{kolom.kecamatanId}</p>
          )}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="desaId">Desa / kelurahan (opsional)</Label>
          <select
            id="desaId"
            name="desaId"
            defaultValue={awal.desaId}
            key={kecamatanId}
            disabled={desaTerpilih.length === 0}
            className="sk-field w-full px-3.5 py-2.5 text-sm disabled:opacity-60"
          >
            <option value="">
              {kecamatanId ? "Tidak diisi" : "Pilih kecamatan dulu"}
            </option>
            {desaTerpilih.map((d) => (
              <option key={d.id} value={d.id}>
                {d.nama}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="deskripsi">Tentang organisasi (opsional)</Label>
        <textarea
          id="deskripsi"
          name="deskripsi"
          defaultValue={awal.deskripsi}
          rows={8}
          className="sk-field w-full px-3.5 py-2.5 font-mono text-[13px] leading-relaxed"
        />
        <p className="text-xs text-muted">
          Ditulis dengan Markdown. HTML tidak diterima.
        </p>
        {kolom.deskripsi && <p className="text-xs text-danger">{kolom.deskripsi}</p>}
      </div>

      <div className="flex flex-col gap-1.5">
        <PemilihGambar
          nama="logoUrl"
          ruang="organisasi"
          awal={awal.logoUrl}
          label="Logo organisasi (opsional)"
          keterangan="JPG, PNG, atau WEBP, maksimal 2 MB. Bentuk persegi tampil paling rapi."
        />
        {kolom.logoUrl && <p className="text-xs text-danger">{kolom.logoUrl}</p>}
      </div>

      <div className="flex gap-3 pt-1">
        <Tombol type="submit" disabled={sedang}>
          {sedang ? "Menyimpan…" : "Simpan"}
        </Tombol>
        <Tombol
          type="button"
          variasi="biasa"
          onClick={() => router.push("/kelola/organisasi")}
        >
          Batal
        </Tombol>
      </div>
    </form>
  );
}
