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
 */
export async function tandaiTerbaca(id: string): Promise<HasilAksi> {
  const aktor = await aktorSaatIni();
  if (!aktor) return { ok: false, pesan: "Anda perlu masuk lebih dulu." };

  await prisma.notifikasi.updateMany({
    where: { id, penerimaId: aktor.id, dibacaPada: null },
    data: { dibacaPada: new Date() },
  });

  revalidatePath("/notifikasi");
  return { ok: true };
}

export async function tandaiSemuaTerbaca(): Promise<HasilAksi> {
  const aktor = await aktorSaatIni();
  if (!aktor) return { ok: false, pesan: "Anda perlu masuk lebih dulu." };

  await prisma.notifikasi.updateMany({
    where: { penerimaId: aktor.id, dibacaPada: null },
    data: { dibacaPada: new Date() },
  });

  revalidatePath("/notifikasi");
  return { ok: true };
}
