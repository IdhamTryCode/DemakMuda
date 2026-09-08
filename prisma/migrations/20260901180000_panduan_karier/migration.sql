-- CreateTable
CREATE TABLE "panduan_karier" (
    "id" TEXT NOT NULL,
    "profilId" TEXT NOT NULL,
    "jawaban" JSONB NOT NULL,
    "hasil" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "dibuatPada" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "panduan_karier_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "panduan_karier_profilId_dibuatPada_idx" ON "panduan_karier"("profilId", "dibuatPada");

-- AddForeignKey
ALTER TABLE "panduan_karier" ADD CONSTRAINT "panduan_karier_profilId_fkey" FOREIGN KEY ("profilId") REFERENCES "profil_pemuda"("id") ON DELETE CASCADE ON UPDATE CASCADE;

