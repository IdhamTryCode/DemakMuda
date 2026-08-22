import Image from "next/image";
import Link from "next/link";

import lambang from "../../public/lambang-demak.png";
import { GantiTema } from "@/components/ganti-tema";
import { Kartu } from "@/components/sk";

export default function Beranda() {
  return (
    <>
      {/* Lambang tampil di hero, jadi header cukup memuat tombol tema. */}
      <header className="mx-auto flex w-full max-w-3xl items-center justify-end px-6 pt-6">
        <GantiTema />
      </header>

      <main className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-6 pb-16 pt-12 sm:pt-16">
        <div className="flex flex-col gap-4">
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
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
            DemakMuda
          </h1>
          <p className="max-w-prose text-lg text-ink-soft">
            Portal talenta dan peluang pemuda Kabupaten Demak. Satu tempat untuk
            mengikuti kabar dan agenda kegiatan, menemukan lomba, pelatihan,
            beasiswa, dan magang, serta membangun portofolio yang bisa dibuktikan.
          </p>
          <p className="text-sm italic text-muted">Nyawiji dadi soko.</p>
        </div>

        {/* Pernyataan tema. Aplikasinya sudah menjawab tema lewat fungsinya,
            tetapi fungsi tidak menjelaskan dirinya sendiri kepada pembaca yang
            baru pertama membuka — hubungannya perlu dinyatakan. */}
        <div className="sk-inset flex flex-col gap-2 p-5">
          <span className="text-xs font-semibold uppercase tracking-wider text-brass">
            Menyongsong bonus demografi menuju Generasi Emas 2045
          </span>
          <p className="max-w-prose text-sm leading-relaxed text-ink-soft">
            Bonus demografi adalah jendela, bukan hadiah: yang menentukan bukan
            berapa banyak pemuda Demak, melainkan apakah mereka terdata,
            tersalurkan, terbukti kemampuannya, dan terdengar suaranya. Empat
            hal itulah yang dikerjakan aplikasi ini.
          </p>
          <Link
            href="/latar"
            className="w-fit pt-0.5 text-sm text-accent underline underline-offset-2"
          >
            Latar dan tujuan selengkapnya →
          </Link>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            href="/daftar"
            className="sk-pressable sk-btn-utama rounded-sk px-5 py-2.5 text-sm"
          >
            Buat akun
          </Link>
          <Link
            href="/masuk"
            className="sk-pressable sk-raised rounded-sk px-5 py-2.5 text-sm font-medium text-ink-soft"
          >
            Masuk
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {[
            {
              href: "/kabar",
              judul: "Kabar Demak",
              teks: "Berita dan pengumuman resmi kepemudaan, bersumber dari dinas dan organisasi terverifikasi.",
            },
            {
              href: "/agenda",
              judul: "Agenda Demak",
              teks: "Kalender kegiatan se-kabupaten, dapat disaring menurut kecamatan dan waktu.",
            },
            {
              href: "/peluang",
              judul: "Papan Peluang",
              teks: "Lomba, pelatihan, beasiswa, magang, dan lowongan beserta tenggat pendaftarannya.",
            },
            {
              href: "/karya",
              judul: "Ruang Karya",
              teks: "Etalase karya pemuda Demak — produk, seni, tulisan, dan proyek — beserta cerita di baliknya.",
            },
            {
              href: "/direktori",
              judul: "Direktori Organisasi",
              teks: "Karang taruna, OKP, sanggar, dan komunitas di seluruh empat belas kecamatan.",
            },
          ].map((m) => (
            <Link key={m.href} href={m.href} className="block h-full rounded-sk">
              <Kartu className="sk-pressable flex h-full flex-col gap-2">
                <h2 className="text-base font-semibold">{m.judul}</h2>
                <p className="text-sm text-ink-soft">{m.teks}</p>
              </Kartu>
            </Link>
          ))}
        </div>

        <Kartu className="flex flex-col gap-2">
          <h2 className="text-base font-semibold">Punya sertifikat DemakMuda?</h2>
          <p className="text-sm text-ink-soft">
            Setiap sertifikat kegiatan punya kode unik yang dapat diperiksa
            keasliannya oleh siapa pun, tanpa perlu bertanya ke panitia.
          </p>
          <Link
            href="/cek"
            className="w-fit pt-1 text-sm text-accent underline underline-offset-2"
          >
            Periksa sertifikat →
          </Link>
        </Kartu>
      </main>
    </>
  );
}
