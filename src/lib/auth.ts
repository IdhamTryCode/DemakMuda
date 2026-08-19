import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { admin, twoFactor } from "better-auth/plugins";

import { prisma } from "@/lib/prisma";
import { ac, dinas, organisasi, pemuda, superadmin } from "@/lib/permissions";

export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: "postgresql" }),

  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    minPasswordLength: 10,
  },

  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    // Layanan surel belum dipasang. Sampai itu ada, tautan verifikasi dicetak
    // ke konsol agar alur pendaftaran tetap dapat diuji tanpa jaringan surel.
    // Rencana berikutnya (cetak biru Bagian IV): halaman kotak-masuk-demo,
    // supaya pendaftaran tetap bisa diperagakan utuh di depan juri.
    sendVerificationEmail: async ({ user, url }) => {
      if (process.env.NODE_ENV === "production") {
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
