import type { Metadata } from "next";
import Link from "next/link";

import { BingkaiPublik } from "@/components/bingkai-publik";
import { Kartu } from "@/components/sk";
import { prisma } from "@/lib/prisma";
import { tanggalPanjang } from "@/lib/teks";

export const metadata: Metadata = {
  title: "Kabar",
  description:
    "Berita dan pengumuman resmi seputar kepemudaan Kabupaten Demak.",
};

export default async function HalamanKabar() {
  const daftar = await prisma.berita.findMany({
    where: { status: "TERBIT" },
    orderBy: { terbitPada: "desc" },
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

        {daftar.length === 0 ? (
          <Kartu>
            <p className="text-sm text-muted">
              Belum ada kabar yang diterbitkan.
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
