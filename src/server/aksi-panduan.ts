"use server";

import { revalidatePath } from "next/cache";

import { mintaPanduan } from "@/lib/minimax";
import {
  PERTANYAAN,
  susunPermintaan,
  SISTEM,
  type Jawaban,
  type RingkasProfil,
} from "@/lib/panduan";
import { prisma } from "@/lib/prisma";
import { umur } from "@/lib/profil";
import type { HasilAksi } from "@/lib/validasi";
import { catat } from "@/server/audit";
import { GagalIzin, wajibAktor } from "@/server/penjaga";

/**
 * Server Action Panduan Karier.
 *
 * Urutannya sama seperti kanal lain dan tidak boleh dibalik:
 *   1. periksa peran   2. periksa masukan   3. periksa kepemilikan
 *   4. ubah basis data 5. catat jejak audit
 *
 * Satu langkah tambahan disisipkan sebelum menyimpan: pembatasan sekali sehari.
 * Setiap panggilan memakan waktu enam sampai delapan detik dan menghabiskan
 * kuota model. Tanpa batas, satu orang dapat menekan tombolnya lima puluh kali
 * dan mengeringkan kuncinya untuk semua orang.
 */

/** Semua peran boleh punya Kartu Talenta, jadi semuanya boleh mengisi ini. */
const PENGISI = ["pemuda", "organisasi", "dinas", "superadmin"] as const;

const BELUM_ADA_PROFIL =
  "Lengkapi Kartu Talenta Anda lebih dahulu — panduan disusun dari data di sana.";

/**
 * Membaca jawaban survei dari FormData.
 *
 * Dituntun oleh daftar PERTANYAAN, bukan oleh nama kolom yang diketik ulang di
 * sini. Menambah pertanyaan di src/lib/panduan.ts otomatis ikut terbaca, dan
 * tidak mungkin ada kolom formulir yang diam-diam tidak pernah dibaca —
 * kesalahan yang persis pernah terjadi pada foto profil.
 */
function bacaJawaban(data: FormData): { jawaban: Jawaban; kurang: string[] } {
  const jawaban: Jawaban = {};
  const kurang: string[] = [];

  for (const p of PERTANYAAN) {
    if (p.jenis === "banyak") {
      const nilai = data
        .getAll(p.nama)
        .map((v) => String(v))
        .filter(Boolean);
      // Kendala boleh kosong: "tidak ada kendala" itu jawaban yang sah.
      jawaban[p.nama] = nilai;
      continue;
    }

    const nilai = String(data.get(p.nama) ?? "").trim();
    if (nilai === "") {
      kurang.push(p.nama);
      continue;
    }

    // Pilihan yang tidak ada di daftar ditolak, bukan dibiarkan lewat ke
    // model. Nilai karangan akan masuk ke prompt apa adanya.
    if (p.jenis === "pilih" && !p.pilihan?.some((o) => o.nilai === nilai)) {
      kurang.push(p.nama);
      continue;
    }

    jawaban[p.nama] = nilai;
  }

  return { jawaban, kurang };
}

/** Rangkuman Kartu Talenta, dibentuk di peladen dan tidak pernah ditanyakan. */
function ringkas(
  profil: {
    tanggalLahir: Date | null;
    kecamatan: { nama: string } | null;
    sekolah: { nama: string } | null;
    minat: { nama: string }[];
    keterampilan: { nama: string }[];
    prestasi: { judul: string; tingkat: string }[];
  },
  keanggotaan: { organisasi: { nama: string } }[],
): RingkasProfil {
  return {
    usia: profil.tanggalLahir ? umur(profil.tanggalLahir) : null,
    kecamatan: profil.kecamatan?.nama ?? null,
    sekolah: profil.sekolah?.nama ?? null,
    minat: profil.minat.map((m) => m.nama),
    keterampilan: profil.keterampilan.map((k) => k.nama),
    prestasi: profil.prestasi.map((p) => `${p.judul} (tingkat ${p.tingkat.toLowerCase()})`),
    organisasi: keanggotaan.map((k) => k.organisasi.nama),
  };
}

export async function buatPanduan(data: FormData): Promise<HasilAksi> {
  try {
    const aktor = await wajibAktor(...PENGISI);

    const { jawaban, kurang } = bacaJawaban(data);
    if (kurang.length > 0) {
      return {
        ok: false,
        pesan: `Masih ada ${kurang.length} pertanyaan yang belum dijawab.`,
      };
    }

    // Keanggotaan menempel pada akun, bukan pada profil, sehingga tidak dapat
    // ikut di dalam satu select. Dibaca sejajar supaya tetap satu tarikan.
    const [profil, keanggotaan] = await Promise.all([
      prisma.profilPemuda.findUnique({
        where: { userId: aktor.id },
        select: {
          id: true,
          slug: true,
          tanggalLahir: true,
          kecamatan: { select: { nama: true } },
          sekolah: { select: { nama: true } },
          minat: { select: { nama: true } },
          keterampilan: { select: { nama: true } },
          prestasi: { select: { judul: true, tingkat: true }, take: 10 },
        },
      }),
      prisma.keanggotaan.findMany({
        where: { userId: aktor.id, status: "TERVERIFIKASI" },
        select: { organisasi: { select: { nama: true } } },
        take: 10,
      }),
    ]);
    if (!profil) return { ok: false, pesan: BELUM_ADA_PROFIL };

    // Sekali sehari. Dihitung dari dua puluh empat jam terakhir, bukan dari
    // pergantian tanggal — supaya yang mengisi pukul 23.50 tidak mendapat
    // jatah kedua sepuluh menit kemudian.
    const sehariLalu = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const terbaru = await prisma.panduanKarier.findFirst({
      where: { profilId: profil.id, dibuatPada: { gte: sehariLalu } },
      select: { id: true },
    });
    if (terbaru) {
      return {
        ok: false,
        pesan:
          "Panduan Anda sudah dibuat dalam sehari terakhir. Bacalah yang sudah ada, atau coba lagi besok.",
      };
    }

    const hasil = await mintaPanduan(
      SISTEM,
      susunPermintaan(jawaban, ringkas(profil, keanggotaan)),
    );
    if (!hasil.ok) {
      // Kegagalan model TIDAK dicatat sebagai jejak audit: ia bukan tindakan
      // pengelolaan, dan mencatatnya hanya akan menenggelamkan jejak yang
      // penting. Sebabnya sudah tercatat di log peladen oleh kliennya.
      return { ok: false, pesan: hasil.pesan };
    }

    const baris = await prisma.panduanKarier.create({
      data: {
        profilId: profil.id,
        jawaban: jawaban as object,
        hasil: hasil.teks,
        model: hasil.model,
      },
      select: { id: true },
    });

    await catat({
      aktorId: aktor.id,
      aksi: "panduan.buat",
      sasaran: "panduanKarier",
      sasaranId: baris.id,
      // Jawabannya sendiri tidak ikut dicatat. Ia memuat kendala biaya dan
      // dukungan keluarga — keterangan pribadi yang tidak ada urusannya
      // dengan pengawasan, dan jejak audit dapat dibaca superadmin.
      rincian: { model: hasil.model, panjang: hasil.teks.length },
    });

    revalidatePath("/pemuda/panduan");
    return { ok: true };
  } catch (e) {
    if (e instanceof GagalIzin) return { ok: false, pesan: e.message };
    console.error("[panduan.buat]", e);
    return { ok: false, pesan: "Terjadi kesalahan. Coba lagi." };
  }
}
