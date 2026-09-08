/**
 * Klien MiniMax untuk Panduan Karier.
 *
 * Dipisahkan dari Server Action-nya supaya bagian yang paling mungkin gagal —
 * jaringan, bentuk balasan, kebersihan teks — dapat diuji tanpa basis data dan
 * tanpa sesi. Seluruh fungsi di bawah murni kecuali `mintaPanduan`.
 *
 * MiniMax menyediakan antarmuka yang serasi dengan OpenAI. Alamat dan nama
 * modelnya diambil dari dokumentasi resmi Moonshot, bukan dari ingatan, dan
 * sudah dipastikan bekerja dengan panggilan sungguhan sebelum berkas ini
 * ditulis.
 */

const ALAMAT = "https://api.minimax.io/v1/chat/completions";

/**
 * MiniMax-M2.5 dipilih setelah dibandingkan dengan varian -highspeed. Pada
 * pengujian, varian "highspeed" justru lebih lambat (8,3 detik lawan 5,8) dan
 * ia yang membocorkan aksara Tionghoa ke tengah kalimat Indonesia.
 */
export const MODEL = "MiniMax-M2.5";

/**
 * Empat puluh lima detik.
 *
 * Angka ini dinaikkan setelah pengukuran ujung ke ujung, dan pelajarannya
 * layak dicatat. Panggilan percobaan dengan pertanyaan pendek selesai dalam
 * 5,8 detik, dan atas dasar itu batasnya semula dipasang 25 detik. Permintaan
 * yang SESUNGGUHNYA — memuat rangkuman Kartu Talenta, sembilan jawaban survei,
 * dan menghasilkan panduan tiga ribu huruf — memakan 23,1 detik.
 *
 * Batas 25 detik itu akan menggugurkan sebagian permintaan yang sebenarnya
 * berjalan baik, dan kegagalannya akan terlihat seperti gangguan jaringan.
 * Mengukur dengan beban yang benar mengubah angkanya hampir dua kali lipat.
 *
 * Karena selama itu pula panduan dibuat lewat TOMBOL, bukan saat halaman
 * dibuka, dan hasilnya disimpan supaya tidak pernah disusun dua kali.
 */
const BATAS_MS = 45_000;

/** Panduan tiga langkah berbentuk Markdown jarang melewati angka ini. */
const BATAS_TOKEN = 1500;

/**
 * Aksara yang tidak boleh ada satu pun di dalam jawaban.
 *
 * Modelnya dilatih terutama dalam bahasa Tionghoa, dan tanpa larangan tegas di
 * system prompt ia menyisipkan kata Tionghoa ke tengah kalimat Indonesia —
 * pada pengujian keluar "Perdalam软件 desain". Larangan di prompt sudah
 * menekannya sampai nol pada tiga percobaan berturut-turut, tetapi prompt
 * adalah permintaan, bukan jaminan. Pemeriksaan ini yang menjadikannya
 * jaminan.
 */
const AKSARA_ASING =
  /[　-〿぀-ヿ一-鿿가-힯؀-ۿ]/;

/**
 * Membuang blok penalaran model.
 *
 * M2.5 menuliskan proses berpikirnya di dalam `content`, dibungkus <think>.
 * Isinya tidak layak dibaca pemuda — ia berisi model sedang menimbang-nimbang
 * dirinya sendiri — dan pada pengujian pertama justru MENGHABISKAN seluruh
 * jatah token sehingga jawabannya tidak sempat keluar.
 *
 * Blok yang tidak tertutup ikut dibuang: bila jawabannya terpotong di tengah
 * penalaran, yang tersisa bukan panduan, melainkan potongan pikiran.
 */
export function buangPenalaran(teks: string): string {
  return teks
    .replace(/<think>[\s\S]*?<\/think>/gi, "")
    .replace(/<think>[\s\S]*$/i, "")
    .trim();
}

/** Benar bila teksnya memuat aksara di luar Latin yang dilarang. */
export function adaAksaraAsing(teks: string): boolean {
  return AKSARA_ASING.test(teks);
}

export type HasilPanduan =
  | { ok: true; teks: string; model: string }
  | { ok: false; sebab: Sebab; pesan: string };

export type Sebab =
  | "kunci-kosong"
  | "jaringan"
  | "ditolak"
  | "kosong"
  | "aksara-asing";

function gagal(sebab: Sebab, pesan: string): HasilPanduan {
  return { ok: false, sebab, pesan };
}

/**
 * Meminta panduan ke MiniMax.
 *
 * Tidak pernah melempar. Seluruh kegagalan dikembalikan sebagai nilai supaya
 * pemanggilnya wajib menanganinya — kegagalan jaringan di sini bukan hal luar
 * biasa, melainkan hal yang pasti sesekali terjadi.
 *
 * Kunci dibaca saat dipanggil, bukan saat modul dimuat, supaya `next build`
 * tidak menuntutnya ada pada tahap pembangunan.
 */
export async function mintaPanduan(
  sistem: string,
  pengguna: string,
): Promise<HasilPanduan> {
  const kunci = process.env.MINIMAX_API_KEY;
  if (!kunci) {
    return gagal(
      "kunci-kosong",
      "Layanan panduan belum disetel di peladen ini.",
    );
  }

  const pembatal = AbortSignal.timeout(BATAS_MS);

  let balasan: Response;
  try {
    balasan = await fetch(ALAMAT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${kunci}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: BATAS_TOKEN,
        messages: [
          { role: "system", content: sistem },
          { role: "user", content: pengguna },
        ],
      }),
      signal: pembatal,
    });
  } catch (e) {
    console.error("[minimax] jaringan", e);
    return gagal(
      "jaringan",
      "Layanan panduan tidak dapat dihubungi. Coba lagi sebentar lagi.",
    );
  }

  if (!balasan.ok) {
    console.error("[minimax] status", balasan.status, await balasan.text());
    return gagal("ditolak", "Layanan panduan menolak permintaan ini.");
  }

  let isi: unknown;
  try {
    isi = await balasan.json();
  } catch (e) {
    console.error("[minimax] balasan bukan JSON", e);
    return gagal("kosong", "Balasan layanan panduan tidak dapat dibaca.");
  }

  const mentah = bacaIsi(isi);
  if (!mentah) {
    console.error("[minimax] bentuk balasan tak dikenal", isi);
    return gagal("kosong", "Layanan panduan tidak mengembalikan apa pun.");
  }

  const teks = buangPenalaran(mentah);
  if (teks.length < 80) {
    return gagal("kosong", "Panduan yang tersusun terlalu pendek.");
  }

  // Ditolak, bukan dibersihkan. Membuang aksaranya satu per satu akan
  // meninggalkan kalimat yang bolong di tengah — lebih buruk daripada meminta
  // pemuda menekan tombolnya sekali lagi.
  if (adaAksaraAsing(teks)) {
    console.error("[minimax] aksara asing lolos ke jawaban");
    return gagal(
      "aksara-asing",
      "Panduan yang tersusun tercampur bahasa lain. Silakan coba lagi.",
    );
  }

  return { ok: true, teks, model: MODEL };
}

/** Membaca `choices[0].message.content` tanpa memercayai bentuk balasannya. */
function bacaIsi(isi: unknown): string | null {
  if (typeof isi !== "object" || isi === null) return null;
  const pilihan = (isi as { choices?: unknown }).choices;
  if (!Array.isArray(pilihan) || pilihan.length === 0) return null;
  const pesan = (pilihan[0] as { message?: unknown }).message;
  if (typeof pesan !== "object" || pesan === null) return null;
  const teks = (pesan as { content?: unknown }).content;
  return typeof teks === "string" && teks.trim() !== "" ? teks : null;
}
