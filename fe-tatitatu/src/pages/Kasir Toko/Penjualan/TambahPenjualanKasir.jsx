import { useEffect, useState } from "react";
import Breadcrumbs from "../../../components/Breadcrumbs";
import Input from "../../../components/Input";

import InputDropdown from "../../../components/InputDropdown";
import Table from "../../../components/Table";
import Button from "../../../components/Button";
import Gallery2 from "../../../components/Gallery2";
import TextArea from "../../../components/Textarea";
import { useNavigate } from "react-router-dom";
import AlertSuccess from "../../../components/AlertSuccess";
import Spinner from "../../../components/Spinner";
import LayoutWithNav from "../../../components/LayoutWithNav";
import api from "../../../utils/api";
import AlertError from "../../../components/AlertError";

export default function TambahPenjualanKasir() {
    const [nomor, setNomor] = useState("");
    const getCurrentDateTime = () => {
        const now = new Date();
        
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        
        return `${year}-${month}-${day}T${hours}:${minutes}`;
    };
    const [tanggal, setTanggal] = useState(getCurrentDateTime());
    const [namaPembeli, setNamaPembeli] = useState("");
    const [note, setNote] = useState("");
    const [selectBayar, setSelectedBayar] = useState("");
    const [selectMetode, setSelectMetode] = useState("");
    const [diskon, setDiskon] = useState(0);
    const [pajak, setPajak] = useState(0);
    const [kategoriPackaging, setKategoriPackaging] = useState([
        { nama_kategori_barang: "Semua", kategori_barang_id: "Semua" },
        { nama_kategori_barang: "Dus", kategori_barang_id: "Dus" },
        { nama_kategori_barang: "Plastik", kategori_barang_id: "Plastik" },
        { nama_kategori_barang: "Kardus", kategori_barang_id: "Kardus" }
    ]);
    const [dataCabang, setDataCabang] = useState([
        { nama: "Rincian Produk", data: [] },
        { nama: "Packaging", data: [] } 
    ]);
    const [dataPackaging, setDataPackaging] = useState([
        {
            jenis: "Packaging",
            kategori: ["Semua"],
            items: []
        }
    ]);
    
    const userData = JSON.parse(localStorage.getItem('userData'));
    const isAdminGudang = userData?.role === 'admingudang';
    const isHeadGudang = userData?.role === 'headgudang';
    const isKasirToko = userData?.role === 'kasirtoko';
    const isManajer = userData?.role === 'manajer';
    const isOwner = userData?.role === 'owner';
    const isFinance = userData?.role === 'finance';
    const isAdmin = userData?.role === 'admin';
    const isKaryawanProduksi = userData?.role === 'karyawanproduksi';
    const cabang_id = userData.userId;
    const toko_id = userData?.tokoId;

    const themeColor = (isAdminGudang || isHeadGudang || isKaryawanProduksi || toko_id === 1) 
    ? 'coklatTua' 
    : (isManajer || isOwner || isFinance) 
      ? "biruTua" 
      : ((isAdmin && userData?.userId !== 1 && userData?.userId !== 2) || 
         (isKasirToko && toko_id !== undefined && toko_id !== null && toko_id !== 1 && toko_id !== 2))
        ? "hitam"
        : "primary";

    const fetchPackaging = async () => {
        try {
            const response = await api.get(`/packaging?toko_id=${toko_id}&limit=1000`);
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
                        kategori_id: item.kategori_barang.kategori_barang_id,
                        stock: item.stok_barang?.jumlah_stok
                    }));

                // Ambil unique kategori sebagai array objek
                const kategoriSet = new Map();
                packagingItems.forEach(item => {
                    if (!kategoriSet.has(item.kategori_id)) {
                        kategoriSet.set(item.kategori_id, {
                            nama_kategori_barang: item.kategori,
                            kategori_barang_id: item.kategori_id
                        });
                    }
                });
                const kategoriBaru = [{ nama_kategori_barang: "Semua", kategori_barang_id: "Semua" }, ...Array.from(kategoriSet.values())];

                setKategoriPackaging(kategoriBaru);

                setDataPackaging(prev => prev.map(packaging => 
                    packaging.jenis === "Packaging" 
                        ? { ...packaging, kategori: kategoriBaru, items: packagingItems }
                        : packaging
                ));
            }
        } catch (error) {
            console.error('Error fetching packaging:', error);
        }
    };

    useEffect(() => {
        fetchPackaging();
    }, []);


    const [isModalOpen, setIsModalOpen] = useState(false);
    const [activeCabang, setActiveCabang] = useState(null);

    // Modal gallery state
    const [selectedCategory, setSelectedCategory] = useState("Semua");
    const [selectedJenis, setSelectedJenis] = useState("Barang Handmade");
    const [selectedItems, setSelectedItems] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [isLoading, setLoading] = useState(false);
    const [isModalSucc, setModalSucc] = useState(false);
    const [isMetodeDisabled, setIsMetodeDisabled] = useState(false);
    const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    
    const [pagination, setPagination] = useState({
        "Barang Handmade": { page: 1, limit: 12, total: 0 },
        "Barang Non-Handmade": { page: 1, limit: 12, total: 0 },
        "Packaging": { page: 1, limit: 12, total: 0 },
    });
    const [barangData, setBarangData] = useState({
        "Barang Handmade": { items: [], total: 0 },
        "Barang Non-Handmade": { items: [], total: 0 },
        "Packaging": { items: [], total: 0 },
    });

    const [searchTermInput, setSearchTermInput] = useState("");
    const [packagingSearchTermInput, setPackagingSearchTermInput] = useState("");

    useEffect(() => {
        if (isModalOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => {
            document.body.style.overflow = "";
        };
    }, [isModalOpen]);

    
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

    const handleSelectBayar = (selectedOption) => {
        setSelectedBayar(selectedOption.value);
        if (selectedOption.value === 2) { // Non-Cash
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
    const breadcrumbItems = isAdminGudang 
        ? [
            { label: "Daftar Penjualan Toko", href: "/penjualan-admin-gudang" },
            { label: "Tambah Penjualan", href: "" },
        ]
        : [
            { label: "Daftar Penjualan Toko", href: "/penjualan-kasir" },
            { label: "Tambah Penjualan", href: "" },
        ];

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
    

    const btnAddPackagingBaris = (cabangIndex) => {
        setActiveCabang(cabangIndex);
        setIsPackagingModalOpen(true);
        // Reset search and filter when opening modal
        setPackagingSearchTerm("");
        setPackagingSearchTermInput("");
        setSelectedPackagingCategory("Semua");
        // Fetch packaging data with pagination
        fetchBarangPaginated("Packaging", {
            page: pagination["Packaging"].page,
            limit: pagination["Packaging"].limit,
            category: "Semua",
            search: ""
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

    const handlePackagingModalSubmit = () => {
        if (activeCabang !== null) {
            const updatedCabang = [...dataCabang];
            const newItems = selectedPackagingItems.map((item, index) => {
                return {
                    id: item.id,
                    No: updatedCabang[activeCabang].data.length + index + 1,
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
            // Renumber all items after adding new ones
            updatedCabang[activeCabang].data = updatedCabang[activeCabang].data.map((item, index) => ({
                ...item,
                No: index + 1
            }));
            setDataCabang(updatedCabang);
        }
        setIsPackagingModalOpen(false);
        setSelectedPackagingItems([]);
    };

    const handlePackagingDropdownChange = (itemId, nextSelection) => {
        const updatedDataCabang = [...dataCabang];
        const rowIndex = updatedDataCabang[activeCabang].data.findIndex(
            (row) => row.id === itemId
        );
    
        if (rowIndex !== -1) {
            const selectedItem = dataPackaging
                .flatMap(category => category.items)
                .find(i => i.id === nextSelection.value);
    
            if (selectedItem) {
                const currentQuantity = updatedDataCabang[activeCabang].data[rowIndex].quantity || 1;
                const newTotalBiaya = selectedItem.price * currentQuantity;
                const currentNo = updatedDataCabang[activeCabang].data[rowIndex].No;
                
                updatedDataCabang[activeCabang].data[rowIndex] = {
                    ...updatedDataCabang[activeCabang].data[rowIndex],
                    id: selectedItem.id,
                    No: currentNo, // Preserve the current number
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
                            options={dataPackaging.reduce((allItems, data) => {
                                const items = data.items.map(item => ({
                                    label: `${item.name} - ${item.kategori}`,
                                    value: item.id,
                                    price: item.price,
                                    image: item.image
                                }));
                                return [...allItems, ...items];
                            }, [])}
                            value={selectedItem.id}
                            onSelect={(nextSelection) => handlePackagingDropdownChange(itemId, nextSelection)}
                        />
                    ),
                    "Total Biaya": `Rp${newTotalBiaya.toLocaleString()}`,
                    rawTotalBiaya: newTotalBiaya,
                    currentPrice: selectedItem.price,
                    quantity: currentQuantity
                };
    
                setDataCabang(updatedDataCabang);
            }
        }
    };
    

    const handlePackagingQuantityChange = (itemId, newCount) => {
        const updatedDataCabang = [...dataCabang];
        const rowIndex = updatedDataCabang[activeCabang].data.findIndex(
            (row) => row.id === itemId
        );

        if (rowIndex !== -1) {
            const currentItem = updatedDataCabang[activeCabang].data[rowIndex];
            const newTotal = currentItem.currentPrice * Number(newCount);
            const currentNo = currentItem.No; // Preserve the current number
            
            updatedDataCabang[activeCabang].data[rowIndex].quantity = Number(newCount);
            updatedDataCabang[activeCabang].data[rowIndex].rawTotalBiaya = newTotal;
            updatedDataCabang[activeCabang].data[rowIndex]["Total Biaya"] = `Rp${newTotal.toLocaleString()}`;
            updatedDataCabang[activeCabang].data[rowIndex].No = currentNo; // Preserve the current number
            
            setDataCabang(updatedDataCabang);
        }
    };


    const btnAddBaris = (cabangIndex) => {
        setActiveCabang(cabangIndex);
        setIsModalOpen(true);
        // Reset search and filter when opening modal
        setSearchTerm("");
        setSearchTermInput("");
        setSelectedCategory("Semua");
        // Fetch product data with pagination
        fetchBarangPaginated(selectedJenis, {
            page: pagination[selectedJenis].page,
            limit: pagination[selectedJenis].limit,
            category: "Semua",
            search: ""
        });
    };

    const [isPackagingModalOpen, setIsPackagingModalOpen] = useState(false);
    const [selectedPackagingCategory, setSelectedPackagingCategory] = useState("Semua");
    const [selectedPackagingItems, setSelectedPackagingItems] = useState([]);
    const [packagingSearchTerm, setPackagingSearchTerm] = useState("");

    const [kategoriBarang, setKategoriBarang] = useState({
        "Barang Handmade": [],
        "Barang Non-Handmade": []
    });

    const fetchKategoriBarang = async () => {
        try {
            const response = await api.get(`/kategori-barang?toko_id=${toko_id}`);
            if (response.data.success) {
                const kategoriBaru = response.data.data
                    .filter(kategori => !kategori.is_deleted)
                    .map(kategori => ({
                        nama_kategori_barang: kategori.nama_kategori_barang,
                        kategori_barang_id: kategori.kategori_barang_id
                    }));

                setKategoriBarang({
                    "Barang Handmade": [{ nama_kategori_barang: "Semua", kategori_barang_id: "Semua" }, ...kategoriBaru],
                    "Barang Non-Handmade": [{ nama_kategori_barang: "Semua", kategori_barang_id: "Semua" }, ...kategoriBaru]
                });
            }
        } catch (error) {
            console.error('Error fetching kategori barang:', error);
        }
    };

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

    const fetchBarangHandmade = async () => {
        try {
            const response = await api.get(`/barang-handmade?cabang=${cabang_id}&limit=1000`);
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
            }
        } catch (error) {
            console.error('Error fetching barang handmade:', error);
        }
    };

    const fetchBarangNonHandmade = async () => {
        try {
            const response = await api.get(`/barang-non-handmade?cabang=${cabang_id}&limit=1000`);
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
            }
        } catch (error) {
            console.error('Error fetching barang non-handmade:', error);
        }
    };

    useEffect(() => {
        fetchKategoriBarang();
        fetchBarangHandmade();
        fetchBarangNonHandmade();
    }, []);

    useEffect(() => {
        if (selectBayar === 1) { 
            setIsMetodeDisabled(true);
        } else if (selectBayar === 2) { 
            setIsMetodeDisabled(false);
        }
    }, [selectBayar]);

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

    const resetSelection = () => {
        setSelectedItems([]);
        setIsModalOpen(false);
    };

    const handleModalSubmit = () => {
        if (activeCabang !== null) {
            const updatedCabang = [...dataCabang];
            const newItems = selectedItems.map((item, index) => {
                // Determine the product's category (Handmade or Non-Handmade)
                const productCategory = dataBarang.find(category => 
                    category.items.some(i => i.id === item.id)
                )?.jenis || 'Barang Handmade';
    
                const totalBiaya = parseInt(item.price) * item.count;
                return {
                    id: item.id,
                    No: updatedCabang[activeCabang].data.length + index + 1,
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
            // Renumber all items after adding new ones
            updatedCabang[activeCabang].data = updatedCabang[activeCabang].data.map((item, index) => ({
                ...item,
                No: index + 1
            }));
            setDataCabang(updatedCabang);
        }
        setIsModalOpen(false);
        setSelectedItems([]);
    };


    const handleDropdownChange = (itemId, nextSelection) => {
        const updatedDataCabang = [...dataCabang];
        const rowIndex = updatedDataCabang[activeCabang].data.findIndex(
            (row) => row.id === itemId
        );
    
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
                const currentQuantity = updatedDataCabang[activeCabang].data[rowIndex].quantity || 0;
                const newTotalBiaya = selectedItem.price * currentQuantity;
                const currentNo = updatedDataCabang[activeCabang].data[rowIndex].No;
                
                updatedDataCabang[activeCabang].data[rowIndex] = {
                    ...updatedDataCabang[activeCabang].data[rowIndex],
                    id: selectedItem.id,
                    No: currentNo, // Preserve the current number
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
                            value={selectedItem.id}
                            onSelect={(nextSelection) => handleDropdownChange(itemId, nextSelection)}
                        />
                    ),
                    "Jenis Barang": jenisBarang,
                    "Harga Satuan": `Rp${selectedItem.price.toLocaleString()}`,
                    "Total Biaya": `Rp${newTotalBiaya.toLocaleString()}`,
                    rawTotalBiaya: newTotalBiaya,
                    name: selectedItem.name,
                    currentPrice: selectedItem.price,
                    quantity: currentQuantity
                };
    
                setDataCabang(updatedDataCabang);
            }
        }
    };
    
    const handleQuantityChange = (itemId, newCount) => {
        const updatedCabangCopy = [...dataCabang];
        const rowIndex = updatedCabangCopy[activeCabang].data.findIndex(
            (row) => row.id === itemId
        );
    
        if (rowIndex !== -1) {
            const currentItem = updatedCabangCopy[activeCabang].data[rowIndex];
            const newTotal = currentItem.currentPrice * Number(newCount);
            const currentNo = currentItem.No; // Preserve the current number
            updatedCabangCopy[activeCabang].data[rowIndex].quantity = newCount;
            updatedCabangCopy[activeCabang].data[rowIndex].rawTotalBiaya = newTotal;
            updatedCabangCopy[activeCabang].data[rowIndex]["Total Biaya"] = `Rp${newTotal.toLocaleString()}`;
            updatedCabangCopy[activeCabang].data[rowIndex].No = currentNo; // Preserve the current number
            setDataCabang(updatedCabangCopy);
        }
    };

    const handleDeleteItem = (cabangIndex, itemId) => {
        const updatedCabang = [...dataCabang];
        updatedCabang[cabangIndex].data = updatedCabang[cabangIndex].data.filter(
            (item) => item.id !== itemId
        );
        // Renumber all items after deletion
        updatedCabang[cabangIndex].data = updatedCabang[cabangIndex].data.map((item, index) => ({
            ...item,
            No: index + 1
        }));
        setDataCabang(updatedCabang);
    };

    const dataBayar = [
        { id: 1, label: "Cash" },
        { id: 2, label: "Non-Cash" }
    ];
    const [dataMetode, setDataMetode] = useState([]);

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


    useEffect(() => {
        fetchMetodePembayaran();
    }, []);


    const subtotal = calculateSubtotal();
    const totalPenjualan = calculateTotalPenjualan(subtotal);
    const navigate = useNavigate();

    const handleTambahSubmit = async (e) => {
        e.preventDefault();
    
        // Validasi
        if (!selectBayar) {
            setErrorMessage("Silakan pilih metode pembayaran (Cash/Non-Cash)");
            setIsErrorModalOpen(true);
            return;
        }
    
        // Validasi untuk metode pembayaran non-cash
        if (selectBayar === 2) {
            if (!selectMetode) {
                setErrorMessage("Silakan pilih metode pembayaran untuk transaksi non-cash");
                setIsErrorModalOpen(true);
                return;
            }
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
    
            dataCabang.forEach(cabang => {
                cabang.data.forEach(item => {
                    if (item["Jenis Barang"]) {
                        const productEntry = {
                            harga_satuan: parseInt(item.currentPrice),
                            kuantitas: parseInt(item.quantity),
                            total_biaya: parseInt(item.rawTotalBiaya)
                        };
    
                        if (item["Jenis Barang"] === "Barang Handmade") {
                            productEntry.barang_handmade_id = item.id;
                        } else if (item["Jenis Barang"] === "Barang Non-Handmade") {
                            productEntry.barang_non_handmade_id = item.id;
                        }
    
                        produkArray.push(productEntry);
                    } 
                    else if (item["Nama Packaging"]) {
                        produkArray.push({
                            packaging_id: item.id,
                            kuantitas: parseInt(item.quantity)
                        });
                    }
                });
            });
    
            // Buat requestBody dasar
            const requestBody = {
                cabang_id: cabang_id,
                tanggal: tanggal 
                    ? new Date(tanggal).toISOString() 
                    : new Date().toISOString(),
                nama_pembeli: namaPembeli,
                cash_or_non: selectBayar === 1,
                catatan: note,
                sub_total: subtotal,
                diskon: parseFloat(diskon),
                pajak: parseFloat(pajak),
                total_penjualan: totalPenjualan,
                produk: produkArray,
                toko_id: toko_id
            };
    
            // Tambahkan metode_id hanya jika non-cash
            if (selectBayar === 2) {
                requestBody.metode_id = selectMetode;
            }
    
            const response = await api.post('/penjualan', requestBody);
    
            if (response.data.success) {
                setModalSucc(true);
            } else {
                setErrorMessage(response.data.message || "Gagal menambah penjualan");
                setIsErrorModalOpen(true);
            }
        } catch (error) {
            console.error('Error submitting penjualan:', error);
            setErrorMessage(error.response?.data?.message || "Terjadi kesalahan saat menambah penjualan");
            setIsErrorModalOpen(true);
        } finally {
            setLoading(false);
        }
    };

    const handleAcc = () => {
        setModalSucc(false);
        navigate(isAdminGudang ? '/penjualan-admin-gudang' : '/penjualan-kasir');
    };

    // Fungsi fetch data barang dengan pagination, category, search
    const fetchBarangPaginated = async (jenis, { page, limit, category, search }) => {
        let endpoint = '';
        let typeKey = '';
        let params = [];
        setLoading(true);
        if (jenis === 'Barang Handmade') {
            endpoint = '/barang-handmade';
            typeKey = 'barang_handmade';
            params.push(`cabang=${cabang_id}`);
        } else if (jenis === 'Barang Non-Handmade') {
            endpoint = '/barang-non-handmade';
            typeKey = 'barang_non_handmade';
            params.push(`cabang=${cabang_id}`);
        } else if (jenis === 'Packaging') {
            endpoint = '/packaging';
            typeKey = 'packaging';
            params.push(`toko_id=${toko_id}`);
        } else {
            setLoading(false);
            return;
        }
        params.push(`page=${page}`);
        params.push(`limit=${limit}`);
        if (category && category !== 'Semua') {
            params.push(`category=${category}`);
        }
        if (search) {
            params.push(`search=${encodeURIComponent(search)}`);
        }
        try {
            const res = await api.get(`${endpoint}?${params.join('&')}`);
            let items = [];
            let totalItems = 0;
            if (res.data.success) {
                // Perbaiki di sini: data dan total dari struktur response API
                items = Array.isArray(res.data.data) ? res.data.data : [];
                totalItems = res.data.pagination?.totalItems ?? items.length;
                const mappedItems = items
                    .filter(item => !item.is_deleted)
                    .map(item => {
                        let price = 0;
                        if ((typeKey === 'barang_handmade' || typeKey === 'barang_non_handmade') && item.rincian_biaya && item.rincian_biaya.length > 0) {
                            price = item.rincian_biaya[0]?.harga_logis || 0;
                        } else if (typeKey === 'packaging') {
                            price = item.harga_jual || 0;
                        }
                        let kategoriName = '';
                        let kategoriId = '';
                        if (typeKey === 'packaging' && item.kategori_barang) {
                            kategoriName = item.kategori_barang.nama_kategori_barang;
                            kategoriId = item.kategori_barang.kategori_barang_id;
                        } else if (typeKey === 'barang_handmade' && item.kategori_barang) {
                            kategoriName = item.kategori_barang.nama_kategori_barang;
                            kategoriId = item.kategori_barang.kategori_barang_id;
                        } else if (typeKey === 'barang_non_handmade' && item.kategori) {
                            kategoriName = item.kategori.nama_kategori_barang;
                            kategoriId = item.kategori.kategori_barang_id;
                        }
                        return {
                            id: item[`${typeKey}_id`] || item.id,
                            image: typeKey === 'packaging'
                                ? (item.image ? `${import.meta.env.VITE_API_URL}/images-packaging/${item.image}` : '/placeholder-image.jpg')
                                : (item.image ? `${import.meta.env.VITE_API_URL}/images-barang-${typeKey === 'barang_handmade' ? 'handmade' : 'non-handmade'}/${item.image}` : '/placeholder-image.jpg'),
                            code: item[`${typeKey}_id`] || item.id,
                            name: typeKey === 'packaging' ? `${item.nama_packaging} - ${item.ukuran}` : item.nama_barang,
                            price: price,
                            kategori: kategoriName,
                            kategori_id: kategoriId,
                            stock: item.stok_barang?.jumlah_stok || 0,
                            formattedPrice: `Rp${price.toLocaleString('id-ID')}`
                        };
                    });
                setBarangData(prev => ({
                    ...prev,
                    [jenis]: {
                        items: mappedItems,
                        total: totalItems
                    }
                }));
                setPagination(prev => ({
                    ...prev,
                    [jenis]: {
                        ...prev[jenis],
                        total: totalItems
                    }
                }));
            }
        } catch (error) {
            console.error(`Error fetching ${jenis}:`, error);
            setBarangData(prev => ({
                ...prev,
                [jenis]: {
                    items: [],
                    total: 0
                }
            }));
            setPagination(prev => ({
                ...prev,
                [jenis]: {
                    ...prev[jenis],
                    total: 0
                }
            }));
        } finally {
            setLoading(false);
        }
    };

    // Handler untuk pagination dan filter
    const handlePageChange = (jenis, page) => {
        setPagination(prev => ({
            ...prev,
            [jenis]: {
                ...prev[jenis],
                page
            }
        }));
    };
    
    const handleLimitChange = (jenis, limit) => {
        setPagination(prev => ({
            ...prev,
            [jenis]: {
                ...prev[jenis],
                limit,
                page: 1
            }
        }));
    };
    
    const handleCategoryChange = (categoryId) => {
        setSelectedCategory(categoryId);
        setPagination(prev => ({
            ...prev,
            [selectedJenis]: {
                ...prev[selectedJenis],
                page: 1
            }
        }));
        
        // Fetch data with new category
        fetchBarangPaginated(selectedJenis, {
            page: 1,
            limit: pagination[selectedJenis].limit,
            category: categoryId,
            search: searchTerm
        });
    };
    
    const handlePackagingCategoryChange = (categoryId) => {
        setSelectedPackagingCategory(categoryId);
        setPagination(prev => ({
            ...prev,
            "Packaging": {
                ...prev["Packaging"],
                page: 1
            }
        }));
        
        // Fetch data with new category
        fetchBarangPaginated("Packaging", {
            page: 1,
            limit: pagination["Packaging"].limit,
            category: categoryId,
            search: packagingSearchTerm
        });
    };
    
    const handleSearchInputChange = (e) => {
        setSearchTermInput(e.target.value);
    };
    
    const handleSearchInputKeyDown = (e) => {
        if (e.key === 'Enter') {
            setSearchTerm(searchTermInput);
            setPagination(prev => ({
                ...prev,
                [selectedJenis]: {
                    ...prev[selectedJenis],
                    page: 1
                }
            }));
            
            // Fetch data with search term
            fetchBarangPaginated(selectedJenis, {
                page: 1,
                limit: pagination[selectedJenis].limit,
                category: selectedCategory,
                search: searchTermInput
            });
        }
    };
    
    const handlePackagingSearchInputChange = (e) => {
        setPackagingSearchTermInput(e.target.value);
    };
    
    const handlePackagingSearchInputKeyDown = (e) => {
        if (e.key === 'Enter') {
            setPackagingSearchTerm(packagingSearchTermInput);
            setPagination(prev => ({
                ...prev,
                "Packaging": {
                    ...prev["Packaging"],
                    page: 1
                }
            }));
            
            // Fetch packaging data with search term
            fetchBarangPaginated("Packaging", {
                page: 1,
                limit: pagination["Packaging"].limit,
                category: selectedPackagingCategory,
                search: packagingSearchTermInput
            });
        }
    };
    
    // Effect to fetch data when pagination changes for products
    useEffect(() => {
        if (isModalOpen) {
            fetchBarangPaginated(selectedJenis, {
                page: pagination[selectedJenis].page,
                limit: pagination[selectedJenis].limit,
                category: selectedCategory,
                search: searchTerm
            });
        }
    }, [isModalOpen, selectedJenis, pagination[selectedJenis].page, pagination[selectedJenis].limit]);
    
    // Effect to fetch data when pagination changes for packaging
    useEffect(() => {
        if (isPackagingModalOpen) {
            fetchBarangPaginated("Packaging", {
                page: pagination["Packaging"].page,
                limit: pagination["Packaging"].limit,
                category: selectedPackagingCategory,
                search: packagingSearchTerm
            });
        }
    }, [isPackagingModalOpen, pagination["Packaging"].page, pagination["Packaging"].limit]);
    
    // Effect to fetch new data when changing product type tab
    useEffect(() => {
        if (isModalOpen) {
            fetchBarangPaginated(selectedJenis, {
                page: 1,
                limit: pagination[selectedJenis].limit,
                category: selectedCategory,
                search: searchTerm
            });
        }
    }, [isModalOpen, selectedJenis]);

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
                                    <Input label={"Nomor"} type1={"text"} disabled={true} value={nomor} onChange={(e) => setNomor(e)} />
                                    <Input label={"Tanggal dan Waktu"} type1={"datetime-local"} value={tanggal} onChange={(e) => setTanggal(e)} />
                                    <Input label={"Nama Pembeli"} required={false} value={namaPembeli} onChange={(e) => setNamaPembeli(e)} />
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
                                                data={cabang.data} 
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
    
                        {/* Modal Tambah Baris - Products */}
                        {isModalOpen && (
                            <section className="fixed inset-0 bg-white bg-opacity-80 flex justify-center items-center z-50">
                                <div className={`bg-white border border-${themeColor} rounded-md p-6 w-[90%] md:w-[70%] h-[90%] overflow-hidden`}>
                                    {/* 1. Pencarian, X, Terpilih */}
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
                                                placeholder="Cari Barang yang mau dibeli"
                                                value={searchTermInput}
                                                onChange={handleSearchInputChange}
                                                onKeyDown={handleSearchInputKeyDown}
                                                className="w-full border border-gray-300 rounded-md py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-gray-500"
                                            />
                                        </div>
                                        <div className="flex items-center space-x-4 self-end sm:self-auto">
                                            <button
                                                onClick={() => {
                                                    setSearchTerm("");
                                                    setSearchTermInput("");
                                                    setSelectedItems([]);
                                                    fetchBarangPaginated(selectedJenis, {
                                                        page: 1,
                                                        limit: pagination[selectedJenis].limit,
                                                        category: selectedCategory,
                                                        search: ""
                                                    });
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
                                            <p className={`text-${themeColor} font-semibold`}>
                                                Terpilih {selectedItems.reduce((sum, item) => sum + item.count, 0)}
                                            </p>
                                        </div>
                                    </div>
                                    {/* 2. Batal & Pilih */}
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
                                            bgColor={`bg-${themeColor}`}
                                            hoverColor="hover:bg-opacity-90"
                                            textColor="text-white"
                                            onClick={handleModalSubmit}
                                        />
                                    </div>
                                    {/* 3. Jenis Barang (Tabs) */}
                                    <div className="flex border-b border-gray-300 mb-4 overflow-x-auto">
                                        {["Barang Handmade", "Barang Non-Handmade"].map((jenis) => (
                                            <button
                                                key={jenis}
                                                onClick={() => setSelectedJenis(jenis)}
                                                className={`px-4 py-2 text-sm font-semibold whitespace-nowrap ${
                                                    selectedJenis === jenis ? `text-${themeColor} border-b-2 border-${themeColor}` : "text-gray-400"
                                                }`}
                                            >
                                                {jenis}
                                            </button>
                                        ))}
                                    </div>
                                    {/* 4. Kategori Barang */}
                                    <div className="flex flex-wrap gap-2 mt-4 mb-2">
                                        {kategoriBarang[selectedJenis].map((kategori) => (
                                            <button
                                                key={kategori.kategori_barang_id}
                                                onClick={() => handleCategoryChange(kategori.kategori_barang_id)}
                                                className={`px-3 py-1 text-sm md:text-base rounded-md ${selectedCategory === kategori.kategori_barang_id ? `bg-${themeColor} text-white` : "border border-gray-300"}`}
                                            >
                                                {kategori.nama_kategori_barang}
                                            </button>
                                        ))}
                                    </div>
                                    {/* 5. Items per page */}
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="text-sm">Items per page:</span>
                                        <select
                                            value={pagination[selectedJenis].limit}
                                            onChange={e => handleLimitChange(selectedJenis, Number(e.target.value))}
                                            className="border rounded px-2 py-1 text-sm"
                                        >
                                            {[3, 12, 24, 48].map(opt => (
                                                <option key={opt} value={opt}>{opt}</option>
                                            ))}
                                        </select>
                                    </div>
                                    {/* 6. Data Barang (Gallery) */}
                                    <div className="mt-2 h-[calc(100%-320px)] overflow-y-auto no-scrollbar">
                                        {isLoading ? (
                                            <div className="flex justify-center items-center h-40">
                                                <Spinner />
                                            </div>
                                        ) : (
                                            <Gallery2
                                                items={barangData[selectedJenis].items || []}
                                                onSelect={handleSelectItem}
                                                selectedItems={selectedItems}
                                                enableStockValidation={true}
                                            />
                                        )}
                                    </div>
                                    {/* 7. Pagination */}
                                    <div className="flex gap-2 items-center mt-2 justify-center">
                                        <button
                                            disabled={pagination[selectedJenis].page === 1}
                                            onClick={() => handlePageChange(selectedJenis, pagination[selectedJenis].page - 1)}
                                            className="px-2 py-1 border rounded disabled:opacity-50"
                                        >
                                            Prev
                                        </button>
                                        <span className="text-sm">Halaman {pagination[selectedJenis].page} dari {Math.max(1, Math.ceil((pagination[selectedJenis].total || 1) / pagination[selectedJenis].limit))}</span>
                                        <button
                                            disabled={pagination[selectedJenis].page >= Math.ceil((pagination[selectedJenis].total || 1) / pagination[selectedJenis].limit)}
                                            onClick={() => handlePageChange(selectedJenis, pagination[selectedJenis].page + 1)}
                                            className="px-2 py-1 border rounded disabled:opacity-50"
                                        >
                                            Next
                                        </button>
                                    </div>
                                </div>
                            </section>
                        )}

                        {/* Modal for Packaging with Pagination */}
                        {isPackagingModalOpen && (
                            <section className="fixed inset-0 bg-white bg-opacity-80 flex justify-center items-center z-50">
                                <div className={`bg-white border border-${themeColor} rounded-md p-6 w-[90%] md:w-[70%] h-[90%] overflow-hidden`}>
                                    {/* 1. Search, X, Selected Count */}
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
                                                placeholder="Cari Packaging"
                                                value={packagingSearchTermInput}
                                                onChange={handlePackagingSearchInputChange}
                                                onKeyDown={handlePackagingSearchInputKeyDown}
                                                className="w-full border border-gray-300 rounded-md py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-gray-500"
                                            />
                                        </div>

                                        <div className="flex items-center space-x-4 self-end sm:self-auto">
                                            <button
                                                onClick={() => {
                                                    setPackagingSearchTerm("");
                                                    setPackagingSearchTermInput("");
                                                    setSelectedPackagingItems([]);
                                                    fetchBarangPaginated("Packaging", {
                                                        page: 1,
                                                        limit: pagination["Packaging"].limit,
                                                        category: selectedPackagingCategory,
                                                        search: ""
                                                    });
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
                                            <p className={`text-${themeColor} font-semibold`}>
                                                Terpilih {selectedPackagingItems.reduce((sum, item) => sum + item.count, 0)}
                                            </p>
                                        </div>
                                    </div>

                                    {/* 2. Action buttons */}
                                    <div className="flex justify-end gap-4 mb-4">
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

                                    {/* 3. Kategori Buttons */}
                                    <div className="flex flex-wrap gap-2 mt-4 mb-2">
                                        {kategoriPackaging.map((kategori) => (
                                            <button
                                                key={kategori.kategori_barang_id}
                                                onClick={() => handlePackagingCategoryChange(kategori.kategori_barang_id)}
                                                className={`px-3 py-1 text-sm md:text-base rounded-md ${
                                                    selectedPackagingCategory === kategori.kategori_barang_id
                                                        ? `bg-${themeColor} text-white`
                                                        : "border border-gray-300"
                                                }`}
                                            >
                                                {kategori.nama_kategori_barang}
                                            </button>
                                        ))}
                                    </div>

                                    {/* 4. Items per page */}
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="text-sm">Items per page:</span>
                                        <select
                                            value={pagination["Packaging"].limit}
                                            onChange={e => handleLimitChange("Packaging", Number(e.target.value))}
                                            className="border rounded px-2 py-1 text-sm"
                                        >
                                            {[3, 12, 24, 48].map(opt => (
                                                <option key={opt} value={opt}>{opt}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* 5. Gallery */}
                                    <div className="mt-2 h-[calc(100%-320px)] overflow-y-auto no-scrollbar">
                                        {isLoading ? (
                                            <div className="flex justify-center items-center h-40">
                                                <Spinner />
                                            </div>
                                        ) : (
                                            <Gallery2
                                                items={barangData["Packaging"].items || []}
                                                onSelect={handleSelectPackagingItem}
                                                selectedItems={selectedPackagingItems}
                                                enableStockValidation={true}
                                            />
                                        )}
                                    </div>

                                    {/* 6. Pagination */}
                                    <div className="flex gap-2 items-center mt-2 justify-center">
                                        <button
                                            disabled={pagination["Packaging"].page === 1}
                                            onClick={() => handlePageChange("Packaging", pagination["Packaging"].page - 1)}
                                            className="px-2 py-1 border rounded disabled:opacity-50"
                                        >
                                            Prev
                                        </button>
                                        <span className="text-sm">
                                            Halaman {pagination["Packaging"].page} dari {Math.max(1, Math.ceil((pagination["Packaging"].total || 1) / pagination["Packaging"].limit))}
                                        </span>
                                        <button
                                            disabled={pagination["Packaging"].page >= Math.ceil((pagination["Packaging"].total || 1) / pagination["Packaging"].limit)}
                                            onClick={() => handlePageChange("Packaging", pagination["Packaging"].page + 1)}
                                            className="px-2 py-1 border rounded disabled:opacity-50"
                                        >
                                            Next
                                        </button>
                                    </div>
                                </div>
                            </section>
                        )}
                    </section>
                </div>
                {/* modal success */}
                {isModalSucc && (
                    <AlertSuccess
                        title="Berhasil!!"
                        description="Data berhasil ditambahkan"
                        confirmLabel="Ok"
                        onConfirm={handleAcc}
                    />
                )}
    
                {isLoading && (
                    <Spinner/>
                )}

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