import Link from "next/link";

import { TombolCabutSemua, TombolCabutSesi } from "@/app/keamanan/kelola-sesi";
import { MatikanDuaLangkah } from "@/app/keamanan/matikan-dua-langkah";
import { PasangDuaLangkah } from "@/app/keamanan/pasang-dua-langkah";
import { GantiTema } from "@/components/ganti-tema";
import { LogoDemak } from "@/components/logo-demak";
import { Kartu } from "@/components/sk";
import { MODE_PERAGAAN, PERAN_WAJIB_2FA } from "@/lib/auth";
import { dasborUntuk, LABEL_PERAN } from "@/lib/peran";
import { prisma } from "@/lib/prisma";
import { wajibMasuk } from "@/lib/sesi";
import { tanggalPendek, waktuSaja } from "@/lib/teks";

export const metadata = { title: "Keamanan Akun" };

export default async function HalamanKeamanan() {
  // Sengaja hanya wajibMasuk, bukan wajibPeran: halaman inilah tujuan
  // pengalihan bagi yang belum memasang dua langkah, jadi ia tidak boleh
  // menerapkan penjagaan yang sama — nanti berputar tanpa henti.
  const sesi = await wajibMasuk();

  const sudahAktif = sesi.user.twoFactorEnabled === true;
  const wajib = PERAN_WAJIB_2FA.includes(sesi.peran);

  const [daftarSesi, jumlahSesi] = await Promise.all([
    prisma.session.findMany({
      where: { userId: sesi.user.id, expiresAt: { gte: new Date() } },
      orderBy: { createdAt: "desc" },
      take: 10,
      select: {
        id: true,
        token: true,
        createdAt: true,
        ipAddress: true,
        userAgent: true,
      },
    }),
    prisma.session.count({
      where: { userId: sesi.user.id, expiresAt: { gte: new Date() } },
    }),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <nav className="flex items-center justify-between gap-4">
        <LogoDemak ukuran={36} />
        <div className="flex items-center gap-3">
          <GantiTema />
          {(sudahAktif || !wajib || MODE_PERAGAAN) && (
            <Link
              href={dasborUntuk(sesi.peran)}
              className="sk-kartu sk-pressable rounded-sk px-4 py-2.5 text-sm font-medium text-ink-soft"
            >
              Dasbor
            </Link>
          )}
        </div>
      </nav>

      <header className="flex flex-col gap-1">
        <span className="text-xs font-semibold uppercase tracking-wider text-brass">
          {LABEL_PERAN[sesi.peran]}
        </span>
        <h1 className="text-2xl font-semibold tracking-tight">Keamanan Akun</h1>
        <p className="max-w-prose text-sm text-ink-soft">
          Autentikasi dua langkah membuat kata sandi yang bocor saja tidak cukup
          untuk masuk ke akun Anda. Lihat juga{" "}
          <Link href="/privasi" className="text-accent underline underline-offset-2">
            perlindungan data
          </Link>
          .
        </p>
      </header>

      {wajib && !sudahAktif && (
        <Kartu
          className={`flex flex-col gap-2 border-l-4 ${
            MODE_PERAGAAN ? "border-l-brass" : "border-l-danger"
          }`}
        >
          <h2 className="text-base font-semibold">
            {MODE_PERAGAAN ? "Sangat dianjurkan untuk peran Anda" : "Wajib untuk peran Anda"}
          </h2>
          <p className="text-sm text-ink-soft">
            Peran {LABEL_PERAN[sesi.peran]} dapat membuka data seluruh pemuda
            Kabupaten Demak, termasuk pengguna di bawah umur.{" "}
            {MODE_PERAGAAN
              ? "Di lingkungan peragaan ini pemasangannya tidak dipaksakan agar aplikasi tetap dapat diperagakan, tetapi di lingkungan sungguhan ia diwajibkan."
              : "Karena itu dasbor Anda baru dapat dibuka setelah dua langkah dipasang."}
          </p>
        </Kartu>
      )}

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted">
          Autentikasi dua langkah
        </h2>
        {sudahAktif ? (
          <Kartu className="flex flex-col gap-3">
            <p className="text-sm text-ink-soft">
              <span className="font-medium text-accent">Aktif.</span> Masuk ke akun
              ini meminta kode dari aplikasi autentikator Anda.
            </p>
            <MatikanDuaLangkah wajib={wajib && !MODE_PERAGAAN} />
          </Kartu>
        ) : (
          <PasangDuaLangkah />
        )}
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted">
          Sesi aktif
        </h2>
        <p className="text-sm text-ink-soft">
          {jumlahSesi} perangkat sedang masuk ke akun ini
          {jumlahSesi > daftarSesi.length && `, sepuluh terbaru ditampilkan`}. Bila
          ada yang tidak Anda kenali, keluarkan dan ubah kata sandi Anda.
        </p>

        <TombolCabutSemua jumlahLain={jumlahSesi - 1} />

        <ul className="flex flex-col gap-2">
          {daftarSesi.map((s) => {
            const iniPerangkatIni = s.token === sesi.session.token;
            return (
              <li key={s.id}>
                <Kartu className="flex flex-wrap items-center gap-x-4 gap-y-1 px-5 py-3.5">
                  <span className="min-w-0 flex-1 truncate text-sm text-ink-soft">
                    {s.userAgent?.slice(0, 60) ?? "Perangkat tidak dikenali"}
                  </span>
                  {iniPerangkatIni ? (
                    <span className="rounded-full bg-accent-soft px-2.5 py-0.5 text-xs font-medium text-accent">
                      perangkat ini
                    </span>
                  ) : (
                    <TombolCabutSesi sesiId={s.id} />
                  )}
                  <span className="font-mono text-xs text-muted">
                    {s.ipAddress ?? "—"}
                  </span>
                  <span className="text-xs tabular-nums text-muted">
                    {tanggalPendek(s.createdAt)} {waktuSaja(s.createdAt)}
                  </span>
                </Kartu>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
