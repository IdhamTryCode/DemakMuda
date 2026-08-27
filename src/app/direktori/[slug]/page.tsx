import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { PanelGabung } from "@/components/panel-gabung";
import { BingkaiPublik } from "@/components/bingkai-publik";
import { Markdown } from "@/components/markdown";
import { Kartu } from "@/components/sk";
import { LABEL_KEANGGOTAAN, LABEL_ORGANISASI } from "@/lib/organisasi";
import { prisma } from "@/lib/prisma";

async function ambilOrganisasi(slug: string) {
  return prisma.organisasi.findFirst({
    where: { slug, statusVerifikasi: "TERVERIFIKASI" },
    select: {
      id: true,
      nama: true,
      jenis: true,
      deskripsi: true,
      kontak: true,
      kecamatan: { select: { nama: true } },
      desa: { select: { nama: true } },
      keanggotaan: {
        where: { status: "TERVERIFIKASI" },
        orderBy: [{ peran: "asc" }, { dibuatPada: "asc" }],
        take: 60,
        select: {
          id: true,
          peran: true,
          user: {
            select: { name: true, profil: { select: { slug: true } } },
          },
        },
      },
      _count: {
        select: {
          keanggotaan: { where: { status: "TERVERIFIKASI" } },
          agenda: { where: { status: "TERBIT" } },
        },
      },
    },
  });
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const o = await ambilOrganisasi(slug);
  if (!o) return { title: "Organisasi tidak ditemukan" };
  return {
    title: o.nama,
    description:
      o.deskripsi?.slice(0, 160) ??
      `${LABEL_ORGANISASI[o.jenis]} di Kecamatan ${o.kecamatan.nama}, Kabupaten Demak.`,
  };
}

export default async function HalamanOrganisasi({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const o = await ambilOrganisasi(slug);
  if (!o) notFound();

  const rincian = [
    { label: "Jenis", nilai: LABEL_ORGANISASI[o.jenis] },
    { label: "Kecamatan", nilai: o.kecamatan.nama },
    o.desa ? { label: "Desa / kelurahan", nilai: o.desa.nama } : null,
    o.kontak ? { label: "Kontak", nilai: o.kontak } : null,
  ].filter((r): r is { label: string; nilai: string } => r !== null);

  return (
    <BingkaiPublik aktif="/direktori">
      <article className="mx-auto flex max-w-2xl flex-col gap-6">
        <Link
          href="/direktori"
          className="text-sm text-accent underline underline-offset-2"
        >
          ← Semua organisasi
        </Link>

        <header className="flex flex-col gap-3">
          <span className="w-fit rounded-full bg-accent-soft px-2.5 py-1 text-xs font-medium text-accent">
            Terverifikasi Dispora Demak
          </span>
          <h1 className="text-3xl font-semibold leading-tight tracking-tight">
            {o.nama}
          </h1>
          <p className="text-sm text-muted">
            {o._count.keanggotaan} anggota · {o._count.agenda} kegiatan terbit
          </p>
        </header>

        <dl className="sk-redup grid gap-4 p-5 sm:grid-cols-2">
          {rincian.map((r) => (
            <div key={r.label} className="flex flex-col gap-1">
              <dt className="text-xs font-semibold uppercase tracking-wider text-muted">
                {r.label}
              </dt>
              <dd className="text-sm">{r.nilai}</dd>
            </div>
          ))}
        </dl>

        {o.deskripsi && <Markdown isi={o.deskripsi} />}

        <PanelGabung organisasiId={o.id} nama={o.nama} />

        <section className="flex flex-col gap-3">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted">
            Anggota
          </h2>
          {o.keanggotaan.length === 0 ? (
            <Kartu>
              <p className="text-sm text-muted">
                Belum ada anggota yang tercatat di DemakMuda.
              </p>
            </Kartu>
          ) : (
            <ul className="flex flex-wrap gap-2">
              {o.keanggotaan.map((k) => {
                const isi = (
                  <>
                    {k.user.name}
                    {k.peran !== "ANGGOTA" && (
                      <span className="ml-1.5 text-xs text-brass">
                        {LABEL_KEANGGOTAAN[k.peran]}
                      </span>
                    )}
                  </>
                );
                return (
                  <li key={k.id}>
                    {k.user.profil?.slug ? (
                      <Link
                        href={`/p/${k.user.profil.slug}`}
                        className="sk-kartu sk-pressable inline-block rounded-full px-3 py-1.5 text-sm text-ink-soft"
                      >
                        {isi}
                      </Link>
                    ) : (
                      <span className="inline-block rounded-full border border-line-strong px-3 py-1.5 text-sm text-ink-soft">
                        {isi}
                      </span>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </article>
    </BingkaiPublik>
  );
}
