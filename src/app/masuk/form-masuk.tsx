"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

import { Kolom, Label, Pesan, Tombol } from "@/components/sk";
import { authClient } from "@/lib/auth-client";

export function FormMasuk({ lanjut }: { lanjut: string }) {
  const router = useRouter();
  const [galat, setGalat] = useState<string | null>(null);
  const [sedang, setSedang] = useState(false);

  async function kirim(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setGalat(null);
    setSedang(true);

    const data = new FormData(e.currentTarget);
    const { error } = await authClient.signIn.email({
      email: String(data.get("email") ?? ""),
      password: String(data.get("kataSandi") ?? ""),
    });

    if (error) {
      // Pesan disamakan untuk surel salah maupun kata sandi salah, agar
      // halaman ini tidak bisa dipakai menebak surel mana yang terdaftar.
      setGalat(
        error.status === 403
          ? "Akun belum diverifikasi. Periksa tautan verifikasi yang dikirim saat mendaftar."
          : "Surel atau kata sandi tidak cocok.",
      );
      setSedang(false);
      return;
    }

    router.push(lanjut);
    router.refresh();
  }

  return (
    <form onSubmit={kirim} className="flex flex-col gap-5">
      {galat && <Pesan nada="galat">{galat}</Pesan>}

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
          autoComplete="current-password"
          required
          placeholder="••••••••••"
        />
      </div>

      <Tombol type="submit" disabled={sedang} className="mt-1">
        {sedang ? "Memeriksa…" : "Masuk"}
      </Tombol>
    </form>
  );
}
