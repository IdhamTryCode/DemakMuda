"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import type { HasilAksi } from "@/lib/validasi";
import { aktorSaatIni } from "@/server/penjaga";

/**
 * Menandai pemberitahuan sudah dibaca.
 *
 * Kepemilikan menjadi bagian dari kondisi pembaruan, bukan pemeriksaan
 * terpisah sesudahnya. Dengan begitu pemberitahuan milik orang lain tidak
 * tersentuh sama sekali, dan balasannya pun tidak membocorkan apakah
 * pengenal itu memang ada.
 *
 * Tidak dicatat ke jejak audit: membaca pemberitahuan sendiri bukan tindakan
 * pengelolaan, dan mencatatnya hanya akan menenggelamkan jejak yang penting.
 *
 * Galat basis data ditangkap dan dikembalikan sebagai kalimat, sama seperti
 * seluruh Server Action lain. Tanpa itu, satu sentakan basis data akan
 * melemparkan penggunanya ke batas galat hanya karena menekan lonceng.
 */
export async function tandaiTerbaca(id: string): Promise<HasilAksi> {
  try {
    const aktor = await aktorSaatIni();
    if (!aktor) return { ok: false, pesan: "Anda perlu masuk lebih dulu." };

    await prisma.notifikasi.updateMany({
      where: { id, penerimaId: aktor.id, dibacaPada: null },
      data: { dibacaPada: new Date() },
    });

    revalidatePath("/notifikasi");
    return { ok: true };
  } catch (e) {
    console.error("[notifikasi.tandaiTerbaca]", e);
    return { ok: false, pesan: "Terjadi kesalahan. Coba lagi." };
  }
}

export async function tandaiSemuaTerbaca(): Promise<HasilAksi> {
  try {
    const aktor = await aktorSaatIni();
    if (!aktor) return { ok: false, pesan: "Anda perlu masuk lebih dulu." };

    await prisma.notifikasi.updateMany({
      where: { penerimaId: aktor.id, dibacaPada: null },
      data: { dibacaPada: new Date() },
    });

    revalidatePath("/notifikasi");
    return { ok: true };
  } catch (e) {
    console.error("[notifikasi.tandaiSemuaTerbaca]", e);
    return { ok: false, pesan: "Terjadi kesalahan. Coba lagi." };
  }
}
