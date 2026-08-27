import { RangkaDaftar } from "@/components/rangka";

/**
 * Rangka tunggu Ruang Karya. Sama seperti kanal lain, keadaan memuat hanya
 * dipasang pada halaman daftar — bukan pada halaman rinci, yang masih harus
 * dapat membalas 404.
 */
export default function Memuat() {
  return (
    <div className="mx-auto w-full max-w-[78rem] flex-1 px-6 py-8">
      <RangkaDaftar judul="Ruang Karya" />
    </div>
  );
}
