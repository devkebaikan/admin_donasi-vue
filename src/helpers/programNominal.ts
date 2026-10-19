// FILE: src/helpers/programNominal.ts
// Helper bersama untuk pilihan nominal program (masukan biasa & masukan ads).
// Dipakai oleh halaman create dan edit program.

export type NominalTipe = "biasa" | "ads";

export interface NominalItem {
  nama: string;
  nominal: number | undefined;
}

/**
 * Validasi satu daftar nominal. Mengembalikan pesan error pertama,
 * atau null kalau semua item valid.
 */
export const validateNominalItems = (
  items: NominalItem[],
  label: string,
): string | null => {
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    if (!item.nama?.trim()) {
      return `${label} #${i + 1}: nama pilihan wajib diisi`;
    }
    if (!item.nominal || Number(item.nominal) <= 0) {
      return `${label} #${i + 1}: nominal harus lebih dari 0`;
    }
  }
  return null;
};

/**
 * Validasi gabungan untuk jenis_nominal = masukan.
 * Minimal harus ada satu pilihan nominal (biasa atau ads).
 */
export const validateMasukan = (
  biasa: NominalItem[],
  ads: NominalItem[],
): string | null => {
  if (biasa.length === 0 && ads.length === 0) {
    return "Tambahkan minimal satu pilihan nominal untuk jenis nominal Masukan";
  }
  return (
    validateNominalItems(biasa, "Masukan Biasa") ??
    validateNominalItems(ads, "Masukan Ads")
  );
};

/**
 * Serialisasi ke JSON string sesuai yang dibaca backend
 * (field form: nominal_biasa / nominal_ads).
 */
export const serializeNominalItems = (items: NominalItem[]): string =>
  JSON.stringify(
    items.map((item) => ({
      nama_pilihan: item.nama.trim(),
      nominal: Number(item.nominal),
    })),
  );

/**
 * Ambil nominal dari response API berdasarkan tipe.
 * Item lama tanpa field `tipe` dianggap "biasa".
 */
export const mapNominalOptions = (
  options: any[] | undefined | null,
  tipe: NominalTipe,
): NominalItem[] =>
  (Array.isArray(options) ? options : [])
    .filter((o) => (o.tipe ?? "biasa") === tipe)
    .map((o) => ({
      nama: o.nama_pilihan ?? o.nama ?? "",
      nominal: o.nominal != null ? Number(o.nominal) : undefined,
    }));