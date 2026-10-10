import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { BingkaiPublik } from "@/components/bingkai-publik";
import { IkonBuka, IkonTanya } from "@/components/ikon";
import { Kartu, Kolom, Label } from "@/components/sk";
import { rapikanKode } from "@/lib/kode-sertifikat";

export const metadata: Metadata = {
  title: "Periksa Sertifikat",
  description:
    "Periksa keaslian sertifikat kegiatan kepemudaan Kabupaten Demak dengan kode yang tertera.",
};

/**
 * Tanya-jawab singkat di bawah formulir.
 *
 * Jawabannya harus benar menurut perilaku aplikasi yang sesungguhnya — halaman
 * ini diperiksa orang yang baru pertama memegang sertifikat, dan menyesatkan
 * mereka soal ke mana harus bertanya lebih buruk daripada tidak menjawab sama
 * sekali. Karena itu tidak ada janji tenggat pengesahan dan tidak ada rujukan
 * ke kantor mana pun.
 */
const FAQ: { tanya: string; jawab: string }[] = [
  {
    tanya: "Bagaimana kalau kode saya tidak ditemukan?",
    jawab:
      "Periksa lagi penulisannya: huruf besar-kecil dan tanda hubung tidak " +
      "berpengaruh, tetapi satu huruf yang tertukar membuat kodenya tidak " +
      "cocok. Kode yang benar-benar tidak terdaftar berarti sertifikat itu " +
      "tidak pernah diterbitkan melalui DemakMuda.",
  },
  {
    tanya: "Di mana kode sertifikat saya tertera?",
    jawab:
      "Pada sertifikat yang diterbitkan penyelenggara kegiatan di DemakMuda, " +
      "dan pada daftar sertifikat di Kartu Talenta penerimanya.",
  },
  {
    tanya: "Apakah sertifikat bisa dibatalkan?",
    jawab:
      "Bisa. Sertifikat tidak pernah dihapus, hanya dibatalkan: kodenya tetap " +
      "dapat diperiksa, dan hasilnya menyatakan bahwa sertifikat itu sudah " +
      "dibatalkan beserta tanggal dan alasannya.",
  },
];

export default function HalamanCek() {
  async function cari(data: FormData) {
    "use server";
    const kode = rapikanKode(String(data.get("kode") ?? ""));
    if (!kode) redirect("/cek");
    redirect(`/cek/${encodeURIComponent(kode)}`);
  }

  return (
    <BingkaiPublik>
      <div className="mx-auto flex max-w-xl flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-semibold tracking-tight">
            Periksa sertifikat
          </h1>
          <p className="text-sm text-ink-soft">
            Setiap sertifikat DemakMuda punya kode unik. Masukkan kodenya untuk
            memastikan sertifikat itu benar diterbitkan, oleh siapa, dan untuk
            siapa — tanpa perlu bertanya ke panitia.
          </p>
        </div>

        <Kartu>
          <form action={cari} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="kode">Kode sertifikat</Label>
              <Kolom
                id="kode"
                name="kode"
                required
                maxLength={20}
                autoComplete="off"
                placeholder="DM-XXXX-XXXX"
                className="font-mono uppercase tracking-widest"
              />
              <p className="text-xs text-muted">
                Huruf besar-kecil dan tanda hubung tidak berpengaruh.
              </p>
            </div>
            <button
              type="submit"
              className="sk-btn-utama sk-pressable w-fit px-5 py-2.5 text-sm"
            >
              Periksa
            </button>
          </form>
        </Kartu>

        <section className="flex flex-col gap-3">
          <h2 className="flex items-center gap-2 text-sm font-semibold">
            <IkonTanya className="h-4 w-4 shrink-0 text-muted" />
            Bantuan &amp; pertanyaan
          </h2>
          <div className="flex flex-col gap-2">
            {FAQ.map((f) => (
              <details key={f.tanya} className="sk-kartu px-4 py-3">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-2 text-sm font-medium">
                  {f.tanya}
                  <IkonBuka className="h-4 w-4 shrink-0 text-muted" />
                </summary>
                <p className="pt-2 text-sm text-ink-soft">{f.jawab}</p>
              </details>
            ))}
          </div>
        </section>
      </div>
    </BingkaiPublik>
  );
}
