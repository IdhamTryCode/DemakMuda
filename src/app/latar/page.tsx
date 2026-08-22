import type { Metadata } from "next";
import Link from "next/link";

import { BingkaiPublik } from "@/components/bingkai-publik";
import { Kartu } from "@/components/sk";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Latar",
  description:
    "Mengapa DemakMuda dibuat: menyongsong bonus demografi menuju Generasi Emas 2045, dari pendataan talenta sampai penyaluran peluang.",
};

/**
 * Halaman latar: menjawab tema lomba secara terbuka.
 *
 * Aplikasinya sendiri sudah menjawab tema lewat fungsinya, tetapi fungsi tidak
 * menjelaskan dirinya sendiri kepada pembaca yang baru pertama membuka. Halaman
 * ini yang menghubungkan keduanya — dan sengaja juga memuat bagian tentang apa
 * yang TIDAK diklaim aplikasi ini, karena janji yang kebesaran justru
 * memperlemah yang sudah benar-benar berjalan.
 */

const LANGKAH = [
  {
    urut: "01",
    judul: "Terdata",
    ringkas: "Pemuda mengisi Kartu Talenta; dinas melihat sebarannya.",
    isi: "Selama pemuda tidak terdata, perencanaan berjalan di atas perkiraan. Kartu Talenta memuat kecamatan, bidang minat, dan keterampilan — diisi sendiri oleh pemiliknya, bukan didata dari atas. Peta Potensi merangkumnya menjadi sebaran per kecamatan, per bidang minat, dan per keterampilan, lengkap dengan daftar kecamatan yang belum terjangkau sama sekali. Justru angka nol itu yang paling berguna bagi dinas.",
    tautan: { href: "/daftar", label: "Buat Kartu Talenta" },
  },
  {
    urut: "02",
    judul: "Tersalurkan",
    ringkas: "Peluang dikumpulkan di satu tempat, lengkap dengan tenggatnya.",
    isi: "Bonus demografi berubah menjadi beban bila usia produktif tidak menemukan jalan. Papan Peluang mengumpulkan lomba, pelatihan, beasiswa, magang, dan lowongan kerja pada satu halaman yang dapat dibuka siapa saja tanpa perlu masuk — disaring menurut jenis, bidang minat, dan rentang usia, dengan tenggat yang terlihat jelas. Informasi yang selama ini hanya beredar di grup tertentu menjadi terbuka bagi seluruh kecamatan.",
    tautan: { href: "/peluang", label: "Lihat Papan Peluang" },
  },
  {
    urut: "03",
    judul: "Terbukti",
    ringkas: "Setiap sertifikat punya kode yang dapat diperiksa siapa pun.",
    isi: "Keterampilan yang tidak dapat dibuktikan tidak menolong siapa pun saat melamar. Setiap kegiatan yang diikuti tercatat, dan sertifikatnya memakai kode unik yang dapat diperiksa keasliannya di halaman terbuka — tanpa perlu bertanya kepada panitia, dan tanpa perlu memindai berkas yang mudah dipalsukan.",
    tautan: { href: "/cek", label: "Periksa keaslian sertifikat" },
  },
  {
    urut: "04",
    judul: "Terdengar",
    ringkas: "Karya dipamerkan, usulan sampai ke dinas.",
    isi: "Generasi yang hanya menjadi objek program tidak akan menjadi generasi yang mengelola negaranya sendiri. Ruang Karya menjadi etalase karya pemuda beserta cerita di baliknya, dan Ruang Aspirasi menjadi jalur langsung menyampaikan usulan kepada dinas — dengan tanggapan yang dapat dibaca kembali oleh pengirimnya, bukan hilang begitu saja.",
    tautan: { href: "/karya", label: "Lihat Ruang Karya" },
  },
];

export default async function HalamanLatar() {
  // Angka diambil dari basis data, bukan ditulis tetap di halaman. Halaman
  // yang mengklaim cakupan wilayah sebaiknya membuktikannya sendiri.
  const [kecamatan, desa, peluangTerbuka] = await Promise.all([
    prisma.kecamatan.count(),
    prisma.desa.count(),
    prisma.peluang.count({
      where: {
        status: "TERBIT",
        OR: [{ tenggat: null }, { tenggat: { gte: new Date() } }],
      },
    }),
  ]);

  return (
    <BingkaiPublik>
      <div className="mx-auto flex max-w-3xl flex-col gap-10">
        <header className="flex flex-col gap-4">
          <span className="text-xs font-semibold uppercase tracking-widest text-brass">
            Latar dan tujuan
          </span>
          <h1 className="text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
            Menyongsong bonus demografi, menuju Generasi Emas 2045
          </h1>
          <p className="max-w-prose text-lg text-ink-soft">
            DemakMuda dibangun untuk satu pekerjaan yang sederhana tetapi belum
            tergarap: membuat pemuda Kabupaten Demak <em>terdata</em>,{" "}
            <em>tersalurkan</em>, <em>terbukti</em>, dan <em>terdengar</em> —
            selagi jendela bonus demografi masih terbuka.
          </p>
        </header>

        <section className="flex flex-col gap-4">
          <h2 className="text-xl font-semibold tracking-tight">
            Bonus demografi itu jendela, bukan hadiah
          </h2>
          <div className="flex max-w-prose flex-col gap-4 text-sm leading-relaxed text-ink-soft">
            <p>
              Bonus demografi adalah keadaan ketika penduduk usia produktif jauh
              lebih banyak daripada yang bergantung kepadanya. Indonesia sedang
              berada di dalamnya, dan jendela itu tidak terbuka selamanya —
              menutup dengan sendirinya ketika kelompok yang hari ini muda ikut
              menua.
            </p>
            <p>
              Yang menentukan bukan jumlahnya, melainkan apakah yang berjumlah
              banyak itu <strong className="text-ink">terampil dan terpakai</strong>.
              Usia produktif yang tidak terdata, tidak terlatih, dan tidak
              menemukan peluang bukan bonus — ia justru menjadi beban yang sama
              besarnya. Tahun 2045, seabad kemerdekaan, adalah saat hasil dari
              keputusan yang diambil hari ini akan terbaca.
            </p>
            <p>
              Di tingkat kabupaten, kendalanya jarang berupa niat. Yang lebih
              sering terjadi: dinas tidak tahu ada talenta apa di kecamatan mana,
              dan pemuda tidak tahu ada peluang apa yang sedang dibuka. Dua-duanya
              persoalan informasi. Persoalan informasi bisa diselesaikan dengan
              perangkat lunak.
            </p>
          </div>
        </section>

        <section className="flex flex-col gap-5">
          <h2 className="text-xl font-semibold tracking-tight">
            Empat langkah yang dikerjakan aplikasi ini
          </h2>

          <ol className="flex flex-col gap-4">
            {LANGKAH.map((l) => (
              <li key={l.urut}>
                <Kartu className="flex flex-col gap-3">
                  <div className="flex flex-wrap items-baseline gap-3">
                    <span className="font-mono text-sm font-semibold text-brass">
                      {l.urut}
                    </span>
                    <h3 className="text-lg font-semibold tracking-tight">
                      {l.judul}
                    </h3>
                    <span className="text-sm text-muted">{l.ringkas}</span>
                  </div>
                  <p className="max-w-prose text-sm leading-relaxed text-ink-soft">
                    {l.isi}
                  </p>
                  <Link
                    href={l.tautan.href}
                    className="w-fit text-sm text-accent underline underline-offset-2"
                  >
                    {l.tautan.label} →
                  </Link>
                </Kartu>
              </li>
            ))}
          </ol>
        </section>

        <section className="flex flex-col gap-4">
          <h2 className="text-xl font-semibold tracking-tight">
            Berpijak pada Demak, bukan pada kabupaten mana pun
          </h2>
          <div className="flex max-w-prose flex-col gap-4 text-sm leading-relaxed text-ink-soft">
            <p>
              Wilayahnya bukan contoh karangan. Seluruh{" "}
              <strong className="text-ink">{kecamatan} kecamatan</strong> dan{" "}
              <strong className="text-ink">{desa} desa dan kelurahan</strong> di
              Kabupaten Demak sudah tertanam dengan kode wilayah Kementerian
              Dalam Negeri, sehingga sebaran pada Peta Potensi menunjuk tempat
              yang sungguh ada dan dapat ditindaklanjuti sampai tingkat desa.
            </p>
            <p>
              Isi yang mengalir di dalamnya pun berpijak pada keseharian Demak —
              mangrove pesisir Sayung yang menahan abrasi, hasil tambak Wedung,
              batik bermotif akar bakau, jalur sepeda menyusuri tanggul Kota
              Wali, sampai mabar bulu tangkis selepas magrib di GOR. Saat ini{" "}
              <strong className="text-ink">{peluangTerbuka} peluang</strong>{" "}
              sedang terbuka di Papan Peluang.
            </p>
          </div>
        </section>

        <section className="flex flex-col gap-4">
          <h2 className="text-xl font-semibold tracking-tight">
            Yang tidak diklaim aplikasi ini
          </h2>
          <Kartu className="flex flex-col gap-3 border-l-4 border-l-brass">
            <p className="max-w-prose text-sm leading-relaxed text-ink-soft">
              DemakMuda bukan pengganti kebijakan dan tidak menciptakan lapangan
              kerja. Ia tidak memperbaiki mutu pelatihan, dan tidak akan berguna
              bila tidak ada yang mengisinya.
            </p>
            <p className="max-w-prose text-sm leading-relaxed text-ink-soft">
              Yang dikerjakannya satu hal saja, dan dikerjakan sampai tuntas:
              menghapus jarak informasi antara pemuda yang punya kemampuan dan
              dinas yang punya program. Menyebut lebih dari itu hanya akan
              melemahkan bagian yang memang sudah berjalan.
            </p>
          </Kartu>
        </section>

        <section className="sk-inset flex flex-col gap-3 p-6">
          <h2 className="text-base font-semibold">Mulai dari mana</h2>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/daftar"
              className="sk-btn-utama sk-pressable rounded-sk px-4 py-2.5 text-sm"
            >
              Buat akun
            </Link>
            <Link
              href="/peluang"
              className="sk-raised sk-pressable rounded-sk px-4 py-2.5 text-sm font-medium text-ink-soft"
            >
              Papan Peluang
            </Link>
            <Link
              href="/karya"
              className="sk-raised sk-pressable rounded-sk px-4 py-2.5 text-sm font-medium text-ink-soft"
            >
              Ruang Karya
            </Link>
          </div>
        </section>
      </div>
    </BingkaiPublik>
  );
}
