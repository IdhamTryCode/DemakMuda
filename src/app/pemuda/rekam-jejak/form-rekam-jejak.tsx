"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, type FormEvent, type ReactNode } from "react";

import { PemilihGambar } from "@/components/pemilih-gambar";
import { Kolom, Label, Pesan, Tombol } from "@/components/sk";
import { LABEL_TINGKAT, TINGKAT_PRESTASI } from "@/lib/prestasi";
import type { HasilAksi } from "@/lib/validasi";

/**
 * Formulir rekam jejak.
 *
 * Berbeda dari formulir kanal lain yang berpindah halaman setelah tersimpan,
 * yang ini tinggal di tempat dan mengosongkan dirinya sendiri. Orang mengisi
 * pengalaman dan prestasi secara berturut-turut; memaksanya kembali ke daftar
 * lalu menekan "tambah" lagi untuk setiap baris membuat pekerjaan yang
 * seharusnya satu duduk menjadi bolak-balik.
 */

const TAHUN_INI = new Date().getFullYear();

function Kotak({
  aksi,
  tombol,
  anak,
  bersihkanTambahan,
}: {
  aksi: (data: FormData) => Promise<HasilAksi>;
  tombol: string;
  anak: (kolom: Record<string, string>) => ReactNode;
  /** Dipanggil setelah berhasil, untuk mengosongkan keadaan di luar <form>. */
  bersihkanTambahan?: () => void;
}) {
  const router = useRouter();
  const acuan = useRef<HTMLFormElement>(null);
  const [galat, setGalat] = useState<string | null>(null);
  const [kolom, setKolom] = useState<Record<string, string>>({});
  const [sedang, setSedang] = useState(false);
  const [berhasil, setBerhasil] = useState(false);

  async function kirim(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setGalat(null);
    setKolom({});
    setBerhasil(false);
    setSedang(true);

    const hasil = await aksi(new FormData(e.currentTarget));
    setSedang(false);

    if (!hasil.ok) {
      setGalat(hasil.pesan);
      setKolom(hasil.kolom ?? {});
      return;
    }

    acuan.current?.reset();
    bersihkanTambahan?.();
    setBerhasil(true);
    router.refresh();
  }

  return (
    <form ref={acuan} onSubmit={kirim} className="flex flex-col gap-4">
      {anak(kolom)}

      {/* Hasilnya berdampingan dengan tombol, bukan di kepala formulir.
          Formulir ini panjang — pada prestasi ada enam kolom ditambah pemilih
          gambar — dan di ponsel orang yang baru menekan tombol berada di
          dasarnya. Pesan di kepala formulir muncul di luar layar dan tidak
          pernah terlihat.

          Pesannya juga menyebut KE MANA barisnya pergi, karena daftarnya
          berada di atas formulir ini: perubahan yang terjadi di luar
          pandangan harus dikatakan, bukan diandaikan terlihat. */}
      <div className="flex flex-col gap-3">
        {galat && <Pesan nada="galat">{galat}</Pesan>}
        {berhasil && (
          <Pesan nada="berhasil">
            Tersimpan, dan sudah masuk ke daftar di atas.
          </Pesan>
        )}
        <div>
          <Tombol type="submit" disabled={sedang}>
            {sedang ? "Menyimpan…" : tombol}
          </Tombol>
        </div>
      </div>
    </form>
  );
}

function Galat({ pesan }: { pesan?: string }) {
  if (!pesan) return null;
  return <p className="text-xs text-danger">{pesan}</p>;
}

export function FormPengalaman({
  simpan,
}: {
  simpan: (data: FormData) => Promise<HasilAksi>;
}) {
  return (
    <Kotak aksi={simpan} tombol="Tambah pengalaman" anak={(kolom) => (
      <>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="pj">Nama pengalaman</Label>
          <Kolom
            id="pj"
            name="judul"
            required
            maxLength={160}
            placeholder="Panitia Jambore Pemuda Demak"
          />
          <Galat pesan={kolom.judul} />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="pp">Peran (opsional)</Label>
            <Kolom id="pp" name="peran" maxLength={80} placeholder="Koordinator acara" />
            <Galat pesan={kolom.peran} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="pn">Penyelenggara (opsional)</Label>
            <Kolom
              id="pn"
              name="penyelenggara"
              maxLength={120}
              placeholder="Dinpora Kabupaten Demak"
            />
            <Galat pesan={kolom.penyelenggara} />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="pm">Tahun mulai</Label>
            <Kolom
              id="pm"
              name="tahunMulai"
              type="number"
              required
              min={1980}
              max={TAHUN_INI + 1}
              defaultValue={TAHUN_INI}
            />
            <Galat pesan={kolom.tahunMulai} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="ps">Tahun selesai (kosongkan bila masih berjalan)</Label>
            <Kolom id="ps" name="tahunSelesai" type="number" min={1980} max={TAHUN_INI + 1} />
            <Galat pesan={kolom.tahunSelesai} />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="pk">Keterangan (opsional)</Label>
          <textarea
            id="pk"
            name="keterangan"
            rows={3}
            maxLength={500}
            className="sk-field w-full px-3.5 py-2.5 text-sm"
            placeholder="Apa yang Anda kerjakan di sana."
          />
          <Galat pesan={kolom.keterangan} />
        </div>
      </>
    )} />
  );
}

export function FormPrestasi({
  simpan,
}: {
  simpan: (data: FormData) => Promise<HasilAksi>;
}) {
  // Kunci pemaksa: mengubahnya membuat React membangun ulang PemilihGambar,
  // sehingga alamat unggahan sebelumnya ikut hilang. form.reset() tidak dapat
  // melakukannya sendiri — alamat itu tersimpan di keadaan komponen, bukan di
  // kolom formulir yang dapat dikosongkan peramban.
  const [kunci, setKunci] = useState(0);

  return (
    <Kotak
      aksi={simpan}
      tombol="Tambah prestasi"
      bersihkanTambahan={() => setKunci((k) => k + 1)}
      anak={(kolom) => (
        <>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="rj">Nama prestasi</Label>
            <Kolom
              id="rj"
              name="judul"
              required
              maxLength={160}
              placeholder="Juara 2 Bulu Tangkis POPDA Jawa Tengah"
            />
            <Galat pesan={kolom.judul} />
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="rt">Tingkat</Label>
              <select
                id="rt"
                name="tingkat"
                required
                defaultValue="KABUPATEN"
                className="sk-field w-full px-3.5 py-2.5 text-sm"
              >
                {TINGKAT_PRESTASI.map((t) => (
                  <option key={t} value={t}>
                    {LABEL_TINGKAT[t]}
                  </option>
                ))}
              </select>
              <Galat pesan={kolom.tingkat} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="rp">Peringkat (opsional)</Label>
              <Kolom id="rp" name="peringkat" maxLength={60} placeholder="Juara 2" />
              <Galat pesan={kolom.peringkat} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="rh">Tahun</Label>
              <Kolom
                id="rh"
                name="tahun"
                type="number"
                required
                min={1980}
                max={TAHUN_INI + 1}
                defaultValue={TAHUN_INI}
              />
              <Galat pesan={kolom.tahun} />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="rn">Penyelenggara (opsional)</Label>
            <Kolom
              id="rn"
              name="penyelenggara"
              maxLength={120}
              placeholder="Dinas Kepemudaan dan Olahraga Provinsi Jawa Tengah"
            />
            <Galat pesan={kolom.penyelenggara} />
          </div>

          <div key={kunci}>
            <PemilihGambar
              nama="buktiUrl"
              ruang="prestasi"
              label="Foto piagam atau sertifikat"
              keterangan="Prestasi di sini diisi sendiri dan tidak diperiksa siapa pun. Buktinya yang membuatnya berarti — tanpa itu, isinya hanya klaim. Gambar ini tampil terbuka di Kartu Talenta Anda."
            />
            <Galat pesan={kolom.buktiUrl} />
          </div>
        </>
      )}
    />
  );
}

/**
 * Tombol hapus satu baris.
 *
 * Memakai <button formAction> di dalam <form> tersendiri, bukan onClick yang
 * memanggil aksi langsung, supaya barisnya tetap dapat dihapus tanpa JavaScript.
 */
export function TombolHapus({
  id,
  aksi,
  label,
}: {
  id: string;
  aksi: (data: FormData) => Promise<HasilAksi>;
  label: string;
}) {
  const router = useRouter();
  const [sedang, setSedang] = useState(false);

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        setSedang(true);
        await aksi(new FormData(e.currentTarget));
        setSedang(false);
        router.refresh();
      }}
    >
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        disabled={sedang}
        aria-label={label}
        className="rounded-sk px-2 py-1 text-xs text-danger underline underline-offset-2 disabled:opacity-60"
      >
        {sedang ? "Menghapus…" : "Hapus"}
      </button>
    </form>
  );
}
