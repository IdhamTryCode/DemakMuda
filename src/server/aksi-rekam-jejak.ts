"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import {
  PengalamanSkema,
  PrestasiSkema,
  galatKolom,
  type HasilAksi,
} from "@/lib/validasi";
import { catat } from "@/server/audit";
import { hapusBerkasLama } from "@/server/berkas";
import { GagalIzin, wajibAktor } from "@/server/penjaga";

/**
 * Server Action untuk rekam jejak: pengalaman dan prestasi.
 *
 * Urutannya sama seperti kanal lain dan tidak boleh dibalik:
 *   1. periksa peran   2. periksa masukan   3. periksa kepemilikan
 *   4. ubah basis data 5. catat jejak audit
 *
 * Yang membedakan berkas ini dari kanal lain: TIDAK ADA moderasi dan tidak ada
 * pengesahan. Isinya milik pemiliknya sepenuhnya, dan hanya pemiliknya yang
 * boleh menyentuhnya — dinas sekalipun tidak, karena tidak ada wewenang
 * moderasi yang perlu dijalankan atas isian yang memang jujur disebut isian
 * sendiri. Karena itu di sini dipakai perbandingan userId langsung, bukan
 * bolehMengubah() yang memberi kelonggaran kepada pengelola.
 */

/** Semua peran boleh punya Kartu Talenta, jadi semuanya boleh mengisi ini. */
const PENGISI = ["pemuda", "organisasi", "dinas", "superadmin"] as const;

/** Batas wajar supaya satu profil tidak berubah menjadi daftar tanpa ujung. */
const BATAS_PENGALAMAN = 20;
const BATAS_PRESTASI = 30;

/**
 * Profil pemiliknya, yang harus sudah ada.
 *
 * Rekam jejak menempel pada profil, bukan pada akun. Membuatkan profil
 * diam-diam di sini akan menghasilkan profil tanpa nama dan tanpa wilayah yang
 * pemiliknya tidak pernah tahu sudah terbit di alamat publik.
 */
async function profilAktor(userId: string) {
  return prisma.profilPemuda.findUnique({
    where: { userId },
    select: { id: true, slug: true },
  });
}

const BELUM_ADA_PROFIL =
  "Lengkapi Kartu Talenta Anda lebih dahulu — rekam jejak menempel pada profil itu.";

function segarkan(slug: string) {
  revalidatePath("/pemuda/rekam-jejak");
  revalidatePath(`/p/${slug}`);
}

export async function tambahPengalaman(data: FormData): Promise<HasilAksi> {
  try {
    const aktor = await wajibAktor(...PENGISI);

    const hasil = PengalamanSkema.safeParse({
      judul: String(data.get("judul") ?? ""),
      peran: String(data.get("peran") ?? ""),
      penyelenggara: String(data.get("penyelenggara") ?? ""),
      tahunMulai: String(data.get("tahunMulai") ?? ""),
      tahunSelesai: String(data.get("tahunSelesai") ?? ""),
      keterangan: String(data.get("keterangan") ?? ""),
    });
    if (!hasil.success) {
      return { ok: false, pesan: "Periksa kembali isian.", kolom: galatKolom(hasil.error) };
    }
    const n = hasil.data;

    const profil = await profilAktor(aktor.id);
    if (!profil) return { ok: false, pesan: BELUM_ADA_PROFIL };

    const sudahAda = await prisma.pengalaman.count({ where: { profilId: profil.id } });
    if (sudahAda >= BATAS_PENGALAMAN) {
      return { ok: false, pesan: `Satu profil dibatasi ${BATAS_PENGALAMAN} pengalaman.` };
    }

    const baris = await prisma.pengalaman.create({
      data: {
        profilId: profil.id,
        judul: n.judul,
        peran: n.peran || null,
        penyelenggara: n.penyelenggara || null,
        tahunMulai: n.tahunMulai,
        tahunSelesai: n.tahunSelesai ? Number(n.tahunSelesai) : null,
        keterangan: n.keterangan || null,
      },
      select: { id: true },
    });

    await catat({
      aktorId: aktor.id,
      aksi: "pengalaman.tambah",
      sasaran: "pengalaman",
      sasaranId: baris.id,
      rincian: { judul: n.judul },
    });

    segarkan(profil.slug);
    return { ok: true };
  } catch (e) {
    if (e instanceof GagalIzin) return { ok: false, pesan: e.message };
    console.error("[pengalaman.tambah]", e);
    return { ok: false, pesan: "Terjadi kesalahan. Coba lagi." };
  }
}

export async function hapusPengalaman(data: FormData): Promise<HasilAksi> {
  try {
    const aktor = await wajibAktor(...PENGISI);
    const id = String(data.get("id") ?? "");

    const baris = await prisma.pengalaman.findUnique({
      where: { id },
      select: { id: true, judul: true, profil: { select: { userId: true, slug: true } } },
    });
    if (!baris) return { ok: false, pesan: "Pengalaman tidak ditemukan." };
    if (baris.profil.userId !== aktor.id) {
      return { ok: false, pesan: "Ini bukan rekam jejak Anda." };
    }

    await prisma.pengalaman.delete({ where: { id } });
    await catat({
      aktorId: aktor.id,
      aksi: "pengalaman.hapus",
      sasaran: "pengalaman",
      sasaranId: id,
      rincian: { judul: baris.judul },
    });

    segarkan(baris.profil.slug);
    return { ok: true };
  } catch (e) {
    if (e instanceof GagalIzin) return { ok: false, pesan: e.message };
    console.error("[pengalaman.hapus]", e);
    return { ok: false, pesan: "Terjadi kesalahan. Coba lagi." };
  }
}

export async function tambahPrestasi(data: FormData): Promise<HasilAksi> {
  try {
    const aktor = await wajibAktor(...PENGISI);

    const hasil = PrestasiSkema.safeParse({
      judul: String(data.get("judul") ?? ""),
      tingkat: String(data.get("tingkat") ?? ""),
      peringkat: String(data.get("peringkat") ?? ""),
      penyelenggara: String(data.get("penyelenggara") ?? ""),
      tahun: String(data.get("tahun") ?? ""),
      buktiUrl: String(data.get("buktiUrl") ?? ""),
    });
    if (!hasil.success) {
      return { ok: false, pesan: "Periksa kembali isian.", kolom: galatKolom(hasil.error) };
    }
    const n = hasil.data;

    const profil = await profilAktor(aktor.id);
    if (!profil) return { ok: false, pesan: BELUM_ADA_PROFIL };

    const sudahAda = await prisma.prestasi.count({ where: { profilId: profil.id } });
    if (sudahAda >= BATAS_PRESTASI) {
      return { ok: false, pesan: `Satu profil dibatasi ${BATAS_PRESTASI} prestasi.` };
    }

    const baris = await prisma.prestasi.create({
      data: {
        profilId: profil.id,
        judul: n.judul,
        tingkat: n.tingkat,
        peringkat: n.peringkat || null,
        penyelenggara: n.penyelenggara || null,
        tahun: n.tahun,
        buktiUrl: n.buktiUrl || null,
      },
      select: { id: true },
    });

    await catat({
      aktorId: aktor.id,
      aksi: "prestasi.tambah",
      sasaran: "prestasi",
      sasaranId: baris.id,
      rincian: { judul: n.judul, tingkat: n.tingkat, berbukti: Boolean(n.buktiUrl) },
    });

    segarkan(profil.slug);
    return { ok: true };
  } catch (e) {
    if (e instanceof GagalIzin) return { ok: false, pesan: e.message };
    console.error("[prestasi.tambah]", e);
    return { ok: false, pesan: "Terjadi kesalahan. Coba lagi." };
  }
}

export async function hapusPrestasi(data: FormData): Promise<HasilAksi> {
  try {
    const aktor = await wajibAktor(...PENGISI);
    const id = String(data.get("id") ?? "");

    const baris = await prisma.prestasi.findUnique({
      where: { id },
      select: {
        id: true,
        judul: true,
        buktiUrl: true,
        profil: { select: { userId: true, slug: true } },
      },
    });
    if (!baris) return { ok: false, pesan: "Prestasi tidak ditemukan." };
    if (baris.profil.userId !== aktor.id) {
      return { ok: false, pesan: "Ini bukan rekam jejak Anda." };
    }

    await prisma.prestasi.delete({ where: { id } });

    // Buktinya ikut dihapus dari penyimpanan. Piagam yang tertinggal di store
    // publik setelah pemiliknya menghapus prestasinya bukan sekadar sampah.
    await hapusBerkasLama(baris.buktiUrl, null);

    await catat({
      aktorId: aktor.id,
      aksi: "prestasi.hapus",
      sasaran: "prestasi",
      sasaranId: id,
      rincian: { judul: baris.judul },
    });

    segarkan(baris.profil.slug);
    return { ok: true };
  } catch (e) {
    if (e instanceof GagalIzin) return { ok: false, pesan: e.message };
    console.error("[prestasi.hapus]", e);
    return { ok: false, pesan: "Terjadi kesalahan. Coba lagi." };
  }
}
