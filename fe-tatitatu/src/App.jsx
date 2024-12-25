import './App.css'
import { BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import NotFound from './NotFound';
import TestComponent from './pages/SPV/Pembelian Stok/TestComponent';
import PembelianStok from './pages/SPV/Pembelian Stok/PembelianStok';


function App() {
  return (
    <>
    <Router>
      <Routes>
        <Route path='*' element= {<NotFound/>}/>
        <Route path='/test' element= {<TestComponent/>}/>
        <Route path='/pembelianStok' element= {<PembelianStok/>}/>
      </Routes>
    </Router>
    </>
  )
}

export default App