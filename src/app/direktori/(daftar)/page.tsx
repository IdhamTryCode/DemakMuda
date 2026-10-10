import type { Metadata } from "next";
import Link from "next/link";

import { BingkaiPublik } from "@/components/bingkai-publik";
import { IkonFilter, IkonKomunitas, IkonLokasi } from "@/components/ikon";
import { KartuOrganisasi } from "@/components/kartu-organisasi";
import { Cip, Kartu, Overline, PanelSunk, UbinMetrik } from "@/components/sk";
import {
  adalahJenisOrganisasi,
  JENIS_ORGANISASI,
  LABEL_ORGANISASI,
} from "@/lib/organisasi";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Direktori Organisasi",
  description:
    "Karang taruna, OKP, sanggar, dan komunitas kepemudaan se-Kabupaten Demak.",
};

const BATAS = 60;

type Saringan = { kecamatan?: string; jenis?: string };

export default async function HalamanDirektori({
  searchParams,
}: {
  searchParams: Promise<Saringan>;
}) {
  const { kecamatan, jenis } = await searchParams;
  // Jenis karangan yang tidak dikenal diabaikan, bukan menggagalkan halaman.
  const jenisSah = adalahJenisOrganisasi(jenis) ? jenis : undefined;

  const [daftarKecamatan, organisasi, perJenis, perKecamatan, jumlahTerverifikasi] =
    await Promise.all([
      prisma.kecamatan.findMany({
        orderBy: { nama: "asc" },
        select: { id: true, nama: true },
      }),

      prisma.organisasi.findMany({
        // Hanya organisasi terverifikasi yang tampil di direktori publik.
        where: {
          statusVerifikasi: "TERVERIFIKASI",
          ...(kecamatan ? { kecamatanId: kecamatan } : {}),
          ...(jenisSah ? { jenis: jenisSah } : {}),
        },
        orderBy: [{ kecamatan: { nama: "asc" } }, { nama: "asc" }],
        take: BATAS,
        select: {
          id: true,
          nama: true,
          slug: true,
          jenis: true,
          deskripsi: true,
          logoUrl: true,
          kecamatan: { select: { nama: true } },
          _count: {
            select: { keanggotaan: { where: { status: "TERVERIFIKASI" } } },
          },
        },
      }),

      // Jumlah per jenis dan per kecamatan dihitung sungguhan dari basis data,
      // bukan dari daftar yang sedang tampil — supaya angkanya tidak berubah
      // hanya karena satu saringan sedang menyala. Batasnya sama dengan
      // daftarnya: hanya organisasi TERVERIFIKASI.
      prisma.organisasi.groupBy({
        by: ["jenis"],
        where: { statusVerifikasi: "TERVERIFIKASI" },
        _count: { _all: true },
      }),
      prisma.organisasi.groupBy({
        by: ["kecamatanId"],
        where: { statusVerifikasi: "TERVERIFIKASI" },
        _count: { _all: true },
      }),
      prisma.organisasi.count({ where: { statusVerifikasi: "TERVERIFIKASI" } }),
    ]);

  const jumlahJenis = new Map(perJenis.map((r) => [r.jenis, r._count._all]));
  const jumlahKecamatan = new Map(
    perKecamatan.map((r) => [r.kecamatanId, r._count._all]),
  );
  const kecamatanBerisi = perKecamatan.length;

  /** Alamat dengan satu parameter saringan diubah, sisanya dipertahankan. */
  function tautan(ubah: Saringan) {
    const p = new URLSearchParams();
    const k = ubah.kecamatan ?? kecamatan;
    const j = ubah.jenis ?? jenisSah;
    if (k) p.set("kecamatan", k);
    if (j) p.set("jenis", j);
    const q = p.toString();
    return q ? `/direktori?${q}` : "/direktori";
  }

  const adaSaringan = Boolean(kecamatan || jenisSah);

  return (
    <BingkaiPublik aktif="/direktori">
      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-semibold tracking-tight">
              Direktori Organisasi
            </h1>
            <p className="max-w-prose text-sm text-ink-soft">
              Karang taruna, organisasi kepemudaan, sanggar, dan komunitas
              se-Kabupaten Demak. Semua yang tercantum sudah diverifikasi Dinas
              Kepemudaan dan Olahraga.
            </p>
          </div>

          {/* Dua angka nyata yang dihitung dari basis data. Tanpa persentase,
              dan tanpa ubin ketiga: tidak ada angka ketiga yang benar-benar
              dihitung di sini. */}
          <PanelSunk className="grid shrink-0 grid-cols-2 gap-x-6 gap-y-4 p-4">
            <UbinMetrik
              nilai={jumlahTerverifikasi}
              label="Organisasi terverifikasi"
              ikon={<IkonKomunitas className="h-5 w-5" />}
            />
            <UbinMetrik
              nilai={kecamatanBerisi}
              label="Kecamatan berorganisasi"
              ikon={<IkonLokasi className="h-5 w-5" />}
            />
          </PanelSunk>
        </div>

        <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
          {/* Panel saringan, kolom kiri pada layar lebar. Saringan tetap
              formulir/tautan GET dengan dua parameter yang sudah ada —
              kecamatan dan jenis — masing-masing satu pilihan. */}
          <PanelSunk className="hidden w-72 shrink-0 flex-col gap-5 p-4 lg:flex">
            <div className="flex items-center gap-2">
              <IkonFilter className="h-4 w-4 shrink-0 text-muted" />
              <span className="text-sm font-semibold">Saringan</span>
            </div>

            <div className="flex flex-col gap-2">
              <Overline>Jenis</Overline>
              <ul className="flex flex-col gap-2">
                <li>
                  <Cip
                    href={tautan({ jenis: "" })}
                    aktif={!jenisSah}
                    className="w-full justify-between"
                  >
                    <span>Semua</span>
                    <span className="tabular-nums">{jumlahTerverifikasi}</span>
                  </Cip>
                </li>
                {JENIS_ORGANISASI.map((j) => (
                  <li key={j}>
                    <Cip
                      href={tautan({ jenis: j })}
                      aktif={jenisSah === j}
                      className="w-full justify-between"
                    >
                      <span>{LABEL_ORGANISASI[j]}</span>
                      <span className="tabular-nums">{jumlahJenis.get(j) ?? 0}</span>
                    </Cip>
                  </li>
                ))}
              </ul>
            </div>

            <form
              action="/direktori"
              method="get"
              className="flex flex-col gap-2"
            >
              {jenisSah && <input type="hidden" name="jenis" value={jenisSah} />}
              <label
                htmlFor="kecamatan"
                className="text-[11px] font-semibold uppercase leading-[14px] tracking-[0.12em] text-muted"
              >
                Kecamatan
              </label>
              <select
                id="kecamatan"
                name="kecamatan"
                defaultValue={kecamatan ?? ""}
                className="sk-field w-full px-3.5 py-2.5 text-sm"
              >
                <option value="">Semua kecamatan ({jumlahTerverifikasi})</option>
                {daftarKecamatan.map((k) => (
                  <option key={k.id} value={k.id}>
                    {k.nama} ({jumlahKecamatan.get(k.id) ?? 0})
                  </option>
                ))}
              </select>
              <button
                type="submit"
                className="sk-kartu sk-pressable min-h-10 rounded-full px-4 text-sm font-medium text-ink-soft"
              >
                Terapkan
              </button>
              {adaSaringan && (
                <Link
                  href="/direktori"
                  className="w-fit text-sm text-accent underline underline-offset-2"
                >
                  Hapus saringan
                </Link>
              )}
            </form>
          </PanelSunk>

          <div className="flex min-w-0 flex-1 flex-col gap-6">
            {/* Ponsel: cip jenis dan pita kecamatan, keduanya menggulir
                mendatar. */}
            <div className="flex flex-col gap-4 lg:hidden">
              <div className="flex flex-col gap-2">
                <Overline>Jenis</Overline>
                <ul className="-mx-6 flex gap-2 overflow-x-auto px-6 pb-1">
                  <li className="shrink-0">
                    <Cip href={tautan({ jenis: "" })} aktif={!jenisSah}>
                      Semua
                    </Cip>
                  </li>
                  {JENIS_ORGANISASI.map((j) => (
                    <li key={j} className="shrink-0">
                      <Cip href={tautan({ jenis: j })} aktif={jenisSah === j}>
                        {LABEL_ORGANISASI[j]}
                      </Cip>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex flex-col gap-2">
                <Overline>Kecamatan</Overline>
                <ul className="-mx-6 flex gap-2 overflow-x-auto px-6 pb-1">
                  <li className="shrink-0">
                    <Cip href={tautan({ kecamatan: "" })} aktif={!kecamatan}>
                      Semua
                    </Cip>
                  </li>
                  {daftarKecamatan.map((k) => (
                    <li key={k.id} className="shrink-0">
                      <Cip
                        href={tautan({ kecamatan: k.id })}
                        aktif={kecamatan === k.id}
                      >
                        {k.nama}
                      </Cip>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {organisasi.length === 0 ? (
              <Kartu className="flex flex-col items-start gap-3">
                <p className="text-sm text-muted">
                  Belum ada organisasi terverifikasi dengan saringan ini.
                </p>
                {adaSaringan && (
                  <Link
                    href="/direktori"
                    className="text-sm text-accent underline underline-offset-2"
                  >
                    Hapus saringan dan lihat semua
                  </Link>
                )}
              </Kartu>
            ) : (
              <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {organisasi.map((o) => (
                  <li key={o.id} className="h-full">
                    <KartuOrganisasi
                      nama={o.nama}
                      slug={o.slug}
                      jenis={o.jenis}
                      kecamatan={o.kecamatan.nama}
                      anggota={o._count.keanggotaan}
                      deskripsi={o.deskripsi}
                      logoUrl={o.logoUrl}
                      judulSebagai="h2"
                    />
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </BingkaiPublik>
  );
}
