"use client";

import { upload } from "@vercel/blob/client";
import Image from "next/image";
import { useRef, useState } from "react";

import {
  BATAS_GAMBAR,
  JENIS_GAMBAR,
  jalurBlob,
  type RuangBlob,
} from "@/lib/blob";

/**
 * Pemilih gambar yang mengunggah langsung ke Vercel Blob.
 *
 * Berkasnya tidak melewati Server Action — batas badan permintaan di peladen
 * tanpa status membuat cara itu rapuh untuk berkas besar. Yang masuk ke
 * formulir hanyalah alamat hasil unggah, lewat satu kolom tersembunyi, dan
 * alamat itu tetap diperiksa ulang oleh skema Zod sebelum tersimpan.
 *
 * Ukuran dan jenis berkas diperiksa dua kali: di sini supaya penggunanya tahu
 * seketika, dan di peladen karena pemeriksaan di peramban selalu dapat
 * dilewati.
 */
export function PemilihGambar({
  nama,
  ruang,
  awal = "",
  label,
  keterangan,
}: {
  /** Nama kolom tersembunyi yang dibaca Server Action. */
  nama: string;
  ruang: RuangBlob;
  awal?: string;
  label: string;
  keterangan?: string;
}) {
  const berkas = useRef<HTMLInputElement>(null);
  const [alamat, setAlamat] = useState(awal);
  const [sedang, setSedang] = useState(false);
  const [kemajuan, setKemajuan] = useState(0);
  const [galat, setGalat] = useState<string | null>(null);

  async function pilih(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setGalat(null);

    if (!(JENIS_GAMBAR as readonly string[]).includes(f.type)) {
      setGalat("Hanya menerima gambar JPG, PNG, atau WEBP.");
      e.target.value = "";
      return;
    }
    if (f.size > BATAS_GAMBAR) {
      const mb = (BATAS_GAMBAR / 1024 / 1024).toFixed(0);
      setGalat(`Ukuran gambar maksimal ${mb} MB. Berkas Anda lebih besar.`);
      e.target.value = "";
      return;
    }

    setSedang(true);
    setKemajuan(0);
    try {
      const hasil = await upload(jalurBlob(ruang, f.name), f, {
        access: "public",
        handleUploadUrl: "/api/unggah",
        onUploadProgress: (p) => setKemajuan(Math.round(p.percentage)),
      });
      setAlamat(hasil.url);
    } catch (err) {
      setGalat(
        err instanceof Error ? err.message : "Unggahan gagal. Coba lagi.",
      );
    } finally {
      setSedang(false);
      e.target.value = "";
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs font-semibold uppercase tracking-wider text-muted">
        {label}
      </span>

      <input type="hidden" name={nama} value={alamat} />

      {alamat && (
        <div className="sk-inset w-fit p-2">
          <Image
            src={alamat}
            alt="Pratinjau gambar yang diunggah"
            width={320}
            height={200}
            className="h-40 w-auto rounded-[6px] object-contain"
          />
        </div>
      )}

      <input
        ref={berkas}
        type="file"
        accept={JENIS_GAMBAR.join(",")}
        onChange={pilih}
        className="hidden"
      />

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          disabled={sedang}
          onClick={() => berkas.current?.click()}
          className="sk-raised sk-pressable rounded-sk px-3.5 py-2 text-xs font-medium text-ink-soft disabled:opacity-60"
        >
          {sedang
            ? `Mengunggah… ${kemajuan}%`
            : alamat
              ? "Ganti gambar"
              : "Pilih gambar"}
        </button>

        {alamat && !sedang && (
          <button
            type="button"
            onClick={() => setAlamat("")}
            className="sk-raised sk-pressable rounded-sk px-3.5 py-2 text-xs font-medium text-ink-soft"
          >
            Hapus gambar
          </button>
        )}
      </div>

      {sedang && (
        <div className="sk-inset h-1.5 w-full max-w-xs overflow-hidden rounded-full">
          <div
            className="h-full rounded-full bg-accent transition-all"
            style={{ width: `${kemajuan}%` }}
          />
        </div>
      )}

      {keterangan && <p className="text-xs text-muted">{keterangan}</p>}
      {galat && <p className="text-xs text-danger">{galat}</p>}
    </div>
  );
}
