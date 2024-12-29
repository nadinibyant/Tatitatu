import { useState } from "react";
import Button from "../../../components/Button";
import Navbar from "../../../components/Navbar";
import { menuItems, userOptions } from "../../../data/menuSpv";
import { Pencil, Trash2, Plus, X } from 'lucide-react';

export default function Cabang(){
    function formatNumberWithDots(number) {
        return number.toLocaleString('id-ID');
    }

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('add');
    const [selectedBranch, setSelectedBranch] = useState(null);
    const [formData, setFormData] = useState({
      branchName: '',
      email: '',
      password: '',
      confirmPassword: ''
    });

    const [dataTerbanyak, setDataTerbanyak] = useState({
        keuntungan: {
            nama_toko: 'Tatitatu',
            jumlah: 10000000
        },
        pemasukan: {
            nama_toko: 'Rumah Produksi',
            jumlah: 65000000
        },
        pengeluaran: {
            nama_toko: 'Tatitatu',
            jumlah: 100000000
        },
        barang: {
            nama_barang:'Bonifade',
            jumlah: 1200
        },
    })

    const branchData = [
        {
          id: 1,
          nama: "Tatitatu",
          email: "bonifadetatitatu321@gmail.com",
          username: "Tatitatu123",
          logo: "logo.png"
        },
        {
          id: 2,
          nama: "Tatitatu",
          email: "bonifadetatitatu321@gmail.com",
          username: "Tatitatu123",
          logo: "logo.png"
        }
    ];

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
          username: branch.username
        });
        setModalMode('edit');
        setIsModalOpen(true);
      };
    
      const handleAdd = () => {
        setSelectedBranch(null);
        setFormData({
          branchName: '',
          email: '',
          password: '',
          confirmPassword: ''
        });
        setModalMode('add');
        setIsModalOpen(true);
      };
    
      const handleDelete = (branchId) => {
        if (window.confirm('Apakah Anda yakin ingin menghapus cabang ini?')) {
          console.log('Deleting branch with ID:', branchId);
          // Add your delete logic here
        }
      };
    
      const handleSubmit = (e) => {
        e.preventDefault();
        if (modalMode === 'add') {
          console.log('Adding new branch:', formData);
          // Add your create logic here
        } else {
          console.log('Updating branch:', selectedBranch.id, formData);
          // Add your update logic here
        }
        setIsModalOpen(false);
      };

    return(
        <>
        <Navbar menuItems={menuItems} userOptions={userOptions} label={'Cabang'}>
            <div className="p-5">
                <section className="flex flex-wrap md:flex-nowrap items-center justify-between space-y-2 md:space-y-0">
                        {/* Left Section */}
                        <div className="left w-full md:w-auto">
                            <p className="text-primary text-base font-bold">Daftar Cabang</p>
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
                                    bgColor="bg-primary"
                                    hoverColor="hover:bg-opacity-90 hover:border hover:border-primary hover:text-white"
                                    textColor="text-white"
                                    onClick={handleAdd}
                                />
                            </div>
                        </div>
                </section>

                <section className="mt-5 bg-white rounded-xl">
                    <div className="p-5 max-w-[1200px] mx-auto">
                        <div className="overflow-x-auto scrollbar-none">
                            <div className="flex gap-4 w-full">
                                {/* keuntungan */}
                                <div className="flex-shrink-0 w-full xs:w-[280px] sm:w-[calc(50%-0.5rem)] lg:w-[calc(25%-0.75rem)]">
                                    <div className="flex items-center border border-[#F2E8F6] p-4 rounded-lg h-full">
                                        <div className="flex-1">
                                            <p className="text-gray-400 text-sm">Keuntungan Terbanyak</p>
                                            <p className="font-bold text-lg">{dataTerbanyak.keuntungan.nama_toko}</p>
                                            <p className="text-primary">Rp{formatNumberWithDots(dataTerbanyak.keuntungan.jumlah)}</p>
                                        </div>
                                        <div className="flex items-center justify-center ml-4">
                                            <img src="/keuangan/keuntungan.svg" alt="keuntungan" />
                                        </div>
                                    </div>
                                </div>

                                {/* pemasukan */}
                                <div className="flex-shrink-0 w-full xs:w-[280px] sm:w-[calc(50%-0.5rem)] lg:w-[calc(25%-0.75rem)]">
                                    <div className="flex items-center border border-[#F2E8F6] p-4 rounded-lg h-full">
                                        <div className="flex-1">
                                            <p className="text-gray-400 text-sm">Pemasukan Terbanyak</p>
                                            <p className="font-bold text-lg">{dataTerbanyak.pemasukan.nama_toko}</p>
                                            <p className="text-primary">Rp{formatNumberWithDots(dataTerbanyak.pemasukan.jumlah)}</p>
                                        </div>
                                        <div className="flex items-center justify-center ml-4">
                                            <img src="/keuangan/pemasukan.svg" alt="pemasukan" />
                                        </div>
                                    </div>
                                </div>

                                {/* pengeluaran */}
                                <div className="flex-shrink-0 w-full xs:w-[280px] sm:w-[calc(50%-0.5rem)] lg:w-[calc(25%-0.75rem)]">
                                    <div className="flex items-center border border-[#F2E8F6] p-4 rounded-lg h-full">
                                        <div className="flex-1">
                                            <p className="text-gray-400 text-sm">Pengeluaran Terbanyak</p>
                                            <p className="font-bold text-lg">{dataTerbanyak.pengeluaran.nama_toko}</p>
                                            <p className="text-primary">Rp{formatNumberWithDots(dataTerbanyak.pengeluaran.jumlah)}</p>
                                        </div>
                                        <div className="flex items-center justify-center ml-4">
                                            <img src="/keuangan/pengeluaran.svg" alt="pengeluaran" />
                                        </div>
                                    </div>
                                </div>

                                {/* Barang Terbanyak */}
                                <div className="flex-shrink-0 w-full xs:w-[280px] sm:w-[calc(50%-0.5rem)] lg:w-[calc(25%-0.75rem)]">
                                    <div className="flex items-center border border-[#F2E8F6] p-4 rounded-lg h-full">
                                        <div className="flex-1">
                                            <p className="text-gray-400 text-sm">Barang Custom Terlaris</p>
                                            <p className="font-bold text-lg">{dataTerbanyak.barang.nama_barang}</p>
                                            <p className="text-primary">{formatNumberWithDots(dataTerbanyak.barang.jumlah)}</p>
                                        </div>
                                        <div className="flex items-center justify-center ml-4">
                                            <img src="/keuangan/produkterjual.svg" alt="produk" />
                                        </div>
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
                                    src={branch.logo}
                                    alt="Store Logo"
                                    className="px-2 border-r-2 object-contain"
                                />
                                <div>
                                    <div className="text-gray-500 text-sm">Nama Toko</div>
                                    <div className="font-medium">{branch.nama}</div>
                                </div>
                                </div>

                                <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 bg-pink rounded-full flex items-center justify-center">
                                    <div className="text-pink-600">👤</div>
                                    </div>
                                    <div className="text-sm">{branch.email}</div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 bg-pink rounded-full flex items-center justify-center">
                                    <div className="text-pink-600">***</div>
                                    </div>
                                    <div className="text-sm">{branch.username}</div>
                                </div>
                                </div>

                                <div className="flex gap-2 mt-10">
                                <button onClick={() => handleEdit(branch)} className="flex-1 flex items-center justify-center gap-2 border border-oren text-orange-500 py-2 rounded-md hover:bg-orange-50 transition-colors">
                                    <Pencil size={16} />
                                    Edit
                                </button>
                                <button onClick={() => handleDelete(branch.id)} className="flex-1 flex items-center justify-center gap-2 bg-merah text-white py-2 rounded-md hover:bg-red-700 transition-colors">
                                    <Trash2 size={16} />
                                    Hapus
                                </button>
                                </div>
                            </div>
                            ))}

                            {/* Add Branch Card */}
                                <div 
                                onClick={handleAdd}
                                className="border-2 border-dashed border-primary rounded-lg p-4 flex flex-col items-center justify-center min-h-[200px] cursor-pointer hover:border-pink-400 transition-colors" 
                                >
                                <div className="w-12 h-12 bg-pink flex items-center justify-center mb-2">
                                    <Plus className="text-pink-600" size={24} />
                                </div>
                                <div className="text-pink-600 font-medium">Tambah Cabang</div>
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
                                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
                                required
                            />
                            </div>

                            <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Email<span className="text-red-500">*</span>
                            </label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                placeholder="Masukan Email"
                                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
                                required
                            />
                            </div>

                            <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Password{modalMode === 'add' && <span className="text-red-500">*</span>}
                            </label>
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleInputChange}
                                placeholder="Masukan Password"
                                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
                                required={modalMode === 'add'}
                            />
                            </div>

                            <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Masukan Ulang Password{modalMode === 'add' && <span className="text-red-500">*</span>}
                            </label>
                            <input
                                type="password"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleInputChange}
                                placeholder="Masukan Ulang Password"
                                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
                                required={modalMode === 'add'}
                            />
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
                                className="px-4 py-2 bg-primary text-white rounded-md hover:bg-black-800 transition-colors"
                            >
                                {modalMode === 'add' ? 'Daftar' : 'Simpan'}
                            </button>
                            </div>
                        </form>
                        </div>
                    </div>
                    </div>
                )}
            </div>
        </Navbar>
        </>
    )
}