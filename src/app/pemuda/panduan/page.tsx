import type { Metadata } from "next";
import Link from "next/link";

import { FormPanduan } from "@/app/pemuda/panduan/form-panduan";
import { Kartu } from "@/components/sk";
import { prisma } from "@/lib/prisma";
import { wajibMasuk } from "@/lib/sesi";

export const metadata: Metadata = {
  title: "Panduan Karier",
  description:
    "Panduan langkah demi langkah yang disusun dari Kartu Talenta dan jawaban survei Anda.",
};

/** Riwayat cukup sepuluh terakhir; lebih dari itu tidak dibaca siapa pun. */
const BANYAK_RIWAYAT = 10;

export default async function HalamanPanduan() {
  const sesi = await wajibMasuk();

  const profil = await prisma.profilPemuda.findUnique({
    where: { userId: sesi.user.id },
    select: { id: true, slug: true },
  });

  const riwayat = profil
    ? await prisma.panduanKarier.findMany({
        where: { profilId: profil.id },
        orderBy: { dibuatPada: "desc" },
        take: BANYAK_RIWAYAT,
        select: { id: true, hasil: true, model: true, dibuatPada: true },
      })
    : [];

  const [terbaru, ...lama] = riwayat;

  return (
    <div className="flex flex-col gap-8">
      {/* Sengaja div, bukan <header>. Bilah atas sudah menjadi satu-satunya
          landmark banner di halaman ini; <header> kedua akan menggandakannya
          dan memecahkan catatan nol pelanggaran aksesibilitas. */}
      <div className="flex flex-col gap-3">
        <h1 className="text-3xl font-semibold tracking-tight">
          Panduan Karier
        </h1>
        <p className="max-w-prose text-sm leading-relaxed text-ink-soft">
          Jawab sembilan pertanyaan, dan panduan langkah demi langkah disusun
          untuk keadaanmu sendiri — bukan panduan umum. Data dari Kartu
          Talentamu ikut dipakai, jadi{" "}
          <strong className="font-semibold text-ink">
            makin lengkap kartumu, makin tepat panduannya
          </strong>
          .
        </p>
      </div>

      {!profil ? (
        <Kartu className="flex flex-col items-start gap-3 p-6">
          <h2 className="text-base font-semibold">
            Lengkapi Kartu Talenta lebih dahulu
          </h2>
          <p className="max-w-prose text-sm text-ink-soft">
            Panduan disusun dari bidang minat, keterampilan, dan rekam jejak
            yang tersimpan di sana. Tanpa itu, yang keluar hanya saran umum yang
            bisa didapat siapa saja.
          </p>
          <Link
            href="/pemuda/profil"
            className="sk-btn-utama sk-pressable rounded-sk px-4 py-2.5 text-sm"
          >
            Isi Kartu Talenta
          </Link>
        </Kartu>
      ) : (
        <>
          {terbaru && (
            <section className="flex flex-col gap-3">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h2 className="text-base font-semibold">Panduan terbaru</h2>
                <span className="font-mono text-xs text-muted">
                  {tanggal(terbaru.dibuatPada)}
                </span>
              </div>
              <Kartu className="p-6">
                {/* Tampilan seadanya. Merender Markdown menjadi kartu per
                      langkah adalah pekerjaan porsi 30% di lokasi penjurian —
                      lihat dokumen rencana 30%. Yang penting sekarang: isinya
                      tersimpan, terbaca, dan tidak pernah hilang. */}
                <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-ink-soft">
                  {terbaru.hasil}
                </pre>
              </Kartu>
            </section>
          )}

          {lama.length > 0 && (
            <section className="flex flex-col gap-3">
              <h2 className="text-base font-semibold">Panduan sebelumnya</h2>
              <p className="max-w-prose text-sm text-muted">
                Panduan lama tidak dihapus. Menyandingkannya dengan yang baru
                memperlihatkan perkembanganmu sendiri.
              </p>
              <div className="flex flex-col gap-2">
                {lama.map((p) => (
                  <details key={p.id} className="sk-kartu rounded-sk p-4">
                    <summary className="cursor-pointer font-mono text-xs text-muted">
                      {tanggal(p.dibuatPada)}
                    </summary>
                    <pre className="mt-3 whitespace-pre-wrap font-sans text-sm leading-relaxed text-ink-soft">
                      {p.hasil}
                    </pre>
                  </details>
                ))}
              </div>
            </section>
          )}

          <section className="flex flex-col gap-4">
            <h2 className="text-base font-semibold">
              {terbaru
                ? "Susun panduan baru"
                : "Mulai dari sembilan pertanyaan"}
            </h2>
            <Kartu className="p-6">
              <FormPanduan />
            </Kartu>
          </section>
        </>
      )}
    </div>
  );
}

/** Dihitung di peladen supaya tidak bergantung jam mesin pembaca. */
function tanggal(d: Date): string {
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "long",
    timeStyle: "short",
    timeZone: "Asia/Jakarta",
  }).format(d);
}
