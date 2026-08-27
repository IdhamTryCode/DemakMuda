"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, type FormEvent } from "react";

import { PemilihGambar } from "@/components/pemilih-gambar";
import { Kolom, Label, Pesan, Tombol } from "@/components/sk";
import type { HasilAksi } from "@/lib/validasi";

type Pilihan = { id: string; nama: string };
type Desa = { id: string; nama: string; kecamatanId: string };

type Awal = {
  nama: string;
  fotoUrl: string;
  bio: string;
  telepon: string;
  tanggalLahir: string;
  jenisKelamin: string;
  kecamatanId: string;
  desaId: string;
  sekolahId: string;
  minat: string[];
  keterampilan: string[];
};

export function FormProfil({
  awal,
  kecamatan,
  desa,
  sekolah,
  minat,
  keterampilan,
  simpan,
}: {
  awal: Awal;
  kecamatan: Pilihan[];
  desa: Desa[];
  sekolah: Pilihan[];
  minat: Pilihan[];
  keterampilan: Pilihan[];
  simpan: (data: FormData) => Promise<HasilAksi>;
}) {
  const router = useRouter();
  const [galat, setGalat] = useState<string | null>(null);
  const [kolom, setKolom] = useState<Record<string, string>>({});
  const [sedang, setSedang] = useState(false);
  const [berhasil, setBerhasil] = useState(false);
  const [kecamatanId, setKecamatanId] = useState(awal.kecamatanId);

  // Daftar desa mengikuti kecamatan yang sedang dipilih. Tanpa ini pengguna
  // bisa memilih desa dari kecamatan lain, dan server akan membuangnya diam-diam.
  const desaTerpilih = useMemo(
    () => desa.filter((d) => d.kecamatanId === kecamatanId),
    [desa, kecamatanId],
  );

  async function kirim(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setGalat(null);
    setKolom({});
    setBerhasil(false);
    setSedang(true);

    const hasil = await simpan(new FormData(e.currentTarget));
    setSedang(false);

    if (!hasil.ok) {
      setGalat(hasil.pesan);
      setKolom(hasil.kolom ?? {});
      return;
    }
    setBerhasil(true);
    router.refresh();
  }

  return (
    <form onSubmit={kirim} className="flex flex-col gap-6">
      {galat && <Pesan nada="galat">{galat}</Pesan>}
      {berhasil && <Pesan nada="berhasil">Profil tersimpan.</Pesan>}

      <div className="flex flex-col gap-1.5">
        <PemilihGambar
          nama="fotoUrl"
          ruang="profil"
          awal={awal.fotoUrl}
          label="Foto diri (opsional)"
          keterangan="Tampil di Kartu Talenta Anda. Kartu itu dapat dibuka siapa saja lewat tautannya, jadi pilih foto yang memang Anda bagikan. Boleh dikosongkan — inisial nama yang akan dipakai."
        />
        {kolom.fotoUrl && <p className="text-xs text-danger">{kolom.fotoUrl}</p>}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="nama">Nama lengkap</Label>
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
          <Label htmlFor="tanggalLahir">Tanggal lahir</Label>
          <Kolom
            id="tanggalLahir"
            name="tanggalLahir"
            type="date"
            defaultValue={awal.tanggalLahir}
            aria-invalid={Boolean(kolom.tanggalLahir)}
          />
          <p className="text-xs text-muted">
            Dipakai memeriksa syarat usia kegiatan. Tidak ditampilkan ke umum.
          </p>
          {kolom.tanggalLahir && (
            <p className="text-xs text-danger">{kolom.tanggalLahir}</p>
          )}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="jenisKelamin">Jenis kelamin</Label>
          <select
            id="jenisKelamin"
            name="jenisKelamin"
            defaultValue={awal.jenisKelamin}
            className="sk-field w-full px-3.5 py-2.5 text-sm"
          >
            <option value="">Tidak diisi</option>
            <option value="LAKI_LAKI">Laki-laki</option>
            <option value="PEREMPUAN">Perempuan</option>
          </select>
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
            className="sk-field w-full px-3.5 py-2.5 text-sm"
          >
            <option value="">Tidak diisi</option>
            {kecamatan.map((k) => (
              <option key={k.id} value={k.id}>
                {k.nama}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="desaId">Desa / kelurahan</Label>
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

      <div className="grid gap-4 sm:grid-cols-2">
        {/* Daftar sekolah disembunyikan selama datanya belum disemai —
            kolom pilihan yang kosong terlihat seperti aplikasi rusak. */}
        {sekolah.length > 0 && (
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="sekolahId">Sekolah (opsional)</Label>
            <select
              id="sekolahId"
              name="sekolahId"
              defaultValue={awal.sekolahId}
              className="sk-field w-full px-3.5 py-2.5 text-sm"
            >
              <option value="">Tidak diisi</option>
              {sekolah.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.nama}
                </option>
              ))}
            </select>
          </div>
        )}
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="telepon">Nomor telepon (opsional)</Label>
          <Kolom
            id="telepon"
            name="telepon"
            defaultValue={awal.telepon}
            maxLength={20}
            placeholder="0812…"
            aria-invalid={Boolean(kolom.telepon)}
          />
          <p className="text-xs text-muted">
            Hanya terlihat oleh Anda dan panitia kegiatan yang Anda ikuti.
          </p>
          {kolom.telepon && <p className="text-xs text-danger">{kolom.telepon}</p>}
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="bio">Tentang Anda (opsional)</Label>
        <textarea
          id="bio"
          name="bio"
          defaultValue={awal.bio}
          rows={4}
          maxLength={500}
          className="sk-field w-full px-3.5 py-2.5 text-sm"
          placeholder="Ceritakan singkat minat dan kegiatan Anda."
        />
        {kolom.bio && <p className="text-xs text-danger">{kolom.bio}</p>}
      </div>

      <PilihBanyak
        judul="Bidang minat"
        keterangan="Dipakai menyaring peluang yang cocok untuk Anda."
        nama="minat"
        pilihan={minat}
        terpilih={awal.minat}
      />

      <PilihBanyak
        judul="Keterampilan"
        keterangan="Tampil di Kartu Talenta publik Anda."
        nama="keterampilan"
        pilihan={keterampilan}
        terpilih={awal.keterampilan}
      />

      <div className="flex gap-3 pt-1">
        <Tombol type="submit" disabled={sedang}>
          {sedang ? "Menyimpan…" : "Simpan profil"}
        </Tombol>
      </div>
    </form>
  );
}

function PilihBanyak({
  judul,
  keterangan,
  nama,
  pilihan,
  terpilih,
}: {
  judul: string;
  keterangan: string;
  nama: string;
  pilihan: Pilihan[];
  terpilih: string[];
}) {
  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="text-xs font-semibold uppercase tracking-wider text-muted">
        {judul}
      </legend>
      <p className="text-xs text-muted">{keterangan}</p>
      <div className="flex flex-wrap gap-2 pt-1">
        {pilihan.map((p) => (
          <label
            key={p.id}
            className="sk-kartu sk-pressable flex cursor-pointer items-center gap-2 rounded-full px-3 py-1.5 text-sm text-ink-soft has-checked:bg-accent-soft has-checked:text-accent"
          >
            <input
              type="checkbox"
              name={nama}
              value={p.id}
              defaultChecked={terpilih.includes(p.id)}
              className="accent-accent"
            />
            {p.nama}
          </label>
        ))}
      </div>
    </fieldset>
  );
}
