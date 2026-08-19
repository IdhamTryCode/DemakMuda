"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { slugUnik } from "@/lib/teks";
import { AgendaSkema, galatKolom, type HasilAksi } from "@/lib/validasi";
import { catat } from "@/server/audit";
import {
  bolehMengubah,
  GagalIzin,
  PENGELOLA_ISI,
  wajibAktor,
} from "@/server/penjaga";

/** Server Action untuk Agenda Demak. Urutan pemeriksaannya sama dengan Kabar. */

function bacaFormulir(data: FormData) {
  const selesai = String(data.get("selesai") ?? "");
  return {
    judul: String(data.get("judul") ?? ""),
    deskripsi: String(data.get("deskripsi") ?? ""),
    lokasi: String(data.get("lokasi") ?? ""),
    mulai: String(data.get("mulai") ?? ""),
    selesai: selesai || null,
    kecamatanId: String(data.get("kecamatanId") ?? ""),
    status: String(data.get("status") ?? "DRAF"),
  };
}

/** Kecamatan yang dikirim harus benar-benar ada, bukan sekadar teks bebas. */
async function kecamatanSah(id: string): Promise<string | null> {
  if (!id) return null;
  const ada = await prisma.kecamatan.findUnique({
    where: { id },
    select: { id: true },
  });
  return ada?.id ?? null;
}

export async function buatAgenda(data: FormData): Promise<HasilAksi> {
  try {
    const aktor = await wajibAktor(...PENGELOLA_ISI);

    const hasil = AgendaSkema.safeParse(bacaFormulir(data));
    if (!hasil.success) {
      return { ok: false, pesan: "Periksa kembali isian.", kolom: galatKolom(hasil.error) };
    }
    const n = hasil.data;

    const agenda = await prisma.agenda.create({
      data: {
        judul: n.judul,
        slug: slugUnik(n.judul),
        deskripsi: n.deskripsi,
        lokasi: n.lokasi || null,
        mulai: n.mulai,
        selesai: n.selesai ?? null,
        kecamatanId: await kecamatanSah(n.kecamatanId ?? ""),
        status: n.status,
        pembuatId: aktor.id,
      },
      select: { id: true },
    });

    await catat({
      aktorId: aktor.id,
      aksi: n.status === "TERBIT" ? "agenda.terbit" : "agenda.buat",
      sasaran: "agenda",
      sasaranId: agenda.id,
      rincian: { judul: n.judul, mulai: n.mulai.toISOString() },
    });

    revalidatePath("/agenda");
    revalidatePath("/kelola/agenda");
    return { ok: true };
  } catch (e) {
    if (e instanceof GagalIzin) return { ok: false, pesan: e.message };
    console.error("[agenda.buat]", e);
    return { ok: false, pesan: "Terjadi kesalahan saat menyimpan." };
  }
}

export async function ubahAgenda(id: string, data: FormData): Promise<HasilAksi> {
  try {
    const aktor = await wajibAktor(...PENGELOLA_ISI);

    const hasil = AgendaSkema.safeParse(bacaFormulir(data));
    if (!hasil.success) {
      return { ok: false, pesan: "Periksa kembali isian.", kolom: galatKolom(hasil.error) };
    }
    const n = hasil.data;

    const lama = await prisma.agenda.findUnique({
      where: { id },
      select: { pembuatId: true, status: true },
    });
    if (!lama) return { ok: false, pesan: "Agenda tidak ditemukan." };
    if (!bolehMengubah(aktor, lama.pembuatId)) {
      return { ok: false, pesan: "Agenda ini bukan milik Anda." };
    }

    await prisma.agenda.update({
      where: { id },
      data: {
        judul: n.judul,
        deskripsi: n.deskripsi,
        lokasi: n.lokasi || null,
        mulai: n.mulai,
        selesai: n.selesai ?? null,
        kecamatanId: await kecamatanSah(n.kecamatanId ?? ""),
        status: n.status,
      },
    });

    await catat({
      aktorId: aktor.id,
      aksi: "agenda.ubah",
      sasaran: "agenda",
      sasaranId: id,
      rincian: { judul: n.judul, statusLama: lama.status, statusBaru: n.status },
    });

    revalidatePath("/agenda");
    revalidatePath("/kelola/agenda");
    return { ok: true };
  } catch (e) {
    if (e instanceof GagalIzin) return { ok: false, pesan: e.message };
    console.error("[agenda.ubah]", e);
    return { ok: false, pesan: "Terjadi kesalahan saat menyimpan." };
  }
}

export async function arsipkanAgenda(id: string): Promise<HasilAksi> {
  try {
    const aktor = await wajibAktor(...PENGELOLA_ISI);

    const lama = await prisma.agenda.findUnique({
      where: { id },
      select: { pembuatId: true, judul: true },
    });
    if (!lama) return { ok: false, pesan: "Agenda tidak ditemukan." };
    if (!bolehMengubah(aktor, lama.pembuatId)) {
      return { ok: false, pesan: "Agenda ini bukan milik Anda." };
    }

    await prisma.agenda.update({ where: { id }, data: { status: "ARSIP" } });

    await catat({
      aktorId: aktor.id,
      aksi: "agenda.arsip",
      sasaran: "agenda",
      sasaranId: id,
      rincian: { judul: lama.judul },
    });

    revalidatePath("/agenda");
    revalidatePath("/kelola/agenda");
    return { ok: true };
  } catch (e) {
    if (e instanceof GagalIzin) return { ok: false, pesan: e.message };
    console.error("[agenda.arsip]", e);
    return { ok: false, pesan: "Terjadi kesalahan." };
  }
}
