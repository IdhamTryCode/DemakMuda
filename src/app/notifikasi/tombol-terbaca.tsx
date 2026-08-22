"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import type { HasilAksi } from "@/lib/validasi";

/** Tombol menandai satu pemberitahuan, atau seluruhnya sekaligus. */
export function TombolTerbaca({
  tandai,
  semua = false,
}: {
  tandai: () => Promise<HasilAksi>;
  semua?: boolean;
}) {
  const router = useRouter();
  const [sedang, setSedang] = useState(false);

  const gaya = semua
    ? "sk-btn-utama sk-pressable rounded-sk px-4 py-2.5 text-sm"
    : "sk-raised sk-pressable rounded-sk px-3 py-2 text-xs font-medium text-ink-soft";

  return (
    <button
      type="button"
      disabled={sedang}
      className={`${gaya} disabled:opacity-60`}
      onClick={async () => {
        setSedang(true);
        await tandai();
        setSedang(false);
        router.refresh();
      }}
    >
      {sedang
        ? "Menandai…"
        : semua
          ? "Tandai semua terbaca"
          : "Tandai terbaca"}
    </button>
  );
}
