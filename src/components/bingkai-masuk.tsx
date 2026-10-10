import type { ReactNode } from "react";

import { BilahAtas } from "@/components/bilah-atas";
import { BilahPeran } from "@/components/bilah-peran";
import { DokBawah } from "@/components/dok-bawah";
import { SidebarAkun } from "@/components/sidebar-akun";
import { MENU_PERAN } from "@/lib/menu";
import { dasborUntuk } from "@/lib/peran";
import { wajibMasuk } from "@/lib/sesi";

/**
 * Kerangka untuk seluruh area yang sudah masuk.
 *
 * PONSEL (<1024 px): dua baris bilah, seperti semula. Bilah global tipis
 * ditambah bilah kedua berisi menu peran yang menggulir mendatar, lalu dok
 * navigasi di bawah. Tab yang langsung dapat disentuh lebih cepat daripada laci
 * yang harus dibuka dulu.
 *
 * DESKTOP (>=1024 px): sidebar kiri berlebar tetap dan lekat, menggantikan
 * bilah kedua. Menu peran yang sama pindah ke sana, dengan ikon dan butir aktif
 * berlatar aksen. Bilah atas menyusut menjadi strip tipis di sebelah kanan
 * sidebar: jejak lokasi di kiri, lonceng, ganti tema, dan menu akun di kanan.
 * Menu publik tidak ditampilkan di area masuk pada desktop.
 *
 * KEPUTUSAN INI DIBALIK, DAN KAPAN. Sebelumnya berkas ini menjelaskan panjang
 * lebar mengapa sidebar DITOLAK: ia dianggap membawa kesan perkakas internal
 * untuk aplikasi yang dipakai khalayak umum. Itu berubah pada 10 Oktober 2026
 * lewat ADENDUM-AREA-MASUK.md: begitu area masuk memuat cukup banyak menu
 * (rekam jejak, aspirasi, karya, pemberitahuan, keamanan), dua baris mendatar
 * berhenti cukup, dan sidebar menampungnya tanpa menggulir. Yang dipertahankan
 * dari keputusan lama: di ponsel tidak ada laci hamburger — dua bilah dan dok
 * bawah tetap seperti semula.
 *
 * Sesi dibaca SEKALI di sini, lalu diteruskan ke bilah atas dan dok, supaya
 * tidak ada halaman yang membaca sesi dua kali. Penjagaan tidak berpindah:
 * wajibMasuk() tetap dipanggil di sini, dan halaman tetap memanggil penjaganya
 * sendiri — menyembunyikan butir menu bukan penjagaan.
 */
export async function BingkaiMasuk({ children }: { children: ReactNode }) {
  const sesi = await wajibMasuk();
  const menu = MENU_PERAN[sesi.peran];

  return (
    <>
      <div className="lg:flex">
        <SidebarAkun menu={menu} />

        <div className="flex min-w-0 flex-1 flex-col">
          <div className="sticky top-0 z-40">
            <BilahAtas aktif={undefined} sesi={sesi} ragam="masuk" menu={menu} />

            {/* Bilah kerja kedua hanya untuk ponsel; di lg menu peran sudah
                pindah ke sidebar. */}
            <div className="border-b border-line bg-surface lg:hidden">
              <BilahPeran menu={menu} />
            </div>
          </div>

          <main className="mx-auto w-full max-w-[78rem] min-w-0 flex-1 px-6 pt-8 pb-[calc(5rem_+_env(safe-area-inset-bottom))] sm:pb-8">
            {children}
          </main>
        </div>
      </div>

      <DokBawah akunHref={dasborUntuk(sesi.peran)} />
    </>
  );
}
