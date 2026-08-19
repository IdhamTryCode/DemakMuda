import Link from "next/link";

import { GantiTema } from "@/components/ganti-tema";
import { Angka, GrafikBatang } from "@/components/grafik-batang";
import { LogoDemak } from "@/components/logo-demak";
import { Kartu } from "@/components/sk";
import { TombolKeluar } from "@/components/tombol-keluar";
import { LABEL_PERAN } from "@/lib/peran";
import { prisma } from "@/lib/prisma";
import { wajibPeran } from "@/lib/sesi";

export const metadata = { title: "Peta Potensi Pemuda" };

const LABEL_STATUS: Record<string, string> = {
  MENUNGGU: "Menunggu",
  DITERIMA: "Diterima",
  DITOLAK: "Ditolak",
  HADIR: "Hadir",
};

export default async function DasborDinas() {
  const sesi = await wajibPeran("dinas", "superadmin");
  const sekarang = new Date();

  const [
    jumlahPemuda,
    jumlahProfil,
    kecamatan,
    sebaranProfil,
    minat,
    keterampilan,
    organisasiTerverifikasi,
    organisasiMenunggu,
    agendaMendatang,
    peluangTerbuka,
    sebaranPendaftaran,
    jumlahSertifikat,
  ] = await Promise.all([
    prisma.user.count({ where: { role: "pemuda" } }),
    prisma.profilPemuda.count(),
    prisma.kecamatan.findMany({ orderBy: { nama: "asc" }, select: { id: true, nama: true } }),
    prisma.profilPemuda.groupBy({
      by: ["kecamatanId"],
      _count: { _all: true },
    }),
    prisma.minat.findMany({
      select: { nama: true, _count: { select: { profil: true } } },
    }),
    prisma.keterampilan.findMany({
      select: { nama: true, _count: { select: { profil: true } } },
    }),
    prisma.organisasi.count({ where: { statusVerifikasi: "TERVERIFIKASI" } }),
    prisma.organisasi.count({ where: { statusVerifikasi: "MENUNGGU" } }),
    prisma.agenda.count({ where: { status: "TERBIT", mulai: { gte: sekarang } } }),
    prisma.peluang.count({
      where: {
        status: "TERBIT",
        OR: [{ tenggat: null }, { tenggat: { gte: sekarang } }],
      },
    }),
    prisma.pendaftaran.groupBy({ by: ["status"], _count: { _all: true } }),
    prisma.sertifikat.count({ where: { dibatalkanPada: null } }),
  ]);

  // Seluruh kecamatan ditampilkan, termasuk yang nol — justru yang nol itulah
  // informasi paling berguna bagi dinas, karena menunjukkan wilayah yang belum
  // terjangkau sama sekali.
  const hitunganPerKecamatan = new Map(
    sebaranProfil.map((s) => [s.kecamatanId, s._count._all]),
  );
  const sebaranKecamatan = kecamatan
    .map((k) => ({ label: k.nama, nilai: hitunganPerKecamatan.get(k.id) ?? 0 }))
    .sort((a, b) => b.nilai - a.nilai || a.label.localeCompare(b.label));

  const kecamatanKosong = sebaranKecamatan.filter((k) => k.nilai === 0);

  const minatTeratas = minat
    .map((m) => ({ label: m.nama, nilai: m._count.profil }))
    .filter((m) => m.nilai > 0)
    .sort((a, b) => b.nilai - a.nilai)
    .slice(0, 8);

  const keterampilanTeratas = keterampilan
    .map((k) => ({ label: k.nama, nilai: k._count.profil }))
    .filter((k) => k.nilai > 0)
    .sort((a, b) => b.nilai - a.nilai)
    .slice(0, 8);

  const pendaftaran = sebaranPendaftaran
    .map((p) => ({ label: LABEL_STATUS[p.status] ?? p.status, nilai: p._count._all }))
    .sort((a, b) => b.nilai - a.nilai);

  const totalPendaftaran = pendaftaran.reduce((n, p) => n + p.nilai, 0);
  const jangkauan = kecamatan.length - kecamatanKosong.length;

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-6 py-8">
      <nav className="flex items-center justify-between gap-4">
        <LogoDemak ukuran={36} />
        <div className="flex items-center gap-3">
          <GantiTema />
          <Link
            href="/kelola/kabar"
            className="sk-raised sk-pressable rounded-sk px-4 py-2.5 text-sm font-medium text-ink-soft"
          >
            Kelola isi
          </Link>
          <TombolKeluar />
        </div>
      </nav>

      <header className="flex flex-col gap-1">
        <span className="text-xs font-semibold uppercase tracking-wider text-brass">
          {LABEL_PERAN[sesi.peran]}
        </span>
        <h1 className="text-2xl font-semibold tracking-tight">Peta Potensi Pemuda</h1>
        <p className="max-w-prose text-sm text-ink-soft">
          Ringkasan keadaan kepemudaan Kabupaten Demak berdasarkan data yang
          terkumpul di DemakMuda, disusun untuk menjadi bahan pertimbangan
          penyusunan program.
        </p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Angka
          label="Pemuda terdaftar"
          nilai={jumlahPemuda}
          keterangan={`${jumlahProfil} sudah mengisi Kartu Talenta`}
        />
        <Angka
          label="Jangkauan kecamatan"
          nilai={`${jangkauan}/${kecamatan.length}`}
          keterangan={
            kecamatanKosong.length === 0
              ? "Seluruh kecamatan terjangkau"
              : `${kecamatanKosong.length} kecamatan belum terjangkau`
          }
        />
        <Angka
          label="Organisasi terverifikasi"
          nilai={organisasiTerverifikasi}
          keterangan={
            organisasiMenunggu > 0
              ? `${organisasiMenunggu} menunggu verifikasi Anda`
              : "Tidak ada yang menunggu verifikasi"
          }
        />
        <Angka
          label="Sertifikat diterbitkan"
          nilai={jumlahSertifikat}
          keterangan={`dari ${totalPendaftaran} pendaftaran kegiatan`}
        />
      </section>

      {kecamatanKosong.length > 0 && (
        <Kartu className="flex flex-col gap-2 border-l-4 border-l-brass">
          <h2 className="text-base font-semibold">
            Kecamatan yang belum terjangkau
          </h2>
          <p className="max-w-prose text-sm text-ink-soft">
            Belum ada satu pun pemuda dari {kecamatanKosong.length} kecamatan
            berikut yang mengisi Kartu Talenta. Wilayah inilah yang paling
            membutuhkan sosialisasi, bukan yang angkanya sudah tinggi.
          </p>
          <div className="flex flex-wrap gap-2 pt-1">
            {kecamatanKosong.map((k) => (
              <span
                key={k.label}
                className="rounded-full border border-line-strong px-3 py-1 text-sm text-ink-soft"
              >
                {k.label}
              </span>
            ))}
          </div>
        </Kartu>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <Kartu className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <h2 className="text-base font-semibold">Sebaran pemuda per kecamatan</h2>
            <p className="text-xs text-muted">
              Jumlah pemuda yang sudah mengisi Kartu Talenta.
            </p>
          </div>
          <GrafikBatang data={sebaranKecamatan} satuan="pemuda" />
        </Kartu>

        <div className="flex flex-col gap-4">
          <Kartu className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <h2 className="text-base font-semibold">Bidang minat terbanyak</h2>
              <p className="text-xs text-muted">
                Menentukan pelatihan apa yang paling dibutuhkan.
              </p>
            </div>
            <GrafikBatang
              data={minatTeratas}
              satuan="pemuda"
              kosong="Belum ada pemuda yang memilih bidang minat."
            />
          </Kartu>

          <Kartu className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <h2 className="text-base font-semibold">Keterampilan terbanyak</h2>
              <p className="text-xs text-muted">
                Bekal yang sudah dimiliki pemuda Demak.
              </p>
            </div>
            <GrafikBatang
              data={keterampilanTeratas}
              satuan="pemuda"
              kosong="Belum ada keterampilan yang tercatat."
            />
          </Kartu>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Kartu className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <h2 className="text-base font-semibold">Keikutsertaan kegiatan</h2>
            <p className="text-xs text-muted">
              Status seluruh pendaftaran yang masuk.
            </p>
          </div>
          <GrafikBatang
            data={pendaftaran}
            satuan="pendaftaran"
            kosong="Belum ada pendaftaran kegiatan."
          />
        </Kartu>

        <Kartu className="flex flex-col gap-3">
          <h2 className="text-base font-semibold">Yang sedang berjalan</h2>
          <dl className="flex flex-col gap-3">
            <div className="flex items-baseline justify-between gap-4">
              <dt className="text-sm text-ink-soft">Agenda mendatang</dt>
              <dd className="text-lg font-semibold tabular-nums">{agendaMendatang}</dd>
            </div>
            <div className="flex items-baseline justify-between gap-4">
              <dt className="text-sm text-ink-soft">Peluang masih dibuka</dt>
              <dd className="text-lg font-semibold tabular-nums">{peluangTerbuka}</dd>
            </div>
          </dl>
          <div className="flex flex-wrap gap-2 pt-1">
            <Link
              href="/kelola/organisasi"
              className="sk-raised sk-pressable rounded-sk px-4 py-2.5 text-sm font-medium text-ink-soft"
            >
              Verifikasi organisasi
            </Link>
            <Link
              href="/kelola/agenda"
              className="sk-raised sk-pressable rounded-sk px-4 py-2.5 text-sm font-medium text-ink-soft"
            >
              Kelola agenda
            </Link>
          </div>
        </Kartu>
      </div>
    </main>
  );
}
