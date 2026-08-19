"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

import { Kolom, Label, Pesan, Tombol } from "@/components/sk";
import { authClient } from "@/lib/auth-client";

export function MatikanDuaLangkah({ wajib }: { wajib: boolean }) {
  const router = useRouter();
  const [buka, setBuka] = useState(false);
  const [sedang, setSedang] = useState(false);
  const [galat, setGalat] = useState<string | null>(null);

  if (wajib) {
    return (
      <p className="text-sm text-muted">
        Peran Anda mewajibkan dua langkah, jadi ia tidak dapat dimatikan. Minta
        superadmin menurunkan peran akun ini lebih dulu bila memang perlu.
      </p>
    );
  }

  if (!buka) {
    return (
      <Tombol variasi="biasa" className="w-fit" onClick={() => setBuka(true)}>
        Matikan dua langkah
      </Tombol>
    );
  }

  async function matikan(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setGalat(null);
    setSedang(true);

    const data = new FormData(e.currentTarget);
    const { error } = await authClient.twoFactor.disable({
      password: String(data.get("kataSandi") ?? ""),
    });

    setSedang(false);
    if (error) {
      setGalat(error.status === 401 ? "Kata sandi tidak cocok." : "Gagal mematikan.");
      return;
    }
    setBuka(false);
    router.refresh();
  }

  return (
    <form onSubmit={matikan} className="flex flex-col gap-4">
      {galat && <Pesan nada="galat">{galat}</Pesan>}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="sandiMatikan">Tegaskan kata sandi untuk mematikan</Label>
        <Kolom
          id="sandiMatikan"
          name="kataSandi"
          type="password"
          autoComplete="current-password"
          required
          className="max-w-80"
        />
      </div>
      <div className="flex gap-3">
        <Tombol type="submit" variasi="biasa" disabled={sedang}>
          {sedang ? "Memproses…" : "Ya, matikan"}
        </Tombol>
        <Tombol type="button" variasi="biasa" onClick={() => setBuka(false)}>
          Batal
        </Tombol>
      </div>
    </form>
  );
}
