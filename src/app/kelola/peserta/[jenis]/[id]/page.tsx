import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { PilihStatusPeserta } from "@/app/kelola/peserta/[jenis]/[id]/pilih-status";
import { TerbitkanSertifikat } from "@/app/kelola/peserta/[jenis]/[id]/terbitkan-sertifikat";
import { Kartu } from "@/components/sk";
import { prisma } from "@/lib/prisma";
import { wajibPeran } from "@/lib/sesi";
import { tanggalPendek } from "@/lib/teks";
import { umur } from "@/lib/profil";
import { bolehMengubah } from "@/server/penjaga";

export const metadata: Metadata = { title: "Daftar Peserta" };

/** Memuat kegiatan beserta pesertanya, sekaligus memeriksa kepemilikan. */
async function muat(jenis: string, id: string, aktor: { id: string; nama: string; peran: "pemuda" | "organisasi" | "dinas" | "superadmin" }) {
  if (jenis !== "agenda" && jenis !== "peluang") return null;

  const kegiatan =
    jenis === "agenda"
      ? await prisma.agenda.findUnique({
          where: { id },
          select: { id: true, judul: true, pembuatId: true },
        })
      : await prisma.peluang.findUnique({
          where: { id },
          select: { id: true, judul: true, pembuatId: true },
        });

  // Kegiatan milik orang lain diperlakukan sama seperti yang tidak ada.
  if (!kegiatan || !bolehMengubah(aktor, kegiatan.pembuatId)) return null;

  const peserta = await prisma.pendaftaran.findMany({
    where: jenis === "agenda" ? { agendaId: id } : { peluangId: id },
    orderBy: { dibuatPada: "asc" },
    take: 500,
    select: {
      id: true,
      status: true,
      dibuatPada: true,
      sertifikat: { select: { kode: true, dibatalkanPada: true } },
      user: {
        select: {
          name: true,
          email: true,
          profil: {
            select: {
              slug: true,
              telepon: true,
              tanggalLahir: true,
              kecamatan: { select: { nama: true } },
              desa: { select: { nama: true } },
            },
          },
        },
      },
    },
  });

  return { jenis, kegiatan, peserta };
}

const WARNA: Record<string, string> = {
  MENUNGGU: "bg-sunk text-muted",
  DITERIMA: "bg-accent-soft text-accent",
  DITOLAK: "bg-danger-soft text-danger",
  HADIR: "bg-brass-soft text-brass",
};

export default async function HalamanPeserta({
  params,
}: {
  params: Promise<{ jenis: string; id: string }>;
}) {
  const { jenis, id } = await params;
  const sesi = await wajibPeran("organisasi", "dinas", "superadmin");

  const data = await muat(jenis, id, {
    id: sesi.user.id,
    nama: sesi.user.name,
    peran: sesi.peran,
  });
  if (!data) notFound();

  const sekarang = new Date();
  const ringkas = data.peserta.reduce<Record<string, number>>((n, p) => {
    n[p.status] = (n[p.status] ?? 0) + 1;
    return n;
  }, {});

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-brass">
            Daftar peserta
          </span>
          <h1 className="text-2xl font-semibold tracking-tight">
            {data.kegiatan.judul}
          </h1>
          <p className="text-sm text-muted">
            {data.peserta.length} pendaftar
            {Object.entries(ringkas).length > 0 &&
              ` · ${Object.entries(ringkas)
                .map(([s, n]) => `${n} ${s.toLowerCase()}`)
                .join(", ")}`}
          </p>
        </div>
        <div className="flex gap-2">
          {data.peserta.length > 0 && (
            <a
              href={`/kelola/peserta/${jenis}/${id}/unduh`}
              className="sk-btn-utama sk-pressable rounded-sk px-4 py-2.5 text-sm"
            >
              Unduh CSV
            </a>
          )}
          <Link
            href={`/kelola/${jenis}`}
            className="sk-kartu sk-pressable rounded-sk px-4 py-2.5 text-sm font-medium text-ink-soft"
          >
            Kembali
          </Link>
        </div>
      </div>

      {data.peserta.length === 0 ? (
        <Kartu>
          <p className="text-sm text-muted">Belum ada yang mendaftar.</p>
        </Kartu>
      ) : (
        <ul className="flex flex-col gap-3">
          {data.peserta.map((p) => {
            const profil = p.user.profil;
            const usia = profil?.tanggalLahir
              ? umur(profil.tanggalLahir, sekarang)
              : null;
            return (
              <li key={p.id}>
                <Kartu className="flex flex-wrap items-center gap-4">
                  <div className="flex min-w-0 flex-1 flex-col gap-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-medium">{p.user.name}</h2>
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${WARNA[p.status]}`}
                      >
                        {p.status.toLowerCase()}
                      </span>
                    </div>
                    <span className="text-xs text-muted">
                      {p.user.email}
                      {usia !== null && ` · ${usia} tahun`}
                      {profil?.kecamatan && ` · ${profil.kecamatan.nama}`}
                      {profil?.telepon && ` · ${profil.telepon}`}
                    </span>
                    <span className="text-xs text-muted">
                      Mendaftar {tanggalPendek(p.dibuatPada)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {profil?.slug && (
                      <Link
                        href={`/p/${profil.slug}`}
                        className="sk-kartu sk-pressable rounded-sk px-3 py-2 text-xs font-medium text-ink-soft"
                      >
                        Kartu Talenta
                      </Link>
                    )}
                    <PilihStatusPeserta pendaftaranId={p.id} status={p.status} />
                  </div>

                  <div className="flex w-full justify-end border-t border-line pt-3">
                    <TerbitkanSertifikat
                      pendaftaranId={p.id}
                      status={p.status}
                      judulBawaan={data.kegiatan.judul}
                      sertifikat={
                        p.sertifikat
                          ? {
                              kode: p.sertifikat.kode,
                              dibatalkan: Boolean(p.sertifikat.dibatalkanPada),
                            }
                          : null
                      }
                    />
                  </div>
                </Kartu>
              </li>
            );
          })}
        </ul>
      )}

      <p className="text-xs text-muted">
        Nomor telepon peserta ditampilkan di sini karena panitia membutuhkannya
        untuk menghubungi peserta, dan tidak pernah tampil di halaman publik.
      </p>
    </div>
  );
}
