-- CreateEnum
CREATE TYPE "JenisDesa" AS ENUM ('DESA', 'KELURAHAN');

-- CreateEnum
CREATE TYPE "Jenjang" AS ENUM ('SMA', 'SMK', 'MA');

-- CreateEnum
CREATE TYPE "JenisKelamin" AS ENUM ('LAKI_LAKI', 'PEREMPUAN');

-- CreateEnum
CREATE TYPE "JenisOrganisasi" AS ENUM ('OKP', 'KARANG_TARUNA', 'SANGGAR', 'KOMUNITAS', 'LAINNYA');

-- CreateEnum
CREATE TYPE "StatusVerifikasi" AS ENUM ('MENUNGGU', 'TERVERIFIKASI', 'DITOLAK');

-- CreateEnum
CREATE TYPE "StatusTerbit" AS ENUM ('DRAF', 'TERBIT', 'ARSIP');

-- CreateEnum
CREATE TYPE "PeranKeanggotaan" AS ENUM ('ANGGOTA', 'PENGURUS', 'KETUA');

-- CreateEnum
CREATE TYPE "JenisPeluang" AS ENUM ('LOMBA', 'PELATIHAN', 'BEASISWA', 'MAGANG', 'LOWONGAN');

-- CreateEnum
CREATE TYPE "StatusPendaftaran" AS ENUM ('MENUNGGU', 'DITERIMA', 'DITOLAK', 'HADIR');

-- CreateTable
CREATE TABLE "kecamatan" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "slug" TEXT NOT NULL,

    CONSTRAINT "kecamatan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "desa" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "jenis" "JenisDesa" NOT NULL,
    "kecamatanId" TEXT NOT NULL,

    CONSTRAINT "desa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sekolah" (
    "id" TEXT NOT NULL,
    "npsn" TEXT,
    "nama" TEXT NOT NULL,
    "jenjang" "Jenjang" NOT NULL,
    "kecamatanId" TEXT NOT NULL,

    CONSTRAINT "sekolah_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "profil_pemuda" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "nikHash" TEXT,
    "nikEmpat" TEXT,
    "tanggalLahir" TIMESTAMP(3),
    "jenisKelamin" "JenisKelamin",
    "telepon" TEXT,
    "bio" TEXT,
    "kecamatanId" TEXT,
    "desaId" TEXT,
    "sekolahId" TEXT,
    "statusVerifikasi" "StatusVerifikasi" NOT NULL DEFAULT 'MENUNGGU',
    "diverifikasiPada" TIMESTAMP(3),
    "dibuatPada" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "diperbaruiPada" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "profil_pemuda_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "minat" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "slug" TEXT NOT NULL,

    CONSTRAINT "minat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "keterampilan" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "slug" TEXT NOT NULL,

    CONSTRAINT "keterampilan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "organisasi" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "jenis" "JenisOrganisasi" NOT NULL,
    "deskripsi" TEXT,
    "logoUrl" TEXT,
    "kontak" TEXT,
    "kecamatanId" TEXT NOT NULL,
    "desaId" TEXT,
    "lintang" DOUBLE PRECISION,
    "bujur" DOUBLE PRECISION,
    "pemilikId" TEXT NOT NULL,
    "statusVerifikasi" "StatusVerifikasi" NOT NULL DEFAULT 'MENUNGGU',
    "dibuatPada" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "diperbaruiPada" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "organisasi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "keanggotaan" (
    "id" TEXT NOT NULL,
    "organisasiId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "peran" "PeranKeanggotaan" NOT NULL DEFAULT 'ANGGOTA',
    "status" "StatusVerifikasi" NOT NULL DEFAULT 'MENUNGGU',
    "dibuatPada" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "keanggotaan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "berita" (
    "id" TEXT NOT NULL,
    "judul" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "ringkasan" TEXT NOT NULL,
    "isi" TEXT NOT NULL,
    "gambarUrl" TEXT,
    "status" "StatusTerbit" NOT NULL DEFAULT 'DRAF',
    "terbitPada" TIMESTAMP(3),
    "penulisId" TEXT NOT NULL,
    "organisasiId" TEXT,
    "dibuatPada" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "diperbaruiPada" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "berita_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "agenda" (
    "id" TEXT NOT NULL,
    "judul" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "deskripsi" TEXT NOT NULL,
    "lokasi" TEXT,
    "mulai" TIMESTAMP(3) NOT NULL,
    "selesai" TIMESTAMP(3),
    "kecamatanId" TEXT,
    "status" "StatusTerbit" NOT NULL DEFAULT 'DRAF',
    "pembuatId" TEXT NOT NULL,
    "organisasiId" TEXT,
    "dibuatPada" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "diperbaruiPada" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "agenda_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "peluang" (
    "id" TEXT NOT NULL,
    "judul" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "jenis" "JenisPeluang" NOT NULL,
    "deskripsi" TEXT NOT NULL,
    "tautanLuar" TEXT,
    "tenggat" TIMESTAMP(3),
    "usiaMin" INTEGER,
    "usiaMaks" INTEGER,
    "status" "StatusTerbit" NOT NULL DEFAULT 'DRAF',
    "agendaId" TEXT,
    "pembuatId" TEXT NOT NULL,
    "organisasiId" TEXT,
    "dibuatPada" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "diperbaruiPada" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "peluang_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pendaftaran" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" "StatusPendaftaran" NOT NULL DEFAULT 'MENUNGGU',
    "catatan" TEXT,
    "agendaId" TEXT,
    "peluangId" TEXT,
    "dibuatPada" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pendaftaran_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sertifikat" (
    "id" TEXT NOT NULL,
    "kode" TEXT NOT NULL,
    "penerimaId" TEXT NOT NULL,
    "judul" TEXT NOT NULL,
    "peringkat" TEXT,
    "berkasUrl" TEXT,
    "terbitPada" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "penerbitId" TEXT NOT NULL,
    "organisasiId" TEXT,
    "pendaftaranId" TEXT,
    "dibatalkanPada" TIMESTAMP(3),
    "alasanPembatalan" TEXT,

    CONSTRAINT "sertifikat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_log" (
    "id" TEXT NOT NULL,
    "aktorId" TEXT,
    "aksi" TEXT NOT NULL,
    "sasaran" TEXT,
    "sasaranId" TEXT,
    "rincian" JSONB,
    "alamatIp" TEXT,
    "dibuatPada" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "role" TEXT,
    "banned" BOOLEAN DEFAULT false,
    "banReason" TEXT,
    "banExpires" TIMESTAMP(3),
    "twoFactorEnabled" BOOLEAN DEFAULT false,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "session" (
    "id" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "token" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "userId" TEXT NOT NULL,
    "impersonatedBy" TEXT,

    CONSTRAINT "session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "account" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "idToken" TEXT,
    "accessTokenExpiresAt" TIMESTAMP(3),
    "refreshTokenExpiresAt" TIMESTAMP(3),
    "scope" TEXT,
    "password" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification" (
    "id" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "verification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "twoFactor" (
    "id" TEXT NOT NULL,
    "secret" TEXT NOT NULL,
    "backupCodes" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "verified" BOOLEAN DEFAULT true,
    "failedVerificationCount" INTEGER DEFAULT 0,
    "lockedUntil" TIMESTAMP(3),

    CONSTRAINT "twoFactor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rateLimit" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "count" INTEGER NOT NULL,
    "lastRequest" BIGINT NOT NULL,

    CONSTRAINT "rateLimit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_MinatToProfilPemuda" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_MinatToProfilPemuda_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_MinatToPeluang" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_MinatToPeluang_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_KeterampilanToProfilPemuda" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_KeterampilanToProfilPemuda_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "kecamatan_slug_key" ON "kecamatan"("slug");

-- CreateIndex
CREATE INDEX "desa_kecamatanId_idx" ON "desa"("kecamatanId");

-- CreateIndex
CREATE UNIQUE INDEX "sekolah_npsn_key" ON "sekolah"("npsn");

-- CreateIndex
CREATE INDEX "sekolah_kecamatanId_idx" ON "sekolah"("kecamatanId");

-- CreateIndex
CREATE UNIQUE INDEX "profil_pemuda_userId_key" ON "profil_pemuda"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "profil_pemuda_slug_key" ON "profil_pemuda"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "profil_pemuda_nikHash_key" ON "profil_pemuda"("nikHash");

-- CreateIndex
CREATE INDEX "profil_pemuda_kecamatanId_idx" ON "profil_pemuda"("kecamatanId");

-- CreateIndex
CREATE INDEX "profil_pemuda_statusVerifikasi_idx" ON "profil_pemuda"("statusVerifikasi");

-- CreateIndex
CREATE UNIQUE INDEX "minat_nama_key" ON "minat"("nama");

-- CreateIndex
CREATE UNIQUE INDEX "minat_slug_key" ON "minat"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "keterampilan_nama_key" ON "keterampilan"("nama");

-- CreateIndex
CREATE UNIQUE INDEX "keterampilan_slug_key" ON "keterampilan"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "organisasi_slug_key" ON "organisasi"("slug");

-- CreateIndex
CREATE INDEX "organisasi_kecamatanId_idx" ON "organisasi"("kecamatanId");

-- CreateIndex
CREATE INDEX "organisasi_pemilikId_idx" ON "organisasi"("pemilikId");

-- CreateIndex
CREATE INDEX "organisasi_statusVerifikasi_idx" ON "organisasi"("statusVerifikasi");

-- CreateIndex
CREATE INDEX "keanggotaan_userId_idx" ON "keanggotaan"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "keanggotaan_organisasiId_userId_key" ON "keanggotaan"("organisasiId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "berita_slug_key" ON "berita"("slug");

-- CreateIndex
CREATE INDEX "berita_status_terbitPada_idx" ON "berita"("status", "terbitPada");

-- CreateIndex
CREATE INDEX "berita_penulisId_idx" ON "berita"("penulisId");

-- CreateIndex
CREATE UNIQUE INDEX "agenda_slug_key" ON "agenda"("slug");

-- CreateIndex
CREATE INDEX "agenda_mulai_idx" ON "agenda"("mulai");

-- CreateIndex
CREATE INDEX "agenda_kecamatanId_idx" ON "agenda"("kecamatanId");

-- CreateIndex
CREATE UNIQUE INDEX "peluang_slug_key" ON "peluang"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "peluang_agendaId_key" ON "peluang"("agendaId");

-- CreateIndex
CREATE INDEX "peluang_jenis_status_idx" ON "peluang"("jenis", "status");

-- CreateIndex
CREATE INDEX "peluang_tenggat_idx" ON "peluang"("tenggat");

-- CreateIndex
CREATE INDEX "pendaftaran_status_idx" ON "pendaftaran"("status");

-- CreateIndex
CREATE UNIQUE INDEX "pendaftaran_userId_agendaId_key" ON "pendaftaran"("userId", "agendaId");

-- CreateIndex
CREATE UNIQUE INDEX "pendaftaran_userId_peluangId_key" ON "pendaftaran"("userId", "peluangId");

-- CreateIndex
CREATE UNIQUE INDEX "sertifikat_kode_key" ON "sertifikat"("kode");

-- CreateIndex
CREATE UNIQUE INDEX "sertifikat_pendaftaranId_key" ON "sertifikat"("pendaftaranId");

-- CreateIndex
CREATE INDEX "sertifikat_penerimaId_idx" ON "sertifikat"("penerimaId");

-- CreateIndex
CREATE INDEX "audit_log_aktorId_idx" ON "audit_log"("aktorId");

-- CreateIndex
CREATE INDEX "audit_log_dibuatPada_idx" ON "audit_log"("dibuatPada");

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- CreateIndex
CREATE INDEX "session_userId_idx" ON "session"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "session_token_key" ON "session"("token");

-- CreateIndex
CREATE INDEX "account_userId_idx" ON "account"("userId");

-- CreateIndex
CREATE INDEX "verification_identifier_idx" ON "verification"("identifier");

-- CreateIndex
CREATE INDEX "twoFactor_secret_idx" ON "twoFactor"("secret");

-- CreateIndex
CREATE INDEX "twoFactor_userId_idx" ON "twoFactor"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "rateLimit_key_key" ON "rateLimit"("key");

-- CreateIndex
CREATE INDEX "_MinatToProfilPemuda_B_index" ON "_MinatToProfilPemuda"("B");

-- CreateIndex
CREATE INDEX "_MinatToPeluang_B_index" ON "_MinatToPeluang"("B");

-- CreateIndex
CREATE INDEX "_KeterampilanToProfilPemuda_B_index" ON "_KeterampilanToProfilPemuda"("B");

-- AddForeignKey
ALTER TABLE "desa" ADD CONSTRAINT "desa_kecamatanId_fkey" FOREIGN KEY ("kecamatanId") REFERENCES "kecamatan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sekolah" ADD CONSTRAINT "sekolah_kecamatanId_fkey" FOREIGN KEY ("kecamatanId") REFERENCES "kecamatan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "profil_pemuda" ADD CONSTRAINT "profil_pemuda_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "profil_pemuda" ADD CONSTRAINT "profil_pemuda_kecamatanId_fkey" FOREIGN KEY ("kecamatanId") REFERENCES "kecamatan"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "profil_pemuda" ADD CONSTRAINT "profil_pemuda_desaId_fkey" FOREIGN KEY ("desaId") REFERENCES "desa"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "profil_pemuda" ADD CONSTRAINT "profil_pemuda_sekolahId_fkey" FOREIGN KEY ("sekolahId") REFERENCES "sekolah"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organisasi" ADD CONSTRAINT "organisasi_kecamatanId_fkey" FOREIGN KEY ("kecamatanId") REFERENCES "kecamatan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organisasi" ADD CONSTRAINT "organisasi_desaId_fkey" FOREIGN KEY ("desaId") REFERENCES "desa"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organisasi" ADD CONSTRAINT "organisasi_pemilikId_fkey" FOREIGN KEY ("pemilikId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "keanggotaan" ADD CONSTRAINT "keanggotaan_organisasiId_fkey" FOREIGN KEY ("organisasiId") REFERENCES "organisasi"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "keanggotaan" ADD CONSTRAINT "keanggotaan_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "berita" ADD CONSTRAINT "berita_penulisId_fkey" FOREIGN KEY ("penulisId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "berita" ADD CONSTRAINT "berita_organisasiId_fkey" FOREIGN KEY ("organisasiId") REFERENCES "organisasi"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agenda" ADD CONSTRAINT "agenda_kecamatanId_fkey" FOREIGN KEY ("kecamatanId") REFERENCES "kecamatan"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agenda" ADD CONSTRAINT "agenda_pembuatId_fkey" FOREIGN KEY ("pembuatId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agenda" ADD CONSTRAINT "agenda_organisasiId_fkey" FOREIGN KEY ("organisasiId") REFERENCES "organisasi"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "peluang" ADD CONSTRAINT "peluang_agendaId_fkey" FOREIGN KEY ("agendaId") REFERENCES "agenda"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "peluang" ADD CONSTRAINT "peluang_pembuatId_fkey" FOREIGN KEY ("pembuatId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "peluang" ADD CONSTRAINT "peluang_organisasiId_fkey" FOREIGN KEY ("organisasiId") REFERENCES "organisasi"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pendaftaran" ADD CONSTRAINT "pendaftaran_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pendaftaran" ADD CONSTRAINT "pendaftaran_agendaId_fkey" FOREIGN KEY ("agendaId") REFERENCES "agenda"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pendaftaran" ADD CONSTRAINT "pendaftaran_peluangId_fkey" FOREIGN KEY ("peluangId") REFERENCES "peluang"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sertifikat" ADD CONSTRAINT "sertifikat_penerimaId_fkey" FOREIGN KEY ("penerimaId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sertifikat" ADD CONSTRAINT "sertifikat_penerbitId_fkey" FOREIGN KEY ("penerbitId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sertifikat" ADD CONSTRAINT "sertifikat_organisasiId_fkey" FOREIGN KEY ("organisasiId") REFERENCES "organisasi"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sertifikat" ADD CONSTRAINT "sertifikat_pendaftaranId_fkey" FOREIGN KEY ("pendaftaranId") REFERENCES "pendaftaran"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_log" ADD CONSTRAINT "audit_log_aktorId_fkey" FOREIGN KEY ("aktorId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session" ADD CONSTRAINT "session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "account" ADD CONSTRAINT "account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "twoFactor" ADD CONSTRAINT "twoFactor_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_MinatToProfilPemuda" ADD CONSTRAINT "_MinatToProfilPemuda_A_fkey" FOREIGN KEY ("A") REFERENCES "minat"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_MinatToProfilPemuda" ADD CONSTRAINT "_MinatToProfilPemuda_B_fkey" FOREIGN KEY ("B") REFERENCES "profil_pemuda"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_MinatToPeluang" ADD CONSTRAINT "_MinatToPeluang_A_fkey" FOREIGN KEY ("A") REFERENCES "minat"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_MinatToPeluang" ADD CONSTRAINT "_MinatToPeluang_B_fkey" FOREIGN KEY ("B") REFERENCES "peluang"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_KeterampilanToProfilPemuda" ADD CONSTRAINT "_KeterampilanToProfilPemuda_A_fkey" FOREIGN KEY ("A") REFERENCES "keterampilan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_KeterampilanToProfilPemuda" ADD CONSTRAINT "_KeterampilanToProfilPemuda_B_fkey" FOREIGN KEY ("B") REFERENCES "profil_pemuda"("id") ON DELETE CASCADE ON UPDATE CASCADE;
