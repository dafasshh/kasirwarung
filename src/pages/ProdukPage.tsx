import React, { useState, useMemo, useRef } from 'react';
import { useApp } from '../store/store';
import { Produk } from '../types';
import { HeroBanner } from '../components/ui/HeroBanner';
import { getCategoryFallbackImage } from '../data/productAssets';
import {
  Package,
  Plus,
  Search,
  Edit2,
  CheckCircle,
  XCircle,
  AlertCircle,
  X,
  Save,
  Image as ImageIcon,
  Upload,
  Link as LinkIcon
} from 'lucide-react';

export const ProdukPage: React.FC = () => {
  const { produks, tambahProduk, updateProduk, toggleStatusProduk, formatRupiah } = useApp();

  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduk, setEditingProduk] = useState<Produk | null>(null);

  // Form State
  const [kode, setKode] = useState('');
  const [barcode, setBarcode] = useState('');
  const [nama, setNama] = useState('');
  const [kategori, setKategori] = useState('Sembako');
  const [hargaJual, setHargaJual] = useState<number | ''>('');
  const [stok, setStok] = useState<number | ''>('');
  const [satuan, setSatuan] = useState('Pcs');
  const [gambar, setGambar] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const filteredProduks = useMemo(() => {
    return produks.filter((p) => {
      const q = search.toLowerCase();
      return (
        p.nama.toLowerCase().includes(q) ||
        p.kode.toLowerCase().includes(q) ||
        (p.barcode && p.barcode.toLowerCase().includes(q)) ||
        p.kategori.toLowerCase().includes(q)
      );
    });
  }, [produks, search]);

  const openAddModal = () => {
    setEditingProduk(null);
    const nextNum = produks.length + 1;
    const newKode = `BRG-${nextNum.toString().padStart(3, '0')}`;
    setKode(newKode);
    setBarcode(`899${Math.floor(1000000000 + Math.random() * 9000000000)}`);
    setNama('');
    setKategori('Sembako');
    setHargaJual('');
    setStok('');
    setSatuan('Pcs');
    setGambar('');
    setFormError(null);
    setModalOpen(true);
  };

  const openEditModal = (p: Produk) => {
    setEditingProduk(p);
    setKode(p.kode);
    setBarcode(p.barcode || p.kode);
    setNama(p.nama);
    setKategori(p.kategori);
    setHargaJual(p.harga_jual);
    setStok(p.stok);
    setSatuan(p.satuan);
    setGambar(p.gambar || '');
    setFormError(null);
    setModalOpen(true);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setFormError('Harap pilih file gambar (JPG, PNG, WebP).');
      return;
    }

    // Limit ukuran file 1.5MB untuk LocalStorage
    if (file.size > 1.5 * 1024 * 1024) {
      setFormError('Ukuran gambar terlalu besar. Maksimal 1.5 MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (typeof event.target?.result === 'string') {
        setGambar(event.target.result);
        setFormError(null);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!kode.trim() || !nama.trim() || hargaJual === '' || stok === '') {
      setFormError('Mohon isi seluruh bidang formulir dengan benar.');
      return;
    }

    const hargaNum = Number(hargaJual);
    const stokNum = Number(stok);

    if (hargaNum < 0 || stokNum < 0) {
      setFormError('Harga dan stok tidak boleh bernilai negatif.');
      return;
    }

    if (editingProduk) {
      const res = updateProduk(editingProduk.id, {
        kode: kode.trim().toUpperCase(),
        barcode: barcode.trim() || undefined,
        nama: nama.trim(),
        kategori: kategori.trim(),
        harga_jual: Math.round(hargaNum),
        stok: Math.round(stokNum),
        satuan: satuan.trim(),
        gambar: gambar.trim() || undefined,
      });
      if (!res.success) {
        setFormError(res.error || 'Gagal mengubah data produk');
        return;
      }
    } else {
      const res = tambahProduk({
        kode: kode.trim().toUpperCase(),
        barcode: barcode.trim() || undefined,
        nama: nama.trim(),
        kategori: kategori.trim(),
        harga_jual: Math.round(hargaNum),
        stok: Math.round(stokNum),
        satuan: satuan.trim(),
        aktif: true,
        gambar: gambar.trim() || undefined,
      });
      if (!res.success) {
        setFormError(res.error || 'Gagal menambahkan produk');
        return;
      }
    }

    setModalOpen(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 space-y-6">
      <HeroBanner
        badgeText="Katalog Master Data Produk"
        title="Kelola Produk &"
        titleHighlight="Inventaris Warung"
        description="Daftarkan barang dagangan baru lengkap dengan aset foto produk, atur harga jual rupiah, dan ubah status aktif tanpa khawatir merusak riwayat transaksi."
        actions={
          <button
            onClick={openAddModal}
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/25 flex items-center space-x-2 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Produk Baru</span>
          </button>
        }
      />

      {/* Main Table Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        
        {/* Search Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari berdasarkan kode SKU, nama, atau kategori..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
          <span className="text-xs text-slate-500 font-medium">
            Total {filteredProduks.length} produk terdaftar
          </span>
        </div>

        {/* Tabel Data */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 uppercase text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3 px-5 font-bold">Produk</th>
                <th className="py-3 px-4 font-bold">Kode / SKU</th>
                <th className="py-3 px-4 font-bold">Kategori</th>
                <th className="py-3 px-4 font-bold text-right">Harga Jual</th>
                <th className="py-3 px-4 font-bold text-center">Stok</th>
                <th className="py-3 px-4 font-bold text-center">Status</th>
                <th className="py-3 px-5 font-bold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredProduks.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition">
                  <td className="py-3.5 px-5 font-bold text-slate-900 dark:text-slate-100">
                    <div className="flex items-center space-x-3">
                      <img
                        src={p.gambar || getCategoryFallbackImage(p.kategori || 'Sembako')}
                        alt={p.nama}
                        className="w-10 h-10 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                        onError={(e) => {
                          const target = e.currentTarget;
                          target.onerror = null;
                          target.src = getCategoryFallbackImage(p.kategori || 'Sembako');
                        }}
                      />
                      <div>
                        <span className="font-bold text-slate-900 dark:text-white block">{p.nama}</span>
                        <span className="text-[10px] text-slate-400 font-normal">{p.satuan}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-blue-600 dark:text-blue-400 whitespace-nowrap">
                    {p.kode}
                  </td>
                  <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium text-[11px]">
                      {p.kategori}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900 dark:text-white whitespace-nowrap">
                    {formatRupiah(p.harga_jual)}
                  </td>
                  <td className="py-3.5 px-4 text-center whitespace-nowrap">
                    <span
                      className={`font-bold px-2 py-0.5 rounded-lg text-[11px] ${
                        p.stok > 10
                          ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400'
                          : p.stok > 0
                          ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400'
                          : 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400'
                      }`}
                    >
                      {p.stok} {p.satuan}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-center whitespace-nowrap">
                    <button
                      onClick={() => toggleStatusProduk(p.id)}
                      className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold transition ${
                        p.aktif
                          ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 border border-emerald-200 dark:border-emerald-800/60'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-400 border border-slate-300 dark:border-slate-700'
                      }`}
                    >
                      {p.aktif ? (
                        <>
                          <CheckCircle className="w-3 h-3" />
                          <span>Aktif</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3 h-3" />
                          <span>Nonaktif</span>
                        </>
                      )}
                    </button>
                  </td>
                  <td className="py-3.5 px-5 text-right whitespace-nowrap">
                    <button
                      onClick={() => openEditModal(p)}
                      className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950/50 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition"
                      title="Edit Produk"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Form Tambah / Edit Produk dengan Input Foto */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                {editingProduk ? 'Edit Data Produk' : 'Tambah Produk Baru'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4">
              {formError && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-400 text-xs font-medium flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Foto Produk & Pratinjau */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Foto Produk
                </label>
                <div className="flex items-center space-x-4">
                  <div className="w-20 h-20 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 overflow-hidden flex items-center justify-center shrink-0">
                    {gambar ? (
                      <img src={gambar} alt="Pratinjau" className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon className="w-6 h-6 text-slate-400" />
                    )}
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="relative">
                      <LinkIcon className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="url"
                        placeholder="Tempel URL gambar (https://...)"
                        value={gambar}
                        onChange={(e) => setGambar(e.target.value)}
                        className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <input
                        type="file"
                        accept="image/*"
                        ref={fileInputRef}
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-[11px] font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Pilih Gambar dari Komputer</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Kode / SKU (Unik)
                  </label>
                  <input
                    type="text"
                    required
                    value={kode}
                    onChange={(e) => setKode(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono text-xs font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none uppercase"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Barcode Barang (Opsional / Scanner)
                  </label>
                  <input
                    type="text"
                    value={barcode}
                    onChange={(e) => setBarcode(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono text-xs font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder="Contoh: 8991234567890"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Kategori
                </label>
                <input
                  type="text"
                  required
                  value={kategori}
                  onChange={(e) => setKategori(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="Sembako, Minuman, dll"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Nama Produk
                </label>
                <input
                  type="text"
                  required
                  value={nama}
                  onChange={(e) => setNama(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="Contoh: Beras Ramos 5 Kg"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Harga Jual (Rp)
                  </label>
                  <input
                    type="number"
                    required
                    value={hargaJual}
                    onChange={(e) => setHargaJual(e.target.value === '' ? '' : parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono text-xs font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Satuan
                  </label>
                  <input
                    type="text"
                    required
                    value={satuan}
                    onChange={(e) => setSatuan(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder="Pcs, Kg, dll"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Jumlah Stok
                </label>
                <input
                  type="number"
                  required
                  value={stok}
                  onChange={(e) => setStok(e.target.value === '' ? '' : parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono text-xs font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none"
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
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/25 flex items-center space-x-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Simpan Produk</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
