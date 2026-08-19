import Link from "next/link";

import { GantiTema } from "@/components/ganti-tema";
import { LogoDemak } from "@/components/logo-demak";
import { Kartu } from "@/components/sk";

export const metadata = { title: "Halaman tidak ditemukan" };

/**
 * Halaman 404.
 *
 * Bukan sekadar mengganti bahasa: pengunjung yang tersasar biasanya sedang
 * mencari sesuatu, jadi halaman ini menawarkan jalan keluar yang masuk akal —
 * termasuk pemeriksaan sertifikat, karena kesalahan mengetik kode adalah
 * penyebab tersasar yang paling mungkin di aplikasi ini.
 */
export default function TidakDitemukan() {
  return (
    <>
      <header className="mx-auto flex w-full max-w-2xl items-center justify-between gap-4 px-6 pt-6">
        <Link href="/" className="rounded-sk">
          <LogoDemak ukuran={40} />
        </Link>
        <GantiTema />
      </header>

      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center gap-6 px-6 py-16">
        <div className="flex flex-col gap-3">
          <span className="font-mono text-sm text-brass">404</span>
          <h1 className="text-3xl font-semibold tracking-tight">
            Halaman ini tidak ada
          </h1>
          <p className="max-w-prose text-base text-ink-soft">
            Mungkin alamatnya salah ketik, atau isinya sudah diarsipkan
            penyelenggaranya.
          </p>
        </div>

        <Kartu className="flex flex-col gap-3">
          <h2 className="text-base font-semibold">Mungkin Anda mencari</h2>
          <div className="flex flex-wrap gap-2">
            {[
              { href: "/kabar", label: "Kabar" },
              { href: "/agenda", label: "Agenda" },
              { href: "/peluang", label: "Peluang" },
              { href: "/direktori", label: "Organisasi" },
            ].map((m) => (
              <Link
                key={m.href}
                href={m.href}
                className="sk-raised sk-pressable rounded-sk px-4 py-2.5 text-sm font-medium text-ink-soft"
              >
                {m.label}
              </Link>
            ))}
          </div>
        </Kartu>

        <Kartu className="flex flex-col gap-2">
          <h2 className="text-base font-semibold">Memeriksa sertifikat?</h2>
          <p className="text-sm text-ink-soft">
            Kode yang salah ketik akan berujung ke halaman ini. Coba masukkan
            ulang kodenya — huruf besar-kecil dan tanda hubung tidak berpengaruh.
          </p>
          <Link
            href="/cek"
            className="sk-btn-utama sk-pressable w-fit rounded-sk px-5 py-2.5 text-sm"
          >
            Periksa sertifikat
          </Link>
        </Kartu>
      </main>
    </>
  );
}
