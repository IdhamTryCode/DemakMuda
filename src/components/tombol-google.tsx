"use client";

import { useState } from "react";

import { Pesan } from "@/components/sk";
import { authClient } from "@/lib/auth-client";

/**
 * Tombol masuk dengan Google.
 *
 * Hanya dirender bila peladen menyatakan kredensial Google terpasang (lihat
 * MASUK_GOOGLE di src/lib/auth.ts). Tombol yang tampil tetapi gagal karena
 * variabel lingkungannya kosong lebih buruk daripada tidak ada tombol —
 * apalagi di depan juri.
 *
 * Pengguna baru diantar ke halaman profil, bukan ke dasbor: akun dari Google
 * hanya membawa nama dan surel, sedangkan Kartu Talenta baru berguna setelah
 * kecamatan dan bidang minatnya diisi.
 */
export function TombolGoogle({ lanjut }: { lanjut: string }) {
  const [galat, setGalat] = useState<string | null>(null);
  const [sedang, setSedang] = useState(false);

  async function mulai() {
    setGalat(null);
    setSedang(true);

    const { error } = await authClient.signIn.social({
      provider: "google",
      callbackURL: lanjut,
      newUserCallbackURL: "/pemuda/profil",
      // Kegagalan di sisi Google dipulangkan ke halaman masuk; pesannya
      // dibaca dari parameter "error" oleh src/app/masuk/page.tsx.
      errorCallbackURL: "/masuk",
    });

    // Bila berhasil, peramban sudah berpindah ke Google dan baris di bawah
    // tidak pernah tercapai. Yang sampai ke sini hanya kegagalan sebelum
    // pengalihan — jaringan putus, atau peladen menolak.
    if (error) {
      setGalat("Tidak dapat menghubungi Google. Coba lagi beberapa saat.");
      setSedang(false);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      {galat && <Pesan nada="galat">{galat}</Pesan>}
      <button
        type="button"
        onClick={mulai}
        disabled={sedang}
        className="sk-kartu sk-pressable rounded-sk px-4 py-2.5 text-sm font-medium text-ink-soft hover:text-ink"
      >
        {sedang ? "Mengalihkan ke Google…" : "Lanjutkan dengan Google"}
      </button>
    </div>
  );
}

/** Garis "atau" di antara formulir surel dan tombol Google. */
export function PemisahAtau() {
  return (
    <div className="flex items-center gap-3 text-xs text-muted" aria-hidden="true">
      <hr className="flex-1 border-line" />
      atau
      <hr className="flex-1 border-line" />
    </div>
  );
}
