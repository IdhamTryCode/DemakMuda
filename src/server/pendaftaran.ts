import "server-only";

import { prisma } from "@/lib/prisma";
import { umur } from "@/lib/profil";

/**
 * Aturan kelayakan mendaftar, dipakai bersama oleh halaman (untuk menentukan
 * tampilan tombol) dan Server Action (untuk menegakkannya). Satu sumber aturan,
 * supaya yang terlihat di layar dan yang ditegakkan server tidak pernah beda.
 */

export type Kelayakan =
  | { boleh: true }
  | { boleh: false; alasan: string };

/**
 * Kegiatan khusus anggota hanya boleh diikuti anggota yang keanggotaannya
 * sudah disetujui pengurus. Pengajuan yang masih menunggu belum cukup —
 * kalau cukup, siapa pun bisa mengajukan diri lima menit sebelum acara dan
 * pembatasannya kehilangan arti.
 */
async function bolehSebagaiAnggota(
  userId: string,
  kegiatan: { khususAnggota: boolean; organisasiId: string | null },
): Promise<Kelayakan> {
  if (!kegiatan.khususAnggota) return { boleh: true };

  if (!kegiatan.organisasiId) {
    // Tidak seharusnya terjadi — skema menolaknya saat disimpan. Bila toh
    // ada, kegiatannya ditutup, bukan dibuka untuk semua orang.
    return { boleh: false, alasan: "Kegiatan ini belum punya organisasi penyelenggara." };
  }

  const anggota = await prisma.keanggotaan.findUnique({
    where: {
      organisasiId_userId: { organisasiId: kegiatan.organisasiId, userId },
    },
    select: { status: true },
  });
  if (anggota?.status === "TERVERIFIKASI") return { boleh: true };

  return {
    boleh: false,
    alasan:
      anggota?.status === "MENUNGGU"
        ? "Kegiatan ini khusus anggota. Pengajuan keanggotaan Anda masih menunggu persetujuan pengurus."
        : "Kegiatan ini khusus anggota organisasi penyelenggaranya.",
  };
}

export type SasaranPendaftaran =
  | { jenis: "agenda"; id: string }
  | { jenis: "peluang"; id: string };

export async function periksaKelayakan(
  userId: string,
  sasaran: SasaranPendaftaran,
  sekarang: Date = new Date(),
): Promise<Kelayakan> {
  const profil = await prisma.profilPemuda.findUnique({
    where: { userId },
    select: { tanggalLahir: true },
  });

  if (sasaran.jenis === "agenda") {
    const agenda = await prisma.agenda.findUnique({
      where: { id: sasaran.id },
      select: {
        status: true,
        mulai: true,
        khususAnggota: true,
        organisasiId: true,
      },
    });
    if (!agenda || agenda.status !== "TERBIT") {
      return { boleh: false, alasan: "Kegiatan ini tidak tersedia." };
    }
    if (agenda.mulai < sekarang) {
      return { boleh: false, alasan: "Kegiatan ini sudah berlangsung." };
    }
    return bolehSebagaiAnggota(userId, agenda);
  }

  const peluang = await prisma.peluang.findUnique({
    where: { id: sasaran.id },
    select: {
      status: true,
      tenggat: true,
      usiaMin: true,
      usiaMaks: true,
      khususAnggota: true,
      organisasiId: true,
    },
  });
  if (!peluang || peluang.status !== "TERBIT") {
    return { boleh: false, alasan: "Peluang ini tidak tersedia." };
  }
  if (peluang.tenggat && peluang.tenggat < sekarang) {
    return { boleh: false, alasan: "Pendaftaran sudah ditutup." };
  }

  const adaBatasUsia = peluang.usiaMin !== null || peluang.usiaMaks !== null;
  if (adaBatasUsia) {
    if (!profil?.tanggalLahir) {
      return {
        boleh: false,
        alasan:
          "Peluang ini punya batas usia. Isi tanggal lahir di Kartu Talenta lebih dulu.",
      };
    }
    const usia = umur(profil.tanggalLahir, sekarang);
    if (peluang.usiaMin !== null && usia < peluang.usiaMin) {
      return { boleh: false, alasan: `Peluang ini untuk usia minimal ${peluang.usiaMin} tahun.` };
    }
    if (peluang.usiaMaks !== null && usia > peluang.usiaMaks) {
      return { boleh: false, alasan: `Peluang ini untuk usia maksimal ${peluang.usiaMaks} tahun.` };
    }
  }

  return bolehSebagaiAnggota(userId, peluang);
}

/** Pendaftaran milik pengguna atas satu agenda atau peluang, bila ada. */
export async function pendaftaranSaya(userId: string, sasaran: SasaranPendaftaran) {
  return prisma.pendaftaran.findFirst({
    where: {
      userId,
      ...(sasaran.jenis === "agenda"
        ? { agendaId: sasaran.id }
        : { peluangId: sasaran.id }),
    },
    select: { id: true, status: true, dibuatPada: true },
  });
}
