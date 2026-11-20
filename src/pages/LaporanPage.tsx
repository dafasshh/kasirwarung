import React, { useState, useMemo } from 'react';
import { useApp } from '../store/store';
import { HeroBanner } from '../components/ui/HeroBanner';
import {
  BarChart3,
  Calendar,
  Download,
  TrendingUp,
  Receipt,
  CreditCard,
  Banknote,
  DollarSign,
  ArrowRight
} from 'lucide-react';

export const LaporanPage: React.FC = () => {
  const { transaksis, formatRupiah } = useApp();

  const [startDate, setStartDate] = useState(() => {
    // Default 30 hari terakhir
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().slice(0, 10);
  });
  const [endDate, setEndDate] = useState(() => {
    return new Date().toISOString().slice(0, 10);
  });

  // Filter transaksi berdasarkan rentang tanggal
  const filteredTransaksis = useMemo(() => {
    return transaksis.filter((t) => {
      const txDate = t.waktu.slice(0, 10);
      return txDate >= startDate && txDate <= endDate;
    });
  }, [transaksis, startDate, endDate]);

  const validTransaksis = useMemo(() => {
    return filteredTransaksis.filter((t) => t.status === 'SELESAI');
  }, [filteredTransaksis]);

  const cancelledTransaksis = useMemo(() => {
    return filteredTransaksis.filter((t) => t.status === 'DIBATALKAN');
  }, [filteredTransaksis]);

  // Statistik Ringkasan
  const totalOmzet = useMemo(() => {
    return validTransaksis.reduce((sum, t) => sum + t.total, 0);
  }, [validTransaksis]);

  const totalTunai = useMemo(() => {
    return validTransaksis
      .filter((t) => t.metode_pembayaran === 'TUNAI')
      .reduce((sum, t) => sum + t.total, 0);
  }, [validTransaksis]);

  const totalNonTunai = useMemo(() => {
    return validTransaksis
      .filter((t) => t.metode_pembayaran === 'NONTUNAI')
      .reduce((sum, t) => sum + t.total, 0);
  }, [validTransaksis]);

  const rataRataTransaksi = validTransaksis.length > 0 ? Math.round(totalOmzet / validTransaksis.length) : 0;

  // Ekspor CSV
  const handleExportCSV = () => {
    if (filteredTransaksis.length === 0) {
      alert('Tidak ada data transaksi untuk diekspor pada rentang tanggal ini.');
      return;
    }

    const headers = ['Nomor Nota', 'Waktu', 'Kasir', 'Metode', 'Total (Rp)', 'Status', 'Catatan'];
    const rows = filteredTransaksis.map((t) => [
      t.nomor_nota,
      t.waktu,
      `"${t.nama_kasir}"`,
      t.metode_pembayaran,
      t.total,
      t.status,
      `"${t.catatan_batal || ''}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `laporan-penjualan-warung_${startDate}_sd_${endDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 space-y-8">
      <HeroBanner
        badgeText="Laporan Keuangan & Rekap Omzet"
        title="Laporan Penjualan &"
        titleHighlight="Arus Pendapatan"
        description="Analisis performa penjualan warung secara akurat berdasarkan rentang tanggal kalender, tinjau proporsi metode pembayaran, dan ekspor laporan ke format CSV."
        actions={
          <button
            onClick={handleExportCSV}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-500/25 flex items-center space-x-2 transition"
          >
            <Download className="w-4 h-4" />
            <span>Ekspor Data ke CSV</span>
          </button>
        }
        stats={[
          { label: 'Total Omzet Periode Ini', value: formatRupiah(totalOmzet), subtext: `${validTransaksis.length} Transaksi Selesai` },
          { label: 'Omzet Pembayaran Tunai', value: formatRupiah(totalTunai), subtext: 'Uang kas fisik' },
          { label: 'Omzet Non-Tunai / QRIS', value: formatRupiah(totalNonTunai), subtext: 'Transfer bank & QRIS' },
          { label: 'Rata-rata per Nota (Basket Size)', value: formatRupiah(rataRataTransaksi), subtext: 'Rerata belanja pembeli' },
        ]}
      />

      {/* Filter Rentang Tanggal Panel */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">Pilih Rentang Tanggal Analisis</h3>
          <p className="text-xs text-slate-500">Sesuaikan tanggal mulai dan akhir untuk menghitung omzet penjualan</p>
        </div>

        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-xl text-xs">
            <span className="text-slate-400 font-medium">Dari:</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-transparent text-slate-800 dark:text-slate-200 font-semibold focus:outline-none"
            />
          </div>

          <span className="text-slate-400">&rarr;</span>

          <div className="flex items-center space-x-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-xl text-xs">
            <span className="text-slate-400 font-medium">Sampai:</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="bg-transparent text-slate-800 dark:text-slate-200 font-semibold focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Ringkasan Finansial Card Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Penjualan Berhasil</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center">
              <Receipt className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-3 font-mono">
            {formatRupiah(totalOmzet)}
          </p>
          <p className="text-xs text-slate-500 mt-1">{validTransaksis.length} transaksi sukses tercatat</p>
        </div>

        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Penerimaan Kas Tunai</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center">
              <Banknote className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-3 font-mono">
            {formatRupiah(totalTunai)}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            {totalOmzet > 0 ? Math.round((totalTunai / totalOmzet) * 100) : 0}% dari seluruh total omzet
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Non-Tunai / QRIS</span>
            <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 flex items-center justify-center">
              <CreditCard className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-3 font-mono">
            {formatRupiah(totalNonTunai)}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            {totalOmzet > 0 ? Math.round((totalNonTunai / totalOmzet) * 100) : 0}% dari seluruh total omzet
          </p>
        </div>
      </div>

      {/* Tabel Detail Rekap Transaksi */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
            Rincian Transaksi ({filteredTransaksis.length} Nota Terdata)
          </h3>
          <span className="text-xs text-slate-500">
            {cancelledTransaksis.length} Nota Dibatalkan
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 uppercase text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3 px-5 font-bold">No. Nota</th>
                <th className="py-3 px-4 font-bold">Waktu</th>
                <th className="py-3 px-4 font-bold">Kasir</th>
                <th className="py-3 px-4 font-bold">Metode</th>
                <th className="py-3 px-4 font-bold text-right">Nilai Transaksi</th>
                <th className="py-3 px-5 font-bold text-center">Status Transaksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredTransaksis.map((tx) => (
                <tr key={tx.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition">
                  <td className="py-3 px-5 font-mono font-bold text-slate-900 dark:text-white">
                    {tx.nomor_nota}
                  </td>
                  <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">
                    {new Date(tx.waktu).toLocaleString('id-ID', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </td>
                  <td className="py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">
                    {tx.nama_kasir}
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      {tx.metode_pembayaran}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-slate-900 dark:text-white">
                    {formatRupiah(tx.total)}
                  </td>
                  <td className="py-3 px-5 text-center">
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
    </div>
  );
};
