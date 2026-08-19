"use client";

export const KUNCI_TEMA = "demakmuda-tema";

/**
 * Tombol ganti mode terang dan gelap.
 *
 * Sengaja tanpa state React: ikon dan labelnya ditukar oleh CSS berdasarkan
 * atribut data-theme pada elemen html. Dengan begitu keluaran server dan klien
 * selalu sama — tidak ada ketidakcocokan hidrasi, dan tidak ada kedipan ikon
 * saat halaman dimuat.
 *
 * Pilihan pengguna disimpan di peramban lalu dibaca kembali oleh skrip kecil
 * di layout sebelum halaman digambar.
 */
export function GantiTema() {
  function ganti() {
    const akar = document.documentElement;
    const gelapSekarang = akar.dataset.theme === "dark";
    const berikutnya = gelapSekarang ? "light" : "dark";
    akar.dataset.theme = berikutnya;
    try {
      localStorage.setItem(KUNCI_TEMA, berikutnya);
    } catch {
      // Peramban yang memblokir penyimpanan tetap boleh mengganti tema,
      // hanya pilihannya tidak diingat.
    }
  }

  return (
    <button
      type="button"
      onClick={ganti}
      className="sk-raised sk-pressable inline-flex h-10 w-10 items-center justify-center rounded-sk text-ink-soft"
    >
      <span className="sr-only tema-saat-terang">Ganti ke mode gelap</span>
      <span className="sr-only tema-saat-gelap">Ganti ke mode terang</span>

      {/* Ikon bulan tampil saat mode terang: menunjukkan tujuan penggantian. */}
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        className="tema-saat-terang h-[18px] w-[18px]"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M21 13a8.5 8.5 0 0 1-10-10 8.5 8.5 0 1 0 10 10Z" />
      </svg>

      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        className="tema-saat-gelap h-[18px] w-[18px]"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="4.2" />
        <path d="M12 2.6v2.1M12 19.3v2.1M21.4 12h-2.1M4.7 12H2.6M18.6 5.4l-1.5 1.5M6.9 17.1l-1.5 1.5M18.6 18.6l-1.5-1.5M6.9 6.9 5.4 5.4" />
      </svg>
    </button>
  );
}
