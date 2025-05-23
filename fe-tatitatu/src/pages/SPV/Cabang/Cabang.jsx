import { useEffect, useState } from "react";
import Button from "../../../components/Button";
import Navbar from "../../../components/Navbar";
import { menuItems, userOptions } from "../../../data/menu";
import { Pencil, Trash2, Plus, X, Eye, EyeOff } from 'lucide-react';
import api from "../../../utils/api";
import Spinner from "../../../components/Spinner";
import AlertSuccess from "../../../components/AlertSuccess";
import AlertError from "../../../components/AlertError";
import Alert from "../../../components/Alert";

const BranchCard = ({ branch, onEdit, onDelete }) => {
  const [showPassword, setShowPassword] = useState(false);
//   const decodeHashedPassword = (hashedPassword) => {
//     return hashedPassword.substring(0, 12) + "...";
//   };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const userData = JSON.parse(localStorage.getItem('userData'));
  const isAdminGudang = userData?.role === 'admingudang'
  const isHeadGudang = userData?.role === 'headgudang';
  const isOwner = userData?.role === 'owner';
  const isManajer = userData?.role === 'manajer';
  const isAdmin = userData?.role === 'admin';
  const isFinance = userData?.role === 'finance'

  const themeColor = (isAdminGudang || isHeadGudang) 
  ? 'coklatTua' 
  : (isManajer || isOwner || isFinance) 
    ? "biruTua" 
    : (isAdmin && userData?.userId !== 1 && userData?.userId !== 2)
      ? "hitam"
      : "pink";

  return (
    <div className="bg-white rounded-lg shadow-sm border p-4">
      <div className="flex items-center gap-3 mb-10">
        <img
          src={branch.logo}
          alt="Store Logo"
          className="px-2 border-r-2 object-contain w-24 h-20"
        />
        <div>
          <div className="text-gray-500 text-sm">Nama Cabang</div>
          <div className="font-medium">{branch.nama}</div>
        </div>
      </div>

      <div className="space-y-3">
      <div className="flex items-center gap-2">
        <div className={`w-8 h-8 bg-${themeColor} rounded-full flex items-center justify-center`}>
            <div className={themeColor === 'hitam' ? 'text-white' : `text-${themeColor}-600`}>👩‍💻</div>
        </div>
        <div className="text-sm">{branch.email}</div>
    </div>

        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 bg-${themeColor} rounded-full flex items-center justify-center`}>
          <div className={themeColor === 'hitam' ? 'text-white' : `text-${themeColor}-600`}>***</div>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-sm font-mono">
              {showPassword ? (branch.detail_password) : '••••••••••••'}
            </div>
            <button 
              onClick={togglePasswordVisibility}
              className="text-gray-500 hover:text-gray-700"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>
      </div>

      <div className="flex gap-2 mt-10">
        <button 
          onClick={() => onEdit(branch)} 
          className="flex-1 flex items-center justify-center gap-2 border border-oren text-orange-500 py-2 rounded-md hover:bg-orange-50 transition-colors"
        >
          <Pencil size={16} />
          Edit
        </button>
        <button 
          onClick={() => onDelete(branch.id)} 
          className="flex-1 flex items-center justify-center gap-2 bg-merah text-white py-2 rounded-md hover:bg-red-700 transition-colors"
        >
          <Trash2 size={16} />
          Hapus
        </button>
      </div>
    </div>
  );
};

export default function Cabang(){
    function formatNumberWithDots(number) {
        return number ? number.toLocaleString('id-ID') : '0';
    }

    const userData = JSON.parse(localStorage.getItem('userData'));
    const isAdminGudang = userData?.role === 'admingudang'
    const isHeadGudang = userData?.role === 'headgudang';
    const isOwner = userData?.role === 'owner';
    const isManajer = userData?.role === 'manajer';
    const isAdmin = userData?.role === 'admin';
    const isFinance = userData?.role === 'finance'

    const themeColor = (isAdminGudang || isHeadGudang) 
    ? 'coklatTua' 
    : (isManajer || isOwner || isFinance) 
      ? "biruTua" 
      : (isAdmin && userData?.userId !== 1 && userData?.userId !== 2)
        ? "hitam"
        : "primary";

    const themeColor2 = (isAdminGudang || isHeadGudang) 
    ? 'coklatTua' 
    : (isManajer || isOwner || isFinance) 
      ? "biruTua" 
      : (isAdmin && userData?.userId !== 1 && userData?.userId !== 2)
        ? "secondary"
        : "pink";

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('add');
    const [selectedBranch, setSelectedBranch] = useState(null);
    const [isLoading, setLoading] = useState(false)
    const [branchData, setBranchData] = useState([]);
    const [isAlertSuccess, setAlertSucc] = useState(false)
    const [isErrorAlert, setErrorAlert] = useState(false)
    const [errorMessage, setErrorMessage] = useState('')
    const [passwordError, setPasswordError] = useState('');
    const [isAlertDel, setAlertDel] = useState(false)
    const [isAlertSuccDel, setAlertDelSucc] = useState(false)
    const userDataLogin = JSON.parse(localStorage.getItem('userData'));
    const toko_id = userDataLogin.userId
    const image = userDataLogin?.image
    const [id,setId] = useState('')
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [formData, setFormData] = useState({
      branchName: '',
      email: '',
      password: '',
      confirmPassword: ''
    });

    const togglePasswordVisibility = () => {
      setShowPassword(!showPassword);
    };

    const toggleConfirmPasswordVisibility = () => {
      setShowConfirmPassword(!showConfirmPassword);
    };

    const [dataTerbanyak, setDataTerbanyak] = useState({
        keuntungan: {
            nama_cabang: '',
            jumlah: 0
        },
        pemasukan: {
            nama_cabang: '',
            jumlah: 0
        },
        pengeluaran: {
            nama_cabang: '',
            jumlah: 0
        },
        barang: {
            nama_cabang: '',
            jumlah: 0
        },
    });

    const fetchStatsData = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/toko/terlaris?toko_id=${toko_id}`);
            
            if (response.data.success && response.data.data.cabang_terlaris) {
                const { cabang_terlaris } = response.data.data;
                
                setDataTerbanyak({
                    keuntungan: {
                        nama_cabang: cabang_terlaris.keuntungan_tertinggi.nama_cabang,
                        jumlah: cabang_terlaris.keuntungan_tertinggi.keuntungan
                    },
                    pemasukan: {
                        nama_cabang: cabang_terlaris.pemasukan_tertinggi.nama_cabang,
                        jumlah: cabang_terlaris.pemasukan_tertinggi.total_pemasukan
                    },
                    pengeluaran: {
                        nama_cabang: cabang_terlaris.pengeluaran_tertinggi.nama_cabang,
                        jumlah: cabang_terlaris.pengeluaran_tertinggi.total_pengeluaran
                    },
                    barang: {
                        nama_cabang: cabang_terlaris.penjualan_terbanyak.nama_cabang,
                        jumlah: cabang_terlaris.penjualan_terbanyak.produk_terjual
                    }
                });
            }
        } catch (error) {
            console.error('Error fetching stats data:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchBranchData = async () => {
        try {
          setLoading(true);
          const response = await api.get(`/cabang?toko_id=${toko_id}`);
          if (response.data.success) {
            const transformedData = response.data.data.map(branch => ({
              id: branch.cabang_id,
              nama: branch.nama_cabang,
              email: branch.email,
              detail_password: branch.detail_password,
              password: branch.password,
              logo: `${import.meta.env.VITE_API_URL}/images-toko/${image}`
            }));
            setBranchData(transformedData);
          }
        } catch (error) {
          console.error('Error fetching branch data:', error);
        } finally {
          setLoading(false);
        }
    };

    useEffect(() => {
        fetchBranchData();
        fetchStatsData();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
          ...prev,
          [name]: value
        }));
    };
    
    const handleEdit = (branch) => {
        setSelectedBranch(branch);
        setFormData({
          branchName: branch.nama,
          email: branch.email,
          password: '',  
          confirmPassword: '',
        });
        setPasswordError('');
        setModalMode('edit');
        setIsModalOpen(true);
        setShowPassword(false);
        setShowConfirmPassword(false);
    };
    
    const handleAdd = () => {
        setSelectedBranch(null);
        setFormData({
          branchName: '',
          email: '',
          password: '',
          confirmPassword: ''
        });
        setPasswordError('');
        setModalMode('add');
        setIsModalOpen(true);
        setShowPassword(false);
        setShowConfirmPassword(false);
    };
    
    const handleDelete = (branchId) => {
        setAlertDel(true)
        setId(branchId)
    };

    const handleConfirmDel = async () => {
        try {
            setLoading(true);
            const response = await api.delete(`/cabang/${id}`);
            if (response.data.success) {
                await fetchBranchData(); 
                setAlertDel(false);
                setAlertDelSucc(true);
            } else {
                setErrorMessage(response.data.message);
                setErrorAlert(true);
            }
        } catch (error) {
            console.error('Kesalahan Server', error);
            setErrorMessage('Terjadi kesalahan saat menghapus data');
            setErrorAlert(true);
        } finally {
            setLoading(false);
        }
    };
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (modalMode === 'add' || (modalMode === 'edit' && formData.password)) {
          if (formData.password !== formData.confirmPassword) {
            setPasswordError('Password dan konfirmasi password tidak cocok');
            return;
          }
          setPasswordError('');
        }
      
        if (modalMode === 'add') {
          try {
            setLoading(true)
            const response = await api.post('/cabang', {
              nama_cabang: formData.branchName,
              email: formData.email,
              password: formData.password,
              confirmPassword: formData.confirmPassword,
              toko_id: toko_id
            })
            if (response.data.success) {
              await fetchBranchData(); 
              setAlertSucc(true)
              setIsModalOpen(false);
            } else {
              setErrorMessage(response.data.message);
              setErrorAlert(true);
            }
          } catch (error) {
            console.error('Kesalahan Server', error)
            setErrorMessage(error.response.data.message);
            setErrorAlert(true);
          } finally {
            setLoading(false)
          }
        } else {
          try {
            setLoading(true)
            const data = {
              nama_cabang: formData.branchName,
              email: formData.email,
            }
            
            if (formData.password) {
              data.password = formData.password;
              data.confirmPassword = formData.confirmPassword
            }
      
            const response = await api.put(`/cabang/${selectedBranch.id}`, data)
            if (response.data.success) {
              await fetchBranchData(); 
              setAlertSucc(true)
              setIsModalOpen(false);
            } else {
              setErrorMessage(response.data.message);
              setErrorAlert(true);
            }
          } catch (error) {
            console.error('Kesalahan Server', error)
            setErrorMessage(error.response.data.message);
            setErrorAlert(true);
          } finally {
            setLoading(false)
          }
        }
    };
      
      const getIcon = (baseIconName) => {
        if (isManajer || isOwner || isFinance) {
          return `/keuangan/${baseIconName}_non.svg`;
        } else if (isAdminGudang || isHeadGudang){
          return `/keuangan/${baseIconName}_gudang.svg`;
        } else if (isAdmin && (userData?.userId !== 1 && userData?.userId !== 2)){
          return `/keuangan/${baseIconName}_toko2.svg`;
        }
        return `/keuangan/${baseIconName}.svg`;
    };

    return(
        <>
        <Navbar menuItems={menuItems} userOptions={userOptions}>
            <div className="p-5">
                <section className="flex flex-wrap md:flex-nowrap items-center justify-between space-y-2 md:space-y-0">
                    <div className="left w-full md:w-auto">
                        <p className={`text-${themeColor} text-base font-bold`}>Daftar Cabang</p>
                    </div>

                    <div className="right flex flex-wrap md:flex-nowrap items-center space-x-0 md:space-x-4 w-full md:w-auto space-y-2 md:space-y-0">
                        <div className="w-full md:w-auto">
                            <Button
                                label="Tambah"
                                icon={
                                    <svg
                                        width="16"
                                        height="16"
                                        viewBox="0 0 13 13"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path
                                            d="M13 8H8V13C8 13.2652 7.89464 13.5196 7.70711 13.7071C7.51957 13.8946 7.26522 14 7 14C6.73478 14 6.48043 13.8946 6.29289 13.7071C6.10536 13.5196 6 13.2652 6 13V8H1C0.734784 8 0.48043 7.89464 0.292893 7.70711C0.105357 7.51957 0 7.26522 0 7C0 6.73478 0.105357 6.48043 0.292893 6.29289C0.48043 6.10536 0.734784 6 1 6H6V1C6 0.734784 6.10536 0.480429 6.29289 0.292893C6.48043 0.105357 6.73478 0 7 0C7.26522 0 7.51957 0.105357 7.70711 0.292893C7.89464 0.480429 8 0.734784 8 1V6H13C13.2652 6 13.5196 6.10536 13.7071 6.29289C13.8946 6.48043 14 6.73478 14 7C14 7.26522 13.8946 7.51957 13.7071 7.70711C13.5196 7.89464 13.2652 8 13 8Z"
                                            fill="white"
                                        />
                                    </svg>
                                }
                                bgColor={`bg-${themeColor}`}
                                hoverColor={`hover:bg-opacity-90 hover:border hover:border-${themeColor} hover:text-white`}
                                textColor="text-white"
                                onClick={handleAdd}
                            />
                        </div>
                    </div>
                </section>

                <section className="mt-5 bg-white rounded-xl">
                    <div className="p-5">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            {/* keuntungan */}
                            <div className="w-full">
                                <div className="flex items-center border border-[#F2E8F6] p-4 rounded-lg h-full">
                                    <div className="flex-1">
                                        <p className="text-gray-400 text-sm">Keuntungan Terbanyak</p>
                                        <p className="font-bold text-lg">{dataTerbanyak.keuntungan.nama_cabang || 'Belum ada data'}</p>
                                        <p className={`text-${themeColor}`}>Rp{formatNumberWithDots(dataTerbanyak.keuntungan.jumlah)}</p>
                                    </div>
                                    <div className="flex items-center justify-center ml-4">
                                        <img src={getIcon('keuntungan')} alt="keuntungan" />
                                    </div>
                                </div>
                            </div>

                            {/* pemasukan */}
                            <div className="w-full">
                                <div className="flex items-center border border-[#F2E8F6] p-4 rounded-lg h-full">
                                    <div className="flex-1">
                                        <p className="text-gray-400 text-sm">Pemasukan Terbanyak</p>
                                        <p className="font-bold text-lg">{dataTerbanyak.pemasukan.nama_cabang || 'Belum ada data'}</p>
                                        <p className={`text-${themeColor}`}>Rp{formatNumberWithDots(dataTerbanyak.pemasukan.jumlah)}</p>
                                    </div>
                                    <div className="flex items-center justify-center ml-4">
                                    <img src={getIcon('pemasukan')} alt="pemasukan" />
                                    </div>
                                </div>
                            </div>

                            {/* pengeluaran */}
                            <div className="w-full">
                                <div className="flex items-center border border-[#F2E8F6] p-4 rounded-lg h-full">
                                    <div className="flex-1">
                                        <p className="text-gray-400 text-sm">Pengeluaran Terbanyak</p>
                                        <p className="font-bold text-lg">{dataTerbanyak.pengeluaran.nama_cabang || 'Belum ada data'}</p>
                                        <p className={`text-${themeColor}`}>Rp{formatNumberWithDots(dataTerbanyak.pengeluaran.jumlah)}</p>
                                    </div>
                                    <div className="flex items-center justify-center ml-4">
                                        <img src={getIcon('pengeluaran')} alt="pengeluaran" />
                                    </div>
                                </div>
                            </div>

                            {/* Barang Terjual Terbanyak */}
                            <div className="w-full">
                                <div className="flex items-center border border-[#F2E8F6] p-4 rounded-lg h-full">
                                    <div className="flex-1">
                                        <p className="text-gray-400 text-sm">Barang Terjual Terbanyak</p>
                                        <p className="font-bold text-lg">{dataTerbanyak.barang.nama_cabang || 'Belum ada data'}</p>
                                        <p className={`text-${themeColor}`}>{formatNumberWithDots(dataTerbanyak.barang.jumlah)} Pcs</p>
                                    </div>
                                    <div className="flex items-center justify-center ml-4">
                                        <img src={getIcon('produkterjual')} alt="produk" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="mt-5 bg-white rounded-xl">
                    <div className="p-5">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {branchData.map((branch) => (
                                <BranchCard
                                    key={branch.id}
                                    branch={branch}
                                    onEdit={handleEdit}
                                    onDelete={handleDelete}
                                />
                            ))}

                            {/* Add Branch Card */}
                            <div 
                                onClick={handleAdd}
                                className={`border-2 border-dashed border-${themeColor} rounded-lg p-4 flex flex-col items-center justify-center min-h-[200px] cursor-pointer hover:border-${themeColor}-400 transition-colors`}
                            >
                                <div className={`w-12 h-12 bg-${themeColor2} flex items-center justify-center mb-2`}>
                                    <Plus className={`text-pink-600}`} size={24} />
                                </div>
                                <div className={`text-${themeColor2}-600 font-medium`}>Tambah Cabang</div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Modal */}
                {isModalOpen && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-lg w-full max-w-md">
                            <div className="p-6">
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-xl font-semibold">
                                        {modalMode === 'add' ? 'Buat Akun Kasir' : 'Edit Akun Kasir'}
                                    </h2>
                                    <button 
                                        onClick={() => setIsModalOpen(false)}
                                        className="text-gray-500 hover:text-gray-700"
                                    >
                                        <X size={24} />
                                    </button>
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Nama Cabang<span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="branchName"
                                            value={formData.branchName}
                                            onChange={handleInputChange}
                                            placeholder="Masukan Nama Cabang Disini"
                                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-${themeColor}`}
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Username<span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            placeholder="Masukan Username"
                                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-${themeColor}`}
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Password{modalMode === 'add' && <span className="text-red-500">*</span>}
                                        </label>
                                        <div className="relative">
                                            <input
                                                type={showPassword ? "text" : "password"}
                                                name="password"
                                                value={formData.password}
                                                onChange={handleInputChange}
                                                placeholder="Masukan Password"
                                                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-${themeColor} pr-10 ${
                                                    passwordError ? 'border-red-500' : ''
                                                }`}
                                                required={modalMode === 'add'}
                                            />
                                            <button
                                                type="button"
                                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-600 cursor-pointer"
                                                onClick={togglePasswordVisibility}
                                                tabIndex="-1"
                                            >
                                                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                            </button>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Masukan Ulang Password{modalMode === 'add' && <span className="text-red-500">*</span>}
                                        </label>
                                        <div className="relative">
                                            <input
                                                type={showConfirmPassword ? "text" : "password"}
                                                name="confirmPassword"
                                                value={formData.confirmPassword}
                                                onChange={handleInputChange}
                                                placeholder="Masukan Ulang Password"
                                                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-${themeColor} pr-10 ${
                                                    passwordError ? 'border-red-500' : ''
                                                }`}
                                                required={modalMode === 'add'}
                                            />
                                            <button
                                                type="button"
                                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-600 cursor-pointer"
                                                onClick={toggleConfirmPasswordVisibility}
                                                tabIndex="-1"
                                            >
                                                {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                            </button>
                                        </div>
                                        {passwordError && (
                                            <p className="mt-1 text-sm text-red-500">{passwordError}</p>
                                        )}
                                    </div>

                                    <div className="flex justify-end gap-2 mt-6">
                                        <button
                                            type="button"
                                            onClick={() => setIsModalOpen(false)}
                                            className="px-4 py-2 border rounded-md hover:bg-gray-50 transition-colors"
                                        >
                                            Batal
                                        </button>
                                        <button
                                            type="submit"
                                            className={`px-4 py-2 bg-${themeColor} text-white rounded-md hover:bg-black-800 transition-colors`}
                                        >
                                            {modalMode === 'add' ? 'Daftar' : 'Simpan'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                )}

                {isAlertSuccess && (
                    <AlertSuccess
                        title="Berhasil!!"
                        description="Data Berhasil Ditambahkan/Diperbaharui"
                        confirmLabel="Ok"
                        onConfirm={() => setAlertSucc(false)}
                    />
                )}

                {isLoading && (
                    <Spinner />
                )}

                {isErrorAlert && (
                    <AlertError
                        title="Gagal!!"
                        description={errorMessage}
                        confirmLabel="Ok"
                        onConfirm={() => setErrorAlert(false)}
                    />
                )}

                {isAlertDel && (
                    <Alert
                        title="Hapus Data"
                        description="Apakah kamu yakin ingin menghapus data ini?"
                        confirmLabel="Hapus"
                        cancelLabel="Kembali"
                        onConfirm={handleConfirmDel}
                        onCancel={() => setAlertDel(false)}
                        open={isAlertDel}
                        onClose={() => setAlertDel(false)}
                    />
                )}

                {isAlertSuccDel && (
                    <AlertSuccess
                        title="Berhasil!!"
                        description="Data Berhasil Dihapus"
                        confirmLabel="Ok"
                        onConfirm={() => setAlertDelSucc(false)}
                    />
                )}
            </div>
        </Navbar>
        </>
    )
}