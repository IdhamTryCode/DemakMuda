import type { ReactNode } from "react";

import { BingkaiMasuk } from "@/components/bingkai-masuk";

/**
 * Halaman pemberitahuan.
 *
 * Terbuka bagi peran mana pun yang sudah masuk; BingkaiMasuk sendiri yang
 * menuntut sesi dan memilih isi bilah keduanya menurut peran.
 */
export default function TataLetakNotifikasi({ children }: { children: ReactNode }) {
  return <BingkaiMasuk>{children}</BingkaiMasuk>;
}
