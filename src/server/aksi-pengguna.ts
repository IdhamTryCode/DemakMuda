"use server";

import { revalidatePath } from "next/cache";

import { adalahPeran, type Peran } from "@/lib/peran";
import { prisma } from "@/lib/prisma";
import type { HasilAksi } from "@/lib/validasi";
import { catat } from "@/server/audit";
import { GagalIzin, wajibAktor } from "@/server/penjaga";

/**
 * Perubahan peran pengguna — hanya superadmin.
 *
 * Ini tindakan paling berkuasa di aplikasi: menaikkan seseorang menjadi dinas
 * berarti memberinya akses ke data seluruh pemuda. Karena itu setiap perubahan
 * dicatat lengkap dengan peran lama dan barunya.
 */
export async function ubahPeran(userId: string, peranBaru: string): Promise<HasilAksi> {
  try {
    const aktor = await wajibAktor("superadmin");

    if (!adalahPeran(peranBaru)) {
      return { ok: false, pesan: "Peran tidak dikenali." };
    }

    // Menurunkan peran diri sendiri akan mengunci satu-satunya pintu masuk
    // pengelolaan peran. Ditolak, bukan diperingatkan.
    if (userId === aktor.id) {
      return {
        ok: false,
        pesan:
          "Anda tidak dapat mengubah peran akun sendiri. Minta superadmin lain melakukannya.",
      };
    }

    const pengguna = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, role: true },
    });
    if (!pengguna) return { ok: false, pesan: "Pengguna tidak ditemukan." };
    if (pengguna.role === peranBaru) {
      return { ok: false, pesan: "Peran pengguna sudah seperti itu." };
    }

    await prisma.user.update({
      where: { id: userId },
      data: { role: peranBaru satisfies Peran },
    });

    await catat({
      aktorId: aktor.id,
      aksi: "pengguna.ubahPeran",
      sasaran: "user",
      sasaranId: userId,
      rincian: {
        surel: pengguna.email,
        peranLama: pengguna.role,
        peranBaru,
      },
    });

    revalidatePath("/admin/pengguna");
    return { ok: true };
  } catch (e) {
    if (e instanceof GagalIzin) return { ok: false, pesan: e.message };
    console.error("[pengguna.ubahPeran]", e);
    return { ok: false, pesan: "Terjadi kesalahan." };
  }
}
