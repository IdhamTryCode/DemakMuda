"use client";

import { useState, type FormEvent } from "react";

import { Kolom, Label, Pesan, Tombol } from "@/components/sk";
import { authClient } from "@/lib/auth-client";

/**
 * Tantangan kode saat masuk.
 *
 * Kode cadangan diterima di kolom yang sama — pengguna yang kehilangan ponsel
 * tidak perlu mencari halaman lain, dan itu justru saat ia paling panik.
 */
export function FormDuaLangkah({ lanjut }: { lanjut: string }) {
  const [galat, setGalat] = useState<string | null>(null);
  const [sedang, setSedang] = useState(false);

  async function kirim(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setGalat(null);
    setSedang(true);

    const data = new FormData(e.currentTarget);
    const kode = String(data.get("kode") ?? "").replace(/\s/g, "");
    const percaya = data.get("percayaPerangkat") === "on";

    // Kode autentikator selalu enam angka; selain itu diperlakukan sebagai
    // kode cadangan.
    const hasil = /^\d{6}$/.test(kode)
      ? await authClient.twoFactor.verifyTotp({ code: kode, trustDevice: percaya })
      : await authClient.twoFactor.verifyBackupCode({ code: kode });

    if (hasil.error) {
      setSedang(false);
      setGalat(
        hasil.error.status === 429
          ? "Terlalu banyak percobaan. Tunggu sebentar sebelum mencoba lagi."
          : "Kode tidak cocok. Periksa angka yang sedang tampil di aplikasi Anda.",
      );
      return;
    }

    // Pengalihan penuh, bukan router.push, supaya sesi baru terbaca sejak
    // permintaan pertama halaman berikutnya.
    window.location.href = lanjut;
  }

  return (
    <form onSubmit={kirim} className="flex flex-col gap-5">
      {galat && <Pesan nada="galat">{galat}</Pesan>}

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="kode">Kode autentikator</Label>
        <Kolom
          id="kode"
          name="kode"
          inputMode="numeric"
          autoComplete="one-time-code"
          autoFocus
          required
          maxLength={16}
          placeholder="123456"
          className="font-mono tracking-[0.3em]"
        />
        <p className="text-xs text-muted">
          Kehilangan ponsel? Masukkan salah satu kode cadangan Anda di kolom ini.
        </p>
      </div>

      <label className="flex items-center gap-2.5 text-sm text-ink-soft">
        <input
          type="checkbox"
          name="percayaPerangkat"
          defaultChecked
          className="accent-accent"
        />
        Percayai perangkat ini selama 30 hari
      </label>

      <Tombol type="submit" disabled={sedang}>
        {sedang ? "Memeriksa…" : "Lanjutkan"}
      </Tombol>
    </form>
  );
}
