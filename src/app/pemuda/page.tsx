import { BingkaiDasbor } from "@/components/bingkai-dasbor";
import { wajibPeran } from "@/lib/sesi";

export default async function Halaman() {
  const sesi = await wajibPeran("pemuda");
  return (
    <BingkaiDasbor peran={sesi.peran} nama={sesi.user.name}>
      <p className="max-w-prose text-sm text-muted">Kartu Talenta, peluang yang cocok, dan riwayat kegiatan Anda.</p>
    </BingkaiDasbor>
  );
}
