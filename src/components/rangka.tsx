/**
 * Rangka tunggu (skeleton) untuk keadaan memuat.
 *
 * Bentuknya sengaja meniru isi yang akan menggantikannya — tinggi kartu dan
 * baris teks dibuat sepadan — supaya isinya tidak melompat saat muncul.
 *
 * Denyutnya memakai animasi bawaan Tailwind yang berhenti sendiri bila
 * pengguna meminta gerak dikurangi.
 */
export function BarisRangka({ lebar = "100%" }: { lebar?: string }) {
  return (
    <span
      aria-hidden="true"
      className="block h-3.5 animate-pulse rounded-[3px] bg-sunk"
      style={{ width: lebar }}
    />
  );
}

export function KartuRangka({ baris = 3 }: { baris?: number }) {
  const lebar = ["35%", "85%", "70%", "55%"];
  return (
    <div className="sk-raised flex flex-col gap-2.5 p-6">
      {Array.from({ length: baris }, (_, i) => (
        <BarisRangka key={i} lebar={lebar[i % lebar.length]} />
      ))}
    </div>
  );
}

/**
 * Rangka untuk halaman daftar publik: judul, kotak saringan, lalu beberapa
 * kartu. Diberi keterangan bagi pembaca layar supaya keadaan memuat tidak
 * terlewat oleh yang tidak melihat denyutnya.
 */
export function RangkaDaftar({
  judul,
  jumlahKartu = 3,
}: {
  judul: string;
  jumlahKartu?: number;
}) {
  return (
    <div className="flex flex-col gap-6" aria-busy="true">
      <span className="sr-only" role="status">
        Memuat {judul}…
      </span>

      <div className="flex flex-col gap-3">
        <h1 className="text-3xl font-semibold tracking-tight">{judul}</h1>
        <BarisRangka lebar="min(28rem, 90%)" />
      </div>

      <div className="sk-inset flex flex-col gap-3 p-4">
        <BarisRangka lebar="8rem" />
        <BarisRangka lebar="min(20rem, 70%)" />
      </div>

      <div className="flex flex-col gap-4">
        {Array.from({ length: jumlahKartu }, (_, i) => (
          <KartuRangka key={i} />
        ))}
      </div>
    </div>
  );
}
