/**
 * Mengambil daftar SMA, SMK, dan MA se-Kabupaten Demak, lalu menyimpannya
 * sebagai sekolah.json.
 *
 * Dijalankan sekali saja; hasilnya ikut masuk repositori supaya penyemaian
 * tidak bergantung pada jaringan.
 *
 *   npx tsx prisma/seed/ambil-sekolah.ts
 *
 * Sumber: referensi.data.kemendikdasmen.go.id, pangkalan data resmi
 * Kementerian Pendidikan Dasar dan Menengah. Kode wilayah yang dipakai situs
 * itu bukan kode Kemendagri: Kabupaten Demak adalah 0321, dan tiap kecamatan
 * bernomor 032101 sampai 032114 mengikuti urutan pada halaman kabupatennya.
 *
 * Catatan sumber: peladennya membalas 403 secara acak untuk sebagian
 * permintaan — bukan karena diblokir, sebab permintaan yang sama berhasil bila
 * diulang. Karena itu tiap halaman dicoba beberapa kali dengan jeda, dan skrip
 * berhenti melapor bila ada kecamatan yang benar-benar tidak terambil. Lebih
 * baik gagal terang-terangan daripada menyimpan data yang bolong separuh.
 *
 * SLB tidak diikutkan: model Sekolah hanya mengenal SMA, SMK, dan MA, dan
 * memaksakan SLB ke salah satunya akan salah menggambarkan sekolahnya.
 */
import { writeFileSync } from "node:fs";
import { join } from "node:path";

const PANGKALAN = "https://referensi.data.kemendikdasmen.go.id/pendidikan";
const KODE_KABUPATEN = "0321";
const PERAMBAN =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0 Safari/537.36";

/**
 * Angka acuan dari halaman kabupaten pada sumber yang sama:
 * SMA (sederajat) 117 + SMK (sederajat) 58 = 175, di luar 1 SLB.
 * Penyimpangan besar berarti ada kecamatan yang terlewat.
 */
const HARAP_MINIMAL = 175;
const JUMLAH_KECAMATAN = 14;

type Sekolah = {
  npsn: string;
  nama: string;
  jenjang: "SMA" | "SMK" | "MA";
  status: "NEGERI" | "SWASTA";
  alamat: string;
  desa: string;
  kodeKecamatan: string;
};

/**
 * Menentukan jenjang dari namanya.
 *
 * Urutannya penting: "SMAS" dan "SMKS" memuat "SMA"/"SMK", sedangkan "MAS"
 * dan "MAN" adalah madrasah aliyah — kalau MA diperiksa belakangan, "MAS AR
 * RAHMAN" akan salah masuk karena tidak memuat SMA sama sekali, dan yang lebih
 * berbahaya, pemeriksaan "MA" yang terlalu longgar akan menangkap "SMA".
 */
function jenjangDari(nama: string): Sekolah["jenjang"] | null {
  const n = nama.toUpperCase().trim();
  if (n.startsWith("SLB")) return null;
  if (n.includes("SMK")) return "SMK";
  if (n.includes("SMA")) return "SMA";
  if (/^(MA|MAN|MAS)\b/.test(n)) return "MA";
  // Pendidikan Diniyah Formal (PDF) dan Satuan Pendidikan Muadalah (SPM)
  // jenjang Ulya adalah pendidikan berbasis pesantren yang disetarakan dengan
  // madrasah aliyah — itulah sebabnya angka resmi menyebutnya "SMA sederajat".
  // Digolongkan MA karena enum Jenjang hanya mengenal SMA, SMK, dan MA.
  if (/\bULYA\b/.test(n)) return "MA";
  return null;
}

async function ambilHalaman(kode: string): Promise<string> {
  const alamat = `${PANGKALAN}/dikmen/${kode}/3/all/all/all`;
  for (let percobaan = 1; percobaan <= 14; percobaan++) {
    const res = await fetch(alamat, {
      headers: {
        "user-agent": PERAMBAN,
        referer: `${PANGKALAN}/dikmen/${KODE_KABUPATEN}00/2/all/all/all`,
        accept: "text/html,application/xhtml+xml",
      },
    });
    if (res.ok) return res.text();
    await new Promise((r) => setTimeout(r, 2500 * percobaan));
  }
  throw new Error(`Kecamatan ${kode} tidak dapat diambil setelah 14 percobaan.`);
}

function bersih(html: string): string {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

function bacaBaris(html: string, kode: string, dilewati: string[]): Sekolah[] {
  const hasil: Sekolah[] = [];
  for (const [, isi] of html.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/g)) {
    const sel = [...isi.matchAll(/<td[^>]*>([\s\S]*?)<\/td>/g)].map((m) => bersih(m[1]));
    if (sel.length < 6) continue;

    const [, npsn, nama, alamat, desa, status] = sel;
    if (!/^\d{6,10}$/.test(npsn)) continue;

    const jenjang = jenjangDari(nama);
    if (!jenjang) {
      // Tidak dibuang diam-diam. Nama yang tidak terkenali dilaporkan supaya
      // aturan penggolongannya dapat diperbaiki, bukan supaya jumlahnya
      // sekadar tampak rapi.
      dilewati.push(nama);
      continue;
    }

    hasil.push({
      npsn,
      nama,
      jenjang,
      status: status.toUpperCase() === "NEGERI" ? "NEGERI" : "SWASTA",
      alamat,
      desa,
      kodeKecamatan: kode,
    });
  }
  return hasil;
}

async function main() {
  const semua: Sekolah[] = [];
  const perKecamatan: Record<string, number> = {};
  const dilewati: string[] = [];

  for (let i = 1; i <= JUMLAH_KECAMATAN; i++) {
    const kode = `${KODE_KABUPATEN}${String(i).padStart(2, "0")}`;
    const html = await ambilHalaman(kode);
    const baris = bacaBaris(html, kode, dilewati);
    if (baris.length === 0) {
      throw new Error(`Kecamatan ${kode} terambil tetapi tidak berisi sekolah.`);
    }
    perKecamatan[kode] = baris.length;
    semua.push(...baris);
    console.log(`  ${kode}: ${baris.length} sekolah`);
  }

  // NPSN unik secara nasional; kembar berarti ada halaman yang terbaca dua kali.
  const npsn = new Set(semua.map((s) => s.npsn));
  if (npsn.size !== semua.length) {
    throw new Error(`NPSN kembar: ${semua.length} baris, ${npsn.size} unik.`);
  }
  if (semua.length < HARAP_MINIMAL) {
    throw new Error(
      `Terambil ${semua.length} sekolah, kurang dari ${HARAP_MINIMAL} yang diharapkan.`,
    );
  }

  const perJenjang = semua.reduce<Record<string, number>>((a, s) => {
    a[s.jenjang] = (a[s.jenjang] ?? 0) + 1;
    return a;
  }, {});

  writeFileSync(
    join(import.meta.dirname, "sekolah.json"),
    JSON.stringify(semua, null, 2) + "\n",
    "utf8",
  );

  if (dilewati.length > 0) {
    console.log(`\nDilewati ${dilewati.length} baris yang jenjangnya tidak dikenali:`);
    for (const n of dilewati) console.log(`  - ${n}`);
  }

  console.log(`\nTersimpan: ${semua.length} sekolah`);
  console.log(
    Object.entries(perJenjang)
      .map(([j, n]) => `  ${j}: ${n}`)
      .join("\n"),
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
