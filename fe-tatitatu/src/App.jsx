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
      </Routes>
    </Router>
    </>
  )
}

export default App