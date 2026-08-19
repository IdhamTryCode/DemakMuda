import type { Metadata } from "next";
import Link from "next/link";

import { Kartu } from "@/components/sk";
import { prisma } from "@/lib/prisma";
import { tanggalPendek } from "@/lib/teks";
import { wajibPeran } from "@/lib/sesi";

export const metadata: Metadata = { title: "Kelola Kabar" };

const WARNA_STATUS: Record<string, string> = {
  DRAF: "bg-sunk text-muted",
  TERBIT: "bg-accent-soft text-accent",
  ARSIP: "bg-brass-soft text-brass",
};

export default async function HalamanKelolaKabar() {
  const sesi = await wajibPeran("organisasi", "dinas", "superadmin");

  // Organisasi hanya melihat kabarnya sendiri; dinas dan superadmin melihat
  // seluruhnya. Penyaringan dilakukan di kueri, bukan disembunyikan di layar.
  const hanyaMilikSendiri = sesi.peran === "organisasi";

  const daftar = await prisma.berita.findMany({
    where: hanyaMilikSendiri ? { penulisId: sesi.user.id } : undefined,
    orderBy: { dibuatPada: "desc" },
    select: {
      id: true,
      judul: true,
      slug: true,
      status: true,
      dibuatPada: true,
      penulis: { select: { name: true } },
    },
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight">Kelola Kabar</h1>
          <p className="text-sm text-muted">
            {hanyaMilikSendiri
              ? "Kabar yang Anda tulis."
              : "Seluruh kabar di DemakMuda."}
          </p>
        </div>
        <Link
          href="/kelola/kabar/baru"
          className="sk-btn-utama sk-pressable rounded-sk px-4 py-2.5 text-sm"
        >
          Tulis kabar
        </Link>
      </div>

      {daftar.length === 0 ? (
        <Kartu>
          <p className="text-sm text-muted">
            Belum ada kabar. Mulai dengan menekan “Tulis kabar”.
          </p>
        </Kartu>
      ) : (
        <ul className="flex flex-col gap-3">
          {daftar.map((kabar) => (
            <li key={kabar.id}>
              <Kartu className="flex flex-wrap items-center gap-4">
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <h2 className="truncate font-medium">{kabar.judul}</h2>
                  <span className="text-xs text-muted">
                    {tanggalPendek(kabar.dibuatPada)}
                    {!hanyaMilikSendiri && ` · ${kabar.penulis.name}`}
                  </span>
                </div>

                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-medium ${WARNA_STATUS[kabar.status]}`}
                >
                  {kabar.status.toLowerCase()}
                </span>

                <div className="flex gap-2">
                  {kabar.status === "TERBIT" && (
                    <Link
                      href={`/kabar/${kabar.slug}`}
                      className="sk-raised sk-pressable rounded-sk px-3 py-2 text-xs font-medium text-ink-soft"
                    >
                      Lihat
                    </Link>
                  )}
                  <Link
                    href={`/kelola/kabar/${kabar.id}`}
                    className="sk-raised sk-pressable rounded-sk px-3 py-2 text-xs font-medium text-ink-soft"
                  >
                    Ubah
                  </Link>
                </div>
              </Kartu>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
