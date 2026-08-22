"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { slugUnik } from "@/lib/teks";
import { galatKolom, PeluangSkema, type HasilAksi } from "@/lib/validasi";
import { catat } from "@/server/audit";
import {
  bolehMengubah,
  GagalIzin,
  PENGELOLA_ISI,
  wajibAktor,
  type Aktor,
} from "@/server/penjaga";

/** Server Action untuk Papan Peluang. Urutan pemeriksaannya sama dengan Kabar. */

function bacaFormulir(data: FormData) {
  const tenggat = String(data.get("tenggat") ?? "");
  const usiaMin = String(data.get("usiaMin") ?? "");
  const usiaMaks = String(data.get("usiaMaks") ?? "");
  return {
    judul: String(data.get("judul") ?? ""),
    jenis: String(data.get("jenis") ?? ""),
    deskripsi: String(data.get("deskripsi") ?? ""),
    tautanLuar: String(data.get("tautanLuar") ?? ""),
    tenggat: tenggat || null,
    usiaMin: usiaMin === "" ? null : usiaMin,
    usiaMaks: usiaMaks === "" ? null : usiaMaks,
    status: String(data.get("status") ?? "DRAF"),
    organisasiId: String(data.get("organisasiId") ?? ""),
    khususAnggota: data.get("khususAnggota") === "on",
  };
}

/**
 * Hanya menerima id minat yang benar-benar ada. Nilai karangan dibuang diam-diam
 * alih-alih menggagalkan penyimpanan, karena ini bukan kesalahan pengguna biasa.
 */
async function minatSah(data: FormData): Promise<string[]> {
  const diminta = data.getAll("minat").map(String).filter(Boolean).slice(0, 20);
  if (diminta.length === 0) return [];
  const ada = await prisma.minat.findMany({
    where: { id: { in: diminta } },
    select: { id: true },
  });
  return ada.map((m) => m.id);
}


/**
 * Memastikan organisasi penyelenggara memang boleh dipakai pemanggil.
 *
 * Tanpa pemeriksaan ini, siapa pun yang berwenang membuat kegiatan dapat
 * menempelkan nama organisasi milik orang lain padanya — dan bila kegiatan itu
 * ditandai khusus anggota, ia sekaligus mengatur siapa yang boleh mendaftar ke
 * organisasi yang bukan miliknya.
 *
 * Membalas null berarti tanpa penyelenggara, bukan gagal: kegiatan memang boleh
 * berdiri sendiri tanpa organisasi.
 */
async function penyelenggaraSah(
  aktor: Aktor,
  organisasiId: string,
): Promise<string | null> {
  if (!organisasiId) return null;
  const organisasi = await prisma.organisasi.findUnique({
    where: { id: organisasiId },
    select: { id: true, pemilikId: true },
  });
  if (!organisasi) return null;
  return bolehMengubah(aktor, organisasi.pemilikId) ? organisasi.id : null;
}

export async function buatPeluang(data: FormData): Promise<HasilAksi> {
  try {
    const aktor = await wajibAktor(...PENGELOLA_ISI);

    const hasil = PeluangSkema.safeParse(bacaFormulir(data));
    if (!hasil.success) {
      return { ok: false, pesan: "Periksa kembali isian.", kolom: galatKolom(hasil.error) };
    }
    const n = hasil.data;
    const minat = await minatSah(data);

    const peluang = await prisma.peluang.create({
      data: {
        judul: n.judul,
        slug: slugUnik(n.judul),
        jenis: n.jenis,
        deskripsi: n.deskripsi,
        tautanLuar: n.tautanLuar || null,
        tenggat: n.tenggat ?? null,
        usiaMin: n.usiaMin ?? null,
        usiaMaks: n.usiaMaks ?? null,
        status: n.status,
        organisasiId: await penyelenggaraSah(aktor, n.organisasiId ?? ""),
        khususAnggota: n.khususAnggota,
        pembuatId: aktor.id,
        minat: { connect: minat.map((id) => ({ id })) },
      },
      select: { id: true },
    });

    await catat({
      aktorId: aktor.id,
      aksi: n.status === "TERBIT" ? "peluang.terbit" : "peluang.buat",
      sasaran: "peluang",
      sasaranId: peluang.id,
      rincian: { judul: n.judul, jenis: n.jenis },
    });

    revalidatePath("/peluang");
    revalidatePath("/kelola/peluang");
    return { ok: true };
  } catch (e) {
    if (e instanceof GagalIzin) return { ok: false, pesan: e.message };
    console.error("[peluang.buat]", e);
    return { ok: false, pesan: "Terjadi kesalahan saat menyimpan." };
  }
}

export async function ubahPeluang(id: string, data: FormData): Promise<HasilAksi> {
  try {
    const aktor = await wajibAktor(...PENGELOLA_ISI);

    const hasil = PeluangSkema.safeParse(bacaFormulir(data));
    if (!hasil.success) {
      return { ok: false, pesan: "Periksa kembali isian.", kolom: galatKolom(hasil.error) };
    }
    const n = hasil.data;

    const lama = await prisma.peluang.findUnique({
      where: { id },
      select: { pembuatId: true, status: true },
    });
    if (!lama) return { ok: false, pesan: "Peluang tidak ditemukan." };
    if (!bolehMengubah(aktor, lama.pembuatId)) {
      return { ok: false, pesan: "Peluang ini bukan milik Anda." };
    }

    const minat = await minatSah(data);

    await prisma.peluang.update({
      where: { id },
      data: {
        judul: n.judul,
        jenis: n.jenis,
        deskripsi: n.deskripsi,
        tautanLuar: n.tautanLuar || null,
        tenggat: n.tenggat ?? null,
        usiaMin: n.usiaMin ?? null,
        usiaMaks: n.usiaMaks ?? null,
        status: n.status,
        organisasiId: await penyelenggaraSah(aktor, n.organisasiId ?? ""),
        khususAnggota: n.khususAnggota,
        minat: { set: minat.map((id) => ({ id })) },
      },
    });

    await catat({
      aktorId: aktor.id,
      aksi: "peluang.ubah",
      sasaran: "peluang",
      sasaranId: id,
      rincian: { judul: n.judul, statusLama: lama.status, statusBaru: n.status },
    });

    revalidatePath("/peluang");
    revalidatePath("/kelola/peluang");
    return { ok: true };
  } catch (e) {
    if (e instanceof GagalIzin) return { ok: false, pesan: e.message };
    console.error("[peluang.ubah]", e);
    return { ok: false, pesan: "Terjadi kesalahan saat menyimpan." };
  }
}

export async function arsipkanPeluang(id: string): Promise<HasilAksi> {
  try {
    const aktor = await wajibAktor(...PENGELOLA_ISI);

    const lama = await prisma.peluang.findUnique({
      where: { id },
      select: { pembuatId: true, judul: true },
    });
    if (!lama) return { ok: false, pesan: "Peluang tidak ditemukan." };
    if (!bolehMengubah(aktor, lama.pembuatId)) {
      return { ok: false, pesan: "Peluang ini bukan milik Anda." };
    }

    await prisma.peluang.update({ where: { id }, data: { status: "ARSIP" } });

    await catat({
      aktorId: aktor.id,
      aksi: "peluang.arsip",
      sasaran: "peluang",
      sasaranId: id,
      rincian: { judul: lama.judul },
    });

    revalidatePath("/peluang");
    revalidatePath("/kelola/peluang");
    return { ok: true };
  } catch (e) {
    if (e instanceof GagalIzin) return { ok: false, pesan: e.message };
    console.error("[peluang.arsip]", e);
    return { ok: false, pesan: "Terjadi kesalahan." };
  }
}
