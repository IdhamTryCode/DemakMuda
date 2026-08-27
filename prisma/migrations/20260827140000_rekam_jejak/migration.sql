-- CreateEnum
CREATE TYPE "TingkatPrestasi" AS ENUM ('DESA', 'KECAMATAN', 'KABUPATEN', 'PROVINSI', 'NASIONAL', 'INTERNASIONAL');

-- CreateTable
CREATE TABLE "pengalaman" (
    "id" TEXT NOT NULL,
    "profilId" TEXT NOT NULL,
    "judul" TEXT NOT NULL,
    "peran" TEXT,
    "penyelenggara" TEXT,
    "tahunMulai" INTEGER NOT NULL,
    "tahunSelesai" INTEGER,
    "keterangan" TEXT,
    "dibuatPada" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pengalaman_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "prestasi" (
    "id" TEXT NOT NULL,
    "profilId" TEXT NOT NULL,
    "judul" TEXT NOT NULL,
    "tingkat" "TingkatPrestasi" NOT NULL,
    "peringkat" TEXT,
    "penyelenggara" TEXT,
    "tahun" INTEGER NOT NULL,
    "buktiUrl" TEXT,
    "dibuatPada" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "prestasi_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "pengalaman_profilId_idx" ON "pengalaman"("profilId");

-- CreateIndex
CREATE INDEX "prestasi_profilId_idx" ON "prestasi"("profilId");

-- CreateIndex
CREATE INDEX "prestasi_tingkat_idx" ON "prestasi"("tingkat");

-- AddForeignKey
ALTER TABLE "pengalaman" ADD CONSTRAINT "pengalaman_profilId_fkey" FOREIGN KEY ("profilId") REFERENCES "profil_pemuda"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prestasi" ADD CONSTRAINT "prestasi_profilId_fkey" FOREIGN KEY ("profilId") REFERENCES "profil_pemuda"("id") ON DELETE CASCADE ON UPDATE CASCADE;

