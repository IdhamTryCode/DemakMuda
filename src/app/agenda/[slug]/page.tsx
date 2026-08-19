import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { BingkaiPublik } from "@/components/bingkai-publik";
import { Markdown } from "@/components/markdown";
import { prisma } from "@/lib/prisma";
import { tanggalPanjang, waktuSaja } from "@/lib/teks";

async function ambilAgenda(slug: string) {
  return prisma.agenda.findFirst({
    where: { slug, status: "TERBIT" },
    select: {
      judul: true,
      deskripsi: true,
      lokasi: true,
      mulai: true,
      selesai: true,
      kecamatan: { select: { nama: true } },
      pembuat: { select: { name: true } },
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
  const agenda = await ambilAgenda(slug);
  if (!agenda) return { title: "Agenda tidak ditemukan" };
  return {
    title: agenda.judul,
    description: agenda.deskripsi.slice(0, 160),
  };
}

export default async function HalamanAgendaRinci({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const agenda = await ambilAgenda(slug);
  if (!agenda) notFound();

  const sudahLewat = agenda.mulai < new Date();

  const rincian = [
    { label: "Tanggal", nilai: tanggalPanjang(agenda.mulai) },
    {
      label: "Waktu",
      nilai:
        `${waktuSaja(agenda.mulai)}${agenda.selesai ? `–${waktuSaja(agenda.selesai)}` : ""} WIB`,
    },
    agenda.lokasi ? { label: "Lokasi", nilai: agenda.lokasi } : null,
    agenda.kecamatan ? { label: "Kecamatan", nilai: agenda.kecamatan.nama } : null,
    {
      label: "Penyelenggara",
      nilai: agenda.organisasi?.nama ?? agenda.pembuat.name,
    },
  ].filter((r): r is { label: string; nilai: string } => r !== null);

  return (
    <BingkaiPublik aktif="/agenda">
      <article className="mx-auto flex max-w-2xl flex-col gap-6">
        <Link href="/agenda" className="text-sm text-accent underline underline-offset-2">
          ← Semua agenda
        </Link>

        <header className="flex flex-col gap-3">
          {sudahLewat && (
            <span className="w-fit rounded-full bg-sunk px-2.5 py-1 text-xs font-medium text-muted">
              Kegiatan ini sudah berlangsung
            </span>
          )}
          <h1 className="text-3xl font-semibold leading-tight tracking-tight">
            {agenda.judul}
          </h1>
        </header>

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

        <Markdown isi={agenda.deskripsi} />
      </article>
    </BingkaiPublik>
  );
}
