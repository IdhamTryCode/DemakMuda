/**
 * Aturan bersama untuk Agenda.
 *
 * Sebelum ini syarat "agenda yang akan datang" ditulis ulang di lima tempat:
 * beranda, dasbor dinas, dan dasbor organisasi. Kelimanya kebetulan sama, dan
 * "kebetulan" itulah masalahnya — begitu satu tempat diubah, angka di beranda
 * dan angka di dasbor akan berbeda tanpa ada yang menyadarinya.
 *
 * Sekarang aturannya tinggal di sini, dan yang memerlukannya membacanya dari
 * satu sumber yang sama.
 */

/**
 * Agenda yang sudah terbit dan belum lewat.
 *
 * `sekarang` diminta sebagai argumen, bukan dihitung di dalam. Satu halaman
 * kerap memanggilnya beberapa kali di dalam satu `Promise.all`; bila tiap
 * panggilan memakai jamnya sendiri, hitungannya dapat terbelah di antara dua
 * milidetik yang berbeda.
 */
export function agendaAkanDatang(sekarang: Date) {
  return { status: "TERBIT" as const, mulai: { gte: sekarang } };
}
