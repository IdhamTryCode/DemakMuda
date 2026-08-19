import { createAuthClient } from "better-auth/react";
import { adminClient, twoFactorClient } from "better-auth/client/plugins";

import { ac, dinas, organisasi, pemuda, superadmin } from "@/lib/permissions";

export const authClient = createAuthClient({
  plugins: [
    adminClient({
      ac,
      roles: { pemuda, organisasi, dinas, superadmin },
    }),
    twoFactorClient(),
  ],
});

export const { signIn, signUp, signOut, useSession } = authClient;
