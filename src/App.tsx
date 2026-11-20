import React from 'react';
import { useApp } from './store/store';
import { Navbar } from './components/layout/Navbar';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { KasirPage } from './pages/KasirPage';
import { ProdukPage } from './pages/ProdukPage';
import { StokPage } from './pages/StokPage';
import { RiwayatPage } from './pages/RiwayatPage';
import { LaporanPage } from './pages/LaporanPage';
import { PenggunaPage } from './pages/PenggunaPage';

export const AppContent: React.FC = () => {
  const { currentUser, currentPage } = useApp();

  // ATURAN TEGAS: Jika belum login atau berada di mode 'login',
  // TAMPILKAN LoginPage mandiri TANPA me-render Navbar sama sekali!
  if (!currentUser || currentPage === 'login') {
    return <LoginPage />;
  }

  // Render halaman utama aplikasi (hanya untuk user yang sudah login)
  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return currentUser.role === 'ADMIN' ? <DashboardPage /> : <KasirPage />;
      case 'kasir':
        return <KasirPage />;
      case 'produk':
        return currentUser.role === 'ADMIN' ? <ProdukPage /> : <KasirPage />;
      case 'stok':
        return currentUser.role === 'ADMIN' ? <StokPage /> : <KasirPage />;
      case 'riwayat':
        return <RiwayatPage />;
      case 'laporan':
        return currentUser.role === 'ADMIN' ? <LaporanPage /> : <KasirPage />;
      case 'pengguna':
        return currentUser.role === 'ADMIN' ? <PenggunaPage /> : <KasirPage />;
      default:
        return currentUser.role === 'ADMIN' ? <DashboardPage /> : <KasirPage />;
    }
  };

  return (
    <Navbar>
      {renderCurrentPage()}
    </Navbar>
  );
};

export default function App() {
  return <AppContent />;
}
