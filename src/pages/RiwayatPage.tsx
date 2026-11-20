import React, { useState, useMemo } from 'react';
import { useApp } from '../store/store';
import { Transaksi } from '../types';
import { HeroBanner } from '../components/ui/HeroBanner';
import { ReceiptModal } from '../components/kasir/ReceiptModal';
import {
  History,
  Search,
  Calendar,
  Eye,
  RotateCcw,
  AlertTriangle,
  X,
  FileSpreadsheet,
  CheckCircle,
  XCircle
} from 'lucide-react';

export const RiwayatPage: React.FC = () => {
  const { transaksis, batalkanTransaksi, formatRupiah, currentUser } = useApp();

  const [search, setSearch] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [filterStatus, setFilterStatus] = useState<'SEMUA' | 'SELESAI' | 'DIBATALKAN'>('SEMUA');
  const [selectedTx, setSelectedTx] = useState<Transaksi | null>(null);

  // Modal Batal Transaksi State
  const [batalModalOpen, setBatalModalOpen] = useState(false);
  const [txToCancel, setTxToCancel] = useState<Transaksi | null>(null);
  const [alasanBatal, setAlasanBatal] = useState('');
  const [batalError, setBatalError] = useState<string | null>(null);

  // Kasir biasa hanya melihat transaksi miliknya sendiri, Admin melihat seluruh warung
  const accessibleTransaksis = useMemo(() => {
    if (currentUser?.role === 'ADMIN') {
      return transaksis;
    }
    return transaksis.filter((t) => t.id_kasir === currentUser?.id);
  }, [transaksis, currentUser]);

  const filteredList = useMemo(() => {
    return accessibleTransaksis.filter((tx) => {
      const q = search.toLowerCase();
      const matchSearch =
        tx.nomor_nota.toLowerCase().includes(q) ||
        tx.nama_kasir.toLowerCase().includes(q) ||
        tx.items.some((item) => item.nama_produk.toLowerCase().includes(q));

      const matchStatus = filterStatus === 'SEMUA' || tx.status === filterStatus;

      let matchDate = true;
      if (filterDate) {
        matchDate = tx.waktu.startsWith(filterDate);
      }

      return matchSearch && matchStatus && matchDate;
    });
  }, [accessibleTransaksis, search, filterStatus, filterDate]);

  const handleOpenCancel = (tx: Transaksi) => {
    setTxToCancel(tx);
    setAlasanBatal('');
    setBatalError(null);
    setBatalModalOpen(true);
  };

  const handleConfirmCancel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!txToCancel) return;
    if (!alasanBatal.trim()) {
      setBatalError('Wajib menyertakan alasan pembatalan transaksi.');
      return;
    }

    const res = batalkanTransaksi(txToCancel.id, alasanBatal.trim());
    if (res.success) {
      setBatalModalOpen(false);
      setTxToCancel(null);
    } else {
      setBatalError(res.error || 'Gagal membatalkan transaksi.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 space-y-6">
      <HeroBanner
        badgeText={currentUser?.role === 'ADMIN' ? 'Audit Seluruh Transaksi Toko' : 'Riwayat Penjualan Kasir Saya'}
        title="Riwayat Nota &"
        titleHighlight="Transaksi Warung"
        description={
          currentUser?.role === 'ADMIN'
            ? 'Lihat detail struk penjualan, telusuri nota pelanggan, dan lakukan pembatalan transaksi dengan pengembalian stok barang secara atomik.'
            : 'Periksa daftar nota penjualan yang telah Anda proses hari ini dan cetak ulang struk apabila diperlukan oleh pelanggan.'
        }
      />

      {/* Filter Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari nomor nota, kasir, atau nama item..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center space-x-3 w-full md:w-auto">
          {/* Filter Tanggal */}
          <div className="flex items-center space-x-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-xl">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="bg-transparent text-xs text-slate-700 dark:text-slate-300 focus:outline-none"
            />
            {filterDate && (
              <button onClick={() => setFilterDate('')} className="text-slate-400 hover:text-slate-600">
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Filter Status */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            <option value="SEMUA">Semua Status</option>
            <option value="SELESAI">Selesai</option>
            <option value="DIBATALKAN">Dibatalkan</option>
          </select>
        </div>
      </div>

      {/* Tabel Riwayat */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 uppercase text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3 px-5 font-bold">Nomor Nota</th>
                <th className="py-3 px-4 font-bold">Waktu Transaksi</th>
                <th className="py-3 px-4 font-bold">Kasir</th>
                <th className="py-3 px-4 font-bold">Metode</th>
                <th className="py-3 px-4 font-bold text-right">Total Tagihan</th>
                <th className="py-3 px-4 font-bold text-center">Status</th>
                <th className="py-3 px-5 font-bold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredList.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    Tidak ada data transaksi yang cocok dengan filter.
                  </td>
                </tr>
              ) : (
                filteredList.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition">
                    <td className="py-3.5 px-5 font-mono font-bold text-blue-600 dark:text-blue-400">
                      {tx.nomor_nota}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400 font-mono text-[11px]">
                      {new Date(tx.waktu).toLocaleString('id-ID', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-800 dark:text-slate-200">
                      {tx.nama_kasir}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {tx.metode_pembayaran}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900 dark:text-white">
                      {formatRupiah(tx.total)}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          tx.status === 'SELESAI'
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                            : 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800'
                        }`}
                      >
                        {tx.status === 'SELESAI' ? (
                          <>
                            <CheckCircle className="w-3 h-3" />
                            <span>Selesai</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3 h-3" />
                            <span>Dibatalkan</span>
                          </>
                        )}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-right space-x-1">
                      <button
                        onClick={() => setSelectedTx(tx)}
                        className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-800/60 hover:bg-blue-600 hover:text-white transition font-bold text-xs shadow-2xs"
                        title="Lihat / Cetak Ulang Struk"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Lihat Struk</span>
                      </button>

                      {/* Batalkan Transaksi (Hanya Admin) */}
                      {currentUser?.role === 'ADMIN' && tx.status === 'SELESAI' && (
                        <button
                          onClick={() => handleOpenCancel(tx)}
                          className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200/60 dark:border-rose-800/60 hover:bg-rose-600 hover:text-white transition font-bold text-xs"
                          title="Batalkan Nota & Kembalikan Stok"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Batal</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Cetak Struk */}
      <ReceiptModal transaksi={selectedTx} onClose={() => setSelectedTx(null)} />

      {/* Modal Konfirmasi Pembatalan Transaksi */}
      {batalModalOpen && txToCancel && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-rose-50 dark:bg-rose-950/40">
              <div className="flex items-center space-x-2 text-rose-700 dark:text-rose-400 font-bold text-sm">
                <AlertTriangle className="w-4 h-4" />
                <span>Konfirmasi Pembatalan Transaksi</span>
              </div>
              <button
                onClick={() => setBatalModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleConfirmCancel} className="p-6 space-y-4">
              {batalError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
                  {batalError}
                </div>
              )}

              <p className="text-xs text-slate-600 dark:text-slate-300">
                Anda akan membatalkan nota <strong className="font-mono text-slate-900 dark:text-white">{txToCancel.nomor_nota}</strong> sebesar <strong>{formatRupiah(txToCancel.total)}</strong>.
              </p>
              <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 rounded-xl text-amber-800 dark:text-amber-400 text-[11px]">
                <p className="font-bold">Ketentuan Bisnis:</p>
                <p>Status akan diubah menjadi "DIBATALKAN", seluruh stok item dalam transaksi ini akan otomatis dikembalikan ke etalase toko, dan dicatat dalam audit mutasi.</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Alasan Pembatalan (Wajib):
                </label>
                <textarea
                  required
                  rows={3}
                  value={alasanBatal}
                  onChange={(e) => setAlasanBatal(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:ring-2 focus:ring-rose-500 focus:outline-none"
                  placeholder="Contoh: Pelanggan salah beli barang / Permintaan pembatalan langsung kasir"
                />
              </div>

              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setBatalModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-500/25 flex items-center space-x-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Proses Batal & Kembalikan Stok</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
