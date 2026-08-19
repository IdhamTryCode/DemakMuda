import { redirect } from "next/navigation";

import { dasborUntuk } from "@/lib/peran";
import { wajibMasuk } from "@/lib/sesi";

/**
 * Persimpangan setelah masuk: membaca peran dari sesi yang sudah divalidasi
 * ke basis data, lalu mengantar ke dasbor yang sesuai. Dipisahkan seperti ini
 * supaya halaman masuk tidak perlu tahu apa pun tentang peran.
 */
export default async function HalamanTujuan() {
  const sesi = await wajibMasuk();
  redirect(dasborUntuk(sesi.peran));
}
