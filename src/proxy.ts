import { getSessionCookie } from "better-auth/cookies";
import { NextResponse, type NextRequest } from "next/server";

import { AWALAN_TERLINDUNGI } from "@/lib/peran";

/**
 * Proxy ini HANYA mengurus pengalihan halaman demi kenyamanan pengguna.
 * (Sejak Next.js 16 berkas ini bernama proxy, menggantikan middleware.)
 *
 * Ia membaca keberadaan kuki sesi tanpa memvalidasinya ke basis data, sehingga
 * kuki palsu pun akan lolos di sini. Penjaga yang sesungguhnya ada di
 * src/lib/sesi.ts, yang dipanggil ulang oleh setiap halaman dan Server Action.
 * Jangan pernah menaruh keputusan izin di berkas ini.
 */
export function proxy(request: NextRequest) {
  const adaKuki = Boolean(getSessionCookie(request));
  const { pathname } = request.nextUrl;

  const halamanTamu = pathname === "/masuk" || pathname === "/daftar";
  const halamanTerlindungi = AWALAN_TERLINDUNGI.some(
    (awalan) => pathname === awalan || pathname.startsWith(`${awalan}/`),
  );

  if (adaKuki && halamanTamu) {
    return NextResponse.redirect(new URL("/tujuan", request.url));
  }

  if (!adaKuki && halamanTerlindungi) {
    const tujuan = new URL("/masuk", request.url);
    tujuan.searchParams.set("lanjut", pathname);
    return NextResponse.redirect(tujuan);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/masuk",
    "/daftar",
    "/pemuda/:path*",
    "/organisasi/:path*",
    "/dinas/:path*",
    "/admin/:path*",
    "/kelola/:path*",
  ],
};
