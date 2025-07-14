import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import Breadcrumbs from "../../../components/Breadcrumbs";
import Input from "../../../components/Input";
import InputDropdown from "../../../components/InputDropdown";
import Table from "../../../components/Table";
import Button from "../../../components/Button";
import Gallery2 from "../../../components/Gallery2";
import TextArea from "../../../components/Textarea";
import AlertSuccess from "../../../components/AlertSuccess";
import Spinner from "../../../components/Spinner";
import LayoutWithNav from "../../../components/LayoutWithNav";
import api from "../../../utils/api";
import AlertError from "../../../components/AlertError";

export default function EditPenjualanNonCustomKasir() {
    const { id } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const { toko_id: stateTokoId, cabang_id: stateCabangId, fromLaporanKeuangan } = location.state || {};

    // User data and role info
    const userData = JSON.parse(localStorage.getItem('userData'));
    const isAdminGudang = userData?.role === 'admingudang'
    const isHeadGudang = userData?.role === 'headgudang';
    const isOwner = userData?.role === 'owner';
    const isManajer = userData?.role === 'manajer';
    const isAdmin = userData?.role === 'admin';
    const isFinance = userData?.role === 'finance'
    const toko_id = fromLaporanKeuangan ? stateTokoId : userData.tokoId;
    const cabang_id = fromLaporanKeuangan ? stateCabangId : userData.userId;

    const themeColor = (isAdminGudang || isHeadGudang) 
    ? 'coklatTua' 
    : (isManajer || isOwner || isFinance) 
      ? "biruTua" 
      : (isAdmin && userData?.userId !== 1 && userData?.userId !== 2)
        ? "hitam"
        : "primary";

    // Form state
    const [nomor, setNomor] = useState("");
    const [tanggal, setTanggal] = useState(getCurrentDateTime());
    const [namaPembeli, setNamaPembeli] = useState("");
    const [note, setNote] = useState("");
    const [selectBayar, setSelectedBayar] = useState("");
    const [selectMetode, setSelectMetode] = useState("");
    const [diskon, setDiskon] = useState(0);
    const [pajak, setPajak] = useState(0);
    const [isMetodeDisabled, setIsMetodeDisabled] = useState(false);

    // Data state
    const [dataCabang, setDataCabang] = useState([
        { nama: "Rincian Produk", data: [] },
        { nama: "Packaging", data: [] } 
    ]);

    // Category state
    const [kategoriPackaging, setKategoriPackaging] = useState(["Semua"]);
    const [dataPackaging, setDataPackaging] = useState([
        {
            jenis: "Packaging",
            kategori: ["Semua"],
            items: []
        }
    ]);
    const [kategoriBarang, setKategoriBarang] = useState({
        "Barang Handmade": [],
        "Barang Non-Handmade": []
    });
    const [dataBarang, setDataBarang] = useState([
        {
            jenis: "Barang Handmade",
            kategori: ["Semua"],
            items: []
        },
        {
            jenis: "Barang Non-Handmade",
            kategori: ["Semua"],
            items: []
        }
    ]);
    const [dataMetode, setDataMetode] = useState([]);
    const [isBarangLoaded, setIsBarangLoaded] = useState(false);
    const [isPackagingLoaded, setIsPackagingLoaded] = useState(false);

    // UI state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isPackagingModalOpen, setIsPackagingModalOpen] = useState(false);
    const [activeCabang, setActiveCabang] = useState(null);
    const [isLoading, setLoading] = useState(false);
    const [isModalSucc, setModalSucc] = useState(false);
    const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    // Modal state
    const [selectedCategory, setSelectedCategory] = useState("Semua");
    const [selectedJenis, setSelectedJenis] = useState("Barang Handmade");
    const [selectedItems, setSelectedItems] = useState([]);
    // State untuk modal packaging
    const [selectedPackagingCategory, setSelectedPackagingCategory] = useState("Semua");
    const [selectedPackagingItems, setSelectedPackagingItems] = useState([]);

    // Tambahkan state untuk pagination
    const [packagingLimit, setPackagingLimit] = useState(50);

    // Utility functions
    function getCurrentDateTime() {
        const now = new Date();
        
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        
        return `${year}-${month}-${day}T${hours}:${minutes}`;
    }

    // Calculation functions
    const calculateSubtotal = () => {
        return dataCabang.reduce((acc, cabang) => {
            const totalCabang = cabang.data.reduce((cabAcc, row) => {
                return cabAcc + (row.rawTotalBiaya || 0);
            }, 0);
            return acc + totalCabang;
        }, 0);
    };

    const calculateTotalPenjualan = (subtotal) => {
        const diskonNominal = (diskon / 100) * subtotal; 
        return subtotal - diskonNominal - pajak;
    };

    // Fetch data functions
    const fetchPenjualan = async () => {
        try {
            const response = await api.get(`/penjualan/${id}`);
            if (response.data.success) {
                const data = response.data.data;
                
                setNomor(data.penjualan_id);
                setTanggal(data.tanggal.split('.')[0]);
                setNamaPembeli(data.nama_pembeli);
                setNote(data.catatan);
                setDiskon(data.diskon);
                setPajak(data.pajak);

                if (data.cash_or_non) {
                    setSelectedBayar("1");
                    setIsMetodeDisabled(true);
                } else {
                    setSelectedBayar("2");
                    setIsMetodeDisabled(false);
                    if (data.metode_id) {
                        setSelectMetode(data.metode_id.toString());
                    }
                }

                // Process products and packaging
                const rincianProduk = [];
                const rincianPackaging = [];

                data.produk.forEach((item, index) => {
                    if (item.barang_handmade || item.barang_non_handmade) {
                        const product = item.barang_handmade || item.barang_non_handmade;
                        const jenisBarang = item.barang_handmade ? "Barang Handmade" : "Barang Non-Handmade";
                        // Cari dropdown options dari dataBarang
                        let dropdownOptions = [];
                        if (Array.isArray(dataBarang)) {
                            dropdownOptions = dataBarang.reduce((allItems, data) => {
                                const items = (data.items || []).map(item => ({
                                    label: item.name,
                                    value: item.id,
                                    price: item.price,
                                    jenis: data.jenis,
                                    kategori: item.kategori,
                                    image: item.image
                                }));
                                return [...allItems, ...items];
                            }, []);
                        }
                        rincianProduk.push({
                            id: product.barang_handmade_id || product.barang_non_handmade_id,
                            timestamp: Date.now() + index, // Tambahkan timestamp + index untuk memastikan unik
                            No: index + 1,
                            "Foto Produk": (
                                <img
                                    src={`${import.meta.env.VITE_API_URL}/images-${jenisBarang.toLowerCase().replace(' ', '-')}/${product.image}`}
                                    alt={product.nama_barang}
                                    className="w-12 h-12"
                                />
                            ),
                            "Nama Produk": dropdownOptions.length > 0 ? (
                                <InputDropdown
                                    showRequired={false}
                                    options={dropdownOptions}
                                    value={product.barang_handmade_id || product.barang_non_handmade_id}
                                    onSelect={(newSelection) => handleDropdownChange(product.barang_handmade_id || product.barang_non_handmade_id, newSelection)}
                                />
                            ) : product.nama_barang,
                            "Jenis Barang": jenisBarang,
                            "Harga Satuan": `Rp${item.harga_satuan.toLocaleString('id-ID')}`,
                            "Kuantitas": (
                                <Input
                                    showRequired={false}
                                    type="number"
                                    value={item.kuantitas}
                                    onChange={(newCount) => handleQuantityChange(product.barang_handmade_id || product.barang_non_handmade_id, newCount)}
                                />
                            ),
                            "Total Biaya": `Rp${item.total_biaya.toLocaleString('id-ID')}`,
                            rawTotalBiaya: item.total_biaya,
                            quantity: item.kuantitas,
                            currentPrice: item.harga_satuan,
                            name: product.nama_barang, // Tambahkan name
                            Aksi: (
                                <button
                                    className="text-red-500 hover:text-red-700"
                                    onClick={() => handleDeleteItem(0, product.barang_handmade_id || product.barang_non_handmade_id)}
                                >
                                    Hapus
                                </button>
                            ),
                        });
                    } else if (item.packaging) {
                        rincianPackaging.push({
                            id: item.packaging.packaging_id,
                            timestamp: Date.now() + index, // Tambahkan timestamp + index untuk memastikan unik
                            No: index + 1,
                            "Foto Produk": (
                                <img
                                    src={`${import.meta.env.VITE_API_URL}/images-packaging/${item.packaging.image}`}
                                    alt={item.packaging.nama_packaging}
                                    className="w-12 h-12"
                                />
                            ),
                            "Nama Packaging": null, // Akan di-update oleh useEffect
                            "Kuantitas": (
                                <Input
                                    showRequired={false}
                                    type="number"
                                    value={item.kuantitas}
                                    onChange={(newCount) => handlePackagingQuantityChange(item.packaging.packaging_id, newCount)}
                                />
                            ),
                            quantity: item.kuantitas,
                            Aksi: (
                                <button
                                    className="text-red-500 hover:text-red-700"
                                    onClick={() => handleDeleteItem(1, item.packaging.packaging_id)}
                                >
                                    Hapus
                                </button>
                            ),
                        });
                    }
                });

                setDataCabang([
                    { nama: "Rincian Produk", data: rincianProduk },
                    { nama: "Packaging", data: rincianPackaging }
                ]);

                setActiveCabang(0);
            }
        } catch (error) {
            console.error('Error fetching penjualan:', error);
            setErrorMessage("Gagal mengambil data penjualan");
            setIsErrorModalOpen(true);
        }
    };

    const fetchPackaging = async () => {
        try {
            let url = `/packaging?toko_id=${toko_id}&limit=10000`;
            const response = await api.get(url);
            if (response.data.success) {
                const packagingItems = response.data.data
                    .filter(item => !item.is_deleted)
                    .map(item => ({
                        id: item.packaging_id,
                        image: item.image 
                            ? `${import.meta.env.VITE_API_URL}/images-packaging/${item.image}` 
                            : "/placeholder-image.jpg",
                        name: `${item.nama_packaging} - ${item.ukuran}`,
                        price: item.harga_jual,
                        kategori: item.kategori_barang.nama_kategori_barang,
                        stock: item.stok_barang?.jumlah_stok || 0
                    }));

                const kategoriBaru = [
                    "Semua", 
                    ...new Set(packagingItems.map(item => item.kategori))
                ];

                setKategoriPackaging(kategoriBaru);

                setDataPackaging(prev => prev.map(packaging => 
                    packaging.jenis === "Packaging" 
                        ? { ...packaging, kategori: kategoriBaru, items: packagingItems }
                        : packaging
                ));
                setIsPackagingLoaded(true);
            }
        } catch (error) {
            console.error('Error fetching packaging:', error);
            setIsPackagingLoaded(true);
        }
    };

    const fetchKategoriBarang = async () => {
        try {
            const response = await api.get(`/kategori-barang?toko_id=${toko_id}`);
            if (response.data.success) {
                const kategoriBaru = response.data.data
                    .filter(kategori => !kategori.is_deleted)
                    .map(kategori => kategori.nama_kategori_barang);

                setKategoriBarang({
                    "Barang Handmade": ["Semua", ...kategoriBaru],
                    "Barang Non-Handmade": ["Semua", ...kategoriBaru]
                });
            }
        } catch (error) {
            console.error('Error fetching kategori barang:', error);
        }
    };

    const fetchBarangHandmade = async () => {
        try {
            let url = `/barang-handmade?cabang=${cabang_id}&limit=10000`;
            const response = await api.get(url);
            if (response.data.success) {
                const handmadeItems = response.data.data
                    .filter(item => !item.is_deleted)
                    .map(item => ({
                        id: item.barang_handmade_id,
                        image: `${import.meta.env.VITE_API_URL}/images-barang-handmade/${item.image}`,
                        code: item.barang_handmade_id,
                        name: item.nama_barang,
                        price: item.rincian_biaya[0]?.harga_logis || 0,
                        kategori: item.kategori_barang.nama_kategori_barang,
                        stock: item.stok_barang?.jumlah_stok || 0
                    }));

                setDataBarang(prev => prev.map(barang => 
                    barang.jenis === "Barang Handmade" 
                        ? { ...barang, items: handmadeItems }
                        : barang
                ));
                setIsBarangLoaded(true);
            }
        } catch (error) {
            console.error('Error fetching barang handmade:', error);
            setIsBarangLoaded(true);
        }
    };

    const fetchBarangNonHandmade = async () => {
        try {
            let url = `/barang-non-handmade?cabang=${cabang_id}&limit=10000`;
            const response = await api.get(url);
            if (response.data.success) {
                const nonHandmadeItems = response.data.data
                    .filter(item => !item.is_deleted)
                    .map(item => ({
                        id: item.barang_non_handmade_id,
                        image: `${import.meta.env.VITE_API_URL}/images-barang-non-handmade/${item.image}`,
                        code: item.barang_non_handmade_id,
                        name: item.nama_barang,
                        price: item.rincian_biaya[0]?.harga_logis || 0,
                        kategori: item.kategori.nama_kategori_barang,
                        stock: item.stok_barang?.jumlah_stok || 0
                    }));

                setDataBarang(prev => prev.map(barang => 
                    barang.jenis === "Barang Non-Handmade" 
                        ? { ...barang, items: nonHandmadeItems }
                        : barang
                ));
                setIsBarangLoaded(true);
            }
        } catch (error) {
            console.error('Error fetching barang non-handmade:', error);
            setIsBarangLoaded(true);
        }
    };

    const fetchMetodePembayaran = async () => {
        try {
            const response = await api.get(`/metode-pembayaran?toko_id=${toko_id}`);
            if (response.data.success) {
                const metodePembayaranOptions = response.data.data
                    .filter(metode => !metode.is_deleted)
                    .map(metode => ({
                        value: metode.metode_id, 
                        label: metode.nama_metode
                    }));
    
                setDataMetode(metodePembayaranOptions);
            }
        } catch (error) {
            console.error('Error fetching metode pembayaran:', error);
        }
    };

    // Event handlers
    const handleSelectBayar = (selectedOption) => {
        setSelectedBayar(selectedOption.value);
        if (selectedOption.value === "2") {
            setIsMetodeDisabled(false);
            setSelectMetode(""); 
        } else { // Cash
            setSelectMetode("");
            setIsMetodeDisabled(true);
        }
    };
    
    const handleSelectMetode = (selectedOption) => {
        setSelectMetode(selectedOption.value);
    };

    const btnAddBaris = (cabangIndex) => {
        setActiveCabang(cabangIndex);
        setIsModalOpen(true);
    };

    const btnAddPackagingBaris = (cabangIndex) => {
        setActiveCabang(cabangIndex);
        setIsPackagingModalOpen(true);
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

    const handleSelectPackagingItem = (item, count) => {
        setSelectedPackagingItems((prev) => {
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

    const handleModalSubmit = () => {
        if (activeCabang !== null) {
            const updatedCabang = [...dataCabang];
            const newItems = selectedItems.map((item) => {

                const productCategory = dataBarang.find(category => 
                    category.items.some(i => i.id === item.id)
                )?.jenis || 'Barang Handmade';
    
                const totalBiaya = parseInt(item.price) * item.count;
                return {
                    id: item.id,
                    timestamp: Date.now() + Math.random(), // Tambahkan timestamp unik
                    No: updatedCabang[activeCabang].data.length + 1,
                    "Foto Produk": (
                        <img
                            src={item.image}
                            alt={item.name}
                            className="w-12 h-12"
                        />
                    ),
                    "Nama Produk": (
                        <InputDropdown
                            showRequired={false}
                            options={dataBarang.reduce((allItems, data) => {
                                const items = data.items.map(item => ({
                                    label: item.name,
                                    value: item.id,
                                    price: item.price,
                                    jenis: data.jenis,
                                    kategori: item.kategori,
                                    image: item.image
                                }));
                                return [...allItems, ...items];
                            }, [])}
                            value={item.id} 
                            onSelect={(newSelection) => handleDropdownChange(item.id, newSelection)}
                        />
                    ),
                    "Jenis Barang": productCategory,
                    "Harga Satuan": `Rp${item.price.toLocaleString()}`,
                    "Kuantitas": (
                        <Input
                            showRequired={false}
                            type="number"
                            value={item.count}
                            onChange={(newCount) => handleQuantityChange(item.id, newCount)}
                        />
                    ),
                    quantity: item.count,
                    "Total Biaya": `Rp${totalBiaya.toLocaleString()}`,
                    rawTotalBiaya: totalBiaya,
                    currentPrice: item.price,
                    Aksi: (
                        <button
                            className="text-red-500 hover:text-red-700"
                            onClick={() => handleDeleteItem(activeCabang, item.id)}
                        >
                            Hapus
                        </button>
                    ),
                };
            });
            updatedCabang[activeCabang].data.push(...newItems);
            setDataCabang(updatedCabang);
        }
        setIsModalOpen(false);
        setSelectedItems([]);
    };

    const handlePackagingModalSubmit = () => {
        if (activeCabang !== null) {
            const updatedCabang = [...dataCabang];
            const newItems = selectedPackagingItems.map((item) => {
                return {
                    id: item.id,
                    timestamp: Date.now() + Math.random(), // Tambahkan timestamp unik
                    No: updatedCabang[activeCabang].data.length + 1,
                    "Foto Produk": (
                        <img
                            src={item.image}
                            alt={item.name}
                            className="w-12 h-12"
                        />
                    ),
                    "Nama Packaging": (
                        <InputDropdown
                            showRequired={false}
                            options={dataPackaging.reduce((allItems, data) => {
                                const items = data.items.map(item => ({
                                    label: `${item.name} - ${item.kategori}`,
                                    value: item.id,
                                    price: item.price,
                                    image: item.image
                                }));
                                return [...allItems, ...items];
                            }, [])}
                            value={item.id} 
                            onSelect={(nextSelection) => handlePackagingDropdownChange(item.id, nextSelection)}
                        />
                    ),
                    "Kuantitas": (
                        <Input
                            showRequired={false}
                            type="number"
                            value={item.count}
                            onChange={(newCount) => handlePackagingQuantityChange(item.id, newCount)}
                        />
                    ),
                    quantity: item.count,
                    Aksi: (
                        <button
                            className="text-red-500 hover:text-red-700"
                            onClick={() => handleDeleteItem(activeCabang, item.id)}
                        >
                            Hapus
                        </button>
                    ),
                };
            });
            updatedCabang[activeCabang].data.push(...newItems);
            setDataCabang(updatedCabang);
        }
        setIsPackagingModalOpen(false);
        setSelectedPackagingItems([]);
    };

    const handleDropdownChange = (itemId, nextSelection) => {
        console.log('handleDropdownChange called:', itemId, nextSelection); // Debug log
        
        const updatedDataCabang = [...dataCabang];
        const rowIndex = updatedDataCabang[0].data.findIndex(
            (row) => row.id === itemId
        );

        console.log('Found row at index:', rowIndex); // Debug log
    
        if (rowIndex !== -1) {
            let selectedItem = null;
            let jenisBarang = '';
            
            // Find the selected item across both Handmade and Non-Handmade categories
            for (const category of dataBarang) {
                const found = category.items.find(i => i.id === nextSelection.value);
                if (found) {
                    selectedItem = found;
                    jenisBarang = category.jenis;
                    break;
                }
            }
    
            if (selectedItem) {
                const currentQuantity = updatedDataCabang[0].data[rowIndex].quantity || 0;
                const newTotalBiaya = selectedItem.price * currentQuantity;
                
                console.log('Selected item found:', selectedItem);
                console.log('Current quantity:', currentQuantity);
                console.log('New total biaya:', newTotalBiaya);
                
                // Pastikan dataBarang sudah ter-load sebelum membuat dropdown options
                const dropdownOptions = dataBarang.reduce((allItems, data) => {
                    if (data.items && data.items.length > 0) {
                        const items = data.items.map(item => ({
                            label: item.name,
                            value: item.id,
                            price: item.price,
                            jenis: data.jenis,
                            kategori: item.kategori,
                            image: item.image
                        }));
                        return [...allItems, ...items];
                    }
                    return allItems;
                }, []);
                
                updatedDataCabang[0].data[rowIndex] = {
                    ...updatedDataCabang[0].data[rowIndex],
                    id: selectedItem.id,
                    timestamp: Date.now() + rowIndex, // Tambahkan timestamp + rowIndex untuk memastikan key unik
                    "Foto Produk": (
                        <img
                            src={selectedItem.image}
                            alt={selectedItem.name}
                            className="w-12 h-12"
                        />
                    ),
                    "Nama Produk": (
                        <InputDropdown
                            showRequired={false}
                            options={dropdownOptions.length > 0 ? dropdownOptions : []}
                            value={selectedItem.id}
                            onSelect={(nextSelection) => handleDropdownChange(selectedItem.id, nextSelection)}
                        />
                    ),
                    "Jenis Barang": jenisBarang,
                    "Harga Satuan": `Rp${selectedItem.price.toLocaleString('id-ID')}`,
                    "Total Biaya": `Rp${newTotalBiaya.toLocaleString('id-ID')}`,
                    rawTotalBiaya: newTotalBiaya,
                    name: selectedItem.name,
                    currentPrice: selectedItem.price,
                    quantity: currentQuantity
                };
    
                setDataCabang(updatedDataCabang);
            } else {
                console.log('Selected item not found for value:', nextSelection.value);
            }
        } else {
            console.log('Row not found for itemId:', itemId);
            console.log('Available rows:', updatedDataCabang[0].data.map(row => ({ id: row.id, name: row.name })));
        }
    };

    const handlePackagingDropdownChange = (itemId, nextSelection) => {
        console.log('handlePackagingDropdownChange called:', itemId, nextSelection); // Debug log
        
        const updatedDataCabang = [...dataCabang];
        const rowIndex = updatedDataCabang[1].data.findIndex(
            (row) => row.id === itemId
        );

        console.log('Found packaging row at index:', rowIndex); // Debug log
    
        if (rowIndex !== -1) {
            const selectedItem = dataPackaging
                .flatMap(category => category.items)
                .find(i => i.id === nextSelection.value);
    
            if (selectedItem) {
                const currentQuantity = updatedDataCabang[1].data[rowIndex].quantity || 1;
                
                console.log('Selected packaging item found:', selectedItem);
                console.log('Current quantity:', currentQuantity);
                
                // Pastikan dataPackaging sudah ter-load sebelum membuat dropdown options
                const packagingDropdownOptions = dataPackaging.reduce((allItems, data) => {
                    if (data.items && data.items.length > 0) {
                        const items = data.items.map(item => ({
                            label: `${item.name}`,
                            value: item.id,
                            price: item.price,
                            image: item.image
                        }));
                        return [...allItems, ...items];
                    }
                    return allItems;
                }, []);
                
                updatedDataCabang[1].data[rowIndex] = {
                    ...updatedDataCabang[1].data[rowIndex],
                    id: selectedItem.id,
                    timestamp: Date.now() + rowIndex, // Tambahkan timestamp + rowIndex untuk memastikan key unik
                    "Foto Produk": (
                        <img
                            src={selectedItem.image}
                            alt={selectedItem.name}
                            className="w-12 h-12"
                        />
                    ),
                    "Nama Packaging": (
                        <InputDropdown
                            showRequired={false}
                            options={packagingDropdownOptions.length > 0 ? packagingDropdownOptions : []}
                            value={selectedItem.id}
                            onSelect={(nextSelection) => handlePackagingDropdownChange(selectedItem.id, nextSelection)}
                        />
                    ),
                    quantity: currentQuantity
                };
    
                setDataCabang(updatedDataCabang);
            } else {
                console.log('Selected packaging item not found for value:', nextSelection.value);
            }
        }
    };

    const handleQuantityChange = (itemId, newCount) => {
        const cabangIndex = 0;
        setActiveCabang(cabangIndex);
        
        setDataCabang(prevDataCabang => {
            const updatedDataCabang = [...prevDataCabang];
            const rowIndex = updatedDataCabang[cabangIndex].data.findIndex(
                (row) => row.id === itemId
            );
        
            if (rowIndex !== -1) {
                const currentItem = updatedDataCabang[cabangIndex].data[rowIndex];
                const parsedCount = Number(newCount);
                const newTotal = currentItem.currentPrice * parsedCount;
                
                updatedDataCabang[cabangIndex].data[rowIndex] = {
                    ...updatedDataCabang[cabangIndex].data[rowIndex],
                    quantity: parsedCount,
                    rawTotalBiaya: newTotal,
                    "Total Biaya": `Rp${newTotal.toLocaleString()}`
                };
            }
            
            return updatedDataCabang;
        });
    };

    const handlePackagingQuantityChange = (itemId, newCount) => {
        const cabangIndex = 1;
        setActiveCabang(cabangIndex);
        setDataCabang(prevDataCabang => {
            const updatedDataCabang = [...prevDataCabang];
            const rowIndex = updatedDataCabang[cabangIndex].data.findIndex(
                (row) => row.id === itemId
            );
        
            if (rowIndex !== -1) {
                const currentItem = updatedDataCabang[cabangIndex].data[rowIndex];
                const parsedCount = Number(newCount);
                const newTotal = (currentItem.currentPrice || 0) * parsedCount;
                
                updatedDataCabang[cabangIndex].data[rowIndex] = {
                    ...updatedDataCabang[cabangIndex].data[rowIndex],
                    quantity: parsedCount,
                    rawTotalBiaya: newTotal,
                    "Total Biaya": `Rp${newTotal.toLocaleString()}`
                };
            }
            
            return updatedDataCabang;
        });
    };

    const handleDeleteItem = (cabangIndex, itemId) => {
        setDataCabang(prevState => {
            const newState = [...prevState];
            
            newState[cabangIndex] = {
                ...newState[cabangIndex],
                data: newState[cabangIndex].data.filter(item => item.id !== itemId)
            };
    
            newState[cabangIndex].data = newState[cabangIndex].data.map((item, index) => ({
                ...item,
                No: index + 1
            }));
    
            return newState;
        });
    };

    const handleTambahSubmit = async (e) => {
        e.preventDefault();
    
        // Validasi
        if (!selectBayar) {
            setErrorMessage("Silakan pilih metode pembayaran (Cash/Non-Cash)");
            setIsErrorModalOpen(true);
            return;
        }
    
        if (selectBayar === "2" && !selectMetode) {
            setErrorMessage("Silakan pilih metode pembayaran untuk transaksi non-cash");
            setIsErrorModalOpen(true);
            return;
        }
    
        const hasProducts = dataCabang.some(cabang => cabang.data.length > 0);
        if (!hasProducts) {
            setErrorMessage("Silakan pilih minimal satu produk");
            setIsErrorModalOpen(true);
            return;
        }
    
        try {
            setLoading(true);
            const produkArray = [];
            dataCabang.forEach((cabang, cabangIndex) => {
                cabang.data.forEach(item => {
                    if (cabangIndex === 0) { // Rincian Produk
                        if (item["Jenis Barang"] === "Barang Handmade") {
                            produkArray.push({
                                barang_handmade_id: item.id,
                                harga_satuan: parseInt(item.currentPrice),
                                kuantitas: parseInt(item.quantity),
                                total_biaya: parseInt(item.rawTotalBiaya)
                            });
                        } else if (item["Jenis Barang"] === "Barang Non-Handmade") {
                            produkArray.push({
                                barang_non_handmade_id: item.id,
                                harga_satuan: parseInt(item.currentPrice),
                                kuantitas: parseInt(item.quantity),
                                total_biaya: parseInt(item.rawTotalBiaya)
                            });
                        }
                    } 
                    else if (cabangIndex === 1) { // Packaging
                        produkArray.push({
                            packaging_id: item.id,
                            kuantitas: parseInt(item.quantity)
                        });
                    }
                });
            });
    
            const isCash = selectBayar === "1";
            const subtotal = calculateSubtotal();
            const total = calculateTotalPenjualan(subtotal);

            const requestBody = {
                cash_or_non: isCash,
                metode_id: isCash ? null : parseInt(selectMetode),
                sub_total: subtotal,
                diskon: parseFloat(diskon),
                pajak: parseFloat(pajak),
                total_penjualan: total,
                produk: produkArray
            };

            const response = await api.put(`/penjualan/${id}`, requestBody);
    
            if (response.data.success) {
                setModalSucc(true);
            } else {
                setErrorMessage(response.data.message || "Gagal mengupdate penjualan");
                setIsErrorModalOpen(true);
            }
        } catch (error) {
            console.error('Error updating penjualan:', error);
            setErrorMessage(error.response?.data?.message || "Terjadi kesalahan saat mengupdate penjualan");
            setIsErrorModalOpen(true);
        } finally {
            setLoading(false);
        }
    };

    // Tambahkan state untuk pagination dan data barang dari API
    const [barangList, setBarangList] = useState([]);
    // const [barangLoading, setBarangLoading] = useState(false); // (Jika ingin loading spinner, gunakan ini)
    const [barangPage, setBarangPage] = useState(1);
    const [barangTotalPages, setBarangTotalPages] = useState(1);
    const [barangTotalItems, setBarangTotalItems] = useState(0);
    const [barangLimit, setBarangLimit] = useState(50);
    const [barangCategoryId, setBarangCategoryId] = useState(null);
    const [barangSearch, setBarangSearch] = useState("");

    // Mapping nama kategori ke id (jika ada)
    const kategoriIdMap = {};
    kategoriBarang["Barang Handmade"]?.forEach((nama, idx) => {
        if (nama !== "Semua") kategoriIdMap[nama] = idx + 1;
    });
    kategoriBarang["Barang Non-Handmade"]?.forEach((nama, idx) => {
        if (nama !== "Semua") kategoriIdMap[nama] = idx + 1;
    });
    // Handler untuk perubahan kategori (ambil id kategori)
    const handleCategoryChange = (kategori) => {
        setSelectedCategory(kategori);
        if (kategori === "Semua") {
            setBarangCategoryId(null);
        } else {
            setBarangCategoryId(kategoriIdMap[kategori] || null);
        }
        setBarangPage(1);
    };

    // Handler search
    const handleBarangSearch = (e) => {
        setBarangSearch(e.target.value);
        setBarangPage(1);
    };

    // Handler page dan limit
    const handleBarangPageChange = (page) => setBarangPage(page);
    const handleBarangLimitChange = (limit) => {
        setBarangLimit(limit);
        setBarangPage(1);
    };

    // Fetch barang dari API (handmade/non-handmade)
    const fetchBarang = async () => {
        // setBarangLoading(true); // (Jika ingin loading spinner, gunakan ini)
        try {
            let endpoint = selectedJenis === "Barang Handmade" ? "/barang-handmade" : "/barang-non-handmade";
            const params = {
                page: barangPage,
                limit: barangLimit,
                cabang: cabang_id,
            };
            if (barangCategoryId) params.category = barangCategoryId;
            if (barangSearch) params.search = barangSearch;
            const res = await api.get(endpoint, { params });
            const data = res.data.data.map(item => ({
                id: item.barang_handmade_id || item.barang_non_handmade_id,
                image: item.image ? `${import.meta.env.VITE_API_URL}/${selectedJenis === "Barang Handmade" ? "images-barang-handmade" : "images-barang-non-handmade"}/${item.image}` : "/placeholder-image.jpg",
                name: item.nama_barang,
                price: item.rincian_biaya?.[0]?.harga_logis || 0,
                kategori: item.kategori_barang?.nama_kategori_barang || item.kategori?.nama_kategori_barang || "",
                stock: item.stok_barang?.jumlah_stok || 0
            }));
            setBarangList(data);
            setBarangTotalPages(res.data.pagination.totalPages);
            setBarangTotalItems(res.data.pagination.totalItems);
        } catch {
            setBarangList([]);
            setBarangTotalPages(1);
            setBarangTotalItems(0);
        } finally {
            // setBarangLoading(false); // (Jika ingin loading spinner, gunakan ini)
        }
    };

    // Trigger fetch barang saat modal tambah baris dibuka atau filter berubah
    useEffect(() => {
        if (isModalOpen) {
            fetchBarang();
        }
        // eslint-disable-next-line
    }, [isModalOpen, barangPage, barangLimit, barangCategoryId, barangSearch, selectedJenis]);

    // Tambahkan state untuk pagination dan data packaging dari API
    const [packagingList, setPackagingList] = useState([]);
    const [packagingPage, setPackagingPage] = useState(1);
    const [packagingTotalPages, setPackagingTotalPages] = useState(1);
    const [packagingTotalItems, setPackagingTotalItems] = useState(0);
    const [packagingCategoryId, setPackagingCategoryId] = useState(null);
    const [packagingSearch, setPackagingSearch] = useState("");

    // Handler untuk perubahan kategori packaging
    const handlePackagingCategoryChange = (kategori) => {
        setSelectedPackagingCategory(kategori);
        if (kategori === "Semua") {
            setPackagingCategoryId(null);
        } else {
            // Mapping nama ke id jika ada, atau gunakan index+1
            setPackagingCategoryId(kategoriPackaging.indexOf(kategori) + 1);
        }
        setPackagingPage(1);
    };

    // Handler search packaging
    const handlePackagingSearch = (e) => {
        setPackagingSearch(e.target.value);
        setPackagingPage(1);
    };

    // Handler page dan limit packaging
    const handlePackagingPageChange = (page) => setPackagingPage(page);
    const handlePackagingLimitChange = (limit) => {
        setPackagingLimit(limit);
        setPackagingPage(1);
    };

    // Fetch packaging dari API
    const fetchPackagingPaginated = async () => {
        try {
            const params = {
                page: packagingPage,
                limit: packagingLimit,
                toko_id: toko_id,
            };
            if (packagingCategoryId) params.category = packagingCategoryId;
            if (packagingSearch) params.search = packagingSearch;
            const res = await api.get("/packaging", { params });
            const data = res.data.data
                .filter(item => !item.is_deleted)
                .map(item => ({
                    id: item.packaging_id,
                    image: item.image 
                        ? `${import.meta.env.VITE_API_URL}/images-packaging/${item.image}` 
                        : "/placeholder-image.jpg",
                    name: `${item.nama_packaging} - ${item.ukuran}`,
                    price: item.harga_jual,
                    kategori: item.kategori_barang.nama_kategori_barang,
                    stock: item.stok_barang?.jumlah_stok || 0
                }));
            setPackagingList(data);
            setPackagingTotalPages(res.data.pagination.totalPages);
            setPackagingTotalItems(res.data.pagination.totalItems);
        } catch {
            setPackagingList([]);
            setPackagingTotalPages(1);
            setPackagingTotalItems(0);
        }
    };

    // Trigger fetch packaging saat modal tambah packaging dibuka atau filter berubah
    useEffect(() => {
        if (isPackagingModalOpen) {
            fetchPackagingPaginated();
        }
        // eslint-disable-next-line
    }, [isPackagingModalOpen, packagingPage, packagingLimit, packagingCategoryId, packagingSearch]);

    // Effects
    useEffect(() => {
        fetchPackaging();
        fetchKategoriBarang();
        fetchBarangHandmade();
        fetchBarangNonHandmade();
        fetchMetodePembayaran();
    }, []);

    // Fetch penjualan setelah data barang dan packaging ter-load
    useEffect(() => {
        if (isBarangLoaded && isPackagingLoaded) {
            fetchPenjualan();
        }
    }, [isBarangLoaded, isPackagingLoaded]);

    // Force re-render dropdowns setelah data ter-load
    useEffect(() => {
        if (isBarangLoaded && isPackagingLoaded && dataCabang.length > 0) {
            const updatedDataCabang = [...dataCabang];
            
            // Update dropdown options untuk rincian produk
            if (updatedDataCabang[0] && updatedDataCabang[0].data.length > 0) {
                const dropdownOptions = dataBarang.reduce((allItems, data) => {
                    if (data.items && data.items.length > 0) {
                        const items = data.items.map(item => ({
                            label: item.name,
                            value: item.id,
                            price: item.price,
                            jenis: data.jenis,
                            kategori: item.kategori,
                            image: item.image
                        }));
                        return [...allItems, ...items];
                    }
                    return allItems;
                }, []);

                updatedDataCabang[0].data = updatedDataCabang[0].data.map(row => ({
                    ...row,
                    "Nama Produk": (
                        <InputDropdown
                            showRequired={false}
                            options={dropdownOptions}
                            value={row.id}
                            onSelect={(newSelection) => handleDropdownChange(row.id, newSelection)}
                        />
                    )
                }));
            }

            // Update dropdown options untuk packaging
            if (updatedDataCabang[1] && updatedDataCabang[1].data.length > 0) {
                const packagingDropdownOptions = dataPackaging.reduce((allItems, data) => {
                    if (data.items && data.items.length > 0) {
                        const items = data.items.map(item => ({
                            label: `${item.name}`,
                            value: item.id,
                            price: item.price,
                            image: item.image
                        }));
                        return [...allItems, ...items];
                    }
                    return allItems;
                }, []);

                updatedDataCabang[1].data = updatedDataCabang[1].data.map(row => ({
                    ...row,
                    "Nama Packaging": (
                        <InputDropdown
                            showRequired={false}
                            options={packagingDropdownOptions}
                            value={row.id}
                            onSelect={(nextSelection) => handlePackagingDropdownChange(row.id, nextSelection)}
                        />
                    )
                }));
            }

            setDataCabang(updatedDataCabang);
        }
    }, [isBarangLoaded, isPackagingLoaded, dataBarang, dataPackaging]);



    useEffect(() => {
        if (isModalOpen || isPackagingModalOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => {
            document.body.style.overflow = "";
        };
    }, [isModalOpen, isPackagingModalOpen]);

    useEffect(() => {
        if (selectBayar === "1") { // Jika Cash
            setIsMetodeDisabled(true);
            setSelectMetode("");
        } else if (selectBayar === "2") { // Jika Non-Cash
            setIsMetodeDisabled(false);
        }
    }, [selectBayar]);

    // Table configurations
    const headers = [
        { label: "No", key: "No", align: "text-left" },
        { label: "Foto Produk", key: "Foto Produk", align: "text-left" },
        { label: "Nama Produk", key: "Nama Produk", align: "text-left" },
        { label: "Jenis Barang", key: "Jenis Barang", align: "text-left" },
        { label: "Harga Satuan", key: "Harga Satuan", align: "text-left" },
        { label: "Kuantitas", key: "Kuantitas", align: "text-left", width:'110px' },
        { label: "Total Biaya", key: "Total Biaya", align: "text-left" },
        { label: "Aksi", key: "Aksi", align: "text-left" },
    ];

    const packagingHeaders = [
        { label: "No", key: "No", align: "text-left" },
        { label: "Foto Produk", key: "Foto Produk", align: "text-left" },
        { label: "Nama Packaging", key: "Nama Packaging", align: "text-left" },
        { label: "Kuantitas", key: "Kuantitas", align: "text-left", width: '110px' },
        { label: "Aksi", key: "Aksi", align: "text-left" }
    ];



    // Pagination logic
    // (hapus totalHandmadePages dan paginatedItems karena sudah pakai API)

    // Breadcrumb configuration
    const breadcrumbItems = fromLaporanKeuangan 
        ? [
            { label: "Daftar Laporan Keuangan", href: "/laporanKeuangan" },
            { label: "Edit Penjualan", href: "" },
        ]
        : isAdminGudang 
            ? [
                { label: "Daftar Penjualan Toko", href: "/penjualan-admin-gudang" },
                { label: "Edit Penjualan", href: "" },
            ]
            : [
                { label: "Daftar Penjualan Toko", href: "/penjualan-kasir" },
                { label: "Edit Penjualan", href: "" },
            ];

    // Calculation values
    const subtotal = calculateSubtotal();
    const totalPenjualan = calculateTotalPenjualan(subtotal);
    const dataBayar = [
        { id: "1", label: "Cash" },
        { id: "2", label: "Non-Cash" }
    ];

    return (
        <>
            <LayoutWithNav>
                <div className="p-5">
                    <Breadcrumbs items={breadcrumbItems} />
    
                    {/* Section Form Input */}
                    <section className="bg-white p-5 mt-5 rounded-xl">
                        <form onSubmit={handleTambahSubmit}>
                            <section>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <Input 
                                        label={"Nomor"} 
                                        type1={"text"} 
                                        disabled={true} 
                                        value={nomor} 
                                        onChange={(e) => setNomor(e)} 
                                    />
                                    <Input 
                                        label={"Tanggal dan Waktu"} 
                                        type1={"datetime-local"} 
                                        value={tanggal} 
                                        onChange={(e) => setTanggal(e)} 
                                    />
                                    <Input 
                                        label={"Nama Pembeli"} 
                                        value={namaPembeli} 
                                        required={false}
                                        onChange={(e) => setNamaPembeli(e)} 
                                    />
                                    <InputDropdown 
                                        label="Cash/Non-Cash"
                                        options={dataBayar.map(item => ({
                                            value: item.id, 
                                            label: item.label
                                        }))}
                                        value={selectBayar}
                                        onSelect={handleSelectBayar}
                                        required={true}
                                    />
                                    <div className="">
                                        <InputDropdown 
                                            label="Metode Pembayaran"
                                            options={dataMetode} 
                                            value={selectMetode}
                                            onSelect={handleSelectMetode}
                                            disabled={isMetodeDisabled}
                                            required={!isMetodeDisabled}
                                        />
                                    </div>
                                </div>
                            </section>
    
                            <section className="pt-10">
                                {dataCabang.map((cabang, index) => (
                                    <div key={index} className="pt-5">
                                        <p className="font-bold">{cabang.nama}</p>
                                        <div className="pt-5">
                                            <Table 
                                                headers={cabang.nama === "Packaging" ? packagingHeaders : headers} 
                                                data={cabang.data.map((row, index) => ({
                                                    ...row,
                                                    key: `${row.id}-${index}` // HAPUS timestamp dari key
                                                }))} 
                                            />
                                            <Button
                                                label="Tambah Baris"
                                                icon={
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                                                    </svg>
                                                }
                                                onClick={() => 
                                                    cabang.nama === "Packaging" 
                                                        ? btnAddPackagingBaris(index) 
                                                        : btnAddBaris(index)
                                                }
                                                bgColor=""
                                                hoverColor={`hover:border-${themeColor} hover:border`}
                                                textColor={`text-${themeColor}`}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </section>
    
                            {/* section total dan submit*/}
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
                                                    value={diskon}
                                                    required={false}
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
                                                    value={pajak}
                                                    required={false}
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
    
                        {/* Modal Tambah Baris */}
                        {isModalOpen && (
                            <section className="fixed inset-0 bg-white bg-opacity-80 flex justify-center items-center z-50">
                                <div className={`bg-white border border-${themeColor} rounded-md p-6 w-[90%] md:w-[70%] h-[90%] overflow-hidden`}>
                                    {/* Input Search */}
                                    <div className="flex flex-col space-y-4 mb-4">
                                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
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
                                                    placeholder="Cari Barang yang mau dibeli"
                                                    value={barangSearch}
                                                    onChange={handleBarangSearch}
                                                    className="w-full border border-gray-300 rounded-md py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-gray-500"
                                                />
                                            </div>

                                            <div className="flex items-center space-x-4 self-end sm:self-auto">
                                                <button
                                                    onClick={() => {
                                                        setBarangSearch("");
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
                                                <p className={`text-${themeColor} font-semibold whitespace-nowrap`}>
                                                    Terpilih {selectedItems.reduce((sum, item) => sum + item.count, 0)}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Bottom row: Action buttons */}
                                        <div className="flex justify-end gap-4">
                                            <Button
                                                label="Batal"
                                                bgColor="border border-secondary"
                                                hoverColor="hover:bg-gray-100"
                                                textColor="text-black"
                                                onClick={() => {
                                                    setIsModalOpen(false);
                                                    setSelectedItems([]);
                                                }}
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

                                    {/* Tabs for Barang Types */}
                                    <div className="flex border-b border-gray-300 mb-4 overflow-x-auto">
                                        {["Barang Handmade", "Barang Non-Handmade"].map((jenis) => (
                                            <button
                                                key={jenis}
                                                onClick={() => { setSelectedJenis(jenis); setBarangPage(1); }}
                                                className={`px-4 py-2 text-sm font-semibold whitespace-nowrap ${
                                                    selectedJenis === jenis ? `text-${themeColor} border-b-2 border-${themeColor}` : "text-gray-400"
                                                }`}
                                            >
                                                {jenis}
                                            </button>
                                        ))}
                                    </div>

                                    {/* Kategori Buttons */}
                                    <div className="flex flex-wrap gap-2 mt-4">
                                        {kategoriBarang[selectedJenis]?.map((kategori) => (
                                            <button
                                                key={kategori}
                                                onClick={() => handleCategoryChange(kategori)}
                                                className={`px-3 py-1 text-sm md:text-base rounded-md ${
                                                    selectedCategory === kategori
                                                        ? `bg-${themeColor} text-white`
                                                        : "border border-gray-300"
                                                }`}
                                            >
                                                {kategori}
                                            </button>
                                        ))}
                                    </div>

                                    {/* Items per page selector */}
                                    <div className="flex items-center justify-between mt-4 mb-2">
                                        <div className="flex items-center space-x-2">
                                            <label className="text-sm text-gray-600">Items per page:</label>
                                            <select
                                                value={barangLimit}
                                                onChange={(e) => handleBarangLimitChange(Number(e.target.value))}
                                                className="border border-gray-300 rounded-md px-2 py-1 text-sm"
                                            >
                                                <option value={15}>15</option>
                                                <option value={25}>25</option>
                                                <option value={50}>50</option>
                                                <option value={100}>100</option>
                                            </select>
                                        </div>
                                        <div className="text-sm text-gray-600">
                                            Total: {barangTotalItems} items
                                        </div>
                                    </div>
                                    {/* Gallery (dengan pagination bawaan Gallery2) */}
                                    <div className="mt-2 h-[calc(100%-260px)] overflow-y-auto no-scrollbar flex flex-col">
                                        <Gallery2
                                            items={barangList}
                                            onSelect={handleSelectItem}
                                            selectedItems={selectedItems}
                                            enableStockValidation={true}
                                            currentPage={barangPage}
                                            totalPages={barangTotalPages}
                                            totalItems={barangTotalItems}
                                            itemsPerPage={barangLimit}
                                            onPageChange={handleBarangPageChange}
                                            showPagination={true}
                                        />
                                    </div>
                                </div>
                            </section>
                        )}

                        {/* Modal Tambah Packaging */}
                        {isPackagingModalOpen && (
                            <section className="fixed inset-0 bg-white bg-opacity-80 flex justify-center items-center z-50">
                                <div className={`bg-white border border-${themeColor} rounded-md p-6 w-[90%] md:w-[70%] h-[90%] overflow-hidden flex flex-col`}>
                                    {/* Input Search */}
                                    <div className="flex flex-col space-y-4 mb-4">
                                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
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
                                                    placeholder="Cari Packaging"
                                                    value={packagingSearch}
                                                    onChange={handlePackagingSearch}
                                                    className="w-full border border-gray-300 rounded-md py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-gray-500"
                                                />
                                            </div>

                                            <div className="flex items-center space-x-4 self-end sm:self-auto">
                                                <button
                                                    onClick={() => {
                                                        setPackagingSearch("");
                                                        setSelectedPackagingItems([]);
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
                                                <p className={`text-${themeColor} font-semibold whitespace-nowrap`}>
                                                    Terpilih {selectedPackagingItems.reduce((sum, item) => sum + item.count, 0)}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Bottom row: Action buttons */}
                                        <div className="flex justify-end gap-4">
                                            <Button
                                                label="Batal"
                                                bgColor="border border-secondary"
                                                hoverColor="hover:bg-gray-100"
                                                textColor="text-black"
                                                onClick={() => {
                                                    setIsPackagingModalOpen(false);
                                                    setSelectedPackagingItems([]);
                                                }}
                                            />
                                            <Button
                                                label="Pilih"
                                                bgColor={`bg-${themeColor}`}
                                                hoverColor="hover:bg-opacity-90"
                                                textColor="text-white"
                                                onClick={handlePackagingModalSubmit}
                                            />
                                        </div>
                                    </div>

                                    {/* Kategori Buttons */}
                                    <div className="flex flex-wrap gap-2 mt-4">
                                        {kategoriPackaging.map((kategori) => (
                                            <button
                                                key={kategori}
                                                onClick={() => handlePackagingCategoryChange(kategori)}
                                                className={`px-3 py-1 text-sm md:text-base rounded-md ${
                                                    selectedPackagingCategory === kategori
                                                        ? `bg-${themeColor} text-white`
                                                        : "border border-gray-300"
                                                }`}
                                            >
                                                {kategori}
                                            </button>
                                        ))}
                                    </div>

                                    {/* Items per page selector */}
                                    <div className="flex items-center justify-between mt-4 mb-2">
                                        <div className="flex items-center space-x-2">
                                            <label className="text-sm text-gray-600">Items per page:</label>
                                            <select
                                                value={packagingLimit}
                                                onChange={(e) => handlePackagingLimitChange(Number(e.target.value))}
                                                className="border border-gray-300 rounded-md px-2 py-1 text-sm"
                                            >
                                                <option value={15}>15</option>
                                                <option value={25}>25</option>
                                                <option value={50}>50</option>
                                                <option value={100}>100</option>
                                            </select>
                                        </div>
                                        <div className="text-sm text-gray-600">
                                            Total: {packagingTotalItems} items
                                        </div>
                                    </div>
                                    {/* Gallery (dengan pagination bawaan Gallery2) */}
                                    <div className="mt-2 h-[calc(100%-260px)] overflow-y-auto no-scrollbar flex flex-col">
                                        <Gallery2
                                            items={packagingList}
                                            onSelect={handleSelectPackagingItem}
                                            selectedItems={selectedPackagingItems}
                                            enableStockValidation={true}
                                            currentPage={packagingPage}
                                            totalPages={packagingTotalPages}
                                            totalItems={packagingTotalItems}
                                            itemsPerPage={packagingLimit}
                                            onPageChange={handlePackagingPageChange}
                                            showPagination={true}
                                        />
                                    </div>
                                </div>
                            </section>
                        )}
                    </section>
                </div>

                {/* Modal Success */}
                {isModalSucc && (
                    <AlertSuccess
                        title="Berhasil!!"
                        description="Data berhasil diperbaharui"
                        confirmLabel="Ok"
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
    
                {/* Loading Spinner */}
                {isLoading && <Spinner />}

                {/* Error Modal */}
                {isErrorModalOpen && (
                    <AlertError
                        title="Gagal!!" 
                        description={errorMessage}  
                        onConfirm={() => setIsErrorModalOpen(false)}  
                    />
                )}
            </LayoutWithNav>
        </>
    );
}