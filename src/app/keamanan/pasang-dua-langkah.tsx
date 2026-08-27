"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

import { Kartu, Kolom, Label, Pesan, Tombol } from "@/components/sk";
import { authClient } from "@/lib/auth-client";
import { buatQr } from "@/server/aksi-qr";

type Tahap =
  | { nama: "awal" }
  | { nama: "pindai"; qr: string | null; alamat: string; cadangan: string[] }
  | { nama: "selesai"; cadangan: string[] };

/**
 * Pendaftaran autentikasi dua langkah, tiga tahap:
 *
 *   1. Pengguna menegaskan kata sandinya — supaya orang yang menemukan
 *      perangkat tak terkunci tidak bisa memasang dua langkah miliknya sendiri.
 *   2. Rahasia ditampilkan sebagai kode QR beserta kode cadangan.
 *   3. Pengguna memasukkan kode dari aplikasi autentikator. Baru setelah
 *      langkah ini dua langkah benar-benar aktif — tanpa verifikasi, pengguna
 *      bisa terkunci dari akunnya sendiri karena salah memindai.
 */
export function PasangDuaLangkah() {
  const router = useRouter();
  const [tahap, setTahap] = useState<Tahap>({ nama: "awal" });
  const [galat, setGalat] = useState<string | null>(null);
  const [sedang, setSedang] = useState(false);

  async function mulai(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setGalat(null);
    setSedang(true);

    const data = new FormData(e.currentTarget);
    const { data: hasil, error } = await authClient.twoFactor.enable({
      // Ditegaskan meski sudah menjadi bawaan: balasannya berupa gabungan tipe,
      // dan hanya cabang "totp" yang memuat alamat serta kode cadangan.
      method: "totp",
      password: String(data.get("kataSandi") ?? ""),
    });

    if (error || !hasil) {
      setSedang(false);
      setGalat(
        error?.status === 401
          ? "Kata sandi tidak cocok."
          : (error?.message ?? "Gagal memulai pemasangan."),
      );
      return;
    }

    if (hasil.method !== "totp") {
      setSedang(false);
      setGalat("Metode dua langkah yang dikembalikan server tidak dikenali.");
      return;
    }

    const qr = await buatQr(hasil.totpURI);
    setSedang(false);
    setTahap({
      nama: "pindai",
      qr,
      alamat: hasil.totpURI,
      cadangan: hasil.backupCodes,
    });
  }

  async function sahkan(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (tahap.nama !== "pindai") return;
    setGalat(null);
    setSedang(true);

    const data = new FormData(e.currentTarget);
    const { error } = await authClient.twoFactor.verifyTotp({
      code: String(data.get("kode") ?? "").replace(/\s/g, ""),
    });

    setSedang(false);
    if (error) {
      setGalat("Kode tidak cocok. Periksa lagi angka yang sedang tampil.");
      return;
    }
    setTahap({ nama: "selesai", cadangan: tahap.cadangan });
    router.refresh();
  }

  if (tahap.nama === "selesai") {
    return (
      <Kartu className="flex flex-col gap-4">
        <Pesan nada="berhasil">
          Autentikasi dua langkah aktif. Mulai sekarang, masuk akan meminta kode
          dari aplikasi autentikator Anda.
        </Pesan>
        <KodeCadangan kode={tahap.cadangan} />
      </Kartu>
    );
  }

  if (tahap.nama === "pindai") {
    return (
      <Kartu className="flex flex-col gap-5">
        <div className="flex flex-col gap-1">
          <h2 className="text-base font-semibold">Pindai dengan aplikasi autentikator</h2>
          <p className="text-sm text-ink-soft">
            Buka Google Authenticator, Authy, atau aplikasi sejenis, lalu pindai
            kode di bawah ini.
          </p>
        </div>

        {tahap.qr ? (
          <div
            className="sk-redup w-fit bg-white p-3"
            aria-label="Kode QR untuk aplikasi autentikator"
            dangerouslySetInnerHTML={{ __html: tahap.qr }}
          />
        ) : (
          <Pesan nada="galat">
            Kode QR gagal dibuat. Masukkan alamat di bawah secara manual.
          </Pesan>
        )}

        <details className="text-sm">
          <summary className="cursor-pointer text-accent underline underline-offset-2">
            Tidak bisa memindai? Masukkan manual
          </summary>
          <p className="mt-2 break-all rounded-sk bg-sunk p-3 font-mono text-xs text-ink-soft">
            {tahap.alamat}
          </p>
        </details>

        <KodeCadangan kode={tahap.cadangan} />

        <form onSubmit={sahkan} className="flex flex-col gap-4 border-t border-line pt-5">
          {galat && <Pesan nada="galat">{galat}</Pesan>}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="kode">Kode dari aplikasi autentikator</Label>
            <Kolom
              id="kode"
              name="kode"
              inputMode="numeric"
              autoComplete="one-time-code"
              required
              maxLength={8}
              placeholder="123456"
              className="max-w-40 font-mono tracking-[0.3em]"
            />
            <p className="text-xs text-muted">
              Dua langkah baru aktif setelah kode ini cocok.
            </p>
          </div>
          <Tombol type="submit" disabled={sedang} className="w-fit">
            {sedang ? "Memeriksa…" : "Aktifkan"}
          </Tombol>
        </form>
      </Kartu>
    );
  }

  return (
    <Kartu>
      <form onSubmit={mulai} className="flex flex-col gap-4">
        {galat && <Pesan nada="galat">{galat}</Pesan>}
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="kataSandi">Tegaskan kata sandi Anda</Label>
          <Kolom
            id="kataSandi"
            name="kataSandi"
            type="password"
            autoComplete="current-password"
            required
            className="max-w-80"
          />
          <p className="text-xs text-muted">
            Diminta agar orang lain yang menemukan perangkat Anda dalam keadaan
            terbuka tidak dapat memasang dua langkah miliknya sendiri.
          </p>
        </div>
        <Tombol type="submit" disabled={sedang} className="w-fit">
          {sedang ? "Menyiapkan…" : "Mulai pemasangan"}
        </Tombol>
      </form>
    </Kartu>
  );
}

function KodeCadangan({ kode }: { kode: string[] }) {
  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-sm font-semibold">Kode cadangan</h3>
      <p className="text-sm text-ink-soft">
        Simpan atau cetak sekarang. Bila ponsel Anda hilang, hanya kode inilah
        jalan masuk yang tersisa — dan tidak akan ditampilkan lagi.
      </p>
      <ul className="sk-redup grid grid-cols-2 gap-1.5 p-4 font-mono text-sm sm:grid-cols-3">
        {kode.map((k) => (
          <li key={k} className="tabular-nums text-ink-soft">
            {k}
          </li>
        ))}
      </ul>
    </div>
  );
}
