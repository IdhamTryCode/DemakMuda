import Image from "next/image";
import Link from "next/link";

import lambang from "../../public/lambang-demak.png";
import { BingkaiPublik } from "@/components/bingkai-publik";
import { Kartu } from "@/components/sk";

export default async function Beranda() {
  return (
    // Sebelumnya beranda memakai kerangkanya sendiri dan hanya memuat tombol
    // tema — pengunjung yang baru mendarat tidak melihat satu pun menu sampai
    // ia menggulir. Padahal seluruh halaman publik lain punya bilahnya.
    <BingkaiPublik>
      <div className="flex flex-col gap-8 pb-8">
        <div className="flex max-w-2xl flex-col gap-4">
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
        <div className="sk-redup flex max-w-2xl flex-col gap-2 p-5">
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
            className="sk-pressable sk-kartu rounded-sk px-5 py-2.5 text-sm font-medium text-ink-soft"
          >
            Masuk
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
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

        <Kartu className="flex max-w-2xl flex-col gap-2">
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
      </div>
    </BingkaiPublik>
  );
}
