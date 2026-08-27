import Link from "next/link";

import { Angka } from "@/components/grafik-batang";
import { Kartu } from "@/components/sk";
import { LABEL_ORGANISASI } from "@/lib/organisasi";
import { LABEL_PERAN } from "@/lib/peran";
import { prisma } from "@/lib/prisma";
import { wajibPeran } from "@/lib/sesi";
import { tanggalPendek } from "@/lib/teks";

export const metadata = { title: "Dasbor Organisasi" };

const WARNA_VERIFIKASI: Record<string, string> = {
  MENUNGGU: "bg-sunk text-muted",
  TERVERIFIKASI: "bg-accent-soft text-accent",
  DITOLAK: "bg-danger-soft text-danger",
};

const LABEL_VERIFIKASI: Record<string, string> = {
  MENUNGGU: "Menunggu verifikasi",
  TERVERIFIKASI: "Terverifikasi",
  DITOLAK: "Ditolak",
};

export default async function DasborOrganisasi() {
  const sesi = await wajibPeran("organisasi");
  const sekarang = new Date();
  const milikSaya = { pemilikId: sesi.user.id };

  const [
    organisasi,
    jumlahKabar,
    kabarDraf,
    jumlahAgenda,
    agendaMendatang,
    jumlahPeluang,
    peluangTerbuka,
    pendaftaranMenunggu,
    anggotaMenunggu,
    isiTerbaru,
  ] = await Promise.all([
    prisma.organisasi.findMany({
      where: milikSaya,
      orderBy: { nama: "asc" },
      select: {
        id: true,
        nama: true,
        slug: true,
        jenis: true,
        statusVerifikasi: true,
        kecamatan: { select: { nama: true } },
        _count: { select: { keanggotaan: true } },
      },
    }),
    prisma.berita.count({ where: { penulisId: sesi.user.id } }),
    prisma.berita.count({ where: { penulisId: sesi.user.id, status: "DRAF" } }),
    prisma.agenda.count({ where: { pembuatId: sesi.user.id } }),
    prisma.agenda.count({
      where: { pembuatId: sesi.user.id, status: "TERBIT", mulai: { gte: sekarang } },
    }),
    prisma.peluang.count({ where: { pembuatId: sesi.user.id } }),
    prisma.peluang.count({
      where: {
        pembuatId: sesi.user.id,
        status: "TERBIT",
        OR: [{ tenggat: null }, { tenggat: { gte: sekarang } }],
      },
    }),
    // Pendaftar yang menunggu konfirmasi pada kegiatan milik akun ini.
    // Inilah satu-satunya angka di halaman ini yang menuntut tindakan, jadi
    // ia yang diberi tempat paling menonjol.
    prisma.pendaftaran.count({
      where: {
        status: "MENUNGGU",
        OR: [
          { agenda: { pembuatId: sesi.user.id } },
          { peluang: { pembuatId: sesi.user.id } },
        ],
      },
    }),
    prisma.keanggotaan.count({
      where: { status: "MENUNGGU", organisasi: milikSaya },
    }),
    prisma.berita.findMany({
      where: { penulisId: sesi.user.id },
      orderBy: { dibuatPada: "desc" },
      take: 4,
      select: { id: true, judul: true, slug: true, status: true, dibuatPada: true },
    }),
  ]);

  const belumTerverifikasi = organisasi.filter(
    (o) => o.statusVerifikasi !== "TERVERIFIKASI",
  );

  return (
    <div className="flex flex-col gap-6">

      <header className="flex flex-col gap-1">
        <span className="text-xs font-semibold uppercase tracking-wider text-brass">
          {LABEL_PERAN.organisasi}
        </span>
        <h1 className="text-2xl font-semibold tracking-tight">{sesi.user.name}</h1>
        <p className="max-w-prose text-sm text-ink-soft">
          Ringkasan organisasi yang Anda kelola beserta isi yang Anda terbitkan
          di DemakMuda.
        </p>
      </header>

      <section className="grid gap-4 sm:grid-cols-3">
        <Angka
          label="Menunggu konfirmasi"
          nilai={pendaftaranMenunggu}
          keterangan={
            pendaftaranMenunggu === 0
              ? "Tidak ada pendaftar yang menunggu"
              : "Pendaftar pada kegiatan Anda"
          }
        />
        <Angka
          label="Agenda mendatang"
          nilai={agendaMendatang}
          keterangan={`${jumlahAgenda} agenda pernah dibuat`}
        />
        <Angka
          label="Peluang masih dibuka"
          nilai={peluangTerbuka}
          keterangan={`${jumlahPeluang} peluang pernah dibuat`}
        />
      </section>

      {belumTerverifikasi.length > 0 && (
        <Kartu className="flex flex-col gap-2 border-l-4 border-l-brass">
          <h2 className="text-base font-semibold">
            {belumTerverifikasi.length === 1
              ? "Satu organisasi belum terverifikasi"
              : `${belumTerverifikasi.length} organisasi belum terverifikasi`}
          </h2>
          <p className="max-w-prose text-sm text-ink-soft">
            Organisasi yang belum terverifikasi tidak tampil pada Direktori
            publik. Lengkapi datanya, lalu tunggu pemeriksaan dinas.
          </p>
        </Kartu>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <Kartu className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-base font-semibold">Organisasi Anda</h2>
            <Link
              href="/kelola/organisasi/baru"
              className="text-sm text-accent underline underline-offset-2"
            >
              Tambah
            </Link>
          </div>

          {organisasi.length === 0 ? (
            <p className="text-sm text-muted">
              Belum ada organisasi yang Anda kelola. Daftarkan lebih dulu agar
              dapat menerbitkan kabar dan agenda atas namanya.
            </p>
          ) : (
            <ul className="flex flex-col gap-3">
              {organisasi.map((o) => (
                <li key={o.id} className="flex flex-col gap-1.5">
                  <Link
                    href={`/kelola/organisasi/${o.id}`}
                    className="text-sm font-medium leading-snug hover:text-accent"
                  >
                    {o.nama}
                  </Link>
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${WARNA_VERIFIKASI[o.statusVerifikasi]}`}
                    >
                      {LABEL_VERIFIKASI[o.statusVerifikasi]}
                    </span>
                    <span className="text-xs text-muted">
                      {LABEL_ORGANISASI[o.jenis]} · {o.kecamatan.nama} ·{" "}
                      {o._count.keanggotaan} anggota
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}

          {anggotaMenunggu > 0 && (
            <p className="text-sm text-brass">
              {anggotaMenunggu} permintaan bergabung menunggu tanggapan Anda.
            </p>
          )}
        </Kartu>

        <Kartu className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-base font-semibold">Kabar terakhir</h2>
            <Link
              href="/kelola/kabar"
              className="text-sm text-accent underline underline-offset-2"
            >
              Semua ({jumlahKabar})
            </Link>
          </div>

          {isiTerbaru.length === 0 ? (
            <p className="text-sm text-muted">
              Belum ada kabar yang Anda tulis. Kabar yang terbit tampil di
              halaman publik DemakMuda.
            </p>
          ) : (
            <ul className="flex flex-col gap-2.5">
              {isiTerbaru.map((k) => (
                <li key={k.id}>
                  <Link
                    href={`/kelola/kabar/${k.id}`}
                    className="flex flex-col gap-0.5 rounded-sk hover:text-accent"
                  >
                    <span className="text-sm font-medium leading-snug">
                      {k.judul}
                    </span>
                    <span className="text-xs text-muted">
                      {k.status.toLowerCase()} · {tanggalPendek(k.dibuatPada)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}

          {kabarDraf > 0 && (
            <p className="text-sm text-brass">
              {kabarDraf} kabar masih berstatus draf dan belum terlihat publik.
            </p>
          )}
        </Kartu>
      </div>

      <Kartu className="flex flex-col gap-3">
        <h2 className="text-base font-semibold">Pintasan</h2>
        <div className="flex flex-wrap gap-2">
          {[
            { href: "/kelola/kabar/baru", label: "Tulis kabar" },
            { href: "/kelola/agenda/baru", label: "Buat agenda" },
            { href: "/kelola/peluang/baru", label: "Buka peluang" },
            { href: "/kelola/organisasi", label: "Kelola organisasi" },
            { href: "/keamanan", label: "Keamanan akun" },
          ].map((p) => (
            <Link
              key={p.href}
              href={p.href}
              className="sk-kartu sk-pressable rounded-sk px-4 py-2.5 text-sm font-medium text-ink-soft"
            >
              {p.label}
            </Link>
          ))}
        </div>
      </Kartu>
    </div>
  );
}
