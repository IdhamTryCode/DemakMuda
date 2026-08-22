import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";

import {
  BATAS_GAMBAR,
  JENIS_GAMBAR,
  POLA_JALUR_BLOB,
} from "@/lib/blob";
import type { Peran } from "@/lib/peran";
import { catat } from "@/server/audit";
import { aktorSaatIni } from "@/server/penjaga";

/**
 * Penerbit token unggah.
 *
 * Berkas tidak melewati peladen ini. Peramban mengunggah langsung ke Vercel
 * Blob memakai token berumur pendek, dan tugas rute ini hanya memutuskan
 * apakah token itu layak diterbitkan — untuk siapa, ke ruang mana, jenis
 * berkas apa, dan sebesar apa. Batas-batas itu ditanamkan ke dalam tokennya,
 * jadi peramban tidak dapat melampauinya sekalipun permintaannya diubah.
 *
 * `onUploadCompleted` sengaja TIDAK dipakai. Callback itu diam-diam mati di
 * localhost kecuali VERCEL_BLOB_CALLBACK_URL diarahkan ke terowongan, sehingga
 * alur yang bergantung padanya akan berbeda antara mesin pengembang dan
 * produksi. Sebagai gantinya, alamat hasil unggah dikirim balik lewat formulir
 * dan disimpan oleh Server Action yang sudah ada — jalur yang sama persis di
 * kedua tempat, dan tetap melewati pemeriksaan peran serta kepemilikan.
 */

/** Siapa yang boleh mengisi tiap ruang. */
const IZIN_RUANG: Record<string, Peran[]> = {
  karya: ["pemuda"],
  organisasi: ["organisasi", "dinas", "superadmin"],
};

export async function POST(request: Request): Promise<NextResponse> {
  let body: HandleUploadBody;
  try {
    body = (await request.json()) as HandleUploadBody;
  } catch {
    return NextResponse.json({ error: "Permintaan tidak sah." }, { status: 400 });
  }

  try {
    const jawaban = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname) => {
        if (!POLA_JALUR_BLOB.test(pathname)) {
          throw new Error("Nama berkas tidak sah.");
        }
        const ruang = pathname.split("/")[0];

        const aktor = await aktorSaatIni();
        if (!aktor) throw new Error("Anda perlu masuk lebih dulu.");

        const boleh = IZIN_RUANG[ruang] ?? [];
        if (!boleh.includes(aktor.peran)) {
          throw new Error("Peran Anda tidak berwenang mengunggah ke sini.");
        }

        await catat({
          aktorId: aktor.id,
          aksi: "berkas.unggah",
          sasaran: "blob",
          rincian: { ruang, jalur: pathname },
        });

        return {
          allowedContentTypes: [...JENIS_GAMBAR],
          maximumSizeInBytes: BATAS_GAMBAR,
          // Nama berkas dari dua pengguna berbeda bisa sama persis; akhiran
          // acak mencegah yang satu menimpa yang lain, sekaligus membuat
          // alamatnya tidak dapat ditebak.
          addRandomSuffix: true,
          tokenPayload: JSON.stringify({ aktorId: aktor.id }),
        };
      },
    });

    return NextResponse.json(jawaban);
  } catch (e) {
    const pesan = e instanceof Error ? e.message : "Unggahan ditolak.";
    return NextResponse.json({ error: pesan }, { status: 400 });
  }
}
