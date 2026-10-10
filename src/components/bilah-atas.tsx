import Link from "next/link";

import { GugusKanan, type SesiRingkas } from "@/components/gugus-kanan";
import { JejakLokasi } from "@/components/jejak-lokasi";
import { LogoDemak } from "@/components/logo-demak";
import { PANDUAN_TAMPIL } from "@/lib/fitur";
import { MENU_PANDUAN, MENU_PUBLIK, type ButirMenu } from "@/lib/menu";

/**
 * Bilah atas, dipakai bersama halaman publik dan halaman yang sudah masuk.
 *
 * Sebelumnya keduanya punya bilahnya sendiri-sendiri, dan setelah bilah dasbor
 * ditipiskan keduanya jadi terlihat jelas berbeda: tinggi berbeda, ukuran
 * lambang berbeda, ukuran menu berbeda. Berpindah dari beranda ke dasbor
 * terasa seperti berpindah ke aplikasi lain.
 *
 * Sekarang satu bilah untuk keduanya. Yang berbeda hanya isi sisi kanannya,
 * dan itu memang harus berbeda: yang belum masuk melihat tombol Masuk, yang
 * sudah masuk melihat lonceng dan menu akunnya.
 *
 * Pada RAGAM "masuk" di layar lg ke atas, lambang dan menu publik disembunyikan
 * dan bilahnya menyusut jadi strip tipis di samping sidebar; jejak lokasi
 * menggantikan menu publik di sisi kiri. Di bawah lg ia tetap utuh.
 *
 * Sesi diterima lewat prop, bukan dibaca di sini: halamannya sudah membacanya.
 */
export function BilahAtas({
  aktif,
  sesi = null,
  ragam = "publik",
  menu = [],
}: {
  aktif?: string;
  sesi?: SesiRingkas;
  /** "masuk" menyusutkan bilah menjadi strip tipis di layar lg. */
  ragam?: "publik" | "masuk";
  /** Menu peran; hanya dipakai untuk jejak lokasi pada ragam "masuk". */
  menu?: ButirMenu[];
}) {
  const masuk = ragam === "masuk";

  return (
    <header className="sk-bilah">
      <div className="mx-auto flex w-full max-w-[78rem] flex-wrap items-center gap-x-4 gap-y-1.5 px-6 py-1.5">
        <Link href="/" className={`rounded-sk ${masuk ? "lg:hidden" : ""}`}>
          <LogoDemak ukuran={26} ringkas />
        </Link>

        {masuk && (
          <div className="hidden min-w-0 lg:block">
            <JejakLokasi menu={menu} />
          </div>
        )}

        {/* flex-wrap wajib: enam menu tidak muat pada lebar ponsel, dan tanpa
            ini seluruh halaman meluber ke samping. whitespace-nowrap menjaga
            satu label tidak patah di tengah kata. */}
        <nav
          aria-label="Menu publik"
          className={`order-3 -mx-6 flex w-[calc(100%+3rem)] gap-0.5 overflow-x-auto px-6 pb-1 sm:order-2 sm:mx-0 sm:w-auto sm:flex-1 sm:overflow-visible sm:px-0 sm:pb-0 ${
            masuk ? "lg:hidden" : ""
          }`}
        >
          {MENU_PUBLIK.filter(
            (m) => PANDUAN_TAMPIL || m.href !== MENU_PANDUAN,
          ).map((m) => {
            const ini = aktif === m.href;
            return (
              <Link
                key={m.href}
                href={m.href}
                aria-current={ini ? "page" : undefined}
                className={`whitespace-nowrap border-b-2 px-1.5 py-1 text-sm transition-colors ${
                  ini
                    ? "border-accent font-semibold text-accent"
                    : "border-transparent text-muted hover:border-line-strong hover:text-accent"
                }`}
              >
                {m.label}
              </Link>
            );
          })}
        </nav>

        <div className="order-2 ml-auto flex items-center gap-1.5 sm:order-3">
          <GugusKanan sesi={sesi} />
        </div>
      </div>
    </header>
  );
}
