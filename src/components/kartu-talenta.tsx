import Image from "next/image";

import lambang from "../../public/lambang-demak.png";

/**
 * Kartu Talenta sebagai benda, bukan sebagai halaman.
 *
 * Bentuknya meminjam tata letak kartu identitas — pita kepala, foto di kanan,
 * baris data di kiri — karena itulah bahasa yang langsung dikenali orang
 * sebagai "kartu". Tetapi ia sengaja dibuat TIDAK menyerupai KTP:
 *
 *   - judulnya "Kartu Talenta Pemuda", bukan Kartu Tanda Penduduk;
 *   - tidak ada NIK, dan memang tidak pernah ada — aplikasi ini tidak
 *     mengumpulkan nomor kependudukan sama sekali;
 *   - pengenalnya berupa alamat halaman ini sendiri, bukan nomor resmi yang
 *     bisa disalahartikan sebagai dokumen negara.
 *
 * Batas itu penting. Meniru tata letaknya membantu orang memahami benda ini;
 * meniru dokumennya akan menjadikannya barang palsu.
 *
 * Kartunya juga satu-satunya permukaan di aplikasi ini yang TIDAK mengikuti
 * tema terang atau gelap. Kartu sungguhan tidak berganti warna ketika lampu
 * ruangan dimatikan, dan benda yang berpura-pura fisik akan kehilangan
 * kesannya bila ikut berubah.
 */
const TAMPIL = 3;

export function KartuTalenta({
  nama,
  slug,
  fotoUrl,
  kecamatan,
  desa,
  usia,
  minat,
  keterampilan,
  organisasi,
  terverifikasi,
  qr,
}: {
  nama: string;
  slug: string;
  fotoUrl: string | null;
  kecamatan: string | null;
  desa: string | null;
  usia: number | null;
  minat: string[];
  keterampilan: string[];
  organisasi: { nama: string; peran: string } | null;
  terverifikasi: boolean;
  /** SVG kode QR, dibangkitkan di peladen. */
  qr: string | null;
}) {
  const inisial = nama
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((k) => k[0]?.toUpperCase() ?? "")
    .join("");

  return (
    <div
      className="flex w-full max-w-2xl flex-col overflow-hidden rounded-[18px] text-[#eaf3ef] shadow-melayang sm:min-h-[23rem]"
      style={{ backgroundColor: "#0b3f34" }}
    >
      {/* Pita kepala. Warna kuningan mengambil ornamen yang sama dipakai
          seluruh aplikasi, di sini sebagai garis tegas seperti pada kartu
          cetak. shrink-0 wajib: tanpa itu pita ikut memampat ketika isinya
          padat, dan kepala kartu yang memampat langsung terlihat salah. */}
      <div
        className="flex shrink-0 items-center gap-3 px-5 py-3"
        style={{ backgroundColor: "#083026", borderBottom: "2px solid #b58a3c" }}
      >
        <Image
          src={lambang}
          alt=""
          width={32}
          height={32}
          className="h-8 w-auto shrink-0"
        />
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#b58a3c]">
            Pemerintah Kabupaten Demak
          </p>
          <p className="truncate text-sm font-semibold tracking-tight">
            Kartu Talenta Pemuda
          </p>
        </div>
      </div>

      {/* min-h-0 melengkapi flex-1. Tanpa keduanya, isi yang lebih tinggi dari
          sisa ruang akan meluber melewati dasar kartu dan terpotong oleh
          overflow-hidden — persis yang membuat kode QR sempat terpangkas. */}
      <div className="flex min-h-0 flex-1 flex-col justify-between gap-3 px-5 py-4">
        <div className="flex gap-4">
          {/* Dua barisnya semula dibungkus <div className="grid"> tersendiri di
              dalam <dl>, sehingga <dt> dan <dd> berada dua tingkat di dalam div
              — susunan yang tidak sah. Pembaca layar berhenti mengumumkannya
              sebagai daftar istilah, dan hubungan antara label dan nilainya
              hilang. Audit axe-core menandainya sebagai pelanggaran serius pada
              delapan simpul.

              Kolomnya kini diatur oleh <dl> itu sendiri, sehingga setiap
              pasangan <dt>/<dd> berada tepat satu tingkat di dalamnya. Tampilan
              tidak berubah sama sekali. */}
          <dl className="grid min-w-0 flex-1 grid-cols-2 gap-x-3 gap-y-2.5">
            <Baris label="Nama" nilai={nama} besar seluruhBaris />
            <Baris label="Kecamatan" nilai={kecamatan ?? "—"} />
            <Baris label="Desa / Kelurahan" nilai={desa ?? "—"} />
            <Baris label="Usia" nilai={usia !== null ? `${usia} tahun` : "—"} />
            <Baris
              label="Organisasi"
              nilai={organisasi ? `${organisasi.nama}` : "—"}
            />
          </dl>

          {/* Foto berbanding 3:4 seperti pasfoto. Bila kosong, inisial nama —
              bukan siluet orang, yang selalu terbaca sebagai foto yang gagal
              dimuat. */}
          <div
            className="relative h-[100px] w-[75px] shrink-0 overflow-hidden rounded-[6px] sm:h-[116px] sm:w-[87px]"
            style={{ backgroundColor: "#0f4d3f", border: "1px solid #1c6553" }}
          >
            {fotoUrl ? (
              <Image
                src={fotoUrl}
                alt={`Foto ${nama}`}
                fill
                sizes="96px"
                className="object-cover"
              />
            ) : (
              <span className="flex h-full items-center justify-center text-2xl font-semibold text-[#7fb9a6]">
                {inisial}
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <Cincin label="Bidang minat" isi={minat} />
          <Cincin label="Keterampilan" isi={keterampilan} />
        </div>

        <div className="flex items-end justify-between gap-4">
          <div className="flex min-w-0 flex-col gap-1">
            {terverifikasi && (
              <span
                className="w-fit rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider"
                style={{ backgroundColor: "#b58a3c", color: "#0b3f34" }}
              >
                Terverifikasi Dispora
              </span>
            )}
            <p className="truncate font-mono text-[11px] text-[#7fb9a6]">
              demakmuda /p/ {slug}
            </p>
          </div>

          {qr && (
            // Lebar kolom dikunci pada lebar pelatnya. Bila dibiarkan mengikuti
            // isi terlebar, keterangan di bawahnya yang menentukan lebar, dan
            // pelat kodenya jadi mengambang di tengah ruang yang lebih lebar.
            <div className="flex w-[68px] shrink-0 flex-col items-center gap-1">
              {/* Aturan [&>svg] memaksa kode QR seukuran pelat ini, apa pun
                  ukuran yang dibawanya sendiri. Pelat yang memuat gambar dari
                  pustaka luar harus yang menentukan ukuran, bukan menerimanya. */}
              <div
                className="h-[68px] w-[68px] rounded-[4px] bg-white p-1 [&>svg]:block [&>svg]:h-full [&>svg]:w-full"
                // QR dibangkitkan di peladen dari alamat halaman ini sendiri;
                // tidak ada masukan pengguna yang masuk ke dalamnya.
                dangerouslySetInnerHTML={{ __html: qr }}
              />
              <span className="text-center text-[8px] font-semibold uppercase leading-[1.25] tracking-[0.06em] text-[#7fb9a6]">
                Pindai untuk memeriksa
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Baris({
  label,
  nilai,
  besar = false,
  seluruhBaris = false,
}: {
  label: string;
  nilai: string;
  besar?: boolean;
  /** Memenuhi kedua kolom pada kisi <dl>. Dipakai untuk nama. */
  seluruhBaris?: boolean;
}) {
  return (
    <div className={`min-w-0 ${seluruhBaris ? "col-span-2" : ""}`}>
      <dt className="text-[9px] font-semibold uppercase tracking-[0.14em] text-[#7fb9a6]">
        {label}
      </dt>
      <dd
        className={`truncate ${besar ? "text-lg font-semibold tracking-tight sm:text-xl" : "text-sm"}`}
      >
        {nilai}
      </dd>
    </div>
  );
}

/**
 * Daftar pendek berbentuk cincin.
 *
 * Dibatasi tiga, dan sisanya diringkas menjadi "+N". Kartu itu ringkasan
 * sekilas; memaksa seluruh daftar masuk akan membuatnya memanjang dan
 * kehilangan bentuk kartunya.
 */
function Cincin({ label, isi }: { label: string; isi: string[] }) {
  if (isi.length === 0) return null;
  const tampil = isi.slice(0, TAMPIL);
  const sisa = isi.length - tampil.length;

  return (
    <div className="flex min-w-0 flex-wrap items-center gap-1.5">
      <span className="text-[9px] font-semibold uppercase tracking-[0.14em] text-[#7fb9a6]">
        {label}
      </span>
      {tampil.map((t) => (
        <span
          key={t}
          className="truncate rounded-full px-2 py-0.5 text-[11px]"
          style={{ backgroundColor: "#0f4d3f", border: "1px solid #1c6553" }}
        >
          {t}
        </span>
      ))}
      {sisa > 0 && (
        <span className="text-[11px] text-[#7fb9a6]">+{sisa}</span>
      )}
    </div>
  );
}
