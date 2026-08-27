import type { ReactNode } from "react";

import { BingkaiMasuk } from "@/components/bingkai-masuk";
import { wajibPeran } from "@/lib/sesi";

/**
 * Area dinas. Superadmin ikut diberi akses karena berwenang atas seluruh isi.
 *
 * Penjagaan peran diulang di tiap halaman lewat wajibPeran dan di tiap Server
 * Action lewat penjaga — tata letak ini kenyamanan navigasi, bukan penjaga
 * satu-satunya.
 */
export default async function TataLetakDinas({
  children,
}: { children: ReactNode }) {
  await wajibPeran("dinas", "superadmin");
  return <BingkaiMasuk>{children}</BingkaiMasuk>;
}
