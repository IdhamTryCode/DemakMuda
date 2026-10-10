import Image from "next/image";
import Link from "next/link";

import { IkonLokasi, IkonPanahKanan } from "@/components/ikon";
import { Kartu } from "@/components/sk";
import { LABEL_ORGANISASI, type JenisOrganisasi } from "@/lib/organisasi";
import { cuplikan } from "@/lib/teks";

/** Inisial nama organisasi, dipakai bila tidak ada logo. */
export function inisialOrganisasi(nama: string) {
  return nama
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((k) => k[0]?.toUpperCase() ?? "")
    .join("");
}

/**
 * Kartu organisasi, dipakai bersama beranda dan direktori.
 *
 * Satu kartu, bukan dua yang mirip: kedua halaman menampilkan benda yang sama,
 * dan dua salinan akan menyimpang begitu salah satunya diubah.
 *
 * Isinya mengikuti DESIGN.md: logo atau inisial, cip jenis, kecamatan, jumlah
 * anggota terverifikasi, ringkasan, lalu tautan rincian. Tanpa kepala foto dan
 * tanpa lencana "Dispora" — status di aplikasi ini cukup dinyatakan lewat
 * penyaringan terverifikasi, bukan lewat lencana per kartu.
 */
export function KartuOrganisasi({
  nama,
  slug,
  jenis,
  kecamatan,
  anggota,
  deskripsi,
  logoUrl,
  judulSebagai: Judul = "h3",
}: {
  nama: string;
  slug: string;
  jenis: JenisOrganisasi;
  kecamatan: string;
  /** Jumlah anggota terverifikasi. Bila kosong, barisnya tidak ditampilkan. */
  anggota?: number | null;
  deskripsi?: string | null;
  logoUrl?: string | null;
  /** Tingkat judul mengikuti konteks halaman yang memuatnya. */
  judulSebagai?: "h2" | "h3";
}) {
  return (
    <Link href={`/direktori/${slug}`} className="block h-full rounded-sk">
      <Kartu className="sk-pressable flex h-full flex-col gap-3">
        <div className="flex items-center gap-3">
          {logoUrl ? (
            <span className="sk-redup relative h-11 w-11 shrink-0 overflow-hidden rounded-[8px]">
              <Image
                src={logoUrl}
                alt=""
                fill
                sizes="2.75rem"
                className="object-cover"
              />
            </span>
          ) : (
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[8px] bg-accent-soft font-semibold text-accent">
              {inisialOrganisasi(nama)}
            </span>
          )}
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <span className="rounded-full bg-accent-soft px-2.5 py-1 text-xs font-medium text-accent">
              {LABEL_ORGANISASI[jenis]}
            </span>
            <span className="inline-flex items-center gap-1 text-xs text-muted">
              <IkonLokasi className="h-3.5 w-3.5" />
              {kecamatan}
            </span>
          </div>
        </div>

        <Judul className="font-semibold leading-snug">{nama}</Judul>

        {deskripsi && (
          <p className="text-sm text-ink-soft">{cuplikan(deskripsi, 120)}</p>
        )}

        <div className="mt-auto flex flex-col gap-1 pt-1">
          {anggota != null && (
            <span className="text-xs text-muted">
              {anggota} anggota terverifikasi
            </span>
          )}
          <span className="inline-flex w-fit items-center gap-1 text-sm text-accent">
            Lihat rincian
            <IkonPanahKanan className="h-4 w-4" />
          </span>
        </div>
      </Kartu>
    </Link>
  );
}
