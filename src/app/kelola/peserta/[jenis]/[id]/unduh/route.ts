import { namaBerkasAman, susunCsv } from "@/lib/csv";
import { prisma } from "@/lib/prisma";
import { umur } from "@/lib/profil";
import { tanggalPendek } from "@/lib/teks";
import { aktorSaatIni, bolehMengubah, PENGELOLA_ISI } from "@/server/penjaga";

/**
 * Unduhan daftar peserta sebagai CSV.
 *
 * Rute ini menyajikan data pribadi peserta, jadi ia memeriksa sesi dan
 * kepemilikan sendiri — proxy tidak memvalidasi apa pun. Balasannya 404 untuk
 * kegiatan milik orang lain, sama seperti halaman pengelolaan.
 */
export async function GET(
  _permintaan: Request,
  { params }: { params: Promise<{ jenis: string; id: string }> },
) {
  const { jenis, id } = await params;

  const aktor = await aktorSaatIni();
  if (!aktor || !PENGELOLA_ISI.includes(aktor.peran)) {
    return new Response("Tidak berwenang", { status: 403 });
  }
  if (jenis !== "agenda" && jenis !== "peluang") {
    return new Response("Tidak ditemukan", { status: 404 });
  }

  const kegiatan =
    jenis === "agenda"
      ? await prisma.agenda.findUnique({
          where: { id },
          select: { judul: true, pembuatId: true },
        })
      : await prisma.peluang.findUnique({
          where: { id },
          select: { judul: true, pembuatId: true },
        });

  if (!kegiatan || !bolehMengubah(aktor, kegiatan.pembuatId)) {
    return new Response("Tidak ditemukan", { status: 404 });
  }

  const peserta = await prisma.pendaftaran.findMany({
    where: jenis === "agenda" ? { agendaId: id } : { peluangId: id },
    orderBy: { dibuatPada: "asc" },
    select: {
      status: true,
      dibuatPada: true,
      user: {
        select: {
          name: true,
          email: true,
          profil: {
            select: {
              telepon: true,
              tanggalLahir: true,
              kecamatan: { select: { nama: true } },
              desa: { select: { nama: true } },
            },
          },
        },
      },
    },
  });

  const sekarang = new Date();
  const csv = susunCsv(
    ["No", "Nama", "Surel", "Telepon", "Usia", "Kecamatan", "Desa/Kelurahan", "Status", "Tanggal daftar"],
    peserta.map((p, i) => [
      i + 1,
      p.user.name,
      p.user.email,
      p.user.profil?.telepon ?? "",
      p.user.profil?.tanggalLahir ? umur(p.user.profil.tanggalLahir, sekarang) : "",
      p.user.profil?.kecamatan?.nama ?? "",
      p.user.profil?.desa?.nama ?? "",
      p.status,
      tanggalPendek(p.dibuatPada),
    ]),
  );

  return new Response(csv, {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="peserta-${namaBerkasAman(kegiatan.judul)}.csv"`,
      // Daftar peserta memuat data pribadi; jangan sampai tersimpan di cache
      // perantara mana pun.
      "cache-control": "no-store",
    },
  });
}
