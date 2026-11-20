import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Produk, Transaksi, MutasiStok, CartItem, MetodePembayaran } from '../types';
import { SEED_USERS, SEED_PRODUK, SEED_TRANSAKSI, SEED_MUTASI } from '../data/seedData';
import { getCategoryFallbackImage } from '../data/productAssets';

interface AppContextType {
  // Auth state
  currentUser: User | null;
  login: (email: string, password?: string) => boolean;
  register: (user: Omit<User, 'id' | 'dibuat_pada' | 'aktif'>) => { success: boolean; error?: string };
  logout: () => void;

  // Dark mode
  isDarkMode: boolean;
  toggleDarkMode: () => void;

  // Active navigation
  currentPage: string;
  setCurrentPage: (page: string) => void;

  // Data lists
  users: User[];
  produks: Produk[];
  transaksis: Transaksi[];
  mutasiStoks: MutasiStok[];

  // Cart state (Kasir)
  cart: CartItem[];
  addToCart: (produk: Produk) => boolean;
  updateCartQty: (produkId: string, qty: number) => boolean;
  removeFromCart: (produkId: string) => void;
  clearCart: () => void;
  checkout: (metode: MetodePembayaran, uangDiterima: number) => { success: boolean; nota?: Transaksi; error?: string };

  // Product management (Admin)
  tambahProduk: (produk: Omit<Produk, 'id'>) => { success: boolean; error?: string };
  updateProduk: (id: string, data: Partial<Produk>) => { success: boolean; error?: string };
  toggleStatusProduk: (id: string) => void;

  // Stock Opname / Penyesuaian (Admin)
  sesuaikanStok: (idProduk: string, stokBaru: number, alasan: string) => { success: boolean; error?: string };

  // User management (Admin)
  tambahUser: (user: Omit<User, 'id' | 'dibuat_pada'>) => { success: boolean; error?: string };
  toggleStatusUser: (id: string) => void;

  // Transaction Actions (Admin)
  batalkanTransaksi: (idTransaksi: string, alasan: string) => { success: boolean; error?: string };

  // Helper utils
  formatRupiah: (amount: number) => string;
  resetAllDataToSeed: () => void;
  getProductImage: (produk: { gambar?: string; kategori?: string; nama?: string }) => string;
}

const STORAGE_KEY_PREFIX = 'kasir_warung_2026_';

const AppContext = createContext<AppContextType | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Theme state
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}theme`);
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Navigation
  const [currentPage, setCurrentPage] = useState<string>('login');

  // Auth: DEFAULT AWALNYA WAJIB SIGN IN (null jika belum login tersimpan)
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}auth_user`);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return null;
  });

  // Users: Migrasi data users lama di localStorage agar terupdate ke nama anggota kelompok & email baru
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}users`);
    if (saved) {
      try {
        const parsed: any[] = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((u) => {
            // Pemetaan update akun default lama (Budi Santoso, Siti Rahma, Ahmad Fauzi)
            if (u.id === 'usr_admin' || u.username === 'admin' || u.nama?.includes('Budi Santoso')) {
              return {
                ...u,
                id: 'usr_admin',
                email: 'daffa@warungberkah.com',
                username: 'daffa',
                nama: 'Daffa (Pemilik)',
                role: 'ADMIN' as const,
                aktif: true,
              };
            }
            if (u.id === 'usr_kasir1' || u.username === 'kasir1' || u.nama?.includes('Siti Rahma')) {
              return {
                ...u,
                id: 'usr_kasir1',
                email: 'saepul@warungberkah.com',
                username: 'saepul',
                nama: 'Saepul Iman (Kasir 1)',
                role: 'KASIR' as const,
                aktif: true,
              };
            }
            if (u.id === 'usr_kasir2' || u.username === 'kasir2' || u.nama?.includes('Ahmad Fauzi')) {
              return {
                ...u,
                id: 'usr_kasir2',
                email: 'nauval@warungberkah.com',
                username: 'nauval',
                nama: 'Nauval Aditya Sumarna (Kasir 2)',
                role: 'KASIR' as const,
                aktif: true,
              };
            }

            // Untuk akun baru yang dibuat pengguna lain, pertahankan data dan pastikan format email
            let email = u.email;
            if (!email) {
              if (u.username) {
                email = `${u.username.toLowerCase()}@warungberkah.com`;
              } else {
                email = `user_${u.id}@warungberkah.com`;
              }
            }
            return {
              ...u,
              email: email.trim().toLowerCase(),
            } as User;
          });
        }
      } catch (e) {
        console.error(e);
      }
    }
    return SEED_USERS;
  });

  // Produk: Sinkronkan gambar 100% valid dari SEED_PRODUK (jika gambar kosong atau masih pakai URL eksternal lama)
  const [produks, setProduks] = useState<Produk[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}produks`);
    if (saved) {
      try { 
        const parsed: Produk[] = JSON.parse(saved);
        if (parsed && parsed.length > 0) {
          return parsed.map(p => {
            const seedMatch = SEED_PRODUK.find(sp => sp.kode === p.kode);
            // Sinkronkan barcode dan gambar jika sebelumnya belum ada
            const barcode = p.barcode || seedMatch?.barcode || p.kode;
            let gambar = p.gambar;
            if (!gambar || gambar.includes('unsplash.com') || (seedMatch && seedMatch.gambar)) {
              gambar = seedMatch?.gambar || getCategoryFallbackImage(p.kategori || '');
            }
            return {
              ...p,
              barcode,
              gambar,
            };
          });
        }
      } catch (e) { 
        console.error(e); 
      }
    }
    return SEED_PRODUK;
  });

  // Transaksi
  const [transaksis, setTransaksis] = useState<Transaksi[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}transaksis`);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return SEED_TRANSAKSI;
  });

  // Mutasi Stok
  const [mutasiStoks, setMutasiStoks] = useState<MutasiStok[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}mutasi`);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return SEED_MUTASI;
  });

  // Kasir Cart
  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}cart`);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return [];
  });

  // Effect to apply dark class to HTML
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem(`${STORAGE_KEY_PREFIX}theme`, 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem(`${STORAGE_KEY_PREFIX}theme`, 'light');
    }
  }, [isDarkMode]);

  // Persist storage whenever lists change
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}users`, JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}produks`, JSON.stringify(produks));
  }, [produks]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}transaksis`, JSON.stringify(transaksis));
  }, [transaksis]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}mutasi`, JSON.stringify(mutasiStoks));
  }, [mutasiStoks]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}cart`, JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(`${STORAGE_KEY_PREFIX}auth_user`, JSON.stringify(currentUser));
    } else {
      localStorage.removeItem(`${STORAGE_KEY_PREFIX}auth_user`);
    }
  }, [currentUser]);

  const toggleDarkMode = () => setIsDarkMode(prev => !prev);

  const formatRupiah = (amount: number): string => {
    return 'Rp' + Math.round(amount).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  const getProductImage = (produk: { gambar?: string; kategori?: string; nama?: string }): string => {
    if (produk.gambar && !produk.gambar.includes('unsplash.com')) {
      return produk.gambar;
    }
    return getCategoryFallbackImage(produk.kategori || 'Sembako');
  };

  // Auth actions
  const login = (emailOrUsername: string, password?: string): boolean => {
    const cleanInput = emailOrUsername.trim().toLowerCase();
    const found = users.find(u => 
      (u.email && u.email.toLowerCase() === cleanInput) ||
      (u.username && u.username.toLowerCase() === cleanInput)
    );
    if (!found) return false;
    if (!found.aktif) return false;
    if (password && found.password && found.password !== password) return false;

    setCurrentUser(found);
    if (found.role === 'ADMIN') {
      setCurrentPage('dashboard');
    } else {
      setCurrentPage('kasir');
    }
    return true;
  };

  const register = (userData: Omit<User, 'id' | 'dibuat_pada' | 'aktif'>): { success: boolean; error?: string } => {
    const cleanEmail = (userData.email || '').trim().toLowerCase();
    
    // Validasi format email dasar
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!cleanEmail || !emailRegex.test(cleanEmail)) {
      return { success: false, error: 'Format email tidak valid. Gunakan format seperti nama@warung.com' };
    }

    const existing = users.find(u => u.email.toLowerCase() === cleanEmail);
    if (existing) {
      return { success: false, error: `Email "${cleanEmail}" sudah terdaftar.` };
    }

    const usernameFallback = cleanEmail.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '');

    const newUser: User = {
      ...userData,
      id: 'usr_' + Date.now(),
      email: cleanEmail,
      username: userData.username || usernameFallback,
      aktif: true,
      dibuat_pada: new Date().toISOString(),
    };

    setUsers(prev => [...prev, newUser]);
    setCurrentUser(newUser);

    if (newUser.role === 'ADMIN') {
      setCurrentPage('dashboard');
    } else {
      setCurrentPage('kasir');
    }
    return { success: true };
  };

  const logout = () => {
    setCurrentUser(null);
    setCurrentPage('login');
  };

  // Cart operations
  const addToCart = (produk: Produk): boolean => {
    const existing = cart.find(item => item.produk.id === produk.id);
    const currentQty = existing ? existing.qty : 0;

    const freshProduk = produks.find(p => p.id === produk.id);
    if (!freshProduk || !freshProduk.aktif) return false;

    if (currentQty + 1 > freshProduk.stok) {
      return false;
    }

    if (existing) {
      setCart(cart.map(item =>
        item.produk.id === produk.id
          ? {
              ...item,
              qty: item.qty + 1,
              subtotal: (item.qty + 1) * item.produk.harga_jual,
            }
          : item
      ));
    } else {
      setCart([...cart, { produk, qty: 1, subtotal: produk.harga_jual }]);
    }
    return true;
  };

  const updateCartQty = (produkId: string, qty: number): boolean => {
    if (qty <= 0) {
      removeFromCart(produkId);
      return true;
    }
    const freshProduk = produks.find(p => p.id === produkId);
    if (!freshProduk) return false;

    if (qty > freshProduk.stok) {
      return false;
    }

    setCart(cart.map(item =>
      item.produk.id === produkId
        ? { ...item, qty, subtotal: qty * item.produk.harga_jual }
        : item
    ));
    return true;
  };

  const removeFromCart = (produkId: string) => {
    setCart(cart.filter(item => item.produk.id !== produkId));
  };

  const clearCart = () => setCart([]);

  // Checkout Transaksi
  const checkout = (metode: MetodePembayaran, uangDiterima: number): { success: boolean; nota?: Transaksi; error?: string } => {
    if (!currentUser) return { success: false, error: 'Silakan login terlebih dahulu.' };
    if (cart.length === 0) return { success: false, error: 'Keranjang belanja masih kosong.' };

    for (const item of cart) {
      const liveItem = produks.find(p => p.id === item.produk.id);
      if (!liveItem) {
        return { success: false, error: `Produk ${item.produk.nama} tidak ditemukan.` };
      }
      if (!liveItem.aktif) {
        return { success: false, error: `Produk ${item.produk.nama} sedang dinonaktifkan.` };
      }
      if (item.qty > liveItem.stok) {
        return {
          success: false,
          error: `Stok tidak mencukupi untuk "${item.produk.nama}". Tersisa: ${liveItem.stok} ${liveItem.satuan}.`,
        };
      }
    }

    const total = cart.reduce((sum, item) => sum + item.subtotal, 0);

    let kembalian = 0;
    if (metode === 'TUNAI') {
      if (uangDiterima < total) {
        const kekurangan = total - uangDiterima;
        return {
          success: false,
          error: `Uang tunai kurang ${formatRupiah(kekurangan)}. Total belanja ${formatRupiah(total)}.`,
        };
      }
      kembalian = uangDiterima - total;
    } else {
      uangDiterima = total;
      kembalian = 0;
    }

    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const nomorNota = `TRX-${dateStr}-${randomSuffix}`;
    const newTxId = 'trx_' + Date.now();

    const detailItems = cart.map(item => ({
      id: 'det_' + Math.random().toString(36).substring(2, 9),
      id_transaksi: newTxId,
      id_produk: item.produk.id,
      kode_produk: item.produk.kode,
      nama_produk: item.produk.nama,
      harga_saat_jual: item.produk.harga_jual,
      qty: item.qty,
      subtotal: item.subtotal,
      satuan: item.produk.satuan,
    }));

    const newTransaksi: Transaksi = {
      id: newTxId,
      nomor_nota: nomorNota,
      waktu: now.toISOString(),
      id_kasir: currentUser.id,
      nama_kasir: currentUser.nama,
      items: detailItems,
      total,
      metode_pembayaran: metode,
      uang_diterima: uangDiterima,
      kembalian,
      status: 'SELESAI',
    };

    const updatedProduks = [...produks];
    const newMutasis: MutasiStok[] = [];

    detailItems.forEach(item => {
      const idx = updatedProduks.findIndex(p => p.id === item.id_produk);
      if (idx !== -1) {
        const prevStok = updatedProduks[idx].stok;
        const nextStok = prevStok - item.qty;
        updatedProduks[idx] = {
          ...updatedProduks[idx],
          stok: nextStok,
        };

        newMutasis.push({
          id: 'mut_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
          id_produk: item.id_produk,
          kode_produk: item.kode_produk,
          nama_produk: item.nama_produk,
          jenis: 'KELUAR',
          jumlah: item.qty,
          stok_sebelum: prevStok,
          stok_sesudah: nextStok,
          alasan: `Penjualan Kasir (${nomorNota})`,
          pelaku: currentUser.email || currentUser.nama || 'Kasir',
          waktu: now.toISOString(),
        });
      }
    });

    setProduks(updatedProduks);
    setMutasiStoks(prev => [...newMutasis, ...prev]);
    setTransaksis(prev => [newTransaksi, ...prev]);
    clearCart();

    return { success: true, nota: newTransaksi };
  };

  // Admin Produk Management
  const tambahProduk = (produkData: Omit<Produk, 'id'>): { success: boolean; error?: string } => {
    const existing = produks.find(p => p.kode.trim().toUpperCase() === produkData.kode.trim().toUpperCase());
    if (existing) {
      return { success: false, error: `Kode/SKU "${produkData.kode}" sudah digunakan oleh produk lain!` };
    }

    const newId = 'prod_' + Date.now();
    const newProduk: Produk = {
      ...produkData,
      id: newId,
      kode: produkData.kode.trim().toUpperCase(),
      barcode: (produkData.barcode || produkData.kode).trim(),
      harga_jual: Math.round(Number(produkData.harga_jual) || 0),
      stok: Math.round(Number(produkData.stok) || 0),
      gambar: produkData.gambar || getCategoryFallbackImage(produkData.kategori || 'Sembako'),
    };

    setProduks(prev => [newProduk, ...prev]);

    if (newProduk.stok > 0 && currentUser) {
      const newMutasi: MutasiStok = {
        id: 'mut_' + Date.now(),
        id_produk: newId,
        kode_produk: newProduk.kode,
        nama_produk: newProduk.nama,
        jenis: 'MASUK',
        jumlah: newProduk.stok,
        stok_sebelum: 0,
        stok_sesudah: newProduk.stok,
        alasan: 'Input produk baru',
        pelaku: currentUser.email || currentUser.nama || 'Kasir',
        waktu: new Date().toISOString(),
      };
      setMutasiStoks(prev => [newMutasi, ...prev]);
    }

    return { success: true };
  };

  const updateProduk = (id: string, data: Partial<Produk>): { success: boolean; error?: string } => {
    if (data.kode) {
      const codeUpper = data.kode.trim().toUpperCase();
      const existing = produks.find(p => p.kode.toUpperCase() === codeUpper && p.id !== id);
      if (existing) {
        return { success: false, error: `Kode/SKU "${data.kode}" sudah dipakai produk lain.` };
      }
      data.kode = codeUpper;
    }

    setProduks(prev =>
      prev.map(p => (p.id === id ? { ...p, ...data } : p))
    );
    return { success: true };
  };

  const toggleStatusProduk = (id: string) => {
    setProduks(prev =>
      prev.map(p => (p.id === id ? { ...p, aktif: !p.aktif } : p))
    );
  };

  // Stok Opname
  const sesuaikanStok = (idProduk: string, stokBaru: number, alasan: string): { success: boolean; error?: string } => {
    if (!currentUser) return { success: false, error: 'Silakan login terlebih dahulu' };
    const p = produks.find(x => x.id === idProduk);
    if (!p) return { success: false, error: 'Produk tidak ditemukan' };

    const stokLama = p.stok;
    const diff = stokBaru - stokLama;

    if (diff === 0) {
      return { success: false, error: 'Stok baru sama dengan stok saat ini' };
    }

    const mutasi: MutasiStok = {
      id: 'mut_' + Date.now(),
      id_produk: p.id,
      kode_produk: p.kode,
      nama_produk: p.nama,
      jenis: 'PENYESUAIAN',
      jumlah: Math.abs(diff),
      stok_sebelum: stokLama,
      stok_sesudah: stokBaru,
      alasan: alasan.trim() || 'Penyesuaian stok opname manual',
      pelaku: currentUser.email || currentUser.nama || 'Kasir',
      waktu: new Date().toISOString(),
    };

    setProduks(prev =>
      prev.map(item => (item.id === idProduk ? { ...item, stok: stokBaru } : item))
    );
    setMutasiStoks(prev => [mutasi, ...prev]);

    return { success: true };
  };

  // User Management
  const tambahUser = (userData: Omit<User, 'id' | 'dibuat_pada'>): { success: boolean; error?: string } => {
    const cleanEmail = (userData.email || '').trim().toLowerCase();
    
    // Validasi format email dasar
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!cleanEmail || !emailRegex.test(cleanEmail)) {
      return { success: false, error: 'Format email tidak valid. Gunakan format seperti nama@warung.com' };
    }

    const existing = users.find(u => u.email.toLowerCase() === cleanEmail);
    if (existing) {
      return { success: false, error: `Email "${cleanEmail}" sudah digunakan!` };
    }

    const usernameFallback = cleanEmail.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '');

    const newUser: User = {
      ...userData,
      id: 'usr_' + Date.now(),
      email: cleanEmail,
      username: userData.username || usernameFallback,
      dibuat_pada: new Date().toISOString(),
    };

    setUsers(prev => [...prev, newUser]);
    return { success: true };
  };

  const toggleStatusUser = (id: string) => {
    if (currentUser?.id === id) {
      alert('Anda tidak dapat menonaktifkan akun yang sedang aktif digunakan.');
      return;
    }
    setUsers(prev =>
      prev.map(u => (u.id === id ? { ...u, aktif: !u.aktif } : u))
    );
  };

  // Transaksi Pembatalan (Restock)
  const batalkanTransaksi = (idTransaksi: string, alasan: string): { success: boolean; error?: string } => {
    if (!currentUser) return { success: false, error: 'Silakan login' };
    const tx = transaksis.find(t => t.id === idTransaksi);
    if (!tx) return { success: false, error: 'Transaksi tidak ditemukan' };
    if (tx.status === 'DIBATALKAN') return { success: false, error: 'Transaksi ini sudah dibatalkan sebelumnya.' };

    const now = new Date().toISOString();
    const updatedProduks = [...produks];
    const newMutasis: MutasiStok[] = [];

    tx.items.forEach(item => {
      const idx = updatedProduks.findIndex(p => p.id === item.id_produk);
      if (idx !== -1) {
        const prevStok = updatedProduks[idx].stok;
        const nextStok = prevStok + item.qty;
        updatedProduks[idx] = {
          ...updatedProduks[idx],
          stok: nextStok,
        };

        newMutasis.push({
          id: 'mut_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
          id_produk: item.id_produk,
          kode_produk: item.kode_produk,
          nama_produk: item.nama_produk,
          jenis: 'BATAL_TRANSAKSI',
          jumlah: item.qty,
          stok_sebelum: prevStok,
          stok_sesudah: nextStok,
          alasan: `Batal Transaksi ${tx.nomor_nota}: ${alasan}`,
          pelaku: currentUser.email || currentUser.nama || 'Kasir',
          waktu: now,
        });
      }
    });

    setProduks(updatedProduks);
    setMutasiStoks(prev => [...newMutasis, ...prev]);

    setTransaksis(prev =>
      prev.map(t =>
        t.id === idTransaksi
          ? {
              ...t,
              status: 'DIBATALKAN',
              catatan_batal: alasan,
              waktu_batal: now,
              pelaku_batal: currentUser.email || currentUser.nama || 'Kasir',
            }
          : t
      )
    );

    return { success: true };
  };

  const resetAllDataToSeed = () => {
    localStorage.removeItem(`${STORAGE_KEY_PREFIX}users`);
    localStorage.removeItem(`${STORAGE_KEY_PREFIX}produks`);
    localStorage.removeItem(`${STORAGE_KEY_PREFIX}transaksis`);
    localStorage.removeItem(`${STORAGE_KEY_PREFIX}mutasi`);
    localStorage.removeItem(`${STORAGE_KEY_PREFIX}cart`);

    setUsers(SEED_USERS);
    setProduks(SEED_PRODUK);
    setTransaksis(SEED_TRANSAKSI);
    setMutasiStoks(SEED_MUTASI);
    setCart([]);
    setCurrentUser(null);
    setCurrentPage('login');
    alert('Data sistem berhasil di-reset kembali ke data bawaan (Seed Data). Silakan masuk.');
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        login,
        register,
        logout,
        isDarkMode,
        toggleDarkMode,
        currentPage,
        setCurrentPage,
        users,
        produks,
        transaksis,
        mutasiStoks,
        cart,
        addToCart,
        updateCartQty,
        removeFromCart,
        clearCart,
        checkout,
        tambahProduk,
        updateProduk,
        toggleStatusProduk,
        sesuaikanStok,
        tambahUser,
        toggleStatusUser,
        batalkanTransaksi,
        formatRupiah,
        resetAllDataToSeed,
        getProductImage,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
