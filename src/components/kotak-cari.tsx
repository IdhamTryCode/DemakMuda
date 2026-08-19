import Link from "next/link";

/**
 * Kotak pencarian berbasis formulir biasa, bukan pencarian saat mengetik.
 *
 * Alasannya bukan kemalasan: pencarian saat mengetik mengirim permintaan pada
 * setiap ketukan tombol, dan di jaringan seluler yang lambat — keadaan yang
 * justru paling lazim bagi calon penggunanya — hasilnya terasa tersendat.
 * Formulir yang dikirim sekali juga membuat hasilnya punya alamat sendiri,
 * sehingga dapat dibagikan dan dibuka ulang.
 */
export function KotakCari({
  aksi,
  nilai,
  tersembunyi = {},
  petunjuk = "Cari…",
  keterangan,
}: {
  aksi: string;
  nilai?: string;
  /** Saringan lain yang sedang aktif, agar tidak hilang saat mencari. */
  tersembunyi?: Record<string, string | undefined>;
  petunjuk?: string;
  keterangan?: string;
}) {
  const sisa = Object.entries(tersembunyi).filter(([, v]) => Boolean(v));

  return (
    <form action={aksi} method="get" className="flex flex-wrap items-end gap-3">
      {sisa.map(([k, v]) => (
        <input key={k} type="hidden" name={k} value={v} />
      ))}

      <div className="flex min-w-56 flex-1 flex-col gap-1.5">
        <label
          htmlFor="cari"
          className="text-xs font-semibold uppercase tracking-wider text-muted"
        >
          Pencarian
        </label>
        <input
          id="cari"
          name="cari"
          type="search"
          defaultValue={nilai ?? ""}
          maxLength={80}
          placeholder={petunjuk}
          className="sk-field w-full px-3.5 py-2.5 text-sm"
        />
        {keterangan && <p className="text-xs text-muted">{keterangan}</p>}
      </div>

      <button
        type="submit"
        className="sk-raised sk-pressable rounded-sk px-4 py-2.5 text-sm font-medium text-ink-soft"
      >
        Cari
      </button>

      {nilai && (
        <Link
          href={
            sisa.length > 0
              ? `${aksi}?${new URLSearchParams(sisa as [string, string][]).toString()}`
              : aksi
          }
          className="px-2 py-2.5 text-sm text-accent underline underline-offset-2"
        >
          Hapus pencarian
        </Link>
      )}
    </form>
  );
}
