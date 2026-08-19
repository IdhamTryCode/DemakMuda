"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { keSlug } from "@/lib/teks";
import { galatKolom, ProfilSkema, type HasilAksi } from "@/lib/validasi";
import { catat } from "@/server/audit";
import { GagalIzin, wajibAktor } from "@/server/penjaga";

/**
 * Server Action untuk Kartu Talenta.
 *
 * Hanya pemilik akun yang boleh mengubah profilnya sendiri; tidak ada jalur
 * untuk menyunting profil orang lain, sehingga tidak perlu pemeriksaan
 * kepemilikan terpisah — id-nya selalu diambil dari sesi, tidak dari formulir.
 */

/** Membuat slug profil yang belum dipakai, berdasarkan nama. */
async function slugProfilUnik(nama: string, userId: string): Promise<string> {
  const dasar = keSlug(nama) || "pemuda";
  for (let i = 0; i < 12; i++) {
    const calon = i === 0 ? dasar : `${dasar}-${i + 1}`;
    const dipakai = await prisma.profilPemuda.findUnique({
      where: { slug: calon },
      select: { userId: true },
    });
    if (!dipakai || dipakai.userId === userId) return calon;
  }
  return `${dasar}-${userId.slice(0, 6).toLowerCase()}`;
}

/** Memastikan desa yang dipilih benar-benar berada di kecamatan yang dipilih. */
async function wilayahSah(kecamatanId: string, desaId: string) {
  const kecamatan = kecamatanId
    ? await prisma.kecamatan.findUnique({
        where: { id: kecamatanId },
        select: { id: true },
      })
    : null;

  if (!kecamatan) return { kecamatanId: null, desaId: null };

  const desa = desaId
    ? await prisma.desa.findFirst({
        where: { id: desaId, kecamatanId: kecamatan.id },
        select: { id: true },
      })
    : null;

  return { kecamatanId: kecamatan.id, desaId: desa?.id ?? null };
}

async function idSah(
  jenis: "minat" | "keterampilan",
  data: FormData,
): Promise<string[]> {
  const diminta = data.getAll(jenis).map(String).filter(Boolean).slice(0, 30);
  if (diminta.length === 0) return [];
  const ada =
    jenis === "minat"
      ? await prisma.minat.findMany({ where: { id: { in: diminta } }, select: { id: true } })
      : await prisma.keterampilan.findMany({
          where: { id: { in: diminta } },
          select: { id: true },
        });
  return ada.map((x) => x.id);
}

export async function simpanProfil(data: FormData): Promise<HasilAksi> {
  try {
    // Semua peran boleh punya profil; yang penting ia hanya menyunting miliknya.
    const aktor = await wajibAktor("pemuda", "organisasi", "dinas", "superadmin");

    const tanggalLahir = String(data.get("tanggalLahir") ?? "");
    const hasil = ProfilSkema.safeParse({
      nama: String(data.get("nama") ?? ""),
      bio: String(data.get("bio") ?? ""),
      telepon: String(data.get("telepon") ?? ""),
      tanggalLahir: tanggalLahir || null,
      jenisKelamin: String(data.get("jenisKelamin") ?? ""),
      kecamatanId: String(data.get("kecamatanId") ?? ""),
      desaId: String(data.get("desaId") ?? ""),
      sekolahId: String(data.get("sekolahId") ?? ""),
    });
    if (!hasil.success) {
      return { ok: false, pesan: "Periksa kembali isian.", kolom: galatKolom(hasil.error) };
    }
    const n = hasil.data;

    const wilayah = await wilayahSah(n.kecamatanId ?? "", n.desaId ?? "");
    const sekolah = n.sekolahId
      ? await prisma.sekolah.findUnique({
          where: { id: n.sekolahId },
          select: { id: true },
        })
      : null;

    const [minat, keterampilan] = await Promise.all([
      idSah("minat", data),
      idSah("keterampilan", data),
    ]);

    const slug = await slugProfilUnik(n.nama, aktor.id);

    const isi = {
      bio: n.bio || null,
      telepon: n.telepon || null,
      tanggalLahir: n.tanggalLahir ?? null,
      jenisKelamin: n.jenisKelamin || null,
      kecamatanId: wilayah.kecamatanId,
      desaId: wilayah.desaId,
      sekolahId: sekolah?.id ?? null,
    };

    await prisma.$transaction([
      prisma.user.update({ where: { id: aktor.id }, data: { name: n.nama } }),
      prisma.profilPemuda.upsert({
        where: { userId: aktor.id },
        update: {
          ...isi,
          slug,
          minat: { set: minat.map((id) => ({ id })) },
          keterampilan: { set: keterampilan.map((id) => ({ id })) },
        },
        create: {
          ...isi,
          slug,
          userId: aktor.id,
          minat: { connect: minat.map((id) => ({ id })) },
          keterampilan: { connect: keterampilan.map((id) => ({ id })) },
        },
      }),
    ]);

    await catat({
      aktorId: aktor.id,
      aksi: "profil.simpan",
      sasaran: "profil_pemuda",
      sasaranId: aktor.id,
    });

    revalidatePath("/pemuda");
    revalidatePath(`/p/${slug}`);
    return { ok: true };
  } catch (e) {
    if (e instanceof GagalIzin) return { ok: false, pesan: e.message };
    console.error("[profil.simpan]", e);
    return { ok: false, pesan: "Terjadi kesalahan saat menyimpan." };
  }
}
