import type { Metadata } from "next";
import Link from "next/link";

import { Kartu } from "@/components/sk";
import {
  LABEL_STATUS_ASPIRASI,
  STATUS_ASPIRASI,
  WARNA_STATUS_ASPIRASI,
  adalahStatusAspirasi,
} from "@/lib/aspirasi";
import { prisma } from "@/lib/prisma";
import { wajibPeran } from "@/lib/sesi";
import { cuplikan, tanggalPendek } from "@/lib/teks";

export const metadata: Metadata = { title: "Ruang Aspirasi" };

export default async function HalamanKelolaAspirasi({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  // Tata letak /kelola juga membuka pintu bagi peran organisasi, jadi
  // penjagaan di sini bukan pengulangan yang sia-sia: aspirasi ditujukan
  // kepada dinas, dan organisasi tidak berhak membacanya.
  await wajibPeran("dinas", "superadmin");

  const { status } = await searchParams;
  const saring = adalahStatusAspirasi(status) ? status : undefined;

  const [daftar, jumlahBaru] = await Promise.all([
    prisma.aspirasi.findMany({
      where: saring ? { status: saring } : undefined,
      // Yang belum ditanggapi naik lebih dulu, lalu yang terbaru.
      orderBy: [{ status: "asc" }, { dibuatPada: "desc" }],
      take: 100,
      select: {
        id: true,
        judul: true,
        isi: true,
        status: true,
        dibuatPada: true,
        pengirim: { select: { name: true } },
      },
    }),
    prisma.aspirasi.count({ where: { status: "BARU" } }),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">Ruang Aspirasi</h1>
        <p className="max-w-prose text-sm text-muted">
          Usulan yang masuk dari pemuda Demak. {jumlahBaru} aspirasi menunggu
          tanggapan. Isinya tidak pernah tampil di halaman publik.
        </p>
      </div>

      <div className="sk-redup flex flex-wrap items-center gap-2 p-4">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted">
          Status
        </span>
        <Link
          href="/kelola/aspirasi"
          className={`rounded-full px-3 py-1.5 text-sm ${
            !saring ? "bg-accent text-on-accent" : "sk-kartu text-ink-soft"
          }`}
        >
          Semua
        </Link>
        {STATUS_ASPIRASI.map((s) => (
          <Link
            key={s}
            href={`/kelola/aspirasi?status=${s}`}
            className={`rounded-full px-3 py-1.5 text-sm ${
              saring === s ? "bg-accent text-on-accent" : "sk-kartu text-ink-soft"
            }`}
          >
            {LABEL_STATUS_ASPIRASI[s]}
          </Link>
        ))}
      </div>

      {daftar.length === 0 ? (
        <Kartu>
          <p className="text-sm text-muted">
            {saring
              ? `Tidak ada aspirasi berstatus ${LABEL_STATUS_ASPIRASI[saring]}.`
              : "Belum ada aspirasi yang masuk."}
          </p>
        </Kartu>
      ) : (
        <ul className="flex flex-col gap-3">
          {daftar.map((a) => (
            <li key={a.id}>
              <Link href={`/kelola/aspirasi/${a.id}`} className="block rounded-sk">
                <Kartu className="sk-pressable flex flex-col gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${WARNA_STATUS_ASPIRASI[a.status]}`}
                    >
                      {LABEL_STATUS_ASPIRASI[a.status]}
                    </span>
                    <span className="text-xs uppercase tracking-wider text-brass">
                      {tanggalPendek(a.dibuatPada)}
                    </span>
                  </div>
                  <h2 className="font-medium leading-snug">{a.judul}</h2>
                  <p className="text-sm text-ink-soft">{cuplikan(a.isi, 160)}</p>
                  <span className="text-xs text-muted">Dari {a.pengirim.name}</span>
                </Kartu>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
