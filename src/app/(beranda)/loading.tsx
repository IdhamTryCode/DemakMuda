import { BarisRangka, KartuRangka } from "@/components/rangka";

/**
 * Rangka tunggu beranda.
 *
 * Beranda menjalankan delapan kueri sekaligus dan merupakan halaman yang paling
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

      {/* Kepala halaman: lambang, label kecil, judul dua baris, lalu paragraf. */}
      <section className="flex max-w-3xl flex-col gap-4">
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
      </section>

      {/* Empat angka yang dihitung dari basis data. */}
      <section className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="sk-redup flex flex-col gap-2.5 p-4">
            <span
              aria-hidden="true"
              className="block h-8 w-16 animate-pulse rounded-[4px] bg-sunk"
            />
            <BarisRangka lebar="80%" />
          </div>
        ))}
      </section>

      {/* "Yang paling dekat": tiga agenda terdekat. */}
      <section className="flex flex-col gap-4">
        <BarisRangka lebar="14rem" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }, (_, i) => (
            <KartuRangka key={i} />
          ))}
        </div>
      </section>
    </div>
  );
}
