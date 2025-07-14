import { useEffect, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
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

export default function EditPenjualanGudang() {
    const { id } = useParams();
    const location = useLocation();
    const { fromLaporanKeuangan } = location.state || {};
    
    const [nomor, setNomor] = useState("");
    const [tanggal, setTanggal] = useState(null);
    const [namaPembeli, setNamaPembeli] = useState("");
    const [note, setNote] = useState("");
    const [selectBayar, setSelectedBayar] = useState(1);
    const [selectMetode, setSelectMetode] = useState(1); 
    const [diskon, setDiskon] = useState(0);
    const [pajak, setPajak] = useState(0);
    const [itemData, setItemData] = useState([]);
    const [packagingData, setPackagingData] = useState([]);
    const [hasPackaging, setHasPackaging] = useState(false);
    const [dataPackaging, setDataPackaging] = useState([]);
    const [searchPackagingTerm, setSearchPackagingTerm] = useState("");
    const [errorMessage, setErrorMessage] = useState(null)

    // Pagination state variables
    const [paginationHandmade, setPaginationHandmade] = useState({ page: 1, limit: 12, total: 0, totalPages: 0 });
    const [paginationNonHandmade, setPaginationNonHandmade] = useState({ page: 1, limit: 12, total: 0, totalPages: 0 });
    const [paginationMentah, setPaginationMentah] = useState({ page: 1, limit: 12, total: 0, totalPages: 0 });
    const [paginationPackaging, setPaginationPackaging] = useState({ page: 1, limit: 12, total: 0, totalPages: 0 });
    
    // Search state variables
    const [searchHandmade, setSearchHandmade] = useState("");
    const [searchNonHandmade, setSearchNonHandmade] = useState("");
    const [searchMentah, setSearchMentah] = useState("");
    const [searchPackaging, setSearchPackaging] = useState("");
    
    // Category state variables
    const [selectedCategoryHandmade, setSelectedCategoryHandmade] = useState("Semua");
    const [selectedCategoryNonHandmade, setSelectedCategoryNonHandmade] = useState("Semua");
    const [selectedCategoryMentah, setSelectedCategoryMentah] = useState("Semua");
    const [selectedCategoryPackaging, setSelectedCategoryPackaging] = useState("Semua");

    const userData = JSON.parse(localStorage.getItem('userData'));
    const isAdminGudang = userData?.role === 'admingudang'
    const isHeadGudang = userData?.role === 'headgudang';
    const isOwner = userData?.role === 'owner';
    const isManajer = userData?.role === 'manajer';
    const isFinance = userData?.role === 'finance'

    const themeColor = (isAdminGudang || isHeadGudang) 
    ? "coklatTua" 
    : (isManajer || isOwner || isFinance) 
      ? "biruTua" 
      : "primary";

    // Function to build query parameters for API calls
    const buildQueryParams = (page, limit, category, search) => {
        const params = new URLSearchParams();
        params.append('page', page);
        params.append('limit', limit);
        if (category && category !== "Semua") {
            params.append('category', category);
        }
        if (search) {
            params.append('search', search);
        }
        return params.toString();
    };

    // Updated fetchPackaging with pagination
    useEffect(() => {
        const fetchPackaging = async () => {
            try {
                const queryParams = buildQueryParams(
                    paginationPackaging.page, 
                    paginationPackaging.limit, 
                    selectedCategoryPackaging, 
                    searchPackaging
                );
                const response = await api.get(`/packaging-gudang?${queryParams}`);
                if (response.data.success) {
                    const formattedData = response.data.data.map(item => ({
                        id: item.packaging_id,
                        label: item.nama_packaging, 
                        value: item.packaging_id,  
                        price: item.harga_jual,
                        image: getImageUrl({
                            barang_id: item.packaging_id,
                            image: item.image
                        }),
                        code: item.packaging_id,
                        nama_packaging: item.nama_packaging,  
                        packaging_id: item.packaging_id,      
                        harga: item,
                        stock: item.stok_barang?.jumlah_stok        
                    }));
                    setDataPackaging(formattedData);
                    
                    // Update pagination info
                    if (response.data.pagination) {
                        setPaginationPackaging(prev => ({
                            ...prev,
                            total: response.data.pagination.totalItems,
                            totalPages: response.data.pagination.totalPages
                        }));
                    }
                }
            } catch (error) {
                console.error("Error fetching packaging:", error);
            }
        };
    
        fetchPackaging();
    }, [paginationPackaging.page, paginationPackaging.limit, selectedCategoryPackaging, searchPackaging, searchPackagingTerm]);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState("Semua");
    const [activeJenis, setActiveJenis] = useState("Barang Handmade");
    const [selectedItems, setSelectedItems] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [isLoading, setLoading] = useState(false);
    const [isModalSucc, setModalSucc] = useState(false);
    const [isMetodeDisabled, setIsMetodeDisabled] = useState(false);
    const [dataMetode, setDataMetode] = useState([
        { label: "-", value: 1 },
    ]);
    const [dataBarang, setDataBarang] = useState([]);
    const [jenisBarang, setJenisBarang] = useState([]);
    const [isPackagingModalOpen, setIsPackagingModalOpen] = useState(false);
    const [selectedPackagingItems, setSelectedPackagingItems] = useState([]);

    const getImageUrl = (item) => {
        if (!item || !item.barang_id) return "https://via.placeholder.com/150";
        
        let basePath = '';
        const itemId = String(item.barang_id);
        
        if (itemId.startsWith('BHM')) {
            basePath = '/images-barang-handmade-gudang/';
        } else if (itemId.startsWith('BNH')) {
            basePath = '/images-barang-non-handmade-gudang/';
        } else if (itemId.startsWith('MTH')) {
            basePath = '/images-barang-mentah/';
        } else if (itemId.startsWith('PCK')) {
            basePath = '/images-packaging-gudang/';
        }
    
        if (!item.image) return "https://via.placeholder.com/150";
        return `${import.meta.env.VITE_API_URL}${basePath}${item.image}`;
    };

    const getAllProductOptions = (dataBarang) => {
        const allOptions = [];
        dataBarang.forEach(category => {
            if (category.items) {
                category.items.forEach(item => {
                    allOptions.push({
                        label: item.name,
                        value: item.id,
                        price: item.price
                    });
                });
            }
        });
        return allOptions;
    };

    useEffect(() => {
        const fetchPenjualan = async () => {
            try {
                setLoading(true);
                const response = await api.get(`/penjualan-gudang/${id}`);
                const data = response.data.data;

                setNomor(data.penjualan_id);
                setTanggal(data.tanggal.split('T')[0]);
                setNamaPembeli(data.nama_pembeli);
                setNote(data.catatan);
                setDiskon(data.diskon);
                setPajak(data.pajak);
                setSelectedBayar(data.cash_or_non ? 1 : 2);

                if (!data.cash_or_non) {
                    setIsMetodeDisabled(false);
                    if (dataMetode.length > 1) {
                        const matchingMethod = dataMetode.find(
                            method => method.label === data.metode
                        );
                        if (matchingMethod) {
                            setSelectMetode(matchingMethod.value);
                        } else {
                            setSelectMetode(1);
                        }
                    }
                } else {
                    setIsMetodeDisabled(true);
                    setSelectMetode(1);
                }

                const extractProductInfo = (apiProdItem) => {
                    if (apiProdItem.barang_handmade) {
                        return {
                            id: apiProdItem.barang_handmade.barang_handmade_id,
                            nama: apiProdItem.barang_handmade.nama_barang,
                            image: apiProdItem.barang_handmade.image,
                            jenis: 'Barang Handmade',
                            harga_jual_katalog: apiProdItem.barang_handmade.harga_logis,
                            is_packaging: false,
                        };
                    } else if (apiProdItem.barang_nonhandmade) {
                        return {
                            id: apiProdItem.barang_nonhandmade.barang_nonhandmade_id,
                            nama: apiProdItem.barang_nonhandmade.nama_barang,
                            image: apiProdItem.barang_nonhandmade.image,
                            jenis: 'Barang Non-Handmade',
                            harga_jual_katalog: apiProdItem.barang_nonhandmade.harga_logis,
                            is_packaging: false,
                        };
                    } else if (apiProdItem.barang_mentah) {
                        return {
                            id: apiProdItem.barang_mentah.barang_mentah_id,
                            nama: apiProdItem.barang_mentah.nama_barang,
                            image: apiProdItem.barang_mentah.image,
                            jenis: 'Barang Mentah',
                            harga_jual_katalog: apiProdItem.barang_mentah.harga_satuan,
                            is_packaging: false,
                        };
                    } else if (apiProdItem.packaging) {
                        return {
                            id: apiProdItem.packaging.packaging_id,
                            nama: apiProdItem.packaging.nama_packaging,
                            image: apiProdItem.packaging.image,
                            jenis: 'Packaging',
                            harga_jual_katalog: apiProdItem.packaging.harga_jual,
                            is_packaging: true,
                        };
                    }
                    console.warn("Unknown product structure in API response:", apiProdItem);
                    return null;
                };

                const productsFromSale = data.produk.map(apiProdItem => {
                    const info = extractProductInfo(apiProdItem);
                    if (!info) return null;

                    return {
                        ...info, 
                        harga_satuan_transaksi: apiProdItem.harga_satuan,
                        kuantitas: apiProdItem.kuantitas,
                        total_biaya: apiProdItem.total_biaya,
                    };
                }).filter(p => p !== null);


                const regularItemsFromSale = productsFromSale.filter(p => !p.is_packaging);
                const packagingItemFromSale = productsFromSale.find(p => p.is_packaging);

                if (dataBarang.length > 0) {
                    const formattedItems = regularItemsFromSale.map((itemDetail, index) => ({
                        id: itemDetail.id,
                        No: index + 1,
                        "Foto Produk": (
                            <img
                                src={getImageUrl({ barang_id: itemDetail.id, image: itemDetail.image })}
                                alt={itemDetail.nama}
                                className="w-12 h-12 object-cover"
                                onError={(e) => { e.target.src = "https://via.placeholder.com/150"; }}
                            />
                        ),
                        "Nama Produk": (
                            <InputDropdown
                                showRequired={false}
                                options={getAllProductOptions(dataBarang)} 
                                value={itemDetail.id}
                                onSelect={(newSelection) => handleDropdownChange(itemDetail.id, newSelection)}
                            />
                        ),
                        "Jenis Barang": itemDetail.jenis,
                        "Harga Satuan": `Rp${itemDetail.harga_satuan_transaksi.toLocaleString()}`, 
                        "Kuantitas": (
                            <Input
                                showRequired={false}
                                type="number"
                                value={itemDetail.kuantitas}
                                onChange={(newCount) => handleQuantityChange(itemDetail.id, newCount)}
                            />
                        ),
                        quantity: itemDetail.kuantitas,
                        "Total Biaya": `Rp${itemDetail.total_biaya.toLocaleString()}`,
                        rawTotalBiaya: itemDetail.total_biaya,
                        currentPrice: itemDetail.harga_satuan_transaksi,
                    }));
                    setItemData(formattedItems);
                }
                if (packagingItemFromSale && dataPackaging.length > 0) {
                    const formattedPackaging = [{
                        id: packagingItemFromSale.id,
                        packaging_id: packagingItemFromSale.id, 
                        No: 1,
                        "Foto Packaging": (
                            <img
                                src={getImageUrl({ barang_id: packagingItemFromSale.id, image: packagingItemFromSale.image })}
                                alt={packagingItemFromSale.nama}
                                className="w-12 h-12 object-cover"
                                onError={(e) => { e.target.src = "https://via.placeholder.com/150"; }}
                            />
                        ),
                        "Nama Packaging": (
                            <InputDropdown
                                showRequired={false}
                                options={dataPackaging.map(pack => ({
                                    label: pack.nama_packaging || pack.label, 
                                    value: pack.packaging_id || pack.id,   
                                    price: pack.price || pack.harga_jual || (pack.harga ? pack.harga.harga_jual : 0)
                                }))}
                                value={packagingItemFromSale.id} 
                                onSelect={(newSelection) => handlePackagingDropdownChange(packagingItemFromSale.id, newSelection)}
                            />
                        ),
                        "Harga Satuan": `Rp${packagingItemFromSale.harga_satuan_transaksi.toLocaleString()}`,
                        "Kuantitas": (
                            <Input
                                showRequired={false}
                                type="number"
                                value={packagingItemFromSale.kuantitas}
                                onChange={(newCount) => handlePackagingQuantityChange(packagingItemFromSale.id, newCount)}
                            />
                        ),
                        quantity: packagingItemFromSale.kuantitas,
                        "Total Biaya": `Rp${packagingItemFromSale.total_biaya.toLocaleString()}`,
                        rawTotalBiaya: packagingItemFromSale.total_biaya,
                        currentPrice: packagingItemFromSale.harga_satuan_transaksi,
                    }];
                    setPackagingData(formattedPackaging);
                    setHasPackaging(true);
                } else {
                    setPackagingData([]); 
                    setHasPackaging(false);
                }

            } catch (error) {
                console.error("Error fetching penjualan:", error);
                setErrorMessage(error.response?.data?.message || "Gagal mengambil data penjualan");
            } finally {
                setLoading(false);
            }
        };

        if (id && dataMetode.length > 0 && dataBarang.length > 0 && dataPackaging.length > 0 && !isLoading) {
        if (nomor !== id || itemData.length === 0) {
            fetchPenjualan();
        }
        }
    }, [id, dataMetode, dataBarang, dataPackaging, nomor, itemData.length, isLoading]); 
    

    useEffect(() => {
        const fetchJenis = async () => {
            try {
                const response = await api.get('/jenis-barang-gudang');
                const filteredJenis = response.data.data
                    .filter(jenis => jenis.nama_jenis_barang !== "Packaging")
                    .map(jenis => `Barang ${jenis.nama_jenis_barang}`);
                setJenisBarang(filteredJenis);
            } catch (error) {
                console.error("Error fetching jenis:", error);
            }
        };
        fetchJenis();
    }, []);

    // Function to fetch paginated data for each product type
    const fetchHandmadeData = async () => {
        try {
            const queryParams = buildQueryParams(
                paginationHandmade.page, 
                paginationHandmade.limit, 
                selectedCategoryHandmade, 
                searchHandmade
            );
            const response = await api.get(`/barang-handmade-gudang?${queryParams}`);
            if (response.data.success) {
                const items = response.data.data.map(item => ({
                    id: item.barang_handmade_id,
                    image: item.image,
                    name: item.nama_barang,
                    price: item.harga_logis,
                    kategori: item.kategori?.nama_kategori_barang,
                    code: item.barang_handmade_id,
                    stock: item.stok_barang?.jumlah_stok
                }));
                
                // Update pagination info
                if (response.data.pagination) {
                    console.log('Handmade pagination response:', response.data.pagination);
                    setPaginationHandmade(prev => {
                        const newState = {
                            ...prev,
                            total: response.data.pagination.totalItems || 0,
                            totalPages: response.data.pagination.totalPages || 1
                        };
                        console.log('Updated handmade pagination state:', newState);
                        return newState;
                    });
                } else {
                    console.log('No pagination info in handmade response');
                }
                
                return items;
            }
        } catch (error) {
            console.error("Error fetching handmade data:", error);
        }
        return [];
    };

    const fetchNonHandmadeData = async () => {
        try {
            const queryParams = buildQueryParams(
                paginationNonHandmade.page, 
                paginationNonHandmade.limit, 
                selectedCategoryNonHandmade, 
                searchNonHandmade
            );
            const response = await api.get(`/barang-nonhandmade-gudang?${queryParams}`);
            if (response.data.success) {
                const items = response.data.data.map(item => ({
                    id: item.barang_nonhandmade_id,
                    image: item.image,
                    name: item.nama_barang,
                    price: item.harga_logis,
                    kategori: item.kategori?.nama_kategori_barang,
                    code: item.barang_nonhandmade_id,
                    stock: item.stok_barang?.jumlah_stok
                }));
                
                // Update pagination info
                if (response.data.pagination) {
                    console.log('Non-Handmade pagination response:', response.data.pagination);
                    setPaginationNonHandmade(prev => ({
                        ...prev,
                        total: response.data.pagination.totalItems || 0,
                        totalPages: response.data.pagination.totalPages || 1
                    }));
                } else {
                    console.log('No pagination info in non-handmade response');
                }
                
                return items;
            }
        } catch (error) {
            console.error("Error fetching non-handmade data:", error);
        }
        return [];
    };

    const fetchMentahData = async () => {
        try {
            const queryParams = buildQueryParams(
                paginationMentah.page, 
                paginationMentah.limit, 
                selectedCategoryMentah, 
                searchMentah
            );
            const response = await api.get(`/barang-mentah?${queryParams}`);
            if (response.data.success) {
                const items = response.data.data.map(item => ({
                    id: item.barang_mentah_id,
                    image: item.image,
                    name: item.nama_barang,
                    price: item.harga_satuan,
                    code: item.barang_mentah_id,
                    stock: item.stok_barang?.jumlah_stok
                }));
                
                // Update pagination info
                if (response.data.pagination) {
                    console.log('Mentah pagination response:', response.data.pagination);
                    setPaginationMentah(prev => ({
                        ...prev,
                        total: response.data.pagination.totalItems || 0,
                        totalPages: response.data.pagination.totalPages || 1
                    }));
                } else {
                    console.log('No pagination info in mentah response');
                }
                
                return items;
            }
        } catch (error) {
            console.error("Error fetching mentah data:", error);
        }
        return [];
    };

    useEffect(() => {
        const fetchAllData = async () => {
            try {
                setLoading(true);
                
                const [jenisRes, handmadeItems, nonHandmadeItems, mentahItems] = await Promise.all([
                    api.get('/jenis-barang-gudang'),
                    fetchHandmadeData(),
                    fetchNonHandmadeData(),
                    fetchMentahData()
                ]);
    
                const jenisBarangData = jenisRes.data.data.filter(j => j.nama_jenis_barang !== "Packaging");
                setJenisBarang(jenisBarangData.map(j => `Barang ${j.nama_jenis_barang}`));
    
                const dataByJenis = {};
                jenisBarangData.forEach(jenis => {
                    dataByJenis[jenis.jenis_barang_id] = {
                        jenis: `Barang ${jenis.nama_jenis_barang}`,
                        items: []
                    };
                });

                // Map items to their respective jenis
                const handmadeJenis = jenisBarangData.find(j => j.nama_jenis_barang === "Handmade");
                if (handmadeJenis && handmadeItems.length > 0) {
                    dataByJenis[handmadeJenis.jenis_barang_id].items = handmadeItems;
                }
    
                const nonHandmadeJenis = jenisBarangData.find(j => j.nama_jenis_barang === "Non Handmade");
                if (nonHandmadeJenis && nonHandmadeItems.length > 0) {
                    dataByJenis[nonHandmadeJenis.jenis_barang_id].items = nonHandmadeItems;
                }
    
                const mentahJenis = jenisBarangData.find(j => j.nama_jenis_barang === "Mentah");
                if (mentahJenis && mentahItems.length > 0) {
                    dataByJenis[mentahJenis.jenis_barang_id].items = mentahItems;
                }

                Object.values(dataByJenis).forEach(jenis => {
                    if (jenis.jenis !== "Barang Mentah") {
                        const categories = [...new Set(jenis.items.map(item => item.kategori).filter(Boolean))];
                        jenis.kategori = ["Semua", ...categories];
                    }
                });
    
                console.log('Data yang akan diset:', Object.values(dataByJenis));
                console.log('Pagination states:', {
                    handmade: paginationHandmade,
                    nonHandmade: paginationNonHandmade,
                    mentah: paginationMentah
                });
    
                setDataBarang(Object.values(dataByJenis));
    
            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setLoading(false);
            }
        };
    
        fetchAllData();
    }, [
        paginationHandmade.page, paginationHandmade.limit, selectedCategoryHandmade, searchHandmade,
        paginationNonHandmade.page, paginationNonHandmade.limit, selectedCategoryNonHandmade, searchNonHandmade,
        paginationMentah.page, paginationMentah.limit, selectedCategoryMentah, searchMentah
    ]);

    useEffect(() => {
        const fetchPaymentMethods = async () => {
            try {
                const response = await api.get('/metode-pembayaran-gudang');
                if (response.data.success) {
                    const formattedData = response.data.data.map(method => ({
                        label: method.nama_metode,
                        value: method.metode_id
                    }));
                    setDataMetode([
                        { label: "-", value: 1 },
                        ...formattedData
                    ]);
                }
            } catch (error) {
                console.error("Error fetching payment methods:", error);
            }
        };
        fetchPaymentMethods();
    }, []);

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

    useEffect(() => {
        if (selectBayar === 1) {
            setIsMetodeDisabled(true);
        } else if (selectBayar === 2) {
            setIsMetodeDisabled(false);
        }
    }, [selectBayar]);

    const handleAddPackaging = () => {
        setIsPackagingModalOpen(true);
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

    const resetPackagingSelection = () => {
        setSelectedPackagingItems([]);
        setIsPackagingModalOpen(false);
        setSearchPackagingTerm("");
        setSearchPackaging("");
        setPaginationPackaging(prev => ({ ...prev, page: 1 }));
    };

    const handlePackagingModalSubmit = () => {
        const newItems = selectedPackagingItems.map((item) => {
            const totalBiaya = parseInt(item.price) * item.count;
            const dropdownValue = {
                label: item.label,
                value: item.id, 
                price: item.price
            };
            
            return {
                id: item.id,  
                No: 1,
                "Foto Packaging": (
                    <img src={item.image} alt={item.name} className="w-12 h-12" />
                ),
                "Nama Packaging": (
                    <InputDropdown
                        showRequired={false}
                        options={dataPackaging.map(pack => ({
                            label: pack.label || pack.nama_packaging || String(pack.value),
                            value: pack.value || pack.packaging_id,
                            price: pack.price || pack.harga
                        }))}
                        value={dropdownValue.value}
                        onSelect={(newSelection) => handlePackagingDropdownChange(item.id, newSelection)}
                    />
                ),
                "Harga Satuan": `Rp${item.price.toLocaleString()}`,
                "Kuantitas": (
                    <Input
                        showRequired={false}
                        type="number" 
                        value={item.count}
                        onChange={(newCount) => handlePackagingQuantityChange(item.id, newCount)}  
                    />
                ),
                quantity: item.count,
                "Total Biaya": `Rp${totalBiaya.toLocaleString()}`,
                rawTotalBiaya: totalBiaya,
                currentPrice: item.price
            };
        });
    
        setPackagingData(newItems.slice(0, 1));
        setHasPackaging(true);
        setIsPackagingModalOpen(false);
        setSelectedPackagingItems([]);
    };

    const handlePackagingDropdownChange = (itemId, nextSelection) => {
        console.log('handlePackagingDropdownChange called:', { itemId, nextSelection });

        const selectedItem = dataPackaging.find(item => 
            item.value === nextSelection.value || 
            item.packaging_id === nextSelection.value
        );
        
        if (selectedItem) {
            const priceField = selectedItem.harga_jual || selectedItem.price || 
                              (selectedItem.harga ? selectedItem.harga.harga_jual : 0);
            
            setPackagingData(prevData => {
                const updatedData = [...prevData];
                const rowIndex = updatedData.findIndex(row => 
                    row.id === itemId || 
                    row.packaging_id === itemId
                );
                
                if (rowIndex !== -1) {
                    const currentQuantity = updatedData[rowIndex].quantity || 0;
                    const newTotalBiaya = priceField * currentQuantity;
                
                    const dropdownOptions = dataPackaging.map(pack => ({
                        label: pack.label || pack.nama_packaging || String(pack.value),
                        value: pack.value || pack.packaging_id,
                        price: pack.harga_jual || pack.price || (pack.harga ? pack.harga.harga_jual : 0)
                    }));
                    
                    updatedData[rowIndex] = {
                        ...updatedData[rowIndex],
                        id: selectedItem.value || selectedItem.packaging_id,
                        packaging_id: selectedItem.value || selectedItem.packaging_id,
                        "Foto Packaging": (
                            <img 
                                src={selectedItem.image} 
                                alt={selectedItem.label || selectedItem.nama_packaging} 
                                className="w-12 h-12"
                                onError={(e) => {
                                    e.target.src = "https://via.placeholder.com/150";
                                }} 
                            />
                        ),
                        "Nama Packaging": (
                            <InputDropdown
                                showRequired={false}
                                options={dropdownOptions}
                                value={selectedItem.value || selectedItem.packaging_id}
                                onSelect={(newSelection) => handlePackagingDropdownChange(
                                    selectedItem.value || selectedItem.packaging_id, 
                                    newSelection
                                )}
                            />
                        ),
                        "Harga Satuan": `Rp${priceField.toLocaleString()}`,
                        "Kuantitas": (
                            <Input
                                showRequired={false}
                                type="number"
                                value={currentQuantity}
                                onChange={(newCount) => handlePackagingQuantityChange(
                                    selectedItem.value || selectedItem.packaging_id, 
                                    newCount
                                )}
                            />
                        ),
                        quantity: currentQuantity,
                        "Total Biaya": `Rp${newTotalBiaya.toLocaleString()}`,
                        rawTotalBiaya: newTotalBiaya,
                        currentPrice: priceField
                    };
                }
                
                return updatedData;
            });
        }
    };

    const handlePackagingQuantityChange = (itemId, newCount) => {
        console.log('handlePackagingQuantityChange called:', { itemId, newCount });
        
        setPackagingData(prevItems => {
            const updatedData = [...prevItems];

            const rowIndex = updatedData.findIndex(row => 
                row && (
                    row.id === itemId || 
                    row.packaging_id === itemId
                )
            );
        
            if (rowIndex !== -1) {
                const currentItem = updatedData[rowIndex];
    
                if (!currentItem) {
                    console.error('Current packaging item is null or undefined');
                    return prevItems;
                }

                const numericCount = Number(newCount);
                const currentPrice = currentItem.currentPrice;
  
                const newTotal = currentPrice * numericCount;
    
                updatedData[rowIndex] = {
                    ...currentItem,
                    quantity: numericCount,
                    "Kuantitas": (
                        <Input
                            showRequired={false}
                            type="number"
                            value={numericCount}
                            onChange={(newValue) => handlePackagingQuantityChange(itemId, newValue)}
                        />
                    ),
                    "Total Biaya": `Rp${newTotal.toLocaleString()}`,
                    rawTotalBiaya: newTotal
                };
                
                return updatedData;
            }
    
            console.warn(`Packaging item with ID ${itemId} not found`);
            return prevItems;
        });
    };

    const handleDeletePackaging = () => {
        setPackagingData([]);
        setHasPackaging(false);
        setSelectedPackagingItems([]);
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

    const filteredItems = (() => {
        const selectedData = dataBarang.find((data) => data.jenis === activeJenis);
        if (!selectedData) return [];
        
        // Return the items for the current page (API already handles pagination)
        return selectedData.items || [];
    })();

    const resetSelection = () => {
        setSelectedItems([]);
        setIsModalOpen(false);
        setSearchTerm("");
        // Reset search states based on current active jenis
        if (activeJenis === "Barang Handmade") {
            setSearchHandmade("");
        } else if (activeJenis === "Barang Non-Handmade") {
            setSearchNonHandmade("");
        } else if (activeJenis === "Barang Mentah") {
            setSearchMentah("");
        }
        // Reset pagination to page 1
        if (activeJenis === "Barang Handmade") {
            setPaginationHandmade(prev => ({ ...prev, page: 1 }));
        } else if (activeJenis === "Barang Non-Handmade") {
            setPaginationNonHandmade(prev => ({ ...prev, page: 1 }));
        } else if (activeJenis === "Barang Mentah") {
            setPaginationMentah(prev => ({ ...prev, page: 1 }));
        }
    };

    const handleModalSubmit = () => {
        const newItems = selectedItems.map((item) => {
            console.log(item)
            const totalBiaya = parseInt(item.price) * item.count;
            
            // Cari kategori item
            const categoryWithItem = dataBarang.find(cat => 
                cat.items.some(i => i.id === item.id)
            );
    
            return {
                id: item.id,
                No: itemData.length + 1,
                "Foto Produk": (
                    <img 
                        src={item.image} 
                        alt={item.name} 
                        className="w-12 h-12" 
                        onError={(e) => {
                            e.target.src = "https://via.placeholder.com/150";
                        }}
                    />
                ),
                "Nama Produk": (
                    <InputDropdown
                        showRequired={false}
                        options={dataBarang.reduce((allItems, category) => {
                            const items = category.items.map(item => ({
                                label: item.name,
                                value: item.id,
                                price: item.price
                            }));
                            return [...allItems, ...items];
                        }, [])}
                        value={item.id}
                        onSelect={(newSelection) => handleDropdownChange(item.id, newSelection)}
                    />
                ),
                "Jenis Barang": categoryWithItem?.jenis || "",
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
                currentPrice: item.price
            };
        });
    
        setItemData([...itemData, ...newItems]);
        setIsModalOpen(false);
        setSelectedItems([]);
    };

    const handleDropdownChange = (itemId, nextSelection) => {
        setItemData(prevItems => {
            const updatedData = [...prevItems];
            const rowIndex = updatedData.findIndex((row) => row.id === itemId);
         
            if (rowIndex !== -1) {
                // Cari item yang dipilih dari semua kategori
                const selectedItem = dataBarang.reduce((found, category) => {
                    if (found) return found;
                    return category.items.find(item => item.id === nextSelection.value);
                }, null);
         
                if (selectedItem) {
                    // Cari jenis barang dari kategori yang sesuai
                    const categoryWithItem = dataBarang.find(cat => 
                        cat.items.some(i => i.id === selectedItem.id)
                    );
                    
                    const currentQuantity = updatedData[rowIndex].quantity || 0;
                    const newTotalBiaya = selectedItem.price * currentQuantity;
                    
                    // Clone dan update item
                    const updatedItem = {
                        ...updatedData[rowIndex],
                        id: selectedItem.id,
                        "Foto Produk": (
                            <img 
                                src={getImageUrl({
                                    barang_id: selectedItem.id, 
                                    image: selectedItem.image
                                })} 
                                alt={selectedItem.name} 
                                className="w-12 h-12"
                                onError={(e) => {
                                    e.target.src = "https://via.placeholder.com/150";
                                }} 
                            />
                        ),
                        "Nama Produk": (
                            <InputDropdown
                                showRequired={false}
                                options={getAllProductOptions(dataBarang)}
                                value={selectedItem.id}
                                onSelect={(newSelection) => handleDropdownChange(selectedItem.id, newSelection)}
                            />
                        ),
                        "Jenis Barang": categoryWithItem?.jenis || "",
                        "Harga Satuan": `Rp${selectedItem.price.toLocaleString()}`,
                        "Kuantitas": (
                            <Input
                                showRequired={false}
                                type="number"
                                value={currentQuantity}
                                onChange={(newCount) => handleQuantityChange(selectedItem.id, newCount)}
                            />
                        ),
                        "Total Biaya": `Rp${newTotalBiaya.toLocaleString()}`,
                        quantity: currentQuantity,
                        rawTotalBiaya: newTotalBiaya,
                        currentPrice: selectedItem.price
                    };
    
                    // Update array
                    updatedData[rowIndex] = updatedItem;
                    
                    return updatedData;
                }
            }
    
            return prevItems;
        });
    };

    const handleQuantityChange = (itemId, newCount) => {
        if (!itemId) {
            console.error('Invalid item ID');
            return;
        }
    
        setItemData(prevItems => {
            const updatedData = [...prevItems];
            
            const rowIndex = updatedData.findIndex((row) => row && row.id === itemId);
        
            if (rowIndex !== -1) {
                const currentItem = updatedData[rowIndex];

                if (!currentItem) {
                    console.error('Current item is null or undefined');
                    return prevItems;
                }
    
                const numericCount = Number(newCount);

                const newTotal = currentItem.currentPrice * numericCount;

                updatedData[rowIndex] = {
                    ...currentItem,
                    quantity: numericCount,
                    rawTotalBiaya: newTotal, 
                    "Total Biaya": `Rp${newTotal.toLocaleString()}`,
                    "Kuantitas": ( 
                        <Input
                            showRequired={false}
                            type="number"
                            value={numericCount}
                            onChange={(newValue) => handleQuantityChange(itemId, newValue)}
                        />
                    )
                };
                
                return updatedData;
            }
    
            // Jika tidak menemukan item, kembalikan data sebelumnya
            console.warn(`Item with ID ${itemId} not found`);
            return prevItems;
        });
    };
    

    const handleDeleteItem = (itemId) => {
        setItemData(prev => prev.filter(item => item.id !== itemId));
    };

    const calculateSubtotal = () => {
    
        const itemSubtotal = (itemData || []).reduce((acc, row) => {
            return row && row.rawTotalBiaya ? acc + row.rawTotalBiaya : acc;
        }, 0);
    
        const packagingSubtotal = (packagingData || []).reduce((acc, row) => {
            return row && row.rawTotalBiaya ? acc + row.rawTotalBiaya : acc;
        }, 0);
    
        return itemSubtotal + packagingSubtotal;
    };

    const calculateTotalPenjualan = (subtotal) => {
        const diskonNominal = (diskon / 100) * subtotal;
        return subtotal - diskonNominal + pajak;
    };

    const breadcrumbItems = fromLaporanKeuangan 
        ? [
            { label: "Daftar Laporan Keuangan", href: "/laporanKeuangan" },
            { label: "Edit Penjualan", href: "" },
          ]
        : [
            { label: "Daftar Penjualan Gudang", href: "/penjualan-admin-gudang" },
            { label: "Edit Penjualan", href: "" },
          ];

    const headers = [
        { label: "No", key: "No", align: "text-left" },
        { label: "Foto Produk", key: "Foto Produk", align: "text-left" },
        { label: "Nama Produk", key: "Nama Produk", align: "text-left" },
        { label: "Jenis Barang", key: "Jenis Barang", align: "text-left" },
        { label: "Harga Satuan", key: "Harga Satuan", align: "text-left" },
        { label: "Kuantitas", key: "Kuantitas", align: "text-left", width: '110px' },
        { label: "Total Biaya", key: "Total Biaya", align: "text-left" },
        { label: "Aksi", key: "Aksi", align: "text-left" },
    ];

    const dataBayar = [
        { label: "Cash", value: 1 },
        { label: "Non-Cash", value: 2 }
    ];

    const subtotal = calculateSubtotal();
    const totalPenjualan = calculateTotalPenjualan(subtotal);
    const navigate = useNavigate();

    const getBarangKey = (id) => {
        if (id.startsWith('BHM')) return 'barang_handmade_id';
        if (id.startsWith('BNH')) return 'barang_nonhandmade_id';
        if (id.startsWith('MTH')) return 'barang_mentah_id';
        if (id.startsWith('PCK')) return 'packaging_id';
        return null;
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
        
            const produkData = [
                ...itemData.map(item => {
                    const idKey = getBarangKey(item.id);
                    
                    return {
                        [idKey]: item.id,
                        harga_satuan: item.currentPrice,
                        kuantitas: item.quantity,
                        total_biaya: item.rawTotalBiaya
                    };
                }),
                // Tambahkan packaging jika ada
                ...(packagingData.length > 0 
                    ? [{
                        packaging_id: packagingData[0].id,
                        harga_satuan: packagingData[0].currentPrice,
                        kuantitas: packagingData[0].quantity,
                        total_biaya: packagingData[0].rawTotalBiaya
                    }] 
                    : [])
            ];
    
            const payload = {
                cash_or_non: selectBayar === 1, 
                nama_pembeli: namaPembeli,
                sub_total: subtotal,
                diskon: diskon,
                pajak: pajak,
                total_penjualan: totalPenjualan,
                catatan: note,
                produk: produkData
            };
    
            if (selectBayar === 2) {
                payload.metode_id = selectMetode;
            }
    
            console.log('Payload Edit Penjualan:', JSON.stringify(payload, null, 2));
    
            const response = await api.put(`/penjualan-gudang/${id}`, payload);
            
            if (response.data.success) {
                setModalSucc(true);
            } else {
                alert(response.data.message || "Gagal menyimpan data");
            }
        } catch (error) {
            console.error("Error updating penjualan:", error);
            setErrorMessage(error.response.data.message)
        } finally {
            setLoading(false);
        }
    };

    const handleAcc = () => {
        setModalSucc(false);
        // Navigasi kembali ke halaman yang sesuai
        navigate(fromLaporanKeuangan ? '/laporanKeuangan' : '/penjualan-admin-gudang');
    };

    const btnAddBaris = () => {
        setIsModalOpen(true);
    };

    return (
        <>
            <LayoutWithNav>
                <div className="p-5">
                    <Breadcrumbs items={breadcrumbItems} />
    
                    {/* Section Form Input */}
                    <section className="bg-white p-5 mt-5 rounded-xl">
                        <form onSubmit={handleEditSubmit}>
                            <section>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <Input label={"Nomor"} type1={"text"} disabled={true} value={nomor} onChange={(e) => setNomor(e)} />
                                    <Input label={"Tanggal"} type1={"date"} value={tanggal} onChange={(e) => setTanggal(e)} />
                                    <Input label={"Nama Pembeli"} required={false} value={namaPembeli} onChange={(e) => setNamaPembeli(e)} />
                                    <InputDropdown 
                                        label="Cash/Non-Cash"
                                        required={true}
                                        options={dataBayar}
                                        value={selectBayar} 
                                        onSelect={(selectedOption) => {
                                            setSelectedBayar(selectedOption.value);
                                            if (selectedOption.value === 2) { 
                                                setIsMetodeDisabled(false);
                                                const defaultNonCashMethod = dataMetode[1]?.value;
                                                if (defaultNonCashMethod) {
                                                    setSelectMetode(defaultNonCashMethod);
                                                }
                                            } else {
                                                setIsMetodeDisabled(true);
                                                setSelectMetode(1); // Default untuk Cash
                                            }
                                        }}
                                    />
                                    <div>
                                    <InputDropdown 
                                        label="Metode Pembayaran"
                                        required={true}
                                        disabled={isMetodeDisabled}
                                        options={dataMetode}
                                        value={selectMetode} 
                                        onSelect={(selectedOption) => setSelectMetode(selectedOption.value)}
                                    />
                                    </div>
                                </div>
                            </section>
    
                            {/* Section List Produk */}
                            <section className="pt-10">
                                <h2 className="font-semibold text-lg mb-4">List Produk</h2>
                                <div className="pt-5">
                                    <Table headers={headers} data={itemData.map(item => ({
                                        ...item,
                                        "Aksi": (
                                            <button
                                                onClick={() => handleDeleteItem(item.id)}
                                                className="text-red-500 hover:text-red-700"
                                            >
                                                Hapus
                                            </button>
                                        )
                                    }))} />
                                    <Button
                                        label="Tambah Baris"
                                        icon={
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                                            </svg>
                                        }
                                        bgColor=""
                                        hoverColor={`hover:border-${themeColor} hover:border`}
                                        textColor={`text-${themeColor}`}
                                        onClick={btnAddBaris}
                                    />
                                </div>
                            </section>

                            {/* Section Packaging */}
                            <section className="pt-10">
                                <h2 className="font-semibold text-lg mb-4">Packaging</h2>
                                <div className="pt-5">
                                    <Table 
                                        headers={[
                                            { label: "No", key: "No", align: "text-left" },
                                            { label: "Foto Packaging", key: "Foto Packaging", align: "text-left" },
                                            { label: "Nama Packaging", key: "Nama Packaging", align: "text-left" },
                                            { label: "Harga Satuan", key: "Harga Satuan", align: "text-left" },
                                            { label: "Kuantitas", key: "Kuantitas", align: "text-left", width: '110px' },
                                            { label: "Total Biaya", key: "Total Biaya", align: "text-left" },
                                            { label: "Aksi", key: "Aksi", align: "text-left" },
                                        ]} 
                                        data={packagingData.map(item => ({
                                            ...item,
                                            "Aksi": (
                                                <button
                                                    onClick={() => handleDeletePackaging(item.id)}
                                                    className="text-red-500 hover:text-red-700"
                                                >
                                                    Hapus
                                                </button>
                                            )
                                        }))} 
                                    />
                                    {!hasPackaging && (
                                        <Button
                                            label="Tambah Baris"
                                            icon={
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                                                </svg>
                                            }
                                            bgColor=""
                                            hoverColor={`hover:border-${themeColor} hover:border`}
                                            textColor={`text-${themeColor}`}
                                            onClick={handleAddPackaging}
                                            disabled={hasPackaging}
                                        />
                                    )}
                                </div>
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
                                        <div className="flex justify-between border-b pb-2">
                                            <p className="font-bold">Subtotal</p>
                                            <p className="">Rp{subtotal.toLocaleString()}</p>
                                        </div>
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
                                        <div className="flex justify-between border-b pb-2">
                                            <p className="font-bold">Total Penjualan</p>
                                            <p className="font-bold">Rp{totalPenjualan.toLocaleString()}</p>
                                        </div>
                                        <div>
                                            <Button
                                                label="Simpan Perubahan"
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

                    {/* Modal Tambah Baris */}
                    {isModalOpen && (
                        <section className="fixed inset-0 bg-white bg-opacity-80 flex justify-center items-center z-50">
                            <div className={`bg-white border border-${themeColor} rounded-md p-6 w-[90%] md:w-[70%] h-[90%] overflow-auto flex flex-col`}>
                                <div className="flex flex-col space-y-4 mb-4">
                                    {/* Top row: Search and clear button */}
                                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                        <div className="relative w-full sm:max-w-md">
                                            <span className="absolute inset-y-0 left-3 flex items-center">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                                                    <path d="M20.707 19.293l-4.054-4.054A7.948 7.948 0 0016 9.5 8 8 0 108 17.5c1.947 0 3.727-.701 5.239-1.865l4.054 4.054a1 1 0 001.414-1.414zM10 15.5A6.5 6.5 0 1110 2a6.5 6.5 0 010 13.5z" />
                                                </svg>
                                            </span>
                                            <input
                                                type="text"
                                                placeholder="Cari Barang yang mau dibeli"
                                                value={(() => {
                                                    if (activeJenis === "Barang Handmade") return searchHandmade;
                                                    if (activeJenis === "Barang Non-Handmade") return searchNonHandmade;
                                                    if (activeJenis === "Barang Mentah") return searchMentah;
                                                    return searchTerm;
                                                })()}
                                                onChange={(e) => {
                                                    const value = e.target.value;
                                                    setSearchTerm(value);
                                                    // Update the appropriate search state based on active jenis
                                                    if (activeJenis === "Barang Handmade") {
                                                        setSearchHandmade(value);
                                                    } else if (activeJenis === "Barang Non-Handmade") {
                                                        setSearchNonHandmade(value);
                                                    } else if (activeJenis === "Barang Mentah") {
                                                        setSearchMentah(value);
                                                    }
                                                }}
                                                className="w-full border border-gray-300 rounded-md py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-gray-500"
                                            />
                                        </div>

                                        <div className="flex items-center space-x-4 self-end sm:self-auto">
                                            <button
                                                onClick={() => {
                                                    setSearchTerm("");
                                                    setSelectedItems([]);
                                                    // Reset the appropriate search state based on active jenis
                                                    if (activeJenis === "Barang Handmade") {
                                                        setSearchHandmade("");
                                                    } else if (activeJenis === "Barang Non-Handmade") {
                                                        setSearchNonHandmade("");
                                                    } else if (activeJenis === "Barang Mentah") {
                                                        setSearchMentah("");
                                                    }
                                                }}
                                                className="text-gray-400 hover:text-gray-700 focus:outline-none"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                            <p className={`text-${themeColor} font-semibold`}>
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
                                            onClick={resetSelection}
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

                                <div className="flex border-b border-gray-300 mb-4 overflow-x-auto">
                                    {jenisBarang.map((jenis) => (
                                        <button
                                            key={jenis}
                                            onClick={() => {
                                                setActiveJenis(jenis);
                                                // Reset pagination, search, and category when switching jenis
                                                if (jenis === "Barang Handmade") {
                                                    setPaginationHandmade(prev => ({ ...prev, page: 1 }));
                                                    setSearchHandmade("");
                                                    setSelectedCategoryHandmade("Semua");
                                                } else if (jenis === "Barang Non-Handmade") {
                                                    setPaginationNonHandmade(prev => ({ ...prev, page: 1 }));
                                                    setSearchNonHandmade("");
                                                    setSelectedCategoryNonHandmade("Semua");
                                                } else if (jenis === "Barang Mentah") {
                                                    setPaginationMentah(prev => ({ ...prev, page: 1 }));
                                                    setSearchMentah("");
                                                    setSelectedCategoryMentah("Semua");
                                                }
                                                // Reset the general search term and category
                                                setSearchTerm("");
                                                setSelectedCategory("Semua");
                                            }}
                                            className={`px-4 py-2 text-sm font-semibold whitespace-nowrap ${
                                                activeJenis === jenis ? `text-${themeColor} border-b-2 border-${themeColor}` : "text-gray-400"
                                            }`}
                                        >
                                            {jenis}
                                        </button>
                                    ))}
                                </div>

                                {activeJenis !== "Barang Mentah" && (
                                    <div className="flex flex-wrap gap-2 mt-4">
                                        {dataBarang
                                            .find((data) => data.jenis === activeJenis)
                                            ?.kategori?.map((kategori) => (
                                                <button
                                                    key={kategori}
                                                    onClick={() => {
                                                        setSelectedCategory(kategori);
                                                        // Update the appropriate category state based on active jenis
                                                        if (activeJenis === "Barang Handmade") {
                                                            setSelectedCategoryHandmade(kategori);
                                                        } else if (activeJenis === "Barang Non-Handmade") {
                                                            setSelectedCategoryNonHandmade(kategori);
                                                        } else if (activeJenis === "Barang Mentah") {
                                                            setSelectedCategoryMentah(kategori);
                                                        }
                                                    }}
                                                    className={`px-3 py-1 text-sm md:text-base rounded-md ${
                                                        (() => {
                                                            if (activeJenis === "Barang Handmade") return selectedCategoryHandmade === kategori;
                                                            if (activeJenis === "Barang Non-Handmade") return selectedCategoryNonHandmade === kategori;
                                                            if (activeJenis === "Barang Mentah") return selectedCategoryMentah === kategori;
                                                            return selectedCategory === kategori;
                                                        })()
                                                        ? `bg-${themeColor} text-white`
                                                        : "border border-gray-300"
                                                    }`}
                                                >
                                                    {kategori}
                                                </button>
                                            ))}
                                    </div>
                                )}

                                {/* Items per page dropdown - moved below category selection */}
                                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 mt-4">
                                    <span className="text-xs sm:text-sm text-gray-600">Items per page:</span>
                                    <select
                                        value={(() => {
                                            if (activeJenis === "Barang Handmade") return paginationHandmade.limit;
                                            if (activeJenis === "Barang Non-Handmade") return paginationNonHandmade.limit;
                                            if (activeJenis === "Barang Mentah") return paginationMentah.limit;
                                            return 12;
                                        })()}
                                        onChange={(e) => {
                                            const newLimit = Number(e.target.value);
                                            if (activeJenis === "Barang Handmade") {
                                                setPaginationHandmade(prev => ({ ...prev, page: 1, limit: newLimit }));
                                            } else if (activeJenis === "Barang Non-Handmade") {
                                                setPaginationNonHandmade(prev => ({ ...prev, page: 1, limit: newLimit }));
                                            } else if (activeJenis === "Barang Mentah") {
                                                setPaginationMentah(prev => ({ ...prev, page: 1, limit: newLimit }));
                                            }
                                        }}
                                        className={`border border-gray-300 rounded-md px-2 py-1 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-${themeColor}`}
                                    >
                                        {[12, 24, 48, 96].map(option => (
                                            <option key={option} value={option}>
                                                {option}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="mt-6 flex-1 min-h-0 overflow-y-auto no-scrollbar">
                                    {(() => {
                                        const currentPage = activeJenis === "Barang Handmade" ? paginationHandmade.page :
                                                          activeJenis === "Barang Non-Handmade" ? paginationNonHandmade.page :
                                                          activeJenis === "Barang Mentah" ? paginationMentah.page : 1;
                                        const totalPages = activeJenis === "Barang Handmade" ? paginationHandmade.totalPages :
                                                         activeJenis === "Barang Non-Handmade" ? paginationNonHandmade.totalPages :
                                                         activeJenis === "Barang Mentah" ? paginationMentah.totalPages : 1;
                                        const totalItems = activeJenis === "Barang Handmade" ? paginationHandmade.total :
                                                         activeJenis === "Barang Non-Handmade" ? paginationNonHandmade.total :
                                                         activeJenis === "Barang Mentah" ? paginationMentah.total : 0;
                                        
                                        console.log('Gallery2 Debug:', {
                                            activeJenis,
                                            currentPage,
                                            totalPages,
                                            totalItems,
                                            showPagination: true,
                                            shouldShowPagination: totalPages > 1
                                        });
                                        
                                        return null;
                                    })()}
                                    <Gallery2
                                        items={filteredItems.map(item => ({
                                            ...item,
                                            image: getImageUrl({
                                                barang_id: item.id,
                                                image: item.image
                                            })  
                                        }))}
                                        onSelect={handleSelectItem}
                                        selectedItems={selectedItems}
                                        enableStockValidation={true}
                                        showPagination={true}
                                        currentPage={(() => {
                                            const page = activeJenis === "Barang Handmade" ? paginationHandmade.page :
                                                       activeJenis === "Barang Non-Handmade" ? paginationNonHandmade.page :
                                                       activeJenis === "Barang Mentah" ? paginationMentah.page : 1;
                                            console.log('Current page for', activeJenis, ':', page);
                                            return page;
                                        })()}
                                        totalPages={(() => {
                                            const totalPages = activeJenis === "Barang Handmade" ? paginationHandmade.totalPages :
                                                             activeJenis === "Barang Non-Handmade" ? paginationNonHandmade.totalPages :
                                                             activeJenis === "Barang Mentah" ? paginationMentah.totalPages : 1;
                                            console.log('Total pages for', activeJenis, ':', totalPages);
                                            return totalPages;
                                        })()}
                                        totalItems={(() => {
                                            const totalItems = activeJenis === "Barang Handmade" ? paginationHandmade.total :
                                                             activeJenis === "Barang Non-Handmade" ? paginationNonHandmade.total :
                                                             activeJenis === "Barang Mentah" ? paginationMentah.total : 0;
                                            console.log('Total items for', activeJenis, ':', totalItems);
                                            return totalItems;
                                        })()}
                                        itemsPerPage={(() => {
                                            if (activeJenis === "Barang Handmade") return paginationHandmade.limit;
                                            if (activeJenis === "Barang Non-Handmade") return paginationNonHandmade.limit;
                                            if (activeJenis === "Barang Mentah") return paginationMentah.limit;
                                            return 12;
                                        })()}
                                        onPageChange={(newPage) => {
                                            console.log('Page change to:', newPage, 'for jenis:', activeJenis);
                                            if (activeJenis === "Barang Handmade") {
                                                setPaginationHandmade(prev => ({ ...prev, page: newPage }));
                                            } else if (activeJenis === "Barang Non-Handmade") {
                                                setPaginationNonHandmade(prev => ({ ...prev, page: newPage }));
                                            } else if (activeJenis === "Barang Mentah") {
                                                setPaginationMentah(prev => ({ ...prev, page: newPage }));
                                            }
                                        }}
                                        onItemsPerPageChange={() => {}} // Disabled because we moved it to top
                                    />
                                </div>
                            </div>
                        </section>
                    )}

                    {/* Modal Tambah Packaging */}
                    {isPackagingModalOpen && (
                        <section className="fixed inset-0 bg-white bg-opacity-80 flex justify-center items-center z-50">
                            <div className={`bg-white border border-${themeColor} rounded-md p-6 w-[90%] md:w-[70%] h-[90%] overflow-auto flex flex-col`}>
                                <div className="flex flex-col space-y-4 mb-4">
                                    {/* Top row: Search and Items per page */}
                                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                        <div className="relative w-full sm:max-w-md">
                                            <span className="absolute inset-y-0 left-3 flex items-center">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                                                    <path d="M20.707 19.293l-4.054-4.054A7.948 7.948 0 0016 9.5 8 8 0 108 17.5c1.947 0 3.727-.701 5.239-1.865l4.054 4.054a1 1 0 001.414-1.414zM10 15.5A6.5 6.5 0 1110 2a6.5 6.5 0 010 13.5z" />
                                                </svg>
                                            </span>
                                            <input
                                                type="text"
                                                placeholder="Cari Packaging"
                                                value={searchPackagingTerm}
                                                onChange={(e) => {
                                                    const value = e.target.value;
                                                    setSearchPackagingTerm(value);
                                                    setSearchPackaging(value);
                                                }}
                                                className="w-full border border-gray-300 rounded-md py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-gray-500"
                                            />
                                        </div>

                                        <div className="flex items-center space-x-4 self-end sm:self-auto">
                                            {/* Items per page dropdown */}
                                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                                                <span className="text-xs sm:text-sm text-gray-600">Items per page:</span>
                                                <select
                                                    value={paginationPackaging.limit}
                                                    onChange={(e) => {
                                                        const newLimit = Number(e.target.value);
                                                        setPaginationPackaging(prev => ({ ...prev, page: 1, limit: newLimit }));
                                                    }}
                                                    className={`border border-gray-300 rounded-md px-2 py-1 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-${themeColor}`}
                                                >
                                                    {[12, 24, 48, 96].map(option => (
                                                        <option key={option} value={option}>
                                                            {option}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>

                                            <button
                                                onClick={() => {
                                                    setSearchPackagingTerm("");
                                                    setSearchPackaging("");
                                                    setSelectedPackagingItems([]);
                                                }}
                                                className="text-gray-400 hover:text-gray-700 focus:outline-none"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                            <p className={`text-${themeColor} font-semibold`}>
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
                                            onClick={resetPackagingSelection}
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

                                {/* Category filter for packaging */}
                                <div className="flex flex-wrap gap-2 mt-4">
                                    <button
                                        onClick={() => setSelectedCategoryPackaging("Semua")}
                                        className={`px-3 py-1 text-sm md:text-base rounded-md ${
                                            selectedCategoryPackaging === "Semua"
                                            ? `bg-${themeColor} text-white`
                                            : "border border-gray-300"
                                        }`}
                                    >
                                        Semua
                                    </button>
                                    {/* Add more category buttons as needed */}
                                </div>

                                <div className="mt-6 flex-1 min-h-0 overflow-y-auto no-scrollbar">
                                    <Gallery2
                                        items={dataPackaging}
                                        onSelect={handleSelectPackagingItem}
                                        selectedItems={selectedPackagingItems}
                                        enableStockValidation={true}
                                        showPagination={true}
                                        currentPage={paginationPackaging.page}
                                        totalPages={paginationPackaging.totalPages}
                                        totalItems={paginationPackaging.total}
                                        itemsPerPage={paginationPackaging.limit}
                                        onPageChange={(newPage) => {
                                            setPaginationPackaging(prev => ({ ...prev, page: newPage }));
                                        }}
                                        onItemsPerPageChange={() => {}} // Disabled because we moved it to top
                                    />
                                </div>
                            </div>
                        </section>
                    )}
                </div>

                {isModalSucc && (
                    <AlertSuccess
                        title="Berhasil!!"
                        description="Data berhasil diperbarui"
                        confirmLabel="Ok"
                        onConfirm={handleAcc}
                    />
                )}

                {isLoading && <Spinner/>}

                {errorMessage && (
                    <AlertError
                        title={'Failed'}
                        description={errorMessage}
                        onConfirm={() => setErrorMessage(null)}
                    />
                )}
            </LayoutWithNav>
        </>
    );
}