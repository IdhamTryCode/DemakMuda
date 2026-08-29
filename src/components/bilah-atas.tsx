import Link from "next/link";

import { GantiTema } from "@/components/ganti-tema";
import { Lonceng } from "@/components/lonceng";
import { LogoDemak } from "@/components/logo-demak";
import { MenuAkun } from "@/components/menu-akun";
import { MENU_PUBLIK } from "@/lib/menu";
import { bacaPeran, LABEL_PERAN } from "@/lib/peran";
import { dapatkanSesi } from "@/lib/sesi";

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
 * Halaman yang sudah masuk menambahkan bilah keduanya sendiri di bawah ini.
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

export async function BilahAtas({ aktif }: { aktif?: string }) {
  const sesi = await dapatkanSesi();

  return (
    <header className="sk-bilah">
      <div className="mx-auto flex w-full max-w-[78rem] flex-wrap items-center gap-x-4 gap-y-1.5 px-6 py-1.5">
        <Link href="/" className="rounded-sk">
          <LogoDemak ukuran={26} ringkas />
        </Link>

        {/* flex-wrap wajib: enam menu tidak muat pada lebar ponsel, dan tanpa
            ini seluruh halaman meluber ke samping. whitespace-nowrap menjaga
            satu label tidak patah di tengah kata. */}
        <nav
          aria-label="Menu publik"
          className="order-3 -mx-6 flex w-[calc(100%+3rem)] gap-0.5 overflow-x-auto px-6 pb-1 sm:order-2 sm:mx-0 sm:w-auto sm:flex-1 sm:overflow-visible sm:px-0 sm:pb-0"
        >
          {MENU_PUBLIK.map((m) => {
            const ini = aktif === m.href;
            return (
              <Link
                key={m.href}
                href={m.href}
                aria-current={ini ? "page" : undefined}
                className={`whitespace-nowrap rounded-full px-2 py-1 text-xs transition-colors ${
                  ini
                    ? "bg-accent-soft font-medium text-accent"
                    : "text-muted hover:bg-accent-soft hover:text-accent"
                }`}
              >
                {m.label}
              </Link>
            );
          })}
        </nav>

        <div className="order-2 ml-auto flex items-center gap-1.5 sm:order-3">
          {sesi ? (
            <>
              <Lonceng />
              <GantiTema />
              <MenuAkun
                nama={sesi.user.name}
                peran={LABEL_PERAN[bacaPeran(sesi.user.role)]}
                butir={BUTIR_AKUN}
              />
            </>
          ) : (
            <>
              <GantiTema />
              <Link
                href="/masuk"
                className="sk-btn-utama sk-pressable px-4 py-1.5 text-sm"
              >
                Masuk
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
