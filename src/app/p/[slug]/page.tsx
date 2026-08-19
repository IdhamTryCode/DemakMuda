import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { BingkaiPublik } from "@/components/bingkai-publik";
import { Kartu } from "@/components/sk";
import { prisma } from "@/lib/prisma";
import { keterbukaanProfil, umur } from "@/lib/profil";

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
      user: { select: { name: true } },
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

        <Kartu className="flex flex-col gap-2">
          <h2 className="text-base font-semibold">Rekam prestasi</h2>
          <p className="text-sm text-muted">
            Sertifikat kegiatan yang diikuti akan tampil di sini setelah fitur
            Rekam Prestasi selesai dibangun.
          </p>
        </Kartu>
      </article>
    </BingkaiPublik>
  );
}
