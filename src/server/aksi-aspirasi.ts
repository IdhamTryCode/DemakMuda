"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { AspirasiSkema, TanggapanSkema, galatKolom, type HasilAksi } from "@/lib/validasi";
import { catat } from "@/server/audit";
import { GagalIzin, wajibAktor } from "@/server/penjaga";

/**
 * Server Action untuk Ruang Aspirasi.
 *
 * Aspirasi berbeda dari kanal lain: isinya TIDAK PERNAH publik. Hanya
 * pengirimnya sendiri dan dinas yang boleh membacanya. Karena itu tidak ada
 * satu pun revalidatePath ke halaman publik di berkas ini — kalau suatu saat
 * ada, itu tanda ada kebocoran yang perlu diperiksa.
 */

/** Jeda antar-kiriman, penahan banjir aspirasi dari satu akun. */
const JEDA_KIRIM_MENIT = 5;
/** Batas kiriman per akun dalam sehari. */
const BATAS_HARIAN = 5;

export async function kirimAspirasi(data: FormData): Promise<HasilAksi> {
  try {
    const aktor = await wajibAktor("pemuda");

    const hasil = AspirasiSkema.safeParse({
      judul: String(data.get("judul") ?? ""),
      isi: String(data.get("isi") ?? ""),
    });
    if (!hasil.success) {
      return { ok: false, pesan: "Periksa kembali isian.", kolom: galatKolom(hasil.error) };
    }
    const n = hasil.data;

    const sekarang = new Date();
    const terakhir = await prisma.aspirasi.findFirst({
      where: { pengirimId: aktor.id },
      orderBy: { dibuatPada: "desc" },
      select: { dibuatPada: true },
    });
    if (terakhir) {
      const jedaMenit = (sekarang.getTime() - terakhir.dibuatPada.getTime()) / 60000;
      if (jedaMenit < JEDA_KIRIM_MENIT) {
        return {
          ok: false,
          pesan: `Beri jeda ${JEDA_KIRIM_MENIT} menit antar-aspirasi. Coba lagi sebentar lagi.`,
        };
      }
    }

    const sehariLalu = new Date(sekarang.getTime() - 24 * 60 * 60 * 1000);
    const hariIni = await prisma.aspirasi.count({
      where: { pengirimId: aktor.id, dibuatPada: { gte: sehariLalu } },
    });
    if (hariIni >= BATAS_HARIAN) {
      return {
        ok: false,
        pesan: `Anda sudah mengirim ${BATAS_HARIAN} aspirasi hari ini. Silakan lanjutkan besok.`,
      };
    }

    const aspirasi = await prisma.aspirasi.create({
      data: { judul: n.judul, isi: n.isi, pengirimId: aktor.id },
      select: { id: true },
    });

    // Judulnya saja yang dicatat. Isi aspirasi tidak masuk jejak audit supaya
    // tidak tersalin ke tabel yang lebih longgar aturan bacanya.
    await catat({
      aktorId: aktor.id,
      aksi: "aspirasi.kirim",
      sasaran: "aspirasi",
      sasaranId: aspirasi.id,
      rincian: { judul: n.judul },
    });

    revalidatePath("/pemuda/aspirasi");
    revalidatePath("/kelola/aspirasi");
    return { ok: true };
  } catch (e) {
    if (e instanceof GagalIzin) return { ok: false, pesan: e.message };
    console.error("[aspirasi.kirim]", e);
    return { ok: false, pesan: "Terjadi kesalahan saat mengirim." };
  }
}

export async function tanggapiAspirasi(id: string, data: FormData): Promise<HasilAksi> {
  try {
    // Organisasi sengaja tidak masuk daftar ini. Aspirasi ditujukan kepada
    // dinas, dan membiarkan pengelola organisasi membacanya berarti membuka
    // keluhan warga kepada pihak yang mungkin justru dikeluhkan.
    const aktor = await wajibAktor("dinas", "superadmin");

    const hasil = TanggapanSkema.safeParse({
      status: String(data.get("status") ?? "BARU"),
      tanggapan: String(data.get("tanggapan") ?? ""),
    });
    if (!hasil.success) {
      return { ok: false, pesan: "Periksa kembali isian.", kolom: galatKolom(hasil.error) };
    }
    const n = hasil.data;

    const lama = await prisma.aspirasi.findUnique({
      where: { id },
      select: { id: true, judul: true, status: true },
    });
    if (!lama) return { ok: false, pesan: "Aspirasi tidak ditemukan." };

    const adaTanggapan = Boolean(n.tanggapan);
    await prisma.aspirasi.update({
      where: { id },
      data: {
        status: n.status,
        tanggapan: n.tanggapan || null,
        ditanggapiPada: adaTanggapan ? new Date() : null,
        penanggapId: adaTanggapan ? aktor.id : null,
      },
    });

    await catat({
      aktorId: aktor.id,
      aksi: "aspirasi.tanggapi",
      sasaran: "aspirasi",
      sasaranId: id,
      rincian: { judul: lama.judul, statusLama: lama.status, statusBaru: n.status },
    });

    revalidatePath("/kelola/aspirasi");
    revalidatePath("/pemuda/aspirasi");
    return { ok: true };
  } catch (e) {
    if (e instanceof GagalIzin) return { ok: false, pesan: e.message };
    console.error("[aspirasi.tanggapi]", e);
    return { ok: false, pesan: "Terjadi kesalahan saat menyimpan." };
  }
}
