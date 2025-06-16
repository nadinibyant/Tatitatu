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
// import TambahNonHandmade from './pages/SPV/Data Barang/Non-Handmade/TambahNonHandmade';
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
// import DashboardAG from './pages/Admin Gudang/Dashboard/DashboardAG';
import IzinCutiKaryawan from './pages/Karyawan/Izin/IzinCutiKaryawan';
import Absensi from './pages/Karyawan/Absensi/Absensi';
import AbsensiTransport from './pages/Karyawan/Absensi/Transportasi/AbsensiTransport';
import AbsensiProduksi from './pages/Karyawan/Absensi/Produksi/AbsensiProduksi';
import TambahAbsensiProduksi from './pages/Karyawan/Absensi/Produksi/TambahAbsensiProduksi';
import TambahBeliStokGudang from './pages/Admin Gudang/Pembelian Stok/TambahBeliStokGudang';
import EditBeliStokGudang from './pages/Admin Gudang/Pembelian Stok/EditBeliStokGudang';
import TokoTerbaik from './pages/Owner/Dashboard/TokoTerbaik';
import HariTerlaris from './pages/Owner/Dashboard/HariTerlaris';
import Catatan from './pages/Owner/Catatan/Catatan';
import Pemasukan from './pages/Finance/Pemasukan/Pemasukan';
import PengeluaranFinance from './pages/Finance/Pengeluaran/Pengeluaran';
import TambahPemasukan from './pages/Finance/Pemasukan/TambahPemasukan';
import DetailPemasukan from './pages/Finance/Pemasukan/DetailPemasukan';
import EditPemasukan from './pages/Finance/Pemasukan/EditPemasukan';
import TambahPengeluaran from './pages/Finance/Pengeluaran/TambahPengeluaran';
import DetailPengeluaran from './pages/Finance/Pengeluaran/DetailPengeluaran';
import EditPengeluaran from './pages/Finance/Pengeluaran/EditPengeluaran';
import KaryawanGaji from './pages/Manajer/Karyawan,Absensi,Gaji/KaryawanGaji';
import DetailKaryawanGaji from './pages/Manajer/Karyawan,Absensi,Gaji/DetailKaryawanGaji';
import BayarGaji from './pages/Manajer/Karyawan,Absensi,Gaji/BayarGaji';
import Toko from './pages/Manajer/Toko/Toko';
import EditPenjualanGudang from './pages/Manajer/Laporan Keuangan/EditPenjualanGudang';
import BiayaRumahProduksi from './pages/Admin Gudang/Biaya Rumah/BiayaRumahProduksi';
import PenjualanGudang from './pages/Admin Gudang/Penjualan/PenjualanGudang';
import DetailPenjualanGudang from './pages/Admin Gudang/Penjualan/DetailPenjualanGudang';
import TambahPenjualanGudang from './pages/Admin Gudang/Penjualan/TambahPenjualanGudang';
import EditPenjualanGudangAdmin from './pages/Admin Gudang/Penjualan/EditPenjualanGudang';
import TambahBarangNonHandmade from './pages/SPV/Data Barang/Non-Handmade/TambahNonHandmade';
import Profile from './pages/Profile';
import AkunKerja from './pages/Manajer/Kelola Akun Kerja/AkunKerja';


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
        {/* <Route path="/register" element={<AuthPages defaultTab="register" />} /> */}
        
        {/* Root Route */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        
        {/* 404 Route */}
        <Route path='*' element={<NotFound/>}/>

        {/* Test Route */}
        <Route path='/test' element={getProtectedRoute(TestComponent)} />

        {/* Protected Routes */}
        <Route path='/dashboard' element={getProtectedRoute(Dashboard, ['admin', 'headgudang', 'kasirtoko', 'owner', 'manajer'])} />
        <Route path='/dashboard/produk-terlaris' element={getProtectedRoute(ProdukTerlaris, ['admin', 'headgudang', 'owner', 'manajer'])} />
        <Route path='/dashboard/cabang-terlaris' element={getProtectedRoute(CabangTerlaris, ['admin'])} />
        <Route path='/dashboard/karyawan-terbaik' element={getProtectedRoute(KaryawanTerbaik, ['admin', 'headgudang', 'owner', 'manajer'])} />

        {/* dashboard kasir toko */}
        <Route path='/dashboard-kasir' element={getProtectedRoute(DashboardKasir, ['kasirtoko'])} />


        <Route path='/dashboard-admin-gudang' element={getProtectedRoute(ProdukTerlaris, ['admingudang'])} />

        {/* dashboard owner */}
        <Route path='/dashboard/toko-terbaik' element={getProtectedRoute(TokoTerbaik, ['owner', 'manajer'])} />
        <Route path='/dashboard/hari-terlaris' element={getProtectedRoute(HariTerlaris, ['admin','owner', 'manajer'])} />


        {/* Pembelian Stok Routes */}
        <Route path='/pembelianStok' element={getProtectedRoute(PembelianStok, ['admin', 'admingudang'])} />
        <Route path='/pembelianStok/detail' element={getProtectedRoute(DetailPembelianStok, ['admin', 'admingudang', 'finance', 'owner', 'manajer', 'headgudang'])} />
        <Route path='/pembelianStok/tambah' element={getProtectedRoute(TambahPembelianStok, ['admin'])} />
        <Route path='/pembelianStok/edit' element={getProtectedRoute(EditPembelianStok, ['admin', 'finance', 'owner', 'manajer'])} />

        {/* pembelian stok admin gudang */}
        <Route path='/pembelianStok/tambah-admin-gudang' element={getProtectedRoute(TambahBeliStokGudang, ['admingudang'])} />
        <Route path='/pembelianStok/edit-admin-gudang' element={getProtectedRoute(EditBeliStokGudang, ['admingudang'])} />


        {/* Laporan Keuangan Routes */}
        <Route path='/laporanKeuangan' element={getProtectedRoute(LaporanKeuangan, ['admin', 'headgudang', 'owner', 'finance', 'manajer'])} />
        <Route path='/laporanKeuangan/pemasukan/non-penjualan' element={getProtectedRoute(DetailNonPenjualan, ['admin', 'headgudang', 'owner', 'manajer'])} />
        <Route path='/laporanKeuangan/pemasukan/penjualan' element={getProtectedRoute(DetailPemasukanJual, ['admin', 'headgudang', 'owner', 'finance', 'manajer'])} />
        <Route path='/laporanKeuangan/pemasukan/penjualan/edit/non-custom/:id' element={getProtectedRoute(EditPemasukanJual, ['admin', 'headgudang', 'owner', 'finance', 'manajer'])} />
        <Route path='/laporanKeuangan/pemasukan/penjualan/edit/custom/:id' element={getProtectedRoute(EditPemasukanJualCustom, ['admin', 'headgudang', 'owner', 'finance', 'manajer'])} />
        <Route path='/laporanKeuangan/pemasukan/penjualan/edit/gudang/:id' element={getProtectedRoute(EditPenjualanGudang, ['admin', 'headgudang', 'owner', 'finance', 'manajer'])} />
        <Route path='/laporanKeuangan/pengeluaran' element={getProtectedRoute(Pengeluaran, ['admin', 'headgudang', 'owner', 'manajer'])} />
        <Route path='/laporanKeuangan/pengeluaran/gaji' element={getProtectedRoute(PengeluaranGaji, ['admin', 'headgudang', 'owner', 'manajer', 'finance'])} />

        <Route path='/laporanKeuangan/pengeluaran/detail' element={getProtectedRoute(DetailPengeluaran, ['finance', 'owner', 'admin', 'manajer', 'headgudang'])} />
        <Route path='/laporanKeuangan/pemasukan-non-penjualan/detail' element={getProtectedRoute(DetailPemasukan, ['finance', 'owner', 'admin', 'manajer', 'headgudang'])} />
        <Route path='/laporanKeuangan/pemasukan/penjualan/detail' element={getProtectedRoute(DetailPenjualanKasir, ['finance', 'owner', 'admin', 'manajer'])} />
        <Route path='/laporanKeuangan/pemasukan/penjualan-custom/:id' element={getProtectedRoute(EditPenjualanCustomKasir, ['finance', 'owner', 'admin', 'manajer'])} />
        <Route path='/laporanKeuangan/pemasukan/penjualan-non-custom/:id' element={getProtectedRoute(EditPenjualanNonCustomKasir, ['finance', 'owner', 'admin', 'manajer'])} />


        <Route path='/laporanKeuangan/penjualan-gudang/detail' element={getProtectedRoute(DetailPenjualanGudang, ['headgudang', 'manajer','finance', 'owner'])} />
        <Route path='/laporanKeuangan/pembelian-gudang/edit' element={getProtectedRoute(EditBeliStokGudang, ['headgudang', 'finance', 'manajer', 'owner'])} />

  
        {/* Penjualan Routes */}
        <Route path='/penjualanToko' element={getProtectedRoute(Penjualan)} />
        <Route path='/penjualanToko/detail' element={getProtectedRoute(DetailPenjualan)} />
        <Route path='/penjualanToko/edit/custom/:id' element={getProtectedRoute(EditPenjualanCustom)} />
        <Route path='/penjualanToko/edit/non-custom/:id' element={getProtectedRoute(EditPenjualanNon)} />
        {/* <Route path='/penjualanToko/edit/custom/:id' element={getProtectedRoute(EditPenjualanNon)} /> */}


        {/* penjualan kasir toko */}
        <Route path='/penjualan-kasir' element={getProtectedRoute(PenjualanKasir, ['kasirtoko'])} />
        <Route path='/penjualan-kasir/tambah' element={getProtectedRoute(TambahPenjualanKasir, ['kasirtoko'])} />
        <Route path='/penjualan-kasir/tambah/custom' element={getProtectedRoute(TambahPenjualanCustom, ['kasirtoko'])} />
        <Route path='/penjualan-kasir/detail' element={getProtectedRoute(DetailPenjualanKasir, ['kasirtoko'])} />
        <Route path='/penjualan-kasir/edit/custom/:id' element={getProtectedRoute(EditPenjualanCustomKasir, ['kasirtoko'])} />
        <Route path='/penjualan-kasir/edit/non-custom/:id' element={getProtectedRoute(EditPenjualanNonCustomKasir, ['kasirtoko'])} />

        {/* penjualan admin gudang */}
        <Route path='/penjualan-admin-gudang' element={getProtectedRoute(PenjualanGudang, ['admingudang'])} />
        <Route path='/penjualan-admin-gudang/tambah' element={getProtectedRoute(TambahPenjualanGudang, ['admingudang'])} />
        {/* <Route path='/penjualan-admin-gudang/tambah/custom' element={getProtectedRoute(TambahPenjualanCustom, ['admingudang'])} /> */}
        <Route path='/penjualan-admin-gudang/detail' element={getProtectedRoute(DetailPenjualanGudang, ['admingudang'])} />
        <Route path='/penjualan-admin-gudang/edit/:id' element={getProtectedRoute(EditPenjualanGudangAdmin, ['admingudang', 'headgudang', 'manajer', 'finance', 'owner'])} />
        {/* <Route path='/penjualan-admin-gudang/edit/non-custom/:id' element={getProtectedRoute(EditPenjualanNonCustomKasir, ['admingudang'])} /> */}

        {/* KPI Routes */}
        <Route path='/daftarPenilaianKPI' element={getProtectedRoute(PenilaianKPI, ['admin', 'headgudang', 'manajer'])} />
        <Route path='/daftarPenilaianKPI/tambah-kpi' element={getProtectedRoute(TambahKPI, ['admin', 'headgudang', 'manajer'])} />
        <Route path='/daftarPenilaianKPI/seluruh-divisi' element={getProtectedRoute(KPISeluruhDivisi, ['admin', 'headgudang', 'manajer'])} />
        <Route path='/daftarPenilaianKPI/seluruh-divisi/tambah' element={getProtectedRoute(TambahKPISeluruhDivisi, ['admin', 'headgudang', 'manajer'])} />
        <Route path='/daftarPenilaianKPI/seluruh-divisi/edit/:id' element={getProtectedRoute(EditKPISeluruhDivisi, ['admin', 'headgudang', 'manajer'])} />

        {/* Karyawan Routes */}
        <Route path='/dataKaryawanAbsenGaji' element={getProtectedRoute(Karyawan, ['admin', 'headgudang'])} />
        <Route path='/dataKaryawanAbsenGaji/detail' element={getProtectedRoute(DetailKaryawan, ['admin', 'headgudang', 'manajer'])} />

        {/* Other Routes */}
        <Route path='/daftarCabang' element={getProtectedRoute(Cabang)} />
        <Route path='/persentase-hpp-toko' element={getProtectedRoute(BiayaGudang, ['admin'])} />
        <Route path='/persentase-hpp' element={getProtectedRoute(BiayaRumahProduksi, ['admingudang'])} />

        {/* Data Barang Routes */}
        <Route path='/dataBarang' element={getProtectedRoute(DataBarang, ['admin', 'admingudang'])}/>
        <Route path='/dataBarang/handmade' element={getProtectedRoute(DataBarang, ['admin', 'admingudang'])} />
        <Route path='/dataBarang/handmade/tambah' element={getProtectedRoute(TambahBarang, ['admin', 'admingudang'])} />
        <Route path='/dataBarang/handmade/edit/:id' element={getProtectedRoute(EditBarang, ['admin', 'admingudang'])} />
        <Route path='/dataBarang/handmade/detail/:id' element={getProtectedRoute(DetailBarang, ['admin', 'admingudang'])} />
        <Route path='/dataBarang/non-handmade' element={getProtectedRoute(DataNonHandmade, ['admin', 'admingudang'])} />
        <Route path='/dataBarang/non-handmade/tambah' element={getProtectedRoute(TambahBarangNonHandmade, ['admin', 'admingudang'])} />
        <Route path='/dataBarang/non-handmade/detail/:id' element={getProtectedRoute(DetailNonHandmade, ['admin', 'admingudang'])} />
        <Route path='/dataBarang/non-handmade/edit/:id' element={getProtectedRoute(EditNonHandmade, ['admin', 'admingudang'])} />
        <Route path='/dataBarang/custom' element={getProtectedRoute(BarangCustom, ['admin', 'admingudang'])} />
        <Route path='/dataBarang/mentah' element={getProtectedRoute(BarangCustom, ['admingudang'])} />
        <Route path='/dataBarang/packaging' element={getProtectedRoute(Packaging, ['admin', 'admingudang'])} />

        {/* Akun Karyawan Routes */}
        <Route path='/akunKaryawan' element={getProtectedRoute(AkunKaryawan, ['admin', 'headgudang', 'manajer'])} />
        <Route path='/akunKaryawan/tambah' element={getProtectedRoute(TambahAkunKaryawan, ['admin', 'headgudang', 'manajer'])} />
        <Route path='/akunKaryawan/edit/:id' element={getProtectedRoute(EditKaryawan, ['admin', 'headgudang', 'manajer'])} />

        {/* Final Routes */}
        <Route path='/stokBarang' element={getProtectedRoute(StokBarang, ['admin', 'kasirtoko', 'admingudang', 'manajer'])} />
        <Route path='/pengajuanCuti' element={getProtectedRoute(IzinCuti, ['admin', 'headgudang', 'manajer'])} />
        <Route path='/pengajuanAbsensi' element={getProtectedRoute(IzinCuti, ['admingudang'])} />
        <Route path='/master-kategori' element={getProtectedRoute(MasterKategori, ['admin', 'kasirtoko', 'finance', 'admingudang', 'headgudang', 'manajer'])} />
        <Route path='/target-bulanan' element={getProtectedRoute(TargetBulanan, ['admin', 'headgudang', 'admingudang', 'manajer'])} />

        {/* karyawan */}
        <Route path='/izin-cuti-karyawan' element={getProtectedRoute(IzinCutiKaryawan, ['karyawanumum', 'karyawanproduksi', 'karyawanlogistik', 'karyawantransportasi', 'timhybrid'])} />
        <Route path='/absensi-karyawan' element={getProtectedRoute(Absensi, ['karyawanumum', 'karyawanlogistik' ])} />
        <Route path='/absensi-karyawan-transport' element={getProtectedRoute(AbsensiTransport, ['karyawantransportasi' ])} />
        <Route path='/absensi-tim-hybrid' element={getProtectedRoute(AbsensiTransport, ['timhybrid' ])} />
        <Route path='/absensi-karyawan-produksi' element={getProtectedRoute(AbsensiProduksi, ['karyawanproduksi' ])} />
        <Route path='/absensi-karyawan-produksi/tambah' element={getProtectedRoute(TambahAbsensiProduksi, ['karyawanproduksi' ])} />

        {/* catatan */}
        <Route path='/catatan' element={getProtectedRoute(Catatan, ['owner', 'manajer'])} />

        {/* finance tambahan */}
        <Route path='/pemasukan' element={getProtectedRoute(Pemasukan, ['finance' ])} />
        <Route path='/pemasukan/tambah' element={getProtectedRoute(TambahPemasukan, ['finance' ])} />
        <Route path='/pemasukan/detail' element={getProtectedRoute(DetailPemasukan, ['finance' ])} />
        <Route path='/pemasukan/edit/:id' element={getProtectedRoute(EditPemasukan, ['finance' ])} />
        <Route path='/pengeluaran' element={getProtectedRoute(PengeluaranFinance, ['finance' ])} />
        <Route path='/pengeluaran/tambah' element={getProtectedRoute(TambahPengeluaran, ['finance' ])} />
        <Route path='/pengeluaran/detail' element={getProtectedRoute(DetailPengeluaran, ['finance' ])} />
        <Route path='/pengeluaran/edit/:id' element={getProtectedRoute(EditPengeluaran, ['finance' ])} />

        <Route path='/pengeluaran/gaji' element={getProtectedRoute(PengeluaranGaji, ['finance'])} />


        {/* manajer tambahan */}
        <Route path='/karyawan-absen-gaji' element={getProtectedRoute(KaryawanGaji, ['manajer' ])} />
        <Route path='/karyawan-absen-gaji/detail' element={getProtectedRoute(DetailKaryawanGaji, ['manajer'])} />
        <Route path='/karyawan-absen-gaji/bayar-gaji' element={getProtectedRoute(BayarGaji, ['manajer'])} />
        <Route path='/toko' element={getProtectedRoute(Toko, ['manajer'])} />


        <Route path='/profile' element={getProtectedRoute(Profile, ['kasirtoko', 'karyawanumum', 'karyawanproduksi', 'karyawantransportasi'])} />
        <Route path='/profile/:id' element={getProtectedRoute(Profile, ['admin', 'owner', 'finance', 'manajer', 'headgudang', 'admingudang',])} />
        
        {/* kelola akun kerja */}
        <Route path='/kelola-akun-kerja' element={getProtectedRoute(AkunKerja, ['manajer'])} />
      </Routes>
    </Router>
  );
}

export default App;