import Link from "next/link";

import { Kartu } from "@/components/sk";
import { LABEL_KEANGGOTAAN } from "@/lib/organisasi";
import { peluangMasihTerbuka } from "@/lib/peluang";
import { LABEL_PERAN } from "@/lib/peran";
import { prisma } from "@/lib/prisma";
import { USIA_MAKS_PESERTA, USIA_MIN_PESERTA, umur } from "@/lib/profil";
import { wajibPeran } from "@/lib/sesi";
import { sisaWaktu, tanggalPendek } from "@/lib/teks";

const LABEL_STATUS_KEANGGOTAAN: Record<string, string> = {
  MENUNGGU: "Menunggu persetujuan pengurus",
  TERVERIFIKASI: "Anggota",
  DITOLAK: "Tidak disetujui",
};

const WARNA_KEANGGOTAAN: Record<string, string> = {
  MENUNGGU: "bg-sunk text-muted",
  TERVERIFIKASI: "bg-accent-soft text-accent",
  DITOLAK: "bg-danger-soft text-danger",
};

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
      ...peluangMasihTerbuka(sekarang),
      ...(idMinat.length > 0 ? { minat: { some: { id: { in: idMinat } } } } : {}),
    },
    orderBy: [{ tenggat: "asc" }, { dibuatPada: "desc" }],
    take: 4,
    select: { id: true, judul: true, slug: true, tenggat: true },
  });

  const [
    jumlahKegiatan,
    jumlahKarya,
    jumlahAspirasi,
    aspirasiDitanggapi,
    keanggotaan,
  ] = await Promise.all([
    prisma.pendaftaran.count({ where: { userId: sesi.user.id } }),
    prisma.karya.count({ where: { pemilikId: sesi.user.id } }),
    prisma.aspirasi.count({ where: { pengirimId: sesi.user.id } }),
    prisma.aspirasi.count({
      where: { pengirimId: sesi.user.id, tanggapan: { not: null } },
    }),
    // Keputusan pengurus atas pengajuan keanggotaan sebelumnya hanya terlihat
    // bila pemuda kebetulan membuka lagi halaman organisasi yang bersangkutan.
    // Di sinilah tempat melihatnya tanpa harus mengingat ke mana dulu ia
    // pernah mengajukan.
    prisma.keanggotaan.findMany({
      where: { userId: sesi.user.id },
      orderBy: [{ status: "asc" }, { dibuatPada: "desc" }],
      take: 20,
      select: {
        id: true,
        status: true,
        peran: true,
        organisasi: { select: { nama: true, slug: true } },
      },
    }),
  ]);

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
    <div className="flex flex-col gap-6">

      <header className="sk-kartu flex flex-wrap items-center gap-4 px-6 py-5">
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
          <div className="sk-redup h-2 w-full overflow-hidden rounded-full">
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
                className="sk-kartu sk-pressable rounded-sk px-4 py-2.5 text-sm font-medium text-ink-soft"
              >
                Lihat kartu publik
              </Link>
            )}
            <Link
              href="/pemuda/kegiatan"
              className="sk-kartu sk-pressable rounded-sk px-4 py-2.5 text-sm font-medium text-ink-soft"
            >
              Kegiatan saya ({jumlahKegiatan})
            </Link>
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

      <div className="grid gap-4 sm:grid-cols-2">
        <Kartu className="flex flex-col gap-3">
          <h2 className="text-base font-semibold">Ruang Karya</h2>
          <p className="text-sm text-ink-soft">
            {jumlahKarya === 0
              ? "Belum ada karya yang Anda pamerkan. Satu karya saja sudah membuat kartu talenta Anda jauh lebih meyakinkan."
              : `${jumlahKarya} karya sudah Anda unggah ke etalase pemuda Demak.`}
          </p>
          <div className="mt-auto flex flex-wrap gap-2 pt-1">
            <Link
              href="/pemuda/karya"
              className="sk-btn-utama sk-pressable rounded-sk px-4 py-2.5 text-sm"
            >
              {jumlahKarya === 0 ? "Unggah karya pertama" : "Kelola karya saya"}
            </Link>
            <Link
              href="/karya"
              className="sk-kartu sk-pressable rounded-sk px-4 py-2.5 text-sm font-medium text-ink-soft"
            >
              Lihat Ruang Karya
            </Link>
          </div>
        </Kartu>

        <Kartu className="flex flex-col gap-3">
          <h2 className="text-base font-semibold">Ruang Aspirasi</h2>
          <p className="text-sm text-ink-soft">
            {jumlahAspirasi === 0
              ? "Punya usulan untuk kepemudaan Demak? Sampaikan langsung kepada Dispora. Isinya hanya dibaca dinas, tidak tampil di halaman publik."
              : `${jumlahAspirasi} aspirasi terkirim, ${aspirasiDitanggapi} sudah ditanggapi dinas.`}
          </p>
          <div className="mt-auto flex flex-wrap gap-2 pt-1">
            <Link
              href="/pemuda/aspirasi"
              className="sk-btn-utama sk-pressable rounded-sk px-4 py-2.5 text-sm"
            >
              {jumlahAspirasi === 0 ? "Kirim aspirasi" : "Aspirasi saya"}
            </Link>
          </div>
        </Kartu>
      </div>

      <Kartu className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-base font-semibold">Organisasi saya</h2>
          <Link
            href="/direktori"
            className="text-sm text-accent underline underline-offset-2"
          >
            Cari organisasi
          </Link>
        </div>

        {keanggotaan.length === 0 ? (
          <p className="text-sm text-muted">
            Anda belum tergabung di organisasi mana pun. Telusuri Direktori
            Organisasi, lalu ajukan diri — pengurusnya yang akan menyetujui.
          </p>
        ) : (
          <ul className="flex flex-col gap-2.5">
            {keanggotaan.map((k) => (
              <li key={k.id} className="flex flex-wrap items-center gap-2">
                <Link
                  href={`/direktori/${k.organisasi.slug}`}
                  className="min-w-0 flex-1 truncate text-sm font-medium hover:text-accent"
                >
                  {k.organisasi.nama}
                </Link>
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-medium ${WARNA_KEANGGOTAAN[k.status]}`}
                >
                  {LABEL_STATUS_KEANGGOTAAN[k.status]}
                </span>
                {k.status === "TERVERIFIKASI" && k.peran !== "ANGGOTA" && (
                  <span className="rounded-full border border-line-strong px-2.5 py-0.5 text-xs text-muted">
                    {LABEL_KEANGGOTAAN[k.peran]}
                  </span>
                )}
              </li>
            ))}
          </ul>
        )}
      </Kartu>

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
    </div>
  );
}
