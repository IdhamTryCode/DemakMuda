/** Label dan warna status aspirasi, dipakai pengirim maupun dinas. */

export const STATUS_ASPIRASI = ["BARU", "DIPROSES", "SELESAI", "DITOLAK"] as const;

export type StatusAspirasi = (typeof STATUS_ASPIRASI)[number];

export const LABEL_STATUS_ASPIRASI: Record<StatusAspirasi, string> = {
  BARU: "Baru masuk",
  DIPROSES: "Sedang diproses",
  SELESAI: "Selesai ditindaklanjuti",
  DITOLAK: "Belum dapat ditindaklanjuti",
};

export const WARNA_STATUS_ASPIRASI: Record<StatusAspirasi, string> = {
  BARU: "bg-sunk text-muted",
  DIPROSES: "bg-brass-soft text-brass",
  SELESAI: "bg-accent-soft text-accent",
  DITOLAK: "bg-danger-soft text-danger",
};

export function adalahStatusAspirasi(nilai: unknown): nilai is StatusAspirasi {
  return (
    typeof nilai === "string" &&
    (STATUS_ASPIRASI as readonly string[]).includes(nilai)
  );
}
