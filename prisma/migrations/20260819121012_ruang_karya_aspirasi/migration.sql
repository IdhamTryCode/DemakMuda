-- CreateEnum
CREATE TYPE "JenisKarya" AS ENUM ('PRODUK', 'SENI', 'TULISAN', 'PROYEK', 'LAINNYA');

-- CreateEnum
CREATE TYPE "StatusAspirasi" AS ENUM ('BARU', 'DIPROSES', 'SELESAI', 'DITOLAK');

-- CreateTable
CREATE TABLE "karya" (
    "id" TEXT NOT NULL,
    "judul" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "jenis" "JenisKarya" NOT NULL,
    "deskripsi" TEXT NOT NULL,
    "gambarUrl" TEXT,
    "tautanLuar" TEXT,
    "status" "StatusTerbit" NOT NULL DEFAULT 'TERBIT',
    "pemilikId" TEXT NOT NULL,
    "dibuatPada" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "diperbaruiPada" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "karya_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aspirasi" (
    "id" TEXT NOT NULL,
    "judul" TEXT NOT NULL,
    "isi" TEXT NOT NULL,
    "status" "StatusAspirasi" NOT NULL DEFAULT 'BARU',
    "tanggapan" TEXT,
    "ditanggapiPada" TIMESTAMP(3),
    "penanggapId" TEXT,
    "pengirimId" TEXT NOT NULL,
    "dibuatPada" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "diperbaruiPada" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "aspirasi_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "karya_slug_key" ON "karya"("slug");

-- CreateIndex
CREATE INDEX "karya_status_dibuatPada_idx" ON "karya"("status", "dibuatPada");

-- CreateIndex
CREATE INDEX "karya_pemilikId_idx" ON "karya"("pemilikId");

-- CreateIndex
CREATE INDEX "aspirasi_status_dibuatPada_idx" ON "aspirasi"("status", "dibuatPada");

-- CreateIndex
CREATE INDEX "aspirasi_pengirimId_idx" ON "aspirasi"("pengirimId");

-- AddForeignKey
ALTER TABLE "karya" ADD CONSTRAINT "karya_pemilikId_fkey" FOREIGN KEY ("pemilikId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aspirasi" ADD CONSTRAINT "aspirasi_penanggapId_fkey" FOREIGN KEY ("penanggapId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aspirasi" ADD CONSTRAINT "aspirasi_pengirimId_fkey" FOREIGN KEY ("pengirimId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

