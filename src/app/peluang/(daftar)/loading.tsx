import { RangkaDaftar } from "@/components/rangka";

/**
 * Ditampilkan Next.js selagi data halaman dimuat. Tidak memakai bingkai publik
 * karena bingkai itu memuat sesi dari basis data — rangka tunggu harus tampil
 * seketika, tanpa menunggu apa pun.
 */
export default function Memuat() {
  return (
    <div className="mx-auto w-full max-w-5xl flex-1 px-6 py-8">
      <RangkaDaftar judul="Papan Peluang" />
    </div>
  );
}
