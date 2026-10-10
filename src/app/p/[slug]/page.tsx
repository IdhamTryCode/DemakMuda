import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { headers } from "next/headers";
import QRCode from "qrcode";

import { BingkaiPublik } from "@/components/bingkai-publik";
import { KartuTalenta } from "@/components/kartu-talenta";
import { Kartu, PanelSunk, UbinMetrik } from "@/components/sk";
import { LABEL_KEANGGOTAAN, LABEL_ORGANISASI } from "@/lib/organisasi";
import { LABEL_TINGKAT } from "@/lib/prestasi";
import { prisma } from "@/lib/prisma";
import { keterbukaanProfil, umur } from "@/lib/profil";
import { dapatkanSesi } from "@/lib/sesi";
import { tanggalPendek } from "@/lib/teks";

/**
 * Kartu Talenta publik.
 *
 * Halaman ini dapat dibuka siapa saja, jadi isinya disaring lebih dulu oleh
 * aturan di lib/profil.ts: nomor telepon tidak pernah tampil.
 */
async function ambilProfil(slug: string) {
  return prisma.profilPemuda.findUnique({
    where: { slug },
    select: {
      slug: true,
      bio: true,
      fotoUrl: true,
      statusVerifikasi: true,
      tanggalLahir: true,
      kecamatan: { select: { nama: true } },
      desa: { select: { nama: true } },
      sekolah: { select: { nama: true } },
      minat: { select: { nama: true }, orderBy: { nama: "asc" } },
      keterampilan: { select: { nama: true }, orderBy: { nama: "asc" } },
      // Jumlah prestasi yang sebenarnya, bukan panjang daftar yang dibatasi
      // `take` di bawah — supaya ringkasan angkanya tidak pernah berbohong.
      _count: { select: { prestasi: true } },
      // Rekam jejak yang diisi sendiri. Sengaja diambil terpisah dari
      // sertifikat, dan ditampilkan terpisah pula: keduanya tidak sama
      // bobotnya, dan menggabungkannya dalam satu daftar akan membuat klaim
      // tanpa pemeriksa tampak setara dengan sertifikat berkode.
      prestasi: {
        orderBy: [{ tahun: "desc" }, { dibuatPada: "desc" }],
        take: 30,
        select: {
          id: true,
          judul: true,
          tingkat: true,
          peringkat: true,
          penyelenggara: true,
          tahun: true,
          buktiUrl: true,
        },
      },
      pengalaman: {
        orderBy: [{ tahunMulai: "desc" }, { dibuatPada: "desc" }],
        take: 20,
        select: {
          id: true,
          judul: true,
          peran: true,
          penyelenggara: true,
          tahunMulai: true,
          tahunSelesai: true,
          keterangan: true,
        },
      },
      userId: true,
      user: {
        select: {
          name: true,
          // Hitungan sungguhan untuk ringkasan angka. Daftar di bawah tetap
          // dibatasi `take`, jadi panjangnya tidak boleh dipakai sebagai angka.
          _count: {
            select: {
              keanggotaan: { where: { status: "TERVERIFIKASI" } },
              sertifikatDiterima: { where: { dibatalkanPada: null } },
            },
          },
          // Keanggotaan yang sudah disetujui pengurus saja. Yang masih
          // menunggu atau ditolak bukan urusan pembaca kartu ini, dan
          // menampilkannya akan mengumumkan penolakan orang.
          keanggotaan: {
            where: { status: "TERVERIFIKASI" },
            orderBy: [{ peran: "asc" }, { dibuatPada: "asc" }],
            take: 12,
            select: {
              id: true,
              peran: true,
              organisasi: {
                select: { nama: true, slug: true, jenis: true },
              },
            },
          },
          // Sertifikat yang dibatalkan tidak ikut tampil di kartu publik,
          // tetapi kodenya tetap dapat diperiksa di halaman /cek.
          sertifikatDiterima: {
            where: { dibatalkanPada: null },
            orderBy: { terbitPada: "desc" },
            take: 20,
            select: {
              kode: true,
              judul: true,
              peringkat: true,
              terbitPada: true,
              organisasi: { select: { nama: true } },
              penerbit: { select: { name: true } },
            },
          },
        },
      },
    },
  });
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const p = await ambilProfil(slug);
  if (!p) return { title: "Kartu Talenta tidak ditemukan" };
  return {
    title: p.user.name,
    description: `Kartu Talenta ${p.user.name} di DemakMuda.`,
  };
}

/** Label kecil untuk daftar minat dan keterampilan. */
function Keping({ children }: { children: string }) {
  return (
    <span className="rounded-full border border-line-strong bg-surface px-3 py-1 text-sm text-ink-soft">
      {children}
    </span>
  );
}

export default async function HalamanKartuTalenta({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const p = await ambilProfil(slug);
  if (!p) notFound();

  const buka = keterbukaanProfil(p.tanggalLahir);

  // Pemiliknya sendiri kerap sampai ke halaman ini lewat "Lihat kartu publik",
  // lalu menemukan sesuatu yang ingin diperbaiki. Satu tautan kembali ke
  // penyuntingnya cukup; sesi memang sudah dibaca halaman ini, tidak ada
  // pembacaan baru.
  const sesi = await dapatkanSesi();
  const punyaSendiri = sesi?.user.id === p.userId;

  // QR menunjuk ke halaman ini sendiri, supaya kartunya dapat dipindai dari
  // layar orang lain dan langsung membuka versi yang dapat diperiksa.
  const kepala = await headers();
  const inang = kepala.get("host") ?? "demakmuda.id";
  const skema = inang.startsWith("localhost") ? "http" : "https";
  const alamat = `${skema}://${inang}/p/${p.slug}`;
  // Tanpa opsi width, SVG-nya hanya membawa viewBox — ukurannya diserahkan
  // kepada pelat yang memuatnya di kartu. Dengan opsi width, ia menuliskan
  // ukuran pikselnya sendiri, mengabaikan pelat itu, dan lubernya dipangkas
  // oleh overflow-hidden kartu. Itu sebab kode QR sempat terpotong.
  const qr = await QRCode.toString(alamat, {
    type: "svg",
    margin: 0,
    errorCorrectionLevel: "M",
    color: { dark: "#0b3f34", light: "#ffffff" },
  }).catch(() => null);

  // Kecamatan, desa, dan usia sudah tercetak di kartunya. Yang tersisa di
  // bawah hanya yang tidak muat di sana.
  const rincian = [
    buka.tampilkanSekolah && p.sekolah
      ? { label: "Sekolah", nilai: p.sekolah.nama }
      : null,
  ].filter((r): r is { label: string; nilai: string } => r !== null);

  return (
    <BingkaiPublik>
      <article className="flex flex-col gap-8 lg:flex-row lg:items-start lg:gap-10">
        {/* Kolom kartu: lebar tetap di layar lebar, tidak diregangkan mengikuti
            lebar halaman. */}
        <div className="flex flex-col gap-4 lg:w-[26rem] lg:shrink-0">
          <h1 className="sr-only">Kartu Talenta {p.user.name}</h1>

          {punyaSendiri && (
            <div className="sk-redup flex flex-wrap items-center justify-between gap-3 p-4">
              <p className="text-sm text-ink-soft">
                Ini kartu Anda — beginilah orang lain melihatnya.
              </p>
              <Link
                href="/pemuda/profil"
                className="sk-btn-utama sk-pressable px-4 py-2 text-sm"
              >
                Ubah Kartu Talenta
              </Link>
            </div>
          )}

          <KartuTalenta
            nama={p.user.name}
            slug={p.slug}
            fotoUrl={buka.tampilkanFoto ? p.fotoUrl : null}
            kecamatan={p.kecamatan?.nama ?? null}
            desa={buka.tampilkanDesa ? (p.desa?.nama ?? null) : null}
            usia={buka.tampilkanUsia && p.tanggalLahir ? umur(p.tanggalLahir) : null}
            minat={p.minat.map((m) => m.nama)}
            keterampilan={p.keterampilan.map((k) => k.nama)}
            organisasi={
              p.user.keanggotaan[0]
                ? {
                    nama: p.user.keanggotaan[0].organisasi.nama,
                    peran: p.user.keanggotaan[0].peran,
                  }
                : null
            }
            terverifikasi={p.statusVerifikasi === "TERVERIFIKASI"}
            qr={qr}
          />

          <p className="max-w-prose text-sm text-muted">
            Kode pada kartu berisi alamat halaman ini — bukan kode pembayaran.
            Memindainya membuka kartu yang sama, sehingga isinya dapat diperiksa
            langsung dari sumbernya.
          </p>

          {p.bio && <p className="text-base text-ink-soft">{p.bio}</p>}

          {rincian.length > 0 && (
            <dl className="sk-redup grid gap-4 p-5 sm:grid-cols-2">
              {rincian.map((r) => (
                <div key={r.label} className="flex flex-col gap-1">
                  <dt className="text-[11px] font-semibold uppercase leading-[14px] tracking-[0.12em] text-muted">
                    {r.label}
                  </dt>
                  <dd className="text-sm">{r.nilai}</dd>
                </div>
              ))}
            </dl>
          )}
        </div>

        {/* Isi di samping kartu. */}
        <div className="flex min-w-0 flex-1 flex-col gap-8">
          {/* Ringkasan tiga angka, dihitung dari basis data. */}
          <PanelSunk className="grid grid-cols-3 gap-x-4 gap-y-4 p-5">
            <UbinMetrik
              nilai={p.user._count.sertifikatDiterima}
              label="Sertifikat terbit"
            />
            <UbinMetrik
              nilai={p.user._count.keanggotaan}
              label="Organisasi terverifikasi"
            />
            <UbinMetrik nilai={p._count.prestasi} label="Prestasi tercatat" />
          </PanelSunk>

          {(p.minat.length > 0 || p.keterampilan.length > 0) && (
            <section className="flex flex-col gap-3">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-muted">
                Minat &amp; keterampilan
              </h2>
              <div className="flex flex-wrap gap-2">
                {p.minat.map((m) => (
                  <Keping key={`minat-${m.nama}`}>{m.nama}</Keping>
                ))}
                {p.keterampilan.map((k) => (
                  <Keping key={`keterampilan-${k.nama}`}>{k.nama}</Keping>
                ))}
              </div>
            </section>
          )}

          {p.user.keanggotaan.length > 0 && (
            <section className="flex flex-col gap-3">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-muted">
                Organisasi
              </h2>
              <ul className="flex flex-col gap-2.5">
                {p.user.keanggotaan.map((k) => (
                  <li key={k.id}>
                    <Link
                      href={`/direktori/${k.organisasi.slug}`}
                      className="block rounded-sk"
                    >
                      <Kartu className="sk-pressable flex flex-wrap items-center gap-3">
                        <span className="min-w-0 flex-1 truncate font-medium">
                          {k.organisasi.nama}
                        </span>
                        <span className="text-xs text-muted">
                          {LABEL_ORGANISASI[k.organisasi.jenis]}
                        </span>
                        {k.peran !== "ANGGOTA" && (
                          <span className="rounded-full bg-brass-soft px-2.5 py-1 text-xs font-medium text-brass">
                            {LABEL_KEANGGOTAAN[k.peran]}
                          </span>
                        )}
                      </Kartu>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {p.prestasi.length > 0 && (
            <section className="flex flex-col gap-3">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-muted">
                Prestasi
              </h2>

              {/* Prestasi diisi sendiri dan tidak diperiksa siapa pun. */}
              <p className="max-w-prose text-sm text-muted">
                Prestasi di sini dicatat sendiri oleh pemiliknya dan tidak
                diperiksa siapa pun. Yang membuatnya berarti adalah buktinya —
                tanpa itu, isinya hanya klaim.
              </p>

              <ul className="flex flex-col gap-3">
                {p.prestasi.map((s) => (
                  <li key={s.id}>
                    <Kartu className="flex flex-wrap items-center gap-4">
                      {buka.tampilkanBukti && s.buktiUrl && (
                        <a
                          href={s.buktiUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="shrink-0 rounded-[6px]"
                        >
                          <Image
                            src={s.buktiUrl}
                            alt={`Bukti ${s.judul}`}
                            width={96}
                            height={72}
                            className="h-16 w-24 rounded-[6px] object-cover"
                          />
                        </a>
                      )}
                      <div className="flex min-w-0 flex-1 flex-col gap-1">
                        <h3 className="font-medium leading-snug">{s.judul}</h3>
                        <span className="text-xs text-muted">
                          {[
                            `Tingkat ${LABEL_TINGKAT[s.tingkat].toLowerCase()}`,
                            s.tahun,
                            s.penyelenggara,
                          ]
                            .filter(Boolean)
                            .join(" · ")}
                        </span>
                      </div>
                      {s.peringkat && (
                        <span className="rounded-full bg-brass-soft px-2.5 py-1 text-xs font-medium text-brass">
                          {s.peringkat}
                        </span>
                      )}
                    </Kartu>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {p.pengalaman.length > 0 && (
            <section className="flex flex-col gap-3">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-muted">
                Pengalaman
              </h2>
              <ul className="flex flex-col gap-3">
                {p.pengalaman.map((g) => (
                  <li key={g.id}>
                    <Kartu className="flex flex-col gap-1">
                      <h3 className="font-medium leading-snug">{g.judul}</h3>
                      <span className="text-xs text-muted">
                        {[
                          g.peran,
                          g.penyelenggara,
                          g.tahunSelesai
                            ? g.tahunSelesai === g.tahunMulai
                              ? String(g.tahunMulai)
                              : `${g.tahunMulai}–${g.tahunSelesai}`
                            : `${g.tahunMulai}–sekarang`,
                        ]
                          .filter(Boolean)
                          .join(" · ")}
                      </span>
                      {g.keterangan && (
                        <p className="pt-1 text-sm text-ink-soft">{g.keterangan}</p>
                      )}
                    </Kartu>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section className="flex flex-col gap-3">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted">
              Sertifikat terbitan DemakMuda
            </h2>
            <p className="max-w-prose text-sm text-muted">
              Sertifikat ini diterbitkan penyelenggara kegiatan di dalam
              aplikasi, punya kode, dan keasliannya dapat diperiksa siapa pun.
            </p>
            {p.user.sertifikatDiterima.length === 0 ? (
              <Kartu>
                <p className="text-sm text-muted">
                  Belum ada sertifikat yang tercatat.
                </p>
              </Kartu>
            ) : (
              <ul className="flex flex-col gap-3">
                {p.user.sertifikatDiterima.map((s) => (
                  <li key={s.kode}>
                    <Link href={`/cek/${s.kode}`} className="block rounded-sk">
                      <Kartu className="sk-pressable flex flex-wrap items-center gap-4">
                        <div className="flex min-w-0 flex-1 flex-col gap-1">
                          <h3 className="font-medium leading-snug">{s.judul}</h3>
                          <span className="text-xs text-muted">
                            {tanggalPendek(s.terbitPada)} ·{" "}
                            {s.organisasi?.nama ?? s.penerbit.name}
                          </span>
                        </div>
                        {s.peringkat && (
                          <span className="rounded-full bg-brass-soft px-2.5 py-1 text-xs font-medium text-brass">
                            {s.peringkat}
                          </span>
                        )}
                        <span className="font-mono text-xs text-muted">
                          {s.kode}
                        </span>
                      </Kartu>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
            <p className="text-xs text-muted">
              Setiap sertifikat dapat diperiksa keasliannya lewat halaman{" "}
              <Link
                href="/cek"
                className="text-accent underline underline-offset-2"
              >
                periksa sertifikat
              </Link>
              .
            </p>
          </section>
        </div>
      </article>
    </BingkaiPublik>
  );
}
