import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "DemakMuda",
    template: "%s — DemakMuda",
  },
  description:
    "Aplikasi kepemudaan Kabupaten Demak untuk menyongsong bonus demografi menuju Generasi Emas 2045: pendataan talenta, penyaluran peluang, bukti kompetensi, dan ruang aspirasi.",
};

/**
 * Menerapkan tema tersimpan sebelum halaman digambar, agar tidak ada kedipan
 * dari terang ke gelap. Harus berupa skrip sebaris di head — memindahkannya ke
 * komponen React membuatnya berjalan terlambat.
 */
const SKRIP_TEMA = `try{var t=localStorage.getItem("demakmuda-tema");document.documentElement.dataset.theme=t==="dark"?"dark":"light"}catch(e){document.documentElement.dataset.theme="light"}`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="id"
      data-theme="light"
      // Skrip di head boleh mengubah data-theme sebelum React hidrasi, jadi
      // atribut html memang sengaja berbeda antara server dan klien.
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: SKRIP_TEMA }} />
      </head>
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
