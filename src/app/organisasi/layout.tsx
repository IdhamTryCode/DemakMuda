import type { ReactNode } from "react";

import { BingkaiMasuk } from "@/components/bingkai-masuk";
import { wajibPeran } from "@/lib/sesi";

/**
 * Area pengelola organisasi.
 *
 * Penjagaan peran diulang di tiap halaman lewat wajibPeran dan di tiap Server
 * Action lewat penjaga — tata letak ini kenyamanan navigasi, bukan penjaga
 * satu-satunya.
 */
export default async function TataLetakOrganisasi({
  children,
}: { children: ReactNode }) {
  await wajibPeran("organisasi");
  return <BingkaiMasuk>{children}</BingkaiMasuk>;
}
