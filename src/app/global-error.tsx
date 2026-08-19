"use client";

import { useEffect } from "react";

/**
 * Jaring pengaman terakhir: galat yang terjadi di layout akar itu sendiri.
 *
 * Berkas ini menggantikan seluruh dokumen, termasuk html dan body, sehingga
 * tidak dapat memakai komponen maupun token gaya aplikasi — pada saat ia
 * dipakai, berkas gaya itu sendiri mungkin yang bermasalah. Karena itu
 * warnanya ditulis apa adanya di sini, dan sengaja dibuat sesederhana mungkin.
 */
export default function GalatMenyeluruh({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[galat menyeluruh]", error);
  }, [error]);

  return (
    <html lang="id">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "2rem",
          background: "#eff2ec",
          color: "#111a15",
          fontFamily: "system-ui, -apple-system, Segoe UI, sans-serif",
        }}
      >
        <div style={{ maxWidth: "34rem", display: "grid", gap: "1rem" }}>
          <h1 style={{ margin: 0, fontSize: "1.75rem", letterSpacing: "-0.02em" }}>
            DemakMuda sedang bermasalah
          </h1>
          <p style={{ margin: 0, lineHeight: 1.65, color: "#313f38" }}>
            Aplikasi gagal dimuat sepenuhnya. Silakan coba muat ulang beberapa
            saat lagi.
          </p>
          {error.digest && (
            <p
              style={{
                margin: 0,
                fontFamily: "ui-monospace, monospace",
                fontSize: "0.85rem",
                color: "#5a6861",
              }}
            >
              Kode kesalahan: {error.digest}
            </p>
          )}
          <button
            type="button"
            onClick={reset}
            style={{
              justifySelf: "start",
              cursor: "pointer",
              border: "1px solid #0a4a3d",
              borderRadius: "0.625rem",
              background: "#0d5c4c",
              color: "#f4faf7",
              padding: "0.7rem 1.25rem",
              fontSize: "0.9rem",
              fontWeight: 600,
            }}
          >
            Coba muat ulang
          </button>
        </div>
      </body>
    </html>
  );
}
