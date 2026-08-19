import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { BingkaiPublik } from "@/components/bingkai-publik";
import { Kartu, Kolom, Label } from "@/components/sk";
import { rapikanKode } from "@/lib/kode-sertifikat";

export const metadata: Metadata = {
  title: "Periksa Sertifikat",
  description:
    "Periksa keaslian sertifikat kegiatan kepemudaan Kabupaten Demak dengan kode yang tertera.",
};

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
              className="sk-btn-utama sk-pressable w-fit rounded-sk px-5 py-2.5 text-sm"
            >
              Periksa
            </button>
          </form>
        </Kartu>
      </div>
    </BingkaiPublik>
  );
}
