/**
 * Uji tombol sungguhan — lewat peramban, bukan lewat HTTP.
 *
 *   npm run dev        (di terminal lain)
 *   npm run uji:tombol
 *
 * MENGAPA BERKAS INI ADA
 *
 * Sembilan belas suite lain memeriksa aplikasi ini lewat permintaan HTTP dan
 * pembacaan basis data langsung. Tidak satu pun pernah MENEKAN tombol. Lubang
 * itu bukan dugaan: satu kolom formulir yang tidak pernah dibaca peladen
 * membuat setiap penyimpanan profil membuang fotonya, sementara seluruh uji
 * tetap hijau dan aplikasinya tetap menjawab "Profil tersimpan."
 *
 * Yang diuji di sini karena itu bukan tanggapan peladen, melainkan
 * AKIBATNYA: formulir diisi lewat peramban sungguhan, tombolnya ditekan,
 * lalu basis data ditanya apakah yang terjadi memang yang dijanjikan.
 *
 * Berjalan di atas agent-browser, yang mengemudikan Chromium tanpa jendela.
 * Sasarannya localhost — uji yang menekan tombol tidak boleh diarahkan ke
 * lingkungan produksi.
 *
 * DUA PELAJARAN YANG DIBAYAR MAHAL, DITULIS DI SINI SUPAYA TIDAK DIULANG
 *
 * Pertama, sesinya bernama berbeda setiap kali dijalankan. Semula namanya
 * tetap, dan kuki masuk dari jalannya uji sebelumnya masih tersimpan di sana —
 * sehingga membuka /masuk justru dialihkan ke dasbor, dan kolom #email yang
 * dicari tidak pernah ada. Ujinya gagal karena keadaan yang ditinggalkan
 * dirinya sendiri, bukan karena aplikasinya.
 *
 * Kedua, setiap perintah peramban dibatasi waktu. Tanpa batas itu, satu
 * perintah yang menggantung membuat seluruh uji menunggu selamanya — dan
 * menunggu selamanya jauh lebih sulit didiagnosis daripada gagal. Yang paling
 * sering menggantung justru `close --all` ketika tidak ada sesi untuk ditutup,
 * yakni persis keadaan saat penanganan galat memanggilnya.
 */
import "dotenv/config";

import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "../src/generated/prisma/client";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL belum diisi.");
const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

const PANGKALAN = process.env.UJI_URL ?? "http://localhost:3000";
const KATA_SANDI = "DemakMuda2026!";
/** Nama sesi berbeda tiap kali dijalankan, supaya kuki lama tidak terbawa. */
const SESI = `uji-tombol-${process.pid}`;

/** Batas waktu satu perintah peramban. Menggantung harus menjadi kegagalan. */
const BATAS_MS = 90_000;

let gagal = 0;
function periksa(lulus: boolean, keterangan: string) {
  console.log(`  ${lulus ? "✓" : "✗"} ${keterangan}`);
  if (!lulus) gagal++;
}

/** Berkas jalan agent-browser, dipanggil langsung tanpa perantara npx. */
const KENDALI = fileURLToPath(
  new URL("../node_modules/agent-browser/bin/agent-browser.js", import.meta.url),
);

/**
 * Perintahnya diserahkan sebagai JSON lewat stdin, bukan sebagai deretan
 * argumen.
 *
 * Bentuk argumen memecah tiap perintah pada spasi, sehingga
 * `fill #rp Juara 1` terbaca sebagai tiga bagian dan nilai "Juara 1" tidak
 * pernah sampai utuh. Nama prestasi, peringkat, dan penyelenggara semuanya
 * mengandung spasi — persis hal yang sedang diuji. Bentuk JSON menjaga setiap
 * nilai tetap satu bagian.
 */
async function ramban(perintah: string[][]): Promise<string> {
  // Berkas JS-nya dipanggil langsung dengan Node, bukan lewat npx. Di Windows,
  // menjalankan pembungkus .cmd menuntut shell: true — dan begitu shell ikut
  // terlibat, teks isian dapat berubah menjadi perintah shell.
  return new Promise((selesai, tolak) => {
    const anak = spawn(process.execPath, [KENDALI, "--session", SESI, "batch", "--bail"], {
      windowsHide: true,
    });
    let keluaran = "";
    let galat = "";

    const jam = setTimeout(() => {
      anak.kill();
      tolak(
        new Error(
          `perintah peramban menggantung lebih dari ${BATAS_MS / 1000} detik:\n` +
            `${JSON.stringify(perintah)}\n${galat}${keluaran}`,
        ),
      );
    }, BATAS_MS);

    anak.stdout.on("data", (d) => (keluaran += d));
    anak.stderr.on("data", (d) => (galat += d));
    anak.on("error", (e) => {
      clearTimeout(jam);
      tolak(e);
    });
    // "exit", BUKAN "close". Peristiwa close baru menyala setelah seluruh pipa
    // keluaran tertutup — dan proses peramban yang dilahirkan agent-browser
    // ikut memegang pipa itu setelah induknya selesai. Menunggu close berarti
    // menunggu peramban mati, padahal peramban memang sengaja dibiarkan hidup
    // untuk perintah berikutnya. Akibatnya perintah yang sudah beres tampak
    // menggantung, dan itu jauh lebih membingungkan daripada gagal.
    //
    // Jeda pendek memberi kesempatan sisa keluaran sampai sebelum dibaca.
    anak.on("exit", (kode) => {
      setTimeout(() => {
        clearTimeout(jam);
        if (kode === 0) selesai(keluaran);
        else tolak(new Error(`agent-browser keluar dengan kode ${kode}\n${galat}${keluaran}`));
      }, 120);
    });
    anak.stdin.end(JSON.stringify(perintah));
  });
}

async function main() {
  console.log(`Menguji ${PANGKALAN} lewat peramban sungguhan\n`);

  const rani = await prisma.user.findUniqueOrThrow({
    where: { email: "pemuda@demakmuda.test" },
    select: { id: true },
  });

  // ── Masuk lewat formulir, bukan lewat api/auth ──
  //
  // Bedanya bukan kerapian. Memanggil titik akhir autentikasi langsung akan
  // melewati formulirnya, dan formulir itulah yang pernah rusak.
  console.log("masuk lewat formulir");
  // open HARUS mendahului set viewport. Menyetel ukuran jendela sebelum ada
  // peramban yang berjalan membuat perintahnya menunggu tanpa batas — bukan
  // menjawab galat, melainkan menggantung, yang jauh lebih sulit dikenali.
  await ramban([
    ["open", `${PANGKALAN}/masuk`],
    ["set", "viewport", "1440", "1200"],
    ["fill", "#email", "pemuda@demakmuda.test"],
    ["fill", "#kataSandi", KATA_SANDI],
    ["click", "button[type=submit]"],
    ["wait", "4000"],
  ]);
  const setelahMasuk = await ramban([["get", "url"]]);
  periksa(
    !setelahMasuk.includes("/masuk"),
    `formulir masuk membawa pergi dari halaman masuk (${setelahMasuk.trim().split("\n").pop()})`,
  );

  // ── 1. Menyimpan profil benar-benar mengubah basis data ──
  //
  // Inilah cacat yang pernah lolos. Bio diubah lewat kolomnya, tombolnya
  // ditekan, lalu basis data ditanya. Bila peladen berhenti membaca salah satu
  // kolom, uji ini merah — sekalipun aplikasinya tetap berkata tersimpan.
  console.log("\nmenyimpan profil");
  const bioLama = (
    await prisma.profilPemuda.findUniqueOrThrow({
      where: { userId: rani.id },
      select: { bio: true },
    })
  ).bio;
  const bioBaru = `Bio uji tombol ${Date.now()}`;

  await ramban([
    ["open", `${PANGKALAN}/pemuda/profil`],
    ["wait", "3000"],
    ["fill", "#bio", bioBaru],
    ["click", "button[type=submit]"],
    ["wait", "4000"],
  ]);

  const sesudah = await prisma.profilPemuda.findUniqueOrThrow({
    where: { userId: rani.id },
    select: { bio: true, fotoUrl: true, kecamatanId: true, slug: true },
  });
  periksa(sesudah.bio === bioBaru, "bio yang diketik benar-benar tersimpan");
  periksa(
    sesudah.kecamatanId !== null,
    "kecamatan TIDAK ikut terhapus oleh penyimpanan",
  );

  const halamanPublik = await fetch(`${PANGKALAN}/p/${sesudah.slug}`).then((r) => r.text());
  periksa(halamanPublik.includes(bioBaru), "perubahannya tampil di kartu publik");

  await prisma.profilPemuda.update({
    where: { userId: rani.id },
    data: { bio: bioLama },
  });

  // ── 2. Menambah prestasi lewat formulirnya ──
  console.log("\nmenambah prestasi lewat formulir");
  const profil = await prisma.profilPemuda.findUniqueOrThrow({
    where: { userId: rani.id },
    select: { id: true },
  });
  const judulUji = `Lomba Uji Tombol ${Date.now()}`;
  const sebelumTambah = await prisma.prestasi.count({ where: { profilId: profil.id } });

  // Kedua formulir pada halaman ini punya button[type=submit]. Tombol yang
  // dituju dipilih lewat formulir yang MEMUAT kolom #rj, bukan lewat urutan
  // tombolnya — urutan berubah begitu tata letaknya digeser, dan uji yang
  // bergantung pada urutan akan diam-diam menekan tombol yang salah.
  const TOMBOL_PRESTASI = "form:has(#rj) button[type=submit]";

  await ramban([
    ["open", `${PANGKALAN}/pemuda/rekam-jejak`],
    ["wait", "3000"],
    ["fill", "#rj", judulUji],
    ["select", "#rt", "PROVINSI"],
    ["fill", "#rp", "Juara 1"],
    ["fill", "#rn", "Panitia uji otomatis"],
    ["fill", "#rh", "2025"],
    ["click", TOMBOL_PRESTASI],
    ["wait", "4000"],
  ]);

  const tersimpan = await prisma.prestasi.findFirst({
    where: { profilId: profil.id, judul: judulUji },
    select: { id: true, tingkat: true, peringkat: true, tahun: true, penyelenggara: true },
  });
  periksa(tersimpan !== null, "prestasi yang diketik benar-benar tersimpan");
  periksa(tersimpan?.tingkat === "PROVINSI", "kolom pilihan tingkat ikut terbaca");
  periksa(tersimpan?.peringkat === "Juara 1", "kolom peringkat ikut terbaca");
  periksa(tersimpan?.tahun === 2025, "kolom tahun ikut terbaca sebagai angka");
  periksa(
    tersimpan?.penyelenggara === "Panitia uji otomatis",
    "kolom penyelenggara ikut terbaca",
  );
  periksa(
    (await prisma.prestasi.count({ where: { profilId: profil.id } })) === sebelumTambah + 1,
    "tepat satu baris bertambah, bukan dua",
  );

  // ── 3. Menghapus prestasi lewat tombolnya ──
  console.log("\nmenghapus prestasi lewat tombol");
  if (tersimpan) {
    await ramban([
      ["open", `${PANGKALAN}/pemuda/rekam-jejak`],
      ["wait", "3000"],
      ["click", `button[aria-label="Hapus prestasi ${judulUji}"]`],
      ["wait", "4000"],
    ]);
    periksa(
      (await prisma.prestasi.findUnique({ where: { id: tersimpan.id } })) === null,
      "prestasi terhapus dari basis data",
    );
  }

  // ── 4. Isian yang tidak sah ditolak, dan tidak menyisakan apa pun ──
  //
  // Penolakan yang tetap menulis separuh data lebih berbahaya daripada
  // penolakan yang berisik, karena tidak ada yang tahu ada yang tertulis.
  console.log("\nisian yang tidak sah");
  const judulTolak = `Uji Tolak ${Date.now()}`;
  await ramban([
    ["open", `${PANGKALAN}/pemuda/rekam-jejak`],
    ["wait", "3000"],
    ["fill", "#rj", judulTolak],
    ["fill", "#rh", "1899"],
    ["click", TOMBOL_PRESTASI],
    ["wait", "3000"],
  ]);
  periksa(
    (await prisma.prestasi.count({ where: { profilId: profil.id, judul: judulTolak } })) === 0,
    "tahun di luar batas ditolak dan tidak menyisakan baris",
  );

  await ramban([["close"]]).catch(() => {});
  console.log(gagal === 0 ? "\nSemua pemeriksaan lulus." : `\n${gagal} pemeriksaan GAGAL.`);
  await prisma.$disconnect();
  process.exit(gagal === 0 ? 0 : 1);
}

main().catch(async (e) => {
  console.error(e);
  await ramban([["close"]]).catch(() => {});
  await prisma.$disconnect();
  process.exit(1);
});
