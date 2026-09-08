/**
 * Uji Panduan Karier.
 *
 *   npm run dev          (di terminal lain)
 *   npm run uji:panduan
 *
 * Panggilan ke MiniMax SENGAJA tidak ikut diuji. Ia memakan kuota, memakan dua
 * puluh tiga detik, dan hasilnya berbeda tiap kali — tiga sifat yang membuat
 * sebuah uji menjadi tidak dapat dipercaya. Yang diuji di sini justru bagian
 * yang menentukan apakah jawabannya layak ditampilkan: pembersihan blok
 * penalaran, penolakan aksara asing, penyusunan permintaan, dan penjagaan
 * halaman.
 */
import "dotenv/config";

import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "../src/generated/prisma/client";
import { adaAksaraAsing, buangPenalaran } from "../src/lib/minimax";
import { PERTANYAAN, SISTEM, susunPermintaan } from "../src/lib/panduan";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL belum diisi.");
const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

const PANGKALAN = process.env.UJI_URL ?? "http://localhost:3000";

let gagal = 0;
function periksa(lulus: boolean, keterangan: string) {
  console.log(`  ${lulus ? "✓" : "✗"} ${keterangan}`);
  if (!lulus) gagal++;
}

async function main() {
  console.log(`Menguji ${PANGKALAN}\n`);

  // Modelnya menuliskan proses berpikirnya di dalam jawaban. Bila blok itu
  // lolos, yang dibaca pemuda adalah model sedang menimbang dirinya sendiri.
  console.log("pembersihan blok penalaran");
  periksa(
    buangPenalaran("<think>menimbang</think>\n## Langkah 1") === "## Langkah 1",
    "blok tertutup dibuang",
  );
  periksa(
    buangPenalaran("## Langkah 1\n<think>terpotong di tengah") === "## Langkah 1",
    "blok yang tidak tertutup ikut dibuang, bukan disisakan separuh",
  );
  periksa(
    buangPenalaran("<THINK>besar</THINK>x").trim() === "x",
    "huruf besar-kecil tidak menipu",
  );
  periksa(
    buangPenalaran("## Langkah 1 — tanpa penalaran") ===
      "## Langkah 1 — tanpa penalaran",
    "jawaban bersih tidak berubah",
  );

  // Tanpa larangan di system prompt, modelnya menyisipkan kata Tionghoa ke
  // tengah kalimat Indonesia. Prompt adalah permintaan; ini jaminannya.
  console.log("\npenjagaan aksara asing");
  periksa(adaAksaraAsing("Perdalam软件 desain"), "aksara Tionghoa tertangkap");
  periksa(adaAksaraAsing("belajar デザイン"), "aksara Jepang tertangkap");
  periksa(adaAksaraAsing("무엇"), "aksara Korea tertangkap");
  periksa(
    !adaAksaraAsing("Belajar desain grafis di Demak — gratis, pakai Canva."),
    "kalimat Indonesia biasa tidak ikut tertangkap",
  );
  periksa(
    !adaAksaraAsing("Gunakan tanda “kutip” dan em dash — keduanya sah."),
    "tanda baca tipografis tidak dianggap aksara asing",
  );

  console.log("\nsystem prompt");
  periksa(
    /DILARANG memakai aksara Tionghoa/.test(SISTEM),
    "larangan aksara asing tercantum tegas",
  );
  periksa(
    /ALAT yang dimilikinya/.test(SISTEM),
    "modelnya diperintahkan menyesuaikan diri dengan alat yang dimiliki",
  );
  periksa(
    /Jangan mengarang nama lembaga/.test(SISTEM),
    "modelnya dilarang mengarang nama lembaga atau beasiswa",
  );

  console.log("\npenyusunan permintaan");
  const permintaan = susunPermintaan(
    {
      citaCita: "Jadi desainer grafis",
      sasaranWaktu: "1-tahun",
      kesediaanPindah: "tetap-demak",
      status: "mencari",
      pendidikan: "sma",
      alat: "ponsel",
      tingkat: "dasar",
      waktuLuang: "sedang",
      kendala: ["biaya", "arah"],
    },
    {
      usia: 19,
      kecamatan: "Wedung",
      sekolah: null,
      minat: ["Desain dan Industri Kreatif"],
      keterampilan: ["Desain Grafis"],
      prestasi: [],
      organisasi: [],
    },
  );
  periksa(permintaan.includes("Wedung"), "kecamatan dari profil ikut dikirim");
  periksa(
    permintaan.includes("Hanya ponsel"),
    "pilihan dikirim sebagai label yang terbaca, bukan kodenya",
  );
  periksa(
    permintaan.includes("Biaya") && permintaan.includes("Tidak tahu harus mulai dari mana"),
    "jawaban berganda dikirim seluruhnya",
  );
  periksa(
    permintaan.includes("belum ada"),
    "bagian profil yang kosong disebut apa adanya, bukan dihilangkan",
  );

  // Formulir dan penyusun prompt membaca daftar yang sama. Bila suatu saat
  // keduanya dipisah, uji ini yang pertama merah.
  console.log("\nkeutuhan daftar pertanyaan");
  periksa(PERTANYAAN.length === 9, `sembilan pertanyaan (ada ${PERTANYAAN.length})`);
  periksa(
    PERTANYAAN.filter((p) => p.jenis === "teks").length === 1,
    "hanya satu pertanyaan yang perlu diketik",
  );
  periksa(
    PERTANYAAN.every((p) => p.jenis === "teks" || (p.pilihan?.length ?? 0) >= 2),
    "setiap pertanyaan pilihan punya sekurang-kurangnya dua pilihan",
  );
  periksa(
    PERTANYAAN.some((p) => p.nama === "alat"),
    "pertanyaan alat ada — panduan untuk pemilik ponsel harus berbeda",
  );
  periksa(
    new Set(PERTANYAAN.map((p) => p.nama)).size === PERTANYAAN.length,
    "tidak ada nama pertanyaan yang kembar",
  );

  console.log("\npenjagaan halaman");
  const res = await fetch(`${PANGKALAN}/pemuda/panduan`, { redirect: "manual" });
  const tujuan = res.headers.get("location");
  periksa(
    res.status === 307 && (tujuan?.includes("/masuk") ?? false),
    `menuntut masuk lebih dahulu (dapat ${res.status})`,
  );

  console.log("\nkerahasiaan");
  // Panduannya memuat kendala biaya dan dukungan keluarga. Ia tidak boleh
  // pernah bocor ke kartu yang dibuka umum.
  const contoh = await prisma.panduanKarier.findFirst({
    select: { hasil: true, profil: { select: { slug: true } } },
  });
  if (contoh) {
    const kartu = await fetch(`${PANGKALAN}/p/${contoh.profil.slug}`);
    const isi = await kartu.text();
    const potong = contoh.hasil.slice(0, 60);
    periksa(
      !isi.includes(potong),
      "panduan TIDAK tampil di Kartu Talenta yang dibuka umum",
    );
    periksa(
      !isi.includes("Panduan Karier"),
      "kartu publik bahkan tidak menyebut adanya panduan",
    );
  } else {
    console.log("  – belum ada panduan tersimpan, pemeriksaan kerahasiaan dilewati");
  }

  console.log(gagal === 0 ? "\nSemua pemeriksaan lulus." : `\n${gagal} pemeriksaan GAGAL.`);
  await prisma.$disconnect();
  // process.exitCode, BUKAN process.exit(). Pemanggilan fetch meninggalkan
  // socket keep-alive yang masih menutup diri, dan process.exit() menabraknya
  // di tengah jalan — pada Windows itu memicu galat penegasan libuv, sehingga
  // uji yang LULUS keluar dengan kode 127 dan terbaca sebagai gagal.
  process.exitCode = gagal === 0 ? 0 : 1;
}

main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exitCode = 1;
});
