import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import {
  FormPengalaman,
  FormPrestasi,
  TombolHapus,
} from "@/app/pemuda/rekam-jejak/form-rekam-jejak";
import { Kartu, Overline, PanelSunk, UbinMetrik } from "@/components/sk";
import { prisma } from "@/lib/prisma";
import { LABEL_TINGKAT } from "@/lib/prestasi";
import { wajibMasuk } from "@/lib/sesi";
import { tanggalPendek } from "@/lib/teks";
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
 *
 * Isian sendiri TIDAK pernah dinyatakan terverifikasi: tidak ada lencana
 * "Terverifikasi", "Menunggu verifikasi", "Divalidasi", atau tenggat
 * pemeriksaan. Sertifikat berkode — satu-satunya yang memang diperiksa lewat
 * kodenya — ditampilkan sebagai bagian tersendiri di bawah, jelas terpisah.
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

  // Sertifikat berkode: satu-satunya bagian di halaman ini yang memang dapat
  // diperiksa keasliannya. Karena itu ia dihitung dan ditampilkan terpisah.
  const [jumlahSertifikat, sertifikat] = await Promise.all([
    prisma.sertifikat.count({
      where: { penerimaId: sesi.user.id, dibatalkanPada: null },
    }),
    prisma.sertifikat.findMany({
      where: { penerimaId: sesi.user.id, dibatalkanPada: null },
      orderBy: { terbitPada: "desc" },
      take: 10,
      select: {
        kode: true,
        judul: true,
        peringkat: true,
        terbitPada: true,
        organisasi: { select: { nama: true } },
        penerbit: { select: { name: true } },
      },
    }),
  ]);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex min-w-0 flex-col gap-2">
          <Overline>Rekam jejak</Overline>
          <h1 className="text-2xl font-semibold tracking-tight">
            Rekam jejak &amp; prestasi
          </h1>
          <p className="max-w-prose text-sm text-ink-soft">
            Pengalaman dan prestasi yang Anda isi sendiri. Keduanya tampil di
            Kartu Talenta Anda, dan di sana disebut apa adanya sebagai isian
            sendiri — bukan sesuatu yang sudah disahkan dinas.
          </p>
        </div>
        {profil?.slug && (
          <Link
            href={`/p/${profil.slug}`}
            className="sk-kartu sk-pressable px-4 py-2 text-sm font-medium text-ink-soft"
          >
            Pratinjau di Kartu Talenta
          </Link>
        )}
      </div>

      {!profil ? (
        <Kartu className="flex flex-col gap-3">
          <p className="text-sm text-ink-soft">
            Rekam jejak menempel pada Kartu Talenta, dan Anda belum punya.
            Lengkapi dulu, lalu kembali ke sini.
          </p>
          <Link
            href="/pemuda/profil"
            className="sk-btn-utama sk-pressable w-fit px-4 py-2 text-sm"
          >
            Lengkapi Kartu Talenta
          </Link>
        </Kartu>
      ) : (
        <>
          <PanelSunk className="grid grid-cols-3 gap-x-4 gap-y-4 p-5">
            <UbinMetrik nilai={profil.prestasi.length} label="Prestasi" />
            <UbinMetrik nilai={profil.pengalaman.length} label="Pengalaman" />
            <UbinMetrik nilai={jumlahSertifikat} label="Sertifikat berkode" />
          </PanelSunk>

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
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="rounded-full bg-accent-soft px-2.5 py-0.5 text-xs font-medium text-accent">
                            Tingkat {LABEL_TINGKAT[p.tingkat]}
                          </span>
                          <span className="text-xs tabular-nums text-muted">
                            {p.tahun}
                          </span>
                        </div>
                        <h3 className="font-medium leading-snug">{p.judul}</h3>
                        {p.penyelenggara && (
                          <span className="text-xs text-muted">
                            Penyelenggara: {p.penyelenggara}
                          </span>
                        )}
                      </div>
                      {p.peringkat && (
                        <span className="rounded-full bg-brass-soft px-2.5 py-1 text-xs font-medium text-brass">
                          {p.peringkat}
                        </span>
                      )}
                      <span className="rounded-full border border-line-strong px-2.5 py-0.5 text-xs text-muted">
                        {p.buktiUrl ? "Bukti terlampir" : "Tanpa bukti"}
                      </span>
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

          {/* Bagian tersendiri: satu-satunya yang diperiksa lewat kodenya. */}
          <section className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <h2 className="text-lg font-semibold">Sertifikat berkode</h2>
              <p className="max-w-prose text-sm text-muted">
                Diterbitkan penyelenggara kegiatan di dalam aplikasi dan punya
                kode — keasliannya dapat diperiksa siapa pun lewat{" "}
                <Link
                  href="/cek"
                  className="text-accent underline underline-offset-2"
                >
                  periksa sertifikat
                </Link>
                . Berbeda dari prestasi di atas yang Anda isi sendiri.
              </p>
            </div>

            {sertifikat.length === 0 ? (
              <Kartu>
                <p className="text-sm text-muted">
                  Belum ada sertifikat berkode yang tercatat atas nama Anda.
                </p>
              </Kartu>
            ) : (
              <ul className="flex flex-col gap-3">
                {sertifikat.map((s) => (
                  <li key={s.kode}>
                    <Link href={`/cek/${s.kode}`} className="block rounded-sk">
                      <Kartu className="sk-pressable flex flex-wrap items-center gap-4">
                        <div className="flex min-w-0 flex-1 flex-col gap-1">
                          <h3 className="font-medium leading-snug">{s.judul}</h3>
                          <span className="text-xs text-muted">
                            {tanggalPendek(s.terbitPada)} ·{" "}
                            {s.organisasi?.nama ?? s.penerbit.name}
                          </span>
                        </div>
                        {s.peringkat && (
                          <span className="rounded-full bg-brass-soft px-2.5 py-1 text-xs font-medium text-brass">
                            {s.peringkat}
                          </span>
                        )}
                        <span className="font-mono text-xs text-muted">
                          {s.kode}
                        </span>
                      </Kartu>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}
    </div>
  );
}
