-- Kegiatan khusus anggota wajib punya organisasi penyelenggara.
--
-- Aturannya sudah ditegakkan skema Zod dan Server Action, tetapi keduanya
-- hanya menjaga satu jalur masuk. Penyemai, perbaikan lewat konsol, dan
-- kode yang ditulis kemudian tidak melewati keduanya — dan keadaan yang
-- dihasilkannya adalah kegiatan yang tidak dapat didaftari siapa pun.
--
-- Batasan ini menutupnya di tempat yang tidak dapat dilewati jalur mana pun.
ALTER TABLE "agenda"
  ADD CONSTRAINT "agenda_khusus_anggota_perlu_organisasi"
  CHECK (NOT "khususAnggota" OR "organisasiId" IS NOT NULL);

ALTER TABLE "peluang"
  ADD CONSTRAINT "peluang_khusus_anggota_perlu_organisasi"
  CHECK (NOT "khususAnggota" OR "organisasiId" IS NOT NULL);
