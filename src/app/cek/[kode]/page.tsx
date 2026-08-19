import type { Metadata } from "next";
import Link from "next/link";
import QRCode from "qrcode";

import { BingkaiPublik } from "@/components/bingkai-publik";
import { Kartu } from "@/components/sk";
import { rapikanKode } from "@/lib/kode-sertifikat";
import { prisma } from "@/lib/prisma";
import { tanggalPanjang } from "@/lib/teks";

export const metadata: Metadata = { title: "Hasil Pemeriksaan Sertifikat" };

/**
 * Halaman pemeriksaan keaslian sertifikat.
 *
 * Sengaja tidak membalas 404 untuk kode yang tidak ditemukan: pengunjung
 * memang datang untuk bertanya "apakah ini asli", dan jawaban "tidak ada
 * sertifikat dengan kode ini" adalah jawaban yang sah, bukan halaman hilang.
 */
export default async function HalamanCekKode({
  params,
}: {
  params: Promise<{ kode: string }>;
}) {
  const { kode: kodeMentah } = await params;
  const kode = rapikanKode(decodeURIComponent(kodeMentah));

  const sertifikat = await prisma.sertifikat.findUnique({
    where: { kode },
    select: {
      kode: true,
      judul: true,
      peringkat: true,
      terbitPada: true,
      dibatalkanPada: true,
      alasanPembatalan: true,
      penerima: { select: { name: true, profil: { select: { slug: true } } } },
      penerbit: { select: { name: true } },
      organisasi: { select: { nama: true } },
    },
  });

  if (!sertifikat) {
    return (
      <BingkaiPublik>
        <div className="mx-auto flex max-w-xl flex-col gap-6">
          <Kartu className="flex flex-col gap-3 border-l-4 border-l-danger">
            <span className="text-xs font-semibold uppercase tracking-wider text-danger">
              Tidak ditemukan
            </span>
            <h1 className="text-2xl font-semibold tracking-tight">
              Tidak ada sertifikat dengan kode ini
            </h1>
            <p className="text-sm text-ink-soft">
              Kode <span className="font-mono">{kode}</span> tidak terdaftar di
              DemakMuda. Periksa kembali penulisannya, atau hubungi penyelenggara
              kegiatan bila kodenya sudah benar.
            </p>
          </Kartu>
          <Link href="/cek" className="text-sm text-accent underline underline-offset-2">
            ← Periksa kode lain
          </Link>
        </div>
      </BingkaiPublik>
    );
  }

  const dibatalkan = Boolean(sertifikat.dibatalkanPada);
  const alamatPeriksa = `/cek/${sertifikat.kode}`;
  // QR dibangkitkan di server dari kode kita sendiri, bukan dari masukan
  // pengguna, sehingga aman disisipkan sebagai SVG.
  const qr = await QRCode.toString(
    `https://demakmuda.id${alamatPeriksa}`,
    { type: "svg", margin: 1, width: 160, errorCorrectionLevel: "M" },
  );

  const rincian = [
    { label: "Diberikan kepada", nilai: sertifikat.penerima.name },
    sertifikat.peringkat ? { label: "Peringkat", nilai: sertifikat.peringkat } : null,
    { label: "Tanggal terbit", nilai: tanggalPanjang(sertifikat.terbitPada) },
    {
      label: "Diterbitkan oleh",
      nilai: sertifikat.organisasi?.nama ?? sertifikat.penerbit.name,
    },
  ].filter((r): r is { label: string; nilai: string } => r !== null);

  return (
    <BingkaiPublik>
      <div className="mx-auto flex max-w-2xl flex-col gap-6">
        <Kartu
          className={`flex flex-col gap-4 border-l-4 ${
            dibatalkan ? "border-l-danger" : "border-l-accent"
          }`}
        >
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex flex-col gap-2">
              <span
                className={`text-xs font-semibold uppercase tracking-wider ${
                  dibatalkan ? "text-danger" : "text-accent"
                }`}
              >
                {dibatalkan ? "Dibatalkan" : "Sertifikat sah"}
              </span>
              <h1 className="text-2xl font-semibold leading-snug tracking-tight">
                {sertifikat.judul}
              </h1>
              <p className="font-mono text-sm tracking-widest text-muted">
                {sertifikat.kode}
              </p>
            </div>

            <div
              className="sk-inset shrink-0 p-2"
              aria-label="Kode QR untuk halaman pemeriksaan ini"
              dangerouslySetInnerHTML={{ __html: qr }}
            />
          </div>

          {dibatalkan && (
            <p className="text-sm text-danger">
              Sertifikat ini dibatalkan penerbitnya pada{" "}
              {tanggalPanjang(sertifikat.dibatalkanPada!)}
              {sertifikat.alasanPembatalan
                ? ` dengan alasan: ${sertifikat.alasanPembatalan}`
                : "."}{" "}
              Jangan dijadikan bukti.
            </p>
          )}

          <dl className="grid gap-4 sm:grid-cols-2">
            {rincian.map((r) => (
              <div key={r.label} className="flex flex-col gap-1">
                <dt className="text-xs font-semibold uppercase tracking-wider text-muted">
                  {r.label}
                </dt>
                <dd className="text-sm">{r.nilai}</dd>
              </div>
            ))}
          </dl>

          {sertifikat.penerima.profil?.slug && !dibatalkan && (
            <Link
              href={`/p/${sertifikat.penerima.profil.slug}`}
              className="w-fit text-sm text-accent underline underline-offset-2"
            >
              Lihat Kartu Talenta penerima →
            </Link>
          )}
        </Kartu>

        <p className="text-xs text-muted">
          Halaman ini dihasilkan langsung dari catatan DemakMuda. Sertifikat yang
          tidak terdaftar di sini tidak pernah diterbitkan melalui DemakMuda.
        </p>

        <Link href="/cek" className="text-sm text-accent underline underline-offset-2">
          ← Periksa kode lain
        </Link>
      </div>
    </BingkaiPublik>
  );
}
