"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { HasilAksi } from "@/lib/validasi";
import { catat } from "@/server/audit";

/**
 * Pencabutan sesi.
 *
 * Sesi dirujuk lewat id, bukan token. Token adalah kredensial: bila ia
 * disematkan ke dalam halaman untuk dipakai tombol, ia ikut tercetak di sumber
 * halaman dan menjadi sasaran empuk bila suatu saat ada celah penyisipan skrip.
 * Id tidak membawa kewenangan apa pun, dan kepemilikannya diperiksa di sini.
 */

export async function cabutSesi(sesiId: string): Promise<HasilAksi> {
  try {
    const sesi = await auth.api.getSession({ headers: await headers() });
    if (!sesi) return { ok: false, pesan: "Anda perlu masuk lebih dulu." };

    const sasaran = await prisma.session.findUnique({
      where: { id: sesiId },
      select: { id: true, userId: true, token: true },
    });
    // Sesi milik orang lain diperlakukan seperti tidak ada.
    if (!sasaran || sasaran.userId !== sesi.user.id) {
      return { ok: false, pesan: "Sesi tidak ditemukan." };
    }
    if (sasaran.token === sesi.session.token) {
      return {
        ok: false,
        pesan: "Ini perangkat yang sedang Anda pakai. Gunakan tombol Keluar.",
      };
    }

    await prisma.session.delete({ where: { id: sasaran.id } });

    await catat({
      aktorId: sesi.user.id,
      aksi: "sesi.cabut",
      sasaran: "session",
      sasaranId: sasaran.id,
    });

    revalidatePath("/keamanan");
    return { ok: true };
  } catch (e) {
    console.error("[sesi.cabut]", e);
    return { ok: false, pesan: "Terjadi kesalahan." };
  }
}

export async function cabutSesiLain(): Promise<HasilAksi> {
  try {
    const sesi = await auth.api.getSession({ headers: await headers() });
    if (!sesi) return { ok: false, pesan: "Anda perlu masuk lebih dulu." };

    const hasil = await prisma.session.deleteMany({
      where: { userId: sesi.user.id, NOT: { token: sesi.session.token } },
    });

    await catat({
      aktorId: sesi.user.id,
      aksi: "sesi.cabutSemuaLain",
      sasaran: "session",
      rincian: { jumlah: hasil.count },
    });

    revalidatePath("/keamanan");
    return { ok: true };
  } catch (e) {
    console.error("[sesi.cabutSemuaLain]", e);
    return { ok: false, pesan: "Terjadi kesalahan." };
  }
}
