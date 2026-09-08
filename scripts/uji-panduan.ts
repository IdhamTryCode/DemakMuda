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
import {
  BATAS_TEKS,
  PERTANYAAN,
  SISTEM,
  susunPermintaan,
  uraiJawaban,
} from "../src/lib/panduan";

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
    select: { hasil: true, jawaban: true, profil: { select: { slug: true } } },
  });
  if (contoh) {
    const kartu = await fetch(`${PANGKALAN}/p/${contoh.profil.slug}`);
    const isi = await kartu.text();

    // Diperiksa dari TENGAH panduannya, bukan dari awalnya. Pembukaan panduan
    // cenderung berbunyi mirip antar-orang; bagian tengahnya khas milik satu
    // orang, sehingga kebocoran sekecil apa pun tertangkap.
    const tengah = contoh.hasil.slice(
      Math.floor(contoh.hasil.length / 2),
      Math.floor(contoh.hasil.length / 2) + 80,
    );
    periksa(
      tengah.length > 40 && !isi.includes(tengah),
      "isi panduan TIDAK tampil di Kartu Talenta yang dibuka umum",
    );

    // Cita-citanya diketik sendiri dan tidak dapat ditebak dari data lain —
    // penanda paling tajam bila jawaban survei sampai bocor ke halaman publik.
    const jawaban = contoh.jawaban as Record<string, unknown>;
    const cita = typeof jawaban.citaCita === "string" ? jawaban.citaCita : "";
    periksa(
      cita.length > 10 && !isi.includes(cita),
      "jawaban survei TIDAK tampil di kartu publik",
    );

    // Label menu "Panduan Karier" MEMANG ada di bilah setiap halaman, dan itu
    // disengaja — ia mengajak pengunjung membuat akun. Yang dijaga isinya,
    // bukan namanya. Asersi sebelumnya melarang namanya muncul, lalu merah
    // begitu menunya dipasang; larangan yang salah sasaran seperti itu melatih
    // orang mengabaikan warna merah.
    periksa(
      !isi.includes("Panduan terbaru") && !isi.includes("Panduan sebelumnya"),
      "kartu publik tidak memuat bagian panduan mana pun",
    );
  } else {
    console.log("  – belum ada panduan tersimpan, pemeriksaan kerahasiaan dilewati");
  }

  console.log("\npengurai jawaban");
  // Formulir membatasi panjang cita-cita lewat maxLength, tetapi formulir
  // bukan penjaga: permintaan dapat dibuat tanpa formulir. Yang menjaga adalah
  // pengurai di peladen, dan batasnya harus SAMA dengan batas formulirnya.
  const lengkap = new FormData();
  for (const p of PERTANYAAN) {
    if (p.jenis === "teks") lengkap.set(p.nama, "x".repeat(5_000));
    else if (p.jenis === "pilih") lengkap.set(p.nama, p.pilihan![0].nilai);
    else for (const o of p.pilihan!.slice(0, 2)) lengkap.append(p.nama, o.nilai);
  }
  const hasilUrai = uraiJawaban(lengkap);
  periksa(hasilUrai.kurang.length === 0, "jawaban lengkap tidak menyisakan yang kurang");
  periksa(
    String(hasilUrai.jawaban.citaCita).length === BATAS_TEKS,
    `cita-cita 5.000 karakter dipotong menjadi ${BATAS_TEKS}`,
  );

  // FormData tidak punya penyalin; konstruktornya hanya menerima elemen form.
  const salin = (asal: FormData) => {
    const s = new FormData();
    for (const [k, v] of asal) s.append(k, v);
    return s;
  };

  const pilihAsing = salin(lengkap);
  const satuPilih = PERTANYAAN.find((p) => p.jenis === "pilih")!;
  pilihAsing.set(satuPilih.nama, "nilai-karangan");
  periksa(
    uraiJawaban(pilihAsing).kurang.includes(satuPilih.nama),
    "nilai pilih-satu yang tidak ada di daftar dianggap belum dijawab",
  );

  const banyakAsing = salin(lengkap);
  const satuBanyak = PERTANYAAN.find((p) => p.jenis === "banyak")!;
  banyakAsing.append(satuBanyak.nama, "nilai-karangan");
  const dibaca = uraiJawaban(banyakAsing).jawaban[satuBanyak.nama];
  periksa(
    Array.isArray(dibaca) && !dibaca.includes("nilai-karangan") && dibaca.length === 2,
    "nilai pilih-banyak yang tidak ada di daftar dibuang, sisanya tetap dipakai",
  );

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
