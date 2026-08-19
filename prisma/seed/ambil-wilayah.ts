/**
 * Mengambil daftar kecamatan dan desa/kelurahan Kabupaten Demak, lalu
 * menyimpannya sebagai wilayah.json.
 *
 * Dijalankan sekali saja; hasilnya ikut masuk repositori supaya penyemaian
 * tidak bergantung pada jaringan.
 *
 *   npx tsx prisma/seed/ambil-wilayah.ts
 *
 * Sumber: wilayah.id, yang mengikuti kode wilayah administrasi Kemendagri.
 * Kode Kabupaten Demak: 33.21 (Provinsi Jawa Tengah: 33).
 *
 * Catatan sumber: sumber lain yang sempat dicoba (emsifa/api-wilayah-indonesia)
 * hanya memuat 233 desa/kelurahan sehingga tidak dipakai. Jumlah yang benar
 * menurut BPS Kabupaten Demak adalah 249, dan itulah yang diperiksa di bawah.
 */
import { writeFileSync } from "node:fs";
import { join } from "node:path";

const KODE_DEMAK = "33.21";
const SUMBER = "https://wilayah.id/api";

/** Angka acuan dari BPS Kabupaten Demak. Penyimpangan berarti data salah. */
const HARAP_KECAMATAN = 14;
const HARAP_DESA_KELURAHAN = 249;

/**
 * Enam kelurahan Kabupaten Demak, seluruhnya di Kecamatan Demak.
 * Sisanya berstatus desa. Daftar ini diperiksa terhadap data yang diunduh —
 * bila ada nama yang tidak ditemukan, skrip berhenti dan melapor, bukan menebak.
 */
const KELURAHAN = [
  "Betokan",
  "Bintoro",
  "Kalicilik",
  "Katonsari",
  "Mangunjiwan",
  "Singorejo",
];

type Wilayah = { code: string; name: string };

function keSlug(nama: string): string {
  return nama
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

async function ambil(url: string): Promise<Wilayah[]> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Gagal mengambil ${url}: HTTP ${res.status}`);
  const isi = (await res.json()) as { data: Wilayah[] };
  return isi.data;
}

async function main() {
  const kecamatanMentah = await ambil(`${SUMBER}/districts/${KODE_DEMAK}.json`);
  console.log(`Kecamatan ditemukan: ${kecamatanMentah.length}`);

  const kelurahanDitemukan = new Set<string>();
  const kecamatan = [];

  for (const kec of kecamatanMentah) {
    const desaMentah = await ambil(`${SUMBER}/villages/${kec.code}.json`);

    const desa = desaMentah.map((d) => {
      const adalahKelurahan = KELURAHAN.includes(d.name);
      if (adalahKelurahan) kelurahanDitemukan.add(d.name);
      return {
        id: d.code,
        nama: d.name,
        jenis: adalahKelurahan ? "KELURAHAN" : "DESA",
      };
    });

    kecamatan.push({
      id: kec.code,
      nama: kec.name,
      slug: keSlug(kec.name),
      desa,
    });
    console.log(`  ${kec.name}: ${desa.length}`);
  }

  const hilang = KELURAHAN.filter((k) => !kelurahanDitemukan.has(k));
  if (hilang.length > 0) {
    throw new Error(
      `Kelurahan tidak ditemukan pada data: ${hilang.join(", ")}. ` +
        `Periksa ulang daftar KELURAHAN sebelum menyemai.`,
    );
  }

  const total = kecamatan.reduce((n, k) => n + k.desa.length, 0);

  if (kecamatan.length !== HARAP_KECAMATAN) {
    throw new Error(
      `Jumlah kecamatan ${kecamatan.length}, seharusnya ${HARAP_KECAMATAN}.`,
    );
  }
  if (total !== HARAP_DESA_KELURAHAN) {
    throw new Error(
      `Jumlah desa/kelurahan ${total}, seharusnya ${HARAP_DESA_KELURAHAN}. ` +
        `Data sumber kemungkinan tidak lengkap — jangan disemai.`,
    );
  }

  const berkas = join(import.meta.dirname, "wilayah.json");
  writeFileSync(
    berkas,
    JSON.stringify(
      {
        sumber: SUMBER,
        kodeKabupaten: KODE_DEMAK,
        diambilPada: new Date().toISOString().slice(0, 10),
        jumlahKecamatan: kecamatan.length,
        jumlahDesaKelurahan: total,
        kecamatan,
      },
      null,
      2,
    ) + "\n",
  );

  const jumlahKelurahan = kelurahanDitemukan.size;
  console.log(
    `\nTotal: ${kecamatan.length} kecamatan, ${total} desa/kelurahan ` +
      `(${total - jumlahKelurahan} desa + ${jumlahKelurahan} kelurahan)`,
  );
  console.log(`Ditulis ke ${berkas}`);
}

main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
