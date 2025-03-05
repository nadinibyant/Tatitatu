import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import Breadcrumbs from '../../../components/Breadcrumbs';
import Input from '../../../components/Input';
import InputDropdown from '../../../components/InputDropdown';
import Table from '../../../components/Table';
import Button from '../../../components/Button';
import TextArea from '../../../components/Textarea';
import Gallery2 from '../../../components/Gallery2';
import AlertSuccess from '../../../components/AlertSuccess';
import Spinner from '../../../components/Spinner';
import LayoutWithNav from '../../../components/LayoutWithNav';
import api from '../../../utils/api';
import AlertError from '../../../components/AlertError';

const EditPenjualanCustomKasir = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const userData = JSON.parse(localStorage.getItem('userData'));
    const location = useLocation();
    const isAdminGudang = userData?.role === 'admingudang'
    const isHeadGudang = userData?.role === 'headgudang';
    const isOwner = userData?.role === 'owner';
    const isManajer = userData?.role === 'manajer';
    const isAdmin = userData?.role === 'admin';
    const isFinance = userData?.role === 'finance'

    const themeColor = (isAdminGudang || isHeadGudang) 
    ? "coklatTua" 
    : (isManajer || isOwner || isFinance) 
      ? "biruTua" 
      : "primary";

    const [errorMessage, setErrorMessage] = useState(null)
    const { toko_id: stateTokoId, cabang_id: stateCabangId, fromLaporanKeuangan } = location.state || {};

    // Form state
    const [formData, setFormData] = useState({
        nomor: '',
        tanggal: null,
        namaPembeli: '',
        note: '',
        selectBayar: '',
        selectMetode: '',
        diskon: 0,
        pajak: 0
    });

    // Raw detail data
    const [detailData, setDetailData] = useState({
        customProducts: [],
        biayaProducts: [],
        packagingProducts: []
    });

    // Reference data
    const [dataBarang, setDataBarang] = useState([]);
    const [dataPackaging, setDataPackaging] = useState([]);
    const [dataMetode, setDataMetode] = useState([{ value: 1, label: '-' }]);
    const toko_id = fromLaporanKeuangan ? stateTokoId : userData.tokoId;
    const cabang_id = fromLaporanKeuangan ? stateCabangId : userData.userId;
    // UI state
    const [isLoading, setLoading] = useState(false);
    const [isModalSucc, setModalSucc] = useState(false);
    const [isMetodeDisabled, setIsMetodeDisabled] = useState(false);
    const [modalState, setModalState] = useState({
        isOpen: false,
        content: 'produk',
        activeTable: null,
        selectedItems: [],
        searchTerm: ''
    });

    useEffect(() => {
        fetchAllData();
    }, [id]);

    const mapCustomProducts = (data) => data.map(item => ({
        barang_custom_id: item.barang_custom_id,
        image: `${import.meta.env.VITE_API_URL}/images-barang-custom/${item.image}`,
        code: item.barang_custom_id,
        nama_barang: item.nama_barang,
        price: item.harga_jual
    }));
    
    const mapPackagingProducts = (data) => data.map(item => ({
        packaging_id: item.packaging_id,
        nama_packaging: item.nama_packaging,
        price: 0, // Set price to 0 as per requirement
        image: item.image ? 
            `${import.meta.env.VITE_API_URL}/images-packaging/${item.image}` : 
            "https://via.placeholder.com/50"
    }));

    const fetchAllData = async () => {
        try {
            setLoading(true);
            const [penjualanRes, customRes, packagingRes, metodeRes] = await Promise.all([
                api.get(`/penjualan/${id}`),
                api.get(`/barang-custom?toko_id=${toko_id}`),
                api.get(`/packaging?toko_id=${toko_id}`),
                api.get(`/metode-pembayaran?toko_id=${toko_id}`)
            ]);

            const metodeList = [
                { value: 0, label: '-' },
                ...metodeRes.data.data.map(m => ({
                    value: m.metode_id,
                    label: m.nama_metode
                }))
            ];
    
            setDataBarang(mapCustomProducts(customRes.data.data));
            setDataPackaging(mapPackagingProducts(packagingRes.data.data));
            setDataMetode(metodeList);

            const detail = penjualanRes.data.data;
            const isCash = detail.cash_or_non;
            setFormData({
                nomor: detail.penjualan_id,
                tanggal: detail.tanggal,
                namaPembeli: detail.nama_pembeli,
                note: detail.catatan,
                selectBayar: isCash ? 1 : 2,
                selectMetode: isCash ? 0 : detail.metode_id, 
                diskon: detail.diskon,
                pajak: detail.pajak
            });
    
            setIsMetodeDisabled(isCash);
            setDetailData({
                customProducts: detail.produk.filter(p => p.barang_custom).map(item => ({
                    ...item,
                    id: item.produk_penjualan_id || `custom-${Date.now()}-${item.barang_custom?.barang_custom_id}`
                })),
                biayaProducts: detail.rincian_biaya_custom ? detail.rincian_biaya_custom.map(biaya => ({
                    id: biaya.rincian_biaya_custom_id || `biaya-${Date.now()}-${Math.random()}`,
                    nama_biaya: biaya.nama_biaya,
                    jumlah_biaya: biaya.jumlah_biaya
                })) : [],
                packagingProducts: detail.produk.filter(p => p.packaging).map(item => ({
                    ...item,
                    id: item.produk_penjualan_id || `packaging-${Date.now()}-${item.packaging?.packaging_id}`,
                    // Set price-related fields to 0 for packaging items
                    harga_satuan: 0,
                    total_biaya: 0
                }))
            });
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

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

    // Simplified headers for packaging table
    const packagingHeaders = [
        { label: 'No', key: 'No', align: 'text-left' },
        { label: 'Foto Produk', key: 'Foto Produk', align: 'text-left' },
        { label: 'Nama Barang', key: 'Nama Barang', align: 'text-left' },
        { label: 'Kuantitas', key: 'Kuantitas', align: 'text-left', width:'110px' },
        { label: 'Aksi', key: 'Aksi', align: 'text-left' },
    ];

    // Biaya headers
    const biayaHeaders = [
        { label: 'No', key: 'No', align: 'text-left' },
        { label: 'Nama Biaya', key: 'Nama Biaya', align: 'text-left' },
        { label: 'Jumlah Biaya', key: 'Jumlah Biaya', align: 'text-left', width: '110px' },
        { label: 'Aksi', key: 'Aksi', align: 'text-left' },
    ];

    // Helper function to get the appropriate headers based on table index
    const getHeadersForTable = (index) => {
        if (index === 1) return biayaHeaders;
        if (index === 2) return packagingHeaders;
        return headers;
    };

    const transformToTableData = () => [
        {
            nama: 'Rincian Jumlah dan Bahan',
            data: detailData.customProducts.map((item, idx) => createTableRow(item, idx, 'custom'))
        },
        {
            nama: 'Rincian Biaya',
            data: detailData.biayaProducts.map((item, idx) => createBiayaRow(item, idx))
        },
        {
            nama: 'Packaging',
            data: detailData.packagingProducts.map((item, idx) => createPackagingRow(item, idx))
        }
    ];
    
    // Create row for custom products (with pricing)
    const createTableRow = (item, index, type) => {
        // Generate a unique ID if none exists
        const itemId = item.id || `${type}-${index}-${Date.now()}`;
        
        return {
            id: itemId,
            No: index + 1,
            "Foto Produk": <img 
                src={type === 'custom' ? 
                    (item.barang_custom?.image?.includes('http') ? 
                        item.barang_custom.image : 
                        `${import.meta.env.VITE_API_URL}/images-barang-custom/${item.barang_custom?.image}`
                    ) : 
                    (item.packaging?.image?.includes('http') ? 
                        item.packaging.image : 
                        `${import.meta.env.VITE_API_URL}/images-packaging/${item.packaging?.image}`
                    )}
                alt="product" 
                className="w-12 h-12" 
            />,
            "Nama Barang": <InputDropdown 
                showRequired={false}
                options={type === 'custom' ? 
                    dataBarang.map(item => ({
                        value: item.barang_custom_id,
                        label: item.nama_barang
                    })) : 
                    dataPackaging.map(item => ({
                        value: item.packaging_id,
                        label: item.nama_packaging
                    }))}
                value={type === 'custom' ? 
                       item.barang_custom?.barang_custom_id || item.barang_custom_id : 
                       item.packaging?.packaging_id || item.packaging_id}
                onSelect={(selected) => handleProductSelect(type, itemId, selected)}
            />,
            "Harga Satuan": `Rp${item.harga_satuan?.toLocaleString('id-ID')}`,
            "Kuantitas": <Input
                showRequired={false}
                type="number"
                value={item.kuantitas}
                onChange={(value) => handleQuantityChange(type, itemId, value)}
            />,
            "Total Biaya": `Rp${item.total_biaya?.toLocaleString('id-ID')}`,
            Aksi: <button 
                className="text-red-500 hover:text-red-700"
                onClick={() => handleDeleteRow(type, itemId)}
            >
                Hapus
            </button>
        };
    };

    // New function to create packaging row (without pricing)
    const createPackagingRow = (item, index) => {
        const itemId = item.id || `packaging-${index}-${Date.now()}`;
        
        return {
            id: itemId,
            No: index + 1,
            "Foto Produk": <img 
                src={item.packaging?.image?.includes('http') ? 
                    item.packaging.image : 
                    `${import.meta.env.VITE_API_URL}/images-packaging/${item.packaging?.image}`
                }
                alt="packaging" 
                className="w-12 h-12" 
            />,
            "Nama Barang": <InputDropdown 
                showRequired={false}
                options={dataPackaging.map(pkg => ({
                    value: pkg.packaging_id,
                    label: pkg.nama_packaging
                }))}
                value={item.packaging?.packaging_id || item.packaging_id}
                onSelect={(selected) => handleProductSelect('packaging', itemId, selected)}
            />,
            "Kuantitas": <Input
                showRequired={false}
                type="number"
                value={item.kuantitas}
                onChange={(value) => handleQuantityChange('packaging', itemId, value)}
            />,
            Aksi: <button 
                className="text-red-500 hover:text-red-700"
                onClick={() => handleDeleteRow('packaging', itemId)}
            >
                Hapus
            </button>
        };
    };

    const createBiayaRow = (item, index) => ({
        id: item.id,
        No: index + 1,
        "Nama Biaya": <Input
            showRequired={false}
            type="text"
            value={item.nama_biaya}
            onChange={(value) => handleBiayaChange(item.id, 'nama_biaya', value)}
            disabled={item.id === 'biaya-1'}
        />,
        "Jumlah Biaya": <Input
            showRequired={false}
            type="number"
            value={item.jumlah_biaya}
            onChange={(value) => handleBiayaChange(item.id, 'jumlah_biaya', value)}
            disabled={item.id === 'biaya-1'}
        />,
        Aksi: item.id === 'biaya-1' ? null : <button 
            className="text-red-500 hover:text-red-700"
            onClick={() => handleDeleteRow('biaya', item.id)}
        >
            Hapus
        </button>
    });

    const handleAddRow = (tableIndex) => {
        if (tableIndex === 1) {
            const newBiaya = {
                id: `biaya-${Date.now()}`, 
                nama_biaya: '',
                jumlah_biaya: 0,
                is_new: true 
            };
            setDetailData(prev => ({
                ...prev,
                biayaProducts: [...prev.biayaProducts, newBiaya]
            }));
        } else {
            setModalState(prev => ({
                ...prev,
                isOpen: true,
                content: tableIndex === 0 ? 'produk' : 'packaging',
                activeTable: tableIndex
            }));
        }
    };

    const handleDeleteRow = (type, id) => {
        setDetailData(prev => {
            const key = type === 'custom' ? 'customProducts' : 
                       type === 'biaya' ? 'biayaProducts' : 'packagingProducts';
                       
            console.log('Deleting item with id:', id);
            console.log('Current items:', prev[key]);
            
            return {
                ...prev,
                [key]: prev[key].filter(item => {
                    // Log item details for debugging
                    console.log('Checking item:', item);
                    return item.id !== id;
                })
            };
        });
    };

    const handleProductSelect = (type, itemId, selected) => {
        const key = type === 'custom' ? 'customProducts' : 'packagingProducts';
        const products = type === 'custom' ? dataBarang : dataPackaging;
        
        setDetailData(prev => {
            const items = [...prev[key]];
            const itemIndex = items.findIndex(item => item.id === itemId);
            
            if (itemIndex !== -1) {
                const selectedProduct = products.find(p => 
                    type === 'custom' 
                        ? p.barang_custom_id === selected.value 
                        : p.packaging_id === selected.value
                );
    
                if (selectedProduct) {
                    const currentQuantity = items[itemIndex].kuantitas || 1;
                    
                    if (type === 'custom') {
                        // For custom products, keep the price calculation
                        items[itemIndex] = {
                            ...items[itemIndex],
                            id: itemId,
                            kuantitas: currentQuantity,
                            harga_satuan: selectedProduct.price,
                            total_biaya: selectedProduct.price * currentQuantity,
                            barang_custom: {
                                barang_custom_id: selected.value,
                                image: selectedProduct.image
                            },
                            barang_custom_id: selected.value
                        };
                    } else {
                        // For packaging, don't include pricing
                        items[itemIndex] = {
                            ...items[itemIndex],
                            id: itemId,
                            kuantitas: currentQuantity,
                            harga_satuan: 0,
                            total_biaya: 0,
                            packaging: {
                                packaging_id: selected.value,
                                image: selectedProduct.image
                            },
                            packaging_id: selected.value
                        };
                    }
                }
            }
            
            return { ...prev, [key]: items };
        });
    };

    const handleQuantityChange = (type, itemId, newQuantity) => {
        const key = type === 'custom' ? 'customProducts' : 'packagingProducts';
        
        setDetailData(prev => {
            const items = [...prev[key]];
            const itemIndex = items.findIndex(item => (item.produk_penjualan_id || item.id) === itemId);
            
            if (itemIndex !== -1) {
                if (type === 'custom') {
                    // For custom products, update price
                    items[itemIndex] = {
                        ...items[itemIndex],
                        kuantitas: Number(newQuantity),
                        total_biaya: items[itemIndex].harga_satuan * Number(newQuantity)
                    };
                } else {
                    // For packaging, just update quantity
                    items[itemIndex] = {
                        ...items[itemIndex],
                        kuantitas: Number(newQuantity),
                        // Keep zero values for pricing fields
                        harga_satuan: 0,
                        total_biaya: 0
                    };
                }
            }
            
            return { ...prev, [key]: items };
        });
    };

    const handleBiayaChange = (id, field, value) => {
        setDetailData(prev => ({
            ...prev,
            biayaProducts: prev.biayaProducts.map(item => 
                item.id === id ? { ...item, [field]: value } : item
            )
        }));
    };

    const handleModalSubmit = () => {
        const { activeTable, selectedItems } = modalState;
        const key = activeTable === 0 ? 'customProducts' : 'packagingProducts';
        
        const newItems = selectedItems.map(item => {
            // Base item properties
            const newItem = {
                id: `${key}-${Date.now()}-${item.id}`,
                kuantitas: item.count,
            };
    
            if (activeTable === 0) {
                // For custom products, include price
                newItem.harga_satuan = item.price;
                newItem.total_biaya = item.price * item.count;
                newItem.barang_custom = {
                    barang_custom_id: item.id,
                    image: item.image
                };
                newItem.barang_custom_id = item.id;
            } else {
                // For packaging, set price to 0
                newItem.harga_satuan = 0;
                newItem.total_biaya = 0; 
                newItem.packaging = {
                    packaging_id: item.id,
                    image: item.image
                };
                newItem.packaging_id = item.id;
            }
    
            return newItem;
        });
    
        setDetailData(prev => ({
            ...prev,
            [key]: [...prev[key], ...newItems]
        }));
    
        setModalState(prev => ({
            ...prev,
            isOpen: false,
            selectedItems: []
        }));
    };

    const calculateSubtotal = () => {
        // Only include custom products and biaya products in calculation
        const customTotal = detailData.customProducts.reduce((sum, item) => sum + (item.total_biaya || 0), 0);
        const biayaTotal = detailData.biayaProducts.reduce((sum, item) => sum + (Number(item.jumlah_biaya) || 0), 0);
        // Packaging is excluded from calculation
        return customTotal + biayaTotal;
    };

    const calculateTotalPenjualan = (subtotal) => {
        const diskonNominal = (formData.diskon / 100) * subtotal;
        return subtotal - diskonNominal + Number(formData.pajak);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
        
            const customProducts = detailData.customProducts.map(item => ({
                produk_penjualan_id: item.produk_penjualan_id, 
                barang_custom_id: item.barang_custom?.barang_custom_id || item.barang_custom_id,
                harga_satuan: item.harga_satuan,
                kuantitas: item.kuantitas,
                total_biaya: item.total_biaya
            }));
            
            const packagingProducts = detailData.packagingProducts.map(item => ({
                produk_penjualan_id: item.produk_penjualan_id,
                packaging_id: item.packaging?.packaging_id || item.packaging_id,
                harga_satuan: 0, // Set to 0 as per requirement
                kuantitas: item.kuantitas,
                total_biaya: 0 // Set to 0 as per requirement
            }));

            const allBiaya = detailData.biayaProducts.map(item => ({
                rincian_biaya_custom_id: item.rincian_biaya_custom_id, 
                nama_biaya: item.nama_biaya,
                jumlah_biaya: Number(item.jumlah_biaya)
            }));
    
            const payload = {
                toko_id: toko_id,
                cabang_id: cabang_id,
                cash_or_non: formData.selectBayar === 1,
                metode_id: formData.selectBayar === 1 ? null : formData.selectMetode,
                nama_pembeli: formData.namaPembeli,
                tanggal: formData.tanggal,
                catatan: formData.note,
                sub_total: calculateSubtotal(),
                diskon: Number(formData.diskon),
                pajak: Number(formData.pajak),
                total_penjualan: calculateTotalPenjualan(calculateSubtotal()),
                produk: [...customProducts, ...packagingProducts],
                rincian_biaya_custom: allBiaya
            };
    
            await api.put(`/penjualan/${id}`, payload);
            setModalSucc(true);
        } catch (error) {
            console.error('Error submitting:', error);
            setErrorMessage(error.response?.data?.message || 'Terjadi kesalahan saat menyimpan data')
        } finally {
            setLoading(false);
        }
    };

    const breadcrumbItems = fromLaporanKeuangan 
    ? [
        { label: "Daftar Laporan Keuangan", href: "/laporanKeuangan" },
        { label: "Edit Penjualan Custom", href: "" },
    ]
    : isAdminGudang 
      ? [
          { label: "Daftar Penjualan Toko", href: "/penjualan-admin-gudang" },
          { label: "Edit Penjualan Custom", href: "" },
      ]
      : [
          { label: "Daftar Penjualan Toko", href: "/penjualanToko" },
          { label: "Edit Penjualan Custom", href: "" },
      ];

    const dataBayar = [
        { value: 1, label: 'Cash' },
        { value: 2, label: 'Non-Cash' }
    ];

    return (
        <LayoutWithNav>
            <div className="p-5">
                <Breadcrumbs items={breadcrumbItems} />
                <section className="bg-white p-5 mt-5 rounded-xl">
                    <form onSubmit={handleSubmit}>
                        {/* Basic form inputs */}
                        <section>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <Input 
                                    label="Nomor" 
                                    type="text" 
                                    value={formData.nomor} 
                                    onChange={(e) => setFormData(prev => ({...prev, nomor: e}))} 
                                />
                                <Input 
                                    label="Tanggal dan Waktu" 
                                    type1="datetime-local" 
                                    value={formData.tanggal} 
                                    onChange={(e) => setFormData(prev => ({...prev, tanggal: e}))} 
                                />
                                <Input 
                                    label="Nama Pembeli" 
                                    value={formData.namaPembeli} 
                                    required={false}
                                    onChange={(e) => setFormData(prev => ({...prev, namaPembeli: e}))} 
                                />
                                <InputDropdown 
                                    label="Cash/Non-Cash" 
                                    options={[
                                        { value: 1, label: 'Cash' },
                                        { value: 2, label: 'Non-Cash' }
                                    ]}
                                    value={formData.selectBayar}
                                    onSelect={(selected) => {
                                        setFormData(prev => ({
                                            ...prev, 
                                            selectBayar: selected.value,
                                            selectMetode: selected.value === 1 ? 0 : dataMetode[1].value 
                                        }));
                                        setIsMetodeDisabled(selected.value === 1);
                                    }}
                                />
                                <InputDropdown 
                                    label="Metode Pembayaran" 
                                    disabled={isMetodeDisabled}
                                    options={dataMetode}
                                    value={formData.selectMetode}
                                    onSelect={(selected) => setFormData(prev => ({...prev, selectMetode: selected.value}))}
                                />
                            </div>
                        </section>

                        {/* Tables section */}
                        <section className="pt-10">
                            {transformToTableData().map((table, index) => (
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
                                            onClick={() => handleAddRow(index)}
                                            bgColor=""
                                            hoverColor={`hover:border-${themeColor} hover:border`}
                                            textColor={`text-${themeColor}`}
                                            />
                                    </div>
                                </div>
                            ))}
                        </section>

                        {/* Note and Summary section */}
                        <section className="flex flex-col md:flex-row gap-8 p-4">
                            <div className="w-full md:w-2/4">
                                <TextArea
                                    label="Catatan"
                                    placeholder="Masukkan Catatan Di Sini"
                                    required={true}
                                    value={formData.note}
                                    onChange={(e) => setFormData(prev => ({...prev, note: e.target.value}))}
                                />
                            </div>

                            <div className="w-full md:w-2/4">
                                <div className="space-y-4 text-sm p-4">
                                    <div className="flex justify-between border-b pb-2">
                                        <p className="font-bold">Subtotal</p>
                                        <p>Rp{calculateSubtotal().toLocaleString()}</p>
                                    </div>
                                    <div className="flex justify-between items-center border-b pb-2">
                                        <p className="font-bold">Diskon Keseluruhan (%)</p>
                                        <div className="w-30">
                                            <Input
                                                type="number"
                                                showRequired={false}
                                                value={formData.diskon}
                                                required={false}
                                                onChange={(value) => setFormData(prev => ({...prev, diskon: value}))}
                                            />
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center border-b pb-2">
                                        <p className="font-bold">Pajak</p>
                                        <div className="w-30">
                                            <Input
                                                type="number"
                                                showRequired={false}
                                                required={false}
                                                value={formData.pajak}
                                                onChange={(value) => setFormData(prev => ({...prev, pajak: value}))}
                                            />
                                        </div>
                                    </div>
                                    <div className="flex justify-between border-b pb-2">
                                        <p className="font-bold">Total Penjualan</p>
                                        <p className="font-bold">
                                            Rp{calculateTotalPenjualan(calculateSubtotal()).toLocaleString()}
                                        </p>
                                    </div>
                                    <div>
                                        <Button
                                            label="Simpan"
                                            bgColor={`bg-${themeColor} w-full`}
                                            hoverColor={`hover:bg-white hover:border-${themeColor} hover:text-black hover:border`}
                                            textColor="text-white"
                                            type="submit"
                                        />
                                    </div>
                                </div>
                            </div>
                        </section>
                    </form>
                </section>

                {/* Product/Packaging Selection Modal */}
                {modalState.isOpen && (
                    <section className="fixed inset-0 bg-white bg-opacity-80 flex justify-center items-center z-50">
                        <div className={`bg-white border border-${themeColor} rounded-md p-6 w-[90%] md:w-[70%] h-[90%] overflow-hidden`}>
                            <div className="flex flex-wrap md:flex-nowrap items-center justify-between mb-4 gap-4">
                                <div className="relative w-full max-w-md flex-shrink-0">
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
                                        placeholder="Cari barang..."
                                        value={modalState.searchTerm}
                                        onChange={(e) => setModalState(prev => ({...prev, searchTerm: e.target.value}))}
                                        className="w-full border border-gray-300 rounded-md py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-gray-500"
                                    />
                                </div>

                                <div className="flex items-center space-x-4 flex-shrink-0">
                                    <button
                                        onClick={() => setModalState(prev => ({...prev, searchTerm: '', selectedItems: []}))}
                                        className="text-gray-400 hover:text-gray-700 focus:outline-none"
                                    >
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="h-6 w-6"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                    <p className={`text-${themeColor} font-semibold`}>
                                        Terpilih {modalState.selectedItems.reduce((sum, item) => sum + item.count, 0)}
                                    </p>
                                </div>

                                <div className="flex flex-wrap md:flex-nowrap gap-4 flex-shrink-0">
                                    <Button
                                        label="Batal"
                                        bgColor="border border-secondary"
                                        hoverColor="hover:bg-gray-100"
                                        textColor="text-black"
                                        onClick={() => setModalState(prev => ({...prev, isOpen: false, selectedItems: []}))}
                                    />
                                    <Button
                                        label="Pilih"
                                        bgColor={`bg-${themeColor}`}
                                        hoverColor="hover:bg-opacity-90"
                                        textColor="text-white"
                                        onClick={handleModalSubmit}
                                    />
                                </div>
                            </div>

                            <div className="mt-6 h-[calc(100%-180px)] overflow-y-auto no-scrollbar">
                                <Gallery2
                                    items={modalState.content === 'packaging' 
                                        ? dataPackaging.filter(item => 
                                            item.nama_packaging?.toLowerCase().includes(modalState.searchTerm.toLowerCase())
                                        ).map(item => ({
                                            id: item.packaging_id,
                                            image: item.image,
                                            code: item.packaging_id,
                                            name: item.nama_packaging,
                                            price: 0, // Set price to 0 for packaging
                                            formattedPrice: '' // Hide price display for packaging
                                        }))
                                        : dataBarang.filter(item =>
                                            item.nama_barang?.toLowerCase().includes(modalState.searchTerm.toLowerCase())
                                        ).map(item => ({
                                            id: item.barang_custom_id,
                                            image: item.image,
                                            code: item.barang_custom_id,
                                            name: item.nama_barang,
                                            price: item.price || item.harga_jual || item.harga,
                                            formattedPrice: `Rp${(item.price || item.harga_jual || item.harga).toLocaleString('id-ID')}`
                                        }))
                                    }
                                    onSelect={(item, count) => {
                                        setModalState(prev => {
                                            const updatedItems = prev.selectedItems.filter(i => i.id !== item.id);
                                            if (count > 0) {
                                                updatedItems.push({
                                                    ...item,
                                                    count
                                                });
                                            }
                                            return {
                                                ...prev,
                                                selectedItems: updatedItems
                                            };
                                        });
                                    }}
                                    selectedItems={modalState.selectedItems}
                                />
                            </div>
                        </div>
                    </section>
                )}

                {isModalSucc && (
                    <AlertSuccess
                        title="Berhasil!!"
                        description="Data berhasil disimpan"
                        confirmLabel="OK"
                        onConfirm={() => {
                            setModalSucc(false);
                            if (fromLaporanKeuangan) {
                                navigate('/laporanKeuangan');
                            } else {
                                navigate(isAdminGudang ? '/penjualan-admin-gudang' : '/penjualan-kasir');
                            }
                        }}
                    />
                )}

                {isLoading && <Spinner />}

                {errorMessage && (
                    <AlertError
                        title={'Failed'}
                        description={errorMessage}
                        onConfirm={() => setErrorMessage(null)}
                    />
                )}
            </div>
        </LayoutWithNav>
    );
};

export default EditPenjualanCustomKasir;