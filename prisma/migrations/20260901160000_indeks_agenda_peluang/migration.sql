-- DropIndex
DROP INDEX "agenda_mulai_idx";

-- DropIndex
DROP INDEX "peluang_jenis_status_idx";

-- DropIndex
DROP INDEX "peluang_tenggat_idx";

-- CreateIndex
CREATE INDEX "agenda_status_mulai_idx" ON "agenda"("status", "mulai");

-- CreateIndex
CREATE INDEX "agenda_pembuatId_idx" ON "agenda"("pembuatId");

-- CreateIndex
CREATE INDEX "peluang_status_tenggat_idx" ON "peluang"("status", "tenggat");

-- CreateIndex
CREATE INDEX "peluang_status_jenis_idx" ON "peluang"("status", "jenis");

-- CreateIndex
CREATE INDEX "peluang_pembuatId_idx" ON "peluang"("pembuatId");

-- CreateIndex
CREATE INDEX "peluang_organisasiId_idx" ON "peluang"("organisasiId");

