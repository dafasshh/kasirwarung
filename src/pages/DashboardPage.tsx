import React, { useMemo } from 'react';
import { useApp } from '../store/store';
import { HeroBanner } from '../components/ui/HeroBanner';
import {
  TrendingUp,
  Receipt,
  Package,
  AlertTriangle,
  ArrowUpRight,
  ShoppingCart,
  Users,
  Layers,
  Sparkles
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { transaksis, produks, mutasiStoks, users, formatRupiah, setCurrentPage } = useApp();

  // Hitung transaksi aktif (tidak dibatalkan)
  const validTransaksis = useMemo(() => {
    return transaksis.filter((t) => t.status === 'SELESAI');
  }, [transaksis]);

  const totalOmzet = useMemo(() => {
    return validTransaksis.reduce((sum, t) => sum + t.total, 0);
  }, [validTransaksis]);

  // Produk menipis (stok <= 15)
  const lowStockProducts = useMemo(() => {
    return produks.filter((p) => p.aktif && p.stok <= 15).sort((a, b) => a.stok - b.stok);
  }, [produks]);

  // Transaksi terbaru
  const recentTransaksis = useMemo(() => {
    return [...transaksis].slice(0, 5);
  }, [transaksis]);

  // Mutasi terbaru
  const recentMutasis = useMemo(() => {
    return [...mutasiStoks].slice(0, 5);
  }, [mutasiStoks]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 space-y-8">
      {/* SaaS Hero Banner */}
      <HeroBanner
        badgeText="Panel Pusat Kontrol & Manajemen Operasional Warung"
        title="Ringkasan Kinerja &"
        titleHighlight="Operasional Warung"
        description="Pantau arus kas penjualan, status ketersediaan barang inventaris, serta catatan log mutasi stok dalam satu dasbor terpadu."
        actions={
          <>
            <button
              onClick={() => setCurrentPage('kasir')}
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/25 flex items-center space-x-2 transition"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>Buka Menu Kasir</span>
            </button>
            <button
              onClick={() => setCurrentPage('laporan')}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs backdrop-blur-md border border-white/10 flex items-center space-x-2 transition"
            >
              <TrendingUp className="w-4 h-4" />
              <span>Analisis Laporan</span>
            </button>
          </>
        }
        stats={[
          { label: 'Total Omzet Penjualan', value: formatRupiah(totalOmzet), subtext: 'Dari seluruh transaksi selesai' },
          { label: 'Jumlah Transaksi', value: `${validTransaksis.length} Nota`, subtext: 'Transaksi berhasil tercatat' },
          { label: 'Katalog Produk Aktif', value: `${produks.filter((p) => p.aktif).length} SKU`, subtext: 'Tersedia di etalase kasir' },
          { label: 'Peringatan Stok Tipis', value: `${lowStockProducts.length} Produk`, subtext: 'Perlu pengadaan segera' },
        ]}
      />

      {/* Grid Status Ringkas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500">Omzet Penjualan</p>
            <p className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">{formatRupiah(totalOmzet)}</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500">Total Transaksi</p>
            <p className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">{validTransaksis.length} Nota</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 flex items-center justify-center">
            <Receipt className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500">Stok Kritis / Menipis</p>
            <p className="text-xl font-extrabold text-amber-600 dark:text-amber-400 mt-1">{lowStockProducts.length} Item</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500">Pengguna Terdaftar</p>
            <p className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">{users.length} Akun</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Baris Dua Kolom: Transaksi Terakhir & Stok Menipis */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Kolom Kiri: Transaksi Terakhir (7 Kolom) */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Transaksi Terkini</h3>
              <p className="text-xs text-slate-500">Aktivitas penjualan kasir yang baru saja tercatat</p>
            </div>
            <button
              onClick={() => setCurrentPage('riwayat')}
              className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center space-x-1"
            >
              <span>Lihat Semua</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 uppercase text-[10px]">
                  <th className="py-2.5 font-bold">Nota & Waktu</th>
                  <th className="py-2.5 font-bold">Kasir</th>
                  <th className="py-2.5 font-bold">Metode</th>
                  <th className="py-2.5 font-bold text-right">Nominal</th>
                  <th className="py-2.5 font-bold text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {recentTransaksis.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                    <td className="py-3">
                      <p className="font-mono font-bold text-slate-900 dark:text-slate-100">{tx.nomor_nota}</p>
                      <p className="text-[10px] text-slate-400">
                        {new Date(tx.waktu).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </td>
                    <td className="py-3 text-slate-600 dark:text-slate-300 font-medium">{tx.nama_kasir}</td>
                    <td className="py-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {tx.metode_pembayaran}
                      </span>
                    </td>
                    <td className="py-3 text-right font-bold text-slate-900 dark:text-white font-mono">
                      {formatRupiah(tx.total)}
                    </td>
                    <td className="py-3 text-center">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          tx.status === 'SELESAI'
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400'
                            : 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400'
                        }`}
                      >
                        {tx.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Kolom Kanan: Peringatan Stok Opname (5 Kolom) */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Peringatan Stok Menipis</h3>
              <p className="text-xs text-slate-500">Barang dengan stok &le; 15 unit</p>
            </div>
            <button
              onClick={() => setCurrentPage('stok')}
              className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center space-x-1"
            >
              <span>Atur Stok</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {lowStockProducts.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">Semua stok barang dalam kondisi aman (&gt; 15)</p>
            ) : (
              lowStockProducts.slice(0, 5).map((p) => (
                <div
                  key={p.id}
                  className="p-3 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex items-center justify-between"
                >
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white">{p.nama}</p>
                    <p className="text-[10px] text-slate-400 font-mono">{p.kode} &bull; {p.kategori}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-extrabold px-2 py-0.5 rounded-lg bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-900">
                      {p.stok} {p.satuan}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Quick Info Box */}
          <div className="mt-6 p-4 rounded-2xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200/50 dark:border-blue-900/50">
            <div className="flex items-center space-x-2 text-blue-700 dark:text-blue-300 font-bold text-xs mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Integritas Data Client-Side</span>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
              Seluruh riwayat transaksi disimpan permanen. Apabila terjadi pembatalan nota, sistem otomatis merevisi status dan mengembalikan stok produk (restocking) disertai log mutasi audit.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
