import type { Metadata } from "next";
import Link from "next/link";

import { TombolTerbaca } from "@/app/notifikasi/tombol-terbaca";
import { Kartu } from "@/components/sk";
import { prisma } from "@/lib/prisma";
import { wajibMasuk } from "@/lib/sesi";
import { tanggalPendek, waktuSaja } from "@/lib/teks";
import { tandaiSemuaTerbaca, tandaiTerbaca } from "@/server/aksi-notifikasi";

export const metadata: Metadata = { title: "Pemberitahuan" };

/**
 * Daftar pemberitahuan milik pengguna yang sedang masuk.
 *
 * Terbuka bagi peran mana pun — setiap peran punya kabarnya sendiri: pemuda
 * menerima keputusan pengurus dan tanggapan dinas, pengurus menerima permintaan
 * bergabung, dinas menerima aspirasi yang masuk.
 *
 * Penyaringan penerima ada di dalam kueri. Tidak ada cabang tampilan yang
 * menyembunyikan pemberitahuan orang lain — pemberitahuan orang lain memang
 * tidak pernah diambil.
 */
export default async function HalamanNotifikasi() {
  const sesi = await wajibMasuk();

  const daftar = await prisma.notifikasi.findMany({
    where: { penerimaId: sesi.user.id },
    orderBy: [{ dibacaPada: "asc" }, { dibuatPada: "desc" }],
    take: 100,
    select: {
      id: true,
      judul: true,
      pesan: true,
      tautan: true,
      dibacaPada: true,
      dibuatPada: true,
    },
  });

  const belum = daftar.filter((n) => !n.dibacaPada).length;

  return (
    <div className="flex flex-col gap-6">

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight">Pemberitahuan</h1>
          <p className="text-sm text-muted">
            {belum === 0
              ? "Tidak ada yang belum dibaca."
              : `${belum} pemberitahuan belum dibaca.`}
          </p>
        </div>
        {belum > 0 && <TombolTerbaca tandai={tandaiSemuaTerbaca} semua />}
      </div>

      {daftar.length === 0 ? (
        <Kartu>
          <p className="text-sm text-muted">
            Belum ada pemberitahuan. Kabar tentang pengajuan, pendaftaran,
            sertifikat, dan tanggapan dinas akan muncul di sini.
          </p>
        </Kartu>
      ) : (
        <ul className="flex flex-col gap-3">
          {daftar.map((n) => {
            async function tandai() {
              "use server";
              return tandaiTerbaca(n.id);
            }

            return (
              <li key={n.id}>
                <Kartu
                  className={`flex flex-col gap-2 ${
                    n.dibacaPada ? "opacity-70" : "border-l-4 border-l-accent"
                  }`}
                >
                  <div className="flex flex-wrap items-center gap-2">
                    {!n.dibacaPada && (
                      <span className="rounded-full bg-accent-soft px-2.5 py-1 text-xs font-medium text-accent">
                        Baru
                      </span>
                    )}
                    <span className="text-xs uppercase tracking-wider text-brass">
                      {tanggalPendek(n.dibuatPada)} · {waktuSaja(n.dibuatPada)}
                    </span>
                  </div>

                  <h2 className="font-medium leading-snug">{n.judul}</h2>
                  <p className="text-sm text-ink-soft">{n.pesan}</p>

                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    {n.tautan && (
                      <Link
                        href={n.tautan}
                        className="sk-kartu sk-pressable rounded-sk px-3 py-2 text-xs font-medium text-ink-soft"
                      >
                        Buka
                      </Link>
                    )}
                    {!n.dibacaPada && <TombolTerbaca tandai={tandai} />}
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
