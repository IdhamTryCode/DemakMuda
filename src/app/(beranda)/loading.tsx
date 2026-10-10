import { BarisRangka, KartuRangka } from "@/components/rangka";

/**
 * Rangka tunggu beranda.
 *
 * Beranda menjalankan banyak kueri sekaligus dan merupakan halaman yang paling
 * sering dibuka pertama kali — tetapi justru satu-satunya halaman ramai yang
 * belum punya rangka tunggu. Akibatnya pembaca melihat layar kosong selama
 * kueri berjalan, dan seorang penguji melaporkannya apa adanya: "agak lemot".
 * Halamannya tidak lambat; ia hanya tidak mengatakan apa pun selagi bekerja.
 *
 * Sengaja TIDAK memakai BingkaiPublik. Bingkai itu memuat sesi dan foto profil
 * dari basis data, sehingga rangka tunggunya sendiri akan ikut menunggu — persis
 * hal yang hendak dihindari. Lebar dan jarak dalamnya disamakan dengan bingkai
 * itu supaya tidak ada pergeseran tata letak saat isinya menggantikannya.
 */
export default function Memuat() {
  return (
    <div
      className="mx-auto flex w-full max-w-[78rem] flex-1 flex-col gap-12 px-6 py-8"
      aria-busy="true"
    >
      <span className="sr-only" role="status">
        Memuat beranda DemakMuda…
      </span>

      {/* Hero dua kolom: kiri teks, kanan Kartu Talenta peragaan. */}
      <section className="grid items-center gap-8 lg:grid-cols-12">
        <div className="flex flex-col gap-5 lg:col-span-7">
          <span
            aria-hidden="true"
            className="block h-[76px] w-[76px] animate-pulse rounded-[6px] bg-sunk"
          />
          <BarisRangka lebar="9rem" />
          <div className="flex flex-col gap-3">
            <span
              aria-hidden="true"
              className="block h-9 animate-pulse rounded-[4px] bg-sunk sm:h-11"
              style={{ width: "min(38rem, 95%)" }}
            />
            <span
              aria-hidden="true"
              className="block h-9 animate-pulse rounded-[4px] bg-sunk sm:h-11"
              style={{ width: "min(30rem, 80%)" }}
            />
          </div>
          <div className="flex flex-col gap-2">
            <BarisRangka lebar="min(42rem, 100%)" />
            <BarisRangka lebar="min(40rem, 96%)" />
            <BarisRangka lebar="min(36rem, 88%)" />
          </div>
        </div>

        <div className="lg:col-span-5">
          <span
            aria-hidden="true"
            className="block h-[23rem] w-full max-w-2xl animate-pulse rounded-[18px] bg-sunk"
          />
        </div>
      </section>

      {/* Empat angka yang dihitung dari basis data, di dalam satu panel sunk. */}
      <div className="sk-redup grid grid-cols-2 gap-x-6 gap-y-6 p-5 sm:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="flex flex-col gap-2.5">
            <span
              aria-hidden="true"
              className="block h-5 w-5 animate-pulse rounded-[4px] bg-sunk"
            />
            <span
              aria-hidden="true"
              className="block h-8 w-16 animate-pulse rounded-[4px] bg-sunk"
            />
            <BarisRangka lebar="80%" />
          </div>
        ))}
      </div>

      {/* "Yang paling dekat": tiga agenda terdekat. */}
      <section className="flex flex-col gap-4">
        <BarisRangka lebar="14rem" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }, (_, i) => (
            <KartuRangka key={i} />
          ))}
        </div>
      </section>

      {/* "Cari komunitas di kecamatanmu": pita cip lalu kisi kartu. */}
      <section className="flex flex-col gap-4">
        <BarisRangka lebar="16rem" />
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 8 }, (_, i) => (
            <span
              key={i}
              aria-hidden="true"
              className="block h-10 w-24 animate-pulse rounded-full bg-sunk"
            />
          ))}
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }, (_, i) => (
            <KartuRangka key={i} />
          ))}
        </div>
      </section>
    </div>
  );
}
