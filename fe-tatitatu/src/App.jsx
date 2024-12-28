import './App.css'
import { BrowserRouter as Router, Routes, Route} from 'react-router-dom';
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


function App() {
  return (
    <>
    <Router>
      <Routes>
        <Route path='*' element= {<NotFound/>}/>
        <Route path='/test' element= {<TestComponent/>}/>
        <Route path='/pembelianStok' element= {<PembelianStok/>}/>
        <Route path='/pembelianStok/detail' element= {<DetailPembelianStok/>}/>
        <Route path='/pembelianStok/tambah' element= {<TambahPembelianStok/>}/>
        <Route path='/pembelianStok/edit' element= {<EditPembelianStok/>}/>
        <Route path='/laporanKeuangan' element= {<LaporanKeuangan/>}/>
        <Route path='/laporanKeuangan/pemasukan/non-penjualan' element= {<DetailNonPenjualan/>}/>
        <Route path='/laporanKeuangan/pemasukan/penjualan' element= {<DetailPemasukanJual/>}/>
        <Route path='/laporanKeuangan/pengeluaran' element= {<Pengeluaran/>}/>
        <Route path='/laporanKeuangan/pengeluaran/gaji' element= {<PengeluaranGaji/>}/>
        <Route path='/penjualanToko' element= {<Penjualan/>}/>
        <Route path='/penjualanToko/detail' element= {<DetailPenjualan/>}/>
        <Route path='/dashboard' element= {<Dashboard/>}/>
        <Route path='/dashboard/produk-terlaris' element= {<ProdukTerlaris/>}/>
        <Route path='/dashboard/cabang-terlaris' element= {<CabangTerlaris/>}/>
        <Route path='/dashboard/karyawan-terbaik' element= {<KaryawanTerbaik/>}/>
        <Route path='/daftarPenilaianKPI' element= {<PenilaianKPI/>}/>
        <Route path='/daftarPenilaianKPI/tambah-kpi' element= {<TambahKPI/>}/>
      </Routes>
    </Router>
    </>
  )
}

export default App