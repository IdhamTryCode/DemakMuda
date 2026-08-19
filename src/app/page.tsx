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

        <Kartu className="flex flex-col gap-4">
          <h2 className="text-lg font-semibold">Fondasi terpasang</h2>
          <p className="text-sm text-ink-soft">
            Autentikasi, peran, dan data wilayah sudah berjalan. Halaman kabar,
            agenda, dan peluang menyusul sesuai cetak biru teknis.
          </p>
          <div className="flex flex-wrap gap-3 pt-1">
            <Link
              href="/masuk"
              className="sk-pressable sk-btn-utama rounded-sk px-5 py-2.5 text-sm"
            >
              Masuk
            </Link>
            <Link
              href="/daftar"
              className="sk-pressable sk-raised rounded-sk px-5 py-2.5 text-sm font-medium text-ink-soft"
            >
              Buat akun
            </Link>
          </div>
        </Kartu>
      </main>
    </>
  );
}
