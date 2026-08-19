import type { Metadata } from "next";
import Link from "next/link";

import { BingkaiPublik } from "@/components/bingkai-publik";
import { Kartu } from "@/components/sk";
import { adalahJenis, JENIS_PELUANG, LABEL_JENIS } from "@/lib/peluang";
import { prisma } from "@/lib/prisma";
import { cuplikan, sisaWaktu, tanggalPendek } from "@/lib/teks";

export const metadata: Metadata = {
  title: "Peluang",
  description:
    "Lomba, pelatihan, beasiswa, magang, dan lowongan kerja yang terbuka bagi pemuda Kabupaten Demak.",
};

/** Batas aman supaya halaman tetap ringan bila isinya sudah banyak. */
const BATAS = 60;

type Saringan = { jenis?: string; minat?: string; tutup?: string };

export default async function HalamanPeluang({
  searchParams,
}: {
  searchParams: Promise<Saringan>;
}) {
  const { jenis, minat, tutup } = await searchParams;
  const tampilkanTutup = tutup === "1";
  const sekarang = new Date();

  const [daftarMinat, peluang] = await Promise.all([
    prisma.minat.findMany({
      orderBy: { nama: "asc" },
      select: { id: true, nama: true, slug: true },
    }),
    prisma.peluang.findMany({
      where: {
        status: "TERBIT",
        ...(adalahJenis(jenis) ? { jenis } : {}),
        ...(minat ? { minat: { some: { slug: minat } } } : {}),
        // Peluang tanpa tenggat selalu dianggap masih terbuka.
        ...(tampilkanTutup
          ? { tenggat: { lt: sekarang } }
          : { OR: [{ tenggat: null }, { tenggat: { gte: sekarang } }] }),
      },
      orderBy: tampilkanTutup ? { tenggat: "desc" } : [{ tenggat: "asc" }, { dibuatPada: "desc" }],
      take: BATAS,
      select: {
        id: true,
        judul: true,
        slug: true,
        jenis: true,
        deskripsi: true,
        tenggat: true,
        usiaMin: true,
        usiaMaks: true,
        minat: { select: { nama: true }, take: 3 },
      },
    }),
  ]);

  function tautan(ubah: Saringan) {
    const p = new URLSearchParams();
    const j = ubah.jenis ?? jenis;
    const m = ubah.minat ?? minat;
    const t = ubah.tutup ?? tutup;
    if (j) p.set("jenis", j);
    if (m) p.set("minat", m);
    if (t) p.set("tutup", t);
    const q = p.toString();
    return q ? `/peluang?${q}` : "/peluang";
  }

  return (
    <BingkaiPublik aktif="/peluang">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-semibold tracking-tight">Papan Peluang</h1>
          <p className="max-w-prose text-sm text-ink-soft">
            Lomba, pelatihan, beasiswa, magang, dan lowongan kerja yang terbuka
            bagi pemuda Kabupaten Demak, lengkap dengan tenggat pendaftarannya.
          </p>
        </div>

        <div className="sk-inset flex flex-col gap-4 p-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted">
              Jenis
            </span>
            <Link
              href={tautan({ jenis: "" })}
              className={`rounded-full px-3 py-1.5 text-sm ${
                !jenis ? "bg-accent text-on-accent" : "sk-raised text-ink-soft"
              }`}
            >
              Semua
            </Link>
            {JENIS_PELUANG.map((j) => (
              <Link
                key={j}
                href={tautan({ jenis: j })}
                className={`rounded-full px-3 py-1.5 text-sm ${
                  jenis === j ? "bg-accent text-on-accent" : "sk-raised text-ink-soft"
                }`}
              >
                {LABEL_JENIS[j]}
              </Link>
            ))}
          </div>

          <form action="/peluang" method="get" className="flex flex-wrap items-end gap-3">
            {jenis && <input type="hidden" name="jenis" value={jenis} />}
            {tutup && <input type="hidden" name="tutup" value={tutup} />}
            <div className="flex min-w-56 flex-1 flex-col gap-1.5">
              <label
                htmlFor="minat"
                className="text-xs font-semibold uppercase tracking-wider text-muted"
              >
                Bidang minat
              </label>
              <select
                id="minat"
                name="minat"
                defaultValue={minat ?? ""}
                className="sk-field w-full px-3.5 py-2.5 text-sm"
              >
                <option value="">Semua bidang</option>
                {daftarMinat.map((m) => (
                  <option key={m.id} value={m.slug}>
                    {m.nama}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="submit"
              className="sk-raised sk-pressable rounded-sk px-4 py-2.5 text-sm font-medium text-ink-soft"
            >
              Terapkan
            </button>
            <Link
              href={tautan({ tutup: tampilkanTutup ? "" : "1" })}
              className="px-2 py-2.5 text-sm text-accent underline underline-offset-2"
            >
              {tampilkanTutup ? "Lihat yang masih dibuka" : "Lihat yang sudah tutup"}
            </Link>
          </form>
        </div>

        {peluang.length === 0 ? (
          <Kartu>
            <p className="text-sm text-muted">
              {tampilkanTutup
                ? "Belum ada peluang yang tenggatnya sudah lewat."
                : "Belum ada peluang yang terbuka dengan saringan ini."}
            </p>
          </Kartu>
        ) : (
          <ul className="flex flex-col gap-4">
            {peluang.map((p) => (
              <li key={p.id}>
                <Link href={`/peluang/${p.slug}`} className="block rounded-sk">
                  <Kartu className="sk-pressable flex flex-col gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-accent-soft px-2.5 py-1 text-xs font-medium text-accent">
                        {LABEL_JENIS[p.jenis]}
                      </span>
                      {p.tenggat && (
                        <span className="text-xs uppercase tracking-wider text-brass">
                          Tutup {tanggalPendek(p.tenggat)} ·{" "}
                          {sisaWaktu(p.tenggat, sekarang)}
                        </span>
                      )}
                      {!p.tenggat && (
                        <span className="text-xs uppercase tracking-wider text-muted">
                          Tanpa tenggat
                        </span>
                      )}
                    </div>

                    <h2 className="text-lg font-semibold leading-snug">{p.judul}</h2>

                    <p className="text-sm text-ink-soft">
                      {cuplikan(p.deskripsi)}
                    </p>

                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      {(p.usiaMin || p.usiaMaks) && (
                        <span className="rounded-full border border-line-strong px-2.5 py-0.5 text-xs text-muted">
                          Usia {p.usiaMin ?? "—"}–{p.usiaMaks ?? "—"} tahun
                        </span>
                      )}
                      {p.minat.map((m) => (
                        <span
                          key={m.nama}
                          className="rounded-full border border-line-strong px-2.5 py-0.5 text-xs text-muted"
                        >
                          {m.nama}
                        </span>
                      ))}
                    </div>
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
