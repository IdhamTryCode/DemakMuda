/**
 * Membuat berkas ikon aplikasi dari lambang Kabupaten Demak.
 *
 *   npm run aset:ikon
 *
 * Lambangnya berbentuk perisai tegak, sedangkan ikon peramban selalu dianggap
 * persegi. Tanpa pemrosesan ini gambarnya akan tampak gepeng di tab. Lambang
 * ditempatkan di tengah kanvas persegi transparan tanpa diregangkan.
 *
 * Berkas hasil ikut masuk repositori supaya proses build tidak bergantung pada
 * sharp — skrip ini hanya dijalankan ulang bila lambangnya diganti.
 */
import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";

import sharp from "sharp";

const AKAR = join(import.meta.dirname, "..");
const SUMBER = join(AKAR, "public", "demak_logo.png");

const KELUARAN = [
  // Ikon tab peramban. Next.js menyajikannya dari src/app/icon.png.
  { berkas: join(AKAR, "src", "app", "icon.png"), sisi: 512, tepi: 0.06 },
  // Ikon layar utama iOS: latar tidak boleh transparan, dan Apple menambah
  // sudut membulat sendiri, jadi tepinya dilebihkan.
  { berkas: join(AKAR, "src", "app", "apple-icon.png"), sisi: 180, tepi: 0.12, latar: "#f7f8f4" },
  // Versi ringan untuk dipakai di antarmuka.
  { berkas: join(AKAR, "public", "lambang-demak.png"), sisi: 512, tepi: 0 },
];

async function main() {
  for (const { berkas, sisi, tepi, latar } of KELUARAN) {
    const isi = Math.round(sisi * (1 - tepi * 2));

    const gambar = sharp(SUMBER)
      .resize(isi, isi, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .extend({
        top: Math.round((sisi - isi) / 2),
        bottom: sisi - isi - Math.round((sisi - isi) / 2),
        left: Math.round((sisi - isi) / 2),
        right: sisi - isi - Math.round((sisi - isi) / 2),
        background: latar ?? { r: 0, g: 0, b: 0, alpha: 0 },
      });

    const akhir = latar ? gambar.flatten({ background: latar }) : gambar;

    mkdirSync(dirname(berkas), { recursive: true });
    const info = await akhir.png({ compressionLevel: 9 }).toFile(berkas);
    console.log(
      `  ${berkas.replace(AKAR, ".")} — ${info.width}x${info.height}, ` +
        `${(info.size / 1024).toFixed(1)} KB`,
    );
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
