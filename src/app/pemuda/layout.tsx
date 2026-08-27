import type { ReactNode } from "react";

import { BingkaiMasuk } from "@/components/bingkai-masuk";

/**
 * Area pemuda: Kartu Talenta, kegiatan, karya, dan aspirasi.
 *
 * Tata letak ini sengaja TIDAK menuntut peran pemuda, berbeda dari tata letak
 * area lain. Satu halaman di bawahnya — /pemuda/profil — memang terbuka bagi
 * peran mana pun, karena seorang pengelola organisasi bisa saja sekaligus
 * pemuda Demak dan berhak punya Kartu Talenta. Menguncinya di sini akan
 * mengusir mereka tanpa alasan.
 *
 * Halaman yang memang khusus pemuda tetap memanggil wajibPeran sendiri, dan
 * setiap Server Action mengulanginya lagi. Yang dijaga tata letak hanyalah
 * keharusan sudah masuk, dan itu dikerjakan BingkaiMasuk.
 */
export default function TataLetakPemuda({ children }: { children: ReactNode }) {
  return <BingkaiMasuk>{children}</BingkaiMasuk>;
}
