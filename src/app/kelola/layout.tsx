import { BingkaiMasuk } from "@/components/bingkai-masuk";
import { wajibPeran } from "@/lib/sesi";

/**
 * Area pengelolaan isi.
 *
 * Bilahnya sendiri sudah dibongkar: BingkaiMasuk yang menggambar keduanya, dan
 * isi bilah kedua menyesuaikan peran — pengelola organisasi melihat menu
 * miliknya, dinas melihat menu dinas. Sebelumnya menu di sini ditulis tetap,
 * sehingga peran yang berbeda melihat daftar yang sama.
 *
 * Penjagaan peran tetap diulang di tiap halaman dan tiap Server Action; tata
 * letak ini bukan penjaga satu-satunya.
 */
export default async function TataLetakKelola({
  children,
}: LayoutProps<"/kelola">) {
  await wajibPeran("organisasi", "dinas", "superadmin");
  return <BingkaiMasuk>{children}</BingkaiMasuk>;
}
