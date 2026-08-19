import type { Metadata } from "next";
import Link from "next/link";

import { Kartu } from "@/components/sk";
import { LABEL_STATUS_ASPIRASI, WARNA_STATUS_ASPIRASI } from "@/lib/aspirasi";
import { prisma } from "@/lib/prisma";
import { wajibPeran } from "@/lib/sesi";
import { tanggalPendek } from "@/lib/teks";

export const metadata: Metadata = { title: "Aspirasi Saya" };

export default async function HalamanAspirasiSaya() {
  const sesi = await wajibPeran("pemuda");

  const daftar = await prisma.aspirasi.findMany({
    where: { pengirimId: sesi.user.id },
    orderBy: { dibuatPada: "desc" },
    take: 100,
    select: {
      id: true,
      judul: true,
      isi: true,
      status: true,
      tanggapan: true,
      ditanggapiPada: true,
      dibuatPada: true,
      penanggap: { select: { name: true } },
    },
  });

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-6 py-8">
      <Link href="/pemuda" className="text-sm text-accent underline underline-offset-2">
        ← Dasbor
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight">Aspirasi saya</h1>
          <p className="max-w-prose text-sm text-muted">
            Usulan yang Anda sampaikan kepada Dispora Demak beserta
            tanggapannya. Halaman ini hanya dapat dibuka oleh Anda dan dinas.
          </p>
        </div>
        <Link
          href="/pemuda/aspirasi/baru"
          className="sk-btn-utama sk-pressable rounded-sk px-4 py-2.5 text-sm"
        >
          Kirim aspirasi
        </Link>
      </div>

      {daftar.length === 0 ? (
        <Kartu>
          <p className="text-sm text-muted">
            Belum ada aspirasi yang Anda kirim. Punya usulan untuk kepemudaan
            Demak? Sampaikan lewat tombol “Kirim aspirasi”.
          </p>
        </Kartu>
      ) : (
        <ul className="flex flex-col gap-4">
          {daftar.map((a) => (
            <li key={a.id}>
              <Kartu className="flex flex-col gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${WARNA_STATUS_ASPIRASI[a.status]}`}
                  >
                    {LABEL_STATUS_ASPIRASI[a.status]}
                  </span>
                  <span className="text-xs uppercase tracking-wider text-brass">
                    Dikirim {tanggalPendek(a.dibuatPada)}
                  </span>
                </div>

                <h2 className="text-base font-semibold leading-snug">{a.judul}</h2>
                <p className="whitespace-pre-wrap text-sm text-ink-soft">{a.isi}</p>

                {a.tanggapan ? (
                  <div className="sk-inset flex flex-col gap-1.5 p-4">
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted">
                      Tanggapan dinas
                      {a.ditanggapiPada && ` · ${tanggalPendek(a.ditanggapiPada)}`}
                    </span>
                    <p className="whitespace-pre-wrap text-sm text-ink-soft">
                      {a.tanggapan}
                    </p>
                    {a.penanggap && (
                      <span className="text-xs text-muted">— {a.penanggap.name}</span>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-muted">
                    Belum ditanggapi. Anda akan melihat tanggapannya di sini.
                  </p>
                )}
              </Kartu>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
