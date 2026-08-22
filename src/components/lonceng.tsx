import { PanelLonceng, type RingkasNotifikasi } from "@/components/panel-lonceng";
import { prisma } from "@/lib/prisma";
import { dapatkanSesi } from "@/lib/sesi";
import { sejak } from "@/lib/teks";
import { tandaiSemuaTerbaca, tandaiTerbaca } from "@/server/aksi-notifikasi";

/**
 * Lonceng pemberitahuan untuk bilah dasbor.
 *
 * Bagian yang membaca basis data tinggal di sini, di sisi peladen. Yang
 * diserahkan ke peramban hanya bentuk yang sudah jadi — termasuk keterangan
 * waktunya, yang dihitung di sini supaya tidak bergantung pada jam mesin
 * pembaca dan tidak menimbulkan ketidakcocokan hidrasi.
 *
 * Enam terbaru saja. Panel ini untuk melihat sekilas; arsip lengkapnya ada di
 * /notifikasi.
 */
const BANYAK_DITAMPILKAN = 6;

export async function Lonceng() {
  const sesi = await dapatkanSesi();
  if (!sesi) return null;

  const sekarang = new Date();
  const [belum, terbaru] = await Promise.all([
    prisma.notifikasi.count({
      where: { penerimaId: sesi.user.id, dibacaPada: null },
    }),
    prisma.notifikasi.findMany({
      where: { penerimaId: sesi.user.id },
      orderBy: [{ dibacaPada: "asc" }, { dibuatPada: "desc" }],
      take: BANYAK_DITAMPILKAN,
      select: {
        id: true,
        judul: true,
        pesan: true,
        tautan: true,
        dibacaPada: true,
        dibuatPada: true,
      },
    }),
  ]);

  const daftar: RingkasNotifikasi[] = terbaru.map((n) => ({
    id: n.id,
    judul: n.judul,
    pesan: n.pesan,
    tautan: n.tautan,
    terbaca: n.dibacaPada !== null,
    waktu: sejak(n.dibuatPada, sekarang),
  }));

  return (
    <PanelLonceng
      belum={belum}
      daftar={daftar}
      tandai={tandaiTerbaca}
      tandaiSemua={tandaiSemuaTerbaca}
    />
  );
}
