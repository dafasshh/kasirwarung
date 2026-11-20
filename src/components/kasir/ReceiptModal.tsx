import React from 'react';
import { Transaksi } from '../../types';
import { useApp } from '../../store/store';
import { Printer, X, CheckCircle, ShieldAlert, Store } from 'lucide-react';

interface ReceiptModalProps {
  transaksi: Transaksi | null;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ transaksi, onClose }) => {
  const { formatRupiah } = useApp();

  if (!transaksi) return null;

  const handlePrint = () => {
    window.print();
  };

  const formattedDate = new Date(transaksi.waktu).toLocaleString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-2.5 sm:p-4">
      <div className="relative w-full max-w-md max-h-[90dvh] bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col my-auto">
        
        {/* Modal Top Bar */}
        <div className="px-4 py-3 sm:px-6 sm:py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between no-print bg-slate-50 dark:bg-slate-800/50 shrink-0">
          <div className="flex items-center space-x-2">
            {transaksi.status === 'SELESAI' ? (
              <span className="flex items-center space-x-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-800/50">
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Transaksi Sukses</span>
              </span>
            ) : (
              <span className="flex items-center space-x-1.5 text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 px-2.5 py-1 rounded-full border border-rose-200 dark:border-rose-800/50">
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Transaksi Dibatalkan</span>
              </span>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center space-x-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors touch-manipulation"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 min-h-[36px] min-w-[36px] flex items-center justify-center"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Struk Card Area (Scrollable di HP) */}
        <div id="printable-receipt" className="p-4 sm:p-6 text-slate-800 dark:text-slate-200 font-mono text-xs overflow-y-auto flex-1">
          {/* Header Toko */}
          <div className="text-center pb-4 border-b border-dashed border-slate-300 dark:border-slate-700">
            <div className="flex justify-center mb-1">
              <Store className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white uppercase font-sans">
              WARUNG BERKAH SEDERHANA
            </h3>
            <p className="text-[11px] text-slate-500 font-sans">Jl. Raya Mampang Prapatan No. 42, Jakarta</p>
            <p className="text-[11px] text-slate-500 font-sans">Telp/WA: 0812-3456-7890</p>
          </div>

          {/* Info Nota */}
          <div className="py-3 border-b border-dashed border-slate-300 dark:border-slate-700 space-y-1">
            <div className="flex justify-between">
              <span className="text-slate-500">No. Nota:</span>
              <span className="font-bold text-slate-900 dark:text-white">{transaksi.nomor_nota}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Waktu:</span>
              <span>{formattedDate}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Kasir:</span>
              <span>{transaksi.nama_kasir}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Metode Bayar:</span>
              <span className="font-semibold uppercase">{transaksi.metode_pembayaran}</span>
            </div>
          </div>

          {/* Item List */}
          <div className="py-3 border-b border-dashed border-slate-300 dark:border-slate-700 space-y-2">
            {transaksi.items.map((item, idx) => (
              <div key={idx} className="space-y-0.5">
                <div className="font-medium text-slate-900 dark:text-white truncate">
                  {item.nama_produk}
                </div>
                <div className="flex justify-between text-slate-500 text-[11px]">
                  <span>
                    {item.qty} {item.satuan} x {formatRupiah(item.harga_saat_jual)}
                  </span>
                  <span className="font-semibold text-slate-900 dark:text-slate-200">
                    {formatRupiah(item.subtotal)}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Perhitungan Total */}
          <div className="py-3 space-y-1.5 border-b border-dashed border-slate-300 dark:border-slate-700">
            <div className="flex justify-between text-sm font-bold text-slate-900 dark:text-white">
              <span>TOTAL</span>
              <span>{formatRupiah(transaksi.total)}</span>
            </div>
            <div className="flex justify-between text-slate-600 dark:text-slate-400">
              <span>Bayar ({transaksi.metode_pembayaran})</span>
              <span>{formatRupiah(transaksi.uang_diterima)}</span>
            </div>
            <div className="flex justify-between text-slate-600 dark:text-slate-400 font-semibold">
              <span>Kembalian</span>
              <span>{formatRupiah(transaksi.kembalian)}</span>
            </div>
          </div>

          {/* Status Batal Audit */}
          {transaksi.status === 'DIBATALKAN' && (
            <div className="mt-3 p-2 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-lg text-rose-700 dark:text-rose-400">
              <p className="font-bold">STATUS: DIBATALKAN</p>
              {transaksi.catatan_batal && <p className="mt-1">Alasan: {transaksi.catatan_batal}</p>}
              <p className="text-[10px] mt-0.5">Oleh: {transaksi.pelaku_batal} ({transaksi.waktu_batal})</p>
            </div>
          )}

          {/* Footer Struk */}
          <div className="pt-4 text-center text-slate-500 text-[11px] font-sans space-y-1">
            <p>Terima kasih telah berbelanja di Warung kami!</p>
            <p className="text-[10px] text-slate-400">Barang yang sudah dibeli dapat ditukar maksimal 1x24 jam membawa nota ini.</p>
          </div>
        </div>

        {/* Modal Action Bottom */}
        <div className="p-3 sm:p-4 border-t border-slate-200 dark:border-slate-800 flex flex-col-reverse sm:flex-row items-center justify-between gap-2.5 no-print bg-slate-50 dark:bg-slate-800/40 shrink-0">
          <span className="hidden sm:inline text-[11px] text-slate-400">
            Tekan <strong>Cetak</strong> untuk print nota minimarket
          </span>
          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <button
              onClick={handlePrint}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center space-x-1.5 px-4 py-2.5 min-h-[42px] bg-blue-600 hover:bg-blue-700 active:scale-98 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/25 transition-all touch-manipulation"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak Struk</span>
            </button>
            <button
              onClick={onClose}
              className="flex-1 sm:flex-initial px-4 py-2.5 min-h-[42px] text-xs font-semibold rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-600 active:scale-98 transition-all flex items-center justify-center touch-manipulation"
            >
              Tutup / Transaksi Baru
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
