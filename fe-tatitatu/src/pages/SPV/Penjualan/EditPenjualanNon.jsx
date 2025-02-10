import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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

const EditPenjualanNon = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const userData = JSON.parse(localStorage.getItem('userData'));
    const isAdminGudang = userData?.role === 'admingudang';

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
        products: [],
        packagingProducts: []
    });

    // Reference data
    const [dataBarangHandmade, setDataBarangHandmade] = useState([]);
    const [dataBarangNonHandmade, setDataBarangNonHandmade] = useState([]);
    const [dataPackaging, setDataPackaging] = useState([]);
    const [dataKategori, setDataKategori] = useState([]);
    const [dataMetode, setDataMetode] = useState([{ value: 1, label: '-' }]);
    const [selectedKategori, setSelectedKategori] = useState('all');
    const [selectedType, setSelectedType] = useState('handmade');
    const [errorMessage, setErrorMessage] = useState(null);
    

    // UI state
    const [isLoading, setLoading] = useState(false);
    const [isModalSucc, setModalSucc] = useState(false);
    const [isMetodeDisabled, setIsMetodeDisabled] = useState(false);
    const [modalState, setModalState] = useState({
        isOpen: false,
        content: 'produk',
        activeTable: null,
        selectedItems: [],
        searchTerm: '',
        productType: 'handmade' 
    });

    useEffect(() => {
        fetchAllData();
    }, [id]);

    const mapHandmadeProducts = (data) => data.map(item => ({
        id: item.barang_handmade_id,
        image: `${import.meta.env.VITE_API_URL}/images-barang-handmade/${item.image}`,
        code: item.barang_handmade_id,
        name: item.nama_barang,
        price: item.rincian_biaya[0]?.harga_jual || 0,
        kategori: item.kategori_barang?.nama_kategori_barang,
        jenis: 'Handmade'
    }));

    const mapNonHandmadeProducts = (data) => data.map(item => ({
        id: item.barang_non_handmade_id,
        image: `${import.meta.env.VITE_API_URL}/images-barang-non-handmade/${item.image}`,
        code: item.barang_non_handmade_id,
        name: item.nama_barang,
        price: item.rincian_biaya[0]?.harga_jual || 0,
        kategori: item.kategori?.nama_kategori_barang,
        jenis: 'Non Handmade'
    }));
    
    const mapPackagingProducts = (data) => data.map(item => ({
        id: item.packaging_id,
        name: item.nama_packaging,
        price: item.harga,
        image: item.image ? 
            `${import.meta.env.VITE_API_URL}/images-packaging/${item.image}` : 
            "https://via.placeholder.com/50"
    }));

    // Di bagian useEffect fetchAllData
const fetchAllData = async () => {
    try {
        setLoading(true);
        const [penjualanRes, handmadeRes, nonHandmadeRes, packagingRes, metodeRes, kategoriRes] = await Promise.all([
            api.get(`/penjualan/${id}`),
            api.get('/barang-handmade'),
            api.get('/barang-non-handmade'),
            api.get('/packaging'),
            api.get('/metode-pembayaran'),
            api.get('/kategori-barang')
        ]);

        // Process reference data
        setDataBarangHandmade(mapHandmadeProducts(handmadeRes.data.data));
        setDataBarangNonHandmade(mapNonHandmadeProducts(nonHandmadeRes.data.data));
        setDataPackaging(mapPackagingProducts(packagingRes.data.data));
        setDataKategori(kategoriRes.data.data);
        setDataMetode([
            { value: 1, label: '-' },
            ...metodeRes.data.data.map(m => ({
                value: m.metode_id,
                label: m.nama_metode
            }))
        ]);

        const detail = penjualanRes.data.data;
        // Set form data
        setFormData({
            nomor: detail.penjualan_id,
            tanggal: (() => {
                const date = new Date(detail.tanggal);
                return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}T${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
            })(),
            namaPembeli: detail.nama_pembeli,
            note: detail.catatan,
            selectBayar: detail.cash_or_non ? 1 : 2,
            selectMetode: detail.metode_id || 0,
            diskon: detail.diskon,
            pajak: detail.pajak
        });

        setIsMetodeDisabled(detail.cash_or_non);

        setDetailData({
            products: detail.produk_penjualan.filter(p => p.barang_handmade_id || p.barang_non_handmade_id),
            packagingProducts: detail.produk_penjualan.filter(p => p.packaging_id)
        });
    } catch (error) {
        console.error('Error fetching data:', error);
    } finally {
        setLoading(false);
    }
};

    const transformToTableData = () => [
        {
            nama: 'Rincian Produk',
            data: detailData.products.map((item, idx) => createTableRow(item, idx, 'product'))
        },
        {
            nama: 'Packaging',
            data: detailData.packagingProducts.map((item, idx) => createTableRow(item, idx, 'packaging'))
        }
    ];

    const createTableRow = (item, index, type) => {
        const getImagePath = (item, type) => {
            if (type === 'product') {
                if (item.barang_handmade?.image) {
                    return `${import.meta.env.VITE_API_URL}/images-barang-handmade/${item.barang_handmade.image}`;
                } else if (item.barang_non_handmade?.image) {
                    return `${import.meta.env.VITE_API_URL}/images-barang-non-handmade/${item.barang_non_handmade.image}`;
                }
            }
            return item.packaging?.image ? `${import.meta.env.VITE_API_URL}/images-packaging/${item.packaging.image}` : '';
        };

        const getProductType = (item) => {
            if (type === 'packaging') return 'Packaging';
            return item.barang_handmade_id ? 'Handmade' : 'Non-Handmade';
        };

        const getCurrentName = (item, type) => {
            if (type === 'product') {
                return item.nama_barang || (item.barang_handmade_id ? 
                    dataBarangHandmade.find(p => p.id === item.barang_handmade_id)?.name :
                    dataBarangNonHandmade.find(p => p.id === item.barang_non_handmade_id)?.name);
            }
            return item.nama_packaging || dataPackaging.find(p => p.id === item.packaging_id)?.name;
        };
    
        const currentName = getCurrentName(item, type);
        const imagePath = getImagePath(item, type);
    
        return {
            id: item.produk_penjualan_id || item.id,
            No: index + 1,
            "Foto Produk": imagePath ? (
                <img 
                    src={imagePath}
                    alt={currentName} 
                    className="w-12 h-12 object-cover rounded" 
                />
            ) : (
                <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
                    <span className="text-gray-500">No image</span>
                </div>
            ),
            "Nama Barang": <InputDropdown 
                showRequired={false}
                options={type === 'product' ? 
                    [...dataBarangHandmade, ...dataBarangNonHandmade].map(item => ({
                        value: item.id,
                        label: item.name
                    })) : 
                    dataPackaging.map(item => ({
                        value: item.id,
                        label: item.name
                    }))}
                value={type === 'product' ? 
                    (item.barang_handmade_id || item.barang_non_handmade_id) : 
                    item.packaging_id}
                defaultValue={currentName}
                onSelect={(selected) => handleProductSelect(type, item.produk_penjualan_id || item.id, selected)}
            />,
            "Jenis Barang": getProductType(item),
            "Harga Satuan": `Rp${item.harga_satuan?.toLocaleString('id-ID')}`,
            "Kuantitas": <Input
                showRequired={false}
                type="number"
                value={item.kuantitas}
                onChange={(value) => handleQuantityChange(type, item.produk_penjualan_id || item.id, value)}
            />,
            "Total Biaya": `Rp${item.total_biaya?.toLocaleString('id-ID')}`,
            Aksi: <button 
                className="text-red-500 hover:text-red-700"
                onClick={() => handleDeleteRow(type, item.produk_penjualan_id || item.id)}
            >
                Hapus
            </button>
        };
    };

    const handleAddRow = (tableIndex) => {
        setModalState(prev => ({
            ...prev,
            isOpen: true,
            content: tableIndex === 0 ? 'produk' : 'packaging',
            activeTable: tableIndex
        }));
    };

    const handleDeleteRow = (type, id) => {
        setDetailData(prev => {
            const key = type === 'product' ? 'products' : 'packagingProducts';
            return {
                ...prev,
                [key]: prev[key].filter(item => (item.produk_penjualan_id || item.id) !== id)
            };
        });
    };

    const handleProductSelect = (type, itemId, selected) => {
        const key = type === 'product' ? 'products' : 'packagingProducts';
        const products = type === 'product' ? 
            [...dataBarangHandmade, ...dataBarangNonHandmade] : 
            dataPackaging;
        
        setDetailData(prev => {
            const items = [...prev[key]];
            const itemIndex = items.findIndex(item => (item.produk_penjualan_id || item.id) === itemId);
            
            if (itemIndex !== -1) {
                const selectedProduct = products.find(p => p.id === selected.value);
                const currentQuantity = items[itemIndex].kuantitas || 1;

                const isHandmade = selectedProduct.jenis === 'Handmade';
                
                items[itemIndex] = {
                    ...items[itemIndex],
                    barang_handmade_id: null,
                    barang_non_handmade_id: null,
                    packaging_id: null,

                    ...(type === 'product' 
                        ? (isHandmade 
                            ? { barang_handmade_id: selected.value } 
                            : { barang_non_handmade_id: selected.value })
                        : { packaging_id: selected.value }
                    ),
                    harga_satuan: selectedProduct.price,
                    kuantitas: currentQuantity,
                    total_biaya: selectedProduct.price * currentQuantity,

                    ...(type === 'product' 
                        ? (isHandmade 
                            ? { 
                                barang_handmade: {
                                    id: selectedProduct.id,
                                    image: selectedProduct.image.split('/').pop()
                                },
                                barang_non_handmade: null
                            }
                            : {
                                barang_non_handmade: {
                                    id: selectedProduct.id,
                                    image: selectedProduct.image.split('/').pop() 
                                },
                                barang_handmade: null
                            })
                        : {
                            packaging: {
                                id: selectedProduct.id,
                                image: selectedProduct.image.split('/').pop() 
                            }
                        }
                    ),
                    nama_barang: selectedProduct.name
                };
            }
            
            return { ...prev, [key]: items };
        });
    };

    const handleQuantityChange = (type, itemId, newQuantity) => {
        const key = type === 'product' ? 'products' : 'packagingProducts';
        
        setDetailData(prev => {
            const items = [...prev[key]];
            const itemIndex = items.findIndex(item => (item.produk_penjualan_id || item.id) === itemId);
            
            if (itemIndex !== -1) {
                items[itemIndex] = {
                    ...items[itemIndex],
                    kuantitas: Number(newQuantity),
                    total_biaya: items[itemIndex].harga_satuan * Number(newQuantity)
                };
            }
            
            return { ...prev, [key]: items };
        });
    };

    const handleModalSubmit = () => {
        const { activeTable, selectedItems } = modalState;
        const key = activeTable === 0 ? 'products' : 'packagingProducts';
        
        const newItems = selectedItems.map(item => {
            const imageName = item.image.split('/').pop();
            
            const baseItem = {
                id: `${key}-${Date.now()}-${item.id}`,
                harga_satuan: item.price,
                kuantitas: item.count,
                total_biaya: item.price * item.count,
                nama_barang: item.name
            };
    
            if (activeTable === 0) {
                if (item.jenis === 'Handmade') {
                    return {
                        ...baseItem,
                        barang_handmade_id: item.id,
                        barang_handmade: {
                            id: item.id,
                            image: imageName
                        }
                    };
                } else {
                    return {
                        ...baseItem,
                        barang_non_handmade_id: item.id,
                        barang_non_handmade: {
                            id: item.id,
                            image: imageName
                        }
                    };
                }
            } else {
                return {
                    ...baseItem,
                    packaging_id: item.id,
                    packaging: {
                        id: item.id,
                        image: imageName
                    }
                };
            }
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
        const productsTotal = detailData.products.reduce((sum, item) => sum + (item.total_biaya || 0), 0);
        const packagingTotal = detailData.packagingProducts.reduce((sum, item) => sum + (item.total_biaya || 0), 0);
        return productsTotal + packagingTotal;
    };

    const calculateTotalPenjualan = (subtotal) => {
        const diskonNominal = (formData.diskon / 100) * subtotal;
        return subtotal - diskonNominal + Number(formData.pajak);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            
            const payload = {
                cash_or_non: formData.selectBayar === 1,
                ...(formData.selectBayar === 2 && { metode_id: formData.selectMetode }),
                sub_total: calculateSubtotal(),
                diskon: Number(formData.diskon),
                pajak: Number(formData.pajak),
                total_pembelian: calculateTotalPenjualan(calculateSubtotal()),
                produk: [
                    ...detailData.products.map(item => ({
                        ...(item.barang_handmade_id ? { barang_handmade_id: item.barang_handmade_id } : 
                            { barang_non_handmade_id: item.barang_non_handmade_id }),
                        harga_satuan: item.harga_satuan,
                        kuantitas: item.kuantitas,
                        total_biaya: item.total_biaya
                    })),
                    ...detailData.packagingProducts.map(item => ({
                        packaging_id: item.packaging_id,
                        harga_satuan: item.harga_satuan,
                        kuantitas: item.kuantitas,
                        total_biaya: item.total_biaya
                    }))
                ]
            };

            await api.put(`/penjualan/${id}`, payload);
            setModalSucc(true);
        } catch (error) {
            console.error('Error submitting:', error);
            setErrorMessage(error.response.data.message)
        } finally {
            setLoading(false);
        }
    };

    const breadcrumbItems = isAdminGudang 
    ? [
        { label: "Daftar Penjualan Toko", href: "/penjualan-admin-gudang" },
        { label: "Edit Penjualan Non Custom", href: "" },
    ]
    : [
        { label: "Daftar Penjualan Toko", href: "/penjualanToko" },
        { label: "Edit Penjualan Non Custom", href: "" },
    ];

    const headers = [
        { label: 'No', key: 'No', align: 'text-left' },
        { label: 'Foto Produk', key: 'Foto Produk', align: 'text-left' },
        { label: 'Nama Barang', key: 'Nama Barang', align: 'text-left' },
        { label: 'Jenis Barang', key: 'Jenis Barang', align: 'text-left' },
        { label: 'Harga Satuan', key: 'Harga Satuan', align: 'text-left' },
        { label: 'Kuantitas', key: 'Kuantitas', align: 'text-left', width:'200px' },
        { label: 'Total Biaya', key: 'Total Biaya', align: 'text-left' },
        { label: 'Aksi', key: 'Aksi', align: 'text-left' },
    ];

// const kategoriOptions = [
//     { value: 'all', label: 'Semua Kategori' },
//     ...dataKategori.map(kategori => ({
//         value: kategori.kategori_barang_id,
//         label: kategori.nama_kategori_barang
//     }))
// ];

const dataBayar = [
    { value: 1, label: 'Cash' },
    { value: 2, label: 'Non-Cash' }
];

const getFilteredProducts = () => {
    let products = modalState.productType === 'handmade' ? dataBarangHandmade : dataBarangNonHandmade;
    
    if (selectedKategori !== 'all') {
        products = products.filter(product => 
            product.kategori === dataKategori.find(k => 
                k.kategori_barang_id === Number(selectedKategori)
            )?.nama_kategori_barang
        );
    }

    if (modalState.searchTerm) {
        products = products.filter(product =>
            product.name.toLowerCase().includes(modalState.searchTerm.toLowerCase())
        );
    }

    return products.map(item => ({
        ...item,
        formattedPrice: `Rp${item.price.toLocaleString('id-ID')}`
    }));
};
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
                                onChange={(e) => setFormData(prev => ({...prev, namaPembeli: e}))} 
                            />
                            <InputDropdown 
                                label="Cash/Non-Cash" 
                                options={dataBayar}
                                value={formData.selectBayar}
                                onSelect={(selected) => {
                                    setFormData(prev => ({
                                        ...prev, 
                                        selectBayar: selected.value,
                                        selectMetode: selected.value === 1 ? 1 : dataMetode[1].value
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
                                        headers={headers} 
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
                                        hoverColor="hover:border-primary hover:border"
                                        textColor="text-primary"
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
            </section>

            {/* Product/Packaging Selection Modal */}
            {modalState.isOpen && (
                <section className="fixed inset-0 bg-white bg-opacity-80 flex justify-center items-center z-50">
                    <div className="bg-white border border-primary rounded-md p-6 w-[90%] md:w-[70%] h-[90%] overflow-hidden">
                        {/* Fixed Header Layout */}
                        <div className="flex items-center justify-between gap-4 mb-4">
                            {/* Search Bar */}
                            <div className="relative w-96">
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
                                    placeholder="Cari Barang yang mau dibeli"
                                    value={modalState.searchTerm}
                                    onChange={(e) => setModalState(prev => ({...prev, searchTerm: e.target.value}))}
                                    className="w-full border border-gray-300 rounded-md py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-gray-500"
                                />
                            </div>

                            {/* Selection Count with Clear Button */}
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setModalState(prev => ({...prev, selectedItems: []}))}
                                    className="text-gray-400 hover:text-gray-700 focus:outline-none"
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-5 w-5"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                                <span className="text-primary font-semibold">
                                    Terpilih {modalState.selectedItems.reduce((sum, item) => sum + item.count, 0)}
                                </span>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-2">
                                <Button
                                    label="Batal"
                                    bgColor="border border-secondary"
                                    hoverColor="hover:bg-gray-100"
                                    textColor="text-black"
                                    onClick={() => setModalState(prev => ({...prev, isOpen: false, selectedItems: []}))}
                                />
                                <Button
                                    label="Pilih"
                                    bgColor="bg-primary"
                                    hoverColor="hover:bg-opacity-90"
                                    textColor="text-white"
                                    onClick={handleModalSubmit}
                                />
                            </div>
                        </div>

                        {/* Product Type Tabs */}
                        {modalState.content === 'produk' && (
                            <div className="mb-4">
                                <div className="border-b border-gray-200">
                                    <nav className="flex" aria-label="Tabs">
                                        <button
                                            className={`py-2 px-4 relative ${
                                                modalState.productType === 'handmade'
                                                    ? 'text-primary border-b-2 border-primary font-bold'
                                                    : 'text-gray-500'
                                            }`}
                                            onClick={() => setModalState(prev => ({ ...prev, productType: 'handmade' }))}
                                        >
                                            Barang Handmade
                                        </button>
                                        <button
                                            className={`py-2 px-4 relative ${
                                                modalState.productType === 'non-handmade'
                                                    ? 'text-primary border-b-2 border-primary font-bold'
                                                    : 'text-gray-500'
                                            }`}
                                            onClick={() => setModalState(prev => ({ ...prev, productType: 'non-handmade' }))}
                                        >
                                            Barang Non-Handmade
                                        </button>
                                    </nav>
                                </div>

                                {/* Category Pills */}
                                <div className="flex gap-2 mt-4">
                                    <button
                                        className={`px-4 py-2 rounded-lg ${
                                            selectedKategori === 'all'
                                                ? 'bg-primary text-white'
                                                : 'bg-gray-100 text-gray-700'
                                        }`}
                                        onClick={() => setSelectedKategori('all')}
                                    >
                                        Semua
                                    </button>
                                    {dataKategori.map(kategori => (
                                        <button
                                            key={kategori.kategori_barang_id}
                                            className={`px-4 py-2 rounded-lg ${
                                                selectedKategori === kategori.kategori_barang_id.toString()
                                                    ? 'bg-primary text-white'
                                                    : 'bg-gray-100 text-gray-700'
                                            }`}
                                            onClick={() => setSelectedKategori(kategori.kategori_barang_id.toString())}
                                        >
                                            {kategori.nama_kategori_barang}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Gallery Content - Rest remains the same */}
                        <div className="mt-6 h-[calc(100%-180px)] overflow-y-auto no-scrollbar">
                            <Gallery2
                                items={modalState.content === 'packaging' 
                                    ? dataPackaging.filter(item => 
                                        item.name.toLowerCase().includes(modalState.searchTerm.toLowerCase())
                                    ).map(item => ({
                                        ...item,
                                        formattedPrice: `Rp${item.price.toLocaleString('id-ID')}`
                                    }))
                                    : getFilteredProducts()
                                }
                                onSelect={(item, count) => 
                                    setModalState(prev => {
                                        const updatedItems = [...prev.selectedItems];
                                        const existingIndex = updatedItems.findIndex(i => i.id === item.id);
                                        if (existingIndex !== -1) {
                                            if (count === 0) {
                                                updatedItems.splice(existingIndex, 1);
                                            } else {
                                                updatedItems[existingIndex].count = count;
                                            }
                                        } else if (count > 0) {
                                            updatedItems.push({ ...item, count });
                                        }
                                        return { ...prev, selectedItems: updatedItems };
                                    })
                                }
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
                            navigate(isAdminGudang ? '/penjualan-admin-gudang' : '/penjualanToko');
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

export default EditPenjualanNon;