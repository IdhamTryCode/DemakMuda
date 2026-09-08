/**
 * Survei Panduan Karier: sembilan pertanyaan, dan cara menyusunnya menjadi
 * permintaan untuk model bahasa.
 *
 * Pertanyaannya ditulis sebagai DATA, bukan sebagai formulir. Formulir dan
 * penyusun prompt membaca daftar yang sama, sehingga keduanya tidak mungkin
 * melenceng — menambah pilihan di sini otomatis ikut terbaca oleh keduanya.
 *
 * Yang TIDAK ditanyakan sama pentingnya dengan yang ditanyakan. Umur,
 * kecamatan, desa, sekolah, bidang minat, keterampilan, prestasi, pengalaman,
 * dan keanggotaan organisasi sudah tersimpan di Kartu Talenta. Menanyakannya
 * ulang hanya memperpanjang formulir yang orang tinggalkan di tengah jalan.
 * Sembilan pertanyaan di bawah semuanya menghadap ke DEPAN — hal yang tidak
 * dapat diketahui dari rekam jejak.
 */

export type Pilihan = { nilai: string; label: string };

export type Pertanyaan = {
  nama: string;
  tanya: string;
  /** "teks" diketik bebas; "pilih" satu jawaban; "banyak" boleh lebih dari satu. */
  jenis: "teks" | "pilih" | "banyak";
  kelompok: string;
  pilihan?: Pilihan[];
  bantuan?: string;
};

/**
 * Delapan dari sembilan cukup diketuk. Hanya cita-cita yang diketik, sebab
 * hanya itu yang tidak dapat diringkas menjadi daftar pilihan tanpa
 * mempersempit jawabannya.
 */
export const PERTANYAAN: Pertanyaan[] = [
  {
    nama: "citaCita",
    tanya: "Apa cita-citamu, atau bidang yang ingin kamu tekuni?",
    jenis: "teks",
    kelompok: "Arah",
    bantuan: "Boleh belum pasti. Tulis apa adanya, misalnya “jadi desainer grafis” atau “buka usaha kopi sendiri”.",
  },
  {
    nama: "sasaranWaktu",
    tanya: "Panduan ini untuk berapa lama ke depan?",
    jenis: "pilih",
    kelompok: "Arah",
    pilihan: [
      { nilai: "6-bulan", label: "Enam bulan" },
      { nilai: "1-tahun", label: "Satu tahun" },
      { nilai: "3-tahun", label: "Tiga tahun" },
    ],
  },
  {
    nama: "kesediaanPindah",
    tanya: "Bersediakah kamu keluar Demak untuk itu?",
    jenis: "pilih",
    kelompok: "Arah",
    pilihan: [
      { nilai: "tetap-demak", label: "Ingin tetap di Demak" },
      { nilai: "sekitar", label: "Bersedia ke Semarang atau sekitarnya" },
      { nilai: "mana-saja", label: "Bersedia ke mana saja" },
    ],
  },

  {
    nama: "status",
    tanya: "Sekarang kamu sedang apa?",
    jenis: "pilih",
    kelompok: "Keadaan sekarang",
    pilihan: [
      { nilai: "sekolah", label: "Sekolah" },
      { nilai: "kuliah", label: "Kuliah" },
      { nilai: "bekerja", label: "Bekerja" },
      { nilai: "mencari", label: "Mencari kerja" },
      { nilai: "wirausaha", label: "Wirausaha" },
    ],
  },
  {
    nama: "pendidikan",
    tanya: "Pendidikan terakhir, atau yang sedang ditempuh?",
    jenis: "pilih",
    kelompok: "Keadaan sekarang",
    pilihan: [
      { nilai: "sd", label: "SD atau sederajat" },
      { nilai: "smp", label: "SMP atau sederajat" },
      { nilai: "sma", label: "SMA / SMK atau sederajat" },
      { nilai: "diploma", label: "Diploma" },
      { nilai: "sarjana", label: "Sarjana" },
    ],
  },
  {
    nama: "alat",
    tanya: "Alat apa yang kamu punya untuk belajar?",
    jenis: "pilih",
    kelompok: "Keadaan sekarang",
    // Pertanyaan terpenting di seluruh survei, dan yang paling sering
    // dilupakan aplikasi sejenis. Panduan untuk yang hanya punya ponsel
    // harus berbeda seluruhnya — tanpa ini, model akan menyuruh semua orang
    // memakai perangkat lunak yang bahkan tidak dapat mereka jalankan.
    pilihan: [
      { nilai: "laptop", label: "Laptop atau komputer" },
      { nilai: "ponsel", label: "Hanya ponsel" },
      { nilai: "belum", label: "Belum punya, biasanya pinjam" },
    ],
  },

  {
    nama: "tingkat",
    tanya: "Sejauh mana kemampuanmu di bidang itu sekarang?",
    jenis: "pilih",
    kelompok: "Kemampuan dan kendala",
    pilihan: [
      { nilai: "mulai", label: "Baru mau mulai" },
      { nilai: "dasar", label: "Sudah bisa dasarnya" },
      { nilai: "dibayar", label: "Sudah pernah dibayar untuk itu" },
    ],
  },
  {
    nama: "waktuLuang",
    tanya: "Berapa jam luangmu dalam seminggu?",
    jenis: "pilih",
    kelompok: "Kemampuan dan kendala",
    pilihan: [
      { nilai: "sedikit", label: "Kurang dari 5 jam" },
      { nilai: "sedang", label: "5 sampai 15 jam" },
      { nilai: "banyak", label: "Lebih dari 15 jam" },
    ],
  },
  {
    nama: "kendala",
    tanya: "Apa kendala terbesarmu? Boleh pilih lebih dari satu.",
    jenis: "banyak",
    kelompok: "Kemampuan dan kendala",
    pilihan: [
      { nilai: "biaya", label: "Biaya" },
      { nilai: "internet", label: "Internet" },
      { nilai: "transportasi", label: "Transportasi" },
      { nilai: "dukungan", label: "Dukungan keluarga" },
      { nilai: "arah", label: "Tidak tahu harus mulai dari mana" },
    ],
  },
];

export const KELOMPOK = ["Arah", "Keadaan sekarang", "Kemampuan dan kendala"];

/** Jawaban satu pengisian: kunci pertanyaan, isinya teks atau daftar teks. */
export type Jawaban = Record<string, string | string[]>;

/** Label yang terbaca manusia untuk satu nilai pilihan. */
export function labelPilihan(nama: string, nilai: string): string {
  const p = PERTANYAAN.find((q) => q.nama === nama);
  return p?.pilihan?.find((o) => o.nilai === nilai)?.label ?? nilai;
}

/**
 * Rangkuman Kartu Talenta yang ikut dikirim bersama jawaban survei.
 *
 * Dibentuk di sisi peladen dari profil yang sudah ada, bukan ditanyakan lagi.
 */
export type RingkasProfil = {
  usia: number | null;
  kecamatan: string | null;
  sekolah: string | null;
  minat: string[];
  keterampilan: string[];
  prestasi: string[];
  organisasi: string[];
};

/**
 * System prompt.
 *
 * VERSI AWAL — sengaja disiapkan sebelum hari lomba supaya fiturnya sudah
 * bekerja sejak tiba di lokasi. Penyempurnaannya adalah pekerjaan porsi 30%
 * di lokasi penjurian; lihat dokumen rencana 30%.
 *
 * Larangan aksara non-Latin di bawah bukan kehati-hatian berlebihan. Tanpa
 * larangan itu, model menyisipkan kata Tionghoa ke tengah kalimat Indonesia —
 * pada pengujian keluar "Perdalam软件 desain". Dengan larangan ini, tiga
 * percobaan berturut-turut bersih.
 */
export const SISTEM = `Anda penasihat karier untuk pemuda Kabupaten Demak, Jawa Tengah.

ATURAN BAHASA — MUTLAK
Tulis SELURUH jawaban hanya dengan aksara Latin dan bahasa Indonesia yang baku.
DILARANG memakai aksara Tionghoa, Jepang, Korea, atau Arab, bahkan untuk satu
kata pun. Istilah asing ditulis dengan aksara Latin.

ATURAN ISI
1. Sesuaikan dengan ALAT yang dimilikinya. Bila ia hanya punya ponsel, jangan
   sekali-kali menyarankan perangkat lunak yang menuntut komputer.
2. Sesuaikan dengan KENDALA-nya. Bila biaya menjadi kendala, sarankan yang
   gratis. Bila internet menjadi kendala, sarankan yang dapat dikerjakan luring.
3. Sesuaikan dengan WAKTU LUANG-nya. Jangan menyusun rencana lima belas jam
   seminggu untuk orang yang punya tiga jam.
4. Utamakan yang dapat dijangkau dari Demak: balai latihan kerja, perpustakaan
   daerah, komunitas setempat, kegiatan di aplikasi DemakMuda sendiri.
5. Jangan menyarankan langganan berbayar dari luar negeri.
6. Jangan mengarang nama lembaga, beasiswa, atau lomba. Bila tidak yakin
   namanya, sebutkan jenisnya saja.

BENTUK JAWABAN
Gunakan Markdown. Tepat TIGA langkah. Tiap langkah:

## Langkah 1 — <judul singkat> (Bulan 1-2)
Satu kalimat pembuka.
- butir tindakan yang konkret
- butir tindakan yang konkret

Tutup dengan satu bagian "## Yang diperiksa di akhir" berisi dua atau tiga
tanda bahwa langkahnya berhasil. Jangan menambahkan bagian lain, jangan
menyapa, dan jangan menutup dengan basa-basi.`;

/** Menyusun pesan pengguna dari jawaban survei dan rangkuman profilnya. */
export function susunPermintaan(
  jawaban: Jawaban,
  profil: RingkasProfil,
): string {
  const baris: string[] = ["DATA DARI KARTU TALENTA"];
  baris.push(`- Usia: ${profil.usia ?? "tidak diisi"}`);
  baris.push(`- Kecamatan: ${profil.kecamatan ?? "tidak diisi"}`);
  baris.push(`- Sekolah: ${profil.sekolah ?? "tidak diisi"}`);
  baris.push(`- Bidang minat: ${gabung(profil.minat)}`);
  baris.push(`- Keterampilan: ${gabung(profil.keterampilan)}`);
  baris.push(`- Prestasi tercatat: ${gabung(profil.prestasi)}`);
  baris.push(`- Organisasi: ${gabung(profil.organisasi)}`);

  baris.push("", "JAWABAN SURVEI");
  for (const p of PERTANYAAN) {
    const isi = jawaban[p.nama];
    baris.push(`- ${p.tanya} ${bacaJawaban(p, isi)}`);
  }

  baris.push(
    "",
    "Susun panduannya sekarang, mengikuti seluruh aturan di atas.",
  );
  return baris.join("\n");
}

function gabung(daftar: string[]): string {
  return daftar.length > 0 ? daftar.join(", ") : "belum ada";
}

function bacaJawaban(p: Pertanyaan, isi: string | string[] | undefined): string {
  if (isi === undefined || (Array.isArray(isi) && isi.length === 0)) {
    return "(tidak dijawab)";
  }
  if (p.jenis === "teks") return String(isi);
  if (Array.isArray(isi)) {
    return isi.map((n) => labelPilihan(p.nama, n)).join(", ");
  }
  return labelPilihan(p.nama, isi);
}
