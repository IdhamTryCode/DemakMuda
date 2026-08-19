import type { Metadata } from "next";
import Link from "next/link";

import { BingkaiPublik } from "@/components/bingkai-publik";
import { Kartu } from "@/components/sk";

export const metadata: Metadata = {
  title: "Perlindungan Data",
  description:
    "Data apa yang DemakMuda kumpulkan, untuk apa dipakai, siapa yang bisa melihatnya, dan hak Anda atasnya.",
};

/**
 * Halaman perlindungan data (cetak biru Bagian IV lapis 3).
 *
 * Ditulis untuk dibaca pelajar SMA, bukan disalin dari syarat dan ketentuan.
 * Aturannya sederhana: setiap baris di sini harus benar-benar cocok dengan
 * yang dikerjakan kode. Bila suatu saat perilakunya berubah, halaman ini ikut
 * berubah — halaman privasi yang tidak jujur lebih buruk daripada tidak ada.
 */

const DIKUMPULKAN = [
  {
    apa: "Nama dan alamat surel",
    kenapa: "Untuk membuat akun dan menghubungi Anda soal kegiatan yang diikuti.",
    siapa: "Panitia kegiatan yang Anda daftari, dan Dinas Kepemudaan dan Olahraga.",
  },
  {
    apa: "Tanggal lahir",
    kenapa:
      "Untuk memeriksa syarat usia kegiatan, dan menentukan pembatasan tambahan bila Anda di bawah 18 tahun.",
    siapa:
      "Tidak ditampilkan ke umum. Panitia kegiatan yang Anda daftari melihat usia Anda, bukan tanggal lengkapnya.",
  },
  {
    apa: "Nomor telepon",
    kenapa: "Agar panitia dapat menghubungi Anda soal kegiatan.",
    siapa:
      "Tidak pernah ditampilkan di halaman publik, berapa pun usia Anda. Hanya panitia kegiatan yang Anda daftari.",
  },
  {
    apa: "Kecamatan dan desa",
    kenapa:
      "Untuk menyaring peluang yang dekat dengan Anda, dan menyusun sebaran potensi pemuda per kecamatan bagi dinas.",
    siapa:
      "Kecamatan tampil di Kartu Talenta publik Anda. Desa disembunyikan bila Anda di bawah 18 tahun.",
  },
  {
    apa: "Bidang minat dan keterampilan",
    kenapa: "Untuk memunculkan peluang yang sesuai, dan menjadi isi Kartu Talenta Anda.",
    siapa: "Siapa pun yang membuka Kartu Talenta publik Anda.",
  },
  {
    apa: "Riwayat pendaftaran dan sertifikat",
    kenapa: "Agar prestasi Anda punya rekam jejak yang dapat dibuktikan.",
    siapa:
      "Sertifikat yang sah tampil di Kartu Talenta publik Anda dan dapat diperiksa keasliannya oleh siapa pun lewat kodenya.",
  },
];

const TIDAK_DILAKUKAN = [
  "Menjual atau menyewakan data Anda kepada pihak mana pun.",
  "Memasang pelacak iklan atau alat analitik pihak ketiga.",
  "Menampilkan nomor telepon Anda di halaman yang dapat dibuka umum.",
  "Meminta Nomor Induk Kependudukan pada tahap ini.",
];

export default function HalamanPrivasi() {
  return (
    <BingkaiPublik>
      <article className="mx-auto flex max-w-2xl flex-col gap-8">
        <header className="flex flex-col gap-3">
          <span className="text-xs font-semibold uppercase tracking-widest text-brass">
            Perlindungan data
          </span>
          <h1 className="text-3xl font-semibold leading-tight tracking-tight">
            Data Anda di DemakMuda
          </h1>
          <p className="text-base text-ink-soft">
            Halaman ini menjelaskan data apa yang kami simpan, untuk apa, dan
            siapa saja yang dapat melihatnya. Ditulis sependek dan sejelas
            mungkin — bukan sebagai syarat dan ketentuan yang tidak pernah
            dibaca siapa pun.
          </p>
        </header>

        <section className="flex flex-col gap-4">
          <h2 className="text-lg font-semibold">Yang kami simpan</h2>
          <ul className="flex flex-col gap-3">
            {DIKUMPULKAN.map((d) => (
              <li key={d.apa}>
                <Kartu className="flex flex-col gap-2">
                  <h3 className="text-base font-semibold">{d.apa}</h3>
                  <p className="text-sm text-ink-soft">
                    <span className="font-medium text-ink">Untuk apa: </span>
                    {d.kenapa}
                  </p>
                  <p className="text-sm text-ink-soft">
                    <span className="font-medium text-ink">Siapa yang melihat: </span>
                    {d.siapa}
                  </p>
                </Kartu>
              </li>
            ))}
          </ul>
          <p className="text-sm text-muted">
            Selain nama dan surel, seluruhnya bersifat pilihan. Anda tetap dapat
            membaca kabar, agenda, dan peluang tanpa mengisi apa pun.
          </p>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-lg font-semibold">Bila Anda di bawah 18 tahun</h2>
          <Kartu className="flex flex-col gap-2 border-l-4 border-l-brass">
            <p className="text-sm text-ink-soft">
              Menurut peraturan perlindungan data pribadi, pengguna di bawah 18
              tahun mendapat perlindungan tambahan. Di DemakMuda itu berarti:
              usia, desa, dan sekolah Anda <strong>tidak ditampilkan</strong> di
              Kartu Talenta publik. Yang tampil hanya nama, kecamatan, minat, dan
              keterampilan.
            </p>
            <p className="text-sm text-ink-soft">
              Bila tanggal lahir belum diisi, kami memperlakukan Anda sebagai
              pengguna di bawah umur — memilih yang lebih aman.
            </p>
          </Kartu>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-lg font-semibold">Yang tidak kami lakukan</h2>
          <ul className="flex flex-col gap-2">
            {TIDAK_DILAKUKAN.map((t) => (
              <li key={t} className="flex gap-2.5 text-sm text-ink-soft">
                <span aria-hidden="true" className="text-accent">
                  ✕
                </span>
                {t}
              </li>
            ))}
          </ul>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-lg font-semibold">Hak Anda</h2>
          <ul className="flex flex-col gap-2 text-sm text-ink-soft">
            <li>
              <strong className="text-ink">Melihat dan mengubah.</strong> Seluruh
              isi Kartu Talenta dapat Anda ubah kapan saja lewat halaman profil.
            </li>
            <li>
              <strong className="text-ink">Mengosongkan.</strong> Kolom pilihan
              dapat dikosongkan kembali, dan isinya hilang dari Kartu Talenta
              publik Anda.
            </li>
            <li>
              <strong className="text-ink">Keluar dari perangkat lain.</strong>{" "}
              Halaman keamanan menampilkan perangkat yang sedang masuk ke akun
              Anda, dan Anda dapat mengeluarkannya.
            </li>
            <li>
              <strong className="text-ink">Menghapus akun.</strong> Sampaikan
              kepada Dinas Kepemudaan dan Olahraga Kabupaten Demak. Sertifikat
              yang sudah terbit tetap dapat diperiksa keasliannya lewat kodenya,
              karena pihak lain mungkin sudah memegang salinannya.
            </li>
          </ul>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-lg font-semibold">Cara kami menjaganya</h2>
          <ul className="flex flex-col gap-2 text-sm text-ink-soft">
            <li>Kata sandi tidak pernah disimpan apa adanya.</li>
            <li>
              Akun dinas dan administrator diwajibkan memakai autentikasi dua
              langkah, karena merekalah yang dapat melihat data banyak orang.
            </li>
            <li>
              Setiap tindakan pengelola — verifikasi, penerbitan sertifikat,
              perubahan peran — tercatat pada jejak audit.
            </li>
            <li>
              Percobaan masuk dibatasi jumlahnya, sehingga kata sandi tidak dapat
              ditebak dengan mencoba berulang kali.
            </li>
          </ul>
        </section>

        <Kartu className="flex flex-col gap-2">
          <h2 className="text-base font-semibold">Ada pertanyaan?</h2>
          <p className="text-sm text-ink-soft">
            Hubungi Dinas Kepemudaan dan Olahraga Kabupaten Demak. Bila Anda
            menemukan celah keamanan, sampaikan langsung kepada mereka sebelum
            membagikannya ke umum.
          </p>
          <Link
            href="/daftar"
            className="w-fit pt-1 text-sm text-accent underline underline-offset-2"
          >
            Kembali membuat akun →
          </Link>
        </Kartu>
      </article>
    </BingkaiPublik>
  );
}
