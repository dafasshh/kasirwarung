import React, { useState } from 'react';
import { useApp } from '../../store/store';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Package, 
  Layers, 
  History, 
  BarChart3, 
  Users, 
  LogOut, 
  Sun, 
  Moon, 
  Menu, 
  X, 
  Store,
  ShieldCheck,
  RotateCcw
} from 'lucide-react';

interface NavbarProps {
  children: React.ReactNode;
}

export const Navbar: React.FC<NavbarProps> = ({ children }) => {
  const { 
    currentUser, 
    logout, 
    currentPage, 
    setCurrentPage, 
    isDarkMode, 
    toggleDarkMode,
    cart,
    resetAllDataToSeed
  } = useApp();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Jika tidak ada user yang aktif, jangan render apapun dari Navbar
  if (!currentUser) {
    return <>{children}</>;
  }

  const navKasir = [
    { id: 'kasir', label: 'Kasir POS', icon: ShoppingCart, badge: cart.length > 0 ? cart.length : null },
    { id: 'riwayat', label: 'Riwayat Transaksi', icon: History },
  ];

  const navAdmin = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'kasir', label: 'Kasir POS', icon: ShoppingCart, badge: cart.length > 0 ? cart.length : null },
    { id: 'produk', label: 'Kelola Produk', icon: Package },
    { id: 'stok', label: 'Stok Opname', icon: Layers },
    { id: 'riwayat', label: 'Riwayat', icon: History },
    { id: 'laporan', label: 'Laporan', icon: BarChart3 },
    { id: 'pengguna', label: 'Kelola Kasir', icon: Users },
  ];

  const navItems = currentUser.role === 'ADMIN' ? navAdmin : navKasir;

  // Nama ringkas agar tidak memotong layout
  const displayShortName = currentUser.nama.split(' ')[0];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors duration-200 overflow-x-clip">
      {/* Sticky Header with generous padding, overflow-x-clip, and neat flex layout */}
      <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-white/95 dark:bg-slate-900/95 border-b border-slate-200 dark:border-slate-800 transition-colors shadow-xs">
        <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2 sm:gap-3">
          
          {/* SISI KIRI: Logo & Judul Singkat (shrink-0, no overflow) */}
          <div 
            onClick={() => setCurrentPage(currentUser.role === 'ADMIN' ? 'dashboard' : 'kasir')}
            className="flex items-center space-x-2 sm:space-x-2.5 shrink-0 cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-700 via-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-blue-500/25 shrink-0 group-hover:scale-105 transition-transform">
              <Store className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-sm sm:text-base tracking-tight bg-gradient-to-r from-blue-700 to-indigo-600 dark:from-blue-400 dark:to-indigo-300 bg-clip-text text-transparent whitespace-nowrap">
                Kasir Warung
              </span>
            </div>
          </div>

          {/* SISI TENGAH: Menu Navigasi (Lega, gap rapi, no wrap) */}
          <nav className="hidden xl:flex items-center gap-1 shrink-0">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentPage(item.id)}
                  className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/30'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ml-1 ${
                      isActive ? 'bg-white text-blue-600' : 'bg-blue-600 text-white'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Navigasi Compact untuk Layar Laptop Menengah (lg tapi belum xl) */}
          <nav className="hidden lg:flex xl:hidden items-center gap-1 shrink-0">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentPage(item.id)}
                  title={item.label}
                  className={`flex items-center space-x-1 px-2 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/30'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  <span>{item.label.split(' ')[0]}</span>
                  {item.badge && (
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ml-0.5 ${
                      isActive ? 'bg-white text-blue-600' : 'bg-blue-600 text-white'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* SISI KANAN: Tools & Info User (Aman, Tidak Terpotong di Ujung Layar) */}
          <div className="hidden sm:flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-1.5 sm:p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-slate-200 dark:border-slate-700/60 shrink-0 shadow-2xs"
              title={isDarkMode ? 'Beralih ke Light Mode' : 'Beralih ke Dark Mode'}
              aria-label="Toggle Mode Gelap/Terang"
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
            </button>

            {/* Reset Seed Demo Data Button */}
            <button
              onClick={resetAllDataToSeed}
              className="p-1.5 sm:p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-slate-200 dark:border-slate-700/60 shrink-0"
              title="Reset data demo ke Seed Awal"
              aria-label="Reset Data Demo"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* User Profile Pill dengan Truncate & Width Terkontrol agar Aman dari Tepi Kanan */}
            <div className="flex items-center pl-2 border-l border-slate-200 dark:border-slate-800 gap-1.5 sm:gap-2 shrink-0">
              <div className="flex flex-col text-right shrink-0">
                <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center justify-end space-x-1 whitespace-nowrap">
                  <span 
                    className="truncate max-w-[90px] sm:max-w-[110px] lg:max-w-[130px]" 
                    title={currentUser.nama}
                  >
                    {displayShortName}
                  </span>
                  {currentUser.role === 'ADMIN' && (
                    <ShieldCheck className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                  )}
                </div>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium whitespace-nowrap">
                  {currentUser.role === 'ADMIN' ? 'Admin' : 'Kasir'}
                </span>
              </div>

              <button
                onClick={logout}
                className="p-1.5 sm:p-2 rounded-xl text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 border border-rose-200/60 dark:border-rose-900/40 transition-colors shrink-0"
                title="Keluar dari sesi"
                aria-label="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Mobile menu trigger */}
          <div className="flex items-center lg:hidden gap-1.5 shrink-0">
            <button
              onClick={toggleDarkMode}
              className="p-1.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 shrink-0 border border-slate-200 dark:border-slate-800"
              aria-label="Toggle Tema"
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 shrink-0 border border-slate-200 dark:border-slate-800"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 pt-3 pb-5 space-y-1.5 shadow-lg">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setCurrentPage(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500 text-white font-bold">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}

            <div className="pt-3 mt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between px-2">
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">{currentUser.nama}</p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">{currentUser.role === 'ADMIN' ? 'Administrator' : 'Kasir Bertugas'}</p>
              </div>
              <button
                onClick={() => {
                  logout();
                  setMobileMenuOpen(false);
                }}
                className="flex items-center space-x-1.5 text-xs text-rose-600 dark:text-rose-400 font-semibold px-2.5 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <main className="flex-1 w-full pb-16">
        {children}
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-5 text-center text-xs text-slate-500 dark:text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="font-semibold text-slate-700 dark:text-slate-300">Aplikasi Kasir Warung Sederhana</span>
          </div>
          <div>
            <span>Format Uang Presisi Integer (IDR) &bull; Sistem Terintegrasi</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
