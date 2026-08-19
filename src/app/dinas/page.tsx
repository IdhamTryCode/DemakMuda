import { BingkaiDasbor } from "@/components/bingkai-dasbor";
import { wajibPeran } from "@/lib/sesi";

export default async function Halaman() {
  const sesi = await wajibPeran("dinas");
  return (
    <BingkaiDasbor peran={sesi.peran} nama={sesi.user.name}>
      <p className="max-w-prose text-sm text-muted">Verifikasi organisasi dan akun, pengumuman resmi, serta peta potensi pemuda.</p>
    </BingkaiDasbor>
  );
}
