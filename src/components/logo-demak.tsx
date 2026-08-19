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
}: {
  ukuran?: number;
  tampilkanNama?: boolean;
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
          <span className="text-base font-semibold tracking-tight">DemakMuda</span>
          <span className="text-[11px] uppercase tracking-wider text-muted">
            Kabupaten Demak
          </span>
        </span>
      )}
    </span>
  );
}
