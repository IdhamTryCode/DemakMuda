import { BarisRangka, KartuRangka } from "@/components/rangka";

/**
 * Ditampilkan Next.js selagi data halaman dimuat. Tidak memakai bingkai publik
 * karena bingkai itu memuat sesi dari basis data — rangka tunggu harus tampil
 * seketika, tanpa menunggu apa pun.
 *
 * Bentuknya meniru tata letak baru: kepala dengan ubin angka di kanan, lalu
 * panel saringan kiri dan kisi kartu kanan pada layar lebar.
 */
export default function Memuat() {
  return (
    <div
      className="mx-auto w-full max-w-[78rem] flex-1 px-6 py-8"
      aria-busy="true"
    >
      <span className="sr-only" role="status">
        Memuat Direktori Organisasi…
      </span>

      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex flex-col gap-3">
            <h1 className="text-3xl font-semibold tracking-tight">
              Direktori Organisasi
            </h1>
            <BarisRangka lebar="min(30rem, 90%)" />
          </div>
          <span
            aria-hidden="true"
            className="sk-redup block h-24 w-full shrink-0 lg:w-72"
          />
        </div>

        <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
          <div className="sk-redup hidden w-72 shrink-0 flex-col gap-3 p-4 lg:flex">
            <BarisRangka lebar="6rem" />
            <BarisRangka lebar="100%" />
            <BarisRangka lebar="85%" />
            <BarisRangka lebar="95%" />
            <BarisRangka lebar="70%" />
          </div>

          <div className="grid min-w-0 flex-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }, (_, i) => (
              <KartuRangka key={i} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
