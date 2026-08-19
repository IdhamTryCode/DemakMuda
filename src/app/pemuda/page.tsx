import Link from "next/link";

import { GantiTema } from "@/components/ganti-tema";
import { LogoDemak } from "@/components/logo-demak";
import { Kartu } from "@/components/sk";
import { TombolKeluar } from "@/components/tombol-keluar";
import { LABEL_PERAN } from "@/lib/peran";
import { prisma } from "@/lib/prisma";
import { USIA_MAKS_PESERTA, USIA_MIN_PESERTA, umur } from "@/lib/profil";
import { wajibPeran } from "@/lib/sesi";
import { sisaWaktu, tanggalPendek } from "@/lib/teks";

export default async function DasborPemuda() {
  const sesi = await wajibPeran("pemuda");
  const sekarang = new Date();

  const profil = await prisma.profilPemuda.findUnique({
    where: { userId: sesi.user.id },
    select: {
      slug: true,
      tanggalLahir: true,
      kecamatan: { select: { nama: true } },
      minat: { select: { id: true, nama: true } },
      keterampilan: { select: { id: true } },
    },
  });

  // Peluang disaring menurut minat pemuda bila profilnya sudah diisi; kalau
  // belum, tampilkan yang terdekat tenggatnya supaya halaman tidak kosong.
  const idMinat = profil?.minat.map((m) => m.id) ?? [];
  const peluang = await prisma.peluang.findMany({
    where: {
      status: "TERBIT",
      OR: [{ tenggat: null }, { tenggat: { gte: sekarang } }],
      ...(idMinat.length > 0 ? { minat: { some: { id: { in: idMinat } } } } : {}),
    },
    orderBy: [{ tenggat: "asc" }, { dibuatPada: "desc" }],
    take: 4,
    select: { id: true, judul: true, slug: true, tenggat: true },
  });

  const usia = profil?.tanggalLahir ? umur(profil.tanggalLahir, sekarang) : null;
  const diLuarRentang =
    usia !== null && (usia < USIA_MIN_PESERTA || usia > USIA_MAKS_PESERTA);

  const kelengkapan = [
    Boolean(profil?.tanggalLahir),
    Boolean(profil?.kecamatan),
    (profil?.minat.length ?? 0) > 0,
    (profil?.keterampilan.length ?? 0) > 0,
  ];
  const terisi = kelengkapan.filter(Boolean).length;

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 px-6 py-8">
      <nav className="flex items-center justify-between gap-4">
        <LogoDemak ukuran={36} />
        <div className="flex items-center gap-3">
          <GantiTema />
          <TombolKeluar />
        </div>
      </nav>

      <header className="sk-raised flex flex-wrap items-center gap-4 px-6 py-5">
        <div className="flex flex-col gap-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-brass">
            {LABEL_PERAN.pemuda}
          </span>
          <h1 className="text-2xl font-semibold tracking-tight">{sesi.user.name}</h1>
          {profil?.kecamatan && (
            <p className="text-sm text-muted">Kecamatan {profil.kecamatan.nama}</p>
          )}
        </div>
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        <Kartu className="flex flex-col gap-3">
          <h2 className="text-base font-semibold">Kartu Talenta</h2>
          <p className="text-sm text-ink-soft">
            {terisi === kelengkapan.length
              ? "Profil Anda sudah lengkap."
              : `Profil terisi ${terisi} dari ${kelengkapan.length} bagian. Melengkapinya membuat peluang yang muncul lebih sesuai.`}
          </p>
          <div className="sk-inset h-2 w-full overflow-hidden rounded-full">
            <div
              className="h-full rounded-full bg-accent transition-all"
              style={{ width: `${(terisi / kelengkapan.length) * 100}%` }}
            />
          </div>
          <div className="flex flex-wrap gap-2 pt-1">
            <Link
              href="/pemuda/profil"
              className="sk-btn-utama sk-pressable rounded-sk px-4 py-2.5 text-sm"
            >
              {profil ? "Ubah profil" : "Lengkapi profil"}
            </Link>
            {profil?.slug && (
              <Link
                href={`/p/${profil.slug}`}
                className="sk-raised sk-pressable rounded-sk px-4 py-2.5 text-sm font-medium text-ink-soft"
              >
                Lihat kartu publik
              </Link>
            )}
          </div>
        </Kartu>

        <Kartu className="flex flex-col gap-3">
          <h2 className="text-base font-semibold">
            {idMinat.length > 0 ? "Peluang sesuai minat Anda" : "Peluang terdekat"}
          </h2>
          {peluang.length === 0 ? (
            <p className="text-sm text-muted">
              Belum ada peluang yang cocok. Coba tambah bidang minat di profil.
            </p>
          ) : (
            <ul className="flex flex-col gap-2.5">
              {peluang.map((p) => (
                <li key={p.id}>
                  <Link
                    href={`/peluang/${p.slug}`}
                    className="flex flex-col gap-0.5 rounded-sk hover:text-accent"
                  >
                    <span className="text-sm font-medium leading-snug">{p.judul}</span>
                    <span className="text-xs text-muted">
                      {p.tenggat
                        ? `Tutup ${tanggalPendek(p.tenggat)} · ${sisaWaktu(p.tenggat, sekarang)}`
                        : "Tanpa tenggat"}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
          <Link
            href="/peluang"
            className="text-sm text-accent underline underline-offset-2"
          >
            Lihat semua peluang →
          </Link>
        </Kartu>
      </div>

      {diLuarRentang && (
        <Kartu className="flex flex-col gap-2 border-l-4 border-l-brass">
          <h2 className="text-base font-semibold">Catatan usia</h2>
          <p className="text-sm text-ink-soft">
            Usia Anda {usia} tahun. Sebagian besar kegiatan Jambore Pemuda
            terbatas untuk usia {USIA_MIN_PESERTA} sampai {USIA_MAKS_PESERTA}{" "}
            tahun, jadi tidak semua peluang di sini dapat Anda ikuti.
          </p>
        </Kartu>
      )}
    </main>
  );
}
