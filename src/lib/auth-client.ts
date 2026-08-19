import { createAuthClient } from "better-auth/react";
import { adminClient, twoFactorClient } from "better-auth/client/plugins";

import { ac, dinas, organisasi, pemuda, superadmin } from "@/lib/permissions";

export const authClient = createAuthClient({
  plugins: [
    adminClient({
      ac,
      roles: { pemuda, organisasi, dinas, superadmin },
    }),
    twoFactorClient({
      // Dipanggil ketika akun yang memakai dua langkah berhasil melewati
      // kata sandi tetapi belum menyelesaikan kodenya.
      //
      // Memakai window.location, bukan router Next.js: kelakuan balik ini
      // dipanggil dari luar pohon React sehingga useRouter tidak tersedia.
      // Pengalihan penuh juga yang diinginkan di sini — status sesi berubah,
      // dan halaman berikutnya harus dimuat ulang dari server.
      onTwoFactorRedirect() {
        // eslint-disable-next-line @next/next/no-location-assign-relative-destination
        window.location.href = "/masuk/dua-langkah";
      },
    }),
  ],
});

export const { signIn, signUp, signOut, useSession } = authClient;
