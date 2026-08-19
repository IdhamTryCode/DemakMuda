import { BingkaiDasbor } from "@/components/bingkai-dasbor";
import { wajibPeran } from "@/lib/sesi";

export default async function Halaman() {
  const sesi = await wajibPeran("organisasi");
  return (
    <BingkaiDasbor peran={sesi.peran} nama={sesi.user.name}>
      <p className="max-w-prose text-sm text-muted">Kelola halaman organisasi, kabar, agenda, dan peserta kegiatan.</p>
    </BingkaiDasbor>
  );
}
