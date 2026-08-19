import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { FormTanggapan } from "@/app/kelola/form-tanggapan";
import { Kartu } from "@/components/sk";
import { LABEL_STATUS_ASPIRASI, WARNA_STATUS_ASPIRASI } from "@/lib/aspirasi";
import { prisma } from "@/lib/prisma";
import { wajibPeran } from "@/lib/sesi";
import { tanggalPanjang } from "@/lib/teks";
import { tanggapiAspirasi } from "@/server/aksi-aspirasi";

export const metadata: Metadata = { title: "Tanggapi Aspirasi" };

export default async function HalamanTanggapiAspirasi({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  await wajibPeran("dinas", "superadmin");

  const aspirasi = await prisma.aspirasi.findUnique({
    where: { id },
    select: {
      id: true,
      judul: true,
      isi: true,
      status: true,
      tanggapan: true,
      ditanggapiPada: true,
      dibuatPada: true,
      pengirim: {
        select: { name: true, email: true, profil: { select: { slug: true } } },
      },
      penanggap: { select: { name: true } },
    },
  });
  if (!aspirasi) notFound();

  async function simpan(data: FormData) {
    "use server";
    return tanggapiAspirasi(id, data);
  }

  return (
    <div className="flex flex-col gap-6">
      <Link
        href="/kelola/aspirasi"
        className="text-sm text-accent underline underline-offset-2"
      >
        ← Semua aspirasi
      </Link>

      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`rounded-full px-2.5 py-1 text-xs font-medium ${WARNA_STATUS_ASPIRASI[aspirasi.status]}`}
          >
            {LABEL_STATUS_ASPIRASI[aspirasi.status]}
          </span>
          <span className="text-xs uppercase tracking-wider text-brass">
            {tanggalPanjang(aspirasi.dibuatPada)}
          </span>
        </div>
        <h1 className="text-2xl font-semibold leading-snug tracking-tight">
          {aspirasi.judul}
        </h1>
        <p className="text-sm text-muted">
          Dari{" "}
          {aspirasi.pengirim.profil?.slug ? (
            <Link
              href={`/p/${aspirasi.pengirim.profil.slug}`}
              className="text-accent underline underline-offset-2"
            >
              {aspirasi.pengirim.name}
            </Link>
          ) : (
            aspirasi.pengirim.name
          )}{" "}
          · {aspirasi.pengirim.email}
        </p>
      </div>

      <Kartu>
        <p className="whitespace-pre-wrap text-sm leading-relaxed text-ink-soft">
          {aspirasi.isi}
        </p>
      </Kartu>

      {aspirasi.tanggapan && (
        <p className="text-xs text-muted">
          Sudah ditanggapi
          {aspirasi.penanggap && ` oleh ${aspirasi.penanggap.name}`}
          {aspirasi.ditanggapiPada &&
            ` pada ${tanggalPanjang(aspirasi.ditanggapiPada)}`}
          . Menyimpan ulang akan menggantinya.
        </p>
      )}

      <Kartu>
        <FormTanggapan
          simpan={simpan}
          awal={{ status: aspirasi.status, tanggapan: aspirasi.tanggapan ?? "" }}
        />
      </Kartu>
    </div>
  );
}
