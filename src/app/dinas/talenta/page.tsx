import type { Metadata } from "next";
import Link from "next/link";

import { KotakCari } from "@/components/kotak-cari";
import { Kartu } from "@/components/sk";
import { prisma } from "@/lib/prisma";
import {
  LABEL_TINGKAT,
  TINGKAT_PRESTASI,
  adalahTingkat,
  tingkatKeAtas,
} from "@/lib/prestasi";
import { keterbukaanProfil, umur } from "@/lib/profil";
import { wajibPeran } from "@/lib/sesi";

export const metadata: Metadata = { title: "Cari Talenta" };

/**
 * Penyaringan talenta untuk dinas.
 *
 * Ini pembeda antara MENELUSURI dan MENYARING. Menelusuri berarti membuka
 * direktori organisasi satu per satu lalu membaca profil anggotanya — cara
 * yang masih terbayang untuk lima puluh profil dan mustahil untuk tiga ribu,
 * dan yang hanya menemukan pemuda yang kebetulan bergabung ke organisasi.
 * Halaman ini mencari lintas seluruh pemuda sekaligus, terlepas dari
 * keanggotaannya.
 *
 * Yang ditampilkan sengaja hanya cukup untuk memutuskan siapa yang layak
 * dibuka kartunya. Halaman ini alat memilih, bukan salinan basis data.
 */

const BATAS = 60;

type Saringan = {
  bidang?: string;
  kecamatan?: string;
  tingkat?: string;
  bukti?: string;
  cari?: string;
};

export default async function HalamanCariTalenta({
  searchParams,
}: {
  searchParams: Promise<Saringan>;
}) {
  await wajibPeran("dinas", "superadmin");

  const { bidang, kecamatan, tingkat, bukti, cari } = await searchParams;
  const kunci = cari?.trim();
  const hanyaBerbukti = bukti === "1";
  const ambang = adalahTingkat(tingkat) ? tingkat : null;

  // Saringan prestasi dipakai dua kali dan harus sama persis di keduanya:
  // sekali untuk memilih pemudanya, sekali untuk memilih baris prestasi mana
  // yang ditampilkan. Bila keduanya berbeda, hasilnya memuat orang tanpa satu
  // pun prestasi yang terlihat — dan pembacanya tidak akan tahu mengapa.
  const saringPrestasi = {
    ...(ambang ? { tingkat: { in: tingkatKeAtas(ambang) } } : {}),
    ...(hanyaBerbukti ? { buktiUrl: { not: null } } : {}),
  };

  const [daftarMinat, daftarKecamatan, hasil] = await Promise.all([
    prisma.minat.findMany({ orderBy: { nama: "asc" }, select: { id: true, nama: true, slug: true } }),
    prisma.kecamatan.findMany({ orderBy: { nama: "asc" }, select: { id: true, nama: true } }),
    prisma.profilPemuda.findMany({
      where: {
        prestasi: { some: saringPrestasi },
        ...(kecamatan ? { kecamatanId: kecamatan } : {}),
        ...(bidang ? { minat: { some: { slug: bidang } } } : {}),
        ...(kunci ? { user: { name: { contains: kunci, mode: "insensitive" } } } : {}),
      },
      orderBy: { diperbaruiPada: "desc" },
      take: BATAS,
      select: {
        id: true,
        slug: true,
        tanggalLahir: true,
        statusVerifikasi: true,
        kecamatan: { select: { nama: true } },
        user: { select: { name: true } },
        minat: { select: { nama: true }, take: 3 },
        prestasi: {
          where: saringPrestasi,
          orderBy: [{ tahun: "desc" }],
          take: 3,
          select: {
            id: true,
            judul: true,
            tingkat: true,
            peringkat: true,
            tahun: true,
            buktiUrl: true,
          },
        },
        _count: { select: { prestasi: { where: saringPrestasi } } },
      },
    }),
  ]);

  function tautan(ubah: Saringan) {
    const p = new URLSearchParams();
    const nilai = {
      bidang: ubah.bidang ?? bidang,
      kecamatan: ubah.kecamatan ?? kecamatan,
      tingkat: ubah.tingkat ?? tingkat,
      bukti: ubah.bukti ?? bukti,
      cari: ubah.cari ?? kunci,
    };
    for (const [k, v] of Object.entries(nilai)) if (v) p.set(k, v);
    const q = p.toString();
    return q ? `/dinas/talenta?${q}` : "/dinas/talenta";
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">Cari talenta</h1>
        <p className="max-w-prose text-sm text-ink-soft">
          Mencari lintas seluruh pemuda yang mencantumkan prestasi, tanpa
          memandang keanggotaan organisasinya. Dipakai untuk menyusun calon
          wakil kabupaten atau menyalurkan dukungan.
        </p>
      </div>

      {/* Diletakkan di atas hasil, bukan di bawah. Daftar yang tampak seperti
          hasil kurasi resmi, padahal isinya klaim yang tidak diperiksa siapa
          pun, adalah cara paling mudah membuat pejabat mengambil keputusan
          atas dasar yang tidak pernah diverifikasi. */}
      <Kartu className="border-brass/40 bg-brass-soft/40">
        <p className="max-w-prose text-sm text-ink-soft">
          <strong className="font-semibold">Prestasi di sini diisi sendiri</strong>{" "}
          oleh pemuda yang bersangkutan dan belum diperiksa dinas. Sebelum
          dipakai sebagai dasar keputusan, buka kartunya dan periksa buktinya.
          Saringan “hanya yang melampirkan bukti” membantu mempersempit.
        </p>
      </Kartu>

      <div className="sk-redup flex flex-col gap-4 p-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted">
            Tingkat minimal
          </span>
          <Link
            href={tautan({ tingkat: "" })}
            className={`rounded-full px-3 py-1.5 text-sm ${
              !ambang ? "bg-accent text-on-accent" : "sk-kartu text-ink-soft"
            }`}
          >
            Semua
          </Link>
          {TINGKAT_PRESTASI.map((t) => (
            <Link
              key={t}
              href={tautan({ tingkat: t })}
              className={`rounded-full px-3 py-1.5 text-sm ${
                ambang === t ? "bg-accent text-on-accent" : "sk-kartu text-ink-soft"
              }`}
            >
              {LABEL_TINGKAT[t]} ke atas
            </Link>
          ))}
        </div>

        <KotakCari
          aksi="/dinas/talenta"
          nilai={kunci}
          tersembunyi={{ bidang, kecamatan, tingkat, bukti }}
          petunjuk="Nama pemuda"
        />

        <form action="/dinas/talenta" method="get" className="flex flex-wrap items-end gap-3">
          {tingkat && <input type="hidden" name="tingkat" value={tingkat} />}
          {bukti && <input type="hidden" name="bukti" value={bukti} />}
          {kunci && <input type="hidden" name="cari" value={kunci} />}

          <div className="flex min-w-52 flex-1 flex-col gap-1.5">
            <label
              htmlFor="bidang"
              className="text-xs font-semibold uppercase tracking-wider text-muted"
            >
              Bidang minat
            </label>
            <select
              id="bidang"
              name="bidang"
              defaultValue={bidang ?? ""}
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

          <div className="flex min-w-52 flex-1 flex-col gap-1.5">
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
            className="sk-kartu sk-pressable rounded-sk px-4 py-2.5 text-sm font-medium text-ink-soft"
          >
            Terapkan
          </button>

          <Link
            href={tautan({ bukti: hanyaBerbukti ? "" : "1" })}
            className="px-2 py-2.5 text-sm text-accent underline underline-offset-2"
          >
            {hanyaBerbukti
              ? "Tampilkan semua, berbukti maupun tidak"
              : "Hanya yang melampirkan bukti"}
          </Link>
        </form>
      </div>

      <p className="text-sm text-muted">
        {hasil.length === 0
          ? "Tidak ada pemuda yang cocok dengan saringan ini."
          : `${hasil.length} pemuda cocok${hasil.length === BATAS ? ` (ditampilkan ${BATAS} teratas)` : ""}.`}
      </p>

      {hasil.length > 0 && (
        <ul className="flex flex-col gap-3">
          {hasil.map((p) => {
            const buka = keterbukaanProfil(p.tanggalLahir);
            const usia =
              buka.tampilkanUsia && p.tanggalLahir ? umur(p.tanggalLahir) : null;
            const lebih = p._count.prestasi - p.prestasi.length;

            return (
              <li key={p.id}>
                <Link href={`/p/${p.slug}`} className="block rounded-sk">
                  <Kartu className="sk-pressable flex flex-col gap-3">
                    <div className="flex flex-wrap items-center gap-3">
                      <h2 className="min-w-0 flex-1 font-semibold">{p.user.name}</h2>
                      {p.statusVerifikasi === "TERVERIFIKASI" && (
                        <span className="rounded-full bg-accent-soft px-2.5 py-1 text-xs font-medium text-accent">
                          Profil terverifikasi
                        </span>
                      )}
                      <span className="text-xs text-muted">
                        {[p.kecamatan?.nama, usia ? `${usia} tahun` : null]
                          .filter(Boolean)
                          .join(" · ")}
                      </span>
                    </div>

                    {p.minat.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {p.minat.map((m) => (
                          <span
                            key={m.nama}
                            className="rounded-full border border-line-strong px-2.5 py-0.5 text-xs text-muted"
                          >
                            {m.nama}
                          </span>
                        ))}
                      </div>
                    )}

                    <ul className="flex flex-col gap-1.5">
                      {p.prestasi.map((s) => (
                        <li key={s.id} className="flex flex-wrap items-center gap-2 text-sm">
                          <span className="rounded-full bg-brass-soft px-2 py-0.5 text-xs font-medium text-brass">
                            {LABEL_TINGKAT[s.tingkat]}
                          </span>
                          <span className="min-w-0 flex-1 truncate text-ink-soft">
                            {s.judul}
                          </span>
                          <span className="text-xs text-muted">
                            {[s.peringkat, s.tahun].filter(Boolean).join(" · ")}
                          </span>
                          <span className="text-xs text-muted">
                            {s.buktiUrl ? "ada bukti" : "tanpa bukti"}
                          </span>
                        </li>
                      ))}
                      {lebih > 0 && (
                        <li className="text-xs text-muted">
                          dan {lebih} prestasi lain yang cocok
                        </li>
                      )}
                    </ul>
                  </Kartu>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
