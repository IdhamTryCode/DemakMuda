import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { BingkaiPublik } from "@/components/bingkai-publik";
import { Markdown } from "@/components/markdown";
import { PanelDaftar } from "@/components/panel-daftar";
import { Overline } from "@/components/sk";
import { prisma } from "@/lib/prisma";
import { tanggalPanjang, waktuSaja } from "@/lib/teks";

async function ambilAgenda(slug: string) {
  return prisma.agenda.findFirst({
    where: { slug, status: "TERBIT" },
    select: {
      id: true,
      judul: true,
      deskripsi: true,
      lokasi: true,
      mulai: true,
      selesai: true,
      kecamatan: { select: { nama: true } },
      pembuat: { select: { name: true } },
      organisasi: { select: { nama: true } },
      khususAnggota: true,
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
      {/* Di bawah lg urutan bacanya sama seperti sebelum Fase 7: judul, fakta,
          deskripsi, lalu ajakan mendaftar. Di lg ke atas tetap dua kolom: isi di
          kiri, fakta dan ajakan di kanan. Urutan DOM mengikuti susunan dua kolom;
          `order` dipakai hanya di layar sempit, jadi faktanya tidak jatuh di
          bawah seluruh deskripsi. */}
      <article className="mx-auto flex w-full max-w-5xl flex-col gap-6 lg:flex-row lg:items-start lg:gap-10">
        <div className="contents lg:flex lg:min-w-0 lg:flex-1 lg:flex-col lg:gap-6">
          <Link
            href="/agenda"
            className="order-1 text-sm text-accent underline underline-offset-2 lg:order-none"
          >
            ← Semua agenda
          </Link>

          <header className="order-2 flex flex-col gap-3 lg:order-none">
            {sudahLewat && (
              <span className="w-fit rounded-full bg-sunk px-2.5 py-1 text-xs font-medium text-muted">
                Kegiatan ini sudah berlangsung
              </span>
            )}
            {agenda.khususAnggota && (
              <span className="w-fit rounded-full bg-brass-soft px-2.5 py-1 text-xs font-medium text-brass">
                Khusus anggota
              </span>
            )}
            <h1 className="text-3xl font-semibold leading-tight tracking-tight">
              {agenda.judul}
            </h1>
          </header>

          <div className="order-4 lg:order-none">
            <Markdown isi={agenda.deskripsi} />
          </div>
        </div>

        <div className="contents lg:sticky lg:top-16 lg:flex lg:w-80 lg:shrink-0 lg:flex-col lg:gap-5">
          <dl className="order-3 grid gap-4 sk-redup p-5 sm:grid-cols-2 lg:order-none lg:grid-cols-1">
            {rincian.map((r) => (
              <div key={r.label} className="flex flex-col gap-1">
                <dt>
                  <Overline>{r.label}</Overline>
                </dt>
                <dd className="text-sm">{r.nilai}</dd>
              </div>
            ))}
          </dl>

          {!sudahLewat && (
            <div className="order-5 lg:order-none">
              <PanelDaftar sasaran={{ jenis: "agenda", id: agenda.id }} />
            </div>
          )}
        </div>
      </article>
    </BingkaiPublik>
  );
}
