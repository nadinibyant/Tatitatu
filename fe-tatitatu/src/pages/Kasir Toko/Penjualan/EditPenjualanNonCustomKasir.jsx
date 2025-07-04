import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import Breadcrumbs from "../../../components/Breadcrumbs";
import Input from "../../../components/Input";
import Navbar from "../../../components/Navbar";
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
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedPackagingCategory, setSelectedPackagingCategory] = useState("Semua");
    const [selectedPackagingJenis, setSelectedPackagingJenis] = useState("Packaging");
    const [selectedPackagingItems, setSelectedPackagingItems] = useState([]);
    const [packagingSearchTerm, setPackagingSearchTerm] = useState("");

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
                        
                        rincianProduk.push({
                            id: product.barang_handmade_id || product.barang_non_handmade_id,
                            No: index + 1,
                            "Foto Produk": (
                                <img
                                    src={`${import.meta.env.VITE_API_URL}/images-${jenisBarang.toLowerCase().replace(' ', '-')}/${product.image}`}
                                    alt={product.nama_barang}
                                    className="w-12 h-12"
                                />
                            ),
                            "Nama Produk": (
                                <InputDropdown
                                    showRequired={false}
                                    options={[
                                        {
                                            label: product.nama_barang,
                                            value: product.barang_handmade_id || product.barang_non_handmade_id,
                                            price: item.harga_satuan,
                                            jenis: jenisBarang,
                                            kategori: product.kategori_barang?.nama_kategori_barang || product.kategori?.nama_kategori_barang,
                                            image: product.image
                                        },
                                        ...dataBarang.reduce((allItems, data) => {
                                            const items = data.items.map(item => ({
                                                label: item.name,
                                                value: item.id,
                                                price: item.price,
                                                jenis: data.jenis,
                                                kategori: item.kategori,
                                                image: item.image
                                            }));
                                            return [...allItems, ...items];
                                        }, [])
                                    ]}
                                    value={product.barang_handmade_id || product.barang_non_handmade_id}
                                    onSelect={(newSelection) => handleDropdownChange(product.barang_handmade_id || product.barang_non_handmade_id, newSelection)}
                                />
                            ),
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
                            No: index + 1,
                            "Foto Produk": (
                                <img
                                    src={`${import.meta.env.VITE_API_URL}/images-packaging/${item.packaging.image}`}
                                    alt={item.packaging.nama_packaging}
                                    className="w-12 h-12"
                                />
                            ),
                            "Nama Packaging": (
                                <InputDropdown
                                    showRequired={false}
                                    options={[
                                        {
                                            label: `${item.packaging.nama_packaging} - ${item.packaging.ukuran}`,
                                            value: item.packaging.packaging_id,
                                            price: item.packaging.harga_satuan,
                                            image: item.packaging.image
                                        },
                                        ...dataPackaging.reduce((allItems, data) => {
                                            const items = data.items.map(item => ({
                                                label: item.name,
                                                value: item.id,
                                                price: item.price,
                                                image: item.image
                                            }));
                                            return [...allItems, ...items];
                                        }, [])
                                    ]}
                                    value={item.packaging.packaging_id}
                                    onSelect={(nextSelection) => handlePackagingDropdownChange(item.packaging.packaging_id, nextSelection)}
                                />
                            ),
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
            const response = await api.get(`/packaging?toko_id=${toko_id}`);
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
            }
        } catch (error) {
            console.error('Error fetching packaging:', error);
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
            const response = await api.get(`/barang-handmade?cabang=${cabang_id}`);
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
            const response = await api.get(`/barang-non-handmade?cabang=${cabang_id}`);
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
        const updatedDataCabang = [...dataCabang];
        const rowIndex = updatedDataCabang[0].data.findIndex(
            (row) => row.id === itemId
        );
    
        if (rowIndex !== -1) {
            let selectedItem = null;
            let jenisBarang = '';

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
                
                updatedDataCabang[0].data[rowIndex] = {
                    ...updatedDataCabang[0].data[rowIndex],
                    id: selectedItem.id,
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

    const handlePackagingDropdownChange = (itemId, nextSelection) => {
        const updatedDataCabang = [...dataCabang];
        const rowIndex = updatedDataCabang[1].data.findIndex(
            (row) => row.id === itemId
        );
    
        if (rowIndex !== -1) {
            const selectedItem = dataPackaging
                .flatMap(category => category.items)
                .find(i => i.id === nextSelection.value);
    
            if (selectedItem) {
                const currentQuantity = updatedDataCabang[1].data[rowIndex].quantity || 1;
                const newTotalBiaya = selectedItem.price * currentQuantity;
                
                updatedDataCabang[1].data[rowIndex] = {
                    ...updatedDataCabang[1].data[rowIndex],
                    id: selectedItem.id,
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

    // Effects
    useEffect(() => {
        fetchPenjualan();
        fetchPackaging();
        fetchKategoriBarang();
        fetchBarangHandmade();
        fetchBarangNonHandmade();
        fetchMetodePembayaran();
    }, []);

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

    // Filtered items for modals
    const filteredItems = dataBarang
        .find((data) => data.jenis === selectedJenis)
        ?.items.filter(
            (item) =>
                (selectedCategory === "Semua" || item.kategori === selectedCategory) &&
                item.name.toLowerCase().includes(searchTerm.toLowerCase())
        ) || [];

    const filteredPackagingItems = dataPackaging
        .find((data) => data.jenis === selectedPackagingJenis)
        ?.items.filter(
            (item) =>
                (selectedPackagingCategory === "Semua" || item.kategori === selectedPackagingCategory) &&
                item.name.toLowerCase().includes(packagingSearchTerm.toLowerCase())
        ) || [];

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
                                                    value={searchTerm}
                                                    onChange={(e) => setSearchTerm(e.target.value)}
                                                    className="w-full border border-gray-300 rounded-md py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-gray-500"
                                                />
                                            </div>

                                            <div className="flex items-center space-x-4 self-end sm:self-auto">
                                                <button
                                                    onClick={() => {
                                                        setSearchTerm("");
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
                                                onClick={() => setSelectedJenis(jenis)}
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
                                                onClick={() => setSelectedCategory(kategori)}
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

                                    {/* Gallery */}
                                    <div className="mt-6 h-[calc(100%-180px)] overflow-y-auto no-scrollbar">
                                        <Gallery2
                                            items={filteredItems || []}
                                            onSelect={handleSelectItem}
                                            selectedItems={selectedItems}
                                            enableStockValidation={true}
                                        />
                                    </div>
                                </div>
                            </section>
                        )}

                        {/* Modal Tambah Packaging */}
                        {isPackagingModalOpen && (
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
                                                    placeholder="Cari Packaging"
                                                    value={packagingSearchTerm}
                                                    onChange={(e) => setPackagingSearchTerm(e.target.value)}
                                                    className="w-full border border-gray-300 rounded-md py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-gray-500"
                                                />
                                            </div>

                                            <div className="flex items-center space-x-4 self-end sm:self-auto">
                                                <button
                                                    onClick={() => {
                                                        setPackagingSearchTerm("");
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
                                                onClick={() => setSelectedPackagingCategory(kategori)}
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

                                    {/* Gallery */}
                                    <div className="mt-6 h-[calc(100%-180px)] overflow-y-auto no-scrollbar">
                                        <Gallery2
                                            items={filteredPackagingItems?.map(item => ({
                                                ...item,
                                                formattedPrice: `Rp${item.price.toLocaleString('id-ID')}`
                                            })) || []}
                                            onSelect={handleSelectPackagingItem}
                                            selectedItems={selectedPackagingItems}
                                            enableStockValidation={true}
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