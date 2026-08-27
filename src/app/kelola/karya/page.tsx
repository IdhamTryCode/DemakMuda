import type { Metadata } from "next";
import Link from "next/link";

import { TombolArsip } from "@/components/tombol-arsip";
import { Kartu } from "@/components/sk";
import { LABEL_JENIS_KARYA } from "@/lib/karya";
import { prisma } from "@/lib/prisma";
import { wajibPeran } from "@/lib/sesi";
import { cuplikan, tanggalPendek } from "@/lib/teks";
import { arsipkanKarya } from "@/server/aksi-karya";

export const metadata: Metadata = { title: "Moderasi Ruang Karya" };

/**
 * Moderasi Ruang Karya.
 *
 * Ruang Karya diisi langsung oleh pemuda tanpa melewati pemeriksaan lebih
 * dulu — itu memang yang membuatnya hidup. Konsekuensinya harus ada jalan
 * menurunkan satu karya bila isinya tidak pantas, dan halaman inilah jalannya.
 *
 * Sengaja hanya mengarsipkan, tidak menyunting: dinas berwenang menurunkan
 * karya dari etalase, bukan mengubah cerita yang ditulis orang lain.
 *
 * Organisasi tidak diberi akses. Pengelola organisasi tidak berkepentingan
 * atas karya perorangan, dan memberi mereka tombol turunkan hanya menambah
 * tangan yang dapat menghapus pekerjaan orang.
 */
const WARNA_STATUS: Record<string, string> = {
  DRAF: "bg-sunk text-muted",
  TERBIT: "bg-accent-soft text-accent",
  ARSIP: "bg-brass-soft text-brass",
};

export default async function HalamanModerasiKarya({
  searchParams,
}: {
  searchParams: Promise<{ arsip?: string }>;
}) {
  await wajibPeran("dinas", "superadmin");

  const { arsip } = await searchParams;
  const tampilkanArsip = arsip === "1";

  const [daftar, jumlahTerbit, jumlahArsip] = await Promise.all([
    prisma.karya.findMany({
      // Draf tidak ikut ditampilkan sekalipun kepada dinas: karya yang belum
      // diterbitkan pemiliknya belum menjadi urusan siapa pun selain dia.
      where: { status: tampilkanArsip ? "ARSIP" : "TERBIT" },
      orderBy: { dibuatPada: "desc" },
      take: 100,
      select: {
        id: true,
        judul: true,
        slug: true,
        jenis: true,
        deskripsi: true,
        status: true,
        dibuatPada: true,
        pemilik: { select: { name: true, email: true } },
      },
    }),
    prisma.karya.count({ where: { status: "TERBIT" } }),
    prisma.karya.count({ where: { status: "ARSIP" } }),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">Ruang Karya</h1>
        <p className="max-w-prose text-sm text-muted">
          {jumlahTerbit} karya tampil di etalase publik, {jumlahArsip} sudah
          diturunkan. Karya berstatus draf tidak ditampilkan di sini — selama
          belum diterbitkan pemiliknya, karya itu belum menjadi urusan dinas.
        </p>
      </div>

      <div className="sk-redup flex flex-wrap items-center gap-2 p-4">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted">
          Tampilkan
        </span>
        <Link
          href="/kelola/karya"
          className={`rounded-full px-3 py-1.5 text-sm ${
            !tampilkanArsip ? "bg-accent text-on-accent" : "sk-kartu text-ink-soft"
          }`}
        >
          Terbit ({jumlahTerbit})
        </Link>
        <Link
          href="/kelola/karya?arsip=1"
          className={`rounded-full px-3 py-1.5 text-sm ${
            tampilkanArsip ? "bg-accent text-on-accent" : "sk-kartu text-ink-soft"
          }`}
        >
          Arsip ({jumlahArsip})
        </Link>
      </div>

      {daftar.length === 0 ? (
        <Kartu>
          <p className="text-sm text-muted">
            {tampilkanArsip
              ? "Belum ada karya yang diturunkan."
              : "Belum ada karya yang diterbitkan."}
          </p>
        </Kartu>
      ) : (
        <ul className="flex flex-col gap-3">
          {daftar.map((k) => {
            async function turunkan() {
              "use server";
              return arsipkanKarya(k.id);
            }

            return (
              <li key={k.id}>
                <Kartu className="flex flex-col gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${WARNA_STATUS[k.status]}`}
                    >
                      {LABEL_JENIS_KARYA[k.jenis]}
                    </span>
                    <span className="text-xs uppercase tracking-wider text-brass">
                      {tanggalPendek(k.dibuatPada)}
                    </span>
                  </div>

                  <h2 className="font-medium leading-snug">{k.judul}</h2>
                  <p className="text-sm text-ink-soft">{cuplikan(k.deskripsi, 160)}</p>
                  <span className="text-xs text-muted">
                    {k.pemilik.name} · {k.pemilik.email}
                  </span>

                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    {k.status === "TERBIT" && (
                      <Link
                        href={`/karya/${k.slug}`}
                        className="sk-kartu sk-pressable rounded-sk px-3 py-2 text-xs font-medium text-ink-soft"
                      >
                        Lihat
                      </Link>
                    )}
                    {k.status === "TERBIT" && (
                      <TombolArsip
                        arsipkan={turunkan}
                        kembaliKe="/kelola/karya"
                        keterangan="Turunkan karya ini dari etalase publik?"
                      />
                    )}
                  </div>
                </Kartu>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
