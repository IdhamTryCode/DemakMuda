import Link from "next/link";

import { GantiTema } from "@/components/ganti-tema";
import { Angka } from "@/components/grafik-batang";
import { LogoDemak } from "@/components/logo-demak";
import { Kartu } from "@/components/sk";
import { TombolKeluar } from "@/components/tombol-keluar";
import { LABEL_PERAN, PERAN } from "@/lib/peran";
import { prisma } from "@/lib/prisma";
import { wajibPeran } from "@/lib/sesi";
import { tanggalPendek, waktuSaja } from "@/lib/teks";

export const metadata = { title: "Administrasi Sistem" };

export default async function DasborAdmin() {
  const sesi = await wajibPeran("superadmin");

  const [perPeran, totalPengguna, sesiAktif, jejakTerakhir, totalJejak] =
    await Promise.all([
      prisma.user.groupBy({ by: ["role"], _count: { _all: true } }),
      prisma.user.count(),
      prisma.session.count({ where: { expiresAt: { gte: new Date() } } }),
      prisma.auditLog.findMany({
        orderBy: { dibuatPada: "desc" },
        take: 8,
        select: {
          id: true,
          aksi: true,
          dibuatPada: true,
          aktor: { select: { name: true } },
        },
      }),
      prisma.auditLog.count(),
    ]);

  const hitungPeran = new Map(perPeran.map((p) => [p.role ?? "pemuda", p._count._all]));

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 px-6 py-8">
      <nav className="flex items-center justify-between gap-4">
        <LogoDemak ukuran={36} />
        <div className="flex items-center gap-3">
          <GantiTema />
          <Link
            href="/dinas"
            className="sk-raised sk-pressable rounded-sk px-4 py-2.5 text-sm font-medium text-ink-soft"
          >
            Peta Potensi
          </Link>
          <TombolKeluar />
        </div>
      </nav>

      <header className="flex flex-col gap-1">
        <span className="text-xs font-semibold uppercase tracking-wider text-brass">
          {LABEL_PERAN.superadmin}
        </span>
        <h1 className="text-2xl font-semibold tracking-tight">Administrasi Sistem</h1>
        <p className="max-w-prose text-sm text-ink-soft">
          Pengelolaan peran pengguna dan penelusuran jejak audit. Halaman ini
          hanya dapat dibuka superadmin.
        </p>
      </header>

      <section className="grid gap-4 sm:grid-cols-3">
        <Angka
          label="Total pengguna"
          nilai={totalPengguna}
          keterangan={`${sesiAktif} sesi masih aktif`}
        />
        <Angka
          label="Tercatat di jejak audit"
          nilai={totalJejak}
          keterangan="Seluruh tindakan pengelola"
        />
        <Angka
          label="Pengelola isi"
          nilai={
            (hitungPeran.get("organisasi") ?? 0) +
            (hitungPeran.get("dinas") ?? 0) +
            (hitungPeran.get("superadmin") ?? 0)
          }
          keterangan="Organisasi, dinas, dan superadmin"
        />
      </section>

      <div className="grid gap-4 sm:grid-cols-2">
        <Kartu className="flex flex-col gap-4">
          <h2 className="text-base font-semibold">Sebaran peran</h2>
          <dl className="flex flex-col gap-2.5">
            {PERAN.map((p) => (
              <div key={p} className="flex items-baseline justify-between gap-4">
                <dt className="text-sm text-ink-soft">{LABEL_PERAN[p]}</dt>
                <dd className="text-lg font-semibold tabular-nums">
                  {hitungPeran.get(p) ?? 0}
                </dd>
              </div>
            ))}
          </dl>
          <Link
            href="/admin/pengguna"
            className="sk-btn-utama sk-pressable w-fit rounded-sk px-4 py-2.5 text-sm"
          >
            Kelola peran pengguna
          </Link>
        </Kartu>

        <Kartu className="flex flex-col gap-4">
          <h2 className="text-base font-semibold">Jejak audit terbaru</h2>
          {jejakTerakhir.length === 0 ? (
            <p className="text-sm text-muted">Belum ada tindakan yang tercatat.</p>
          ) : (
            <ol className="flex flex-col gap-2.5">
              {jejakTerakhir.map((j) => (
                <li key={j.id} className="flex flex-col gap-0.5">
                  <span className="font-mono text-xs text-accent">{j.aksi}</span>
                  <span className="text-xs text-muted">
                    {j.aktor?.name ?? "sistem"} · {tanggalPendek(j.dibuatPada)}{" "}
                    {waktuSaja(j.dibuatPada)}
                  </span>
                </li>
              ))}
            </ol>
          )}
          <Link
            href="/admin/audit"
            className="w-fit text-sm text-accent underline underline-offset-2"
          >
            Lihat seluruh jejak audit →
          </Link>
        </Kartu>
      </div>

      <p className="text-xs text-muted">
        Masuk sebagai {sesi.user.name}. Setiap tindakan Anda di halaman ini ikut
        tercatat pada jejak audit.
      </p>
    </main>
  );
}
