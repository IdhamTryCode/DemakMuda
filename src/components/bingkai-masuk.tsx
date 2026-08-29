import type { ReactNode } from "react";

import { BilahAtas } from "@/components/bilah-atas";
import { BilahPeran } from "@/components/bilah-peran";
import { MENU_PERAN } from "@/lib/menu";
import { wajibMasuk } from "@/lib/sesi";

/**
 * Kerangka untuk seluruh area yang sudah masuk.
 *
 * Dua baris bilah, bukan sidebar. Sidebar memberi hasil yang sama tetapi
 * membawa kesan perkakas internal, sedangkan aplikasi ini dipakai khalayak
 * umum. Dua baris bilah adalah pola yang sama yang dipakai apple.com — bilah
 * global tipis, ditambah bilah kedua yang isinya menyesuaikan halaman.
 *
 * BOBOTNYA TIDAK SAMA, DAN ITU YANG MENENTUKAN
 *
 * Mula-mula kedua barisnya sama besar dan sama-sama kaca, dan hasilnya terbaca
 * sebagai satu lempeng tebal — bukan sebagai dua alat yang berbeda. Yang
 * membuat pola ini bekerja di apple.com justru bedanya: baris pertama tipis dan
 * diam, baris kedua yang dipakai bekerja.
 *
 * Karena itu di sini baris pertama dibuat setipis mungkin dan warnanya
 * ditarik mundur, sementara baris kedua berlatar PADAT, bukan kaca. Satu kaca
 * dan satu padat membuat keduanya terlihat sebagai dua benda; dua-duanya kaca
 * membuat keduanya melebur.
 *
 * Keduanya dibungkus SATU wadah yang menempel, bukan dua wadah menempel yang
 * ditumpuk: menumpuk dua elemen sticky menuntut menghitung tinggi yang satu
 * untuk menggeser yang lain, dan angka itu selalu meleset begitu tinggi
 * bilahnya berubah.
 */
export async function BingkaiMasuk({ children }: { children: ReactNode }) {
  const sesi = await wajibMasuk();
  const menu = MENU_PERAN[sesi.peran];

  return (
    <>
      <div className="sticky top-0 z-40">
        <BilahAtas />

        {/* Latar PADAT, bukan .sk-bilah. Inilah bilah kerjanya, dan padatnya
            yang memisahkannya dari strip tipis di atasnya. */}
        <div className="border-b border-line bg-surface">
          <BilahPeran menu={menu} />
        </div>
      </div>

      <main className="mx-auto w-full max-w-[78rem] flex-1 px-6 py-8">
        {children}
      </main>
    </>
  );
}
