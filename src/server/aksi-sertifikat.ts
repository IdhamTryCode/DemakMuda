"use server";

import { revalidatePath } from "next/cache";

import { buatKodeSertifikat } from "@/lib/kode-sertifikat";
import { prisma } from "@/lib/prisma";
import type { HasilAksi } from "@/lib/validasi";
import { catat } from "@/server/audit";
import { kirimNotifikasi } from "@/server/notifikasi";
import { bolehMengubah, GagalIzin, PENGELOLA_ISI, wajibAktor } from "@/server/penjaga";

/**
 * Server Action untuk Rekam Prestasi.
 *
 * Sertifikat tidak pernah dihapus, hanya dibatalkan, supaya kode yang sudah
 * tercetak di lembar fisik tetap dapat ditelusuri dan hasil pemeriksaannya
 * jujur: "pernah terbit, lalu dibatalkan" berbeda dari "tidak pernah ada".
 */

/** Mencari kode yang belum terpakai. Tabrakan sangat kecil kemungkinannya. */
async function kodeBelumTerpakai(): Promise<string> {
  for (let i = 0; i < 10; i++) {
    const kode = buatKodeSertifikat();
    const ada = await prisma.sertifikat.findUnique({
      where: { kode },
      select: { id: true },
    });
    if (!ada) return kode;
  }
  throw new Error("Gagal membuat kode sertifikat yang unik.");
}

export async function terbitkanSertifikat(data: FormData): Promise<HasilAksi> {
  try {
    const aktor = await wajibAktor(...PENGELOLA_ISI);

    const pendaftaranId = String(data.get("pendaftaranId") ?? "");
    const judul = String(data.get("judul") ?? "").trim();
    const peringkat = String(data.get("peringkat") ?? "").trim();

    if (judul.length < 6 || judul.length > 160) {
      return { ok: false, pesan: "Judul sertifikat 6 sampai 160 karakter." };
    }
    if (peringkat.length > 60) {
      return { ok: false, pesan: "Peringkat maksimal 60 karakter." };
    }

    const pendaftaran = await prisma.pendaftaran.findUnique({
      where: { id: pendaftaranId },
      select: {
        id: true,
        userId: true,
        status: true,
        sertifikat: { select: { id: true } },
        agenda: { select: { pembuatId: true, organisasiId: true } },
        peluang: { select: { pembuatId: true, organisasiId: true } },
      },
    });
    if (!pendaftaran) return { ok: false, pesan: "Pendaftaran tidak ditemukan." };

    const pemilikId =
      pendaftaran.agenda?.pembuatId ?? pendaftaran.peluang?.pembuatId ?? null;
    if (!pemilikId || !bolehMengubah(aktor, pemilikId)) {
      return { ok: false, pesan: "Kegiatan ini bukan milik Anda." };
    }

    // Sertifikat hanya untuk peserta yang kehadirannya sudah dicatat panitia.
    // Tanpa syarat ini, nilai sertifikat sebagai bukti ikut kegiatan hilang.
    if (pendaftaran.status !== "HADIR") {
      return {
        ok: false,
        pesan: "Tandai kehadiran peserta lebih dulu sebelum menerbitkan sertifikat.",
      };
    }
    if (pendaftaran.sertifikat) {
      return { ok: false, pesan: "Peserta ini sudah punya sertifikat untuk kegiatan ini." };
    }

    const kode = await kodeBelumTerpakai();
    const sertifikat = await prisma.sertifikat.create({
      data: {
        kode,
        judul,
        peringkat: peringkat || null,
        penerimaId: pendaftaran.userId,
        penerbitId: aktor.id,
        organisasiId:
          pendaftaran.agenda?.organisasiId ?? pendaftaran.peluang?.organisasiId ?? null,
        pendaftaranId: pendaftaran.id,
      },
      select: { id: true, kode: true },
    });

    await catat({
      aktorId: aktor.id,
      aksi: "sertifikat.terbit",
      sasaran: "sertifikat",
      sasaranId: sertifikat.id,
      rincian: { kode: sertifikat.kode, judul, penerimaId: pendaftaran.userId },
    });

    await kirimNotifikasi({
      penerimaId: pendaftaran.userId,
      jenis: "SERTIFIKAT_TERBIT",
      judul: "Sertifikat Anda terbit",
      pesan: `${judul} — kode ${sertifikat.kode}`,
      tautan: `/cek/${sertifikat.kode}`,
    });

    revalidatePath("/kelola");
    revalidatePath("/pemuda");
    return { ok: true };
  } catch (e) {
    if (e instanceof GagalIzin) return { ok: false, pesan: e.message };
    console.error("[sertifikat.terbit]", e);
    return { ok: false, pesan: "Terjadi kesalahan saat menerbitkan." };
  }
}

export async function batalkanSertifikat(
  sertifikatId: string,
  alasan: string,
): Promise<HasilAksi> {
  try {
    const aktor = await wajibAktor(...PENGELOLA_ISI);

    const sertifikat = await prisma.sertifikat.findUnique({
      where: { id: sertifikatId },
      select: {
        id: true,
        kode: true,
        penerbitId: true,
        dibatalkanPada: true,
      },
    });
    if (!sertifikat) return { ok: false, pesan: "Sertifikat tidak ditemukan." };
    if (!bolehMengubah(aktor, sertifikat.penerbitId)) {
      return { ok: false, pesan: "Sertifikat ini bukan terbitan Anda." };
    }
    if (sertifikat.dibatalkanPada) {
      return { ok: false, pesan: "Sertifikat ini sudah dibatalkan." };
    }

    await prisma.sertifikat.update({
      where: { id: sertifikatId },
      data: {
        dibatalkanPada: new Date(),
        alasanPembatalan: alasan.trim().slice(0, 300) || null,
      },
    });

    await catat({
      aktorId: aktor.id,
      aksi: "sertifikat.batal",
      sasaran: "sertifikat",
      sasaranId: sertifikatId,
      rincian: { kode: sertifikat.kode, alasan },
    });

    revalidatePath("/kelola");
    revalidatePath(`/cek/${sertifikat.kode}`);
    return { ok: true };
  } catch (e) {
    if (e instanceof GagalIzin) return { ok: false, pesan: e.message };
    console.error("[sertifikat.batal]", e);
    return { ok: false, pesan: "Terjadi kesalahan." };
  }
}
