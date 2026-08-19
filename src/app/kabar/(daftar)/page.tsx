import type { Metadata } from "next";
import Link from "next/link";

import { BingkaiPublik } from "@/components/bingkai-publik";
import { KotakCari } from "@/components/kotak-cari";
import { Kartu } from "@/components/sk";
import { prisma } from "@/lib/prisma";
import { tanggalPanjang } from "@/lib/teks";

export const metadata: Metadata = {
  title: "Kabar",
  description:
    "Berita dan pengumuman resmi seputar kepemudaan Kabupaten Demak.",
};

export default async function HalamanKabar({
  searchParams,
}: {
  searchParams: Promise<{ cari?: string }>;
}) {
  const { cari } = await searchParams;
  const kunci = cari?.trim();

  const daftar = await prisma.berita.findMany({
    where: {
      status: "TERBIT",
      // Judul, ringkasan, dan isi ikut dicari sekaligus — pembaca biasanya
      // hanya ingat sepotong kalimat, bukan judul persisnya.
      ...(kunci
        ? {
            OR: [
              { judul: { contains: kunci, mode: "insensitive" as const } },
              { ringkasan: { contains: kunci, mode: "insensitive" as const } },
              { isi: { contains: kunci, mode: "insensitive" as const } },
            ],
          }
        : {}),
    },
    orderBy: { terbitPada: "desc" },
    // Batas aman supaya halaman tetap ringan bila isinya sudah banyak.
    take: 60,
    select: {
      id: true,
      judul: true,
      slug: true,
      ringkasan: true,
      terbitPada: true,
      penulis: { select: { name: true } },
    },
  });

  return (
    <BingkaiPublik aktif="/kabar">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-semibold tracking-tight">Kabar Demak</h1>
          <p className="max-w-prose text-sm text-ink-soft">
            Berita dan pengumuman resmi seputar kepemudaan Kabupaten Demak.
            Seluruh kabar di sini berasal dari dinas dan organisasi yang sudah
            terverifikasi.
          </p>
        </div>

        <div className="sk-inset p-4">
          <KotakCari
            aksi="/kabar"
            nilai={kunci}
            petunjuk="Kata dalam judul atau isi kabar"
            keterangan="Mencari di judul, ringkasan, dan isi kabar."
          />
        </div>

        {kunci && daftar.length > 0 && (
          <p className="text-sm text-muted">
            {daftar.length} kabar memuat “{kunci}”.
          </p>
        )}

        {daftar.length === 0 ? (
          <Kartu>
            <p className="text-sm text-muted">
              {kunci
                ? `Tidak ada kabar yang memuat “${kunci}”. Coba kata lain yang lebih umum.`
                : "Belum ada kabar yang diterbitkan."}
            </p>
          </Kartu>
        ) : (
          <ul className="flex flex-col gap-4">
            {daftar.map((kabar) => (
              <li key={kabar.id}>
                <Link href={`/kabar/${kabar.slug}`} className="block rounded-sk">
                  <Kartu className="sk-pressable flex flex-col gap-2">
                    <span className="text-xs uppercase tracking-wider text-brass">
                      {kabar.terbitPada ? tanggalPanjang(kabar.terbitPada) : "Draf"}
                    </span>
                    <h2 className="text-lg font-semibold leading-snug">
                      {kabar.judul}
                    </h2>
                    <p className="text-sm text-ink-soft">{kabar.ringkasan}</p>
                    <span className="text-xs text-muted">
                      Ditulis oleh {kabar.penulis.name}
                    </span>
                  </Kartu>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </BingkaiPublik>
  );
}
