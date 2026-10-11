import Link from "next/link";

import { PilihPeran } from "@/app/admin/pengguna/pilih-peran";
import { Cip, KepalaHalaman, Kartu, Overline } from "@/components/sk";
import { bacaPeran, LABEL_PERAN, PERAN } from "@/lib/peran";
import { prisma } from "@/lib/prisma";
import { wajibPeran } from "@/lib/sesi";
import { tanggalPendek } from "@/lib/teks";

export const metadata = { title: "Kelola Pengguna" };

const BATAS = 200;

export default async function HalamanPengguna({
  searchParams,
}: {
  searchParams: Promise<{ peran?: string; cari?: string }>;
}) {
  const sesi = await wajibPeran("superadmin");
  const { peran, cari } = await searchParams;

  const pengguna = await prisma.user.findMany({
    where: {
      ...(peran && PERAN.includes(peran as never) ? { role: peran } : {}),
      ...(cari
        ? {
            OR: [
              { name: { contains: cari, mode: "insensitive" as const } },
              { email: { contains: cari, mode: "insensitive" as const } },
            ],
          }
        : {}),
    },
    orderBy: [{ role: "asc" }, { createdAt: "desc" }],
    take: BATAS,
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      emailVerified: true,
      createdAt: true,
      profil: { select: { kecamatan: { select: { nama: true } } } },
    },
  });

  return (
    <div className="flex flex-col gap-6">
      <KepalaHalaman
        overline="Admin"
        judul="Kelola pengguna"
        keterangan="Menaikkan peran seseorang menjadi dinas berarti memberinya akses ke data seluruh pemuda. Setiap perubahan tercatat di jejak audit."
        aksi={
          <Link
            href="/admin"
            className="sk-kartu sk-pressable px-4 py-2.5 text-sm font-medium text-ink-soft"
          >
            Kembali
          </Link>
        }
      />

      <div className="sk-redup flex flex-col gap-4 p-4">
        <div className="flex flex-wrap items-center gap-2">
          <Overline>Peran</Overline>
          <Cip href="/admin/pengguna" aktif={!peran}>
            Semua
          </Cip>
          {PERAN.map((p) => (
            <Cip
              key={p}
              href={`/admin/pengguna?peran=${p}`}
              aktif={peran === p}
            >
              {LABEL_PERAN[p]}
            </Cip>
          ))}
        </div>

        <form action="/admin/pengguna" method="get" className="flex flex-wrap gap-3">
          {peran && <input type="hidden" name="peran" value={peran} />}
          <input
            name="cari"
            defaultValue={cari ?? ""}
            placeholder="Cari nama atau surel"
            maxLength={80}
            className="sk-field min-w-56 flex-1 px-3.5 py-2.5 text-sm"
          />
          <button
            type="submit"
            className="sk-kartu sk-pressable rounded-sk px-4 py-2.5 text-sm font-medium text-ink-soft"
          >
            Cari
          </button>
        </form>
      </div>

      {pengguna.length === 0 ? (
        <Kartu>
          <p className="text-sm text-muted">Tidak ada pengguna dengan saringan ini.</p>
        </Kartu>
      ) : (
        <ul className="flex flex-col gap-2">
          {pengguna.map((p) => (
            <li key={p.id}>
              <Kartu className="flex flex-wrap items-center gap-4 px-5 py-4">
                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="truncate font-medium">{p.name}</span>
                    {!p.emailVerified && (
                      <span className="rounded-full bg-brass-soft px-2 py-0.5 text-xs text-brass">
                        belum verifikasi
                      </span>
                    )}
                  </div>
                  <span className="truncate text-xs text-muted">
                    {p.email}
                    {p.profil?.kecamatan && ` · ${p.profil.kecamatan.nama}`}
                    {` · bergabung ${tanggalPendek(p.createdAt)}`}
                  </span>
                </div>

                <PilihPeran
                  userId={p.id}
                  peran={bacaPeran(p.role)}
                  diriSendiri={p.id === sesi.user.id}
                />
              </Kartu>
            </li>
          ))}
        </ul>
      )}

      {pengguna.length === BATAS && (
        <p className="text-xs text-muted">
          Menampilkan {BATAS} pengguna. Persempit dengan saringan atau pencarian.
        </p>
      )}
    </div>
  );
}
