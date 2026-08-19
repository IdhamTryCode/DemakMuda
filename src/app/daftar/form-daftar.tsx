"use client";

import { useState, type FormEvent } from "react";

import { Kolom, Label, Pesan, Tombol } from "@/components/sk";
import { authClient } from "@/lib/auth-client";

const PANJANG_SANDI_MIN = 10;

export function FormDaftar() {
  const [galat, setGalat] = useState<string | null>(null);
  const [berhasil, setBerhasil] = useState(false);
  const [sedang, setSedang] = useState(false);

  async function kirim(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setGalat(null);

    const data = new FormData(e.currentTarget);
    const kataSandi = String(data.get("kataSandi") ?? "");

    if (kataSandi.length < PANJANG_SANDI_MIN) {
      setGalat(`Kata sandi minimal ${PANJANG_SANDI_MIN} karakter.`);
      return;
    }

    setSedang(true);
    const { error } = await authClient.signUp.email({
      name: String(data.get("nama") ?? ""),
      email: String(data.get("email") ?? ""),
      password: kataSandi,
    });
    setSedang(false);

    if (error) {
      setGalat(error.message ?? "Pendaftaran gagal. Coba beberapa saat lagi.");
      return;
    }
    setBerhasil(true);
  }

  if (berhasil) {
    return (
      <Pesan nada="berhasil">
        Akun dibuat. Tautan verifikasi sudah dikirim ke surel Anda — buka tautan
        itu lebih dulu sebelum masuk.
      </Pesan>
    );
  }

  return (
    <form onSubmit={kirim} className="flex flex-col gap-5">
      {galat && <Pesan nada="galat">{galat}</Pesan>}

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="nama">Nama lengkap</Label>
        <Kolom id="nama" name="nama" autoComplete="name" required maxLength={120} />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="email">Surel</Label>
        <Kolom
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="nama@contoh.id"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="kataSandi">Kata sandi</Label>
        <Kolom
          id="kataSandi"
          name="kataSandi"
          type="password"
          autoComplete="new-password"
          required
          minLength={PANJANG_SANDI_MIN}
        />
        <p className="text-xs text-muted">
          Minimal {PANJANG_SANDI_MIN} karakter.
        </p>
      </div>

      <Tombol type="submit" disabled={sedang} className="mt-1">
        {sedang ? "Mendaftarkan…" : "Buat akun"}
      </Tombol>
    </form>
  );
}
