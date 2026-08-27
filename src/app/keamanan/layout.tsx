import type { ReactNode } from "react";

import { BingkaiMasuk } from "@/components/bingkai-masuk";

/**
 * Halaman keamanan akun.
 *
 * Terbuka bagi peran mana pun yang sudah masuk; BingkaiMasuk sendiri yang
 * menuntut sesi dan memilih isi bilah keduanya menurut peran.
 */
export default function TataLetakKeamanan({ children }: { children: ReactNode }) {
  return <BingkaiMasuk>{children}</BingkaiMasuk>;
}
