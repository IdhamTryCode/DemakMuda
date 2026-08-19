import type { Metadata } from "next";
import Link from "next/link";

import { BingkaiPublik } from "@/components/bingkai-publik";
import { KotakCari } from "@/components/kotak-cari";
import { Kartu } from "@/components/sk";
import { JENIS_KARYA, LABEL_JENIS_KARYA, adalahJenisKarya } from "@/lib/karya";
import { prisma } from "@/lib/prisma";
import { cuplikan, tanggalPendek } from "@/lib/teks";

export const metadata: Metadata = {
  title: "Ruang Karya",
  description:
    "Etalase karya pemuda Kabupaten Demak: produk, seni, tulisan, dan proyek.",
};

/** Batas aman supaya halaman tetap ringan bila isinya sudah banyak. */
const BATAS = 60;

type Saringan = { jenis?: string; cari?: string };

export default async function HalamanKarya({
  searchParams,
}: {
  searchParams: Promise<Saringan>;
}) {
  const { jenis, cari } = await searchParams;
  const kunci = cari?.trim();

  const daftar = await prisma.karya.findMany({
    where: {
      // Hanya yang TERBIT. Draf dan arsip tidak pernah bocor ke halaman ini,
      // dan penyaringannya dilakukan di kueri, bukan di tampilan.
      status: "TERBIT",
      ...(adalahJenisKarya(jenis) ? { jenis } : {}),
      ...(kunci
        ? {
            OR: [
              { judul: { contains: kunci, mode: "insensitive" as const } },
              { deskripsi: { contains: kunci, mode: "insensitive" as const } },
            ],
          }
        : {}),
    },
    orderBy: { dibuatPada: "desc" },
    take: BATAS,
    select: {
      id: true,
      judul: true,
      slug: true,
      jenis: true,
      deskripsi: true,
      dibuatPada: true,
      pemilik: {
        select: { name: true, profil: { select: { slug: true } } },
      },
    },
  });

  function tautan(ubah: Saringan) {
    const p = new URLSearchParams();
    const j = ubah.jenis ?? jenis;
    const c = ubah.cari ?? kunci;
    if (j) p.set("jenis", j);
    if (c) p.set("cari", c);
    const q = p.toString();
    return q ? `/karya?${q}` : "/karya";
  }

  return (
    <BingkaiPublik aktif="/karya">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-semibold tracking-tight">Ruang Karya</h1>
          <p className="max-w-prose text-sm text-ink-soft">
            Etalase karya pemuda Demak — produk, seni, tulisan, dan proyek —
            beserta cerita di baliknya. Setiap karya ditulis sendiri oleh
            pemiliknya.
          </p>
        </div>

        <div className="sk-inset flex flex-col gap-4 p-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted">
              Jenis
            </span>
            <Link
              href={tautan({ jenis: "" })}
              className={`rounded-full px-3 py-1.5 text-sm ${
                !jenis ? "bg-accent text-on-accent" : "sk-raised text-ink-soft"
              }`}
            >
              Semua
            </Link>
            {JENIS_KARYA.map((j) => (
              <Link
                key={j}
                href={tautan({ jenis: j })}
                className={`rounded-full px-3 py-1.5 text-sm ${
                  jenis === j ? "bg-accent text-on-accent" : "sk-raised text-ink-soft"
                }`}
              >
                {LABEL_JENIS_KARYA[j]}
              </Link>
            ))}
          </div>

          <KotakCari
            aksi="/karya"
            nilai={kunci}
            tersembunyi={{ jenis }}
            petunjuk="Kata dalam judul atau cerita karya"
          />
        </div>

        {daftar.length === 0 ? (
          <Kartu>
            <p className="text-sm text-muted">
              {kunci
                ? `Tidak ada karya yang memuat “${kunci}” dengan saringan ini.`
                : "Belum ada karya yang dipamerkan dengan saringan ini."}
            </p>
          </Kartu>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2">
            {daftar.map((k) => (
              <li key={k.id}>
                <Link href={`/karya/${k.slug}`} className="block h-full rounded-sk">
                  <Kartu className="sk-pressable flex h-full flex-col gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-accent-soft px-2.5 py-1 text-xs font-medium text-accent">
                        {LABEL_JENIS_KARYA[k.jenis]}
                      </span>
                      <span className="text-xs uppercase tracking-wider text-brass">
                        {tanggalPendek(k.dibuatPada)}
                      </span>
                    </div>

                    <h2 className="text-lg font-semibold leading-snug">{k.judul}</h2>
                    <p className="text-sm text-ink-soft">{cuplikan(k.deskripsi, 140)}</p>
                    <span className="mt-auto pt-1 text-xs text-muted">
                      Karya {k.pemilik.name}
                    </span>
                  </Kartu>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </BingkaiPublik>
  );
}
