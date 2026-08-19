import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { BingkaiPublik } from "@/components/bingkai-publik";
import { Markdown } from "@/components/markdown";
import { LABEL_JENIS_KARYA } from "@/lib/karya";
import { prisma } from "@/lib/prisma";
import { namaInang, tautanAman } from "@/lib/tautan";
import { cuplikan, tanggalPanjang } from "@/lib/teks";

async function ambilKarya(slug: string) {
  // Syarat status ikut ke dalam kueri, bukan diperiksa setelahnya. Karya draf
  // dan karya terarsip karena itu tidak dapat dibuka lewat tautan langsung,
  // dan halamannya membalas 404 — bukan 403 yang justru menegaskan bahwa
  // karyanya memang ada.
  return prisma.karya.findFirst({
    where: { slug, status: "TERBIT" },
    select: {
      judul: true,
      jenis: true,
      deskripsi: true,
      gambarUrl: true,
      tautanLuar: true,
      dibuatPada: true,
      pemilik: {
        select: { name: true, profil: { select: { slug: true } } },
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
  const karya = await ambilKarya(slug);
  if (!karya) return { title: "Karya tidak ditemukan" };
  return { title: karya.judul, description: cuplikan(karya.deskripsi, 160) };
}

export default async function HalamanKaryaRinci({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const karya = await ambilKarya(slug);
  if (!karya) notFound();

  // Alamat luar hanya dipasang sebagai tautan, tidak pernah sebagai sumber
  // gambar yang dimuat langsung. Memuat berkas dari peladen mana pun yang
  // ditulis pengguna akan menjadikan aplikasi ini perantara permintaan ke
  // jaringan dalam — risiko yang tidak sepadan dengan sekadar pratinjau.
  const gambar = tautanAman(karya.gambarUrl);
  const luar = tautanAman(karya.tautanLuar);

  return (
    <BingkaiPublik aktif="/karya">
      <article className="mx-auto flex max-w-2xl flex-col gap-6">
        <Link href="/karya" className="text-sm text-accent underline underline-offset-2">
          ← Semua karya
        </Link>

        <header className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-accent-soft px-2.5 py-1 text-xs font-medium text-accent">
              {LABEL_JENIS_KARYA[karya.jenis]}
            </span>
            <span className="text-xs uppercase tracking-wider text-brass">
              {tanggalPanjang(karya.dibuatPada)}
            </span>
          </div>

          <h1 className="text-3xl font-semibold leading-tight tracking-tight">
            {karya.judul}
          </h1>

          <p className="text-sm text-muted">
            Karya{" "}
            {karya.pemilik.profil?.slug ? (
              <Link
                href={`/p/${karya.pemilik.profil.slug}`}
                className="text-accent underline underline-offset-2"
              >
                {karya.pemilik.name}
              </Link>
            ) : (
              karya.pemilik.name
            )}
          </p>
        </header>

        <hr className="border-line" />

        <Markdown isi={karya.deskripsi} />

        {(gambar || luar) && (
          <div className="sk-inset flex flex-col gap-2 p-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted">
              Tautan karya
            </span>
            {luar && (
              <a
                href={luar}
                target="_blank"
                rel="noopener noreferrer nofollow"
                className="text-sm text-accent underline underline-offset-2"
              >
                Buka karya di {namaInang(luar)} ↗
              </a>
            )}
            {gambar && (
              <a
                href={gambar}
                target="_blank"
                rel="noopener noreferrer nofollow"
                className="text-sm text-accent underline underline-offset-2"
              >
                Lihat gambar di {namaInang(gambar)} ↗
              </a>
            )}
          </div>
        )}
      </article>
    </BingkaiPublik>
  );
}
