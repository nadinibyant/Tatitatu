import React, { useState, useEffect } from 'react';
import Input from '../../../components/Input';
import InputDropdown from '../../../components/InputDropdown';
import Table from '../../../components/Table';
import Breadcrumbs from "../../../components/Breadcrumbs";
import LayoutWithNav from "../../../components/LayoutWithNav";
import api from "../../../utils/api";
import Spinner from "../../../components/Spinner";
import AlertSuccess from "../../../components/AlertSuccess";
import AlertError from "../../../components/AlertError";
import { useNavigate } from 'react-router-dom';
import SearchableDropdown from '../../../components/SearchableDropdown';

export default function TambahPemasukan() {
    const formatRupiah = (angka) => {
        if (!angka || isNaN(angka)) return '';

        let value = String(angka).replace(/\D/g, '');

        return value.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    };
    const unformatRupiah = (rupiah) => {
        return rupiah ? Number(rupiah.replace(/\./g, '')) : 0;
    };

    const userData = JSON.parse(localStorage.getItem('userData'));
    const isAdminGudang = userData?.role === 'admingudang'
    const isHeadGudang = userData?.role === 'headgudang';
    const isOwner = userData?.role === 'owner';
    const isManajer = userData?.role === 'manajer';
    const isAdmin = userData?.role === 'admin';
    const isFinance = userData?.role === 'finance'

    const breadcrumbItems = [
        { label: "Daftar Pemasukan", href: "/pemasukan" },
        { label: "Tambah Pemasukan", href: "" },
    ];

    const [formData, setFormData] = useState({
        nomor: '',
        tanggal: '',
        kategori_pemasukan_id: '',
        cash_or_non: false,
        metode_id: '',
        potongan: '',
        potongan_formatted: ''
    });

    const themeColor = (isAdminGudang || isHeadGudang) 
    ? "coklatTua" 
    : (isManajer || isOwner || isFinance) 
      ? "biruTua" 
      : "primary";

    const [tableRows, setTableRows] = useState([]);
    const [isLoading, setLoading] = useState(false);
    const [isAlertSuccess, setAlertSuccess] = useState(false);
    const [isAlertError, setAlertError] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const [kategoriOptions, setKategoriOptions] = useState([]);
    const [metodeOptions, setMetodeOptions] = useState([]);
    const [tokoOptions, setTokoOptions] = useState([]);
    const [cabangOptionsByToko, setCabangOptionsByToko] = useState({});

    const cashOptions = [
        { label: 'Cash', value: true },
        { label: 'Non-Cash', value: false }
    ];

    useEffect(() => {
        fetchKategoriPemasukan();
        fetchMetodePembayaran();
        fetchToko();
    }, []);

    const fetchKategoriPemasukan = async () => {
        try {
            const response = await api.get('/kategori-pemasukan');
            if (response.data.success) {
                const options = response.data.data.map(item => ({
                    value: item.kategori_pemasukan_id,
                    label: item.kategori_pemasukan
                }));
                setKategoriOptions([{ value: '', label: 'Pilih Kategori Pemasukan' }, ...options]);
            }
        } catch (error) {
            console.error('Error fetching kategori pemasukan:', error);
        }
    };

    const fetchMetodePembayaran = async () => {
        try {
            const response = await api.get('/metode-pembayaran');
            if (response.data.success) {
                const options = response.data.data.map(item => ({
                    value: item.metode_id,
                    label: item.nama_metode
                }));
                setMetodeOptions([{ value: '', label: 'Pilih Metode Pembayaran' }, ...options]);
            }
        } catch (error) {
            console.error('Error fetching metode pembayaran:', error);
        }
    };

    const fetchToko = async () => {
        try {
            const response = await api.get('/toko');
            if (response.data.success) {
                const options = response.data.data.map(item => ({
                    value: item.toko_id,
                    label: item.nama_toko
                }));
                setTokoOptions([{ value: '', label: 'Pilih Toko' }, ...options]);
            }
        } catch (error) {
            console.error('Error fetching toko:', error);
        }
    };

    const fetchCabangByToko = async (tokoId) => {
        if (!tokoId) return;
        
        try {
            const response = await api.get(`/cabang?toko_id=${tokoId}`);
            if (response.data.success) {
                const options = response.data.data.map(item => ({
                    value: item.cabang_id,
                    label: item.nama_cabang
                }));
                
                setCabangOptionsByToko(prev => ({
                    ...prev,
                    [tokoId]: [{ value: null, label: '- Pilih Cabang -' }, ...options]
                }));

                return options;
            }
        } catch (error) {
            console.error(`Error fetching cabang for toko_id=${tokoId}:`, error);
        }
        return [];
    };

    useEffect(() => {
        if (formData.cash_or_non === true) {
            setFormData(prev => ({
                ...prev,
                metode_id: ''
            }));
        }
    }, [formData.cash_or_non]);

    const handleInputChange = (field, value) => {
        if (field === 'potongan') {
            const numericValue = unformatRupiah(value);
            setFormData(prev => ({
                ...prev,
                potongan: numericValue,
                potongan_formatted: formatRupiah(numericValue)
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [field]: value
            }));
        }
    };

    const handleRowChange = (id, field, value) => {
        setTableRows(prev => prev.map(row => {
            if (row.id === id) {
                if (field === 'toko_id') {
                    if (value && !cabangOptionsByToko[value]) {
                        fetchCabangByToko(value);
                    }
                    
                    return { 
                        ...row, 
                        [field]: value,
                        cabang_id: null 
                    };
                }
                
                if (field === 'jumlah_pemasukan') {
                    const numericValue = unformatRupiah(value);
                    return { 
                        ...row, 
                        [field]: numericValue,
                        jumlah_pemasukan_formatted: formatRupiah(numericValue)
                    };
                }
            
                return { ...row, [field]: value };
            }
            return row;
        }));
    };

    const addNewRow = () => {
        const newRow = {
            id: Date.now(),
            deskripsi: '',
            toko_id: '',
            cabang_id: null,
            jumlah_pemasukan: '',
            jumlah_pemasukan_formatted: '' 
        };
        setTableRows([...tableRows, newRow]);
    };

    const deleteRow = (id) => {
        setTableRows(prev => prev.filter(row => row.id !== id));
    };

    const tableData = tableRows.map((row, index) => {
        return {
            no: index + 1,
            deskripsi: (
                <input
                    type="text"
                    value={row.deskripsi}
                    onChange={(e) => handleRowChange(row.id, 'deskripsi', e.target.value)}
                    className={`w-full p-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:border-${themeColor}`}
                    placeholder="Deskripsi pemasukan"
                />
            ),
            toko: (
                <SearchableDropdown
                    options={tokoOptions}
                    value={row.toko_id}
                    onChange={(option) => handleRowChange(row.id, 'toko_id', option.value)}
                    placeholder="Pilih Toko"
                />
            ),
            cabang: (
                <SearchableDropdown
                    options={row.toko_id && cabangOptionsByToko[row.toko_id] ? 
                        cabangOptionsByToko[row.toko_id] : 
                        [{ value: '', label: 'Pilih Toko Dulu' }]}
                    value={row.cabang_id || ''}
                    onChange={(option) => handleRowChange(row.id, 'cabang_id', option.value === '' ? null : option.value)}
                    placeholder="Pilih Cabang"
                    disabled={!row.toko_id}
                />
            ),
            jumlahPemasukan: (
                <div className="relative">
                    <span className="absolute left-2 top-1 text-gray-500">Rp</span>
                    <input
                        type="text"
                        value={row.jumlah_pemasukan_formatted || ''}
                        onChange={(e) => {
                            const value = e.target.value.replace(/\./g, ''); 
                            if (/^\d*$/.test(value)) {
                                handleRowChange(row.id, 'jumlah_pemasukan', value);
                            }
                        }}
                        className={`w-full p-1 pl-8 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:border-${themeColor} text-right`}
                        placeholder="0"
                    />
                </div>
            ),
            aksi: (
                <button
                    onClick={(e) => {
                        e.stopPropagation(); 
                        deleteRow(row.id);
                    }}
                    className="text-red-500 hover:text-red-700"
                >
                    Hapus
                </button>
            )
        };
    });

    const tableHeaders = [
        { key: 'no', label: 'No', width: '50px' },
        { key: 'deskripsi', label: 'Deskripsi' },
        { key: 'toko', label: 'Toko', width: '180px' },
        { key: 'cabang', label: 'Cabang', width: '180px' },
        { key: 'jumlahPemasukan', label: 'Jumlah Pemasukan', width: '180px' },
        { key: 'aksi', label: 'Aksi', width: '80px', align: 'text-center' }
    ];

    const calculateSubTotal = () => {
        return tableRows.reduce((sum, row) => {
            const amount = parseInt(row.jumlah_pemasukan) || 0;
            return sum + amount;
        }, 0);
    };

    const calculateTotal = () => {
        const subTotal = calculateSubTotal();
        const potongan = parseInt(formData.potongan) || 0;
        return subTotal - potongan;
    };

    const navigate = useNavigate()
    const handleSubmit = async () => {
        try {
            setLoading(true);
    
            if (!formData.tanggal || !formData.kategori_pemasukan_id) {
                setErrorMessage('Harap lengkapi data form');
                setAlertError(true);
                setLoading(false);
                return;
            }
    
            if (tableRows.length === 0) {
                setErrorMessage('Tambahkan minimal satu baris data pemasukan');
                setAlertError(true);
                setLoading(false);
                return;
            }
    
            for (const row of tableRows) {
                if (!row.deskripsi || !row.toko_id || !row.jumlah_pemasukan) {
                    setErrorMessage('Lengkapi semua data pada tabel');
                    setAlertError(true);
                    setLoading(false);
                    return;
                }
            }
    
            const total = calculateTotal();
            if (total < 0) {
                setErrorMessage('Total tidak boleh bernilai negatif. Kurangi jumlah potongan.');
                setAlertError(true);
                setLoading(false);
                return;
            }
    
            const deskripsiPemasukan = tableRows.map(row => ({
                deskripsi: row.deskripsi,
                toko_id: parseInt(row.toko_id),
                cabang_id: row.cabang_id === null ? null : parseInt(row.cabang_id),
                jumlah_pemasukan: parseInt(row.jumlah_pemasukan) || 0
            }));
    
            const payload = {
                tanggal: formData.tanggal,
                kategori_pemasukan_id: parseInt(formData.kategori_pemasukan_id),
                cash_or_non: formData.cash_or_non,
                metode_id: formData.cash_or_non === false ? parseInt(formData.metode_id) : null,
                total: total,
                potongan: parseInt(formData.potongan) || 0,
                subtotal: calculateSubTotal(),
                deskripsi_pemasukan: deskripsiPemasukan
            };
    
            console.log('Payload:', payload);
    
            const response = await api.post('/pemasukan', payload);
            
            if (response.data.success) {
                setAlertSuccess(true);
                navigate('/pemasukan');
                setFormData({
                    nomor: '',
                    tanggal: '',
                    kategori_pemasukan_id: '',
                    cash_or_non: false,
                    metode_id: '',
                    potongan: '',
                    potongan_formatted: ''
                });
                setTableRows([]);
            } else {
                setErrorMessage(response.data.message || 'Terjadi kesalahan saat menyimpan data');
                setAlertError(true);
            }
        } catch (error) {
            console.error('Error submitting data:', error);
            setErrorMessage(error.response?.data?.message || 'Terjadi kesalahan saat menghubungi server');
            setAlertError(true);
        } finally {
            setLoading(false);
        }
    };

    return (
        <LayoutWithNav>
            <div className="p-5">
                <Breadcrumbs items={breadcrumbItems} />
                <section className="mt-5 bg-white rounded-xl">
                    <div className="p-5">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Input
                                label="Nomor"
                                value={formData.nomor}
                                onChange={(value) => handleInputChange('nomor', value)}
                                disabled={true}
                            />
                            <Input
                                label="Tanggal dan Waktu"
                                type1="datetime-local"
                                value={formData.tanggal}
                                onChange={(value) => handleInputChange('tanggal', value)}
                                required
                            />
                            <InputDropdown
                                label="Kategori"
                                options={kategoriOptions}
                                value={formData.kategori_pemasukan_id}
                                onSelect={(option) => handleInputChange('kategori_pemasukan_id', option.value)}
                                required
                            />
                            <InputDropdown
                                label="Cash/Non-Cash"
                                options={cashOptions}
                                value={formData.cash_or_non}
                                onSelect={(option) => handleInputChange('cash_or_non', option.value)}
                                required
                            />
                            <InputDropdown
                                label="Metode Pembayaran"
                                options={metodeOptions}
                                value={formData.metode_id}
                                onSelect={(option) => handleInputChange('metode_id', option.value)}
                                width="w-full"
                                disabled={formData.cash_or_non}
                                required={!formData.cash_or_non}
                            />
                        </div>

                        <div className="mt-8">
                            <h3 className="font-medium mb-4">Deskripsi Pemasukan</h3>
                            
                            {tableRows.length === 0 ? (
                                <div className="text-center py-6 bg-gray-50 rounded-lg border border-gray-200">
                                    <p className="text-gray-500">Belum ada data. Klik "Tambah Baris" untuk menambahkan.</p>
                                </div>
                            ) : (
                                <Table
                                    headers={tableHeaders}
                                    data={tableData}
                                    hasSearch={false}
                                    hasPagination={false}
                                />
                            )}

                            <div className="mt-4">
                                <button
                                    onClick={addNewRow}
                                    className={`flex items-center text-${themeColor}`}
                                >
                                    <span className="mr-2 text-xl">+</span>
                                    <span className={`text-${themeColor}`}>Tambah Baris</span>
                                </button>
                            </div>

                            {/* Bagian Sub Total, Potongan, dan Total */}
                            <div className="mt-8 flex justify-end">
                                <div className="w-full max-w-md">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="text-right font-medium">Sub Total</div>
                                        <div className="text-right">Rp{formatRupiah(calculateSubTotal())}</div>
                                        
                                        <div className="text-right font-medium">Potongan</div>
                                        <div className="relative">
                                            <span className="absolute left-2 top-1 text-gray-500">Rp</span>
                                            <input
                                                type="text"
                                                value={formData.potongan_formatted || ''}
                                                onChange={(e) => {
                                                    const value = e.target.value.replace(/\./g, '');
                                                    if (/^\d*$/.test(value)) {
                                                        handleInputChange('potongan', value);
                                                    }
                                                }}
                                                className={`w-full p-1 pl-8 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:border-${themeColor} text-right`}
                                                placeholder="0"
                                            />
                                        </div>
                                        
                                        <div className="text-right font-medium">Total</div>
                                        <div className="text-right font-bold">Rp{formatRupiah(calculateTotal())}</div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 flex justify-end">
                                <button 
                                    className={`w-1/3 bg-${themeColor} text-white py-2 rounded-lg transition-colors hover:bg-white hover:border-${themeColor} hover:border hover:text-black`}
                                    onClick={handleSubmit}
                                    disabled={isLoading}
                                >
                                    {isLoading ? 'Menyimpan...' : 'Simpan'}
                                </button>
                            </div>
                        </div>
                    </div>
                </section>
            </div>

            {isLoading && <Spinner />}

            {isAlertSuccess && (
                <AlertSuccess
                    title="Berhasil!"
                    description="Data pemasukan berhasil disimpan"
                    confirmLabel="OK"
                    onConfirm={() => setAlertSuccess(false)}
                />
            )}

            {isAlertError && (
                <AlertError
                    title="Gagal!"
                    description={errorMessage}
                    confirmLabel="OK"
                    onConfirm={() => setAlertError(false)}
                />
            )}
        </LayoutWithNav>
    );
}