export type UserRole = 'ADMIN' | 'KASIR';

export interface User {
  id: string;
  email: string;
  username?: string; // opsional fallback kompatibilitas
  password?: string; // plain for demo client-side
  nama: string;
  role: UserRole;
  aktif: boolean;
  dibuat_pada: string;
}

export interface Produk {
  id: string;
  kode: string; // SKU unik e.g. BRG-001
  barcode?: string; // Barcode EAN/UPC/SKU untuk scanner kasir
  nama: string;
  kategori: string;
  harga_jual: number; // integer rupiah
  stok: number; // integer
  satuan: string; // Pcs, Bungkus, Botol, Kg, Sachet, dll.
  aktif: boolean;
  gambar?: string; // URL gambar atau data URL base64
}

export interface MutasiStok {
  id: string;
  id_produk: string;
  kode_produk: string;
  nama_produk: string;
  jenis: 'MASUK' | 'KELUAR' | 'PENYESUAIAN' | 'BATAL_TRANSAKSI';
  jumlah: number; // nilai mutasi
  stok_sebelum: number;
  stok_sesudah: number;
  alasan: string;
  pelaku: string; // username
  waktu: string; // ISO string
}

export interface DetailTransaksi {
  id: string;
  id_transaksi: string;
  id_produk: string;
  kode_produk: string;
  nama_produk: string;
  harga_saat_jual: number;
  qty: number;
  subtotal: number;
  satuan: string;
}

export type MetodePembayaran = 
  | 'TUNAI' 
  | 'QRIS' 
  | 'TRANSFER' 
  | 'EWALLET' 
  | 'DEBIT' // kompatibilitas pembacaan riwayat lama jika pernah tersimpan
  | 'NONTUNAI'; // Tetap simpan NONTUNAI untuk kompatibilitas data lama
export type StatusTransaksi = 'SELESAI' | 'DIBATALKAN';

export interface Transaksi {
  id: string;
  nomor_nota: string; // e.g. TRX-20261119-001
  waktu: string; // ISO string
  id_kasir: string;
  nama_kasir: string;
  items: DetailTransaksi[];
  total: number;
  metode_pembayaran: MetodePembayaran;
  uang_diterima: number;
  kembalian: number;
  status: StatusTransaksi;
  catatan_batal?: string;
  waktu_batal?: string;
  pelaku_batal?: string;
}

export interface CartItem {
  produk: Produk;
  qty: number;
  subtotal: number;
}
