/**
 * Menyemai gambar contoh untuk Kabar, Ruang Karya, dan Direktori Organisasi.
 *
 *   npm run db:seed:gambar
 *
 * Gambarnya DIBANGKITKAN, bukan diambil dari mana pun: pola geometris abstrak
 * dari palet aplikasi ini sendiri. Tidak ada foto, dan tidak ada yang
 * berpura-pura menjadi rekaman tempat atau orang sungguhan — isi contoh
 * seluruhnya karangan, dan gambarnya harus jujur mengatakan hal yang sama.
 *
 * Bentuknya ditentukan oleh slug, jadi satu isi selalu mendapat gambar yang
 * sama setiap dibangkitkan ulang. Jalurnya pun tetap dan ditimpa, bukan
 * ditambah, supaya penyemaian berulang tidak menumpuk berkas yatim.
 *
 * Baris yang gambarnya sudah diisi sendiri oleh pengguna TIDAK disentuh.
 *
 * HANYA untuk pengembangan dan peragaan.
 */
import "dotenv/config";

import { PrismaPg } from "@prisma/adapter-pg";
import { put } from "@vercel/blob";
import sharp from "sharp";

import { PrismaClient } from "../../src/generated/prisma/client";

if (process.env.NODE_ENV === "production") {
  throw new Error("Gambar contoh tidak boleh disemai di lingkungan produksi.");
}

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL belum diisi.");
if (!process.env.BLOB_READ_WRITE_TOKEN) {
  throw new Error("BLOB_READ_WRITE_TOKEN belum diisi. Lihat README bagian penyimpanan.");
}
const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

/** Awalan jalur khusus gambar contoh, supaya terpisah dari unggahan sungguhan. */
const AWALAN = "contoh";

/** Palet diambil dari token permukaan di globals.css, bukan warna lepas. */
const PALET = [
  { latar: "#0d5c4c", aksen: "#57c2a5", garis: "#0a4a3d", tinta: "#f4faf7" },
  { latar: "#7d5416", aksen: "#d7a954", garis: "#5f3f10", tinta: "#f3ead7" },
  { latar: "#16332b", aksen: "#147762", garis: "#0e211c", tinta: "#dfece6" },
  { latar: "#e4e8de", aksen: "#0d5c4c", garis: "#b9c3b3", tinta: "#111a15" },
  { latar: "#96301f", aksen: "#e78d7d", garis: "#701f12", tinta: "#f8e6e2" },
  { latar: "#253229", aksen: "#d7a954", garis: "#16211c", tinta: "#e6ede8" },
];

/** Bilangan tetap dari sebuah teks. Dipakai memilih palet dan menggeser pola. */
function angkaDari(teks: string): number {
  let n = 0;
  for (let i = 0; i < teks.length; i++) n = (n * 31 + teks.charCodeAt(i)) >>> 0;
  return n;
}

function huruf(nama: string): string {
  const kata = nama
    .replace(/[^A-Za-z\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
  const a = kata[0]?.[0] ?? "D";
  const b = kata[1]?.[0] ?? kata[0]?.[1] ?? "M";
  return (a + b).toUpperCase();
}

/**
 * Lengkung berlapis, mengingatkan pada akar bakau dan garis pasang — motif
 * yang berulang di sepanjang isi contoh DemakMuda.
 */
function svgKarya(slug: string, nama: string): string {
  const n = angkaDari(slug);
  const p = PALET[n % PALET.length];
  const L = 1200;
  const T = 750;
  const geser = n % 160;

  const busur = Array.from({ length: 7 }, (_, i) => {
    const r = 180 + i * 105;
    const tebal = 3 + ((n >> (i + 1)) % 5);
    const buram = 0.9 - i * 0.09;
    return `<circle cx="${180 + geser}" cy="${T + 60}" r="${r}" fill="none" stroke="${p.aksen}" stroke-width="${tebal}" opacity="${buram.toFixed(2)}" />`;
  }).join("");

  // Sebarannya diputar tiap langkah, bukan digeser terus ke kanan: pergeseran
  // biasa membuat bit habis dan seluruh titik menumpuk di satu tempat.
  const titik = Array.from({ length: 26 }, (_, i) => {
    const a = (n * (i + 7)) >>> 0;
    const x = (a % 1120) + 40;
    const y = ((a >> 9) % 660) + 40;
    const r = 3 + (a % 5);
    return `<circle cx="${x}" cy="${y}" r="${r}" fill="${p.aksen}" opacity="0.5" />`;
  }).join("");

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${L}" height="${T}" viewBox="0 0 ${L} ${T}">
  <defs><linearGradient id="g" x1="0" y1="0" x2="0.4" y2="1">
    <stop offset="0%" stop-color="${p.latar}"/><stop offset="100%" stop-color="${p.garis}"/>
  </linearGradient></defs>
  <rect width="${L}" height="${T}" fill="url(#g)"/>
  <g clip-path="inset(0)">${busur}${titik}</g>
  <rect x="0" y="${T - 10}" width="${L}" height="10" fill="${p.aksen}" opacity="0.85"/>
  <text x="${L - 56}" y="${T - 56}" text-anchor="end" font-family="sans-serif" font-size="86" font-weight="700" fill="${p.tinta}" opacity="0.9">${huruf(nama)}</text>
</svg>`;
}

/** Pita menyerong berlapis — irama kolom pada halaman berita. */
function svgKabar(slug: string, nama: string): string {
  const n = angkaDari(slug);
  const p = PALET[(n + 2) % PALET.length];
  const L = 1200;
  const T = 514;

  // Dua kali disetel: mula-mula terlalu pudar sampai gambarnya tampak kosong,
  // lalu terlalu pekat sampai judul kabar di atasnya kalah ramai. Yang dipakai
  // di antara keduanya — pita cukup terbaca, tetapi tetap menjadi latar.
  const pita = Array.from({ length: 7 }, (_, i) => {
    const a = (n * (i + 5)) >>> 0;
    const x = -200 + i * 210 + (n % 90);
    const lebar = 26 + (a % 62);
    const buram = (0.1 + (a % 4) * 0.05).toFixed(2);
    return `<rect x="${x}" y="-140" width="${lebar}" height="${T + 280}" fill="${p.aksen}" opacity="${buram}" transform="rotate(18 ${x} ${T / 2})"/>`;
  }).join("");

  const tegas = [3].map((i) => {
    const x = -200 + i * 210 + (n % 90) + 14;
    return `<rect x="${x}" y="-140" width="9" height="${T + 280}" fill="${p.aksen}" opacity="0.6" transform="rotate(18 ${x} ${T / 2})"/>`;
  }).join("");

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${L}" height="${T}" viewBox="0 0 ${L} ${T}">
  <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="0.6">
    <stop offset="0%" stop-color="${p.garis}"/><stop offset="100%" stop-color="${p.latar}"/>
  </linearGradient></defs>
  <rect width="${L}" height="${T}" fill="url(#g)"/>
  <g clip-path="inset(0)">${pita}${tegas}</g>
  <rect x="0" y="0" width="${L}" height="8" fill="${p.aksen}" opacity="0.9"/>
  <rect x="56" y="${T - 116}" width="76" height="8" fill="${p.aksen}"/>
  <text x="56" y="${T - 52}" font-family="sans-serif" font-size="60" font-weight="700" fill="${p.tinta}" opacity="0.92">${huruf(nama)}</text>
</svg>`;
}

/** Lambang bundar sederhana, cukup tegas untuk ukuran kecil di daftar. */
function svgOrganisasi(slug: string, nama: string): string {
  const n = angkaDari(slug);
  const p = PALET[(n + 4) % PALET.length];
  const S = 512;
  const sisi = 6 + (n % 5);

  const titikSegi = Array.from({ length: sisi }, (_, i) => {
    const sudut = (Math.PI * 2 * i) / sisi - Math.PI / 2;
    return `${(S / 2 + Math.cos(sudut) * 168).toFixed(1)},${(S / 2 + Math.sin(sudut) * 168).toFixed(1)}`;
  }).join(" ");

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${S}" height="${S}" viewBox="0 0 ${S} ${S}">
  <rect width="${S}" height="${S}" fill="${p.latar}"/>
  <circle cx="${S / 2}" cy="${S / 2}" r="208" fill="none" stroke="${p.aksen}" stroke-width="6" opacity="0.55"/>
  <polygon points="${titikSegi}" fill="none" stroke="${p.aksen}" stroke-width="10" opacity="0.9"/>
  <circle cx="${S / 2}" cy="${S / 2}" r="118" fill="${p.garis}" opacity="0.75"/>
  <text x="${S / 2}" y="${S / 2 + 34}" text-anchor="middle" font-family="sans-serif" font-size="96" font-weight="700" fill="${p.tinta}">${huruf(nama)}</text>
</svg>`;
}

async function unggah(jalur: string, svg: string): Promise<string> {
  const webp = await sharp(Buffer.from(svg)).webp({ quality: 84 }).toBuffer();
  const hasil = await put(`${AWALAN}/${jalur}.webp`, webp, {
    access: "public",
    contentType: "image/webp",
    // Jalur tetap dan ditimpa: gambar contoh selalu sama untuk isi yang sama,
    // jadi penyemaian ulang mengganti berkasnya alih-alih menumpuk yang baru.
    addRandomSuffix: false,
    allowOverwrite: true,
  });
  return hasil.url;
}

/** Benar bila kolomnya masih kosong atau masih berisi gambar contoh. */
function bolehDiganti(alamat: string | null): boolean {
  return !alamat || alamat.includes(`/${AWALAN}/`);
}

/**
 * Foto profil contoh berupa monogram, bukan wajah.
 *
 * Membangkitkan wajah untuk orang karangan akan menghasilkan gambar yang
 * tampak seperti foto seseorang yang sungguh ada — persis yang tidak boleh
 * dilakukan pada data contoh. Monogram jujur mengatakan dirinya buatan, dan
 * tetap membuat Kartu Talenta terlihat lengkap.
 */
function svgFoto(slug: string, nama: string): string {
  const n = angkaDari(slug);
  const p = PALET[(n + 1) % PALET.length];
  const S = 384;

  const cincin = Array.from({ length: 3 }, (_, i) => {
    const r = 150 + i * 46;
    return `<circle cx="${S * 0.22}" cy="${S * 0.88}" r="${r}" fill="none" stroke="${p.aksen}" stroke-width="2" opacity="${(0.5 - i * 0.13).toFixed(2)}"/>`;
  }).join("");

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${S}" height="${S}" viewBox="0 0 ${S} ${S}">
  <defs><linearGradient id="g" x1="0" y1="0" x2="0.5" y2="1">
    <stop offset="0%" stop-color="${p.latar}"/><stop offset="100%" stop-color="${p.garis}"/>
  </linearGradient></defs>
  <rect width="${S}" height="${S}" fill="url(#g)"/>
  <g clip-path="inset(0)">${cincin}</g>
  <text x="${S / 2}" y="${S / 2 + 40}" text-anchor="middle" font-family="sans-serif" font-size="132" font-weight="700" fill="${p.tinta}" opacity="0.95">${huruf(nama)}</text>
</svg>`;
}

/**
 * Piagam contoh untuk bukti prestasi.
 *
 * Sengaja bertuliskan CONTOH sebesar-besarnya dan tanpa nama, lembaga, atau
 * tanda tangan apa pun. Gambar yang menyerupai piagam sungguhan, tanpa penanda,
 * adalah dokumen palsu — sekalipun dibuat hanya untuk peragaan, ia dapat
 * dicomot dan dipakai di tempat lain.
 */
function svgPiagam(kunci: string): string {
  const n = angkaDari(kunci);
  const p = PALET[n % PALET.length];
  const L = 640;
  const T = 452;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${L}" height="${T}" viewBox="0 0 ${L} ${T}">
  <rect width="${L}" height="${T}" fill="#f7f5ef"/>
  <rect x="16" y="16" width="${L - 32}" height="${T - 32}" fill="none" stroke="${p.aksen}" stroke-width="6"/>
  <rect x="30" y="30" width="${L - 60}" height="${T - 60}" fill="none" stroke="${p.garis}" stroke-width="1.5"/>
  <circle cx="${L - 96}" cy="${T - 96}" r="42" fill="none" stroke="${p.aksen}" stroke-width="3" opacity="0.7"/>
  <circle cx="${L - 96}" cy="${T - 96}" r="30" fill="none" stroke="${p.aksen}" stroke-width="1.5" opacity="0.7"/>
  ${Array.from({ length: 4 }, (_, i) => `<rect x="86" y="${196 + i * 26}" width="${i === 3 ? 190 : 330 - i * 24}" height="8" rx="4" fill="${p.garis}" opacity="0.35"/>`).join("")}
  <rect x="86" y="104" width="240" height="20" rx="6" fill="${p.aksen}" opacity="0.55"/>
  <text x="${L / 2}" y="${T / 2 + 26}" text-anchor="middle" font-family="sans-serif" font-size="86" font-weight="700" fill="${p.aksen}" opacity="0.18" letter-spacing="14">CONTOH</text>
</svg>`;
}

async function semaiPiagam() {
  const prestasi = await prisma.prestasi.findMany({
    select: { id: true, buktiUrl: true, judul: true },
  });

  let dibuat = 0;
  let dilewati = 0;
  for (const s of prestasi) {
    if (!bolehDiganti(s.buktiUrl)) {
      dilewati++;
      continue;
    }
    // Sepertiga sengaja dibiarkan tanpa bukti. Justru itu yang memperagakan
    // bedanya di layar penyaringan dinas — kalau semuanya berbukti, saringan
    // "hanya yang melampirkan bukti" tidak pernah kelihatan gunanya.
    if (angkaDari(s.id) % 3 === 0) continue;
    const url = await unggah(`prestasi/${s.id}`, svgPiagam(s.id + s.judul));
    await prisma.prestasi.update({ where: { id: s.id }, data: { buktiUrl: url } });
    dibuat++;
  }

  console.log(
    `Piagam contoh: ${dibuat}` +
      (dilewati > 0 ? ` (${dilewati} dilewati, sudah diunggah sendiri)` : ""),
  );
}

async function semaiFoto() {
  const profil = await prisma.profilPemuda.findMany({
    select: { id: true, slug: true, fotoUrl: true, user: { select: { name: true } } },
  });

  let dibuat = 0;
  let dilewati = 0;
  for (const p of profil) {
    if (!bolehDiganti(p.fotoUrl)) {
      dilewati++;
      continue;
    }
    const url = await unggah(`profil/${p.slug}`, svgFoto(p.slug, p.user.name));
    await prisma.profilPemuda.update({ where: { id: p.id }, data: { fotoUrl: url } });
    dibuat++;
  }

  console.log(
    `Foto profil: ${dibuat}` +
      (dilewati > 0 ? ` (${dilewati} dilewati, sudah diunggah sendiri)` : ""),
  );
}

async function main() {
  let dibuat = 0;
  let dilewati = 0;

  const kabar = await prisma.berita.findMany({
    select: { id: true, slug: true, judul: true, gambarUrl: true },
  });
  for (const k of kabar) {
    if (!bolehDiganti(k.gambarUrl)) {
      dilewati++;
      continue;
    }
    const url = await unggah(`kabar/${k.slug}`, svgKabar(k.slug, k.judul));
    await prisma.berita.update({ where: { id: k.id }, data: { gambarUrl: url } });
    dibuat++;
  }
  console.log(`Kabar bergambar: ${kabar.length - dilewati}`);

  const karya = await prisma.karya.findMany({
    select: { id: true, slug: true, judul: true, gambarUrl: true },
  });
  let lewatKarya = 0;
  for (const k of karya) {
    if (!bolehDiganti(k.gambarUrl)) {
      lewatKarya++;
      continue;
    }
    const url = await unggah(`karya/${k.slug}`, svgKarya(k.slug, k.judul));
    await prisma.karya.update({ where: { id: k.id }, data: { gambarUrl: url } });
    dibuat++;
  }
  console.log(`Karya bergambar: ${karya.length - lewatKarya}`);

  const organisasi = await prisma.organisasi.findMany({
    select: { id: true, slug: true, nama: true, logoUrl: true },
  });
  let lewatOrg = 0;
  for (const o of organisasi) {
    if (!bolehDiganti(o.logoUrl)) {
      lewatOrg++;
      continue;
    }
    const url = await unggah(`organisasi/${o.slug}`, svgOrganisasi(o.slug, o.nama));
    await prisma.organisasi.update({ where: { id: o.id }, data: { logoUrl: url } });
    dibuat++;
  }
  console.log(`Organisasi berlogo: ${organisasi.length - lewatOrg}`);

  await semaiFoto();
  await semaiPiagam();

  const total = dilewati + lewatKarya + lewatOrg;
  if (total > 0) {
    console.log(`${total} dilewati karena gambarnya diunggah sendiri oleh pengguna.`);
  }
  console.log(`Penyemaian gambar contoh selesai: ${dibuat} berkas.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
