import Link from "next/link";
import type { ReactNode } from "react";

import { BilahPeran } from "@/components/bilah-peran";
import { GantiTema } from "@/components/ganti-tema";
import { Lonceng } from "@/components/lonceng";
import { LogoDemak } from "@/components/logo-demak";
import { MenuAkun } from "@/components/menu-akun";
import { MENU_PERAN, MENU_PUBLIK } from "@/lib/menu";
import { LABEL_PERAN } from "@/lib/peran";
import { wajibMasuk } from "@/lib/sesi";

/**
 * Isi menu akun. Sama untuk semua peran.
 *
 * Kartu Talenta dan rekam jejak sengaja ikut dicantumkan meski sudah ada di
 * bilah peran pemuda: peran lain pun boleh punya kartu, dan bagi mereka menu
 * ini satu-satunya jalan ke sana.
 */
const BUTIR_AKUN = [
  {
    href: "/pemuda/profil",
    label: "Kartu Talenta saya",
    keterangan: "Ubah data diri, foto, minat, dan keterampilan",
  },
  {
    href: "/pemuda/rekam-jejak",
    label: "Rekam jejak",
    keterangan: "Prestasi dan pengalaman",
  },
  {
    href: "/keamanan",
    label: "Keamanan akun",
    keterangan: "Verifikasi dua langkah dan perangkat yang masuk",
  },
];

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
        <header className="sk-bilah">
          <div className="mx-auto flex w-full max-w-[78rem] flex-wrap items-center gap-x-4 gap-y-1.5 px-6 py-1.5">
            <Link href="/" className="rounded-sk">
              {/* Tanpa baris "Kabupaten Demak" di sini. Pada halaman yang sudah
                  masuk, asal aplikasinya sudah lama diketahui pemakainya, dan
                  barisnya hanya menambah tinggi bilah yang justru ingin
                  ditipiskan. */}
              <LogoDemak ukuran={26} ringkas />
            </Link>

            {/* Menu publik disembunyikan di layar sempit — bilah kedua yang
                lebih sering dipakai, dan dua baris menu yang menggulir
                sekaligus justru membingungkan. */}
            <nav aria-label="Menu publik" className="hidden items-center gap-0.5 lg:flex">
              {MENU_PUBLIK.map((m) => (
                <Link
                  key={m.href}
                  href={m.href}
                  className="whitespace-nowrap rounded-full px-2 py-1 text-xs text-muted transition-colors hover:bg-accent-soft hover:text-accent"
                >
                  {m.label}
                </Link>
              ))}
            </nav>

            <div className="ml-auto flex items-center gap-1.5">
              <Lonceng />
              <GantiTema />
              <MenuAkun
                nama={sesi.user.name}
                peran={LABEL_PERAN[sesi.peran]}
                butir={BUTIR_AKUN}
              />
            </div>
          </div>
        </header>

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
