import './App.css'
import { BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import NotFound from './NotFound';
import TestComponent from './pages/SPV/Pembelian Stok/TestComponent';
import PembelianStok from './pages/SPV/Pembelian Stok/PembelianStok';
import DetailPembelianStok from './pages/SPV/Pembelian Stok/DetailPembelianStok';
import TambahPembelianStok from './pages/SPV/Pembelian Stok/TambahPembelianStok';
import EditPembelianStok from './pages/SPV/Pembelian Stok/EditPembelianStok';


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
      </Routes>
    </Router>
    </>
  )
}

export default App