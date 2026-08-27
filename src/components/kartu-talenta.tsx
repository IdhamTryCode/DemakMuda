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
export function KartuTalenta({
  nama,
  slug,
  fotoUrl,
  kecamatan,
  desa,
  usia,
  bidang,
  terverifikasi,
  qr,
}: {
  nama: string;
  slug: string;
  fotoUrl: string | null;
  kecamatan: string | null;
  desa: string | null;
  usia: number | null;
  bidang: string | null;
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
      className="w-full max-w-2xl overflow-hidden rounded-[18px] text-[#eaf3ef] shadow-melayang sm:aspect-[1.586]"
      style={{ backgroundColor: "#0b3f34" }}
    >
      {/* Pita kepala. Warna kuningan mengambil ornamen yang sama dipakai
          seluruh aplikasi, di sini sebagai garis tegas seperti pada kartu
          cetak. */}
      <div
        className="flex items-center gap-3 px-5 py-3"
        style={{ backgroundColor: "#083026", borderBottom: "2px solid #b58a3c" }}
      >
        <Image
          src={lambang}
          alt=""
          width={34}
          height={34}
          className="h-[34px] w-auto shrink-0"
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

      <div className="flex h-full flex-col gap-4 px-5 py-4 sm:gap-3">
        <div className="flex flex-1 gap-5">
          <dl className="flex min-w-0 flex-1 flex-col gap-3 sm:gap-2.5">
            <Baris label="Nama" nilai={nama} besar />
            <div className="grid grid-cols-2 gap-3">
              <Baris label="Kecamatan" nilai={kecamatan ?? "—"} />
              <Baris label="Desa / Kelurahan" nilai={desa ?? "—"} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Baris label="Usia" nilai={usia !== null ? `${usia} tahun` : "—"} />
              <Baris label="Bidang" nilai={bidang ?? "—"} />
            </div>
          </dl>

          {/* Foto berbanding 3:4 seperti pasfoto. Bila kosong, inisial nama —
              bukan siluet orang, yang selalu terbaca sebagai foto yang gagal
              dimuat. */}
          <div
            className="relative h-[104px] w-[78px] shrink-0 overflow-hidden rounded-[6px] sm:h-[124px] sm:w-[93px]"
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

        <div className="flex items-end justify-between gap-4 pb-4 sm:pb-0">
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
            <div
              className="h-[62px] w-[62px] shrink-0 rounded-[4px] bg-white p-1 sm:h-[70px] sm:w-[70px]"
              // QR dibangkitkan di peladen dari alamat halaman ini sendiri;
              // tidak ada masukan pengguna yang masuk ke dalamnya.
              dangerouslySetInnerHTML={{ __html: qr }}
            />
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
}: {
  label: string;
  nilai: string;
  besar?: boolean;
}) {
  return (
    <div className="min-w-0">
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
