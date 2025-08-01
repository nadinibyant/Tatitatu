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

export default function TambahPenjualanGudang() {
   const [nomor, setNomor] = useState("");
   const [tanggal, setTanggal] = useState(null);
   const [namaPembeli, setNamaPembeli] = useState("");
   const [note, setNote] = useState("");
   const [selectBayar, setSelectedBayar] = useState("");
   const [selectMetode, setSelectMetode] = useState("");
   const [diskon, setDiskon] = useState(0);
   const [pajak, setPajak] = useState(0);
   const [itemData, setItemData] = useState([]);
   const [errorMessage, setErrorMessage] = useState("")

   const userData = JSON.parse(localStorage.getItem('userData'));
   const isAdminGudang = userData?.role === 'admingudang';
   const isHeadGudang = userData?.role === 'headgudang'

   const [isModalOpen, setIsModalOpen] = useState(false);
   const [selectedCategory, setSelectedCategory] = useState("Semua");
   const [selectedJenis, setSelectedJenis] = useState("Barang Handmade");
   const [selectedItems, setSelectedItems] = useState([]);
   const [searchTerm, setSearchTerm] = useState("");
   const [isLoading, setLoading] = useState(false);
   const [isModalSucc, setModalSucc] = useState(false);
   const [isMetodeDisabled, setIsMetodeDisabled] = useState(false);
   const [dataMetode, setDataMetode] = useState([]);
   const [dataBarang, setDataBarang] = useState([]);
   const [jenisBarang, setJenisBarang] = useState([]);
   const [packagingData, setPackagingData] = useState([]);
   const [isPackagingModalOpen, setIsPackagingModalOpen] = useState(false);
   const [selectedPackagingItems, setSelectedPackagingItems] = useState([]);
   const [selectedPackagingCategory, setSelectedPackagingCategory] = useState("Semua");
   const [hasPackaging, setHasPackaging] = useState(false);
   const [dataPackaging, setDataPackaging] = useState([]);

   // State for API pagination and filtering
   const [currentPage, setCurrentPage] = useState(1);
   const [currentPackagingPage, setCurrentPackagingPage] = useState(1);
   const [limit, setLimit] = useState(50);
   const [packagingLimit, setPackagingLimit] = useState(50);
   const [selectedCategoryId, setSelectedCategoryId] = useState(null);
   const [selectedPackagingCategoryId, setSelectedPackagingCategoryId] = useState(null);
   const [kategoriIdMap, setKategoriIdMap] = useState({});
   
   // State for pagination info
   const [totalPages, setTotalPages] = useState(1);
   const [totalItems, setTotalItems] = useState(0);
   const [packagingTotalPages, setPackagingTotalPages] = useState(1);
   const [packagingTotalItems, setPackagingTotalItems] = useState(0);

   const themeColor = (isAdminGudang || isHeadGudang) ? "coklatTua" : "primary";

   // Functions to fetch data
   const fetchAllData = async (page = 1, limit = 50, categoryId = null, searchTerm = "") => {
       try {
           setLoading(true);
           
           const [handmadeRes, nonHandmadeRes, mentahRes, jenisRes, packagingRes] = await Promise.all([
               api.get('/barang-handmade-gudang', { 
                   params: { 
                       page: page || 1, 
                       limit: limit || 50, 
                       category: categoryId, 
                       search: searchTerm 
                   } 
               }),
               api.get('/barang-nonhandmade-gudang', { 
                   params: { 
                       page: page || 1, 
                       limit: limit || 50, 
                       category: categoryId, 
                       search: searchTerm 
                   } 
               }),
               api.get('/barang-mentah', { 
                   params: { 
                       page: page || 1, 
                       limit: limit || 50, 
                       category: categoryId, 
                       search: searchTerm 
                   } 
               }),
               api.get('/jenis-barang-gudang'),
               api.get('/packaging-gudang', { 
                   params: { 
                       page: page || 1, 
                       limit: limit || 50, 
                       category: categoryId, 
                       search: searchTerm 
                   } 
               })
           ]);

           if (packagingRes.data.success) {
               const packagingItems = packagingRes.data.data.map(item => ({
                   id: item.packaging_id.toString(),
                   image: getImageUrl({
                       id: item.packaging_id.toString(),
                       image: item.image
                   }),
                   name: item.nama_packaging,
                   ukuran: item.ukuran,
                   price: item.harga_jual,
                   stok: item.jumlum_minimum_stok,
                   stock: item.stok_barang?.jumlah_stok || 0
               }));
               setDataPackaging(packagingItems);
               
               // Update pagination info if available in response
               if (packagingRes.data.pagination) {
                   setPackagingTotalPages(packagingRes.data.pagination.totalPages || 1);
                   setPackagingTotalItems(packagingRes.data.pagination.totalItems || 0);
               }
           }

           const jenisBarangData = jenisRes.data.data.filter(j => j.nama_jenis_barang !== "Packaging");
           setJenisBarang(jenisBarangData.map(j => `Barang ${j.nama_jenis_barang}`));

           // Create kategori mapping
           const kategoriMapping = {};
           jenisBarangData.forEach(jenis => {
               if (jenis.kategori_barang) {
                   kategoriMapping[jenis.kategori_barang.nama_kategori_barang] = jenis.kategori_barang.kategori_barang_id;
               }
           });
           setKategoriIdMap(kategoriMapping);

           const dataByJenis = {};
           jenisBarangData.forEach(jenis => {
               dataByJenis[jenis.jenis_barang_id] = {
                   jenis: `Barang ${jenis.nama_jenis_barang}`,
                   items: [],
                   kategori: ["Semua"]
               };
           });

           if (handmadeRes.data.success) {
               handmadeRes.data.data.forEach(item => {
                   const handmadeItem = {
                       id: item.barang_handmade_id.toString(),
                       image: item.image ,
                       name: item.nama_barang,
                       price: item.harga_logis,
                       kategori: item.kategori?.nama_kategori_barang,
                       code: item.barang_handmade_id.toString(),
                       stock: item.stok_barang?.jumlah_stok || 0
                   };

                   const jenisId = item.jenis_barang_id;
                   if (dataByJenis[jenisId]) {
                       dataByJenis[jenisId].items.push(handmadeItem);
                       if (item.kategori?.nama_kategori_barang && !dataByJenis[jenisId].kategori.includes(item.kategori.nama_kategori_barang)) {
                           dataByJenis[jenisId].kategori.push(item.kategori.nama_kategori_barang);
                       }
                   }
               });
           }

           if (nonHandmadeRes.data.success) {
               nonHandmadeRes.data.data.forEach(item => {
                   const nonHandmadeItem = {
                       id: item.barang_nonhandmade_id.toString(),
                       image: item.image,
                       name: item.nama_barang,
                       price: item.harga_logis,
                       kategori: item.kategori?.nama_kategori_barang,
                       code: item.barang_nonhandmade_id.toString(),
                       stock: item.stok_barang?.jumlah_stok || 0
                   };

                   const jenisId = jenisBarangData.find(j => j.nama_jenis_barang === "Non Handmade")?.jenis_barang_id;
                   if (dataByJenis[jenisId]) {
                       dataByJenis[jenisId].items.push(nonHandmadeItem);
                       if (item.kategori?.nama_kategori_barang && !dataByJenis[jenisId].kategori.includes(item.kategori.nama_kategori_barang)) {
                           dataByJenis[jenisId].kategori.push(item.kategori.nama_kategori_barang);
                       }
                   }
               });
           }

           if (mentahRes.data.success) {
               const mentahJenis = jenisBarangData.find(j => j.nama_jenis_barang === "Mentah");
               if (mentahJenis) {
                   dataByJenis[mentahJenis.jenis_barang_id].items = mentahRes.data.data.map(item => ({
                       id: item.barang_mentah_id.toString(),
                       image: item.image,
                       name: item.nama_barang,
                       price: item.harga,
                       code: item.barang_mentah_id.toString()
                   }));
               }
           }

           setDataBarang(Object.values(dataByJenis));
           
           // Update pagination info if available in response
           if (handmadeRes.data.pagination) {
               setTotalPages(handmadeRes.data.pagination.totalPages || 1);
               setTotalItems(handmadeRes.data.pagination.totalItems || 0);
           }
       } catch (error) {
           console.error("Error fetching data:", error);
       } finally {
           setLoading(false);
       }
   };

   const fetchPackagingData = async (page = 1, limit = 50, categoryId = null, searchTerm = "") => {
       try {
           const response = await api.get('/packaging-gudang', { 
               params: { 
                   page: page || 1, 
                   limit: limit || 50, 
                   category: categoryId, 
                   search: searchTerm 
               } 
           });
           
           if (response.data.success) {
               const packagingItems = response.data.data.map(item => ({
                   id: item.packaging_id.toString(),
                   image: getImageUrl({
                       id: item.packaging_id.toString(),
                       image: item.image
                   }),
                   name: item.nama_packaging,
                   ukuran: item.ukuran,
                   price: item.harga_jual,
                   stok: item.jumlum_minimum_stok,
                   stock: item.stok_barang?.jumlah_stok || 0
               }));
               setDataPackaging(packagingItems);
               
               // Update pagination info if available in response
               if (response.data.pagination) {
                   setPackagingTotalPages(response.data.pagination.totalPages || 1);
                   setPackagingTotalItems(response.data.pagination.totalItems || 0);
               }
           }
       } catch (error) {
           console.error("Error fetching packaging data:", error);
       }
   };

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
};

const handlePackagingModalSubmit = () => {
    const newItems = selectedPackagingItems.map((item) => {
        const totalBiaya = parseInt(item.price) * item.count;

        const dropdownOptions = dataPackaging.map(pack => ({
            label: pack.name,
            value: pack.id,
            price: pack.price
        }));
    
        return {
            id: item.id,
            No: 1,
            "Foto Packaging": (
                <img src={item.image} alt={item.name} className="w-12 h-12" />
            ),
            "Nama Packaging": (
                <InputDropdown
                    showRequired={false}
                    options={dropdownOptions}
                    value={item.id} 
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
            currentPrice: item.price,
            isPackaging: true
        };
    });

    setPackagingData(newItems.slice(0, 1));
    setHasPackaging(true);
    setIsPackagingModalOpen(false);
    setSelectedPackagingItems([]);
};

const handlePackagingDropdownChange = (itemId, newSelection) => {
    console.log('handlePackagingDropdownChange called:', {
        itemId, 
        newSelection, 
        existingPackagingData: [...packagingData]
    });

    const selectedPackage = dataPackaging.find(pkg => pkg.id === newSelection.value);
    
    if (selectedPackage) {
        const dropdownOptions = dataPackaging.map(pack => ({
            label: pack.name,
            value: pack.id,
            price: pack.price
        }));

        setPackagingData(prevData => {
            const updatedData = [...prevData];
            const rowIndex = updatedData.findIndex(row => row.id === itemId);
            
            if (rowIndex !== -1) {
                const currentQuantity = updatedData[rowIndex].quantity || 0;
                const newTotalBiaya = selectedPackage.price * currentQuantity;
 
                updatedData[rowIndex] = {
                    id: selectedPackage.id,
                    No: 1,
                    "Foto Packaging": (
                        <img 
                            src={selectedPackage.image} 
                            alt={selectedPackage.name} 
                            className="w-12 h-12" 
                        />
                    ),
                    "Nama Packaging": (
                        <InputDropdown
                            showRequired={false}
                            options={dropdownOptions}
                            value={selectedPackage.id}
                            onSelect={(nextSelection) => handlePackagingDropdownChange(selectedPackage.id, nextSelection)}
                        />
                    ),
                    "Harga Satuan": `Rp${selectedPackage.price.toLocaleString()}`,
                    "Kuantitas": (
                        <Input
                            showRequired={false}
                            type="number"
                            value={currentQuantity}
                            onChange={(newCount) => handlePackagingQuantityChange(selectedPackage.id, newCount)}
                        />
                    ),
                    quantity: currentQuantity,
                    "Total Biaya": `Rp${newTotalBiaya.toLocaleString()}`,
                    rawTotalBiaya: newTotalBiaya,
                    currentPrice: selectedPackage.price,
                    isPackaging: true
                };
            }
            
            return updatedData;
        });
    }
};

const handlePackagingQuantityChange = (itemId, newCount) => {
    console.log('handlePackagingQuantityChange called:', {
        itemId, 
        newCount, 
        existingPackagingData: [...packagingData]
    });

    setPackagingData(prevData => {
        const updatedData = [...prevData];
        const rowIndex = updatedData.findIndex(row => row.id === itemId);

        if (rowIndex !== -1) {
            const currentItem = updatedData[rowIndex];
            const numericCount = Number(newCount);
            const currentPrice = currentItem.currentPrice;
            const newTotalBiaya = currentPrice * numericCount;

            const quantityInput = (
                <Input
                    showRequired={false}
                    type="number"
                    value={numericCount}
                    onChange={(newValue) => handlePackagingQuantityChange(itemId, newValue)}
                />
            );

            updatedData[rowIndex] = {
                ...currentItem,
                quantity: numericCount,
                "Kuantitas": quantityInput,
                "Total Biaya": `Rp${newTotalBiaya.toLocaleString()}`,
                rawTotalBiaya: newTotalBiaya
            };
        }
        
        return updatedData;
    });
};

const handleDeletePackaging = () => {
    setPackagingData([]);
    setHasPackaging(false);
    setSelectedPackagingItems([]);
};

   
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

   useEffect(() => {
    const fetchPaymentMethods = async () => {
        try {
            setLoading(true);
            const response = await api.get('/metode-pembayaran-gudang');
            if (response.data.success) {
                const formattedData = response.data.data.map(method => ({
                    id: method.metode_id,
                    label: method.nama_metode,
                    value: method.metode_id
                }));
                setDataMetode([{ id: 1, label: "-", value: 1 }, ...formattedData]);
            }
        } catch (error) {
            console.error("Error fetching payment methods:", error);
        } finally {
            setLoading(false);
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

   const calculateSubtotal = () => {
        const itemSubtotal = itemData.reduce((acc, row) => acc + (row.rawTotalBiaya || 0), 0);
        const packagingSubtotal = packagingData.reduce((acc, row) => acc + (row.rawTotalBiaya || 0), 0);
        return itemSubtotal + packagingSubtotal;
    };

   const calculateTotalPenjualan = (subtotal) => {
       const diskonNominal = (diskon / 100) * subtotal;
       return subtotal - diskonNominal + pajak;
   };

   const handleSelectBayar = (selectedOption) => {
    setSelectedBayar(selectedOption.value);
    if (selectedOption.value === 2) {
        setSelectMetode(dataMetode[1]?.value || 2);
        setIsMetodeDisabled(false);
    } else {
        setSelectMetode(dataMetode[0]?.value || 1);
        setIsMetodeDisabled(true);
    }
    };

    const handleSelectMetode = (value) => {
        setSelectMetode(value);
    };

   const breadcrumbItems = [
       { label: "Daftar Penjualan Toko", href: "/penjualan-admin-gudang" },
       { label: "Tambah Penjualan", href: "" },
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

   const btnAddBaris = () => {
       setIsModalOpen(true);
   };

   const getImageUrl = (item) => {
        let basePath = '';
        
        if (item.id.startsWith('BHM')) {
            basePath = '/images-barang-handmade-gudang/';
        } else if (item.id.startsWith('BNH')) {
            basePath = '/images-barang-non-handmade-gudang/';
        } else if (item.id.startsWith('MTH')) {
            basePath = '/images-barang-mentah/';
        } else if (item.id.startsWith('PCK')) {
            basePath = '/images-packaging-gudang/';
        }

        if (!item.image) return "https://via.placeholder.com/150";
        return `${import.meta.env.VITE_API_URL}${basePath}${item.image}`;
    };

   useEffect(() => {
    fetchAllData(currentPage, limit, selectedCategoryId, searchTerm);
}, [currentPage, limit, selectedCategoryId, searchTerm]);

   useEffect(() => {
       if (selectBayar === 1) {
           setIsMetodeDisabled(true);
       } else if (selectBayar === 2) {
           setIsMetodeDisabled(false);
       }
   }, [selectBayar]);

   // Functions to handle search and category changes
   const handleSearchChange = (searchValue) => {
       setSearchTerm(searchValue);
       setCurrentPage(1);
       fetchAllData(1, limit, selectedCategoryId, searchValue);
   };

   const handlePackagingSearchChange = (searchValue) => {
       setSearchTerm(searchValue);
       setCurrentPackagingPage(1);
       fetchPackagingData(1, packagingLimit, selectedPackagingCategoryId, searchValue);
   };

   const handleCategoryChange = (categoryName) => {
       setSelectedCategory(categoryName);
       setCurrentPage(1);
       
       // Ambil ID dari mapping, kecuali "Semua"
       const categoryId = categoryName === "Semua" ? null : kategoriIdMap[categoryName];
       setSelectedCategoryId(categoryId);
       
       fetchAllData(1, limit, categoryId, searchTerm);
   };

   const handlePackagingCategoryChange = (categoryName) => {
       setSelectedPackagingCategory(categoryName);
       setCurrentPackagingPage(1);
       
       const categoryId = categoryName === "Semua" ? null : kategoriIdMap[categoryName];
       setSelectedPackagingCategoryId(categoryId);
       
       fetchPackagingData(1, packagingLimit, categoryId, searchTerm);
   };

   // Functions to handle pagination and items per page
   const handlePageChange = (newPage) => {
       setCurrentPage(newPage);
       fetchAllData(newPage, limit, selectedCategoryId, searchTerm);
   };

   const handlePackagingPageChange = (newPage) => {
       setCurrentPackagingPage(newPage);
       fetchPackagingData(newPage, packagingLimit, selectedPackagingCategoryId, searchTerm);
   };

   const handleItemsPerPageChange = (newLimit) => {
       setLimit(newLimit);
       setCurrentPage(1);
       fetchAllData(1, newLimit, selectedCategoryId, searchTerm);
   };

   const handlePackagingItemsPerPageChange = (newLimit) => {
       setPackagingLimit(newLimit);
       setCurrentPackagingPage(1);
       fetchPackagingData(1, newLimit, selectedPackagingCategoryId, searchTerm);
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
    const selectedData = dataBarang.find((data) => data.jenis === selectedJenis);
    if (!selectedData) return [];
    
    if (selectedJenis === "Barang Mentah") {
        return selectedData.items.filter(item =>
            item.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }
    
    return selectedData.items.filter(item =>
        (selectedCategory === "Semua" || item.kategori === selectedCategory) &&
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
})();

   const resetSelection = () => {
       setSelectedItems([]);
       setIsModalOpen(false);
   };

   const handleModalSubmit = () => {
    const newItems = selectedItems.map((item) => {
        const totalBiaya = parseInt(item.price) * item.count;
        
        return {
            id: item.id,
            No: itemData.length + 1,
            "Foto Produk": (
                <img src={item.image} alt={item.name} className="w-12 h-12" />
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
                    onSelect={(selectedOption) => handleDropdownChange(item.id, selectedOption)}
                />
            ),
            "Jenis Barang": dataBarang.find(cat => 
                cat.items.some(i => i.id === item.id)
            )?.jenis,
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
            "Aksi": (
                <button
                    onClick={() => handleDeleteItem(item.id)}
                    className="text-red-500 hover:text-red-700"
                >
                    Hapus
                </button>
            )
        };
    });

    setItemData([...itemData, ...newItems]);
    setIsModalOpen(false);
    setSelectedItems([]);
};

    const handleDropdownChange = (itemId, selectedOption) => {
        const allItems = dataBarang.reduce((acc, category) => {
            return [...acc, ...category.items];
        }, []);

        const selectedItem = allItems.find(item => item.id === selectedOption.value);
        
        if (selectedItem) {
            setItemData(prevItems => {
                return prevItems.map(item => {
                    if (item.id === itemId) {
                        const currentQuantity = item.quantity || 0;
                        const newTotalBiaya = selectedItem.price * currentQuantity;
                        const jenisBarang = dataBarang.find(cat => 
                            cat.items.some(i => i.id === selectedItem.id)
                        )?.jenis;

                        return {
                            id: selectedItem.id,
                            No: item.No,
                            "Foto Produk": (
                                <img src={getImageUrl(selectedItem)} alt={selectedItem.name} className="w-12 h-12" />
                            ),
                            "Nama Produk": (
                                <InputDropdown
                                    showRequired={false}
                                    options={allItems.map(item => ({
                                        label: item.name,
                                        value: item.id,
                                        price: item.price
                                    }))}
                                    value={selectedItem.id}
                                    onSelect={(newSelection) => handleDropdownChange(selectedItem.id, newSelection)}
                                />
                            ),
                            "Jenis Barang": jenisBarang,
                            "Harga Satuan": `Rp${selectedItem.price.toLocaleString()}`,
                            "Kuantitas": (
                                <Input
                                    showRequired={false}
                                    type="number"
                                    value={currentQuantity}
                                    onChange={(newCount) => handleQuantityChange(selectedItem.id, newCount)}
                                />
                            ),
                            quantity: currentQuantity,
                            "Total Biaya": `Rp${newTotalBiaya.toLocaleString()}`,
                            rawTotalBiaya: newTotalBiaya,
                            currentPrice: selectedItem.price,
                            "Aksi": (
                                <button
                                    onClick={() => handleDeleteItem(selectedItem.id)}
                                    className="text-red-500 hover:text-red-700"
                                >
                                    Hapus
                                </button>
                            )
                        };
                    }
                    return item;
                });
            });
        }
    };

    const handleQuantityChange = (itemId, newCount) => {
        setItemData(prevItems => {
            return prevItems.map(item => {
                if (item.id === itemId) {
                    const numericCount = Number(newCount);
                    const newTotal = item.currentPrice * numericCount;
                    
                    return {
                        ...item,
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
                }
                return item;
            });
        });
    };

   const handleDeleteItem = (itemId) => {
       setItemData(prev => prev.filter(item => item.id !== itemId));
   };

   const dataBayar = [
       { id: 1, label: "Cash" },
       { id: 2, label: "Non-Cash" }
   ];

   const subtotal = calculateSubtotal();
   const totalPenjualan = calculateTotalPenjualan(subtotal);
   const navigate = useNavigate();

   const handleTambahSubmit = async (e) => {
        e.preventDefault();

        if (!selectBayar) {
            setErrorMessage("Silahkan pilih jenis pembayaran (Cash/Non-Cash)");
            return;
        }

        if (selectBayar === 2 && !selectMetode) {
            setErrorMessage("Silahkan pilih metode pembayaran");
            return;
        }

        if (itemData.length === 0) {
            setErrorMessage("Silahkan pilih minimal satu barang");
            return;
        }
        
        try {
            setLoading(true);

            const produkData = [
                ...itemData.map(item => {
                    const idKey = item.id.startsWith('MTH') ? 'barang_mentah_id' :
                                item.id.startsWith('BHM') ? 'barang_handmade_id' :
                                item.id.startsWith('BNH') ? 'barang_nonhandmade_id' :
                                item.id.startsWith('PCK') ? 'packaging_id' : null;

                    return {
                        [idKey]: item.id,
                        harga_satuan: parseInt(item.currentPrice),
                        kuantitas: item.quantity,
                        total_biaya: item.rawTotalBiaya
                    };
                }),
                ...packagingData.map(item => ({
                    packaging_id: item.id,
                    harga_satuan: parseInt(item.currentPrice),
                    kuantitas: item.quantity,
                    total_biaya: item.rawTotalBiaya
                }))
            ];

            const payload = {
                cash_or_non: selectBayar === 1, 
                nama_pembeli: namaPembeli,
                sub_total: subtotal,
                diskon: diskon,
                pajak: pajak,
                total_penjualan: totalPenjualan,
                produk: produkData,
                tanggal: tanggal,
                catatan: note
            };
            if (selectBayar === 2) {
                payload.metode_id = selectMetode;
            }
            console.log('Payload:', JSON.stringify(payload, null, 2));

            const response = await api.post('/penjualan-gudang', payload);

            if (response.data.success) {
                setModalSucc(true);
            } else {
                alert(response.data.message || "Gagal menyimpan data");
            }
        } catch (error) {
            console.error("Error submitting data:", error);
            setErrorMessage(error?.response?.data?.message)
        } finally {
            setLoading(false);
        }
    };

   const handleAcc = () => {
       setModalSucc(false);  
       navigate('/penjualan-admin-gudang');
   };

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
                                   <Input label={"Tanggal"} type1={"date"} value={tanggal} onChange={(e) => setTanggal(e)} />
                                   <Input label={"Nama Pembeli"} required={false} value={namaPembeli} onChange={(e) => setNamaPembeli(e)} />
                                   <InputDropdown 
                                        label={"Cash/Non-Cash"} 
                                        options={dataBayar.map(option => ({
                                            label: option.label,
                                            value: option.id
                                        }))} 
                                        value={selectBayar}
                                        onSelect={handleSelectBayar}
                                    />
                                   <div className="">
                                    <InputDropdown 
                                            label={"Metode Pembayaran"} 
                                            disabled={isMetodeDisabled}
                                            options={dataMetode}
                                            value={selectMetode}
                                            onSelect={(option) => handleSelectMetode(option.value)}
                                        />
                                   </div>
                               </div>
                           </section>
   
                           {/* Section Tambah Data */}
                           <section className="pt-10">
                                <h2 className="font-semibold text-lg mb-4">List Produk</h2>
                               <div className="pt-5">
                                   <Table headers={headers} data={itemData} />
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
                                                onClick={() => handleDeletePackaging()}
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
                                        hoverColor={`hover:border-${themeColor} hove:border`}
                                        textColor={`text-${themeColor}`}
                                        onClick={handleAddPackaging}
                                        disabled={hasPackaging}
                                    />
                                )}
                            </div>
                        </section>

                        {/* Modal Packaging */}
                        {isPackagingModalOpen && (
                            <section className="fixed inset-0 bg-white bg-opacity-80 flex justify-center items-center z-50">
                                <div className={`bg-white border border-${themeColor} rounded-md p-6 w-[90%] md:w-[70%] h-[90%] overflow-hidden`}>
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
                                                    value={searchTerm}
                                                    onChange={(e) => handlePackagingSearchChange(e.target.value)}
                                                    className="w-full border border-gray-300 rounded-md py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-gray-500"
                                                />
                                            </div>

                                            <div className="flex items-center space-x-4 self-end sm:self-auto">
                                                <button
                                                    onClick={() => {
                                                        setSearchTerm("");
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
                                                hoverColor={`hover:border-${themeColor}`}
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

                                    {/* Items per page selector for packaging */}
                                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mt-4 mb-2">
                                        <div className="flex items-center space-x-2">
                                            <label className="text-xs sm:text-sm text-gray-600">Items per page:</label>
                                            <select
                                                value={packagingLimit}
                                                onChange={(e) => handlePackagingItemsPerPageChange(Number(e.target.value))}
                                                className="border border-gray-300 rounded-md px-2 py-1 text-xs sm:text-sm"
                                            >
                                                <option value={15}>15</option>
                                                <option value={25}>25</option>
                                                <option value={50}>50</option>
                                                <option value={100}>100</option>
                                            </select>
                                        </div>
                                        {/* <div className="text-xs sm:text-sm text-gray-600">
                                            Total: {packagingTotalItems} items
                                        </div> */}
                                    </div>

                                    <div className="mt-2 h-[calc(100%-220px)] overflow-y-auto no-scrollbar">
                                        <Gallery2
                                            items={dataPackaging.filter(item => 
                                                item.name.toLowerCase().includes(searchTerm.toLowerCase())
                                            )}
                                            onSelect={handleSelectPackagingItem}
                                            selectedItems={selectedPackagingItems}
                                            enableStockValidation={true}
                                            currentPage={currentPackagingPage}
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
     
                            {/* Section Total dan Submit*/}
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
                                                    onChange={(e) => handleSearchChange(e.target.value)}
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
                                                hoverColor={`hover:border-${themeColor}`}
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
                                                onClick={() => setSelectedJenis(jenis)}
                                                className={`px-4 py-2 text-sm font-semibold whitespace-nowrap ${
                                                    selectedJenis === jenis ? `text-${themeColor} border-b-2 border-${themeColor}` : "text-gray-400"
                                                }`}
                                            >
                                                {jenis}
                                            </button>
                                        ))}
                                    </div>

                                    {selectedJenis !== "Barang Mentah" && (
                                        <div className="flex flex-wrap gap-2 mt-4">
                                            {dataBarang
                                                .find((data) => data.jenis === selectedJenis)
                                                ?.kategori?.map((kategori) => (
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
                                    )}

                                    {/* Items per page selector */}
                                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mt-4 mb-2">
                                        <div className="flex items-center space-x-2">
                                            <label className="text-xs sm:text-sm text-gray-600">Items per page:</label>
                                            <select
                                                value={limit}
                                                onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
                                                className="border border-gray-300 rounded-md px-2 py-1 text-xs sm:text-sm"
                                            >
                                                <option value={15}>15</option>
                                                <option value={25}>25</option>
                                                <option value={50}>50</option>
                                                <option value={100}>100</option>
                                            </select>
                                        </div>
                                        {/* <div className="text-xs sm:text-sm text-gray-600">
                                            Total: {totalItems} items
                                        </div> */}
                                    </div>

                                    <div className="mt-2 h-[calc(100%-220px)] overflow-y-auto no-scrollbar">
                                        <Gallery2
                                            items={filteredItems.map(item => ({
                                                ...item,
                                                image: getImageUrl(item)  
                                            }))}
                                            onSelect={handleSelectItem}
                                            selectedItems={selectedItems}
                                            enableStockValidation={true}
                                            currentPage={currentPage}
                                            totalPages={totalPages}
                                            totalItems={totalItems}
                                            itemsPerPage={limit}
                                            onPageChange={handlePageChange}
                                            showPagination={true}
                                            isHandmadeContext={selectedJenis === "Barang Handmade"}
                                        />
                                    </div>
                                </div>
                            </section>
                        )}
                    </section>
                </div>
     
                {isModalSucc && (
                    <AlertSuccess
                        title="Berhasil!!"
                        description="Data berhasil disimpan"
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