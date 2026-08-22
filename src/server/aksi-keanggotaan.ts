"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import type { HasilAksi } from "@/lib/validasi";
import { catat } from "@/server/audit";
import { kirimNotifikasi } from "@/server/notifikasi";
import {
  bolehMengubah,
  GagalIzin,
  PENGELOLA_ISI,
  wajibAktor,
} from "@/server/penjaga";

/**
 * Server Action untuk keanggotaan organisasi.
 *
 * Pemuda mengajukan diri, pengelola organisasi yang menyetujui. Pengajuan
 * tidak pernah langsung menjadikan seseorang anggota, supaya daftar anggota
 * di direktori tetap dapat dipercaya.
 */

export async function ajukanKeanggotaan(organisasiId: string): Promise<HasilAksi> {
  try {
    const aktor = await wajibAktor("pemuda");

    const organisasi = await prisma.organisasi.findUnique({
      where: { id: organisasiId },
      select: { id: true, nama: true, slug: true, statusVerifikasi: true, pemilikId: true },
    });
    if (!organisasi || organisasi.statusVerifikasi !== "TERVERIFIKASI") {
      return { ok: false, pesan: "Organisasi ini tidak tersedia." };
    }

    const sudah = await prisma.keanggotaan.findUnique({
      where: { organisasiId_userId: { organisasiId, userId: aktor.id } },
      select: { status: true },
    });
    if (sudah) {
      return {
        ok: false,
        pesan:
          sudah.status === "TERVERIFIKASI"
            ? "Anda sudah menjadi anggota organisasi ini."
            : "Pengajuan Anda sedang diperiksa pengurus.",
      };
    }

    await prisma.keanggotaan.create({
      data: { organisasiId, userId: aktor.id },
    });

    await catat({
      aktorId: aktor.id,
      aksi: "keanggotaan.ajukan",
      sasaran: "organisasi",
      sasaranId: organisasiId,
      rincian: { nama: organisasi.nama },
    });

    await kirimNotifikasi({
      penerimaId: organisasi.pemilikId,
      jenis: "KEANGGOTAAN_DIAJUKAN",
      judul: "Permintaan bergabung baru",
      pesan: `${aktor.nama} mengajukan diri sebagai anggota ${organisasi.nama}.`,
      tautan: `/kelola/organisasi/${organisasiId}/anggota`,
    });

    revalidatePath("/direktori");
    // Halaman rinci punya alamat sendiri; tanpa baris ini jumlah anggota di
    // sana masih menampilkan angka lama sesaat setelah pengajuan ditanggapi.
    revalidatePath("/direktori/[slug]", "page");
    return { ok: true };
  } catch (e) {
    if (e instanceof GagalIzin) return { ok: false, pesan: e.message };
    console.error("[keanggotaan.ajukan]", e);
    return { ok: false, pesan: "Terjadi kesalahan." };
  }
}

export async function tanggapiKeanggotaan(
  keanggotaanId: string,
  keputusan: "TERVERIFIKASI" | "DITOLAK",
): Promise<HasilAksi> {
  try {
    const aktor = await wajibAktor(...PENGELOLA_ISI);

    const keanggotaan = await prisma.keanggotaan.findUnique({
      where: { id: keanggotaanId },
      select: {
        organisasiId: true,
        userId: true,
        organisasi: { select: { pemilikId: true, nama: true, slug: true } },
      },
    });
    if (!keanggotaan) return { ok: false, pesan: "Pengajuan tidak ditemukan." };
    if (!bolehMengubah(aktor, keanggotaan.organisasi.pemilikId)) {
      return { ok: false, pesan: "Organisasi ini bukan milik Anda." };
    }

    await prisma.keanggotaan.update({
      where: { id: keanggotaanId },
      data: { status: keputusan },
    });

    await catat({
      aktorId: aktor.id,
      aksi: `keanggotaan.${keputusan === "TERVERIFIKASI" ? "terima" : "tolak"}`,
      sasaran: "keanggotaan",
      sasaranId: keanggotaanId,
      rincian: { organisasi: keanggotaan.organisasi.nama },
    });

    await kirimNotifikasi({
      penerimaId: keanggotaan.userId,
      jenis: "KEANGGOTAAN_DIPUTUSKAN",
      judul:
        keputusan === "TERVERIFIKASI"
          ? "Pengajuan keanggotaan diterima"
          : "Pengajuan keanggotaan tidak disetujui",
      pesan:
        keputusan === "TERVERIFIKASI"
          ? `Anda kini tercatat sebagai anggota ${keanggotaan.organisasi.nama}.`
          : `Pengurus ${keanggotaan.organisasi.nama} belum dapat menyetujui pengajuan Anda.`,
      tautan: `/direktori/${keanggotaan.organisasi.slug}`,
    });

    revalidatePath("/direktori");
    // Halaman rinci punya alamat sendiri; tanpa baris ini jumlah anggota di
    // sana masih menampilkan angka lama sesaat setelah pengajuan ditanggapi.
    revalidatePath("/direktori/[slug]", "page");
    revalidatePath("/kelola/organisasi");
    return { ok: true };
  } catch (e) {
    if (e instanceof GagalIzin) return { ok: false, pesan: e.message };
    console.error("[keanggotaan.tanggapi]", e);
    return { ok: false, pesan: "Terjadi kesalahan." };
  }
}
