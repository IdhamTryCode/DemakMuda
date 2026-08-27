import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

import lambang from "../../public/lambang-demak.png";
import { BingkaiPublik } from "@/components/bingkai-publik";
import { Kartu } from "@/components/sk";
import { LABEL_ORGANISASI } from "@/lib/organisasi";
import { LABEL_JENIS } from "@/lib/peluang";
import { prisma } from "@/lib/prisma";
import { sisaWaktu, tanggalPanjang, tanggalPendek, waktuSaja } from "@/lib/teks";

export const metadata: Metadata = {
  description:
    "Kegiatan, peluang, dan komunitas pemuda Kabupaten Demak dalam satu tempat — " +
    "tanpa perlu kenal orang dalam lebih dahulu.",
};

/**
 * Beranda sebagai bukti, bukan sebagai daftar pintu.
 *
 * Susunan sebelumnya menyodorkan lima kartu kanal — Kabar, Agenda, Peluang,
 * Karya, Direktori — dan empat di antaranya pintu untuk MEMBACA. Pengunjung
 * yang mendarat tiga puluh detik menyimpulkan aplikasi ini portal berita, dan
 * kesimpulan itu wajar: itulah yang halamannya perlihatkan.
 *
 * Yang ditawarkan aplikasi ini bukan bacaan, melainkan jalan masuk. Info
 * kegiatan pemuda Demak selama ini berserak di grup WhatsApp dan status
 * Instagram, dan yang tidak mengenal orang di dalamnya tidak kebagian. Karena
 * itu beranda kini memimpin dengan ISINYA — agenda yang benar-benar akan
 * berlangsung, peluang yang tenggatnya benar-benar dekat, komunitas yang
 * benar-benar bisa didatangi — bukan dengan penjelasan tentang mesinnya.
 *
 * Angkanya dihitung dari basis data pada setiap permintaan. Angka yang ditulis
 * tangan akan basi tanpa ada yang tahu, dan beranda yang mengaku memuat
 * delapan belas agenda padahal tinggal dua lebih merugikan daripada tidak
 * menyebut angka sama sekali.
 */
export default async function Beranda() {
  const sekarang = new Date();

  const [
    jumlahOrganisasi,
    jumlahAgenda,
    jumlahPeluang,
    jumlahKecamatan,
    agenda,
    peluang,
    kecamatan,
    komunitas,
  ] = await Promise.all([
    prisma.organisasi.count({ where: { statusVerifikasi: "TERVERIFIKASI" } }),
    prisma.agenda.count({ where: { status: "TERBIT", mulai: { gte: sekarang } } }),
    prisma.peluang.count({
      where: {
        status: "TERBIT",
        // Peluang tanpa tenggat selalu dianggap masih terbuka, sama seperti
        // aturan yang dipakai Papan Peluang. Dua halaman yang menghitung hal
        // sama dengan cara berbeda akan menampilkan angka yang berbeda pula.
        OR: [{ tenggat: null }, { tenggat: { gte: sekarang } }],
      },
    }),
    prisma.kecamatan.count(),

    prisma.agenda.findMany({
      where: { status: "TERBIT", mulai: { gte: sekarang } },
      orderBy: { mulai: "asc" },
      take: 3,
      select: {
        id: true,
        judul: true,
        slug: true,
        lokasi: true,
        mulai: true,
        selesai: true,
        kecamatan: { select: { nama: true } },
      },
    }),

    // Hanya yang bertenggat. Peluang tanpa tenggat tetap tampil di Papan
    // Peluang, tetapi yang dijanjikan bagian ini justru hitungan mundurnya —
    // menampilkan yang tidak punya tenggat mengingkari janji itu.
    prisma.peluang.findMany({
      where: { status: "TERBIT", tenggat: { gte: sekarang } },
      orderBy: { tenggat: "asc" },
      take: 3,
      select: { id: true, judul: true, slug: true, jenis: true, tenggat: true },
    }),

    prisma.kecamatan.findMany({
      orderBy: { nama: "asc" },
      select: { id: true, nama: true },
    }),

    prisma.organisasi.findMany({
      where: { statusVerifikasi: "TERVERIFIKASI" },
      orderBy: { nama: "asc" },
      take: 6,
      select: {
        id: true,
        nama: true,
        slug: true,
        jenis: true,
        kecamatan: { select: { nama: true } },
      },
    }),
  ]);

  const angka = [
    { nilai: jumlahOrganisasi, label: "Komunitas terverifikasi" },
    { nilai: jumlahAgenda, label: "Agenda mendatang" },
    { nilai: jumlahPeluang, label: "Peluang masih dibuka" },
    { nilai: jumlahKecamatan, label: "Kecamatan terjangkau" },
  ];

  return (
    <BingkaiPublik>
      <div className="flex flex-col gap-12 pb-6">
        <section className="flex flex-col gap-5">
          <div className="flex max-w-3xl flex-col gap-4">
            <Image
              src={lambang}
              alt="Lambang Kabupaten Demak"
              width={76}
              height={76}
              priority
              className="h-auto"
              style={{ width: 76 }}
            />
            <span className="text-xs font-semibold uppercase tracking-widest text-brass">
              Kabupaten Demak
            </span>
            <h1 className="text-4xl font-semibold leading-[1.1] tracking-tight sm:text-5xl">
              Kegiatan dan komunitas pemuda Demak,
              <br className="hidden sm:block" /> tanpa harus kenal orang dalam.
            </h1>
            <p className="max-w-prose text-lg leading-relaxed text-ink-soft">
              Selama ini info kegiatan berserak di grup WhatsApp dan status
              Instagram — yang tidak kenal orang di dalamnya tidak kebagian.
              DemakMuda mengumpulkannya jadi satu, dari dinas dan organisasi yang
              sudah diverifikasi. Dan ikut lewat sini meninggalkan bukti:
              sertifikat berkode yang dapat diperiksa siapa pun.
            </p>
            <p className="text-sm italic text-muted">Nyawiji dadi soko.</p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/daftar"
              className="sk-pressable sk-btn-utama rounded-sk px-5 py-2.5 text-sm"
            >
              Buat akun
            </Link>
            <Link
              href="/direktori"
              className="sk-pressable sk-kartu rounded-sk px-5 py-2.5 text-sm font-medium text-ink-soft"
            >
              Jelajahi komunitas
            </Link>
          </div>

          {/* Angka lebih dahulu, labelnya di bawah lewat order — mata menangkap
              bilangan sebelum ia sempat membaca keterangannya. */}
          <dl className="sk-redup grid grid-cols-2 gap-x-6 gap-y-5 p-5 sm:grid-cols-4">
            {angka.map((a) => (
              <div key={a.label} className="flex flex-col gap-0.5">
                <dt className="order-2 text-xs uppercase tracking-wider text-muted">
                  {a.label}
                </dt>
                <dd className="order-1 text-3xl font-semibold tabular-nums tracking-tight text-accent">
                  {a.nilai}
                </dd>
              </div>
            ))}
          </dl>
        </section>

        {agenda.length > 0 && (
          <Bagian
            judul="Yang paling dekat"
            keterangan="Kegiatan pemuda se-kabupaten yang akan berlangsung dalam waktu dekat."
            tautan={{ href: "/agenda", teks: "Lihat semua agenda" }}
          >
            <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {agenda.map((a) => (
                <li key={a.id}>
                  <Link href={`/agenda/${a.slug}`} className="block h-full rounded-sk">
                    <Kartu className="sk-pressable flex h-full flex-col gap-2">
                      <span className="text-xs uppercase tracking-wider text-brass">
                        {tanggalPanjang(a.mulai)} · {waktuSaja(a.mulai)}
                        {a.selesai ? `–${waktuSaja(a.selesai)}` : ""} WIB
                      </span>
                      <h3 className="text-lg font-semibold leading-snug">{a.judul}</h3>
                      {(a.lokasi || a.kecamatan) && (
                        <p className="text-sm text-ink-soft">
                          {[a.lokasi, a.kecamatan?.nama].filter(Boolean).join(" · ")}
                        </p>
                      )}
                    </Kartu>
                  </Link>
                </li>
              ))}
            </ul>
          </Bagian>
        )}

        {peluang.length > 0 && (
          <Bagian
            judul="Tenggatnya paling mepet"
            keterangan="Lomba, beasiswa, pelatihan, dan magang yang pendaftarannya segera ditutup."
            tautan={{ href: "/peluang", teks: "Lihat semua peluang" }}
          >
            <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {peluang.map((p) => (
                <li key={p.id}>
                  <Link href={`/peluang/${p.slug}`} className="block h-full rounded-sk">
                    <Kartu className="sk-pressable flex h-full flex-col gap-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-accent-soft px-2.5 py-1 text-xs font-medium text-accent">
                          {LABEL_JENIS[p.jenis]}
                        </span>
                        <span className="text-xs font-semibold uppercase tracking-wider text-brass">
                          {p.tenggat ? sisaWaktu(p.tenggat, sekarang) : ""}
                        </span>
                      </div>
                      <h3 className="text-lg font-semibold leading-snug">{p.judul}</h3>
                      {p.tenggat && (
                        <p className="text-sm text-muted">
                          Tutup {tanggalPendek(p.tenggat)}
                        </p>
                      )}
                    </Kartu>
                  </Link>
                </li>
              ))}
            </ul>
          </Bagian>
        )}

        {kecamatan.length > 0 && (
          <Bagian
            judul="Cari komunitas di kecamatanmu"
            keterangan="Klub olahraga, sanggar, karang taruna, dan komunitas — semuanya terbuka untuk didatangi, tanpa perlu diundang lebih dahulu."
            tautan={{ href: "/direktori", teks: "Lihat direktori lengkap" }}
          >
            <div className="flex flex-col gap-5">
              {/* Keempat belas kecamatan ditulis lengkap, bukan disembunyikan di
                  balik kotak pilihan. Melihat nama kecamatannya sendiri tertulis
                  adalah cara tercepat seseorang tahu aplikasi ini menjangkau
                  tempat tinggalnya. */}
              <ul className="flex flex-wrap gap-2">
                {kecamatan.map((k) => (
                  <li key={k.id}>
                    <Link
                      href={`/direktori?kecamatan=${k.id}`}
                      className="sk-kartu sk-pressable block rounded-full px-3.5 py-1.5 text-sm text-ink-soft"
                    >
                      {k.nama}
                    </Link>
                  </li>
                ))}
              </ul>

              {komunitas.length > 0 && (
                <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {komunitas.map((o) => (
                    <li key={o.id}>
                      <Link
                        href={`/direktori/${o.slug}`}
                        className="block h-full rounded-sk"
                      >
                        <Kartu className="sk-pressable flex h-full flex-col gap-1 p-4">
                          <h3 className="font-medium leading-snug">{o.nama}</h3>
                          <p className="text-xs text-muted">
                            {LABEL_ORGANISASI[o.jenis]} · {o.kecamatan.nama}
                          </p>
                        </Kartu>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </Bagian>
        )}

        <Bagian
          judul="Kalau ikut, kamu dapat apa"
          keterangan="Ini yang membedakannya dari grup pesan: keikutsertaan di sini tidak hilang begitu acaranya bubar."
        >
          <div className="grid gap-4 lg:grid-cols-3">
            <Kartu className="flex flex-col gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-brass">
                Satu
              </span>
              <h3 className="text-base font-semibold">Sertifikat berkode</h3>
              <p className="text-sm text-ink-soft">
                Setiap sertifikat kegiatan punya kode unik. Siapa pun dapat
                memeriksa keasliannya sendiri, tanpa perlu bertanya ke panitia.
              </p>
              <Link
                href="/cek"
                className="w-fit pt-1 text-sm text-accent underline underline-offset-2"
              >
                Periksa sertifikat →
              </Link>
            </Kartu>

            <Kartu className="flex flex-col gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-brass">
                Dua
              </span>
              <h3 className="text-base font-semibold">Kartu Talenta</h3>
              <p className="text-sm text-ink-soft">
                Sertifikat, keanggotaan, minat, dan keterampilanmu terkumpul di
                satu kartu beralamat tetap. Kodenya dapat dipindai dari layar
                orang lain untuk diperiksa langsung dari sumbernya.
              </p>
            </Kartu>

            <Kartu className="flex flex-col gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-brass">
                Tiga
              </span>
              <h3 className="text-base font-semibold">Suara yang ditanggapi</h3>
              <p className="text-sm text-ink-soft">
                Usul dan keluhan soal kepemudaan dapat dikirim langsung ke Dinas
                Kepemudaan dan Olahraga, dan statusnya terlacak sampai dijawab.
              </p>
            </Kartu>
          </div>
        </Bagian>

        <div className="grid gap-4 lg:grid-cols-3">
          <Link href="/kabar" className="block h-full rounded-sk">
            <Kartu className="sk-pressable flex h-full flex-col gap-1.5">
              <h2 className="text-base font-semibold">Kabar Demak</h2>
              <p className="text-sm text-ink-soft">
                Berita dan pengumuman resmi kepemudaan, bersumber dari dinas dan
                organisasi terverifikasi.
              </p>
            </Kartu>
          </Link>

          <Link href="/karya" className="block h-full rounded-sk">
            <Kartu className="sk-pressable flex h-full flex-col gap-1.5">
              <h2 className="text-base font-semibold">Ruang Karya</h2>
              <p className="text-sm text-ink-soft">
                Etalase karya pemuda Demak — produk, seni, tulisan, dan proyek —
                beserta cerita di baliknya.
              </p>
            </Kartu>
          </Link>

          {/* Pernyataan tema. Aplikasinya sudah menjawab tema lewat fungsinya,
              tetapi fungsi tidak menjelaskan dirinya sendiri kepada pembaca yang
              baru pertama membuka — hubungannya perlu dinyatakan. */}
          <div className="sk-redup flex flex-col gap-1.5 p-6">
            <span className="text-xs font-semibold uppercase tracking-wider text-brass">
              Menuju Generasi Emas 2045
            </span>
            <p className="text-sm leading-relaxed text-ink-soft">
              Bonus demografi adalah jendela, bukan hadiah. Yang menentukan bukan
              berapa banyak pemuda Demak, melainkan apakah mereka terdata,
              tersalurkan, terbukti kemampuannya, dan terdengar suaranya.
            </p>
            <Link
              href="/latar"
              className="w-fit pt-0.5 text-sm text-accent underline underline-offset-2"
            >
              Latar dan tujuan →
            </Link>
          </div>
        </div>
      </div>
    </BingkaiPublik>
  );
}

/** Kepala bagian beranda: judul, satu kalimat keterangan, dan tautan lanjutan. */
function Bagian({
  judul,
  keterangan,
  tautan,
  children,
}: {
  judul: string;
  keterangan: string;
  tautan?: { href: string; teks: string };
  children: ReactNode;
}) {
  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-1">
        <div className="flex min-w-0 flex-col gap-1">
          <h2 className="text-2xl font-semibold tracking-tight">{judul}</h2>
          <p className="max-w-prose text-sm text-ink-soft">{keterangan}</p>
        </div>
        {tautan && (
          <Link
            href={tautan.href}
            className="whitespace-nowrap text-sm text-accent underline underline-offset-2"
          >
            {tautan.teks} →
          </Link>
        )}
      </div>
      {children}
    </section>
  );
}
