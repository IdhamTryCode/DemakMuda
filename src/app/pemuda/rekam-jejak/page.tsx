import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import {
  FormPengalaman,
  FormPrestasi,
  TombolHapus,
} from "@/app/pemuda/rekam-jejak/form-rekam-jejak";
import { Kartu } from "@/components/sk";
import { prisma } from "@/lib/prisma";
import { LABEL_TINGKAT } from "@/lib/prestasi";
import { wajibMasuk } from "@/lib/sesi";
import {
  hapusPengalaman,
  hapusPrestasi,
  tambahPengalaman,
  tambahPrestasi,
} from "@/server/aksi-rekam-jejak";

export const metadata: Metadata = { title: "Rekam Jejak" };

/**
 * Halaman rekam jejak: pengalaman dan prestasi yang diisi sendiri.
 *
 * Sengaja terpisah dari halaman Kartu Talenta. Keduanya memang mengisi kartu
 * yang sama, tetapi bentuk pekerjaannya berbeda: yang satu satu formulir
 * sekali isi, yang ini daftar yang tumbuh sedikit demi sedikit. Menggabungkan
 * keduanya menghasilkan satu halaman panjang yang selalu terasa belum selesai.
 */
export default async function HalamanRekamJejak() {
  // Sengaja tidak wajibPeran("pemuda"): peran mana pun boleh punya Kartu
  // Talenta, jadi peran mana pun boleh mengisi rekam jejaknya.
  const sesi = await wajibMasuk();

  const profil = await prisma.profilPemuda.findUnique({
    where: { userId: sesi.user.id },
    select: {
      slug: true,
      pengalaman: {
        orderBy: [{ tahunMulai: "desc" }, { dibuatPada: "desc" }],
        select: {
          id: true,
          judul: true,
          peran: true,
          penyelenggara: true,
          tahunMulai: true,
          tahunSelesai: true,
          keterangan: true,
        },
      },
      prestasi: {
        orderBy: [{ tahun: "desc" }, { dibuatPada: "desc" }],
        select: {
          id: true,
          judul: true,
          tingkat: true,
          peringkat: true,
          penyelenggara: true,
          tahun: true,
          buktiUrl: true,
        },
      },
    },
  });

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-semibold tracking-tight">Rekam jejak</h1>
          <p className="max-w-prose text-sm text-ink-soft">
            Pengalaman dan prestasi yang Anda isi sendiri. Keduanya tampil di
            Kartu Talenta Anda, dan di sana disebut apa adanya sebagai isian
            sendiri — bukan sesuatu yang sudah disahkan dinas.
          </p>
        </div>
        <Link
          href="/pemuda/profil"
          className="sk-kartu sk-pressable rounded-sk px-4 py-2 text-sm font-medium text-ink-soft"
        >
          Kartu Talenta
        </Link>
      </div>

      {!profil ? (
        <Kartu className="flex flex-col gap-3">
          <p className="text-sm text-ink-soft">
            Rekam jejak menempel pada Kartu Talenta, dan Anda belum punya.
            Lengkapi dulu, lalu kembali ke sini.
          </p>
          <Link
            href="/pemuda/profil"
            className="sk-btn-utama sk-pressable w-fit rounded-sk px-4 py-2 text-sm"
          >
            Lengkapi Kartu Talenta
          </Link>
        </Kartu>
      ) : (
        <>
          <section className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <h2 className="text-lg font-semibold">Prestasi</h2>
              <p className="max-w-prose text-sm text-muted">
                Kejuaraan atau penghargaan yang pernah Anda raih. Lampirkan foto
                piagamnya — karena tidak ada yang memeriksa isian ini, buktinya
                yang membuat orang lain dapat menilainya sendiri.
              </p>
            </div>

            {profil.prestasi.length > 0 && (
              <ul className="flex flex-col gap-3">
                {profil.prestasi.map((p) => (
                  <li key={p.id}>
                    <Kartu className="flex flex-wrap items-center gap-4">
                      {p.buktiUrl && (
                        <Image
                          src={p.buktiUrl}
                          alt={`Bukti ${p.judul}`}
                          width={80}
                          height={60}
                          className="h-14 w-20 shrink-0 rounded-[6px] object-cover"
                        />
                      )}
                      <div className="flex min-w-0 flex-1 flex-col gap-1">
                        <h3 className="font-medium leading-snug">{p.judul}</h3>
                        <span className="text-xs text-muted">
                          {[
                            LABEL_TINGKAT[p.tingkat],
                            p.tahun,
                            p.penyelenggara,
                          ]
                            .filter(Boolean)
                            .join(" · ")}
                        </span>
                      </div>
                      {p.peringkat && (
                        <span className="rounded-full bg-brass-soft px-2.5 py-1 text-xs font-medium text-brass">
                          {p.peringkat}
                        </span>
                      )}
                      {!p.buktiUrl && (
                        <span className="rounded-full border border-line-strong px-2.5 py-0.5 text-xs text-muted">
                          Tanpa bukti
                        </span>
                      )}
                      <TombolHapus
                        id={p.id}
                        aksi={hapusPrestasi}
                        label={`Hapus prestasi ${p.judul}`}
                      />
                    </Kartu>
                  </li>
                ))}
              </ul>
            )}

            <Kartu>
              <FormPrestasi simpan={tambahPrestasi} />
            </Kartu>
          </section>

          <section className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <h2 className="text-lg font-semibold">Pengalaman</h2>
              <p className="max-w-prose text-sm text-muted">
                Kepanitiaan, kepengurusan, magang, atau kegiatan lain yang
                pernah Anda jalani. Ini konteks tentang diri Anda, bukan dasar
                penilaian — karena itu tidak perlu bukti.
              </p>
            </div>

            {profil.pengalaman.length > 0 && (
              <ul className="flex flex-col gap-3">
                {profil.pengalaman.map((p) => (
                  <li key={p.id}>
                    <Kartu className="flex flex-wrap items-center gap-4">
                      <div className="flex min-w-0 flex-1 flex-col gap-1">
                        <h3 className="font-medium leading-snug">{p.judul}</h3>
                        <span className="text-xs text-muted">
                          {[
                            p.peran,
                            p.penyelenggara,
                            p.tahunSelesai && p.tahunSelesai !== p.tahunMulai
                              ? `${p.tahunMulai}–${p.tahunSelesai}`
                              : p.tahunSelesai
                                ? String(p.tahunMulai)
                                : `${p.tahunMulai}–sekarang`,
                          ]
                            .filter(Boolean)
                            .join(" · ")}
                        </span>
                        {p.keterangan && (
                          <p className="text-sm text-ink-soft">{p.keterangan}</p>
                        )}
                      </div>
                      <TombolHapus
                        id={p.id}
                        aksi={hapusPengalaman}
                        label={`Hapus pengalaman ${p.judul}`}
                      />
                    </Kartu>
                  </li>
                ))}
              </ul>
            )}

            <Kartu>
              <FormPengalaman simpan={tambahPengalaman} />
            </Kartu>
          </section>

          <p className="text-sm text-muted">
            Lihat hasilnya di{" "}
            <Link
              href={`/p/${profil.slug}`}
              className="text-accent underline underline-offset-2"
            >
              Kartu Talenta publik Anda
            </Link>
            .
          </p>
        </>
      )}
    </div>
  );
}
