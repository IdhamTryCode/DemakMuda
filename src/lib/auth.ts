import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { admin, twoFactor } from "better-auth/plugins";

import { prisma } from "@/lib/prisma";
import { ac, dinas, organisasi, pemuda, superadmin } from "@/lib/permissions";

/**
 * Mode peragaan.
 *
 * Layanan pengiriman surel belum dipasang, sehingga verifikasi surel tidak
 * dapat diselesaikan siapa pun di lingkungan yang diterbitkan. Daripada
 * membiarkan pendaftaran gagal dengan galat 500 di depan juri, lingkungan
 * peragaan boleh melewati verifikasi — tetapi harus dinyatakan terang-terangan
 * lewat variabel lingkungan dan diberi tahu di halaman pendaftaran, bukan
 * dilemahkan diam-diam.
 *
 * Di produksi sungguhan, biarkan variabel ini kosong dan pasang layanan surel.
 */
export const MODE_PERAGAAN = process.env.MODE_PERAGAAN === "true";

/**
 * Alamat yang boleh mengirim permintaan autentikasi.
 *
 * Better Auth menolak permintaan yang header Origin-nya tidak dikenal — itu
 * perlindungan lintas situs yang memang diinginkan. Masalahnya, di Vercel
 * alamat penerbitan tidak selalu sama dengan yang tertulis di BETTER_AUTH_URL:
 * setiap deployment pratinjau punya alamatnya sendiri, dan salah ketik satu
 * huruf pada variabel lingkungan langsung membuat seluruh proses masuk gagal
 * dengan 403.
 *
 * Karena itu alamat yang disediakan Vercel ikut dipercaya secara otomatis.
 */
function alamatTepercaya(): string[] {
  const daftar = [
    process.env.BETTER_AUTH_URL,
    process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : undefined,
    process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined,
  ].filter((a): a is string => Boolean(a));

  return [...new Set(daftar)];
}

export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: "postgresql" }),

  // Bila BETTER_AUTH_URL tidak diisi, pakai alamat produksi dari Vercel.
  baseURL:
    process.env.BETTER_AUTH_URL ??
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : undefined),

  trustedOrigins: alamatTepercaya(),

  emailAndPassword: {
    enabled: true,
    requireEmailVerification: !MODE_PERAGAAN,
    minPasswordLength: 10,
  },

  emailVerification: {
    sendOnSignUp: !MODE_PERAGAAN,
    autoSignInAfterVerification: true,
    // Selama layanan surel belum ada, tautan verifikasi dicetak ke konsol
    // server agar alur pendaftaran tetap dapat diuji saat pengembangan.
    sendVerificationEmail: async ({ user, url }) => {
      if (process.env.NODE_ENV === "production" && !MODE_PERAGAAN) {
        throw new Error(
          "Pengiriman surel verifikasi belum dipasang untuk produksi.",
        );
      }
      console.info(`\n[verifikasi surel] ${user.email}\n${url}\n`);
    },
  },

  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 hari
    updateAge: 60 * 60 * 24, // perpanjang sekali sehari
  },

  // Membatasi percobaan masuk dan pendaftaran beruntun. Disimpan di basis data
  // agar batasnya tetap berlaku walau proses aplikasi berpindah atau restart.
  rateLimit: {
    enabled: true,
    storage: "database",
    window: 60,
    max: 100,
    customRules: {
      "/sign-in/email": { window: 60, max: 5 },
      "/sign-up/email": { window: 300, max: 3 },
      "/forget-password": { window: 300, max: 3 },
      "/two-factor/verify-totp": { window: 60, max: 5 },
    },
  },

  plugins: [
    admin({
      ac,
      roles: { pemuda, organisasi, dinas, superadmin },
      defaultRole: "pemuda",
      adminRoles: ["superadmin"],
    }),
    twoFactor(),
    // Wajib menjadi plugin terakhir: menangani penulisan kuki sesi dari
    // Server Action pada App Router.
    nextCookies(),
  ],
});
