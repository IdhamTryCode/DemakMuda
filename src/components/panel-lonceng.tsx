"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import type { HasilAksi } from "@/lib/validasi";

export type RingkasNotifikasi = {
  id: string;
  judul: string;
  pesan: string;
  tautan: string | null;
  terbaca: boolean;
  waktu: string;
};

/**
 * Panel pemberitahuan yang mengapung dari loncengnya.
 *
 * Sengaja bukan halaman tersendiri: kabar datang ketika orang sedang
 * mengerjakan hal lain, dan memaksanya berpindah halaman untuk membaca satu
 * baris berarti membuang tempat ia berada. Halaman /notifikasi tetap ada
 * sebagai arsip lengkapnya, dituju lewat tautan di kaki panel.
 *
 * Bukan dialog: dialog merebut fokus dan menggelapkan latar, padahal panel ini
 * hanya menyampaikan kabar sekilas. Ia tertutup sendiri saat pengguna menekan
 * di luarnya atau menekan Escape — dua jalan keluar yang sudah menjadi
 * kebiasaan.
 *
 * Isinya selalu ada di dalam markup dan hanya disembunyikan, bukan dipasang
 * saat dibuka, supaya panelnya muncul seketika tanpa menunggu apa pun.
 */
export function PanelLonceng({
  belum,
  daftar,
  tandai,
  tandaiSemua,
}: {
  belum: number;
  daftar: RingkasNotifikasi[];
  tandai: (id: string) => Promise<HasilAksi>;
  tandaiSemua: () => Promise<HasilAksi>;
}) {
  const router = useRouter();
  const bungkus = useRef<HTMLDivElement>(null);
  const [buka, setBuka] = useState(false);

  useEffect(() => {
    if (!buka) return;

    function diLuar(e: MouseEvent) {
      if (!bungkus.current?.contains(e.target as Node)) setBuka(false);
    }
    function tombol(e: KeyboardEvent) {
      if (e.key === "Escape") setBuka(false);
    }

    document.addEventListener("mousedown", diLuar);
    document.addEventListener("keydown", tombol);
    return () => {
      document.removeEventListener("mousedown", diLuar);
      document.removeEventListener("keydown", tombol);
    };
  }, [buka]);

  /**
   * Menandai terbaca TANPA menahan perpindahan halaman.
   *
   * Perpindahannya dikerjakan tautan biasa, bukan router.push sesudah await.
   * Bila penandaan dan perpindahan dirangkai, kegagalan menandai ikut
   * membatalkan perpindahan — pengguna menekan sesuatu dan tidak terjadi apa
   * pun. Yang penting sampai ke tujuan; menandai terbaca boleh menyusul.
   *
   * Penyegaran dipanggil setelah penandaan selesai, saat halaman tujuan sudah
   * tergambar, supaya angka pada loncengnya ikut turun.
   */
  function tandaiDiLatar(n: RingkasNotifikasi) {
    setBuka(false);
    if (n.terbaca) return;
    void tandai(n.id).then(() => router.refresh());
  }

  function isiBaris(n: RingkasNotifikasi) {
    return (
      <>
        {/* Penanda belum dibaca. Yang sudah dibaca tidak diberi apa pun —
            bedanya justru pada ketiadaannya. */}
        <span
          aria-hidden="true"
          className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
            n.terbaca ? "bg-transparent" : "bg-accent"
          }`}
        />
        <span className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span
            className={`text-sm leading-snug ${
              n.terbaca ? "text-ink-soft" : "font-semibold text-ink"
            }`}
          >
            {n.judul}
            {!n.terbaca && <span className="sr-only"> (belum dibaca)</span>}
          </span>
          <span className="line-clamp-2 text-xs text-ink-soft">{n.pesan}</span>
          <span className="text-xs text-muted">{n.waktu}</span>
        </span>
      </>
    );
  }

  function gayaBaris(n: RingkasNotifikasi) {
    return `flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-sunk ${
      n.terbaca ? "" : "bg-accent-soft/50"
    }`;
  }

  return (
    <div ref={bungkus} className="relative">
      <button
        type="button"
        onClick={() => setBuka((s) => !s)}
        aria-expanded={buka}
        aria-haspopup="true"
        aria-label={
          belum > 0 ? `Pemberitahuan, ${belum} belum dibaca` : "Pemberitahuan"
        }
        className="sk-kartu sk-pressable relative rounded-sk px-3 py-2.5 text-sm font-medium text-ink-soft hover:text-ink"
      >
        <span aria-hidden="true">🔔</span>
        {belum > 0 && (
          <span className="absolute -right-1.5 -top-1.5 min-w-5 rounded-full bg-accent px-1.5 py-0.5 text-center text-[11px] font-semibold leading-none text-on-accent">
            {belum > 9 ? "9+" : belum}
          </span>
        )}
      </button>

      <div
        hidden={!buka}
        className="sk-overlay absolute right-0 top-[calc(100%+0.6rem)] z-50 w-[min(22rem,calc(100vw-2rem))] overflow-hidden"
      >
        <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-3">
          <h2 className="text-sm font-semibold">Pusat Aktivitas</h2>
          {belum > 0 && (
            <button
              type="button"
              onClick={async () => {
                await tandaiSemua();
                router.refresh();
              }}
              className="text-sm text-accent underline underline-offset-2"
            >
              Tandai terbaca
            </button>
          )}
        </div>

        {daftar.length === 0 ? (
          <p className="px-4 py-6 text-sm text-muted">
            Belum ada pemberitahuan. Kabar tentang pengajuan, pendaftaran, dan
            tanggapan dinas akan muncul di sini.
          </p>
        ) : (
          <ul className="max-h-[22rem] overflow-y-auto">
            {daftar.map((n) => (
              <li key={n.id} className="border-b border-line last:border-b-0">
                {n.tautan ? (
                  // Tautan sungguhan, bukan tombol yang meniru tautan: alamatnya
                  // terlihat di bilah status, dapat dibuka di tab baru, dan tetap
                  // bekerja sekalipun penandaan terbaca gagal.
                  <Link
                    href={n.tautan}
                    onClick={() => tandaiDiLatar(n)}
                    className={gayaBaris(n)}
                  >
                    {isiBaris(n)}
                  </Link>
                ) : (
                  <button
                    type="button"
                    onClick={() => tandaiDiLatar(n)}
                    className={gayaBaris(n)}
                  >
                    {isiBaris(n)}
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}

        <Link
          href="/notifikasi"
          onClick={() => setBuka(false)}
          className="block border-t border-line px-4 py-3 text-center text-sm font-medium text-accent"
        >
          Lihat semua
        </Link>
      </div>
    </div>
  );
}
