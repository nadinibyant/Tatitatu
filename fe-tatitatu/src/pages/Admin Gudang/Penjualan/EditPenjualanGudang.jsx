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

    const userData = JSON.parse(localStorage.getItem('userData'));
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

    useEffect(() => {
        const fetchPackaging = async () => {
            try {
                const response = await api.get('/packaging-gudang');
                if (response.data.success) {
                    const formattedData = response.data.data.map(item => ({
                        id: item.packaging_id,
                        label: item.nama_packaging, 
                        value: item.packaging_id,  
                        price: item.harga_satuan,
                        image: getImageUrl({
                            barang_id: item.packaging_id,
                            image: item.image
                        }),
                        code: item.packaging_id,
                        nama_packaging: item.nama_packaging,  
                        packaging_id: item.packaging_id,      
                        harga: item             
                    }));
                    setDataPackaging(formattedData);
                }
            } catch (error) {
                console.error("Error fetching packaging:", error);
            }
        };
    
        fetchPackaging();
    }, []);

    console.log(dataPackaging)

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState("Semua");
    const [selectedJenis, setSelectedJenis] = useState("Barang Handmade");
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

    // Format untuk semua jenis produk
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
    
                // Set pembayaran (cash atau non-cash)
                setSelectedBayar(data.cash_or_non ? 1 : 2); 
                
                // Jika metode pembayaran tersedia dan bukan cash
                if (!data.cash_or_non) {
                    setIsMetodeDisabled(false);
                    const matchingMethod = dataMetode.find(
                        method => method.label === data.metode
                    );
                    if (matchingMethod) {
                        setSelectMetode(matchingMethod.value);
                    }
                } else {
                    setIsMetodeDisabled(true);
                    setSelectMetode(1);
                }

                // Proses produk (barang dan packaging)
                const formattedItems = data.produk
                    .filter(item => item.jenis !== "Packaging")
                    .map((item, index) => ({
                        id: item.barang_id,
                        No: index + 1,
                        "Foto Produk": (
                            <img 
                                src={getImageUrl(item)} 
                                alt={item.nama_barang} 
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
                                value={item.barang_id}
                                onSelect={(newSelection) => handleDropdownChange(item.barang_id, newSelection)}
                            />
                        ),
                        "Jenis Barang": item.jenis,
                        "Harga Satuan": `Rp${item.harga_satuan.toLocaleString()}`,
                        "Kuantitas": (
                            <Input
                                showRequired={false}
                                type="number"
                                value={item.kuantitas}
                                onChange={(newCount) => handleQuantityChange(item.barang_id, newCount)}
                            />
                        ),
                        quantity: item.kuantitas,
                        "Total Biaya": `Rp${item.total_biaya.toLocaleString()}`,
                        rawTotalBiaya: item.total_biaya,
                        currentPrice: item.harga_satuan
                    }));
                setItemData(formattedItems);

                // Proses packaging
                const packagingItem = data.produk.find(item => item.jenis === "Packaging");
                if (packagingItem) {
                    const formattedPackaging = [{
                        id: packagingItem.barang_id,
                        packaging_id: packagingItem.barang_id,
                        No: 1,
                        "Foto Packaging": (
                            <img 
                                src={getImageUrl(packagingItem)} 
                                alt={packagingItem.nama_barang} 
                                className="w-12 h-12" 
                                onError={(e) => {
                                    e.target.src = "https://via.placeholder.com/150";
                                }}
                            />
                        ),
                        "Nama Packaging": (
                            <InputDropdown
                                showRequired={false}
                                options={dataPackaging.map(pack => ({
                                    label: pack.nama_packaging,
                                    value: pack.packaging_id,
                                    price: pack.harga
                                }))}
                                value={packagingItem.barang_id}
                                onSelect={(newSelection) => handlePackagingDropdownChange(packagingItem.barang_id, newSelection)}
                            />
                        ),
                        "Harga Satuan": `Rp${packagingItem.harga_satuan.toLocaleString()}`,
                        "Kuantitas": (
                            <Input
                                showRequired={false}
                                type="number"
                                value={packagingItem.kuantitas}
                                onChange={(newCount) => handlePackagingQuantityChange(packagingItem.barang_id, newCount)}
                            />
                        ),
                        quantity: packagingItem.kuantitas,
                        "Total Biaya": `Rp${packagingItem.total_biaya.toLocaleString()}`,
                        rawTotalBiaya: packagingItem.total_biaya,
                        currentPrice: packagingItem.harga_satuan
                    }];
                    setPackagingData(formattedPackaging);
                    setHasPackaging(true);
                }
    
            } catch (error) {
                console.error("Error fetching penjualan:", error);
            } finally {
                setLoading(false);
            }
        };
    
        if (dataMetode.length > 0) {
            fetchPenjualan();
        }
    }, [id, dataMetode, dataBarang, dataPackaging]);
    

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
        const fetchAllData = async () => {
            try {
                setLoading(true);
                
                const [handmadeRes, nonHandmadeRes, mentahRes, jenisRes] = await Promise.all([
                    api.get('/barang-handmade-gudang'),
                    api.get('/barang-nonhandmade-gudang'),
                    api.get('/barang-mentah'),
                    api.get('/jenis-barang-gudang')
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

                if (handmadeRes.data.success) {
                    handmadeRes.data.data.forEach(item => {
                        const jenisId = item.jenis_barang_id;
                        if (dataByJenis[jenisId]) {
                            dataByJenis[jenisId].items.push({
                                id: item.barang_handmade_id,
                                image: item.image,
                                name: item.nama_barang,
                                price: item.harga_jual,
                                kategori: item.kategori?.nama_kategori_barang,
                                code: item.barang_handmade_id
                            });
                        }
                    });
                }
    
                if (nonHandmadeRes.data.success) {
                    const nonHandmadeJenis = jenisBarangData.find(j => j.nama_jenis_barang === "Non Handmade");
                    if (nonHandmadeJenis) {
                        dataByJenis[nonHandmadeJenis.jenis_barang_id].items = nonHandmadeRes.data.data.map(item => ({
                            id: item.barang_nonhandmade_id,
                            image: item.image,
                            name: item.nama_barang,
                            price: item.harga_jual,
                            kategori: item.kategori?.nama_kategori_barang,
                            code: item.barang_nonhandmade_id
                        }));
                    }
                }
    
                if (mentahRes.data.success) {
                    const mentahJenis = jenisBarangData.find(j => j.nama_jenis_barang === "Mentah");
                    if (mentahJenis) {
                        dataByJenis[mentahJenis.jenis_barang_id].items = mentahRes.data.data.map(item => ({
                            id: item.barang_mentah_id,
                            image: item.image,
                            name: item.nama_barang,
                            price: item.harga_satuan,
                            code: item.barang_mentah_id
                        }));
                    }
                }

                Object.values(dataByJenis).forEach(jenis => {
                    if (jenis.jenis !== "Barang Mentah") {
                        const categories = [...new Set(jenis.items.map(item => item.kategori).filter(Boolean))];
                        jenis.kategori = ["Semua", ...categories];
                    }
                });
    
                console.log('Data yang akan diset:', Object.values(dataByJenis));
    
                setDataBarang(Object.values(dataByJenis));
    
            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setLoading(false);
            }
        };
    
        fetchAllData();
    }, []);

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
                        onChange={(newCount) => handlePackagingQuantityChange(item.id, newCount)}  // Gunakan item.id
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
        const updatedData = [...packagingData];
        const rowIndex = updatedData.findIndex((row) => row.id === itemId);
        
        if (rowIndex !== -1) {
            const selectedItem = dataPackaging.find(item => item.value === nextSelection.value);
            
            if (selectedItem) {
                const currentQuantity = updatedData[rowIndex].quantity || 0;
                const newTotalBiaya = selectedItem.price * currentQuantity;
                
                updatedData[rowIndex] = {
                    ...updatedData[rowIndex],
                    id: selectedItem.value,
                    "Foto Packaging": (
                        <img 
                            src={selectedItem.image} 
                            alt={selectedItem.label} 
                            className="w-12 h-12"
                            onError={(e) => {
                                e.target.src = "https://via.placeholder.com/150";
                            }} 
                        />
                    ),
                    "Nama Packaging": (
                        <InputDropdown
                            showRequired={false}
                            options={dataPackaging.map(pack => ({
                                label: pack.label,
                                value: pack.value,
                                price: pack.price
                            }))}
                            value={selectedItem.value}
                            onSelect={(newSelection) => handlePackagingDropdownChange(itemId, newSelection)}
                        />
                    ),
                    "Harga Satuan": `Rp${selectedItem.price.toLocaleString()}`,
                    "Kuantitas": (
                        <Input
                            showRequired={false}
                            type="number"
                            value={currentQuantity}
                            onChange={(newCount) => handlePackagingQuantityChange(itemId, newCount)}
                        />
                    ),
                    quantity: currentQuantity,
                    "Total Biaya": `Rp${newTotalBiaya.toLocaleString()}`,
                    rawTotalBiaya: newTotalBiaya,
                    currentPrice: selectedItem.price
                };
                
                setPackagingData(updatedData);
            }
        }
    };

    const handlePackagingQuantityChange = (itemId, newCount) => {
        setPackagingData(prevItems => {
            const updatedData = [...prevItems];

            const rowIndex = updatedData.findIndex(row => 
                row && (
                    row.id === itemId || 
                    row.packaging_id === itemId || 
                    row.packaging?.packaging_id === itemId
                )
            );
        
            if (rowIndex !== -1) {
                const currentItem = updatedData[rowIndex];
    
                if (!currentItem) {
                    console.error('Current packaging item is null or undefined');
                    return prevItems;
                }
    
                const numericCount = Number(newCount);

                const currentPrice = 
                    currentItem.currentPrice || 
                    currentItem.price || 
                    currentItem.harga_satuan || 
                    (currentItem["Harga Satuan"] 
                        ? parseFloat(currentItem["Harga Satuan"].replace('Rp', '').replace(/\./g, '')) 
                        : 0);
                
                const newTotal = currentPrice * numericCount;
    
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
                            onChange={(newValue) => handlePackagingQuantityChange(itemId, newValue)}
                        />
                    ),
                    currentPrice: currentPrice
                };
                
                return updatedData;
            }
    
            console.warn(`Packaging item with ID ${itemId} not found`);
            return prevItems;
        });
    };

    const handleDeletePackaging = (itemId) => {
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
                                    <Input label={"Nama Pembeli"} value={namaPembeli} onChange={(e) => setNamaPembeli(e)} />
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
                                            <p className="font-bold">Pajak</p>
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
                            <div className={`bg-white border border-${themeColor} rounded-md p-6 w-[90%] md:w-[70%] h-[90%] overflow-hidden`}>
                                <div className="flex flex-wrap md:flex-nowrap items-center justify-between mb-4 gap-4">
                                    <div className="relative w-full max-w-md flex-shrink-0">
                                        <span className="absolute inset-y-0 left-3 flex items-center">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
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

                                    <div className="flex items-center space-x-4 flex-shrink-0">
                                        <button
                                            onClick={() => {
                                                setSearchTerm("");
                                                setSelectedItems([]);
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

                                    <div className="flex flex-wrap md:flex-nowrap gap-4 flex-shrink-0">
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

                                <div className="flex border-b border-gray-300 mb-4">
                                    {jenisBarang.map((jenis) => (
                                        <button
                                            key={jenis}
                                            onClick={() => setSelectedJenis(jenis)}
                                            className={`px-4 py-2 text-sm font-semibold ${
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
                                )}

                                <div className="mt-6 h-[calc(100%-180px)] overflow-y-auto no-scrollbar">
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
                                />
                                </div>
                            </div>
                        </section>
                    )}

                    {/* Modal Tambah Packaging */}
                    {isPackagingModalOpen && (
                        <section className="fixed inset-0 bg-white bg-opacity-80 flex justify-center items-center z-50">
                            <div className={`bg-white border border-${themeColor} rounded-md p-6 w-[90%] md:w-[70%] h-[90%] overflow-hidden`}>
                                <div className="flex flex-wrap md:flex-nowrap items-center justify-between mb-4 gap-4">
                                    <div className="relative w-full max-w-md flex-shrink-0">
                                        <span className="absolute inset-y-0 left-3 flex items-center">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M20.707 19.293l-4.054-4.054A7.948 7.948 0 0016 9.5 8 8 0 108 17.5c1.947 0 3.727-.701 5.239-1.865l4.054 4.054a1 1 0 001.414-1.414zM10 15.5A6.5 6.5 0 1110 2a6.5 6.5 0 010 13.5z" />
                                            </svg>
                                        </span>
                                        <input
                                            type="text"
                                            placeholder="Cari Packaging"
                                            value={searchPackagingTerm}
                                            onChange={(e) => setSearchPackagingTerm(e.target.value)}
                                            className="w-full border border-gray-300 rounded-md py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-gray-500"
                                        />
                                    </div>

                                    <div className="flex items-center space-x-4 flex-shrink-0">
                                        <button
                                            onClick={() => {
                                                setSearchPackagingTerm("");
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

                                    <div className="flex flex-wrap md:flex-nowrap gap-4 flex-shrink-0">
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

                                <div className="mt-6 h-[calc(100%-180px)] overflow-y-auto no-scrollbar">
                                    <Gallery2
                                        items={dataPackaging.filter(item => 
                                            (item.label || "").toLowerCase().includes(searchPackagingTerm.toLowerCase())
                                        )}
                                        onSelect={handleSelectPackagingItem}
                                        selectedItems={selectedPackagingItems}
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