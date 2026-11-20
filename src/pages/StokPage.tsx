import React, { useState, useMemo } from 'react';
import { useApp } from '../store/store';
import { HeroBanner } from '../components/ui/HeroBanner';
import {
  Layers,
  ArrowDownUp,
  Search,
  CheckCircle2,
  AlertCircle,
  Clock,
  History,
  X,
  SlidersHorizontal
} from 'lucide-react';

export const StokPage: React.FC = () => {
  const { produks, mutasiStoks, sesuaikanStok, currentUser } = useApp();

  const [activeTab, setActiveTab] = useState<'opname' | 'riwayat'>('opname');
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<{ id: string; nama: string; kode: string; stok: number; satuan: string } | null>(null);
  const [stokBaru, setStokBaru] = useState<number | ''>('');
  const [alasan, setAlasan] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const filteredProduk = useMemo(() => {
    return produks.filter((p) => {
      const q = search.toLowerCase();
      return p.nama.toLowerCase().includes(q) || p.kode.toLowerCase().includes(q);
    });
  }, [produks, search]);

  const filteredMutasi = useMemo(() => {
    return mutasiStoks.filter((m) => {
      const q = search.toLowerCase();
      return (
        m.nama_produk.toLowerCase().includes(q) ||
        m.kode_produk.toLowerCase().includes(q) ||
        m.alasan.toLowerCase().includes(q) ||
        m.pelaku.toLowerCase().includes(q)
      );
    });
  }, [mutasiStoks, search]);

  const openOpnameModal = (p: typeof produks[0]) => {
    setSelectedProduct(p);
    setStokBaru(p.stok);
    setAlasan('');
    setErrorMsg(null);
    setModalOpen(true);
  };

  const handleOpnameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;
    setErrorMsg(null);

    if (stokBaru === '' || Number(stokBaru) < 0) {
      setErrorMsg('Stok baru harus berupa angka positif.');
      return;
    }

    if (!alasan.trim()) {
      setErrorMsg('Harap berikan keterangan / alasan penyesuaian stok opname.');
      return;
    }

    const res = sesuaikanStok(selectedProduct.id, Number(stokBaru), alasan.trim());
    if (res.success) {
      setSuccessMsg(`Stok "${selectedProduct.nama}" berhasil diperbarui menjadi ${stokBaru} ${selectedProduct.satuan}.`);
      setModalOpen(false);
      setTimeout(() => setSuccessMsg(null), 4000);
    } else {
      setErrorMsg(res.error || 'Gagal menyesuaikan stok.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 space-y-6">
      <HeroBanner
        badgeText="Stok Opname & Audit Mutasi Fisik"
        title="Penyesuaian Stok"
        titleHighlight="& Audit Mutasi"
        description="Lakukan pencocokan stok fisik warung secara berkala (stok opname) dengan mencatat alasan selisih barang, riwayat masuk/keluar, dan penanggung jawab."
      />

      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 text-xs font-bold flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Tabs & Search Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-2 bg-slate-200/70 dark:bg-slate-800/80 p-1 rounded-2xl">
          <button
            onClick={() => setActiveTab('opname')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'opname'
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Stok Saat Ini (Opname)
          </button>
          <button
            onClick={() => setActiveTab('riwayat')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'riwayat'
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Riwayat Log Mutasi ({mutasiStoks.length})
          </button>
        </div>

        <div className="relative max-w-xs w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari kode atau nama produk..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>
      </div>

      {/* TAB 1: STOK OPNAME */}
      {activeTab === 'opname' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 uppercase text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-5 font-bold">Kode / SKU</th>
                  <th className="py-3 px-4 font-bold">Nama Produk</th>
                  <th className="py-3 px-4 font-bold">Kategori</th>
                  <th className="py-3 px-4 font-bold text-center">Stok Sistem</th>
                  <th className="py-3 px-4 font-bold text-center">Satuan</th>
                  <th className="py-3 px-5 font-bold text-right">Aksi Opname</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredProduk.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition">
                    <td className="py-3.5 px-5 font-mono font-bold text-blue-600 dark:text-blue-400">
                      {p.kode}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-slate-100">
                      {p.nama}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">{p.kategori}</td>
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`font-mono font-extrabold text-sm px-2.5 py-1 rounded-xl ${
                          p.stok <= 10
                            ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200'
                        }`}
                      >
                        {p.stok}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center font-medium text-slate-600 dark:text-slate-400">
                      {p.satuan}
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      <button
                        onClick={() => openOpnameModal(p)}
                        className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 font-bold text-xs transition"
                      >
                        <SlidersHorizontal className="w-3.5 h-3.5" />
                        <span>Sesuaikan Stok</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: RIWAYAT MUTASI */}
      {activeTab === 'riwayat' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 uppercase text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-5 font-bold">Waktu</th>
                  <th className="py-3 px-4 font-bold">Produk</th>
                  <th className="py-3 px-4 font-bold text-center">Jenis Mutasi</th>
                  <th className="py-3 px-4 font-bold text-center">Stok Sebelum &rarr; Sesudah</th>
                  <th className="py-3 px-4 font-bold">Alasan / Catatan</th>
                  <th className="py-3 px-5 font-bold text-right">Pelaku</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredMutasi.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition">
                    <td className="py-3.5 px-5 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                      {new Date(m.waktu).toLocaleString('id-ID', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-slate-900 dark:text-slate-100">{m.nama_produk}</p>
                      <p className="text-[10px] font-mono text-slate-400">{m.kode_produk}</p>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                          m.jenis === 'MASUK'
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                            : m.jenis === 'KELUAR'
                            ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800'
                            : m.jenis === 'BATAL_TRANSAKSI'
                            ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800'
                            : 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
                        }`}
                      >
                        {m.jenis}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono text-xs">
                      <span className="text-slate-400">{m.stok_sebelum}</span>
                      <span className="mx-1 text-slate-400">&rarr;</span>
                      <span className="font-bold text-slate-900 dark:text-white">{m.stok_sesudah}</span>
                      <span className="text-[10px] text-slate-400 ml-1">
                        ({m.stok_sesudah >= m.stok_sebelum ? `+${m.jumlah}` : `-${m.jumlah}`})
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300 font-medium">
                      {m.alasan}
                    </td>
                    <td className="py-3.5 px-5 text-right font-mono font-bold text-slate-500">
                      @{m.pelaku}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Penyesuaian Stok Opname */}
      {modalOpen && selectedProduct && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                Stok Opname: {selectedProduct.nama}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleOpnameSubmit} className="p-6 space-y-4">
              {errorMsg && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-400 text-xs font-medium flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-slate-400 uppercase font-bold">Stok Sistem Saat Ini</p>
                  <p className="text-lg font-bold font-mono text-slate-800 dark:text-white">
                    {selectedProduct.stok} {selectedProduct.satuan}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-slate-400 uppercase font-bold">Pelaksana</p>
                  <p className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400">
                    {currentUser?.email || currentUser?.nama || 'Petugas'}
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Stok Fisik Sebenarnya (Hasil Hitung Opname)
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={stokBaru}
                  onChange={(e) => setStokBaru(e.target.value === '' ? '' : parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Alasan Penyesuaian / Catatan Audit
                </label>
                <textarea
                  required
                  rows={3}
                  value={alasan}
                  onChange={(e) => setAlasan(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="Contoh: Barang kadaluwarsa 2 pcs / Salah hitung stok awal / Pembelian tambahan dari suplier"
                />
              </div>

              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/25"
                >
                  Simpan Penyesuaian
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
