"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import type { HasilAksi } from "@/lib/validasi";
import { catat } from "@/server/audit";
import { GagalIzin, bolehMengubah, PENGELOLA_ISI, wajibAktor } from "@/server/penjaga";
import { periksaKelayakan, type SasaranPendaftaran } from "@/server/pendaftaran";

/**
 * Server Action untuk Pendaftaran Kegiatan.
 *
 * Kelayakan diperiksa ulang di sini, bukan dipercayakan pada tampilan tombol.
 * Tombol yang disembunyikan hanyalah kenyamanan; permintaan tetap bisa dikirim
 * langsung, dan di sinilah penolakannya benar-benar terjadi.
 */

function bacaSasaran(data: FormData): SasaranPendaftaran | null {
  const jenis = String(data.get("jenis") ?? "");
  const id = String(data.get("id") ?? "");
  if (!id) return null;
  if (jenis === "agenda") return { jenis: "agenda", id };
  if (jenis === "peluang") return { jenis: "peluang", id };
  return null;
}

export async function daftarKegiatan(data: FormData): Promise<HasilAksi> {
  try {
    // Hanya pemuda yang mendaftar kegiatan; pengelola memakai akunnya untuk
    // menyelenggarakan, bukan mengikuti.
    const aktor = await wajibAktor("pemuda");

    const sasaran = bacaSasaran(data);
    if (!sasaran) return { ok: false, pesan: "Kegiatan tidak dikenali." };

    const kelayakan = await periksaKelayakan(aktor.id, sasaran);
    if (!kelayakan.boleh) return { ok: false, pesan: kelayakan.alasan };

    const kunci =
      sasaran.jenis === "agenda"
        ? { agendaId: sasaran.id }
        : { peluangId: sasaran.id };

    const sudah = await prisma.pendaftaran.findFirst({
      where: { userId: aktor.id, ...kunci },
      select: { id: true },
    });
    if (sudah) return { ok: false, pesan: "Anda sudah terdaftar pada kegiatan ini." };

    const pendaftaran = await prisma.pendaftaran.create({
      data: { userId: aktor.id, ...kunci },
      select: { id: true },
    });

    await catat({
      aktorId: aktor.id,
      aksi: "pendaftaran.daftar",
      sasaran: sasaran.jenis,
      sasaranId: sasaran.id,
      rincian: { pendaftaranId: pendaftaran.id },
    });

    revalidatePath(`/${sasaran.jenis}`);
    revalidatePath("/pemuda");
    revalidatePath("/pemuda/kegiatan");
    return { ok: true };
  } catch (e) {
    if (e instanceof GagalIzin) return { ok: false, pesan: e.message };
    console.error("[pendaftaran.daftar]", e);
    return { ok: false, pesan: "Terjadi kesalahan saat mendaftar." };
  }
}

export async function batalkanPendaftaran(pendaftaranId: string): Promise<HasilAksi> {
  try {
    const aktor = await wajibAktor("pemuda");

    const pendaftaran = await prisma.pendaftaran.findUnique({
      where: { id: pendaftaranId },
      select: { userId: true, status: true, agendaId: true, peluangId: true },
    });
    if (!pendaftaran || pendaftaran.userId !== aktor.id) {
      return { ok: false, pesan: "Pendaftaran tidak ditemukan." };
    }
    if (pendaftaran.status === "HADIR") {
      return {
        ok: false,
        pesan: "Kehadiran Anda sudah tercatat, pendaftaran tidak dapat dibatalkan.",
      };
    }

    await prisma.pendaftaran.delete({ where: { id: pendaftaranId } });

    await catat({
      aktorId: aktor.id,
      aksi: "pendaftaran.batal",
      sasaran: pendaftaran.agendaId ? "agenda" : "peluang",
      sasaranId: pendaftaran.agendaId ?? pendaftaran.peluangId ?? undefined,
    });

    revalidatePath("/pemuda");
    revalidatePath("/pemuda/kegiatan");
    return { ok: true };
  } catch (e) {
    if (e instanceof GagalIzin) return { ok: false, pesan: e.message };
    console.error("[pendaftaran.batal]", e);
    return { ok: false, pesan: "Terjadi kesalahan." };
  }
}

const STATUS_SAH = ["MENUNGGU", "DITERIMA", "DITOLAK", "HADIR"] as const;
type StatusPeserta = (typeof STATUS_SAH)[number];

export async function ubahStatusPeserta(
  pendaftaranId: string,
  status: string,
): Promise<HasilAksi> {
  try {
    const aktor = await wajibAktor(...PENGELOLA_ISI);

    if (!(STATUS_SAH as readonly string[]).includes(status)) {
      return { ok: false, pesan: "Status tidak dikenali." };
    }

    const pendaftaran = await prisma.pendaftaran.findUnique({
      where: { id: pendaftaranId },
      select: {
        id: true,
        agenda: { select: { id: true, pembuatId: true } },
        peluang: { select: { id: true, pembuatId: true } },
      },
    });
    if (!pendaftaran) return { ok: false, pesan: "Pendaftaran tidak ditemukan." };

    // Hanya penyelenggara kegiatan itu sendiri (atau dinas) yang boleh
    // mengubah status pesertanya.
    const pemilikId =
      pendaftaran.agenda?.pembuatId ?? pendaftaran.peluang?.pembuatId ?? null;
    if (!pemilikId || !bolehMengubah(aktor, pemilikId)) {
      return { ok: false, pesan: "Kegiatan ini bukan milik Anda." };
    }

    await prisma.pendaftaran.update({
      where: { id: pendaftaranId },
      data: { status: status as StatusPeserta },
    });

    await catat({
      aktorId: aktor.id,
      aksi: "pendaftaran.ubahStatus",
      sasaran: "pendaftaran",
      sasaranId: pendaftaranId,
      rincian: { status },
    });

    revalidatePath("/kelola");
    return { ok: true };
  } catch (e) {
    if (e instanceof GagalIzin) return { ok: false, pesan: e.message };
    console.error("[pendaftaran.ubahStatus]", e);
    return { ok: false, pesan: "Terjadi kesalahan." };
  }
}
