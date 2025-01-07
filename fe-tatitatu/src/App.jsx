import './App.css'
import { BrowserRouter as Router, Routes, Route, Navigate} from 'react-router-dom';
import NotFound from './NotFound';
import TestComponent from './pages/SPV/Pembelian Stok/TestComponent';
import PembelianStok from './pages/SPV/Pembelian Stok/PembelianStok';
import DetailPembelianStok from './pages/SPV/Pembelian Stok/DetailPembelianStok';
import TambahPembelianStok from './pages/SPV/Pembelian Stok/TambahPembelianStok';
import EditPembelianStok from './pages/SPV/Pembelian Stok/EditPembelianStok';
import LaporanKeuangan from './pages/SPV/Laporan Toko/LaporanKeuangan';
import DetailNonPenjualan from './pages/SPV/Laporan Toko/Pemasukan/DetailNonPenjualan';
import Pengeluaran from './pages/SPV/Laporan Toko/Pengeluaran/Pengeluaran';
import DetailPemasukanJual from './pages/SPV/Laporan Toko/Pemasukan/DetailPemasukanJual';
import PengeluaranGaji from './pages/SPV/Laporan Toko/Pengeluaran/PengeluaranGaji';
import Penjualan from './pages/SPV/Penjualan/Penjualan';
import DetailPenjualan from './pages/SPV/Penjualan/DetailPenjualan';
import Dashboard from './pages/SPV/Dashboard/Dashboard';
import ProdukTerlaris from './pages/SPV/Dashboard/ProdukTerlaris';
import CabangTerlaris from './pages/SPV/Dashboard/CabangTerlaris';
import KaryawanTerbaik from './pages/SPV/Dashboard/KaryawanTerbaik';
import PenilaianKPI from './pages/SPV/Penilaian KPI/PenilaianKPI';
import TambahKPI from './pages/SPV/Penilaian KPI/TambahKPI';
import KPISeluruhDivisi from './pages/SPV/Penilaian KPI/KPISeluruhDivisi';
import TambahKPISeluruhDivisi from './pages/SPV/Penilaian KPI/TambahKPISeluruhDivisi';
import EditKPISeluruhDivisi from './pages/SPV/Penilaian KPI/EditKPISeluruhDivisi';
import Karyawan from './pages/SPV/Karyawan, Absensi dan Gaji/Karyawan';
import DetailKaryawan from './pages/SPV/Karyawan, Absensi dan Gaji/DetailKaryawan';
import Cabang from './pages/SPV/Cabang/Cabang';
import BiayaGudang from './pages/SPV/Biaya Gudang/BiayaGudang';
import DataBarang from './pages/SPV/Data Barang/DataBarang';
import DataNonHandmade from './pages/SPV/Data Barang/Non-Handmade/DataNonHandmade';
import BarangCustom from './pages/SPV/Data Barang/Custom/BarangCustom';
import Packaging from './pages/SPV/Data Barang/Packaging/Packaging';
import TambahBarang from './pages/SPV/Data Barang/TambahBarang';
import EditBarang from './pages/SPV/Data Barang/EditBarang';
import DetailBarang from './pages/SPV/Data Barang/DetailBarang';
import TambahNonHandmade from './pages/SPV/Data Barang/Non-Handmade/TambahNonHandmade';
import DetailNonHandmade from './pages/SPV/Data Barang/Non-Handmade/DetailNonHandmade';
import EditNonHandmade from './pages/SPV/Data Barang/Non-Handmade/EditNonHandmade';
import AkunKaryawan from './pages/SPV/Akun Karyawan/AkunKaryawan';
import TambahAkunKaryawan from './pages/SPV/Akun Karyawan/TambahAkunKaryawan';
import EditKaryawan from './pages/SPV/Akun Karyawan/EditKaryawan';
import StokBarang from './pages/SPV/StokBarang/StokBarang';
import IzinCuti from './pages/SPV/Izin Cuti/IzinCuti';
import MasterKategori from './pages/SPV/Master Kategori/MasterKategori';
import TargetBulanan from './pages/SPV/Target Bulanan/TargetBulanan';
import EditPemasukanJual from './pages/SPV/Laporan Toko/Pemasukan/EditPemasukanJual';
import EditPemasukanJualCustom from './pages/SPV/Laporan Toko/Pemasukan/EditPemasukanJualCustom';
import EditPenjualanCustom from './pages/SPV/Penjualan/EditPenjualanCustom';
import EditPenjualanNon from './pages/SPV/Penjualan/EditPenjualanNon';
import AuthPages from './pages/AuthPages';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardKasir from './pages/Kasir Toko/Dashboard/DashboardKasir';
import PenjualanKasir from './pages/Kasir Toko/Penjualan/PenjualanKasir';
import TambahPenjualanKasir from './pages/Kasir Toko/Penjualan/TambahPenjualanKasir';
import TambahPenjualanCustom from './pages/Kasir Toko/Penjualan/TambahPenjualanCustom';
import DetailPenjualanKasir from './pages/Kasir Toko/Penjualan/DetailPenjualan';
import EditPenjualanCustomKasir from './pages/Kasir Toko/Penjualan/EditPenjualanCustomKasir';
import EditPenjualanNonCustomKasir from './pages/Kasir Toko/Penjualan/EditPenjualanNonCustomKasir';


function App() {
  // Helper function untuk menentukan allowed roles
  const getProtectedRoute = (Component, specificRoles = null) => {
    // Jika specificRoles tidak diset, berarti route hanya untuk admin
    const allowedRoles = specificRoles || ['admin'];
    return (
      <ProtectedRoute allowedRoles={allowedRoles}>
        <Component />
      </ProtectedRoute>
    );
  };

  // Routes yang bisa diakses headgudang
  const headGudangRoutes = [
    '/dashboard',
    '/dashboard/produk-terlaris',
    '/dashboard/cabang-terlaris',
    '/dashboard/karyawan-terbaik',
    '/laporanKeuangan',
    '/laporanKeuangan/pemasukan/non-penjualan',
    '/laporanKeuangan/pemasukan/penjualan',
    '/laporanKeuangan/pemasukan/penjualan/edit/non-custom',
    '/laporanKeuangan/pemasukan/penjualan/edit/custom',
    '/laporanKeuangan/pengeluaran',
    '/laporanKeuangan/pengeluaran/gaji',
    '/daftarPenilaianKPI',
    '/daftarPenilaianKPI/tambah-kpi',
    '/daftarPenilaianKPI/seluruh-divisi',
    '/daftarPenilaianKPI/seluruh-divisi/tambah',
    '/daftarPenilaianKPI/seluruh-divisi/edit',
    '/dataKaryawanAbsenGaji',
    '/dataKaryawanAbsenGaji/detail',
    '/akunKaryawan',
    '/akunKaryawan/tambah',
    '/akunKaryawan/edit',
    '/pengajuanCuti'
  ];

  // Helper function untuk mengecek apakah route bisa diakses headgudang
  const isHeadGudangRoute = (path) => {
    return headGudangRoutes.some(route => 
      path.startsWith(route) || path === route
    );
  };

  return (
    <Router>
      <Routes>
        {/* Auth Routes */}
        <Route path="/login" element={<AuthPages defaultTab="login" />} />
        <Route path="/register" element={<AuthPages defaultTab="register" />} />
        
        {/* Root Route */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        
        {/* 404 Route */}
        <Route path='*' element={<NotFound/>}/>

        {/* Test Route */}
        <Route path='/test' element={getProtectedRoute(TestComponent)} />

        {/* Protected Routes */}
        <Route path='/dashboard' element={getProtectedRoute(Dashboard, ['admin', 'headgudang', 'kasirtoko'])} />
        <Route path='/dashboard/produk-terlaris' element={getProtectedRoute(ProdukTerlaris, ['admin', 'headgudang'])} />
        <Route path='/dashboard/cabang-terlaris' element={getProtectedRoute(CabangTerlaris, ['admin'])} />
        <Route path='/dashboard/karyawan-terbaik' element={getProtectedRoute(KaryawanTerbaik, ['admin', 'headgudang'])} />

        {/* dashboard kasir toko */}
        <Route path='/dashboard-kasir' element={getProtectedRoute(DashboardKasir, ['kasirtoko'])} />

        {/* Pembelian Stok Routes */}
        <Route path='/pembelianStok' element={getProtectedRoute(PembelianStok)} />
        <Route path='/pembelianStok/detail' element={getProtectedRoute(DetailPembelianStok)} />
        <Route path='/pembelianStok/tambah' element={getProtectedRoute(TambahPembelianStok)} />
        <Route path='/pembelianStok/edit' element={getProtectedRoute(EditPembelianStok)} />

        {/* Laporan Keuangan Routes */}
        <Route path='/laporanKeuangan' element={getProtectedRoute(LaporanKeuangan, ['admin', 'headgudang'])} />
        <Route path='/laporanKeuangan/pemasukan/non-penjualan' element={getProtectedRoute(DetailNonPenjualan, ['admin', 'headgudang'])} />
        <Route path='/laporanKeuangan/pemasukan/penjualan' element={getProtectedRoute(DetailPemasukanJual, ['admin', 'headgudang'])} />
        <Route path='/laporanKeuangan/pemasukan/penjualan/edit/non-custom/:id' element={getProtectedRoute(EditPemasukanJual, ['admin', 'headgudang'])} />
        <Route path='/laporanKeuangan/pemasukan/penjualan/edit/custom/:id' element={getProtectedRoute(EditPemasukanJualCustom, ['admin', 'headgudang'])} />
        <Route path='/laporanKeuangan/pengeluaran' element={getProtectedRoute(Pengeluaran, ['admin', 'headgudang'])} />
        <Route path='/laporanKeuangan/pengeluaran/gaji' element={getProtectedRoute(PengeluaranGaji, ['admin', 'headgudang'])} />

        {/* Penjualan Routes */}
        <Route path='/penjualanToko' element={getProtectedRoute(Penjualan)} />
        <Route path='/penjualanToko/detail' element={getProtectedRoute(DetailPenjualan)} />
        <Route path='/penjualanToko/edit/custom/:id' element={getProtectedRoute(EditPenjualanCustom)} />
        <Route path='/penjualanToko/edit/non-custom/:id' element={getProtectedRoute(EditPenjualanNon)} />
        <Route path='/penjualanToko/edit/custom/:id' element={getProtectedRoute(EditPenjualanNon)} />

        {/* penjualan kasir toko */}
        <Route path='/penjualan-kasir' element={getProtectedRoute(PenjualanKasir, ['kasirtoko'])} />
        <Route path='/penjualan-kasir/tambah' element={getProtectedRoute(TambahPenjualanKasir, ['kasirtoko'])} />
        <Route path='/penjualan-kasir/tambah/custom' element={getProtectedRoute(TambahPenjualanCustom, ['kasirtoko'])} />
        <Route path='/penjualan-kasir/detail' element={getProtectedRoute(DetailPenjualanKasir, ['kasirtoko'])} />
        <Route path='/penjualan-kasir/edit/custom/:id' element={getProtectedRoute(EditPenjualanCustomKasir, ['kasirtoko'])} />
        <Route path='/penjualan-kasir/edit/non-custom/:id' element={getProtectedRoute(EditPenjualanNonCustomKasir, ['kasirtoko'])} />

        {/* KPI Routes */}
        <Route path='/daftarPenilaianKPI' element={getProtectedRoute(PenilaianKPI, ['admin', 'headgudang'])} />
        <Route path='/daftarPenilaianKPI/tambah-kpi' element={getProtectedRoute(TambahKPI, ['admin', 'headgudang'])} />
        <Route path='/daftarPenilaianKPI/seluruh-divisi' element={getProtectedRoute(KPISeluruhDivisi, ['admin', 'headgudang'])} />
        <Route path='/daftarPenilaianKPI/seluruh-divisi/tambah' element={getProtectedRoute(TambahKPISeluruhDivisi, ['admin', 'headgudang'])} />
        <Route path='/daftarPenilaianKPI/seluruh-divisi/edit/:id' element={getProtectedRoute(EditKPISeluruhDivisi, ['admin', 'headgudang'])} />

        {/* Karyawan Routes */}
        <Route path='/dataKaryawanAbsenGaji' element={getProtectedRoute(Karyawan, ['admin', 'headgudang'])} />
        <Route path='/dataKaryawanAbsenGaji/detail' element={getProtectedRoute(DetailKaryawan, ['admin', 'headgudang'])} />

        {/* Other Routes */}
        <Route path='/daftarCabang' element={getProtectedRoute(Cabang)} />
        <Route path='/biayaGudang' element={getProtectedRoute(BiayaGudang)} />

        {/* Data Barang Routes */}
        <Route path='/dataBarang' element={getProtectedRoute(DataBarang)} />
        <Route path='/dataBarang/handmade' element={getProtectedRoute(DataBarang)} />
        <Route path='/dataBarang/handmade/tambah' element={getProtectedRoute(TambahBarang)} />
        <Route path='/dataBarang/handmade/edit/:id' element={getProtectedRoute(EditBarang)} />
        <Route path='/dataBarang/handmade/detail/:id' element={getProtectedRoute(DetailBarang)} />
        <Route path='/dataBarang/non-handmade' element={getProtectedRoute(DataNonHandmade)} />
        <Route path='/dataBarang/non-handmade/tambah' element={getProtectedRoute(TambahNonHandmade)} />
        <Route path='/dataBarang/non-handmade/detail/:id' element={getProtectedRoute(DetailNonHandmade)} />
        <Route path='/dataBarang/non-handmade/edit/:id' element={getProtectedRoute(EditNonHandmade)} />
        <Route path='/dataBarang/custom' element={getProtectedRoute(BarangCustom)} />
        <Route path='/dataBarang/packaging' element={getProtectedRoute(Packaging)} />

        {/* Akun Karyawan Routes */}
        <Route path='/akunKaryawan' element={getProtectedRoute(AkunKaryawan, ['admin', 'headgudang'])} />
        <Route path='/akunKaryawan/tambah' element={getProtectedRoute(TambahAkunKaryawan, ['admin', 'headgudang'])} />
        <Route path='/akunKaryawan/edit/:id' element={getProtectedRoute(EditKaryawan, ['admin', 'headgudang'])} />

        {/* Final Routes */}
        <Route path='/stokBarang' element={getProtectedRoute(StokBarang, ['admin', 'kasirtoko'])} />
        <Route path='/pengajuanCuti' element={getProtectedRoute(IzinCuti, ['admin', 'headgudang'])} />
        <Route path='/master-kategori' element={getProtectedRoute(MasterKategori, ['admin', 'kasirtoko'])} />
        <Route path='/target-bulanan' element={getProtectedRoute(TargetBulanan)} />
      </Routes>
    </Router>
  );
}

export default App;