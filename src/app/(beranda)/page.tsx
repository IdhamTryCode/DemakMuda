import type { Metadata } from "next";
import { headers } from "next/headers";
import Image from "next/image";
import Link from "next/link";
import QRCode from "qrcode";
import type { ReactNode } from "react";

import lambang from "../../../public/lambang-demak.png";
import { BingkaiPublik } from "@/components/bingkai-publik";
import {
  IkonAgenda,
  IkonKomunitas,
  IkonLokasi,
  IkonPanahKanan,
  IkonPeluang,
} from "@/components/ikon";
import { KartuTalenta } from "@/components/kartu-talenta";
import { Cip, Kartu, Overline, PanelSunk, UbinMetrik } from "@/components/sk";
import { agendaAkanDatang } from "@/lib/agenda";
import { PANDUAN_TAMPIL } from "@/lib/fitur";
import { MENU_PANDUAN } from "@/lib/menu";
import { LABEL_ORGANISASI } from "@/lib/organisasi";
import { LABEL_JENIS, peluangMasihTerbuka } from "@/lib/peluang";
import { dasborUntuk } from "@/lib/peran";
import { prisma } from "@/lib/prisma";
import { keterbukaanProfil, umur } from "@/lib/profil";
import { dapatkanSesi } from "@/lib/sesi";
import { cuplikan, sisaWaktu, tanggalPanjang, tanggalPendek, waktuSaja } from "@/lib/teks";

export const metadata: Metadata = {
  description:
    "Kegiatan, peluang, dan komunitas pemuda Kabupaten Demak dalam satu tempat — " +
    "tanpa perlu kenal orang dalam lebih dahulu.",
};

/**
 * Kartu pada bagian "Kalau ikut, kamu dapat apa".
 *
 * Ditulis sebagai data, bukan empat blok JSX yang hampir sama, karena satu di
 * antaranya tunduk pada saklar fitur. Sebagai blok berulang, mematikan Panduan
 * Karier akan menyisakan nomor urut yang melompat dari Dua ke Empat dan kisi
 * empat kolom yang salah satunya kosong. Sebagai data, keduanya menyesuaikan
 * diri sendiri.
 */
const URUTAN = ["Satu", "Dua", "Tiga", "Empat"];

const MANFAAT: {
  judul: string;
  isi: string;
  tautan?: { href: string; label: string };
}[] = [
  {
    judul: "Sertifikat berkode",
    isi:
      "Setiap sertifikat kegiatan punya kode unik. Siapa pun dapat memeriksa " +
      "keasliannya sendiri, tanpa perlu bertanya ke panitia.",
    tautan: { href: "/cek", label: "Periksa sertifikat →" },
  },
  {
    judul: "Kartu Talenta",
    isi:
      "Sertifikat, keanggotaan, minat, dan keterampilanmu terkumpul di satu " +
      "kartu beralamat tetap. Kodenya dapat dipindai dari layar orang lain " +
      "untuk diperiksa langsung dari sumbernya.",
  },
  ...(PANDUAN_TAMPIL
    ? [
        {
          judul: "Panduan Karier",
          isi:
            "Jawab sembilan pertanyaan, dan langkah berikutnya disusun dari " +
            "jawaban itu beserta isi kartumu sendiri — menyesuaikan waktu " +
            "luang, kendala, dan alat yang kamu punya.",
          tautan: { href: MENU_PANDUAN, label: "Buat panduan saya →" },
        },
      ]
    : []),
  {
    judul: "Suara yang ditanggapi",
    isi:
      "Usul dan keluhan soal kepemudaan dapat dikirim langsung ke Dinas " +
      "Kepemudaan dan Olahraga, dan statusnya terlacak sampai dijawab.",
  },
];

/** Inisial nama, dipakai kartu komunitas yang belum punya logo. */
function inisial(nama: string) {
  return nama
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((k) => k[0]?.toUpperCase() ?? "")
    .join("");
}

/**
 * Beranda sebagai bukti, bukan sebagai daftar pintu.
 *
 * Susunan sebelumnya menyodorkan lima kartu kanal — Kabar, Agenda, Peluang,
 * Karya, Direktori — dan empat di antaranya pintu untuk MEMBACA. Pengunjung
 * yang mendarat tiga puluh detik menyimpulkan aplikasi ini portal berita, dan
 * kesimpulan itu wajar: itulah yang halamannya perlihatkan.
 *
 * Yang ditawarkan aplikasi ini bukan bacaan, melainkan jalan masuk. Karena itu
 * beranda memimpin dengan ISINYA — agenda yang benar-benar akan berlangsung,
 * peluang yang tenggatnya benar-benar dekat, komunitas yang benar-benar bisa
 * didatangi — bukan dengan penjelasan tentang mesinnya.
 *
 * Angkanya dihitung dari basis data pada setiap permintaan. Angka yang ditulis
 * tangan akan basi tanpa ada yang tahu, dan beranda yang mengaku memuat
 * delapan belas agenda padahal tinggal dua lebih merugikan daripada tidak
 * menyebut angka sama sekali.
 */
export default async function Beranda() {
  const sekarang = new Date();
  const sesi = await dapatkanSesi();

  const [
    jumlahOrganisasi,
    jumlahAgenda,
    jumlahPeluang,
    jumlahKecamatan,
    agenda,
    peluang,
    kecamatan,
    komunitas,
    profilContoh,
  ] = await Promise.all([
    prisma.organisasi.count({ where: { statusVerifikasi: "TERVERIFIKASI" } }),
    prisma.agenda.count({ where: agendaAkanDatang(sekarang) }),
    prisma.peluang.count({
      where: {
        status: "TERBIT",
        // Aturannya dibaca dari src/lib/peluang.ts, sama dengan yang dipakai
        // Papan Peluang dan dasbor — sehingga angka di halaman mana pun tidak
        // mungkin lagi berbeda karena syaratnya ditulis ulang.
        ...peluangMasihTerbuka(sekarang),
      },
    }),
    prisma.kecamatan.count(),

    prisma.agenda.findMany({
      where: agendaAkanDatang(sekarang),
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
        deskripsi: true,
        logoUrl: true,
        kecamatan: { select: { nama: true } },
      },
    }),

    // Kartu Talenta peragaan untuk sisi kanan hero. Profilnya diambil dari
    // basis data, bukan dikarang: memakai nama dan keterampilan yang benar-
    // benar ada menghindari mengarang orang, dan sejak penyemaian gambar
    // contoh tidak dijalankan, fotonya kosong sehingga kartunya memakai
    // inisial, bukan wajah.
    prisma.profilPemuda.findUnique({
      where: { slug: "rani-puspitasari" },
      select: {
        slug: true,
        fotoUrl: true,
        statusVerifikasi: true,
        tanggalLahir: true,
        kecamatan: { select: { nama: true } },
        desa: { select: { nama: true } },
        minat: { select: { nama: true }, orderBy: { nama: "asc" } },
        keterampilan: { select: { nama: true }, orderBy: { nama: "asc" } },
        user: {
          select: {
            name: true,
            keanggotaan: {
              where: { status: "TERVERIFIKASI" },
              orderBy: [{ peran: "asc" }, { dibuatPada: "asc" }],
              take: 1,
              select: {
                peran: true,
                organisasi: { select: { nama: true } },
              },
            },
          },
        },
      },
    }),
  ]);

  const angka = [
    {
      nilai: jumlahOrganisasi,
      label: "Komunitas terverifikasi",
      ikon: <IkonKomunitas className="h-5 w-5" />,
    },
    {
      nilai: jumlahAgenda,
      label: "Agenda mendatang",
      ikon: <IkonAgenda className="h-5 w-5" />,
    },
    {
      nilai: jumlahPeluang,
      label: "Peluang masih dibuka",
      ikon: <IkonPeluang className="h-5 w-5" />,
    },
    {
      nilai: jumlahKecamatan,
      label: "Kecamatan terjangkau",
      ikon: <IkonLokasi className="h-5 w-5" />,
    },
  ];

  // Kode QR pada kartu peragaan menunjuk halaman kartunya sendiri, sama seperti
  // kartu sungguhan di /p/[slug].
  let qr: string | null = null;
  if (profilContoh) {
    const kepala = await headers();
    const inang = kepala.get("host") ?? "localhost:3000";
    const skema = inang.startsWith("localhost") ? "http" : "https";
    qr = await QRCode.toString(`${skema}://${inang}/p/${profilContoh.slug}`, {
      type: "svg",
      margin: 0,
      errorCorrectionLevel: "M",
      color: { dark: "#0b3f34", light: "#ffffff" },
    }).catch(() => null);
  }
  const bukaContoh = profilContoh
    ? keterbukaanProfil(profilContoh.tanggalLahir)
    : null;

  return (
    <BingkaiPublik>
      <div className="flex flex-col gap-12 pb-6">
        {/* Hero dua kolom. Sisi kanan bukan foto pemuda — tidak ada foto
            sungguhan yang boleh dipakai, dan foto karangan akan menyamar
            sebagai rekaman komunitas nyata. Sebagai gantinya, Kartu Talenta
            peragaan: bendanya sendiri, yang justru paling menjelaskan apa yang
            didapat orang kalau ikut. */}
        <section className="grid items-center gap-8 lg:grid-cols-12">
          <div className="flex flex-col gap-5 lg:col-span-7">
            <Image
              src={lambang}
              alt="Lambang Kabupaten Demak"
              width={76}
              height={76}
              priority
              className="h-auto"
              style={{ width: 76 }}
            />
            <Overline>Kabupaten Demak</Overline>
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

            {/* Berandanya sengaja TIDAK dialihkan ke dasbor bagi yang sudah
                masuk: halaman ini pernyataan maksud aplikasinya, dan isinya
                sama bergunanya entah sudah masuk atau belum. Yang berganti
                hanya ajakannya. */}
            <div className="flex flex-wrap gap-3">
              {sesi ? (
                <>
                  <Link
                    href={dasborUntuk(sesi.user.role)}
                    className="sk-btn-utama sk-pressable px-5 py-2.5 text-sm"
                  >
                    Ke dasbor saya
                  </Link>
                  <Link
                    href="/pemuda/profil"
                    className="sk-kartu sk-pressable px-5 py-2.5 text-sm font-medium text-ink-soft"
                  >
                    Kartu Talenta saya
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href="/daftar"
                    className="sk-btn-utama sk-pressable px-5 py-2.5 text-sm"
                  >
                    Buat akun
                  </Link>
                  <Link
                    href="/direktori"
                    className="sk-kartu sk-pressable px-5 py-2.5 text-sm font-medium text-ink-soft"
                  >
                    Jelajahi komunitas
                  </Link>
                </>
              )}
            </div>
          </div>

          {profilContoh && bukaContoh && (
            <div className="flex justify-center lg:col-span-5">
              <KartuTalenta
                nama={profilContoh.user.name}
                slug={profilContoh.slug}
                fotoUrl={bukaContoh.tampilkanFoto ? profilContoh.fotoUrl : null}
                kecamatan={profilContoh.kecamatan?.nama ?? null}
                desa={bukaContoh.tampilkanDesa ? (profilContoh.desa?.nama ?? null) : null}
                usia={
                  bukaContoh.tampilkanUsia && profilContoh.tanggalLahir
                    ? umur(profilContoh.tanggalLahir)
                    : null
                }
                minat={profilContoh.minat.map((m) => m.nama)}
                keterampilan={profilContoh.keterampilan.map((k) => k.nama)}
                organisasi={
                  profilContoh.user.keanggotaan[0]
                    ? {
                        nama: profilContoh.user.keanggotaan[0].organisasi.nama,
                        peran: profilContoh.user.keanggotaan[0].peran,
                      }
                    : null
                }
                terverifikasi={profilContoh.statusVerifikasi === "TERVERIFIKASI"}
                qr={qr}
              />
            </div>
          )}
        </section>

        {/* Empat angka, dihitung dari basis data. Angka nol tetap ditampilkan:
            ubin yang hilang saat nilainya nol membuat halaman terlihat rusak,
            dan "belum ada" adalah keterangan yang berguna. */}
        <PanelSunk className="grid grid-cols-2 gap-x-6 gap-y-6 p-5 sm:grid-cols-4">
          {angka.map((a) => (
            <UbinMetrik
              key={a.label}
              nilai={a.nilai}
              label={a.label}
              ikon={a.ikon}
            />
          ))}
        </PanelSunk>

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
              {/* Keempat belas kecamatan ditulis lengkap, bukan disembunyikan
                  di balik kotak pilihan. Di ponsel pita ini menggulir mendatar;
                  pada layar lebar ia membungkus. */}
              <ul className="-mx-6 flex gap-2 overflow-x-auto px-6 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
                {kecamatan.map((k) => (
                  <li key={k.id} className="shrink-0 sm:shrink">
                    <Cip href={`/direktori?kecamatan=${k.id}`}>{k.nama}</Cip>
                  </li>
                ))}
              </ul>

              {komunitas.length > 0 && (
                <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {komunitas.map((o) => (
                    <li key={o.id} className="h-full">
                      <Link
                        href={`/direktori/${o.slug}`}
                        className="block h-full rounded-sk"
                      >
                        <Kartu className="sk-pressable flex h-full flex-col gap-3">
                          <div className="flex items-center gap-3">
                            {o.logoUrl ? (
                              <span className="sk-redup relative h-11 w-11 shrink-0 overflow-hidden rounded-[8px]">
                                <Image
                                  src={o.logoUrl}
                                  alt=""
                                  fill
                                  sizes="2.75rem"
                                  className="object-cover"
                                />
                              </span>
                            ) : (
                              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[8px] bg-accent-soft font-semibold text-accent">
                                {inisial(o.nama)}
                              </span>
                            )}
                            <div className="flex min-w-0 flex-wrap items-center gap-2">
                              <span className="rounded-full bg-accent-soft px-2.5 py-1 text-xs font-medium text-accent">
                                {LABEL_ORGANISASI[o.jenis]}
                              </span>
                              <span className="inline-flex items-center gap-1 text-xs text-muted">
                                <IkonLokasi className="h-3.5 w-3.5" />
                                {o.kecamatan.nama}
                              </span>
                            </div>
                          </div>

                          <h3 className="font-semibold leading-snug">{o.nama}</h3>
                          {o.deskripsi && (
                            <p className="text-sm text-ink-soft">
                              {cuplikan(o.deskripsi, 120)}
                            </p>
                          )}
                          <span className="mt-auto inline-flex w-fit items-center gap-1 pt-1 text-sm text-accent">
                            Lihat rincian
                            <IkonPanahKanan className="h-4 w-4" />
                          </span>
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
          {/* Dua kolom pada layar sedang. Pada layar lebar, jumlah kolomnya
              mengikuti jumlah kartu — kisi empat kolom untuk tiga kartu akan
              menyisakan satu kolom menganggur di ujung kanan. */}
          <div
            className={`grid gap-4 sm:grid-cols-2 ${
              MANFAAT.length === 4 ? "xl:grid-cols-4" : "xl:grid-cols-3"
            }`}
          >
            {MANFAAT.map((m, i) => (
              <Kartu key={m.judul} className="flex flex-col gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-brass">
                  {URUTAN[i]}
                </span>
                <h3 className="text-base font-semibold">{m.judul}</h3>
                <p className="text-sm text-ink-soft">{m.isi}</p>
                {m.tautan && (
                  <Link
                    href={m.tautan.href}
                    className="w-fit pt-1 text-sm text-accent underline underline-offset-2"
                  >
                    {m.tautan.label}
                  </Link>
                )}
              </Kartu>
            ))}
          </div>
        </Bagian>

        {/* Kabar dan Karya di sini sengaja tetap berbentuk tautan kanal, bukan
            kartu bergambar: tidak satu pun berita maupun karya di basis data
            punya gambar, dan memasang gambar karangan akan berpura-pura menjadi
            rekaman kegiatan nyata. Bila kelak gambarnya ada, bagian ini yang
            pertama memakainya. */}
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
