"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { slugUnik } from "@/lib/teks";
import { KaryaSkema, galatKolom, type HasilAksi } from "@/lib/validasi";
import { catat } from "@/server/audit";
import { hapusBerkasLama } from "@/server/berkas";
import { kirimNotifikasi } from "@/server/notifikasi";
import { bolehMengubah, GagalIzin, wajibAktor } from "@/server/penjaga";

/**
 * Server Action untuk Ruang Karya.
 *
 * Urutannya sama seperti kanal lain dan tidak boleh dibalik:
 *   1. periksa peran   2. periksa masukan   3. periksa kepemilikan
 *   4. ubah basis data 5. catat jejak audit
 *
 * Bedanya dengan Kabar: pemiliknya pemuda, bukan pengelola isi. Dinas dan
 * superadmin tetap boleh menyentuhnya untuk keperluan moderasi, dan itu
 * ditangani oleh bolehMengubah, bukan oleh cabang khusus di sini.
 */

const PENYUNTING_KARYA = ["pemuda", "dinas", "superadmin"] as const;

function bacaFormulir(data: FormData) {
  return {
    judul: String(data.get("judul") ?? ""),
    jenis: String(data.get("jenis") ?? "LAINNYA"),
    deskripsi: String(data.get("deskripsi") ?? ""),
    gambarUrl: String(data.get("gambarUrl") ?? ""),
    tautanLuar: String(data.get("tautanLuar") ?? ""),
    status: String(data.get("status") ?? "TERBIT"),
  };
}

/** Batas wajar supaya satu akun tidak membanjiri Ruang Karya. */
const BATAS_KARYA = 30;

export async function buatKarya(data: FormData): Promise<HasilAksi> {
  try {
    const aktor = await wajibAktor("pemuda");

    const hasil = KaryaSkema.safeParse(bacaFormulir(data));
    if (!hasil.success) {
      return { ok: false, pesan: "Periksa kembali isian.", kolom: galatKolom(hasil.error) };
    }
    const n = hasil.data;

    const sudahAda = await prisma.karya.count({ where: { pemilikId: aktor.id } });
    if (sudahAda >= BATAS_KARYA) {
      return {
        ok: false,
        pesan: `Satu akun dibatasi ${BATAS_KARYA} karya. Arsipkan yang lama lebih dulu.`,
      };
    }

    const karya = await prisma.karya.create({
      data: {
        judul: n.judul,
        slug: slugUnik(n.judul),
        jenis: n.jenis,
        deskripsi: n.deskripsi,
        gambarUrl: n.gambarUrl || null,
        tautanLuar: n.tautanLuar || null,
        status: n.status,
        pemilikId: aktor.id,
      },
      select: { id: true },
    });

    await catat({
      aktorId: aktor.id,
      aksi: n.status === "TERBIT" ? "karya.terbit" : "karya.buat",
      sasaran: "karya",
      sasaranId: karya.id,
      rincian: { judul: n.judul, jenis: n.jenis },
    });

    revalidatePath("/karya");
    revalidatePath("/pemuda/karya");
    return { ok: true };
  } catch (e) {
    if (e instanceof GagalIzin) return { ok: false, pesan: e.message };
    console.error("[karya.buat]", e);
    return { ok: false, pesan: "Terjadi kesalahan saat menyimpan." };
  }
}

export async function ubahKarya(id: string, data: FormData): Promise<HasilAksi> {
  try {
    const aktor = await wajibAktor(...PENYUNTING_KARYA);

    const hasil = KaryaSkema.safeParse(bacaFormulir(data));
    if (!hasil.success) {
      return { ok: false, pesan: "Periksa kembali isian.", kolom: galatKolom(hasil.error) };
    }
    const n = hasil.data;

    const lama = await prisma.karya.findUnique({
      where: { id },
      select: {
        id: true,
        pemilikId: true,
        slug: true,
        status: true,
        gambarUrl: true,
      },
    });
    // Pesan yang sama untuk "tidak ada" dan "bukan milik Anda": keduanya tidak
    // boleh dipakai menebak karya mana yang ada di basis data.
    if (!lama || !bolehMengubah(aktor, lama.pemilikId)) {
      return { ok: false, pesan: "Karya tidak ditemukan." };
    }

    await prisma.karya.update({
      where: { id },
      data: {
        judul: n.judul,
        jenis: n.jenis,
        deskripsi: n.deskripsi,
        gambarUrl: n.gambarUrl || null,
        tautanLuar: n.tautanLuar || null,
        status: n.status,
      },
    });

    await hapusBerkasLama(lama.gambarUrl, n.gambarUrl || null);

    await catat({
      aktorId: aktor.id,
      aksi: "karya.ubah",
      sasaran: "karya",
      sasaranId: id,
      rincian: { judul: n.judul, statusLama: lama.status, statusBaru: n.status },
    });

    revalidatePath("/karya");
    revalidatePath("/karya/[slug]", "page");
    revalidatePath("/pemuda/karya");
    return { ok: true };
  } catch (e) {
    if (e instanceof GagalIzin) return { ok: false, pesan: e.message };
    console.error("[karya.ubah]", e);
    return { ok: false, pesan: "Terjadi kesalahan saat menyimpan." };
  }
}

export async function arsipkanKarya(id: string): Promise<HasilAksi> {
  try {
    const aktor = await wajibAktor(...PENYUNTING_KARYA);

    const lama = await prisma.karya.findUnique({
      where: { id },
      select: { pemilikId: true, judul: true },
    });
    if (!lama || !bolehMengubah(aktor, lama.pemilikId)) {
      return { ok: false, pesan: "Karya tidak ditemukan." };
    }

    await prisma.karya.update({ where: { id }, data: { status: "ARSIP" } });

    // Hanya bila diturunkan orang lain. Pemilik yang mengarsipkan karyanya
    // sendiri tidak perlu diberi tahu tentang perbuatannya sendiri.
    if (aktor.id !== lama.pemilikId) {
      await kirimNotifikasi({
        penerimaId: lama.pemilikId,
        jenis: "KARYA_DIMODERASI",
        judul: "Karya Anda diturunkan dari etalase",
        pesan: `${lama.judul} tidak lagi tampil di Ruang Karya. Hubungi Dispora bila ingin menanyakan alasannya.`,
        tautan: "/pemuda/karya",
      });
    }

    await catat({
      aktorId: aktor.id,
      aksi: "karya.arsip",
      sasaran: "karya",
      sasaranId: id,
      rincian: { judul: lama.judul, olehPemilik: aktor.id === lama.pemilikId },
    });

    revalidatePath("/karya");
    revalidatePath("/karya/[slug]", "page");
    revalidatePath("/pemuda/karya");
    return { ok: true };
  } catch (e) {
    if (e instanceof GagalIzin) return { ok: false, pesan: e.message };
    console.error("[karya.arsip]", e);
    return { ok: false, pesan: "Terjadi kesalahan." };
  }
}
