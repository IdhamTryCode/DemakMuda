import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { BingkaiPublik } from "@/components/bingkai-publik";
import { Markdown } from "@/components/markdown";
import { alamatBlobSah } from "@/lib/blob";
import { prisma } from "@/lib/prisma";
import { tanggalPanjang } from "@/lib/teks";

async function ambilKabar(slug: string) {
  return prisma.berita.findFirst({
    where: { slug, status: "TERBIT" },
    select: {
      judul: true,
      ringkasan: true,
      isi: true,
      gambarUrl: true,
      terbitPada: true,
      penulis: { select: { name: true } },
      organisasi: { select: { nama: true } },
    },
  });
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const kabar = await ambilKabar(slug);
  if (!kabar) return { title: "Kabar tidak ditemukan" };
  return { title: kabar.judul, description: kabar.ringkasan };
}

export default async function HalamanKabarRinci({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const kabar = await ambilKabar(slug);
  if (!kabar) notFound();

  // Diperiksa ulang tepat sebelum dirender. Baris warisan dari masa ketika
  // kolom ini masih menerima alamat sembarang tidak pernah melewati skema.
  const gambar = alamatBlobSah(kabar.gambarUrl ?? "") ? kabar.gambarUrl : null;

  return (
    <BingkaiPublik aktif="/kabar">
      <article className="mx-auto flex max-w-2xl flex-col gap-6">
        <Link href="/kabar" className="text-sm text-accent underline underline-offset-2">
          ← Semua kabar
        </Link>

        <header className="flex flex-col gap-3">
          <span className="text-xs uppercase tracking-wider text-brass">
            {kabar.terbitPada ? tanggalPanjang(kabar.terbitPada) : ""}
          </span>
          <h1 className="text-3xl font-semibold leading-tight tracking-tight">
            {kabar.judul}
          </h1>
          <p className="text-base text-ink-soft">{kabar.ringkasan}</p>
          <p className="text-xs text-muted">
            {kabar.organisasi?.nama ?? kabar.penulis.name}
          </p>
        </header>

        {gambar && (
          <div className="sk-redup relative aspect-[21/9] w-full overflow-hidden rounded-[10px]">
            <Image
              src={gambar}
              alt={`Gambar untuk kabar ${kabar.judul}`}
              fill
              sizes="(min-width: 768px) 42rem, 100vw"
              className="object-cover"
              priority
            />
          </div>
        )}

        <hr className="border-line" />

        <Markdown isi={kabar.isi} />
      </article>
    </BingkaiPublik>
  );
}
