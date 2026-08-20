"use client";

import { useEffect, useRef, useState } from "react";

import { Tombol } from "@/components/sk";
import { AKUN_PERAGAAN, SANDI_PERAGAAN } from "@/lib/akun-peragaan";
import { LABEL_PERAN } from "@/lib/peran";

/**
 * Daftar akun peragaan di balik satu tombol.
 *
 * Memakai elemen <dialog> bawaan peramban, bukan tumpukan div: fokus terkunci
 * di dalamnya, tombol Escape menutup, dan pembaca layar mengumumkannya sebagai
 * dialog tanpa perlu atribut tambahan.
 *
 * Hanya dirender bila mode peragaan menyala — lihat lib/akun-peragaan.ts.
 */
export function DialogAkunPeragaan({
  pakai,
}: {
  /** Mengisikan akun terpilih ke formulir masuk. */
  pakai: (email: string, sandi: string) => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [disalin, setDisalin] = useState<string | null>(null);

  // Menutup dialog saat latar gelapnya yang diklik, bukan isinya.
  useEffect(() => {
    const el = dialog.current;
    if (!el) return;
    function klik(e: MouseEvent) {
      if (e.target === el) el?.close();
    }
    el.addEventListener("click", klik);
    return () => el.removeEventListener("click", klik);
  }, []);

  async function salin(email: string) {
    try {
      await navigator.clipboard.writeText(`${email}\n${SANDI_PERAGAAN}`);
      setDisalin(email);
      setTimeout(() => setDisalin(null), 2000);
    } catch {
      // Papan klip dapat ditolak peramban. Bukan kegagalan yang perlu
      // ditampilkan — surel dan kata sandinya sudah terbaca di layar.
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => dialog.current?.showModal()}
        className="sk-raised sk-pressable w-full rounded-sk px-4 py-2.5 text-sm font-medium text-ink-soft hover:text-ink"
      >
        Lihat akun peragaan
      </button>

      <dialog
        ref={dialog}
        aria-labelledby="judul-akun-peragaan"
        className="sk-overlay m-auto w-[min(30rem,calc(100vw-2rem))] rounded-sk p-0 text-ink backdrop:bg-black/50"
      >
        <div className="flex max-h-[80vh] flex-col gap-4 overflow-y-auto p-6">
          <div className="flex flex-col gap-1.5">
            <h2 id="judul-akun-peragaan" className="text-lg font-semibold">
              Akun peragaan
            </h2>
            <p className="text-sm text-ink-soft">
              Empat peran, satu kata sandi yang sama. Tekan{" "}
              <span className="font-medium">Pakai</span> untuk mengisikannya ke
              formulir masuk.
            </p>
          </div>

          <div className="sk-inset flex items-center justify-between gap-3 px-3.5 py-2.5">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted">
              Kata sandi
            </span>
            <code className="font-mono text-sm">{SANDI_PERAGAAN}</code>
          </div>

          <ul className="flex flex-col gap-3">
            {AKUN_PERAGAAN.map((akun) => (
              <li key={akun.email} className="sk-raised flex flex-col gap-2 p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-accent-soft px-2.5 py-1 text-xs font-medium text-accent">
                    {LABEL_PERAN[akun.peran]}
                  </span>
                  <span className="text-xs text-muted">{akun.nama}</span>
                </div>

                <code className="break-all font-mono text-sm">{akun.email}</code>
                <p className="text-xs text-ink-soft">{akun.guna}</p>

                <div className="flex flex-wrap gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      pakai(akun.email, SANDI_PERAGAAN);
                      dialog.current?.close();
                    }}
                    className="sk-btn-utama sk-pressable rounded-sk px-3.5 py-2 text-xs"
                  >
                    Pakai
                  </button>
                  <button
                    type="button"
                    onClick={() => salin(akun.email)}
                    className="sk-raised sk-pressable rounded-sk px-3.5 py-2 text-xs font-medium text-ink-soft"
                  >
                    {disalin === akun.email ? "Tersalin" : "Salin"}
                  </button>
                </div>
              </li>
            ))}
          </ul>

          <p className="text-xs text-muted">
            Seluruh nama dan isi pada akun ini karangan, dibuat untuk peragaan.
            Daftar ini hanya tampil selama mode peragaan menyala.
          </p>

          <Tombol
            type="button"
            variasi="biasa"
            onClick={() => dialog.current?.close()}
          >
            Tutup
          </Tombol>
        </div>
      </dialog>
    </>
  );
}
