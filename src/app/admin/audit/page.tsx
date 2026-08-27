import Link from "next/link";

import { Kartu } from "@/components/sk";
import { prisma } from "@/lib/prisma";
import { wajibPeran } from "@/lib/sesi";
import { tanggalPendek, waktuSaja } from "@/lib/teks";

export const metadata = { title: "Jejak Audit" };

const BATAS = 100;

export default async function HalamanAudit({
  searchParams,
}: {
  searchParams: Promise<{ aksi?: string }>;
}) {
  await wajibPeran("superadmin");
  const { aksi } = await searchParams;

  const [jejak, semuaAksi] = await Promise.all([
    prisma.auditLog.findMany({
      // Penyaring dicocokkan dengan awalan, sehingga "kabar" mencakup
      // kabar.buat, kabar.ubah, dan kabar.arsip sekaligus.
      where: aksi ? { aksi: { startsWith: aksi } } : undefined,
      orderBy: { dibuatPada: "desc" },
      take: BATAS,
      select: {
        id: true,
        aksi: true,
        sasaran: true,
        sasaranId: true,
        alamatIp: true,
        dibuatPada: true,
        aktor: { select: { name: true, email: true } },
      },
    }),
    prisma.auditLog.findMany({ distinct: ["aksi"], select: { aksi: true } }),
  ]);

  // Dikelompokkan menurut bagian pertama nama aksi: kabar, agenda, sertifikat…
  const kelompok = [...new Set(semuaAksi.map((a) => a.aksi.split(".")[0]))].sort();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight">Jejak Audit</h1>
          <p className="max-w-prose text-sm text-ink-soft">
            Catatan seluruh tindakan pengelola: pembuatan, penyuntingan,
            verifikasi, dan penerbitan sertifikat. Hanya dapat dibaca — tidak ada
            jalan mengubah atau menghapusnya dari antarmuka.
          </p>
        </div>
        <Link
          href="/admin"
          className="sk-kartu sk-pressable rounded-sk px-4 py-2.5 text-sm font-medium text-ink-soft"
        >
          Kembali
        </Link>
      </div>

      <div className="sk-redup flex flex-wrap items-center gap-2 p-4">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted">
          Jenis tindakan
        </span>
        <Link
          href="/admin/audit"
          className={`rounded-full px-3 py-1.5 text-sm ${
            !aksi ? "bg-accent text-on-accent" : "sk-kartu text-ink-soft"
          }`}
        >
          Semua
        </Link>
        {kelompok.map((k) => (
          <Link
            key={k}
            href={`/admin/audit?aksi=${encodeURIComponent(k)}`}
            className={`rounded-full px-3 py-1.5 text-sm ${
              aksi === k ? "bg-accent text-on-accent" : "sk-kartu text-ink-soft"
            }`}
          >
            {k}
          </Link>
        ))}
      </div>

      {jejak.length === 0 ? (
        <Kartu>
          <p className="text-sm text-muted">Tidak ada catatan dengan saringan ini.</p>
        </Kartu>
      ) : (
        <>
          <ol className="flex flex-col gap-2">
            {jejak.map((j) => (
              <li key={j.id}>
                <Kartu className="flex flex-wrap items-center gap-x-4 gap-y-1 px-5 py-3.5">
                  <span className="font-mono text-xs text-accent">{j.aksi}</span>
                  <span className="min-w-0 flex-1 truncate text-sm text-ink-soft">
                    {j.aktor?.name ?? "sistem"}
                    {j.aktor?.email && (
                      <span className="text-muted"> · {j.aktor.email}</span>
                    )}
                  </span>
                  {j.sasaran && (
                    <span className="font-mono text-xs text-muted">
                      {j.sasaran}
                      {j.sasaranId ? `/${j.sasaranId.slice(0, 8)}` : ""}
                    </span>
                  )}
                  <span className="font-mono text-xs text-muted">
                    {j.alamatIp ?? "—"}
                  </span>
                  <span className="text-xs tabular-nums text-muted">
                    {tanggalPendek(j.dibuatPada)} {waktuSaja(j.dibuatPada)}
                  </span>
                </Kartu>
              </li>
            ))}
          </ol>
          {jejak.length === BATAS && (
            <p className="text-xs text-muted">
              Menampilkan {BATAS} catatan terbaru. Persempit dengan saringan jenis
              tindakan untuk melihat yang lebih lama.
            </p>
          )}
        </>
      )}
    </div>
  );
}
