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
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import SearchableDropdown from '../../../components/SearchableDropdown';

export default function EditPemasukan() {
    // Get ID from both location state or URL params
    const location = useLocation();
    const params = useParams();
    const pemasukanId = location.state?.nomor || params.id;
    const fromLaporanKeuangan = location.state?.fromLaporanKeuangan || false;
    const navigate = useNavigate();

    const formatRupiah = (angka) => {
        if (!angka || isNaN(angka)) return '';
        let value = String(angka).replace(/\D/g, '');
        return value.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    };
    
    const unformatRupiah = (rupiah) => {
        return rupiah ? Number(rupiah.replace(/\./g, '')) : 0;
    };

    const breadcrumbItems = [
        { label: "Daftar Pemasukan", href: "/pemasukan" },
        { label: "Edit Pemasukan", href: "" },
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

    const [tableRows, setTableRows] = useState([]);
    const [isLoading, setLoading] = useState(false);
    const [isLoadingData, setLoadingData] = useState(true);
    const [isAlertSuccess, setAlertSuccess] = useState(false);
    const [isAlertError, setAlertError] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    // Reference data
    const [kategoriOptions, setKategoriOptions] = useState([]);
    const [metodeOptions, setMetodeOptions] = useState([]);
    const [tokoOptions, setTokoOptions] = useState([]);
    const [cabangOptionsByToko, setCabangOptionsByToko] = useState({});
    
    // Raw data from API
    const [pemasukanData, setPemasukanData] = useState(null);
    
    // Track loading states for reference data
    const [refDataLoaded, setRefDataLoaded] = useState({
        kategori: false,
        metode: false,
        toko: false
    });

    const cashOptions = [
        { label: 'Cash', value: true },
        { label: 'Non-Cash', value: false }
    ];

    // First, load all reference data
    useEffect(() => {
        if (!pemasukanId) {
            navigate('/pemasukan');
            return;
        }

        const loadReferenceData = async () => {
            try {
                // Fetch pemasukan data first
                const pemasukanResponse = await api.get(`/pemasukan/${pemasukanId}`);
                if (pemasukanResponse.data.success) {
                    setPemasukanData(pemasukanResponse.data.data);
                }

                // Fetch all reference data
                await Promise.all([
                    fetchKategoriPemasukan(),
                    fetchMetodePembayaran(),
                    fetchToko()
                ]);
            } catch (error) {
                console.error('Error loading data:', error);
                setErrorMessage('Terjadi kesalahan saat memuat data referensi');
                setAlertError(true);
            }
        };

        loadReferenceData();
    }, [pemasukanId, navigate]);

    // Second useEffect to process data once all reference data is loaded
    useEffect(() => {
        const allRefDataLoaded = refDataLoaded.kategori && 
                                refDataLoaded.metode && 
                                refDataLoaded.toko;
        
        if (allRefDataLoaded && pemasukanData) {
            processPemasukanData();
        }
    }, [refDataLoaded, pemasukanData]);

    // Process the pemasukan data once reference data is available
    const processPemasukanData = async () => {
        try {
            setLoadingData(true);
            const data = pemasukanData;
            
            // Find kategori_pemasukan_id based on kategori_pemasukan name
            let kategoriId = '';
            const matchingKategori = kategoriOptions.find(
                option => option.label === data.kategori_pemasukan
            );
            if (matchingKategori) {
                kategoriId = matchingKategori.value;
            } else {
                console.warn('Could not find matching kategori:', data.kategori_pemasukan);
            }
            
            // Find metode_id based on metode name
            let metodeId = '';
            const matchingMetode = metodeOptions.find(
                option => option.label === data.metode
            );
            if (matchingMetode) {
                metodeId = matchingMetode.value;
            } else if (!data.cash_or_non) {
                console.warn('Could not find matching metode:', data.metode);
            }
            
            // Calculate subtotal and potongan
            const subtotal = data.deskripsi_pemasukan.reduce(
                (sum, item) => sum + (item.jumlah_pemasukan || 0), 0
            );
            const potongan = subtotal - data.total;
            
            setFormData({
                nomor: data.pemasukan_id,
                tanggal: data.tanggal.slice(0, 19), // Format to YYYY-MM-DDTHH:MM:SS
                kategori_pemasukan_id: kategoriId,
                cash_or_non: data.cash_or_non,
                metode_id: metodeId,
                potongan: potongan,
                potongan_formatted: formatRupiah(potongan)
            });
            
            // Create a map to store Promise results (not just promises)
            // This will help us access the actual cabang options when processing rows
            const fetchedCabangOptions = {};
            const tokoIdMap = {};
            
            // First, get all the toko IDs we need to fetch
            for (const item of data.deskripsi_pemasukan) {
                const matchingToko = tokoOptions.find(
                    option => option.label === item.toko
                );
                
                if (matchingToko && matchingToko.value) {
                    tokoIdMap[item.toko] = matchingToko.value;
                }
            }
            
            // Fetch all cabang data in parallel
            const fetchPromises = Object.values(tokoIdMap).map(async (tokoId) => {
                if (!cabangOptionsByToko[tokoId]) {
                    const options = await fetchCabangByToko(tokoId);
                    fetchedCabangOptions[tokoId] = options;
                } else {
                    fetchedCabangOptions[tokoId] = cabangOptionsByToko[tokoId];
                }
            });
            
            // Wait for all cabang data to be fetched
            await Promise.all(fetchPromises);
            
            // Now that all cabang data is loaded, process rows
            const rows = [];
            for (const item of data.deskripsi_pemasukan) {
                let tokoId = '';
                let cabangId = null;
                
                // Find toko_id based on toko name
                const matchingToko = tokoOptions.find(
                    option => option.label === item.toko
                );
                
                if (matchingToko) {
                    tokoId = matchingToko.value;
                    
                    // Find cabang_id based on cabang name
                    if (item.cabang) {
                        const cabangOptions = fetchedCabangOptions[tokoId] || 
                                            cabangOptionsByToko[tokoId] || 
                                            [];
                        
                        // Skip the first option which is "Pilih Cabang"
                        const filteredOptions = cabangOptions.slice(1);
                        
                        const matchingCabang = filteredOptions.find(
                            option => option.label === item.cabang
                        );
                        
                        if (matchingCabang) {
                            cabangId = matchingCabang.value;
                            console.log('Found matching cabang:', item.cabang, 'with ID:', cabangId);
                        } else {
                            console.warn('Could not find matching cabang:', item.cabang, 'in options:', filteredOptions);
                        }
                    }
                } else {
                    console.warn('Could not find matching toko:', item.toko);
                }
                
                rows.push({
                    id: Date.now() + rows.length, // Generate unique ID
                    deskripsi: item.deskripsi,
                    toko_id: tokoId,
                    cabang_id: cabangId,
                    jumlah_pemasukan: item.jumlah_pemasukan,
                    jumlah_pemasukan_formatted: formatRupiah(item.jumlah_pemasukan)
                });
            }
            
            // Log the rows to verify the cabang_id is correctly set
            console.log('Prepared table rows:', rows);
            
            setTableRows(rows);
        } catch (error) {
            console.error('Error processing pemasukan data:', error);
            setErrorMessage('Terjadi kesalahan saat memproses data');
            setAlertError(true);
        } finally {
            setLoadingData(false);
        }
    };

    const fetchKategoriPemasukan = async () => {
        try {
            const response = await api.get('/kategori-pemasukan');
            if (response.data.success) {
                const options = response.data.data.map(item => ({
                    value: item.kategori_pemasukan_id,
                    label: item.kategori_pemasukan
                }));
                setKategoriOptions([{ value: '', label: 'Pilih Kategori Pemasukan' }, ...options]);
                setRefDataLoaded(prev => ({ ...prev, kategori: true }));
            }
        } catch (error) {
            console.error('Error fetching kategori pemasukan:', error);
            setRefDataLoaded(prev => ({ ...prev, kategori: true })); // Mark as loaded even on error
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
                setRefDataLoaded(prev => ({ ...prev, metode: true }));
            }
        } catch (error) {
            console.error('Error fetching metode pembayaran:', error);
            setRefDataLoaded(prev => ({ ...prev, metode: true })); // Mark as loaded even on error
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
                setRefDataLoaded(prev => ({ ...prev, toko: true }));
            }
        } catch (error) {
            console.error('Error fetching toko:', error);
            setRefDataLoaded(prev => ({ ...prev, toko: true })); // Mark as loaded even on error
        }
    };

    const fetchCabangByToko = async (tokoId) => {
        if (!tokoId) return [];
        
        // Return existing cabang options if already loaded
        if (cabangOptionsByToko[tokoId]) {
            return cabangOptionsByToko[tokoId];
        }
        
        try {
            console.log('Fetching cabang data for toko ID:', tokoId);
            const response = await api.get(`/cabang?toko_id=${tokoId}`);
            if (response.data.success) {
                const options = response.data.data.map(item => ({
                    value: item.cabang_id,
                    label: item.nama_cabang
                }));
                
                console.log('Fetched cabang options:', options);
                
                const cabangOptions = [{ value: null, label: '- Pilih Cabang -' }, ...options];
                
                // Update state with new cabang options
                setCabangOptionsByToko(prev => {
                    const updated = {
                        ...prev,
                        [tokoId]: cabangOptions
                    };
                    console.log('Updated cabangOptionsByToko:', updated);
                    return updated;
                });

                return cabangOptions;
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
        if (field === 'toko_id' && value) {
            if (!cabangOptionsByToko[value]) {
                fetchCabangByToko(value);
            }
            
            setTableRows(prev => prev.map(row => {
                if (row.id === id) {
                    return { 
                        ...row, 
                        [field]: value,
                        cabang_id: null 
                    };
                }
                return row;
            }));
        } else if (field === 'jumlah_pemasukan') {
            const numericValue = unformatRupiah(value);
            setTableRows(prev => prev.map(row => {
                if (row.id === id) {
                    return { 
                        ...row, 
                        [field]: numericValue,
                        jumlah_pemasukan_formatted: formatRupiah(numericValue)
                    };
                }
                return row;
            }));
        } else {
            setTableRows(prev => prev.map(row => {
                if (row.id === id) {
                    return { ...row, [field]: value };
                }
                return row;
            }));
        }
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

    const SearchableInputDropdown = ({ label, options, value, onSelect, required, disabled, className }) => {
        return (
            <div className={`mb-4 ${className || ''}`}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    {label} {required && <span className="text-red-500">*</span>}
                </label>
                <SearchableDropdown
                    options={options}
                    value={value}
                    onChange={onSelect}
                    disabled={disabled}
                    required={required}
                />
            </div>
        );
    };

    const tableData = tableRows.map((row, index) => {
        return {
            no: index + 1,
            deskripsi: (
                <input
                    type="text"
                    value={row.deskripsi}
                    onChange={(e) => handleRowChange(row.id, 'deskripsi', e.target.value)}
                    className="w-full p-1 border border-gray-300 rounded focus:outline-none focus:border-primary"
                    placeholder="Deskripsi pemasukan"
                />
            ),
            toko: (
                <SearchableDropdown
                    options={tokoOptions}
                    value={row.toko_id}
                    onChange={(option) => handleRowChange(row.id, 'toko_id', option.value)}
                    placeholder="Pilih Toko"
                    className="w-full"
                />
            ),
            cabang: (
                <SearchableDropdown
                    options={row.toko_id && cabangOptionsByToko[row.toko_id] ? cabangOptionsByToko[row.toko_id] : [{ value: '', label: 'Pilih Toko Dulu' }]}
                    value={row.cabang_id || ''}
                    onChange={(option) => handleRowChange(row.id, 'cabang_id', option.value === '' ? null : option.value)}
                    placeholder="Pilih Cabang"
                    className="w-full"
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
                        className="w-full p-1 pl-8 border border-gray-300 rounded focus:outline-none focus:border-primary text-right"
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
                total: calculateTotal(),
                deskripsi_pemasukan: deskripsiPemasukan
            };

            console.log('Payload:', payload);

            const response = await api.put(`/pemasukan/${pemasukanId}`, payload);
            
            if (response.data.success) {
                setAlertSuccess(true);
                setTimeout(() => {
                    if (fromLaporanKeuangan) {
                        navigate('/laporanKeuangan');
                    } else {
                        navigate('/pemasukan');
                    }
                }, 1500);
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

    // const handleCancel = () => {
    //     navigate('/pemasukan');
    // };

    if (isLoadingData) {
        return (
            <LayoutWithNav>
                <div className="p-5 flex justify-center items-center h-screen">
                    <Spinner />
                </div>
            </LayoutWithNav>
        );
    }

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
                            <SearchableInputDropdown
                                label="Kategori"
                                options={kategoriOptions}
                                value={formData.kategori_pemasukan_id}
                                onSelect={(option) => handleInputChange('kategori_pemasukan_id', option.value)}
                                required
                            />
                            <SearchableInputDropdown
                                label="Cash/Non-Cash"
                                options={cashOptions}
                                value={formData.cash_or_non}
                                onSelect={(option) => handleInputChange('cash_or_non', option.value)}
                                required
                            />
                            <SearchableInputDropdown
                                label="Metode Pembayaran"
                                options={metodeOptions}
                                value={formData.metode_id}
                                onSelect={(option) => handleInputChange('metode_id', option.value)}
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
                                    text_header="text-gray-700"
                                />
                            )}

                            <div className="mt-4">
                                <button
                                    onClick={addNewRow}
                                    className="flex items-center text-primary hover:text-primary-dark"
                                >
                                    <span className="mr-2 text-xl">+</span>
                                    <span className="text-primary">Tambah Baris</span>
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
                                                className="w-full p-1 pl-8 border border-gray-300 rounded focus:outline-none focus:border-primary text-right"
                                                placeholder="0"
                                            />
                                        </div>
                                        
                                        <div className="text-right font-medium">Total</div>
                                        <div className="text-right font-bold">Rp{formatRupiah(calculateTotal())}</div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 flex justify-end space-x-4">
                                <button 
                                    className="w-1/3 bg-primary text-white py-2 rounded-lg hover:bg-primary/90 transition-colors"
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
                    description="Data pemasukan berhasil diperbarui"
                    confirmLabel="OK"
                    onConfirm={() => setAlertSuccess(false)}
                />
            )}

            {isAlertError && (
                <AlertError
                    title="Gagal!"
                    description={errorMessage}
                    confirmLabel="OK"
                    onConfirm={() => setAlertError(true)}
                />
            )}
        </LayoutWithNav>
    );
}