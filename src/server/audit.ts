import "server-only";

import { headers } from "next/headers";

import { prisma } from "@/lib/prisma";

/**
 * Pencatat jejak audit (cetak biru Bagian IV lapis 7).
 *
 * Dicatat untuk setiap perubahan yang dilakukan pengelola: pembuatan,
 * penyuntingan, penerbitan, dan penghapusan. Kegagalan pencatatan tidak boleh
 * menggagalkan aksi utamanya — jejak yang hilang lebih ringan akibatnya
 * daripada pengguna yang kehilangan pekerjaannya.
 */
export async function catat(masukan: {
  aktorId: string | null;
  aksi: string;
  sasaran?: string;
  sasaranId?: string;
  rincian?: Record<string, unknown>;
}) {
  try {
    const kepala = await headers();
    const alamatIp =
      kepala.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      kepala.get("x-real-ip") ??
      null;

    await prisma.auditLog.create({
      data: {
        aktorId: masukan.aktorId,
        aksi: masukan.aksi,
        sasaran: masukan.sasaran ?? null,
        sasaranId: masukan.sasaranId ?? null,
        rincian: masukan.rincian ? JSON.parse(JSON.stringify(masukan.rincian)) : undefined,
        alamatIp,
      },
    });
  } catch (e) {
    console.error("[audit] gagal mencatat", masukan.aksi, e);
  }
}
