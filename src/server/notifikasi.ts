import "server-only";

import { prisma } from "@/lib/prisma";
import type { JenisNotifikasi } from "@/generated/prisma/enums";

/**
 * Pengirim pemberitahuan dalam aplikasi.
 *
 * Sengaja dipisahkan dari jejak audit meskipun keduanya dipanggil dari tempat
 * yang sama. Jejak audit menjawab "siapa melakukan apa" untuk keperluan
 * pemeriksaan; pemberitahuan menjawab "siapa perlu tahu" untuk keperluan
 * penggunanya. Menggabungkan keduanya akan membuat setiap perubahan aturan
 * pemeriksaan ikut mengubah apa yang dilihat pengguna.
 *
 * Kegagalan pengiriman TIDAK boleh menggagalkan aksi utamanya, sama seperti
 * jejak audit. Pemberitahuan yang hilang merepotkan; pekerjaan pengguna yang
 * hilang jauh lebih mahal.
 *
 * Tidak ada pengiriman ke luar aplikasi. Layanan surel belum terpasang — bahkan
 * tautan verifikasi pun masih dicetak ke konsol peladen — jadi menjanjikan
 * pemberitahuan lewat surel di sini hanya akan menjadi janji kosong.
 */
export async function kirimNotifikasi(masukan: {
  penerimaId: string;
  jenis: JenisNotifikasi;
  judul: string;
  pesan: string;
  tautan?: string;
}): Promise<void> {
  try {
    await prisma.notifikasi.create({
      data: {
        penerimaId: masukan.penerimaId,
        jenis: masukan.jenis,
        judul: masukan.judul,
        pesan: masukan.pesan,
        tautan: masukan.tautan ?? null,
      },
    });
  } catch (e) {
    console.error("[notifikasi] gagal mengirim", masukan.jenis, e);
  }
}

/**
 * Mengirim satu pemberitahuan ke seluruh petugas dinas.
 *
 * Dipakai untuk kejadian yang ditujukan kepada lembaga, bukan kepada orang
 * tertentu — aspirasi yang masuk, misalnya. Superadmin ikut menerima karena ia
 * memang berwenang atas seluruh isi.
 */
export async function kirimKeDinas(masukan: {
  jenis: JenisNotifikasi;
  judul: string;
  pesan: string;
  tautan?: string;
}): Promise<void> {
  try {
    const petugas = await prisma.user.findMany({
      where: { role: { in: ["dinas", "superadmin"] } },
      select: { id: true },
    });
    await Promise.all(
      petugas.map((p) => kirimNotifikasi({ ...masukan, penerimaId: p.id })),
    );
  } catch (e) {
    console.error("[notifikasi] gagal mengirim ke dinas", masukan.jenis, e);
  }
}

/** Jumlah pemberitahuan yang belum dibaca, untuk lonceng di bilah dasbor. */
export async function jumlahBelumDibaca(penerimaId: string): Promise<number> {
  return prisma.notifikasi.count({
    where: { penerimaId, dibacaPada: null },
  });
}
