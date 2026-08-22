import "server-only";

import { del } from "@vercel/blob";

import { alamatBlobSah } from "@/lib/blob";

/**
 * Menghapus berkas yang sudah tidak dirujuk lagi.
 *
 * Dipanggil setelah kolom gambar berubah nilainya. Dua penjagaan yang tidak
 * boleh hilang: berkas yang alamatnya sama sekali tidak berubah tentu tidak
 * dihapus, dan alamat yang bukan milik penyimpanan kita tidak pernah disentuh
 * — perintah hapus yang menerima alamat sembarang adalah senjata yang salah
 * arah.
 *
 * Kegagalan penghapusan tidak boleh menggagalkan penyimpanan. Berkas yatim
 * hanya memakan tempat; pekerjaan pengguna yang hilang jauh lebih mahal.
 *
 * Berkas yang terlanjur diunggah lalu formulirnya ditinggalkan tanpa disimpan
 * memang menjadi yatim. Itu diterima dengan sadar — menutupnya menuntut
 * pencatatan unggahan sementara yang tidak sepadan untuk saat ini.
 */
export async function hapusBerkasLama(
  lama: string | null | undefined,
  baru: string | null | undefined,
): Promise<void> {
  if (!lama || lama === baru) return;
  if (!alamatBlobSah(lama)) return;

  try {
    await del(lama);
  } catch (e) {
    console.error("[berkas] gagal menghapus berkas lama", e);
  }
}
