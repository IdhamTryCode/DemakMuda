/**
 * Grafik batang mendatar untuk membandingkan besaran antar kategori.
 *
 * Keputusan yang disengaja:
 *
 * - **Satu warna untuk seluruh batang.** Kategori seperti kecamatan dan bidang
 *   minat tidak punya urutan alami, jadi mewarnainya bergradasi menurut besaran
 *   hanya mengulang informasi yang sudah disampaikan panjang batang.
 *
 * - **Tanpa sumbu dan garis bantu.** Nilainya ditulis di ujung tiap batang,
 *   sehingga garis kisi tidak menambah apa pun selain keramaian.
 *
 * - **Batang tipis dengan ujung membulat 4px** pada sisi data, siku pada sisi
 *   pangkal — supaya pangkalnya terbaca sebagai garis dasar bersama.
 *
 * Komponen ini dirender di server dan tidak memuat JavaScript apa pun.
 */
export function GrafikBatang({
  data,
  satuan = "",
  kosong = "Belum ada data.",
}: {
  data: { label: string; nilai: number }[];
  satuan?: string;
  kosong?: string;
}) {
  if (data.length === 0) {
    return <p className="text-sm text-muted">{kosong}</p>;
  }

  const tertinggi = Math.max(...data.map((d) => d.nilai), 1);
  const jumlah = data.reduce((n, d) => n + d.nilai, 0);

  return (
    <ol className="flex flex-col gap-2.5">
      {data.map((d) => {
        const persen = jumlah > 0 ? Math.round((d.nilai / jumlah) * 100) : 0;
        return (
          <li
            key={d.label}
            className="grid grid-cols-[minmax(7rem,11.5rem)_1fr_2.5rem] items-center gap-3"
            title={`${d.label}: ${d.nilai}${satuan ? ` ${satuan}` : ""} (${persen}% dari total)`}
          >
            <span className="truncate text-sm text-ink-soft">{d.label}</span>

            <span className="h-3.5 w-full overflow-hidden rounded-[2px] bg-sunk">
              <span
                className="block h-full rounded-r-[4px] bg-accent"
                style={{ width: `${(d.nilai / tertinggi) * 100}%` }}
              />
            </span>

            <span className="text-right text-sm font-medium tabular-nums text-ink">
              {d.nilai}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

/**
 * Angka ringkas. Dipakai ketika ceritanya memang satu bilangan — grafik untuk
 * satu nilai hanya membuat pembacanya bekerja lebih keras tanpa hasil.
 */
export function Angka({
  label,
  nilai,
  keterangan,
}: {
  label: string;
  nilai: number | string;
  keterangan?: string;
}) {
  return (
    <div className="sk-raised flex flex-col gap-1 p-5">
      <span className="text-xs font-semibold uppercase tracking-wider text-muted">
        {label}
      </span>
      <span className="text-3xl font-semibold tabular-nums tracking-tight">
        {nilai}
      </span>
      {keterangan && <span className="text-xs text-muted">{keterangan}</span>}
    </div>
  );
}
