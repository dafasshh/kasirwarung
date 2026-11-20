import React, { useState, useMemo, useRef } from 'react';
import { useApp } from '../store/store';
import { MetodePembayaran, Transaksi } from '../types';
import { HeroBanner } from '../components/ui/HeroBanner';
import { ReceiptModal } from '../components/kasir/ReceiptModal';
import { BarcodeScannerModal } from '../components/kasir/BarcodeScannerModal';
import { getCategoryFallbackImage } from '../data/productAssets';
import {
  Search,
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  CheckCircle2,
  AlertCircle,
  CreditCard,
  Banknote,
  Layers,
  Image as ImageIcon,
  Barcode,
  QrCode,
  Building,
  Smartphone,
  Wallet,
  Camera
} from 'lucide-react';

export const KasirPage: React.FC = () => {
  const {
    produks,
    cart,
    addToCart,
    updateCartQty,
    removeFromCart,
    clearCart,
    checkout,
    formatRupiah,
    currentUser,
  } = useApp();

  const [search, setSearch] = useState('');
  const [selectedKategori, setSelectedKategori] = useState('Semua');
  const [metodePembayaran, setMetodePembayaran] = useState<MetodePembayaran>('TUNAI');
  const [uangDiterima, setUangDiterima] = useState<number | ''>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [scanMessage, setScanMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [barcodeInput, setBarcodeInput] = useState('');
  const barcodeInputRef = useRef<HTMLInputElement | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeNota, setActiveNota] = useState<Transaksi | null>(null);

  // State Modal Scan Kamera HP
  const [isCameraModalOpen, setIsCameraModalOpen] = useState(false);

  // Kategori unik dari produk aktif
  const kategoriList = useMemo(() => {
    const setKat = new Set<string>();
    produks.forEach((p) => {
      if (p.aktif && p.kategori) setKat.add(p.kategori);
    });
    return ['Semua', ...Array.from(setKat)];
  }, [produks]);

  // Filter produk aktif saja untuk kasir
  const filteredProduk = useMemo(() => {
    return produks.filter((p) => {
      if (!p.aktif) return false;
      const matchKategori = selectedKategori === 'Semua' || p.kategori === selectedKategori;
      const query = search.toLowerCase();
      const matchSearch =
        p.nama.toLowerCase().includes(query) ||
        p.kode.toLowerCase().includes(query) ||
        (p.barcode && p.barcode.toLowerCase().includes(query));
      return matchKategori && matchSearch;
    });
  }, [produks, search, selectedKategori]);

  // Fungsi reusable untuk memproses kode produk (dari scanner fisik, ketik manual, maupun kamera)
  const processScannedCode = (rawCode: string) => {
    setErrorMessage(null);
    setScanMessage(null);

    const code = rawCode.trim().toUpperCase();
    if (!code) return;

    // Cari berdasarkan barcode, kode SKU, atau ID
    const foundProduct = produks.find(
      (p) =>
        p.aktif &&
        ((p.barcode && p.barcode.toUpperCase() === code) ||
          p.kode.toUpperCase() === code ||
          p.id.toUpperCase() === code)
    );

    if (!foundProduct) {
      setScanMessage({
        type: 'error',
        text: `Barang dengan kode "${code}" tidak ditemukan dalam katalog aktif!`,
      });
      setBarcodeInput('');
      barcodeInputRef.current?.focus();
      return;
    }

    if (foundProduct.stok <= 0) {
      setScanMessage({
        type: 'error',
        text: `Stok "${foundProduct.nama}" sudah habis!`,
      });
      setBarcodeInput('');
      barcodeInputRef.current?.focus();
      return;
    }

    const itemInCart = cart.find((c) => c.produk.id === foundProduct.id);
    if (itemInCart && itemInCart.qty >= foundProduct.stok) {
      setScanMessage({
        type: 'error',
        text: `Jumlah di keranjang sudah mencapai batas stok (${foundProduct.stok} ${foundProduct.satuan}).`,
      });
      setBarcodeInput('');
      barcodeInputRef.current?.focus();
      return;
    }

    // Tambah ke keranjang
    const added = addToCart(foundProduct);
    if (added) {
      setScanMessage({
        type: 'success',
        text: `+1 ${foundProduct.nama} ditambahkan ke keranjang.`,
      });
    }

    setBarcodeInput('');
    barcodeInputRef.current?.focus();
  };

  // Handler Scan / Input Barcode Cepat (Minimarket Scanner Mode)
  const handleBarcodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    processScannedCode(barcodeInput);
  };

  // Handler hasil kamera scan
  const handleCameraScanSuccess = (decodedText: string) => {
    setIsCameraModalOpen(false);
    processScannedCode(decodedText);
  };

  const totalBelanja = useMemo(() => {
    return cart.reduce((acc, item) => acc + item.subtotal, 0);
  }, [cart]);

  const nominalUang = typeof uangDiterima === 'number' ? uangDiterima : 0;
  const kembalian = metodePembayaran === 'TUNAI' ? Math.max(0, nominalUang - totalBelanja) : 0;
  const isUangKurang = metodePembayaran === 'TUNAI' && totalBelanja > 0 && nominalUang < totalBelanja;
  const nominalKekurangan = totalBelanja - nominalUang;

  // Shortcut nominal uang tunai cepat
  const setQuickNominal = (amount: number) => {
    setUangDiterima(amount);
    setErrorMessage(null);
  };

  const setExactMoney = () => {
    setUangDiterima(totalBelanja);
    setErrorMessage(null);
  };

  const handleCheckout = () => {
    setErrorMessage(null);

    if (cart.length === 0) {
      setErrorMessage('Keranjang belanja masih kosong.');
      return;
    }

    if (metodePembayaran === 'TUNAI' && nominalUang < totalBelanja) {
      setErrorMessage(`Uang tunai kurang ${formatRupiah(nominalKekurangan)}. Total tagihan ${formatRupiah(totalBelanja)}.`);
      return;
    }

    setIsProcessing(true);

    setTimeout(() => {
      const res = checkout(metodePembayaran, metodePembayaran === 'TUNAI' ? nominalUang : totalBelanja);
      setIsProcessing(false);

      if (res.success && res.nota) {
        setActiveNota(res.nota);
        setUangDiterima('');
      } else {
        setErrorMessage(res.error || 'Gagal memproses transaksi.');
      }
    }, 400);
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-3 sm:pt-4 space-y-4 sm:space-y-6 overflow-x-clip">
      <HeroBanner
        badgeText="Sistem Point of Sale (POS) Modern"
        title="Kasir Penjualan"
        titleHighlight="Warung Sederhana"
        description="Pencarian instan produk, validasi ketersediaan stok real-time, kalkulasi kembalian otomatis bebas floating-point error, serta cetak struk nota belanja."
        stats={[
          { label: 'Item di Keranjang', value: `${cart.reduce((a, b) => a + b.qty, 0)} Pcs` },
          { label: 'Total Belanja', value: formatRupiah(totalBelanja) },
          { label: 'Kasir Bertugas', value: currentUser?.nama?.split(' ')[0] || 'Petugas', subtext: currentUser?.nama },
          { label: 'Metode Bayar', value: metodePembayaran },
        ]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        {/* SISI KIRI: Katalog Produk (8 Kolom) */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-5">
          {/* Barcode Scanner Box Ala Minimarket */}
          <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 dark:from-slate-900 dark:via-blue-950 dark:to-slate-900 rounded-3xl p-4 sm:p-5 text-white shadow-md border border-blue-600/30 dark:border-slate-800">
            <div className="flex items-center justify-between gap-2 mb-2.5">
              <div className="flex items-center space-x-2">
                <div className="p-1.5 rounded-lg bg-white/20 backdrop-blur-md">
                  <Barcode className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-bold tracking-tight">Scan / Input Cepat Barcode & SKU</h3>
                  <p className="text-[10px] text-blue-100 dark:text-slate-400">Arahkan scanner atau ketik kode barang lalu tekan Enter</p>
                </div>
              </div>
              <span className="hidden sm:inline-flex text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/15 border border-white/20 text-blue-100">
                Mode Kasir Cepat
              </span>
            </div>

            <form onSubmit={handleBarcodeSubmit} className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Barcode className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  ref={barcodeInputRef}
                  type="text"
                  placeholder="Scan barcode fisik / ketik kode (cth: 8991001001011)..."
                  value={barcodeInput}
                  onChange={(e) => setBarcodeInput(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 min-h-[44px] rounded-2xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm font-mono font-bold focus:outline-none focus:ring-2 focus:ring-amber-400 border border-transparent shadow-inner transition"
                />
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsCameraModalOpen(true)}
                  className="flex-1 sm:flex-initial px-3.5 py-2.5 min-h-[44px] rounded-2xl bg-white/20 hover:bg-white/30 active:scale-95 text-white font-bold text-xs sm:text-sm shadow-sm border border-white/25 backdrop-blur-md transition flex items-center justify-center space-x-1.5 touch-manipulation"
                  title="Scan Barcode / QR menggunakan Kamera HP atau Webcam"
                >
                  <Camera className="w-4 h-4 text-white" />
                  <span className="whitespace-nowrap">Scan Kamera</span>
                </button>
                <button
                  type="submit"
                  className="flex-1 sm:flex-initial px-4 py-2.5 min-h-[44px] rounded-2xl bg-amber-400 hover:bg-amber-300 active:scale-95 text-slate-900 font-extrabold text-xs sm:text-sm shadow-md transition flex items-center justify-center space-x-1.5 touch-manipulation"
                >
                  <Plus className="w-4 h-4" />
                  <span>Tambah</span>
                </button>
              </div>
            </form>

            {/* Scan Toast / Status Alert */}
            {scanMessage && (
              <div
                className={`mt-2.5 px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center space-x-2 transition animate-in fade-in duration-200 ${
                  scanMessage.type === 'success'
                    ? 'bg-emerald-500/20 border border-emerald-400/40 text-emerald-200'
                    : 'bg-rose-500/25 border border-rose-400/40 text-rose-200'
                }`}
              >
                {scanMessage.type === 'success' ? (
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-300" />
                ) : (
                  <AlertCircle className="w-3.5 h-3.5 shrink-0 text-rose-300" />
                )}
                <span className="truncate">{scanMessage.text}</span>
              </div>
            )}
          </div>

          {/* Bar Filter & Pencarian */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3 sm:space-y-4">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Cari nama produk atau ketik kode/SKU..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 min-h-[44px] rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-slate-900 transition"
              />
            </div>

            {/* Kategori Pills */}
            <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 scrollbar-none touch-pan-x">
              {kategoriList.map((kat) => (
                <button
                  key={kat}
                  onClick={() => setSelectedKategori(kat)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                    selectedKategori === kat
                      ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {kat}
                </button>
              ))}
            </div>
          </div>

          {/* Grid Produk Lengkap dengan Gambar Realistis */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {filteredProduk.length === 0 ? (
              <div className="col-span-full py-16 text-center bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-300 dark:border-slate-800">
                <Layers className="w-10 h-10 mx-auto text-slate-400 mb-2" />
                <p className="text-sm font-bold text-slate-700 dark:text-slate-300">Tidak ada produk ditemukan</p>
                <p className="text-xs text-slate-500 mt-1">Coba sesuaikan kata kunci pencarian atau kategori.</p>
              </div>
            ) : (
              filteredProduk.map((item) => {
                const itemInCart = cart.find((c) => c.produk.id === item.id);
                const isOutOfStock = item.stok <= 0;
                const isCartMax = itemInCart && itemInCart.qty >= item.stok;

                return (
                  <div
                    key={item.id}
                    onClick={() => {
                      if (!isOutOfStock && !isCartMax) {
                        addToCart(item);
                      }
                    }}
                    className={`group relative rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm transition-all duration-200 flex flex-col justify-between overflow-hidden ${
                      isOutOfStock
                        ? 'opacity-60 cursor-not-allowed bg-slate-100/50 dark:bg-slate-900/40'
                        : isCartMax
                        ? 'border-amber-400 dark:border-amber-500/50'
                        : 'hover:border-blue-500 hover:shadow-md cursor-pointer hover:-translate-y-0.5'
                    }`}
                  >
                    {/* Gambar Thumbnail Produk */}
                    <div className="relative w-full h-32 sm:h-36 bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <img
                        src={item.gambar || getCategoryFallbackImage(item.kategori || 'Sembako')}
                        alt={item.nama}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          const target = e.currentTarget;
                          target.onerror = null;
                          target.src = getCategoryFallbackImage(item.kategori || 'Sembako');
                        }}
                      />

                      {/* Badge SKU & Stok Floating */}
                      <div className="absolute top-2 left-2 right-2 flex items-center justify-between gap-1 pointer-events-none">
                        <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-lg bg-white/90 dark:bg-slate-900/90 text-blue-700 dark:text-blue-300 backdrop-blur-md shadow-xs whitespace-nowrap">
                          {item.kode}
                        </span>
                        <span
                          className={`text-[9px] font-bold px-2 py-0.5 rounded-md backdrop-blur-md shadow-xs whitespace-nowrap ${
                            item.stok > 10
                              ? 'bg-emerald-500/90 text-white'
                              : item.stok > 0
                              ? 'bg-amber-500/90 text-white'
                              : 'bg-rose-500/90 text-white'
                          }`}
                        >
                          {item.stok > 0 ? `${item.stok} ${item.satuan}` : 'Habis'}
                        </span>
                      </div>
                    </div>

                    {/* Informasi Produk */}
                    <div className="p-3.5 flex flex-col justify-between flex-1">
                      <div>
                        <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white line-clamp-2 leading-snug group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {item.nama}
                        </h3>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">{item.kategori}</p>
                      </div>

                      <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-1">
                        <span className="text-xs sm:text-sm font-extrabold text-blue-600 dark:text-blue-400 whitespace-nowrap">
                          {formatRupiah(item.harga_jual)}
                        </span>

                        {itemInCart ? (
                          <span className="text-[10px] font-bold text-blue-600 dark:text-blue-300 bg-blue-100 dark:bg-blue-900/60 px-2 py-0.5 rounded-full whitespace-nowrap">
                            {itemInCart.qty} dipilih
                          </span>
                        ) : (
                          <button
                            type="button"
                            disabled={isOutOfStock}
                            className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 group-hover:bg-blue-600 group-hover:text-white transition-colors shrink-0"
                            aria-label={`Tambah ${item.nama}`}
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* SISI KANAN: Keranjang & Checkout (5/4 Kolom) */}
        <div className="lg:col-span-5 xl:col-span-4 lg:sticky lg:top-24">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden flex flex-col">
            
            {/* Header Keranjang */}
            <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-800/40">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-sm shrink-0">
                  <ShoppingCart className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-extrabold text-slate-900 dark:text-white">Keranjang Belanja</h2>
                  <p className="text-[11px] text-slate-500 font-medium">{cart.length} jenis produk dipilih</p>
                </div>
              </div>

              {cart.length > 0 && (
                <button
                  onClick={clearCart}
                  className="text-xs font-semibold text-rose-500 hover:text-rose-700 flex items-center space-x-1 transition-colors px-2 py-1 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Kosongkan</span>
                </button>
              )}
            </div>

            {/* Daftar Item di Keranjang */}
            <div className="p-4 divide-y divide-slate-100 dark:divide-slate-800 max-h-[280px] overflow-y-auto">
              {cart.length === 0 ? (
                <div className="py-12 text-center text-slate-400">
                  <ShoppingCart className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  <p className="text-xs font-semibold">Keranjang masih kosong</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Pilih produk di sebelah kiri untuk menambah pesanan</p>
                </div>
              ) : (
                cart.map((item) => (
                  <div key={item.produk.id} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-2">
                    <div className="flex items-center space-x-2.5 flex-1 min-w-0 pr-1">
                      <img 
                        src={item.produk.gambar || getCategoryFallbackImage(item.produk.kategori || 'Sembako')} 
                        alt={item.produk.nama} 
                        className="w-10 h-10 rounded-xl object-cover border border-slate-200 dark:border-slate-800 shrink-0" 
                        onError={(e) => {
                          const target = e.currentTarget;
                          target.onerror = null;
                          target.src = getCategoryFallbackImage(item.produk.kategori || 'Sembako');
                        }}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-slate-900 dark:text-slate-100 leading-snug truncate">
                          {item.produk.nama}
                        </p>
                        <p className="text-[10px] text-slate-500">
                          {formatRupiah(item.produk.harga_jual)} / {item.produk.satuan}
                        </p>
                        <p className="text-xs font-bold text-blue-600 dark:text-blue-400 mt-0.5">
                          {formatRupiah(item.subtotal)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-1.5 shrink-0">
                      <button
                        onClick={() => updateCartQty(item.produk.id, item.qty - 1)}
                        className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-300 hover:bg-slate-200 transition-colors"
                        aria-label="Kurangi jumlah"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-6 text-center font-bold text-xs">{item.qty}</span>
                      <button
                        onClick={() => {
                          const ok = updateCartQty(item.produk.id, item.qty + 1);
                          if (!ok) {
                            alert(`Stok produk "${item.produk.nama}" hanya tersedia ${item.produk.stok} ${item.produk.satuan}`);
                          }
                        }}
                        className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-300 hover:bg-slate-200 transition-colors"
                        aria-label="Tambah jumlah"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => removeFromCart(item.produk.id)}
                        className="w-7 h-7 rounded-lg text-slate-400 hover:text-rose-500 flex items-center justify-center transition-colors"
                        aria-label="Hapus dari keranjang"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Error Message Box */}
            {errorMessage && (
              <div className="mx-4 mb-3 p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 flex items-center space-x-2 text-rose-700 dark:text-rose-400 text-xs font-medium">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Bagian Perhitungan & Pembayaran */}
            <div className="p-4 sm:p-5 bg-slate-50 dark:bg-slate-900/80 border-t border-slate-200 dark:border-slate-800 space-y-4">
              <div className="flex justify-between items-baseline">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Tagihan</span>
                <span className="text-xl font-extrabold text-slate-900 dark:text-white">
                  {formatRupiah(totalBelanja)}
                </span>
              </div>

              {/* Pilihan Metode Bayar Beragam Ala Minimarket */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">
                  Metode Pembayaran
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'TUNAI', label: 'Tunai', icon: Banknote },
                    { id: 'QRIS', label: 'QRIS', icon: QrCode },
                    { id: 'TRANSFER', label: 'Transfer', icon: Building },
                    { id: 'EWALLET', label: 'E-Wallet', icon: Smartphone },
                  ].map((m) => {
                    const Icon = m.icon;
                    const isSelected = metodePembayaran === m.id;
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => {
                          setMetodePembayaran(m.id as MetodePembayaran);
                          setErrorMessage(null);
                        }}
                        className={`py-2.5 px-2 min-h-[44px] rounded-xl border text-[11px] font-bold flex flex-col items-center justify-center space-y-1 transition active:scale-95 touch-manipulation ${
                          isSelected
                            ? 'bg-blue-600 text-white border-blue-600 shadow-sm shadow-blue-500/25 ring-2 ring-blue-500/30'
                            : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                        }`}
                      >
                        <Icon className="w-4 h-4 shrink-0" />
                        <span className="truncate w-full text-center">{m.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Form Input Sesuai Metode Pembayaran */}
              {metodePembayaran === 'TUNAI' ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                      Uang Diterima
                    </label>
                    <button
                      type="button"
                      onClick={setExactMoney}
                      className="text-[10px] font-bold text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      Uang Pas
                    </button>
                  </div>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                      Rp
                    </span>
                    <input
                      type="number"
                      placeholder="Contoh: 50000"
                      value={uangDiterima}
                      onChange={(e) => {
                        const val = e.target.value === '' ? '' : Math.max(0, parseInt(e.target.value) || 0);
                        setUangDiterima(val);
                        setErrorMessage(null);
                      }}
                      className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono text-sm font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>

                  {/* Nominal Cepat */}
                  <div className="grid grid-cols-4 gap-1.5 pt-1">
                    {[10000, 20000, 50000, 100000].map((amt) => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => setQuickNominal(amt)}
                        className="py-2 px-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-[10px] sm:text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 active:scale-95 transition-all text-center min-h-[38px] flex items-center justify-center touch-manipulation"
                      >
                        {formatRupiah(amt)}
                      </button>
                    ))}
                  </div>

                  {/* Kalkulasi Kembalian atau Status Kurang */}
                  <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center text-xs">
                    <span className="font-semibold text-slate-600 dark:text-slate-400">
                      {isUangKurang ? 'Kurang Bayar:' : 'Kembalian:'}
                    </span>
                    <span
                      className={`font-mono font-extrabold text-sm ${
                        isUangKurang ? 'text-rose-600' : 'text-emerald-600 dark:text-emerald-400'
                      }`}
                    >
                      {isUangKurang ? `-${formatRupiah(nominalKekurangan)}` : formatRupiah(kembalian)}
                    </span>
                  </div>
                </div>
              ) : metodePembayaran === 'QRIS' ? (
                <div className="p-3 bg-blue-50/70 dark:bg-blue-950/40 rounded-xl border border-blue-200/60 dark:border-blue-900/60 text-[11px] text-blue-700 dark:text-blue-300 space-y-1.5">
                  <div className="flex items-center space-x-1.5 font-bold">
                    <QrCode className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <span>Pembayaran QRIS Statis / Dinamis</span>
                  </div>
                  <p className="text-[10px] text-slate-600 dark:text-slate-300 leading-relaxed">
                    Arahkan pelanggan scan kode QRIS warung senilai <strong>{formatRupiah(totalBelanja)}</strong>. Pastikan notifikasi dana masuk telah terverifikasi.
                  </p>
                </div>
              ) : metodePembayaran === 'TRANSFER' ? (
                <div className="p-3 bg-indigo-50/70 dark:bg-indigo-950/40 rounded-xl border border-indigo-200/60 dark:border-indigo-900/60 text-[11px] text-indigo-700 dark:text-indigo-300 space-y-1.5">
                  <div className="flex items-center space-x-1.5 font-bold">
                    <Building className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    <span>Transfer Rekening Bank</span>
                  </div>
                  <p className="text-[10px] text-slate-600 dark:text-slate-300 leading-relaxed">
                    BCA / Mandiri / BRI senilai <strong>{formatRupiah(totalBelanja)}</strong>. Cek mutasi rekening kasir sebelum konfirmasi nota.
                  </p>
                </div>
              ) : (
                <div className="p-3 bg-emerald-50/70 dark:bg-emerald-950/40 rounded-xl border border-emerald-200/60 dark:border-emerald-900/60 text-[11px] text-emerald-700 dark:text-emerald-300 space-y-1.5">
                  <div className="flex items-center space-x-1.5 font-bold">
                    <Smartphone className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span>Dompet Digital (Dana / OVO / GoPay / ShopeePay)</span>
                  </div>
                  <p className="text-[10px] text-slate-600 dark:text-slate-300 leading-relaxed">
                    Tagihan pas <strong>{formatRupiah(totalBelanja)}</strong> langsung terverifikasi tanpa kembalian tunai.
                  </p>
                </div>
              )}

              {/* Tombol Eksekusi Checkout */}
              <button
                type="button"
                disabled={cart.length === 0 || isProcessing || isUangKurang}
                onClick={handleCheckout}
                className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold text-sm shadow-lg shadow-blue-500/25 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {isProcessing ? (
                  <span>Menyimpan Transaksi & Mutasi...</span>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>Selesaikan Transaksi & Cetak Struk</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Cetak Struk */}
      <ReceiptModal transaksi={activeNota} onClose={() => setActiveNota(null)} />

      {/* Modal Pemindai Kamera Barcode & QR */}
      <BarcodeScannerModal
        isOpen={isCameraModalOpen}
        onClose={() => setIsCameraModalOpen(false)}
        onScanSuccess={handleCameraScanSuccess}
      />
    </div>
  );
};
