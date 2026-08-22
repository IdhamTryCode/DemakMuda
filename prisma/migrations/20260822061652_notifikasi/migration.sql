-- CreateEnum
CREATE TYPE "JenisNotifikasi" AS ENUM ('KEANGGOTAAN_DIAJUKAN', 'KEANGGOTAAN_DIPUTUSKAN', 'ASPIRASI_MASUK', 'ASPIRASI_DITANGGAPI', 'PENDAFTARAN_DIPUTUSKAN', 'SERTIFIKAT_TERBIT', 'ORGANISASI_DIVERIFIKASI', 'KARYA_DIMODERASI');

-- CreateTable
CREATE TABLE "notifikasi" (
    "id" TEXT NOT NULL,
    "jenis" "JenisNotifikasi" NOT NULL,
    "judul" TEXT NOT NULL,
    "pesan" TEXT NOT NULL,
    "tautan" TEXT,
    "penerimaId" TEXT NOT NULL,
    "dibacaPada" TIMESTAMP(3),
    "dibuatPada" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifikasi_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "notifikasi_penerimaId_dibacaPada_idx" ON "notifikasi"("penerimaId", "dibacaPada");

-- CreateIndex
CREATE INDEX "notifikasi_penerimaId_dibuatPada_idx" ON "notifikasi"("penerimaId", "dibuatPada");

-- AddForeignKey
ALTER TABLE "notifikasi" ADD CONSTRAINT "notifikasi_penerimaId_fkey" FOREIGN KEY ("penerimaId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

