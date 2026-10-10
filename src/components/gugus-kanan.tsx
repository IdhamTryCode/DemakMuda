import Link from "next/link";

import { GantiTema } from "@/components/ganti-tema";
import { Lonceng } from "@/components/lonceng";
import { MenuAkun } from "@/components/menu-akun";
import { prisma } from "@/lib/prisma";
import { LABEL_PERAN, bacaPeran, dasborUntuk } from "@/lib/peran";

/**
 * Gugus kanan bilah atas: lonceng, ganti tema, dan menu akun — atau, bagi
 * pengunjung yang belum masuk, ganti tema dan tombol Masuk.
 *
 * Dipakai ulang apa adanya oleh bilah atas dan oleh strip area masuk, supaya
 * tidak ada dua salinan yang menyimpang. Sesi diterima lewat prop, bukan dibaca
 * di sini: halamannya sudah membacanya, dan membacanya lagi berarti satu kueri
 * tambahan pada setiap halaman.
 */
export type SesiRingkas = {
  user: { id: string; name: string; role?: string | null };
} | null;

export const BUTIR_AKUN = [
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

export async function GugusKanan({ sesi }: { sesi: SesiRingkas }) {
  if (!sesi) {
    return (
      <>
        <GantiTema />
        <Link
          href="/masuk"
          className="sk-btn-utama sk-pressable px-4 py-1.5 text-sm"
        >
          Masuk
        </Link>
      </>
    );
  }

  // Fotonya diambil hanya bila memang ada yang sedang masuk. Satu pencarian
  // berindeks, dan hasilnya dipakai sebagai avatar.
  const profil = await prisma.profilPemuda.findUnique({
    where: { userId: sesi.user.id },
    select: { fotoUrl: true },
  });

  return (
    <>
      <Lonceng userId={sesi.user.id} />
      <GantiTema />
      <MenuAkun
        nama={sesi.user.name}
        peran={LABEL_PERAN[bacaPeran(sesi.user.role)]}
        fotoUrl={profil?.fotoUrl ?? null}
        butir={[
          // Dasbor selalu di urutan pertama. Setelah bilah publik dan bilah
          // dasbor disatukan, tombol "Dasbor" yang dahulu berdiri sendiri di
          // bilah publik ikut hilang — sehingga orang yang sudah masuk lalu
          // membuka halaman Kabar atau Agenda tidak punya jalan kembali ke
          // areanya sendiri.
          {
            href: dasborUntuk(sesi.user.role),
            label: "Dasbor saya",
            keterangan: "Ringkasan dan pintasan area Anda",
          },
          ...BUTIR_AKUN,
        ]}
      />
    </>
  );
}
