import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { BingkaiPublik } from "@/components/bingkai-publik";
import { Kartu } from "@/components/sk";
import {
  adalahJenisOrganisasi,
  JENIS_ORGANISASI,
  LABEL_ORGANISASI,
} from "@/lib/organisasi";
import { prisma } from "@/lib/prisma";
import { cuplikan } from "@/lib/teks";

export const metadata: Metadata = {
  title: "Direktori Organisasi",
  description:
    "Karang taruna, OKP, sanggar, dan komunitas kepemudaan se-Kabupaten Demak.",
};

const BATAS = 60;

type Saringan = { kecamatan?: string; jenis?: string };

export default async function HalamanDirektori({
  searchParams,
}: {
  searchParams: Promise<Saringan>;
}) {
  const { kecamatan, jenis } = await searchParams;

  const [daftarKecamatan, organisasi] = await Promise.all([
    prisma.kecamatan.findMany({
      orderBy: { nama: "asc" },
      select: { id: true, nama: true },
    }),
    prisma.organisasi.findMany({
      // Hanya organisasi terverifikasi yang tampil di direktori publik.
      where: {
        statusVerifikasi: "TERVERIFIKASI",
        ...(kecamatan ? { kecamatanId: kecamatan } : {}),
        ...(adalahJenisOrganisasi(jenis) ? { jenis } : {}),
      },
      orderBy: [{ kecamatan: { nama: "asc" } }, { nama: "asc" }],
      take: BATAS,
      select: {
        id: true,
        nama: true,
        slug: true,
        jenis: true,
        deskripsi: true,
        logoUrl: true,
        kecamatan: { select: { nama: true } },
        desa: { select: { nama: true } },
        _count: { select: { keanggotaan: { where: { status: "TERVERIFIKASI" } } } },
      },
    }),
  ]);

  function tautan(ubah: Saringan) {
    const p = new URLSearchParams();
    const k = ubah.kecamatan ?? kecamatan;
    const j = ubah.jenis ?? jenis;
    if (k) p.set("kecamatan", k);
    if (j) p.set("jenis", j);
    const q = p.toString();
    return q ? `/direktori?${q}` : "/direktori";
  }

  return (
    <BingkaiPublik aktif="/direktori">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-semibold tracking-tight">
            Direktori Organisasi
          </h1>
          <p className="max-w-prose text-sm text-ink-soft">
            Karang taruna, organisasi kepemudaan, sanggar, dan komunitas
            se-Kabupaten Demak. Semua yang tercantum sudah diverifikasi Dinas
            Kepemudaan dan Olahraga.
          </p>
        </div>

        <div className="sk-redup flex flex-col gap-4 p-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted">
              Jenis
            </span>
            <Link
              href={tautan({ jenis: "" })}
              className={`rounded-full px-3 py-1.5 text-sm ${
                !jenis ? "bg-accent text-on-accent" : "sk-kartu text-ink-soft"
              }`}
            >
              Semua
            </Link>
            {JENIS_ORGANISASI.map((j) => (
              <Link
                key={j}
                href={tautan({ jenis: j })}
                className={`rounded-full px-3 py-1.5 text-sm ${
                  jenis === j ? "bg-accent text-on-accent" : "sk-kartu text-ink-soft"
                }`}
              >
                {LABEL_ORGANISASI[j]}
              </Link>
            ))}
          </div>

          <form action="/direktori" method="get" className="flex flex-wrap items-end gap-3">
            {jenis && <input type="hidden" name="jenis" value={jenis} />}
            <div className="flex min-w-56 flex-1 flex-col gap-1.5">
              <label
                htmlFor="kecamatan"
                className="text-xs font-semibold uppercase tracking-wider text-muted"
              >
                Kecamatan
              </label>
              <select
                id="kecamatan"
                name="kecamatan"
                defaultValue={kecamatan ?? ""}
                className="sk-field w-full px-3.5 py-2.5 text-sm"
              >
                <option value="">Semua kecamatan</option>
                {daftarKecamatan.map((k) => (
                  <option key={k.id} value={k.id}>
                    {k.nama}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="submit"
              className="sk-kartu sk-pressable rounded-sk px-4 py-2.5 text-sm font-medium text-ink-soft"
            >
              Terapkan
            </button>
            {kecamatan && (
              <Link
                href={tautan({ kecamatan: "" })}
                className="px-2 py-2.5 text-sm text-accent underline underline-offset-2"
              >
                Hapus saringan
              </Link>
            )}
          </form>
        </div>

        {organisasi.length === 0 ? (
          <Kartu>
            <p className="text-sm text-muted">
              Belum ada organisasi terverifikasi dengan saringan ini.
            </p>
          </Kartu>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {organisasi.map((o) => (
              <li key={o.id}>
                <Link href={`/direktori/${o.slug}`} className="block h-full rounded-sk">
                  <Kartu className="sk-pressable flex h-full flex-col gap-2">
                    <div className="flex items-start gap-3">
                      {o.logoUrl && (
                        <div className="sk-redup relative h-12 w-12 shrink-0 overflow-hidden rounded-[8px]">
                          <Image
                            src={o.logoUrl}
                            alt=""
                            fill
                            sizes="3rem"
                            className="object-cover"
                          />
                        </div>
                      )}
                      <span className="w-fit rounded-full bg-accent-soft px-2.5 py-1 text-xs font-medium text-accent">
                        {LABEL_ORGANISASI[o.jenis]}
                      </span>
                    </div>
                    <h2 className="text-lg font-semibold leading-snug">{o.nama}</h2>
                    <p className="text-xs text-muted">
                      {[o.desa?.nama, o.kecamatan.nama].filter(Boolean).join(", ")}
                      {" · "}
                      {o._count.keanggotaan} anggota
                    </p>
                    {o.deskripsi && (
                      <p className="text-sm text-ink-soft">
                        {cuplikan(o.deskripsi, 120)}
                      </p>
                    )}
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
