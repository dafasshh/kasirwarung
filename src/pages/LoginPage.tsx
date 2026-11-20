import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../store/store';
import { 
  Lock, 
  Mail, 
  AlertCircle, 
  ShieldCheck, 
  Store, 
  Sun, 
  Moon, 
  Info, 
  ArrowRight,
  UserPlus,
  CheckCircle2,
  Receipt,
  Layers,
  Sparkles,
  User,
  Eye,
  EyeOff,
  LogIn,
  KeyRound,
  X
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login, register, users, isDarkMode, toggleDarkMode } = useApp();
  
  // State Mode: 'signin' atau 'signup'
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');

  // Form Fields berbasis EMAIL
  const [email, setEmail] = useState('daffa@warungberkah.com');
  const [password, setPassword] = useState('admin123');
  const [namaLengkap, setNamaLengkap] = useState('');

  // Password Visibility Toggle State
  const [showPassword, setShowPassword] = useState(false);
  
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Stealth info dropdown state untuk audit pengujian
  const [showStealthInfo, setShowStealthInfo] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  // Efek klik di luar dropdown atau tekan tombol Escape untuk menutup dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowStealthInfo(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowStealthInfo(false);
      }
    };

    if (showStealthInfo) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [showStealthInfo]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsLoading(true);

    setTimeout(() => {
      const cleanEmail = email.trim().toLowerCase();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!cleanEmail || !emailRegex.test(cleanEmail)) {
        setIsLoading(false);
        setError('Format email tidak valid. Masukkan email yang benar (contoh: kasir@warung.id).');
        return;
      }

      if (authMode === 'signin') {
        const ok = login(cleanEmail, password);
        setIsLoading(false);
        if (!ok) {
          setError('Email atau kata sandi tidak valid atau akun dinonaktifkan.');
        }
      } else {
        // Sign Up Kasir Baru
        if (!namaLengkap.trim()) {
          setIsLoading(false);
          setError('Harap masukkan nama lengkap Anda.');
          return;
        }
        const res = register({
          email: cleanEmail,
          password: password.trim(),
          nama: namaLengkap.trim(),
          role: 'KASIR',
        });
        setIsLoading(false);
        if (!res.success) {
          setError(res.error || 'Pendaftaran akun gagal.');
        } else {
          setSuccess('Akun berhasil didaftarkan. Mengalihkan ke kasir...');
        }
      }
    }, 350);
  };

  const handleSelectDemoAccount = (emailVal: string, p?: string, autoLogin: boolean = false) => {
    setEmail(emailVal);
    setPassword(p || '');
    setAuthMode('signin');
    setShowStealthInfo(false);
    setError(null);

    if (autoLogin && p) {
      setIsLoading(true);
      setTimeout(() => {
        const ok = login(emailVal.trim().toLowerCase(), p);
        setIsLoading(false);
        if (!ok) {
          setError('Email atau kata sandi tidak valid atau akun dinonaktifkan.');
        }
      }, 250);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors">
      
      {/* SISI KIRI: SPLIT-SCREEN BANNER SAAS BIRU HARMONIS DENGAN SPACING LEGA */}
      <div className="relative lg:w-1/2 p-8 sm:p-10 lg:p-14 flex flex-col justify-between overflow-hidden bg-gradient-to-br from-blue-700 via-blue-800 to-indigo-900 dark:from-blue-950 dark:via-slate-900 dark:to-slate-950 text-white border-b lg:border-b-0 lg:border-r border-blue-600/30 dark:border-slate-800/80 transition-colors">
        {/* Glow Halus Adaptif */}
        <div className="absolute top-0 left-0 w-[500px] h-[300px] bg-sky-400/20 dark:bg-blue-500/20 blur-[100px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-indigo-400/20 dark:bg-indigo-500/20 blur-[100px] rounded-full pointer-events-none" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0c_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0c_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

        {/* 1. Header Logo & Nama Toko dengan Margin Bawah Tegas */}
        <div className="relative z-10 mb-8 sm:mb-10 lg:mb-12">
          <div className="flex items-center space-x-3.5">
            <div className="w-11 h-11 rounded-2xl bg-white/15 dark:bg-blue-600/30 backdrop-blur-md border border-white/20 flex items-center justify-center text-white shadow-md shrink-0">
              <Store className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="font-extrabold text-xl tracking-tight text-white block">
                Kasir Warung
              </span>
              <span className="block text-xs font-medium text-blue-100 dark:text-blue-300/80">
                Warung Berkah Sederhana
              </span>
            </div>
          </div>
        </div>

        {/* 2. Hero Body: Badge, Judul Utama, Deskripsi & Kartu Fitur */}
        <div className="relative z-10 my-auto max-w-lg">
          {/* Badge Kapsul dengan Pemisah Bawah Jelas */}
          <div className="mb-6">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-white/15 dark:bg-blue-500/20 border border-white/25 dark:border-blue-400/30 text-white dark:text-blue-200 text-xs font-semibold backdrop-blur-md shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-blue-200 dark:text-blue-400 shrink-0" />
              <span>Sistem Operasional Kasir & Inventaris Toko</span>
            </div>
          </div>

          {/* Judul Utama dengan Leading Proporsional & Margin Bawah */}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight lg:leading-[1.18] mb-5">
            Pengelolaan Warung Lebih{' '}
            <span className="bg-gradient-to-r from-sky-200 via-blue-100 to-white dark:from-blue-400 dark:via-sky-300 dark:to-indigo-300 bg-clip-text text-transparent">
              Cepat, Akurat & Modern
            </span>
          </h1>

          {/* Paragraf Deskripsi */}
          <p className="text-sm sm:text-base text-blue-100 dark:text-slate-300 leading-relaxed font-normal mb-8">
            Catat penjualan tunai maupun non-tunai, kelola ketersediaan produk sembako, dan cetak struk nota belanja pelanggan secara instan.
          </p>

          {/* Dua Kartu Fitur Berjarak Lega */}
          <div className="grid grid-cols-2 gap-4 sm:gap-5">
            <div className="p-4 sm:p-5 rounded-2xl bg-white/10 dark:bg-white/5 border border-white/15 dark:border-white/10 backdrop-blur-md flex flex-col justify-between">
              <div className="flex items-center space-x-2 text-white dark:text-blue-300 mb-2">
                <Layers className="w-4 h-4 shrink-0" />
                <p className="text-xs font-bold uppercase tracking-wider">Stok Real-Time</p>
              </div>
              <p className="text-xs text-blue-100 dark:text-slate-300 leading-relaxed">
                Pengurangan stok barang otomatis saat nota kasir selesai.
              </p>
            </div>
            <div className="p-4 sm:p-5 rounded-2xl bg-white/10 dark:bg-white/5 border border-white/15 dark:border-white/10 backdrop-blur-md flex flex-col justify-between">
              <div className="flex items-center space-x-2 text-white dark:text-blue-300 mb-2">
                <Receipt className="w-4 h-4 shrink-0" />
                <p className="text-xs font-bold uppercase tracking-wider">Hitung Kembalian</p>
              </div>
              <p className="text-xs text-blue-100 dark:text-slate-300 leading-relaxed">
                Perhitungan uang belanja dan kembalian tunai presisi.
              </p>
            </div>
          </div>
        </div>

        {/* 3. Footer Info Kiri dengan Jarak Atas */}
        <div className="relative z-10 text-xs text-blue-200 dark:text-slate-400 flex items-center justify-between pt-8 sm:pt-10">
          <span>&copy; 2026 Warung Berkah Sederhana</span>
          <span>Sistem Point of Sale</span>
        </div>
      </div>

      {/* SISI KANAN: FORM AUTENTIKASI MINIMALIS DENGAN SPACING LEGA */}
      <div className="lg:w-1/2 p-8 sm:p-12 lg:p-16 flex flex-col justify-between relative bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800/80 transition-colors">
        
        {/* Kontrol Pojok Kanan Atas: Toggle Tema & Stealth Info Akun */}
        <div className="w-full flex items-center justify-end space-x-2 pb-4">
          {/* Tombol Tema Gelap / Terang Rapi */}
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/70 transition-colors shadow-2xs"
            title={isDarkMode ? 'Beralih ke Light Mode' : 'Beralih ke Dark Mode'}
            aria-label="Toggle Mode Gelap/Terang"
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
          </button>

          {/* Tombol Stealth Info Akun Tersimpan */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowStealthInfo(!showStealthInfo)}
              className={`p-2 rounded-xl transition-all shadow-2xs border ${
                showStealthInfo
                  ? 'bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 border-blue-300 dark:border-blue-700'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-700/70'
              }`}
              title="Kredensial Akun Tersimpan (Klik untuk lihat/isi otomatis)"
              aria-label="Kredensial Akun"
            >
              <Info className="w-4 h-4" />
            </button>

            {/* Stealth Dropdown */}
            {showStealthInfo && (
              <div className="absolute right-0 mt-2 w-80 sm:w-88 p-4 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 z-50 text-xs space-y-3 animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center space-x-1.5 font-bold text-slate-800 dark:text-slate-100">
                    <KeyRound className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <span>Akun Tersimpan di Sistem</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                      {users.length} akun
                    </span>
                    <button
                      onClick={() => setShowStealthInfo(false)}
                      className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
                      aria-label="Tutup Dropdown"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {users.map((u) => {
                    const accEmail = u.email || `${u.username || 'kasir'}@warungberkah.com`;
                    return (
                      <div
                        key={u.id}
                        className="p-2.5 rounded-xl bg-slate-50/70 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800/80 hover:border-blue-400 dark:hover:border-blue-600 transition flex flex-col space-y-2"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <p className="font-bold text-slate-900 dark:text-white truncate">
                              {u.nama}
                            </p>
                            <p className="text-[11px] text-blue-600 dark:text-blue-400 font-mono truncate">
                              {accEmail}
                            </p>
                          </div>
                          <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full shrink-0 ${
                            u.role === 'ADMIN'
                              ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 border border-indigo-200/50 dark:border-indigo-800/50'
                              : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200/50 dark:border-emerald-800/50'
                          }`}>
                            {u.role === 'ADMIN' ? 'PEMILIK / ADMIN' : 'KASIR'}
                          </span>
                        </div>

                        <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 dark:border-slate-700/60 text-[10px]">
                          <span className="text-slate-500 font-mono">
                            Pass: <strong className="text-slate-800 dark:text-slate-200 font-semibold">{u.password || '-'}</strong>
                          </span>
                          <div className="flex items-center space-x-1">
                            <button
                              type="button"
                              onClick={() => handleSelectDemoAccount(accEmail, u.password, false)}
                              className="px-2 py-1 rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:bg-slate-100 font-bold transition"
                            >
                              Gunakan
                            </button>
                            <button
                              type="button"
                              onClick={() => handleSelectDemoAccount(accEmail, u.password, true)}
                              className="px-2 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold transition flex items-center space-x-1"
                            >
                              <span>Masuk</span>
                              <LogIn className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <p className="text-[10px] text-slate-400 pt-1 text-center border-t border-slate-100 dark:border-slate-800">
                  Klik <strong>Gunakan</strong> untuk isi form, atau <strong>Masuk</strong> untuk login instan.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Center Container Form dengan Spacing Lega */}
        <div className="w-full max-w-md mx-auto my-auto py-6">
          
          {/* Header Switcher Tab */}
          <div className="mb-8">
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {authMode === 'signin' ? 'Masuk ke Sistem' : 'Pendaftaran Kasir Baru'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
              {authMode === 'signin' 
                ? 'Masukkan kredensial akun untuk mengakses sistem kasir warung.' 
                : 'Daftarkan identitas kasir baru untuk mulai mencatat transaksi.'}
            </p>

            <div className="flex bg-slate-100 dark:bg-slate-800/80 p-1 rounded-2xl mt-6 border border-slate-200 dark:border-slate-700">
              <button
                type="button"
                onClick={() => {
                  setAuthMode('signin');
                  setError(null);
                  setSuccess(null);
                }}
                className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition ${
                  authMode === 'signin'
                    ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                Sign In (Masuk)
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthMode('signup');
                  setError(null);
                  setSuccess(null);
                }}
                className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition ${
                  authMode === 'signup'
                    ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                Sign Up (Daftar Kasir)
              </button>
            </div>
          </div>

          {/* Alert Messages */}
          {error && (
            <div className="mb-6 p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 flex items-center space-x-2 text-rose-700 dark:text-rose-400 text-xs font-medium">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-6 p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center space-x-2 text-emerald-700 dark:text-emerald-400 text-xs font-medium">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{success}</span>
            </div>
          )}

          {/* Form dengan Spacing Rapi */}
          <form onSubmit={handleSubmit} className="space-y-5">
            
            {authMode === 'signup' && (
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                  Nama Lengkap
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={namaLengkap}
                    onChange={(e) => setNamaLengkap(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-slate-800 transition"
                    placeholder="Contoh: Siti Rahmawati"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                Email Akun
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-slate-800 transition"
                  placeholder={authMode === 'signin' ? 'daffa@warungberkah.com atau saepul@warungberkah.com' : 'kasirbaru@warungberkah.com'}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                Kata Sandi
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-11 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-slate-800 transition"
                  placeholder="******"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition focus:outline-none"
                  aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                  title={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-6 py-3 px-4 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md shadow-blue-500/25 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <span>Memproses...</span>
              ) : (
                <>
                  {authMode === 'signin' ? (
                    <>
                      <span>Masuk ke Akun</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" />
                      <span>Daftarkan Akun Kasir</span>
                    </>
                  )}
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer info kanan */}
        <div className="w-full text-center text-xs text-slate-400 pt-4">
          <span>Aplikasi Kasir Warung Sederhana &bull; Sesi Aman</span>
        </div>
      </div>

    </div>
  );
};
