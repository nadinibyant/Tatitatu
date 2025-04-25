import { useEffect, useState } from "react";
import Button from "../../../components/Button";
import Navbar from "../../../components/Navbar";
import { menuItems, userOptions } from "../../../data/menu";
import { Pencil, Trash2, Plus, X, EyeOff, Eye } from 'lucide-react';
import Input from "../../../components/Input";
import FileInput from "../../../components/FileInput";
import LayoutWithNav from "../../../components/LayoutWithNav";
import AlertSuccess from "../../../components/AlertSuccess";
import Spinner from "../../../components/Spinner";
import AlertError from "../../../components/AlertError";
import Alert from "../../../components/Alert";
import api from "../../../utils/api";

export default function Toko(){
    function formatNumberWithDots(number) {
        return number.toLocaleString('id-ID');
    }
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isModal2Open, setIsModal2Open] = useState(false);
    const [modalMode, setModalMode] = useState('add');
    const [selectedBranch, setSelectedBranch] = useState(null);
    const [isLoading, setLoading] = useState(false);
    const [isAlertSuccess, setAlertSucc] = useState(false);
    const [isErrorAlert, setErrorAlert] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [isAlertDel, setAlertDel] = useState(false);
    const [isAlertSuccDel, setAlertDelSucc] = useState(false);
    const [id, setId] = useState('');
    const [branchData, setBranchData] = useState([]);
    const [passwordError, setPasswordError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isEditingBranch1, setIsEditingBranch1] = useState(false);
    
    const [formData, setFormData] = useState({
        branchName: '',
        logo: null,
        email: '',
        password: '',
        confirmPassword: '',
        imagePreview: ''
    });

    const [dataTerbanyak, setDataTerbanyak] = useState({
        keuntungan: {
            nama_toko: '',
            jumlah: 0
        },
        pemasukan: {
            nama_toko: '',
            jumlah: 0
        },
        pengeluaran: {
            nama_toko: '',
            jumlah: 0
        },
        barang: {
            nama_barang:'',
            jumlah: 0
        },
    });

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const toggleConfirmPasswordVisibility = () => {
        setShowConfirmPassword(!showConfirmPassword);
    };

    const partiallyRevealPassword = (password) => {
        if (!password) return '';
        return password.slice(0, 10) + '...';
    };

    const fetchTokoTerlaris = async () => {
        try {
            const response = await api.get('/toko/terlaris');
            
            if (response.data.success && response.data.data && response.data.data.toko_terlaris) {
                const terlarisData = response.data.data.toko_terlaris;
     
                const defaultToko = {
                    nama_toko: '-',
                    keuntungan: 0,
                    total_pemasukan: 0,
                    total_pengeluaran: 0,
                    produk_terjual: 0
                };
                
                const keuntunganTertinggi = terlarisData.keuntungan_tertinggi ?? defaultToko;
                const pemasukanTertinggi = terlarisData.pemasukan_tertinggi ?? defaultToko;
                const pengeluaranTertinggi = terlarisData.pengeluaran_tertinggi ?? defaultToko;
                const penjualanTerbanyak = terlarisData.penjualan_terbanyak ?? defaultToko;
                
                setDataTerbanyak({
                    keuntungan: {
                        nama_toko: keuntunganTertinggi.nama_toko || '-',
                        jumlah: keuntunganTertinggi.keuntungan || 0
                    },
                    pemasukan: {
                        nama_toko: pemasukanTertinggi.nama_toko || '-',
                        jumlah: pemasukanTertinggi.total_pemasukan || 0
                    },
                    pengeluaran: {
                        nama_toko: pengeluaranTertinggi.nama_toko || '-',
                        jumlah: pengeluaranTertinggi.total_pengeluaran || 0
                    },
                    barang: {
                        nama_barang: penjualanTerbanyak.nama_toko || '-',
                        jumlah: penjualanTerbanyak.produk_terjual || 0
                    },
                });
            } else {

                console.error('Failed to fetch terlaris data or invalid data structure:', 
                    response.data.message || 'Unknown error');

                setDataTerbanyak({
                    keuntungan: {
                        nama_toko: '-',
                        jumlah: 0
                    },
                    pemasukan: {
                        nama_toko: '-',
                        jumlah: 0
                    },
                    pengeluaran: {
                        nama_toko: '-',
                        jumlah: 0
                    },
                    barang: {
                        nama_barang: '-',
                        jumlah: 0
                    },
                });
            }
        } catch (error) {
            console.error('Error fetching terlaris data:', error);

            setDataTerbanyak({
                keuntungan: {
                    nama_toko: '-',
                    jumlah: 0
                },
                pemasukan: {
                    nama_toko: '-',
                    jumlah: 0
                },
                pengeluaran: {
                    nama_toko: '-',
                    jumlah: 0
                },
                barang: {
                    nama_barang: '-',
                    jumlah: 0
                },
            });
        }
    };

    
const fetchTokoData = async () => {
    try {
        setLoading(true);
        const response = await api.get('/toko');
        
        if (response.data.success) {
            const transformedData = response.data.data
                .filter(toko => !toko.is_deleted)
                .map(toko => {
                    let imageUrl;
                    
                    if (toko.toko_id === 1) {
                        imageUrl = "/logoDansa.svg";
                    } else {
                        imageUrl = toko.image 
                            ? `${import.meta.env.VITE_API_URL}/images-toko/${toko.image}` 
                            : "/logo.png";
                    }
                    
                    return {
                        id: toko.toko_id,
                        nama: toko.nama_toko,
                        email: toko.email,
                        password: toko.password,
                        logo: toko.image,
                        imageUrl: imageUrl
                    };
                });
                
            setBranchData(transformedData);
        } else {
            setErrorMessage('Gagal mengambil data toko');
            setErrorAlert(true);
        }
    } catch (error) {
        console.error('Error fetching toko data:', error);
        setErrorMessage('Gagal mengambil data toko');
        setErrorAlert(true);
    } finally {
        setLoading(false);
    }
};

useEffect(() => {
    fetchTokoData();
    fetchTokoTerlaris();
}, []);

    // Handle file input
    const handleFileChange = (file) => {
        if (file) {
            const imageUrl = URL.createObjectURL(file);
            setFormData(prev => ({
                ...prev,
                logo: file,
                imagePreview: imageUrl
            }));
        }
    };

    useEffect(() => {
        return () => {
            if (formData.imagePreview && formData.imagePreview.startsWith('blob:')) {
                URL.revokeObjectURL(formData.imagePreview);
            }
        };
    }, [isModalOpen]);

    // Handle form input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        if (name === 'confirmPassword') {
            if (formData.password !== value && value) {
                setPasswordError('Konfirmasi password tidak sesuai');
            } else {
                setPasswordError('');
            }
        }
    };

    // Handle add new toko
    const handleAdd = () => {
        setSelectedBranch(null);
        setFormData({
            branchName: '',
            logo: null,
            email: '',
            password: '',
            confirmPassword: ''
        });
        setModalMode('add');
        setIsModalOpen(true);
        setShowPassword(false);
        setShowConfirmPassword(false);
        setIsEditingBranch1(false);
    };

    // Handle edit toko
    const handleEdit = (branch) => {
        setSelectedBranch(branch);
        setFormData({
            branchName: branch.nama,
            logo: null,
            email: branch.email,
            password: '',
            confirmPassword: '',
            imagePreview: branch.imageUrl
        });
        setModalMode('edit');
        setIsEditingBranch1(branch.id === 1);
        
        // Jika branch.id === 1, langsung buka modal password (skip modal logo)
        if (branch.id === 1) {
            setIsModal2Open(true);
        } else {
            setIsModalOpen(true);
        }
        
        setShowPassword(false);
        setShowConfirmPassword(false);
    };

    const handleCloseModal = () => {
        if (formData.imagePreview && formData.imagePreview.startsWith('blob:')) {
            URL.revokeObjectURL(formData.imagePreview);
        }
        setFormData({
            branchName: '',
            logo: null,
            email: '',
            password: '',
            confirmPassword: '',
            imagePreview: ''
        });
        setIsModalOpen(false);
    };

    // Handle delete toko
    const handleDelete = (branchId) => {
        setAlertDel(true);
        setId(branchId);
    };

    // Handle confirm delete
    const handleConfirmDel = async () => {
        try {
            setLoading(true);
            const response = await api.delete(`/toko/${id}`);
            if (response.data.success) {
                await fetchTokoData();
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

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsModalOpen(false);
        setIsModal2Open(true);
    };


    const handleModal2Submit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            
            // Jika sedang mengedit branch.id === 1, kirim hanya data password
            if (isEditingBranch1) {
                const response = await api.put(`/toko/${selectedBranch.id}`, {
                    password: formData.password,
                    confirmPassword: formData.confirmPassword
                });

                if (response.data.success) {
                    await fetchTokoData();
                    setAlertSucc(true);
                    setIsModal2Open(false);
                } else {
                    setErrorMessage(response.data.message);
                    setErrorAlert(true);
                }
            } else {
                // Proses normal untuk branch lainnya
                const formDataToSend = new FormData();
                
                if (modalMode === 'edit' && !formData.logo && selectedBranch) {
                    formDataToSend.append('image', selectedBranch.logo); 
                } else if (formData.logo) {
                    formDataToSend.append('image', formData.logo); 
                }

                formDataToSend.append('nama_toko', formData.branchName);
                formDataToSend.append('email', formData.email);
                formDataToSend.append('password', formData.password);
                formDataToSend.append('confirmPassword', formData.confirmPassword);

                if (modalMode === 'add') {
                    const response = await api.post('/toko', formDataToSend, {
                        headers: {
                            'Content-Type': 'multipart/form-data',
                        },
                    });

                    if (response.data.success) {
                        await fetchTokoData();
                        setAlertSucc(true);
                        setIsModal2Open(false);
                    } else {
                        setErrorMessage(response.data.message);
                        setErrorAlert(true);
                    }
                } else {
                    const response = await api.put(`/toko/${selectedBranch.id}`, formDataToSend, {
                        headers: {
                            'Content-Type': 'multipart/form-data',
                        },
                    });

                    if (response.data.success) {
                        await fetchTokoData();
                        setAlertSucc(true);
                        setIsModal2Open(false);
                    } else {
                        setErrorMessage(response.data.message);
                        setErrorAlert(true);
                    }
                }
            }
        } catch (error) {
            console.error('Kesalahan Server', error);
            setErrorMessage('Terjadi kesalahan saat menyimpan data');
            setErrorAlert(true);
        } finally {
            setLoading(false);
        }
    };
    
    return(
        <>
        <LayoutWithNav menuItems={menuItems} userOptions={userOptions}>
            <div className="p-5">
                <section className="flex flex-wrap md:flex-nowrap items-center justify-between space-y-2 md:space-y-0">
                        {/* Left Section */}
                        <div className="left w-full md:w-auto">
                            <p className="text-biruTua text-base font-bold">Daftar Toko</p>
                        </div>

                        {/* Right Section */}
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
                                    bgColor="bg-biruTua"
                                    hoverColor="hover:bg-opacity-90 hover:border hover:border-biruTua hover:text-white"
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
                                        <p className="font-bold text-lg">{dataTerbanyak.keuntungan.nama_toko}</p>
                                        <p className="text-biruTua">Rp{formatNumberWithDots(dataTerbanyak.keuntungan.jumlah)}</p>
                                    </div>
                                    <div className="flex items-center justify-center ml-4">
                                        <img src="/keuangan/keuntungan_non.svg" alt="keuntungan" />
                                    </div>
                                </div>
                            </div>

                            {/* pemasukan */}
                            <div className="w-full">
                                <div className="flex items-center border border-[#F2E8F6] p-4 rounded-lg h-full">
                                    <div className="flex-1">
                                        <p className="text-gray-400 text-sm">Pemasukan Terbanyak</p>
                                        <p className="font-bold text-lg">{dataTerbanyak.pemasukan.nama_toko}</p>
                                        <p className="text-biruTua">Rp{formatNumberWithDots(dataTerbanyak.pemasukan.jumlah)}</p>
                                    </div>
                                    <div className="flex items-center justify-center ml-4">
                                        <img src="/keuangan/pemasukan_non.svg" alt="pemasukan" />
                                    </div>
                                </div>
                            </div>

                            {/* pengeluaran */}
                            <div className="w-full">
                                <div className="flex items-center border border-[#F2E8F6] p-4 rounded-lg h-full">
                                    <div className="flex-1">
                                        <p className="text-gray-400 text-sm">Pengeluaran Terbanyak</p>
                                        <p className="font-bold text-lg">{dataTerbanyak.pengeluaran.nama_toko}</p>
                                        <p className="text-biruTua">Rp{formatNumberWithDots(dataTerbanyak.pengeluaran.jumlah)}</p>
                                    </div>
                                    <div className="flex items-center justify-center ml-4">
                                        <img src="/keuangan/pengeluaran_non.svg" alt="pengeluaran" />
                                    </div>
                                </div>
                            </div>

                            {/* Barang Terbanyak */}
                            <div className="w-full">
                                <div className="flex items-center border border-[#F2E8F6] p-4 rounded-lg h-full">
                                    <div className="flex-1">
                                        <p className="text-gray-400 text-sm">Barang Custom Terlaris</p>
                                        <p className="font-bold text-lg">{dataTerbanyak.barang.nama_barang}</p>
                                        <p className="text-biruTua">{formatNumberWithDots(dataTerbanyak.barang.jumlah)}</p>
                                    </div>
                                    <div className="flex items-center justify-center ml-4">
                                        <img src="/keuangan/produkterjual_non.svg" alt="produk" />
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
                            <div key={branch.id} className="bg-white rounded-lg shadow-sm border p-4">
                                <div className="flex items-center gap-3 mb-10">
                                <img
                                    src={branch.imageUrl} 
                                    alt="Store Logo"
                                    className="w-40 h-20 object-contain px-2 border-r-2"
                                />
                                <div>
                                    <div className="text-gray-500 text-sm">Nama Toko</div>
                                    <div className="font-medium">{branch.nama}</div>
                                </div>
                                </div>

                                <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 bg-biruMuda rounded-full flex items-center justify-center">
                                    <div className="text-biruMuda-600">👤</div>
                                    </div>
                                    <div className="text-sm">{branch.email}</div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 bg-biruMuda rounded-full flex items-center justify-center">
                                    <div className="text-biruMuda-600">***</div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                    <div className="text-sm font-mono">
                                        {branch.showPassword 
                                        ? partiallyRevealPassword(branch.password) 
                                        : '***'}
                                    </div>
                                    <button 
                                        onClick={() => {
                                        setBranchData(prevData => 
                                            prevData.map(item => 
                                            item.id === branch.id 
                                                ? { ...item, showPassword: !item.showPassword }
                                                : item
                                            )
                                        );
                                        }}
                                        className="text-gray-500 hover:text-gray-700 flex-shrink-0"
                                    >
                                        {branch.showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                    </div>
                                </div>
                                </div>

                                <div className="flex gap-2 mt-10">
                                {/* Aktifkan tombol edit untuk semua branch */}
                                <button 
                                    onClick={() => handleEdit(branch)} 
                                    className="flex-1 flex items-center justify-center gap-2 border border-oren text-orange-500 py-2 rounded-md hover:bg-orange-50 transition-colors"
                                >
                                    <Pencil size={16} />
                                    Edit
                                </button>
    
                                {branch.id !== 1 && branch.id !== 2 ? (
                                    <button 
                                    onClick={() => handleDelete(branch.id)} 
                                    className="flex-1 flex items-center justify-center gap-2 bg-merah text-white py-2 rounded-md hover:bg-red-700 transition-colors"
                                    >
                                    <Trash2 size={16} />
                                    Hapus
                                    </button>
                                ) : (
                                    <div className="flex-1 flex items-center justify-center gap-2 bg-gray-300 text-gray-500 py-2 rounded-md cursor-not-allowed">
                                    <Trash2 size={16} />
                                    Hapus
                                    </div>
                                )}
                                </div>
                            </div>
                            ))}

                            {/* Add Branch Card */}
                                <div 
                                onClick={handleAdd}
                                className="border-2 border-dashed border-biruTua rounded-lg p-4 flex flex-col items-center justify-center min-h-[200px] cursor-pointer hover:border-biruMuda-400 transition-colors" 
                                >
                                <div className="w-12 h-12 bg-biruMuda flex items-center justify-center mb-2">
                                    <Plus className="text-biruMuda-600" size={24} />
                                </div>
                                <div className="text-biruMuda-600 font-medium">Tambah Toko</div>
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
                                        {modalMode === 'add' ? 'Masukan Logo Toko' : 'Edit Toko'}
                                    </h2>
                                    <button onClick={handleCloseModal} className="text-gray-500 hover:text-gray-700">
                                        <X size={24} />
                                    </button>
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-4">
                                    {modalMode === 'edit' && formData.imagePreview && (
                                        <div className="mb-4">
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Logo Saat Ini
                                            </label>
                                            <img
                                                src={formData.imagePreview}
                                                alt="Current Logo"
                                                className="w-40 h-20 object-contain border rounded-md"
                                            />
                                        </div>
                                    )}
                                    <FileInput
                                        label="Logo Toko"
                                        onFileChange={handleFileChange}
                                        width="w-full"
                                        required={modalMode === 'add'}
                                    />
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Nama Toko<span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="branchName"
                                            value={formData.branchName}
                                            onChange={handleInputChange}
                                            placeholder="Masukan Nama Toko"
                                            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-biruTua"
                                            required
                                        />
                                    </div>

                                    <div className="flex justify-end gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setIsModalOpen(false)}
                                            className="px-4 py-2 border rounded-md hover:bg-gray-50"
                                        >
                                            Batal
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={modalMode === 'add' && !formData.logo}
                                            className={`px-4 py-2 rounded-md ${
                                                modalMode === 'add' && !formData.logo 
                                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                                                : 'bg-biruTua text-white hover:bg-opacity-90'
                                            }`}
                                        >
                                            Lanjut
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                )}

{isModal2Open && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-lg w-full max-w-md">
                            <div className="p-6">
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-xl font-semibold">
                                        {modalMode === 'add' ? 'Buat Toko' : 'Edit Toko'}
                                    </h2>
                                    <button onClick={() => setIsModal2Open(false)} className="text-gray-500 hover:text-gray-700">
                                        <X size={24} />
                                    </button>
                                </div>

                                <form onSubmit={handleModal2Submit} className="space-y-4">
                                    {/* Email field - selalu tampil tapi disabled untuk branch.id === 1 */}
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
                                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-biruTua ${isEditingBranch1 ? 'bg-gray-100' : ''}`}
                                            required={!isEditingBranch1}
                                            disabled={isEditingBranch1}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Password{(modalMode === 'add' || isEditingBranch1) && <span className="text-red-500">*</span>}
                                        </label>
                                        <div className="relative">
                                            <input
                                                type={showPassword ? "text" : "password"}
                                                name="password"
                                                value={formData.password}
                                                onChange={handleInputChange}
                                                placeholder="Masukan Password"
                                                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-biruTua pr-10"
                                                required={modalMode === 'add' || isEditingBranch1}
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
                                            Masukan Ulang Password{(modalMode === 'add' || isEditingBranch1) && <span className="text-red-500">*</span>}
                                        </label>
                                        <div className="relative">
                                            <input
                                                type={showConfirmPassword ? "text" : "password"}
                                                name="confirmPassword"
                                                value={formData.confirmPassword}
                                                onChange={handleInputChange}
                                                placeholder="Masukan Ulang Password"
                                                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-biruTua pr-10"
                                                required={modalMode === 'add' || isEditingBranch1}
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
                                            <p className="text-red-500 text-sm mt-1">
                                                {passwordError}
                                            </p>
                                        )}
                                    </div>

                                    <div className="flex justify-end gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setIsModal2Open(false)}
                                            className="px-4 py-2 border rounded-md hover:bg-gray-50"
                                        >
                                            Batal
                                        </button>
                                        <button
                                            type="submit"
                                            className="px-4 py-2 bg-biruTua text-white rounded-md hover:bg-opacity-90"
                                            disabled={
                                                formData.password !== formData.confirmPassword || 
                                                !formData.password || 
                                                !formData.confirmPassword ||
                                                !!passwordError
                                            }
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

                {isLoading && <Spinner />}

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
        </LayoutWithNav>
        </>
    )
}