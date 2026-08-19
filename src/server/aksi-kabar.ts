"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { slugUnik } from "@/lib/teks";
import { BeritaSkema, galatKolom, type HasilAksi } from "@/lib/validasi";
import { catat } from "@/server/audit";
import {
  bolehMengubah,
  GagalIzin,
  PENGELOLA_ISI,
  wajibAktor,
} from "@/server/penjaga";

/**
 * Server Action untuk Kabar Demak.
 *
 * Urutannya selalu sama dan tidak boleh dibalik:
 *   1. periksa peran   2. periksa masukan   3. periksa kepemilikan
 *   4. ubah basis data 5. catat jejak audit
 */

function bacaFormulir(data: FormData) {
  return {
    judul: String(data.get("judul") ?? ""),
    ringkasan: String(data.get("ringkasan") ?? ""),
    isi: String(data.get("isi") ?? ""),
    gambarUrl: String(data.get("gambarUrl") ?? ""),
    status: String(data.get("status") ?? "DRAF"),
  };
}

export async function buatKabar(data: FormData): Promise<HasilAksi> {
  try {
    const aktor = await wajibAktor(...PENGELOLA_ISI);

    const hasil = BeritaSkema.safeParse(bacaFormulir(data));
    if (!hasil.success) {
      return { ok: false, pesan: "Periksa kembali isian.", kolom: galatKolom(hasil.error) };
    }
    const n = hasil.data;

    const kabar = await prisma.berita.create({
      data: {
        judul: n.judul,
        slug: slugUnik(n.judul),
        ringkasan: n.ringkasan,
        isi: n.isi,
        gambarUrl: n.gambarUrl || null,
        status: n.status,
        terbitPada: n.status === "TERBIT" ? new Date() : null,
        penulisId: aktor.id,
      },
      select: { id: true, slug: true },
    });

    await catat({
      aktorId: aktor.id,
      aksi: n.status === "TERBIT" ? "kabar.terbit" : "kabar.buat",
      sasaran: "berita",
      sasaranId: kabar.id,
      rincian: { judul: n.judul },
    });

    revalidatePath("/kabar");
    revalidatePath("/kelola/kabar");
    return { ok: true };
  } catch (e) {
    if (e instanceof GagalIzin) return { ok: false, pesan: e.message };
    console.error("[kabar.buat]", e);
    return { ok: false, pesan: "Terjadi kesalahan saat menyimpan." };
  }
}

export async function ubahKabar(id: string, data: FormData): Promise<HasilAksi> {
  try {
    const aktor = await wajibAktor(...PENGELOLA_ISI);

    const hasil = BeritaSkema.safeParse(bacaFormulir(data));
    if (!hasil.success) {
      return { ok: false, pesan: "Periksa kembali isian.", kolom: galatKolom(hasil.error) };
    }
    const n = hasil.data;

    const lama = await prisma.berita.findUnique({
      where: { id },
      select: { id: true, penulisId: true, status: true, terbitPada: true },
    });
    if (!lama) return { ok: false, pesan: "Kabar tidak ditemukan." };
    if (!bolehMengubah(aktor, lama.penulisId)) {
      return { ok: false, pesan: "Kabar ini bukan milik Anda." };
    }

    await prisma.berita.update({
      where: { id },
      data: {
        judul: n.judul,
        ringkasan: n.ringkasan,
        isi: n.isi,
        gambarUrl: n.gambarUrl || null,
        status: n.status,
        // Tanggal terbit ditetapkan sekali saat pertama kali diterbitkan,
        // supaya menyunting kabar lama tidak melompatkannya ke urutan teratas.
        terbitPada:
          n.status === "TERBIT" ? (lama.terbitPada ?? new Date()) : lama.terbitPada,
      },
    });

    await catat({
      aktorId: aktor.id,
      aksi: "kabar.ubah",
      sasaran: "berita",
      sasaranId: id,
      rincian: { judul: n.judul, statusLama: lama.status, statusBaru: n.status },
    });

    revalidatePath("/kabar");
    revalidatePath("/kelola/kabar");
    return { ok: true };
  } catch (e) {
    if (e instanceof GagalIzin) return { ok: false, pesan: e.message };
    console.error("[kabar.ubah]", e);
    return { ok: false, pesan: "Terjadi kesalahan saat menyimpan." };
  }
}

export async function arsipkanKabar(id: string): Promise<HasilAksi> {
  try {
    const aktor = await wajibAktor(...PENGELOLA_ISI);

    const lama = await prisma.berita.findUnique({
      where: { id },
      select: { penulisId: true, judul: true },
    });
    if (!lama) return { ok: false, pesan: "Kabar tidak ditemukan." };
    if (!bolehMengubah(aktor, lama.penulisId)) {
      return { ok: false, pesan: "Kabar ini bukan milik Anda." };
    }

    // Diarsipkan, bukan dihapus: tautan yang sudah tersebar tetap dapat
    // ditelusuri, dan jejak kegiatan tidak hilang dari riwayat.
    await prisma.berita.update({ where: { id }, data: { status: "ARSIP" } });

    await catat({
      aktorId: aktor.id,
      aksi: "kabar.arsip",
      sasaran: "berita",
      sasaranId: id,
      rincian: { judul: lama.judul },
    });

    revalidatePath("/kabar");
    revalidatePath("/kelola/kabar");
    return { ok: true };
  } catch (e) {
    if (e instanceof GagalIzin) return { ok: false, pesan: e.message };
    console.error("[kabar.arsip]", e);
    return { ok: false, pesan: "Terjadi kesalahan." };
  }
}
