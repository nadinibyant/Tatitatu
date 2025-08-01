import { useState, useEffect } from 'react';
import Breadcrumbs from '../../../components/Breadcrumbs';
import Input from '../../../components/Input';
import InputDropdown from '../../../components/InputDropdown';
import Table from '../../../components/Table';
import Button from '../../../components/Button';
import TextArea from '../../../components/Textarea';
import Gallery2 from '../../../components/Gallery2';
import AlertSuccess from '../../../components/AlertSuccess';
import Spinner from '../../../components/Spinner';
import { useNavigate } from 'react-router-dom';
import LayoutWithNav from '../../../components/LayoutWithNav';
import api from '../../../utils/api';
import AlertError from '../../../components/AlertError';

const TambahPenjualanCustom = () => {
    // const formatDateTimeForInput = (dateString) => {
    //     const date = new Date(dateString);
    //     return date.toLocaleString('sv').slice(0, 16).replace(' ', 'T');
    // };

    const [errorMessage, setErrorMessage] = useState(null);
    const [nomor, setNomor] = useState('');
    const [tanggal, setTanggal] = useState(() => {
        const now = new Date();
        
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        
        return `${year}-${month}-${day}T${hours}:${minutes}`;
    });
    const [namaPembeli, setNamaPembeli] = useState('');
    const [note, setNote] = useState('');
    const [selectedBayar, setSelectedBayar] = useState('');
    const [selectedMetode, setSelectedMetode] = useState('');
    const [diskon, setDiskon] = useState(0);
    const [pajak, setPajak] = useState(0);
    const [dataProduk, setDataProduk] = useState([
        { nama: 'Rincian Jumlah dan Bahan', data: [] },
        { nama: 'Rincian Biaya', data: [] },
        { nama: 'Packaging', data: [] },
    ]);
    const [modalContent, setModalContent] = useState('produk');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [activeTable, setActiveTable] = useState(null);
    const [selectedItems, setSelectedItems] = useState([]);
    const [isLoading, setLoading] = useState(false);
    const [isModalSucc, setModalSucc] = useState(false);
    const [isMetodeDisabled, setIsMetodeDisabled] = useState(false);
    const userData = JSON.parse(localStorage.getItem('userData'));
    const isAdminGudang = userData?.role === 'admingudang';
    const toko_id = userData.tokoId
    const cabang_id = userData.userId

    // Tambahkan state untuk pagination dan search produk custom dan packaging
    const [paginationProduk, setPaginationProduk] = useState({ page: 1, limit: 12, total: 0 });
    const [paginationPackaging, setPaginationPackaging] = useState({ page: 1, limit: 12, total: 0 });
    const [searchProdukInput, setSearchProdukInput] = useState("");
    const [searchProduk, setSearchProduk] = useState("");
    const [searchPackagingInput, setSearchPackagingInput] = useState("");
    const [searchPackaging, setSearchPackaging] = useState("");
    const [dataBarangPaginated, setDataBarangPaginated] = useState([]);
    const [dataPackagingPaginated, setDataPackagingPaginated] = useState([]);
    
    const [allBarangOptions, setAllBarangOptions] = useState([]);
    const [allPackagingOptions, setAllPackagingOptions] = useState([]);

    useEffect(() => {
        if (isModalOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isModalOpen]);

    const calculateSubtotal = () => {
        return dataProduk.slice(0, 2).reduce((acc, table) => {
            const totalTable = table.data.reduce((tabAcc, row) => {
                return tabAcc + (row.rawTotalBiaya || 0);
            }, 0);
            return acc + totalTable;
        }, 0);
    };

    const calculateTotalPenjualan = (subtotal) => {
        const diskonNominal = (diskon / 100) * subtotal;
        return subtotal - diskonNominal - pajak;
    };

    const handleSelectBayar = (selectedOption) => {
        setSelectedBayar(selectedOption.value);
        if (selectedOption.value === 1) { 
            setSelectedMetode(1); 
            setIsMetodeDisabled(true);
        } else {
            setIsMetodeDisabled(false);
        }
    };

    const handleSelectMetode = (selectedOption) => {
        setSelectedMetode(selectedOption.value);
    };

    const breadcrumbItems = isAdminGudang 
    ? [
        { label: "Daftar Penjualan Toko", href: "/penjualan-admin-gudang" },
        { label: "Tambah Penjualan Custom", href: "" },
    ]
    : [
        { label: "Daftar Penjualan Toko", href: "/penjualan-kasir" },
        { label: "Tambah Penjualan Custom", href: "" },
    ];

    // Regular headers for product tables
    const headers = [
        { label: 'No', key: 'No', align: 'text-left' },
        { label: 'Foto Produk', key: 'Foto Produk', align: 'text-left' },
        { label: 'Nama Barang', key: 'Nama Barang', align: 'text-left' },
        { label: 'Harga Satuan', key: 'Harga Satuan', align: 'text-left' },
        { label: 'Kuantitas', key: 'Kuantitas', align: 'text-left', width:'110px' },
        { label: 'Total Biaya', key: 'Total Biaya', align: 'text-left' },
        { label: 'Aksi', key: 'Aksi', align: 'text-left' },
    ];

    const packagingHeaders = [
        { label: 'No', key: 'No', align: 'text-left' },
        { label: 'Foto Produk', key: 'Foto Produk', align: 'text-left' },
        { label: 'Nama Barang', key: 'Nama Barang', align: 'text-left' },
        { label: 'Kuantitas', key: 'Kuantitas', align: 'text-left', width:'110px' },
        { label: 'Aksi', key: 'Aksi', align: 'text-left' },
    ];

    const getRincianBiayaHeaders = () => [
        { label: 'No', key: 'No', align: 'text-left' },
        { label: 'Nama Biaya', key: 'Nama Biaya', align: 'text-left' },
        { label: 'Jumlah Biaya', key: 'Jumlah Biaya', align: 'text-left', width: '300px' },
        { label: 'Aksi', key: 'Aksi', align: 'text-left' },
    ];

    const getHeadersForTable = (index) => {
        if (index === 1) return getRincianBiayaHeaders();
        if (index === 2) return packagingHeaders;
        return headers;
    };

    const handleNamaBiayaChange = (tableIndex, itemId, value) => {
        const tables = [...dataProduk];
        const itemIndex = tables[tableIndex].data.findIndex(
            (data) => data.id === itemId
        );
        if (itemIndex !== -1) {
            tables[tableIndex].data[itemIndex]["Nama Biaya"] = (
                <Input
                    showRequired={false}
                    type="text"
                    value={value}
                    onChange={(v) => handleNamaBiayaChange(tableIndex, itemId, v)}
                />
            );
            setDataProduk(tables);
        }
    };

    const handleJumlahBiayaChange = (tableIndex, itemId, value) => {
        const tables = [...dataProduk];
        const itemIndex = tables[tableIndex].data.findIndex(
            (data) => data.id === itemId
        );
        if (itemIndex !== -1) {
            const numValue = Number(value);
            tables[tableIndex].data[itemIndex].rawTotalBiaya = numValue;
            tables[tableIndex].data[itemIndex]["Jumlah Biaya"] = (
                <Input
                    showRequired={false}
                    type="number"
                    value={numValue}
                    onChange={(v) => handleJumlahBiayaChange(tableIndex, itemId, v)}
                />
            );
            setDataProduk(tables);
        }
    };

    const btnAddBaris = (tableIndex) => {
        setActiveTable(tableIndex);
        if (tableIndex === 1) { 
            const newItem = {
                id: Date.now(),
                No: dataProduk[tableIndex].data.length + 1,
                "Nama Biaya": (
                    <Input
                        showRequired={false}
                        type="text"
                        value=""
                        onChange={(value) => handleNamaBiayaChange(tableIndex, newItem.id, value)}
                    />
                ),
                "Jumlah Biaya": (
                    <Input
                        showRequired={false}
                        type="number"
                        value={0}
                        onChange={(value) => handleJumlahBiayaChange(tableIndex, newItem.id, value)}
                    />
                ),
                rawTotalBiaya: 0,
                Aksi: (
                    <button
                        className="text-red-500 hover:text-red-700"
                        onClick={() => handleDeleteItem(tableIndex, newItem.id)}
                    >
                        Hapus
                    </button>
                )
            };
            const updatedDataTables = [...dataProduk];
            updatedDataTables[tableIndex].data.push(newItem);
            setDataProduk(updatedDataTables);
        } else if (tableIndex === 2) { 
            setIsModalOpen(true);
            setModalContent('packaging');
        } else {
            setIsModalOpen(true);
            setModalContent('produk');
        }
    };

    // Fetch all barang custom untuk dropdown options (tanpa pagination)
    const fetchAllBarangCustom = async () => {
        try {
            const response = await api.get(`/barang-custom?toko_id=${toko_id}&limit=1000`);
            if (response.data.success) {
                const items = response.data.data.filter(item => !item.is_deleted).map(item => ({
                    id: item.barang_custom_id,
                    image: `${import.meta.env.VITE_API_URL}/images-barang-custom/${item.image}`,
                    name: item.nama_barang,
                    code: item.barang_custom_id,
                    price: item.harga_jual,
                    jenis: item.jenis_barang.nama_jenis_barang,
                    kategori: item.kategori.nama_kategori_barang,
                    stock: item.stok_barang?.jumlah_stok || 0
                }));
                setAllBarangOptions(items);
            }
        } catch (error) {
            console.error('Error fetching all barang custom:', error);
            setAllBarangOptions([]);
        }
    };

    // Fetch all packaging untuk dropdown options (tanpa pagination)
    const fetchAllPackaging = async () => {
        try {
            const response = await api.get(`/packaging?toko_id=${toko_id}&limit=1000`);
            if (response.data.success) {
                const items = response.data.data.filter(item => !item.is_deleted).map(item => ({
                    id: item.packaging_id,
                    name: item.nama_packaging,
                    price: 0,
                    image: item.image 
                        ? `${import.meta.env.VITE_API_URL}/images-packaging/${item.image}`
                        : "/placeholder-image.jpg",
                    jenis: item.jenis_barang.nama_jenis_barang,
                    kategori: item.kategori_barang.nama_kategori_barang,
                    ukuran: item.ukuran,
                    stock: item.stok_barang?.jumlah_stok || 0
                }));
                setAllPackagingOptions(items);
            }
        } catch (error) {
            console.error('Error fetching all packaging:', error);
            setAllPackagingOptions([]);
        }
    };

    // Refactor fetchBarangCustom untuk support pagination dan search
    const fetchBarangCustom = async ({ page, limit, search }) => {
        try {
            setLoading(true);
            let params = [`toko_id=${toko_id}`, `page=${page}`, `limit=${limit}`];
            if (search) params.push(`search=${encodeURIComponent(search)}`);
            const response = await api.get(`/barang-custom?${params.join('&')}`);
            if (response.data.success) {
                const items = response.data.data.filter(item => !item.is_deleted).map(item => ({
                    id: item.barang_custom_id,
                    image: `${import.meta.env.VITE_API_URL}/images-barang-custom/${item.image}`,
                    name: item.nama_barang,
                    code: item.barang_custom_id,
                    price: item.harga_jual,
                    jenis: item.jenis_barang.nama_jenis_barang,
                    kategori: item.kategori.nama_kategori_barang,
                    stock: item.stok_barang?.jumlah_stok || 0
                }));
                setDataBarangPaginated(items);
                setPaginationProduk(prev => ({
                    ...prev,
                    total: response.data.pagination?.totalItems ?? items.length
                }));
            }
        } catch {
            setDataBarangPaginated([]);
            setPaginationProduk(prev => ({ ...prev, total: 0 }));
        } finally {
            setLoading(false);
        }
    };

    // Refactor fetchPackaging untuk support pagination dan search
    const fetchPackagingPaginated = async ({ page, limit, search }) => {
        try {
            setLoading(true);
            let params = [`toko_id=${toko_id}`, `page=${page}`, `limit=${limit}`];
            if (search) params.push(`search=${encodeURIComponent(search)}`);
            const response = await api.get(`/packaging?${params.join('&')}`);
            if (response.data.success) {
                const items = response.data.data.filter(item => !item.is_deleted).map(item => ({
                    id: item.packaging_id,
                    name: item.nama_packaging,
                    price: 0,
                    image: item.image 
                        ? `${import.meta.env.VITE_API_URL}/images-packaging/${item.image}`
                        : "/placeholder-image.jpg",
                    jenis: item.jenis_barang.nama_jenis_barang,
                    kategori: item.kategori_barang.nama_kategori_barang,
                    ukuran: item.ukuran,
                    stock: item.stok_barang?.jumlah_stok || 0
                }));
                setDataPackagingPaginated(items);
                setPaginationPackaging(prev => ({
                    ...prev,
                    total: response.data.pagination?.totalItems ?? items.length
                }));
            }
        } catch {
            setDataPackagingPaginated([]);
            setPaginationPackaging(prev => ({ ...prev, total: 0 }));
        } finally {
            setLoading(false);
        }
    };

    const handleSelectItem = (item, count) => {
        setSelectedItems((prev) => {
            const updated = [...prev];
            const existingItem = updated.find((i) => i.id === item.id);
            if (existingItem) {
                if (count === 0) {
                    return updated.filter((i) => i.id !== item.id);
                } else {
                    existingItem.count = count;
                }
            } else {
                updated.push({ ...item, count });
            }
            return updated;
        });
    };

    const handleBarangChange = (tableIndex, itemId, selectedOption) => {
        const updatedTables = [...dataProduk];
        const itemIndex = updatedTables[tableIndex].data.findIndex(
            (data) => data.id === itemId
        );
    
        if (itemIndex !== -1) {
            const selectedBarang = allBarangOptions.find(barang => barang.id === selectedOption.value);
            
            if (selectedBarang) {
                const currentQuantity = updatedTables[tableIndex].data[itemIndex].quantity || 1;
                const newTotalBiaya = selectedBarang.price * currentQuantity;
                
                updatedTables[tableIndex].data[itemIndex] = {
                    ...updatedTables[tableIndex].data[itemIndex],
                    "Foto Produk": (
                        <img
                            src={selectedBarang.image}
                            alt={selectedBarang.name}
                            className="w-12 h-12"
                        />
                    ),
                    "Nama Barang": (
                        <InputDropdown
                            showRequired={false}
                            options={allBarangOptions.map(prod => ({
                                value: prod.id,
                                label: prod.name
                            }))}
                            value={selectedOption.value}
                            onSelect={(newSelection) => handleBarangChange(tableIndex, itemId, newSelection)}
                        />
                    ),
                    "Harga Satuan": `Rp${selectedBarang.price.toLocaleString()}`,
                    "Total Biaya": `Rp${newTotalBiaya.toLocaleString()}`,
                    rawTotalBiaya: newTotalBiaya,
                    currentPrice: selectedBarang.price
                };
                setDataProduk(updatedTables);
            }
        }
    };
    
    const handleModalSubmit = () => {
        if (activeTable !== null) {
            const updatedTables = [...dataProduk];
            const newItems = selectedItems.map((item) => {
                const isPackaging = activeTable === 2;
                
                // Create a base item with common properties
                const baseItem = {
                    id: item.id,
                    No: updatedTables[activeTable].data.length + 1,
                    "Foto Produk": (
                        <img
                            src={item.image}
                            alt={item.name}
                            className="w-12 h-12"
                        />
                    ),
                    quantity: item.count,
                    Aksi: (
                        <button
                            className="text-red-500 hover:text-red-700"
                            onClick={() => handleDeleteItem(activeTable, item.id)}
                        >
                            Hapus
                        </button>
                    ),
                };
                
                if (isPackaging) {
                    return {
                        ...baseItem,
                        "Nama Barang": (
                            <InputDropdown
                                showRequired={false}
                                options={allPackagingOptions.map(pkg => ({
                                    value: pkg.id,
                                    label: `${pkg.name} - ${pkg.ukuran}`
                                }))}
                                value={item.id}
                                onSelect={(selectedItem) => handlePackagingChange(activeTable, item.id, selectedItem)}
                            />
                        ),
                        "Kuantitas": (
                            <Input
                                showRequired={false}
                                type="number"
                                value={item.count}
                                onChange={(newCount) => {
                                    const updatedTablesCopy = [...dataProduk];
                                    const itemIndex = updatedTablesCopy[activeTable].data.findIndex(
                                        (row) => row.id === item.id
                                    );
            
                                    if (itemIndex !== -1) {
                                        const numericCount = Number(newCount) || 0;
                                        updatedTablesCopy[activeTable].data[itemIndex].quantity = numericCount;
                                        setDataProduk(updatedTablesCopy);
                                    }
                                }}
                            />
                        ),
                    };
                } else {
                    const totalBiaya = item.price * item.count;
                    return {
                        ...baseItem,
                        "Nama Barang": (
                            <InputDropdown
                                showRequired={false}
                                options={allBarangOptions.map(prod => ({
                                    value: prod.id,
                                    label: prod.name
                                }))}
                                value={item.id}
                                onSelect={(selectedItem) => handleBarangChange(activeTable, item.id, selectedItem)}
                            />
                        ),
                        "Harga Satuan": `Rp${item.price.toLocaleString()}`,
                        "Kuantitas": (
                            <Input
                                showRequired={false}
                                type="number"
                                value={item.count}
                                onChange={(newCount) => {
                                    const updatedTablesCopy = [...dataProduk];
                                    const itemIndex = updatedTablesCopy[activeTable].data.findIndex(
                                        (row) => row.id === item.id
                                    );
            
                                    if (itemIndex !== -1) {
                                        const currentPrice = updatedTablesCopy[activeTable].data[itemIndex].currentPrice || item.price;
                                        const numericCount = Number(newCount) || 0;
                                        updatedTablesCopy[activeTable].data[itemIndex].quantity = numericCount;
                                        const newTotal = currentPrice * numericCount;
                                        updatedTablesCopy[activeTable].data[itemIndex].rawTotalBiaya = newTotal;
                                        updatedTablesCopy[activeTable].data[itemIndex]["Total Biaya"] = `Rp${newTotal.toLocaleString()}`;
                                        setDataProduk(updatedTablesCopy);
                                    }
                                }}
                            />
                        ),
                        "Total Biaya": `Rp${totalBiaya.toLocaleString()}`,
                        rawTotalBiaya: totalBiaya,
                        currentPrice: item.price,
                    };
                }
            });
            
            updatedTables[activeTable].data.push(...newItems);
            setDataProduk(updatedTables);
        }
        setIsModalOpen(false);
        setSelectedItems([]);
    };

    const handleDeleteItem = (tableIndex, itemId) => {
        const updatedTables = [...dataProduk];
        updatedTables[tableIndex].data = updatedTables[tableIndex].data.filter(
            (item) => item.id !== itemId
        );
        setDataProduk(updatedTables);
    };

    const dataBayar = [
        { value: 1, label: 'Cash' },
        { value: 2, label: 'Non-Cash' }
    ];

    const [dataMetode, setDataMetode] = useState([
        { value: 1, label: '-' }, 
    ]);
    
    const fetchMetodePembayaran = async () => {
        try {
            const response = await api.get(`/metode-pembayaran?toko_id=${toko_id}`);
            if (response.data.success) {
                const metodeOptions = response.data.data
                    .filter(metode => !metode.is_deleted)
                    .map(metode => ({
                        value: metode.metode_id,
                        label: metode.nama_metode
                    }));
                setDataMetode([
                    { value: 1, label: '-' },
                    ...metodeOptions
                ]);
            }
        } catch (error) {
            console.error('Error fetching metode pembayaran:', error);
        }
    };

    useEffect(() => {
        fetchMetodePembayaran();
        fetchAllBarangCustom();
        fetchAllPackaging();
    }, []);

    const handlePackagingChange = (tableIndex, itemId, selectedOption) => {
        const updatedTables = [...dataProduk];
        const itemIndex = updatedTables[tableIndex].data.findIndex(
            (data) => data.id === itemId
        );
    
        if (itemIndex !== -1) {
            const selectedPackaging = allPackagingOptions.find(pkg => pkg.id === selectedOption.value);
            
            if (selectedPackaging) {
                const currentQuantity = updatedTables[tableIndex].data[itemIndex].quantity || 1;
                
                updatedTables[tableIndex].data[itemIndex] = {
                    ...updatedTables[tableIndex].data[itemIndex],
                    id: selectedOption.value,
                    "Foto Produk": (
                        <img
                            src={selectedPackaging.image}
                            alt={selectedPackaging.name}
                            className="w-12 h-12"
                        />
                    ),
                    "Nama Barang": (
                        <InputDropdown
                            showRequired={false}
                            options={allPackagingOptions.map(pkg => ({
                                value: pkg.id,
                                label: `${pkg.name} - ${pkg.ukuran}`
                            }))}
                            value={selectedOption}
                            onSelect={(newSelection) => handlePackagingChange(tableIndex, itemId, newSelection)}
                        />
                    ),
                    quantity: currentQuantity
                };
                setDataProduk(updatedTables);
            }
        }
    };

    const subtotal = calculateSubtotal();
    const totalPenjualan = calculateTotalPenjualan(subtotal);
    const navigate = useNavigate();

    const handleTambahSubmit = async (e) => {
        e.preventDefault();

        if (!selectedBayar) {
            setErrorMessage({
                title: 'Pilih Cara Bayar',
                description: 'Silakan pilih metode pembayaran Cash atau Non-Cash terlebih dahulu.'
            });
            return;
        }
    
        // Validasi metode pembayaran untuk Non-Cash
        if (selectedBayar === 2 && !selectedMetode) {
            setErrorMessage({
                title: 'Pilih Metode Pembayaran',
                description: 'Untuk pembayaran Non-Cash, silakan pilih metode pembayaran.'
            });
            return;
        }

        if (dataProduk[0].data.length === 0) {
            setErrorMessage({
                title: 'Rincian Jumlah dan Bahan Kosong',
                description: 'Silakan tambahkan minimal satu item di Rincian Jumlah dan Bahan.'
            });
            return;
        }
    
        // Validasi Rincian Biaya (Tabel 1)
        if (dataProduk[1].data.length === 0) {
            setErrorMessage({
                title: 'Rincian Biaya Kosong',
                description: 'Silakan tambahkan minimal satu item di Rincian Biaya.'
            });
            return;
        }
    
        // Validasi Rincian Jumlah dan Bahan (Tabel 0)
        if (dataProduk[0].data.length === 0) {
            setErrorMessage({
                title: 'Rincian Jumlah dan Bahan Kosong',
                description: 'Silakan tambahkan minimal satu item di Rincian Jumlah dan Bahan.'
            });
            return;
        }
    
        // Validasi setiap item di Rincian Jumlah dan Bahan
        const invalidProdukItems = dataProduk[0].data.some(item => 
            !item.id || !item.quantity || !item.rawTotalBiaya
        );
        if (invalidProdukItems) {
            setErrorMessage({
                title: 'Data Produk Tidak Lengkap',
                description: 'Pastikan semua item di Rincian Jumlah dan Bahan memiliki data lengkap.'
            });
            return;
        }

        try {
            setLoading(true);

            const produkCustom = dataProduk[0].data.map(item => ({
                barang_custom_id: item.id,
                harga_satuan: item.currentPrice,
                kuantitas: Number(item.quantity || 0),
                total_biaya: item.rawTotalBiaya
            }));
    
            const packagingItems = dataProduk[2].data.length > 0 
                ? dataProduk[2].data.map(item => {
                    const packagingId = item["Nama Barang"]?.props?.value?.value 
                        || item["Nama Barang"]?.props?.value 
                        || item.id;
    
                    return {
                        packaging_id: packagingId,
                        kuantitas: Number(item.quantity || 0),
                        harga_satuan: 0, // Setting price to 0 as requested
                        total_biaya: 0 // Setting total to 0 as requested
                    };
                }) 
                : [];

            const rincianBiaya = dataProduk[1].data.map(item => ({
                nama_biaya: typeof item["Nama Biaya"] === 'object' 
                    ? item["Nama Biaya"].props.value 
                    : item["Nama Biaya"],
                jumlah_biaya: item.rawTotalBiaya
            }));
    
            const produk = [
                ...produkCustom, 
                ...packagingItems
            ];

            // Validate only product items, not packaging
            const invalidItems = produkCustom.filter(item => 
                !item.kuantitas || 
                !item.harga_satuan || 
                !item.total_biaya || 
                !item.barang_custom_id
            );
    
            if (invalidItems.length > 0) {
                console.error('Invalid items:', invalidItems);
                throw new Error('Ada item yang tidak valid. Mohon periksa kembali semua kolom.');
            }
    
            const baseRequestBody = {
                cabang_id: cabang_id,
                tanggal: new Date(tanggal).toISOString(),
                nama_pembeli: namaPembeli,
                cash_or_non: selectedBayar === 1,
                catatan: note,
                sub_total: subtotal,
                diskon: Number(diskon),
                pajak: Number(pajak),
                total_penjualan: totalPenjualan,
                produk,
                rincian_biaya_custom: rincianBiaya,
                toko_id: toko_id
            };
    
            const requestBody = selectedBayar === 2 
                ? { ...baseRequestBody, metode_id: selectedMetode }
                : baseRequestBody;

            // console.log('Full Request Body:', JSON.stringify(requestBody, null, 2));

            const response = await api.post('/penjualan', requestBody);
            
            if (response.data.success) {
                setModalSucc(true);
            } else {
                console.error('API Error Response:', response.data);
                throw new Error(response.data.message || 'Gagal mengirim data');
            }
        } catch (error) {
            console.error('Error submitting data:', error);
            setErrorMessage({
                title: 'Gagal Menyimpan Data',
                description: error.message || 'Terjadi kesalahan saat menyimpan data.'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleAcc = () => {
        setModalSucc(false);
        navigate('/penjualan-kasir');
    };

    // Handler untuk search, limit, page produk custom
    const handleProdukSearchInputChange = (e) => setSearchProdukInput(e.target.value);
    const handleProdukSearchInputKeyDown = (e) => {
        if (e.key === 'Enter') {
            setSearchProduk(searchProdukInput);
            setPaginationProduk(prev => ({ ...prev, page: 1 }));
            fetchBarangCustom({ page: 1, limit: paginationProduk.limit, search: searchProdukInput });
        }
    };
    const handleProdukLimitChange = (limit) => {
        setPaginationProduk(prev => ({ ...prev, limit, page: 1 }));
        fetchBarangCustom({ page: 1, limit, search: searchProduk });
    };
    const handleProdukPageChange = (page) => {
        setPaginationProduk(prev => ({ ...prev, page }));
        fetchBarangCustom({ page, limit: paginationProduk.limit, search: searchProduk });
    };

    // Handler untuk search, limit, page packaging
    const handlePackagingSearchInputChange = (e) => setSearchPackagingInput(e.target.value);
    const handlePackagingSearchInputKeyDown = (e) => {
        if (e.key === 'Enter') {
            setSearchPackaging(searchPackagingInput);
            setPaginationPackaging(prev => ({ ...prev, page: 1 }));
            fetchPackagingPaginated({ page: 1, limit: paginationPackaging.limit, search: searchPackagingInput });
        }
    };
    const handlePackagingLimitChange = (limit) => {
        setPaginationPackaging(prev => ({ ...prev, limit, page: 1 }));
        fetchPackagingPaginated({ page: 1, limit, search: searchPackaging });
    };
    const handlePackagingPageChange = (page) => {
        setPaginationPackaging(prev => ({ ...prev, page }));
        fetchPackagingPaginated({ page, limit: paginationPackaging.limit, search: searchPackaging });
    };

    // Fetch data on modal open or pagination change
    useEffect(() => {
        if (isModalOpen && modalContent === 'produk') {
            fetchBarangCustom({ page: paginationProduk.page, limit: paginationProduk.limit, search: searchProduk });
        }
    }, [isModalOpen, modalContent, paginationProduk.page, paginationProduk.limit]);
    useEffect(() => {
        if (isModalOpen && modalContent === 'packaging') {
            fetchPackagingPaginated({ page: paginationPackaging.page, limit: paginationPackaging.limit, search: searchPackaging });
        }
    }, [isModalOpen, modalContent, paginationPackaging.page, paginationPackaging.limit]);

    const resetSelection = () => {
        setSelectedItems([]);
        setIsModalOpen(false);
    };

    return (
        <LayoutWithNav>
            <div className="p-5">
            <Breadcrumbs items={breadcrumbItems} />

            {/* Section Form Input */}
            <section className="bg-white p-5 mt-5 rounded-xl">
                <form onSubmit={handleTambahSubmit}>
                    <section>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Input label={'Nomor'} type1={'text'} disabled={true} value={nomor} onChange={(e) => setNomor(e)} />
                            <Input 
                                label="Tanggal dan Waktu" 
                                type1="datetime-local" 
                                value={tanggal}
                                onChange={(e) => setTanggal(e)}
                            />
                            <Input label={'Nama Pembeli'} required={false} value={namaPembeli} onChange={(e) => setNamaPembeli(e)} />
                            <InputDropdown 
                                label="Cash/Non-Cash"
                                options={dataBayar}
                                value={selectedBayar}
                                onSelect={handleSelectBayar}
                                required={true}
                            />
                            <div className="">
                            <InputDropdown 
                                label="Metode Pembayaran"
                                options={dataMetode}
                                value={selectedMetode}
                                onSelect={handleSelectMetode}
                                disabled={isMetodeDisabled}
                                required={true}
                            />
                            </div>
                        </div>
                    </section>

                    {/* Section Tambah Data Per Tabel */}
                    <section className="pt-10">
                        {dataProduk.map((table, index) => (
                            <div key={index} className="pt-5">
                                <p className="font-bold">{table.nama}</p>
                                <div className="pt-5">
                                    <Table 
                                        headers={getHeadersForTable(index)}
                                        data={table.data} 
                                    />
                                    <Button
                                        label="Tambah Baris"
                                        icon={
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                                            </svg>
                                        }
                                        onClick={() => btnAddBaris(index)}
                                        bgColor=""
                                        hoverColor="hover:border-primary hover:border"
                                        textColor="text-primary"
                                    />
                                </div>
                            </div>
                        ))}
                    </section>

                    {/* Section Total dan Submit */}
                    <section className="flex flex-col md:flex-row gap-8 p-4">
                        {/* Bagian Catatan */}
                        <div className="w-full md:w-2/4">
                            <TextArea
                                label="Catatan"
                                placeholder="Masukkan Catatan Di Sini"
                                required={true}
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                            />
                        </div>

                        {/* Bagian Ringkasan */}
                        <div className="w-full md:w-2/4">
                            <div className="space-y-4 text-sm p-4">
                                {/* Subtotal */}
                                <div className="flex justify-between border-b pb-2">
                                    <p className="font-bold">Subtotal</p>
                                    <p className="">Rp{subtotal.toLocaleString()}</p>
                                </div>
                                {/* Diskon Keseluruhan */}
                                <div className="flex justify-between items-center border-b pb-2">
                                    <p className="font-bold">Diskon Keseluruhan (%) </p>
                                    <div className="w-30">
                                        <Input
                                            type="number"
                                            showRequired={false}
                                            required={false}
                                            value={diskon}
                                            onChange={(e) => setDiskon(e)}
                                        />
                                    </div>
                                </div>
                                {/* Pajak */}
                                <div className="flex justify-between items-center border-b pb-2">
                                    <p className="font-bold">Potongan Harga</p>
                                    <div className="w-30">
                                        <Input
                                            type="number"
                                            showRequired={false}
                                            required={false}
                                            value={pajak}
                                            onChange={(e) => setPajak(e)}
                                        />
                                    </div>
                                </div>
                                {/* Total Penjualan */}
                                <div className="flex justify-between border-b pb-2">
                                    <p className="font-bold">Total Penjualan</p>
                                    <p className="font-bold">Rp{totalPenjualan.toLocaleString()}</p>
                                </div>
                                {/* Tombol Simpan */}
                                <div>
                                    <Button
                                        label="Simpan"
                                        bgColor="bg-primary w-full"
                                        hoverColor="hover:bg-white hover:border-primary hover:text-black hover:border"
                                        textColor="text-white"
                                        type="submit"
                                    />
                                </div>
                            </div>
                        </div>
                    </section>
                </form>

                {/* Modal Tambah Baris */}
                {isModalOpen && (
                <section className="fixed inset-0 bg-white bg-opacity-80 flex justify-center items-center z-50">
                    <div className="bg-white border border-primary rounded-md p-6 w-[90%] md:w-[70%] h-[90%] overflow-hidden">
                        {/* Search, X, Terpilih */}
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
                            <div className="relative w-full sm:max-w-md">
                                <span className="absolute inset-y-0 left-3 flex items-center">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="w-5 h-5 text-gray-400"
                                        fill="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path d="M20.707 19.293l-4.054-4.054A7.948 7.948 0 0016 9.5 8 8 0 108 17.5c1.947 0 3.727-.701 5.239-1.865l4.054 4.054a1 1 0 001.414-1.414zM10 15.5A6.5 6.5 0 1110 2a6.5 6.5 0 010 13.5z" />
                                    </svg>
                                </span>
                                <input
                                    type="text"
                                    placeholder={modalContent === 'packaging' ? "Cari Packaging" : "Cari Barang yang mau dibeli"}
                                    value={modalContent === 'packaging' ? searchPackagingInput : searchProdukInput}
                                    onChange={modalContent === 'packaging' ? handlePackagingSearchInputChange : handleProdukSearchInputChange}
                                    onKeyDown={modalContent === 'packaging' ? handlePackagingSearchInputKeyDown : handleProdukSearchInputKeyDown}
                                    className="w-full border border-gray-300 rounded-md py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-gray-500"
                                />
                            </div>
                            <div className="flex items-center space-x-4 self-end sm:self-auto">
                                <button
                                    onClick={() => {
                                        if (modalContent === 'packaging') {
                                            setSearchPackaging("");
                                            setSearchPackagingInput("");
                                        } else {
                                            setSearchProduk("");
                                            setSearchProdukInput("");
                                        }
                                        setSelectedItems([]);
                                    }}
                                    className="text-gray-400 hover:text-gray-700 focus:outline-none"
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-6 w-6"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                        strokeWidth={2}
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                                <p className="text-primary font-semibold">
                                    Terpilih {selectedItems.reduce((sum, item) => sum + item.count, 0)}
                                </p>
                            </div>
                        </div>
                        {/* Action buttons */}
                        <div className="flex justify-end gap-4 mb-4">
                            <Button
                                label="Batal"
                                bgColor="border border-secondary"
                                hoverColor="hover:bg-gray-100"
                                textColor="text-black"
                                onClick={() => {
                                    resetSelection();
                                    setSelectedItems([]);
                                }}
                            />
                            <Button
                                label="Pilih"
                                bgColor="bg-primary"
                                hoverColor="hover:bg-opacity-90"
                                textColor="text-white"
                                onClick={handleModalSubmit}
                            />
                        </div>
                        {/* Items per page */}
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-sm">Items per page:</span>
                            <select
                                value={modalContent === 'packaging' ? paginationPackaging.limit : paginationProduk.limit}
                                onChange={e => (modalContent === 'packaging' ? handlePackagingLimitChange(Number(e.target.value)) : handleProdukLimitChange(Number(e.target.value)))}
                                className="border rounded px-2 py-1 text-sm"
                            >
                                {[3, 12, 24, 48].map(opt => (
                                    <option key={opt} value={opt}>{opt}</option>
                                ))}
                            </select>
                        </div>
                        {/* Gallery */}
                        <div className="mt-2 h-[calc(100%-250px)] overflow-y-auto no-scrollbar">
                            {isLoading ? (
                                <div className="flex justify-center items-center h-40">
                                    <Spinner />
                                </div>
                            ) : (
                                <Gallery2
                                    items={modalContent === 'packaging' ? dataPackagingPaginated : dataBarangPaginated}
                                    onSelect={handleSelectItem}
                                    selectedItems={selectedItems}
                                    enableStockValidation={true}
                                />
                            )}
                        </div>
                        {/* Pagination */}
                        <div className="flex gap-2 items-center mt-2 justify-center">
                            <button
                                disabled={(modalContent === 'packaging' ? paginationPackaging.page : paginationProduk.page) === 1}
                                onClick={() => (modalContent === 'packaging' ? handlePackagingPageChange(paginationPackaging.page - 1) : handleProdukPageChange(paginationProduk.page - 1))}
                                className="px-2 py-1 border rounded disabled:opacity-50"
                            >
                                Prev
                            </button>
                            <span className="text-sm">
                                Halaman {(modalContent === 'packaging' ? paginationPackaging.page : paginationProduk.page)} dari {Math.max(1, Math.ceil((modalContent === 'packaging' ? paginationPackaging.total : paginationProduk.total) / (modalContent === 'packaging' ? paginationPackaging.limit : paginationProduk.limit)))}
                            </span>
                            <button
                                disabled={(modalContent === 'packaging' ? paginationPackaging.page : paginationProduk.page) >= Math.ceil((modalContent === 'packaging' ? paginationPackaging.total : paginationProduk.total) / (modalContent === 'packaging' ? paginationPackaging.limit : paginationProduk.limit))}
                                onClick={() => (modalContent === 'packaging' ? handlePackagingPageChange(paginationPackaging.page + 1) : handleProdukPageChange(paginationProduk.page + 1))}
                                className="px-2 py-1 border rounded disabled:opacity-50"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                </section>
            )}
            </section>

            {/* Modal Success */}
            {isModalSucc && (
                <AlertSuccess
                    title="Berhasil!!"
                    description="Data berhasil disimpan"
                    confirmLabel="OK"
                    onConfirm={handleAcc}
                />
            )}

            {isLoading && (
                <Spinner />
            )}

            {errorMessage && (
                <AlertError
                    title={errorMessage.title}
                    description={errorMessage.description}
                    onConfirm={() => setErrorMessage(null)}
                />
            )}
        </div>
        </LayoutWithNav>
    );
};

export default TambahPenjualanCustom;