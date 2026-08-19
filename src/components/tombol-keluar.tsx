"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Tombol } from "@/components/sk";
import { authClient } from "@/lib/auth-client";

export function TombolKeluar() {
  const router = useRouter();
  const [sedang, setSedang] = useState(false);

  return (
    <Tombol
      variasi="biasa"
      disabled={sedang}
      onClick={async () => {
        setSedang(true);
        await authClient.signOut();
        router.push("/masuk");
        router.refresh();
      }}
    >
      {sedang ? "Keluar…" : "Keluar"}
    </Tombol>
  );
}
