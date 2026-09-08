"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

import { Pesan, Tombol } from "@/components/sk";
import { BATAS_TEKS, KELOMPOK, PERTANYAAN, type Pertanyaan } from "@/lib/panduan";
import { buatPanduan } from "@/server/aksi-panduan";

/**
 * Survei Panduan Karier.
 *
 * Delapan dari sembilan pertanyaan cukup diketuk. Yang diketik hanya
 * cita-citanya, sebab hanya itu yang tidak dapat diringkas menjadi daftar
 * pilihan tanpa mempersempit jawabannya.
 *
 * Pertanyaannya dibangkitkan dari src/lib/panduan.ts, bukan ditulis ulang di
 * sini. Dengan begitu formulir dan penyusun prompt tidak mungkin melenceng:
 * menambah pilihan di satu tempat langsung terbaca keduanya.
 *
 * Menunggunya lama — 23 detik di mesin sendiri, dan 72 detik di produksi —
 * sehingga keadaan memuat di sini bukan hiasan. Tanpa itu orang akan
 * menyangka aplikasinya menggantung, menekan tombolnya dua kali, lalu
 * penekanan kedua ditolak pembatas sekali sehari dan ia mengira fiturnya
 * rusak.
 */
export function FormPanduan() {
  const router = useRouter();
  const [galat, setGalat] = useState<string | null>(null);
  const [sedang, setSedang] = useState(false);

  async function kirim(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setGalat(null);
    setSedang(true);

    const hasil = await buatPanduan(new FormData(e.currentTarget));
    setSedang(false);

    if (!hasil.ok) {
      setGalat(hasil.pesan);
      return;
    }
    // Halamannya memuat ulang dan menampilkan panduan yang baru tersusun.
    router.refresh();
  }

  return (
    <form onSubmit={kirim} className="flex flex-col gap-8">
      {KELOMPOK.map((kelompok) => (
        <fieldset key={kelompok} className="flex flex-col gap-5">
          <legend className="mb-1 text-xs font-semibold uppercase tracking-widest text-brass">
            {kelompok}
          </legend>
          {PERTANYAAN.filter((p) => p.kelompok === kelompok).map((p) => (
            <Tanya key={p.nama} p={p} />
          ))}
        </fieldset>
      ))}

      <div className="flex flex-col gap-3 border-t border-line pt-5">
        {/* Keterangan dan tombol berdampingan: keterangan yang muncul jauh
            dari tombol yang baru ditekan tidak terbaca oleh yang menekannya. */}
        <div className="flex flex-wrap items-center gap-3">
          <Tombol type="submit" disabled={sedang}>
            {sedang ? "Menyusun panduan…" : "Buatkan panduan saya"}
          </Tombol>
          {sedang && (
            <span className="text-sm text-muted">
              Perlu sekitar satu menit. Jangan tutup halaman ini.
            </span>
          )}
          {galat && !sedang && <Pesan nada="galat">{galat}</Pesan>}
        </div>
        <p className="text-xs text-muted">
          Jawabanmu dan panduannya bersifat pribadi — tidak tampil di Kartu
          Talenta yang dibuka umum. Panduan dapat dibuat sekali sehari.
        </p>
      </div>
    </form>
  );
}

function Tanya({ p }: { p: Pertanyaan }) {
  const idBantuan = p.bantuan ? `${p.nama}-bantuan` : undefined;

  if (p.jenis === "teks") {
    return (
      <div className="flex flex-col gap-1.5">
        <label htmlFor={p.nama} className="text-sm font-medium">
          {p.tanya}
        </label>
        {p.bantuan && (
          <p id={idBantuan} className="text-xs text-muted">
            {p.bantuan}
          </p>
        )}
        <input
          id={p.nama}
          name={p.nama}
          required
          maxLength={BATAS_TEKS}
          aria-describedby={idBantuan}
          className="sk-field w-full rounded-sk px-3 py-2 text-sm"
        />
      </div>
    );
  }

  // Pilihan dirender sebagai radio dan checkbox sungguhan, bukan tombol
  // bergaya. Keduanya sudah dapat dijelajahi papan ketik dan sudah dikenali
  // pembaca layar tanpa satu baris pun kode tambahan.
  const banyak = p.jenis === "banyak";
  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="mb-1.5 text-sm font-medium">{p.tanya}</legend>
      <div className="flex flex-wrap gap-2">
        {p.pilihan?.map((o) => (
          <label
            key={o.nilai}
            className="sk-kartu sk-pressable flex cursor-pointer items-center gap-2 rounded-full px-3.5 py-2 text-sm has-[:checked]:border-accent has-[:checked]:bg-accent-soft has-[:checked]:text-accent"
          >
            <input
              type={banyak ? "checkbox" : "radio"}
              name={p.nama}
              value={o.nilai}
              required={!banyak}
              className="h-3.5 w-3.5 accent-[var(--sk-accent)]"
            />
            {o.label}
          </label>
        ))}
      </div>
    </fieldset>
  );
}
