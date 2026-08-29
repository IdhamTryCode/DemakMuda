import Image from "next/image";

import lambang from "../../public/lambang-demak.png";

/**
 * Lambang Kabupaten Demak beserta nama aplikasi.
 *
 * Lambangnya adalah lambang resmi daerah, jadi dipakai apa adanya tanpa
 * diwarnai ulang atau dipotong, dan tidak pernah menjadi elemen paling
 * mencolok di halaman.
 */
export function LogoDemak({
  ukuran = 44,
  tampilkanNama = true,
  ringkas = false,
}: {
  ukuran?: number;
  tampilkanNama?: boolean;
  /** Menyembunyikan baris "Kabupaten Demak" di bawah nama, untuk bilah tipis. */
  ringkas?: boolean;
}) {
  return (
    <span className="inline-flex items-center gap-3">
      <Image
        src={lambang}
        alt="Lambang Kabupaten Demak"
        width={ukuran}
        height={ukuran}
        priority
        className="h-auto w-auto"
        style={{ width: ukuran, height: "auto" }}
      />
      {tampilkanNama && (
        <span className="flex flex-col leading-tight">
          <span
            className={`font-semibold tracking-tight ${ringkas ? "text-sm" : "text-base"}`}
          >
            DemakMuda
          </span>
          {!ringkas && (
            <span className="text-[11px] uppercase tracking-wider text-muted">
              Kabupaten Demak
            </span>
          )}
        </span>
      )}
    </span>
  );
}
