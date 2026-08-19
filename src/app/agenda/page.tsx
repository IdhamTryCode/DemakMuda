import type { Metadata } from "next";
import Link from "next/link";

import { BingkaiPublik } from "@/components/bingkai-publik";
import { Kartu } from "@/components/sk";
import { prisma } from "@/lib/prisma";
import { bulanTahun, tanggalPanjang, waktuSaja } from "@/lib/teks";

export const metadata: Metadata = {
  title: "Agenda",
  description:
    "Kalender kegiatan kepemudaan se-Kabupaten Demak: jambore, lomba, pelatihan, dan agenda budaya.",
};

type Saringan = { kecamatan?: string; waktu?: string };

export default async function HalamanAgenda({
  searchParams,
}: {
  searchParams: Promise<Saringan>;
}) {
  const { kecamatan, waktu } = await searchParams;
  const lampau = waktu === "lalu";
  const sekarang = new Date();

  const [daftarKecamatan, agenda] = await Promise.all([
    prisma.kecamatan.findMany({
      orderBy: { nama: "asc" },
      select: { id: true, nama: true },
    }),
    prisma.agenda.findMany({
      where: {
        status: "TERBIT",
        ...(kecamatan ? { kecamatanId: kecamatan } : {}),
        mulai: lampau ? { lt: sekarang } : { gte: sekarang },
      },
      orderBy: { mulai: lampau ? "desc" : "asc" },
      // Batas aman supaya halaman tetap ringan bila isinya sudah banyak.
      take: 60,
      select: {
        id: true,
        judul: true,
        slug: true,
        deskripsi: true,
        lokasi: true,
        mulai: true,
        selesai: true,
        kecamatan: { select: { nama: true } },
      },
    }),
  ]);

  // Dikelompokkan per bulan lebih dulu, bukan sambil merender, supaya tidak
  // ada nilai yang berubah di tengah proses render.
  const kelompok: { bulan: string; isi: typeof agenda }[] = [];
  for (const a of agenda) {
    const bulan = bulanTahun(a.mulai);
    const terakhir = kelompok.at(-1);
    if (terakhir?.bulan === bulan) terakhir.isi.push(a);
    else kelompok.push({ bulan, isi: [a] });
  }

  function tautanSaringan(ubah: Saringan) {
    const p = new URLSearchParams();
    const kec = ubah.kecamatan ?? kecamatan;
    const wkt = ubah.waktu ?? waktu;
    if (kec) p.set("kecamatan", kec);
    if (wkt) p.set("waktu", wkt);
    const q = p.toString();
    return q ? `/agenda?${q}` : "/agenda";
  }

  return (
    <BingkaiPublik aktif="/agenda">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-semibold tracking-tight">Agenda Demak</h1>
          <p className="max-w-prose text-sm text-ink-soft">
            Kegiatan kepemudaan se-Kabupaten Demak dalam satu tempat — dari
            jambore, lomba, dan pelatihan sampai agenda budaya.
          </p>
        </div>

        <div className="sk-inset flex flex-col gap-4 p-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted">
              Waktu
            </span>
            {[
              { nilai: undefined, label: "Mendatang" },
              { nilai: "lalu", label: "Sudah lewat" },
            ].map((p) => {
              const aktif = (p.nilai ?? "") === (waktu ?? "");
              return (
                <Link
                  key={p.label}
                  href={tautanSaringan({ waktu: p.nilai ?? "" })}
                  className={`rounded-full px-3 py-1.5 text-sm ${
                    aktif
                      ? "bg-accent text-on-accent"
                      : "sk-raised text-ink-soft"
                  }`}
                >
                  {p.label}
                </Link>
              );
            })}
          </div>

          <form action="/agenda" method="get" className="flex flex-wrap items-end gap-3">
            {waktu && <input type="hidden" name="waktu" value={waktu} />}
            <div className="flex min-w-56 flex-1 flex-col gap-1.5">
              <label
                htmlFor="kecamatan"
                className="text-xs font-semibold uppercase tracking-wider text-muted"
              >
                Kecamatan
              </label>
              <select
                id="kecamatan"
                name="kecamatan"
                defaultValue={kecamatan ?? ""}
                className="sk-field w-full px-3.5 py-2.5 text-sm"
              >
                <option value="">Semua kecamatan</option>
                {daftarKecamatan.map((k) => (
                  <option key={k.id} value={k.id}>
                    {k.nama}
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
            {kecamatan && (
              <Link
                href={tautanSaringan({ kecamatan: "" })}
                className="px-2 py-2.5 text-sm text-accent underline underline-offset-2"
              >
                Hapus saringan
              </Link>
            )}
          </form>
        </div>

        {agenda.length === 0 ? (
          <Kartu>
            <p className="text-sm text-muted">
              {lampau
                ? "Belum ada agenda yang sudah lewat."
                : "Belum ada agenda mendatang yang diterbitkan."}
            </p>
          </Kartu>
        ) : (
          <div className="flex flex-col gap-6">
            {kelompok.map((k) => (
              <section key={k.bulan} className="flex flex-col gap-3">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-brass">
                  {k.bulan}
                </h2>
                <ul className="flex flex-col gap-4">
                  {k.isi.map((a) => (
                    <li key={a.id}>
                      <Link href={`/agenda/${a.slug}`} className="block rounded-sk">
                        <Kartu className="sk-pressable flex flex-col gap-2">
                          <span className="text-xs uppercase tracking-wider text-muted">
                            {tanggalPanjang(a.mulai)} · {waktuSaja(a.mulai)}
                            {a.selesai ? `–${waktuSaja(a.selesai)}` : ""} WIB
                          </span>
                          <h3 className="text-lg font-semibold leading-snug">
                            {a.judul}
                          </h3>
                          {(a.lokasi || a.kecamatan) && (
                            <p className="text-sm text-ink-soft">
                              {[a.lokasi, a.kecamatan?.nama]
                                .filter(Boolean)
                                .join(" · ")}
                            </p>
                          )}
                        </Kartu>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        )}
      </div>
    </BingkaiPublik>
  );
}
