"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { keSlug } from "@/lib/teks";
import { galatKolom, OrganisasiSkema, type HasilAksi } from "@/lib/validasi";
import { catat } from "@/server/audit";
import {
  bolehMengubah,
  GagalIzin,
  PENGELOLA_ISI,
  wajibAktor,
} from "@/server/penjaga";

/**
 * Server Action untuk Direktori Organisasi.
 *
 * Organisasi baru selalu berstatus MENUNGGU dan tidak tampil di direktori
 * publik sampai diverifikasi dinas. Tanpa itu, siapa pun bisa mencantumkan
 * organisasi karangan di kanal resmi kabupaten.
 */

async function slugOrganisasiUnik(nama: string, idSendiri?: string): Promise<string> {
  const dasar = keSlug(nama) || "organisasi";
  for (let i = 0; i < 12; i++) {
    const calon = i === 0 ? dasar : `${dasar}-${i + 1}`;
    const dipakai = await prisma.organisasi.findUnique({
      where: { slug: calon },
      select: { id: true },
    });
    if (!dipakai || dipakai.id === idSendiri) return calon;
  }
  return `${dasar}-${Date.now().toString(36)}`;
}

async function wilayahSah(kecamatanId: string, desaId: string) {
  const kecamatan = await prisma.kecamatan.findUnique({
    where: { id: kecamatanId },
    select: { id: true },
  });
  if (!kecamatan) return null;

  const desa = desaId
    ? await prisma.desa.findFirst({
        where: { id: desaId, kecamatanId: kecamatan.id },
        select: { id: true },
      })
    : null;

  return { kecamatanId: kecamatan.id, desaId: desa?.id ?? null };
}

function bacaFormulir(data: FormData) {
  return {
    nama: String(data.get("nama") ?? ""),
    jenis: String(data.get("jenis") ?? ""),
    deskripsi: String(data.get("deskripsi") ?? ""),
    kontak: String(data.get("kontak") ?? ""),
    logoUrl: String(data.get("logoUrl") ?? ""),
    kecamatanId: String(data.get("kecamatanId") ?? ""),
    desaId: String(data.get("desaId") ?? ""),
  };
}

export async function buatOrganisasi(data: FormData): Promise<HasilAksi> {
  try {
    const aktor = await wajibAktor(...PENGELOLA_ISI);

    const hasil = OrganisasiSkema.safeParse(bacaFormulir(data));
    if (!hasil.success) {
      return { ok: false, pesan: "Periksa kembali isian.", kolom: galatKolom(hasil.error) };
    }
    const n = hasil.data;

    const wilayah = await wilayahSah(n.kecamatanId, n.desaId ?? "");
    if (!wilayah) return { ok: false, pesan: "Kecamatan tidak dikenali." };

    const organisasi = await prisma.organisasi.create({
      data: {
        nama: n.nama,
        slug: await slugOrganisasiUnik(n.nama),
        jenis: n.jenis,
        deskripsi: n.deskripsi || null,
        kontak: n.kontak || null,
        logoUrl: n.logoUrl || null,
        kecamatanId: wilayah.kecamatanId,
        desaId: wilayah.desaId,
        pemilikId: aktor.id,
        // Dinas dan superadmin yang mendaftarkan organisasi langsung
        // terverifikasi; selain itu menunggu pemeriksaan.
        statusVerifikasi:
          aktor.peran === "dinas" || aktor.peran === "superadmin"
            ? "TERVERIFIKASI"
            : "MENUNGGU",
      },
      select: { id: true, nama: true },
    });

    await catat({
      aktorId: aktor.id,
      aksi: "organisasi.buat",
      sasaran: "organisasi",
      sasaranId: organisasi.id,
      rincian: { nama: organisasi.nama },
    });

    revalidatePath("/direktori");
    revalidatePath("/direktori/[slug]", "page");
    revalidatePath("/kelola/organisasi");
    return { ok: true };
  } catch (e) {
    if (e instanceof GagalIzin) return { ok: false, pesan: e.message };
    console.error("[organisasi.buat]", e);
    return { ok: false, pesan: "Terjadi kesalahan saat menyimpan." };
  }
}

export async function ubahOrganisasi(id: string, data: FormData): Promise<HasilAksi> {
  try {
    const aktor = await wajibAktor(...PENGELOLA_ISI);

    const hasil = OrganisasiSkema.safeParse(bacaFormulir(data));
    if (!hasil.success) {
      return { ok: false, pesan: "Periksa kembali isian.", kolom: galatKolom(hasil.error) };
    }
    const n = hasil.data;

    const lama = await prisma.organisasi.findUnique({
      where: { id },
      select: { pemilikId: true, nama: true },
    });
    if (!lama) return { ok: false, pesan: "Organisasi tidak ditemukan." };
    if (!bolehMengubah(aktor, lama.pemilikId)) {
      return { ok: false, pesan: "Organisasi ini bukan milik Anda." };
    }

    const wilayah = await wilayahSah(n.kecamatanId, n.desaId ?? "");
    if (!wilayah) return { ok: false, pesan: "Kecamatan tidak dikenali." };

    await prisma.organisasi.update({
      where: { id },
      data: {
        nama: n.nama,
        slug: await slugOrganisasiUnik(n.nama, id),
        jenis: n.jenis,
        deskripsi: n.deskripsi || null,
        kontak: n.kontak || null,
        logoUrl: n.logoUrl || null,
        kecamatanId: wilayah.kecamatanId,
        desaId: wilayah.desaId,
      },
    });

    await catat({
      aktorId: aktor.id,
      aksi: "organisasi.ubah",
      sasaran: "organisasi",
      sasaranId: id,
      rincian: { nama: n.nama },
    });

    revalidatePath("/direktori");
    revalidatePath("/direktori/[slug]", "page");
    revalidatePath("/kelola/organisasi");
    return { ok: true };
  } catch (e) {
    if (e instanceof GagalIzin) return { ok: false, pesan: e.message };
    console.error("[organisasi.ubah]", e);
    return { ok: false, pesan: "Terjadi kesalahan saat menyimpan." };
  }
}

/** Verifikasi organisasi — hanya dinas dan superadmin. */
export async function verifikasiOrganisasi(
  id: string,
  keputusan: "TERVERIFIKASI" | "DITOLAK",
): Promise<HasilAksi> {
  try {
    const aktor = await wajibAktor("dinas", "superadmin");

    const organisasi = await prisma.organisasi.findUnique({
      where: { id },
      select: { nama: true },
    });
    if (!organisasi) return { ok: false, pesan: "Organisasi tidak ditemukan." };

    await prisma.organisasi.update({
      where: { id },
      data: {
        statusVerifikasi: keputusan,
      },
    });

    await catat({
      aktorId: aktor.id,
      aksi: `organisasi.${keputusan === "TERVERIFIKASI" ? "verifikasi" : "tolak"}`,
      sasaran: "organisasi",
      sasaranId: id,
      rincian: { nama: organisasi.nama },
    });

    revalidatePath("/direktori");
    revalidatePath("/direktori/[slug]", "page");
    revalidatePath("/kelola/organisasi");
    return { ok: true };
  } catch (e) {
    if (e instanceof GagalIzin) return { ok: false, pesan: e.message };
    console.error("[organisasi.verifikasi]", e);
    return { ok: false, pesan: "Terjadi kesalahan." };
  }
}
