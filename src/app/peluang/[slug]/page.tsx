import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { BingkaiPublik } from "@/components/bingkai-publik";
import { Markdown } from "@/components/markdown";
import { PanelDaftar } from "@/components/panel-daftar";
import { LABEL_JENIS } from "@/lib/peluang";
import { prisma } from "@/lib/prisma";
import { sisaWaktu, tanggalPanjang } from "@/lib/teks";

async function ambilPeluang(slug: string) {
  return prisma.peluang.findFirst({
    where: { slug, status: "TERBIT" },
    select: {
      id: true,
      judul: true,
      jenis: true,
      deskripsi: true,
      tautanLuar: true,
      tenggat: true,
      usiaMin: true,
      usiaMaks: true,
      minat: { select: { nama: true } },
      pembuat: { select: { name: true } },
      organisasi: { select: { nama: true } },
      khususAnggota: true,
      agenda: { select: { slug: true, judul: true, status: true } },
    },
  });
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const p = await ambilPeluang(slug);
  if (!p) return { title: "Peluang tidak ditemukan" };
  return { title: p.judul, description: p.deskripsi.slice(0, 160) };
}

export default async function HalamanPeluangRinci({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const p = await ambilPeluang(slug);
  if (!p) notFound();

  const sekarang = new Date();
  const sudahTutup = Boolean(p.tenggat && p.tenggat < sekarang);

  return (
    <BingkaiPublik aktif="/peluang">
      <article className="mx-auto flex max-w-2xl flex-col gap-6">
        <Link href="/peluang" className="text-sm text-accent underline underline-offset-2">
          ← Semua peluang
        </Link>

        <header className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-accent-soft px-2.5 py-1 text-xs font-medium text-accent">
              {LABEL_JENIS[p.jenis]}
            </span>
            {sudahTutup && (
              <span className="rounded-full bg-sunk px-2.5 py-1 text-xs font-medium text-muted">
                Pendaftaran sudah ditutup
              </span>
            )}
            {p.khususAnggota && (
              <span className="rounded-full bg-brass-soft px-2.5 py-1 text-xs font-medium text-brass">
                Khusus anggota
              </span>
            )}
          </div>
          <h1 className="text-3xl font-semibold leading-tight tracking-tight">
            {p.judul}
          </h1>
        </header>

        <dl className="sk-redup grid gap-4 p-5 sm:grid-cols-2">
          <div className="flex flex-col gap-1">
            <dt className="text-xs font-semibold uppercase tracking-wider text-muted">
              Tenggat pendaftaran
            </dt>
            <dd className="text-sm">
              {p.tenggat
                ? `${tanggalPanjang(p.tenggat)} (${sisaWaktu(p.tenggat, sekarang)})`
                : "Tidak ditentukan"}
            </dd>
          </div>
          <div className="flex flex-col gap-1">
            <dt className="text-xs font-semibold uppercase tracking-wider text-muted">
              Batas usia
            </dt>
            <dd className="text-sm">
              {p.usiaMin || p.usiaMaks
                ? `${p.usiaMin ?? "—"} sampai ${p.usiaMaks ?? "—"} tahun`
                : "Tidak dibatasi"}
            </dd>
          </div>
          <div className="flex flex-col gap-1">
            <dt className="text-xs font-semibold uppercase tracking-wider text-muted">
              Penyelenggara
            </dt>
            <dd className="text-sm">{p.organisasi?.nama ?? p.pembuat.name}</dd>
          </div>
          {p.minat.length > 0 && (
            <div className="flex flex-col gap-1">
              <dt className="text-xs font-semibold uppercase tracking-wider text-muted">
                Bidang
              </dt>
              <dd className="text-sm">{p.minat.map((m) => m.nama).join(", ")}</dd>
            </div>
          )}
        </dl>

        <Markdown isi={p.deskripsi} />

        {!sudahTutup && <PanelDaftar sasaran={{ jenis: "peluang", id: p.id }} />}

        {p.agenda?.status === "TERBIT" && (
          <p className="text-sm text-ink-soft">
            Terkait agenda{" "}
            <Link
              href={`/agenda/${p.agenda.slug}`}
              className="text-accent underline underline-offset-2"
            >
              {p.agenda.judul}
            </Link>
          </p>
        )}

        {p.tautanLuar && !sudahTutup && (
          <div>
            {/* Skema tautan sudah dibatasi http/https saat disimpan
                (lihat urlAman di lib/validasi.ts). */}
            <a
              href={p.tautanLuar}
              target="_blank"
              rel="noopener noreferrer nofollow"
              className="sk-btn-utama sk-pressable inline-block rounded-sk px-5 py-2.5 text-sm"
            >
              Buka pendaftaran →
            </a>
          </div>
        )}
      </article>
    </BingkaiPublik>
  );
}
