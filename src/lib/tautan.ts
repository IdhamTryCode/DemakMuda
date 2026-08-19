/**
 * Penyaring alamat luar pada saat ditampilkan.
 *
 * Skema Zod sudah menolak protokol selain http dan https ketika data masuk,
 * tetapi lapisan itu hanya menjaga pintu depan. Baris yang sudah terlanjur
 * ada di basis data — hasil impor, hasil sunting langsung, atau sisa dari
 * aturan lama — tidak pernah melewatinya. Karena itu alamat diperiksa ulang
 * tepat sebelum dipasang sebagai href, dan yang tidak lolos dibuang menjadi
 * null sehingga tautannya tidak dirender sama sekali.
 */
export function tautanAman(nilai: string | null | undefined): string | null {
  if (!nilai) return null;
  try {
    const p = new URL(nilai).protocol.toLowerCase();
    return p === "http:" || p === "https:" ? nilai : null;
  } catch {
    return null;
  }
}

/** Nama inang tanpa awalan www, untuk memperlihatkan tujuan sebuah tautan. */
export function namaInang(alamat: string): string {
  try {
    return new URL(alamat).hostname.replace(/^www\./, "");
  } catch {
    return alamat;
  }
}
