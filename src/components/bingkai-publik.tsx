import Link from "next/link";
import type { ReactNode } from "react";

import { BilahAtas } from "@/components/bilah-atas";
import { DokBawah } from "@/components/dok-bawah";
import { LogoDemak } from "@/components/logo-demak";
import { dasborUntuk } from "@/lib/peran";
import { dapatkanSesi } from "@/lib/sesi";

/** Kaki halaman hanya menautkan rute yang benar-benar ada. */
const JELAJAHI = [
  { href: "/kabar", label: "Kabar" },
  { href: "/agenda", label: "Agenda" },
  { href: "/peluang", label: "Peluang" },
  { href: "/karya", label: "Karya" },
];

const IKUT_SERTA_DASAR = [
  { href: "/direktori", label: "Direktori organisasi" },
  { href: "/cek", label: "Periksa sertifikat" },
];

/** Bingkai untuk seluruh halaman yang dapat dibuka tanpa masuk. */
export async function BingkaiPublik({
  aktif,
  children,
}: {
  aktif?: string;
  children: ReactNode;
}) {
  // Sesi dibaca untuk dua hal: ke mana butir "Akun" di dok mengarah, dan
  // apakah kaki halaman masih menawarkan "Buat akun" dan "Masuk".
  const sesi = await dapatkanSesi();
  const akunHref = sesi ? dasborUntuk(sesi.user.role) : "/masuk";

  // Bagi yang sudah masuk, menawarkan "Buat akun" dan "Masuk" mengundang
  // tindakan yang tidak mungkin lagi dilakukan. Keduanya diganti satu tautan
  // ke dasbornya.
  const ikutSerta = sesi
    ? [...IKUT_SERTA_DASAR, { href: akunHref, label: "Dasbor saya" }]
    : [
        ...IKUT_SERTA_DASAR,
        { href: "/daftar", label: "Buat akun" },
        { href: "/masuk", label: "Masuk" },
      ];

  return (
    <>
      <div className="sticky top-0 z-40">
        <BilahAtas aktif={aktif} />
      </div>

      <main className="mx-auto w-full max-w-[78rem] flex-1 px-6 py-8">{children}</main>

      {/* Kaki halaman berkolom. Tanpa klaim kepemilikan lembaga, tanpa alamat
          kantor, tanpa surel dinas: aplikasi ini karya perorangan. Ruang bawah
          pada ponsel menyisakan tinggi dok supaya kedua tautan wajib di baris
          terbawah tidak tertutup.

          px-6 dipasang pada wadah max-w-[78rem], bukan pada <footer>, supaya
          tepi kiri bilah atas, isi <main>, dan kaki halaman sama persis. Bila
          px-6 ada di luar wadah, kaki halaman bergeser 24 px ke kiri. */}
      <footer className="border-t border-line pt-10 pb-[calc(5rem_+_env(safe-area-inset-bottom))] text-sm sm:pb-10">
        <div className="mx-auto grid w-full max-w-[78rem] gap-8 px-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex flex-col gap-3 lg:col-span-2">
            <LogoDemak ukuran={28} ringkas />
            <p className="max-w-sm text-xs leading-relaxed text-muted">
              Portal talenta dan peluang pemuda Kabupaten Demak.
            </p>
          </div>

          <KakiKolom judul="Jelajahi" butir={JELAJAHI} />
          <KakiKolom judul="Ikut serta" butir={ikutSerta} />
        </div>

        <div className="mx-auto mt-10 flex w-full max-w-[78rem] flex-wrap items-center gap-x-4 gap-y-1 border-t border-line px-6 pt-6 text-xs text-muted">
          <Link
            href="/latar"
            className="text-accent underline underline-offset-2"
          >
            Latar dan tujuan
          </Link>
          <Link
            href="/privasi"
            className="text-accent underline underline-offset-2"
          >
            Perlindungan data
          </Link>
        </div>
      </footer>

      <DokBawah akunHref={akunHref} />
    </>
  );
}

function KakiKolom({
  judul,
  butir,
}: {
  judul: string;
  butir: { href: string; label: string }[];
}) {
  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">
        {judul}
      </h2>
      <ul className="flex flex-col gap-2">
        {butir.map((b) => (
          <li key={b.href}>
            <Link href={b.href} className="text-ink-soft hover:text-accent">
              {b.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
