import { createAccessControl } from "better-auth/plugins/access";
import { adminAc, defaultStatements } from "better-auth/plugins/admin/access";

/**
 * Terjemahan langsung dari matriks peran pada cetak biru teknis (Bagian II).
 *
 * Berkas ini hanya menyatakan izin. Penegakannya tetap dilakukan di setiap
 * Server Action — middleware tidak memvalidasi sesi ke basis data, sehingga
 * tidak boleh menjadi satu-satunya penjaga.
 */
export const statement = {
  ...defaultStatements,
  berita: ["baca", "tulis", "terbitkan", "hapus"],
  agenda: ["baca", "tulis", "hapus"],
  peluang: ["baca", "tulis", "hapus"],
  pendaftaran: ["daftar", "lihatPeserta", "ubahStatus"],
  organisasi: ["buat", "kelola", "verifikasi"],
  sertifikat: ["terbitkan", "batalkan"],
  profil: ["kelolaSendiri", "verifikasi"],
  dasbor: ["lihatPetaPotensi", "lihatAudit"],
} as const;

export const ac = createAccessControl(statement);

export const pemuda = ac.newRole({
  berita: ["baca"],
  agenda: ["baca"],
  peluang: ["baca"],
  pendaftaran: ["daftar"],
  organisasi: ["buat"],
  profil: ["kelolaSendiri"],
});

export const organisasi = ac.newRole({
  berita: ["baca", "tulis", "terbitkan"],
  agenda: ["baca", "tulis"],
  peluang: ["baca", "tulis"],
  pendaftaran: ["lihatPeserta", "ubahStatus"],
  organisasi: ["kelola"],
  sertifikat: ["terbitkan"],
  profil: ["kelolaSendiri"],
});

export const dinas = ac.newRole({
  berita: ["baca", "tulis", "terbitkan", "hapus"],
  agenda: ["baca", "tulis", "hapus"],
  peluang: ["baca", "tulis", "hapus"],
  pendaftaran: ["lihatPeserta", "ubahStatus"],
  organisasi: ["kelola", "verifikasi"],
  sertifikat: ["terbitkan", "batalkan"],
  profil: ["kelolaSendiri", "verifikasi"],
  dasbor: ["lihatPetaPotensi"],
});

export const superadmin = ac.newRole({
  ...adminAc.statements,
  berita: ["baca", "tulis", "terbitkan", "hapus"],
  agenda: ["baca", "tulis", "hapus"],
  peluang: ["baca", "tulis", "hapus"],
  pendaftaran: ["daftar", "lihatPeserta", "ubahStatus"],
  organisasi: ["buat", "kelola", "verifikasi"],
  sertifikat: ["terbitkan", "batalkan"],
  profil: ["kelolaSendiri", "verifikasi"],
  dasbor: ["lihatPetaPotensi", "lihatAudit"],
});
