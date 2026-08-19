import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { BingkaiPublik } from "@/components/bingkai-publik";
import { Kartu } from "@/components/sk";
import { prisma } from "@/lib/prisma";
import { keterbukaanProfil, umur } from "@/lib/profil";
import { tanggalPendek } from "@/lib/teks";

/**
 * Kartu Talenta publik.
 *
 * Halaman ini dapat dibuka siapa saja, jadi isinya disaring lebih dulu oleh
 * aturan di lib/profil.ts: nomor telepon tidak pernah tampil, dan bagi pengguna
 * di bawah 18 tahun usia, desa, serta sekolah ikut disembunyikan.
 */
async function ambilProfil(slug: string) {
  return prisma.profilPemuda.findUnique({
    where: { slug },
    select: {
      bio: true,
      tanggalLahir: true,
      kecamatan: { select: { nama: true } },
      desa: { select: { nama: true } },
      sekolah: { select: { nama: true } },
      minat: { select: { nama: true }, orderBy: { nama: "asc" } },
      keterampilan: { select: { nama: true }, orderBy: { nama: "asc" } },
      user: {
        select: {
          name: true,
          // Sertifikat yang dibatalkan tidak ikut tampil di kartu publik,
          // tetapi kodenya tetap dapat diperiksa di halaman /cek.
          sertifikatDiterima: {
            where: { dibatalkanPada: null },
            orderBy: { terbitPada: "desc" },
            take: 20,
            select: {
              kode: true,
              judul: true,
              peringkat: true,
              terbitPada: true,
              organisasi: { select: { nama: true } },
              penerbit: { select: { name: true } },
            },
          },
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
  const p = await ambilProfil(slug);
  if (!p) return { title: "Kartu Talenta tidak ditemukan" };
  return {
    title: p.user.name,
    description: `Kartu Talenta ${p.user.name} di DemakMuda.`,
  };
}

export default async function HalamanKartuTalenta({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const p = await ambilProfil(slug);
  if (!p) notFound();

  const buka = keterbukaanProfil(p.tanggalLahir);

  const rincian = [
    p.kecamatan ? { label: "Kecamatan", nilai: p.kecamatan.nama } : null,
    buka.tampilkanDesa && p.desa
      ? { label: "Desa / kelurahan", nilai: p.desa.nama }
      : null,
    buka.tampilkanSekolah && p.sekolah
      ? { label: "Sekolah", nilai: p.sekolah.nama }
      : null,
    buka.tampilkanUsia && p.tanggalLahir
      ? { label: "Usia", nilai: `${umur(p.tanggalLahir)} tahun` }
      : null,
  ].filter((r): r is { label: string; nilai: string } => r !== null);

  return (
    <BingkaiPublik>
      <article className="mx-auto flex max-w-2xl flex-col gap-6">
        <header className="flex flex-col gap-3">
          <span className="text-xs font-semibold uppercase tracking-widest text-brass">
            Kartu Talenta
          </span>
          <h1 className="text-3xl font-semibold leading-tight tracking-tight">
            {p.user.name}
          </h1>
          {p.bio && <p className="text-base text-ink-soft">{p.bio}</p>}
        </header>

        {rincian.length > 0 && (
          <dl className="sk-inset grid gap-4 p-5 sm:grid-cols-2">
            {rincian.map((r) => (
              <div key={r.label} className="flex flex-col gap-1">
                <dt className="text-xs font-semibold uppercase tracking-wider text-muted">
                  {r.label}
                </dt>
                <dd className="text-sm">{r.nilai}</dd>
              </div>
            ))}
          </dl>
        )}

        {p.minat.length > 0 && (
          <section className="flex flex-col gap-3">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted">
              Bidang minat
            </h2>
            <div className="flex flex-wrap gap-2">
              {p.minat.map((m) => (
                <span
                  key={m.nama}
                  className="rounded-full bg-accent-soft px-3 py-1.5 text-sm text-accent"
                >
                  {m.nama}
                </span>
              ))}
            </div>
          </section>
        )}

        {p.keterampilan.length > 0 && (
          <section className="flex flex-col gap-3">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted">
              Keterampilan
            </h2>
            <div className="flex flex-wrap gap-2">
              {p.keterampilan.map((k) => (
                <span
                  key={k.nama}
                  className="rounded-full border border-line-strong px-3 py-1.5 text-sm text-ink-soft"
                >
                  {k.nama}
                </span>
              ))}
            </div>
          </section>
        )}

        <section className="flex flex-col gap-3">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted">
            Rekam prestasi
          </h2>
          {p.user.sertifikatDiterima.length === 0 ? (
            <Kartu>
              <p className="text-sm text-muted">
                Belum ada sertifikat yang tercatat.
              </p>
            </Kartu>
          ) : (
            <ul className="flex flex-col gap-3">
              {p.user.sertifikatDiterima.map((s) => (
                <li key={s.kode}>
                  <Link href={`/cek/${s.kode}`} className="block rounded-sk">
                    <Kartu className="sk-pressable flex flex-wrap items-center gap-4">
                      <div className="flex min-w-0 flex-1 flex-col gap-1">
                        <h3 className="font-medium leading-snug">{s.judul}</h3>
                        <span className="text-xs text-muted">
                          {tanggalPendek(s.terbitPada)} ·{" "}
                          {s.organisasi?.nama ?? s.penerbit.name}
                        </span>
                      </div>
                      {s.peringkat && (
                        <span className="rounded-full bg-brass-soft px-2.5 py-1 text-xs font-medium text-brass">
                          {s.peringkat}
                        </span>
                      )}
                      <span className="font-mono text-xs text-muted">{s.kode}</span>
                    </Kartu>
                  </Link>
                </li>
              ))}
            </ul>
          )}
          <p className="text-xs text-muted">
            Setiap sertifikat dapat diperiksa keasliannya lewat halaman{" "}
            <Link href="/cek" className="text-accent underline underline-offset-2">
              periksa sertifikat
            </Link>
            .
          </p>
        </section>
      </article>
    </BingkaiPublik>
  );
}
