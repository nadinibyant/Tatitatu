import { useEffect, useState, useCallback } from "react";
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

export default function TambahBeliStokGudang() {
    const navigate = useNavigate();
    const [nomor, setNomor] = useState("");
    const [tanggal, setTanggal] = useState(null);
    const [note, setNote] = useState("");
    const [namaPembeli, setNamaPembeli] = useState(""); 
    const [selectBayar, setSelectedBayar] = useState("");
    const [selectMetode, setSelectMetode] = useState("");
    const [diskon, setDiskon] = useState(0);
    const [pajak, setPajak] = useState(0);
    const [itemData, setItemData] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState("Semua");
    const [selectedItems, setSelectedItems] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [isLoading, setLoading] = useState(false);
    const [isModalSucc, setModalSucc] = useState(false);
    const [isMetodeDisabled, setIsMetodeDisabled] = useState(false);
    const [selectedJenis, setSelectedJenis] = useState("Barang Non-Handmade");
    const [formattedProducts, setFormattedProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [paymentMethods, setPaymentMethods] = useState([]);
    
    // PAGINATION STATE
    const [pagination, setPagination] = useState({
        // "Barang Handmade": { page: 1, limit: 15, total: 0 },
        "Barang Non-Handmade": { page: 1, limit: 15, total: 0 },
        "Barang Mentah": { page: 1, limit: 15, total: 0 },
        "Packaging": { page: 1, limit: 15, total: 0 },
    });
    const [barangData, setBarangData] = useState({
        // "Barang Handmade": { items: [], total: 0 },
        "Barang Non-Handmade": { items: [], total: 0 },
        "Barang Mentah": { items: [], total: 0 },
        "Packaging": { items: [], total: 0 },
    });
    
    const userData = JSON.parse(localStorage.getItem('userData'));
    const isAdminGudang = userData?.role === 'admingudang';
    const isHeadGudang = userData?.role === 'headgudang'
    const [errorMessage, setErrorMessage] = useState('');
    const [isErrorAlert, setErrorAlert] = useState(false);

    const themeColor = (isAdminGudang || isHeadGudang) ? "coklatTua" : "primary";

    // Constants
    const productTypes = [
        // "Barang Handmade",
        "Barang Non-Handmade",
        "Barang Mentah",
        "Packaging"
    ];

    const dataBayar = [
        { value: 1, label: "Cash" },
        { value: 2, label: "Non-Cash" }
    ];

    useEffect(() => {
        const fetchPaymentMethods = async () => {
            try {
                const response = await api.get('/metode-pembayaran-gudang');
                if (response.data.success) {
                    const formattedMethods = response.data.data
                        .filter(method => !method.is_deleted)
                        .map(method => ({
                            value: method.metode_id,
                            label: method.nama_metode
                        }));
                    
                    const methodsWithDash = [
                        { value: 0, label: "-" },
                        ...formattedMethods
                    ];
                    
                    setPaymentMethods(methodsWithDash);
                }
            } catch (error) {
                console.error('Error fetching payment methods:', error);
            }
        };

        fetchPaymentMethods();
    }, []); 

    // Fetch paginated data for the selected jenis
    const fetchBarangPaginated = async (jenis, { page, limit, category, search }) => {
        setLoading(true);
        let endpoint = '';
        let typeKey = '';
        switch (jenis) {
            // case 'Barang Handmade': endpoint = '/barang-handmade-gudang'; typeKey = 'barang_handmade'; break;
            case 'Barang Non-Handmade': endpoint = '/barang-nonhandmade-gudang'; typeKey = 'barang_nonhandmade'; break;
            case 'Barang Mentah': endpoint = '/barang-mentah'; typeKey = 'barang_mentah'; break;
            case 'Packaging': endpoint = '/packaging-gudang'; typeKey = 'packaging'; break;
            default: return;
        }
        const params = [
            `page=${page}`,
            `limit=${limit}`
        ];
        if (category && category !== 'Semua') params.push(`category=${category}`);
        if (search) params.push(`search=${encodeURIComponent(search)}`);
        try {
            const res = await api.get(`${endpoint}?${params.join('&')}`);
            const baseUrl = import.meta.env.VITE_API_URL;
            
            const items = res.data.data.map(item => {
                let price = 0;
                let image = '';
                let name = '';
                
                switch (typeKey) {
                    // case 'barang_handmade':
                    //     price = item.harga_jual;
                    //     image = item.image ? `${baseUrl}/images-barang-handmade-gudang/${item.image}` : '/placeholder.jpg';
                    //     name = item.nama_barang;
                    //     break;
                    case 'barang_nonhandmade':
                        price = item.harga_jual;
                        image = item.image ? `${baseUrl}/images-barang-non-handmade-gudang/${item.image}` : '/placeholder.jpg';
                        name = item.nama_barang;
                        break;
                    case 'barang_mentah':
                        price = item.harga_satuan;
                        image = item.image ? `${baseUrl}/images-barang-mentah/${item.image}` : '/placeholder.jpg';
                        name = item.nama_barang;
                        break;
                    case 'packaging':
                        price = item.harga_satuan;
                        image = item.image ? `${baseUrl}/images-packaging-gudang/${item.image}` : '/placeholder.jpg';
                        name = item.nama_packaging;
                        break;
                }
                
                return {
                    id: item[`${typeKey}_id`],
                    image: image,
                    name: name,
                    price: price,
                    kategori: item.kategori?.nama_kategori_barang,
                    jenis: jenis,
                    imagePrefix: `images-${typeKey}-gudang`
                };
            });
            
            setBarangData(prev => ({
                ...prev,
                [jenis]: {
                    items,
                    total: res.data.pagination?.totalItems || items.length
                }
            }));
            setPagination(prev => ({
                ...prev,
                [jenis]: {
                    ...prev[jenis],
                    total: res.data.pagination?.totalItems || items.length
                }
            }));
        } catch (e) {
            console.error('Error fetching paginated data:', e);
            setBarangData(prev => ({ ...prev, [jenis]: { items: [], total: 0 } }));
        } finally {
            setLoading(false);
        }
    };

    // Fetch when modal opens (Tambah Baris clicked)
    useEffect(() => {
        if (isModalOpen) {
            fetchBarangPaginated(selectedJenis, {
                page: pagination[selectedJenis].page,
                limit: pagination[selectedJenis].limit,
                category: selectedCategory,
                search: searchTerm
            });
        }
    }, [isModalOpen]);

    // Fetch when jenis, category, search, page, or limit changes
    useEffect(() => {
        if (!isModalOpen) return;
        fetchBarangPaginated(selectedJenis, {
            page: pagination[selectedJenis].page,
            limit: pagination[selectedJenis].limit,
            category: selectedCategory,
            search: searchTerm
        });
    }, [selectedJenis, selectedCategory, searchTerm, pagination[selectedJenis].page, pagination[selectedJenis].limit]);

    // Handler for page change
    const handlePageChange = useCallback((page) => {
        console.log('Page change requested:', page);
        setPagination(prev => ({
            ...prev,
            [selectedJenis]: {
                ...prev[selectedJenis],
                page
            }
        }));
    }, [selectedJenis]);

    // Handler for limit change
    const handleLimitChange = (limit) => {
        setPagination(prev => ({
            ...prev,
            [selectedJenis]: {
                ...prev[selectedJenis],
                limit: Number(limit),
                page: 1
            }
        }));
    };

    // Handler for category change
    const handleCategoryChange = (cat) => {
        setSelectedCategory(cat);
        setPagination(prev => ({
            ...prev,
            [selectedJenis]: {
                ...prev[selectedJenis],
                page: 1
            }
        }));
    };

    // Handler for search change
    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    // Handler for search submit (on Enter)
    const handleSearchSubmit = () => {
        setPagination(prev => ({
            ...prev,
            [selectedJenis]: {
                ...prev[selectedJenis],
                page: 1
            }
        }));
        // Trigger API call with new search term
        fetchBarangPaginated(selectedJenis, {
            page: 1,
            limit: pagination[selectedJenis].limit,
            category: selectedCategory,
            search: searchTerm
        });
    };

    const headers = [
        { label: "No", key: "No", align: "text-left" },
        { label: "Foto Produk", key: "Foto Produk", align: "text-left" },
        { label: "Nama Produk", key: "Nama Produk", align: "text-left" },
        { label: "Jenis Barang", key: "Jenis Barang", align: "text-left" },
        { label: "Harga Satuan", key: "Harga Satuan", align: "text-left" },
        { label: "Kuantitas", key: "Kuantitas", align: "text-left", width: "120px"},
        { label: "Total Biaya", key: "Total Biaya", align: "text-left" },
        { label: "Aksi", key: "Aksi", align: "text-left" },
    ];

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const [nonhandmadeRes, mentahRes, packagingRes, categoriesRes] = await Promise.all([
                // api.get('/barang-handmade-gudang?limit=1000'),
                api.get('/barang-nonhandmade-gudang?limit=1000'),
                api.get('/barang-mentah?limit=1000'),
                api.get('/packaging-gudang?limit=1000'),
                api.get('/kategori-barang-gudang')
            ]);

                const baseUrl = import.meta.env.VITE_API_URL;

                const allFormattedProducts = [
                    // ...handmadeRes.data.data.map(item => ({
                    //     id: item.barang_handmade_id,
                    //     image: item.image ? `${baseUrl}/images-barang-handmade-gudang/${item.image}` : '/placeholder.jpg',
                    //     name: item.nama_barang,
                    //     price: item.harga_jual,
                    //     kategori: item.kategori?.nama_kategori_barang,
                    //     jenis: "Barang Handmade",
                    //     imagePrefix: 'images-barang-handmade-gudang'
                    // })),
                    ...nonhandmadeRes.data.data.map(item => ({
                        id: item.barang_nonhandmade_id,
                        image: item.image ? `${baseUrl}/images-barang-non-handmade-gudang/${item.image}` : '/placeholder.jpg',
                        name: item.nama_barang,
                        price: item.harga_jual,
                        kategori: item.kategori?.nama_kategori_barang,
                        jenis: "Barang Non-Handmade",
                        imagePrefix: 'images-barang-non-handmade-gudang'
                    })),
                    ...mentahRes.data.data.map(item => ({
                        id: item.barang_mentah_id,
                        image: item.image ? `${baseUrl}/images-barang-mentah/${item.image}` : '/placeholder.jpg',
                        name: item.nama_barang,
                        price: item.harga_satuan,
                        jenis: "Barang Mentah",
                        imagePrefix: 'images-barang-mentah-gudang'
                    })),
                    ...packagingRes.data.data.map(item => ({
                        id: item.packaging_id,
                        image: item.image ? `${baseUrl}/images-packaging-gudang/${item.image}` : '/placeholder.jpg',
                        name: item.nama_packaging,
                        price: item.harga_satuan,
                        jenis: "Packaging",
                        imagePrefix: 'images-packaging-gudang'
                    }))
                ];

                setFormattedProducts(allFormattedProducts);

                if (isAdminGudang) {
                    const apiCategories = categoriesRes.data.data
                        .filter(cat => !cat.is_deleted)
                        .map(cat => ({
                            id: cat.kategori_barang_id,
                            name: cat.nama_kategori_barang
                        }));
                    setCategories(apiCategories);
                }
            } catch (error) {
                console.error('Error fetching products:', error);
            }
        };

        fetchProducts();
    }, [isAdminGudang]);

    const getCategories = () => {
        if (isAdminGudang && (selectedJenis === "Barang Non-Handmade")) {
            return [
                { id: "Semua", name: "Semua" },
                ...categories.map(cat => ({ id: cat.id.toString(), name: cat.name }))
            ];
        }
        return [{ id: "Semua", name: "Semua" }];
    };

    const getFilteredItems = () => {
        return barangData[selectedJenis]?.items || [];
    };

    const calculateSubtotal = () => {
        return itemData.reduce((acc, item) => acc + (item.rawTotalBiaya || 0), 0);
    };

    const calculateTotalPenjualan = (subtotal) => {
        const diskonNominal = (diskon / 100) * subtotal;
        return subtotal - diskonNominal - pajak;
    };

    // Event handlers
    const handleSelectBayar = (selectedOption) => {
        console.log('Selected payment option:', selectedOption); 
        setSelectedBayar(selectedOption.value);
        
        if (selectedOption.value === 1) {  // Cash
            const dashOption = paymentMethods.find(method => method.value === 0);
            if (dashOption) {
                setSelectMetode(dashOption.value);
            }
            setIsMetodeDisabled(true);
        } else if (selectedOption.value === 2) {  // Non-Cash
            const firstPaymentMethod = paymentMethods.find(method => method.value !== 0);
            if (firstPaymentMethod) {
                setSelectMetode(firstPaymentMethod.value);
            }
            setIsMetodeDisabled(false);
        }
    };


    const handleSelectMetode = (selectedMethod) => {
        setSelectMetode(selectedMethod.value);
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

    const handleModalSubmit = () => {
        if (selectedItems.length === 0) return;
    
        console.log('Selected Items:', selectedItems);
        
        // Create a copy of the current itemData
        let updatedItemData = [...itemData];
        
        // Process each selected item
        selectedItems.forEach((item) => {
            // Check if this item already exists in the table
            const existingItemIndex = updatedItemData.findIndex(
                tableItem => tableItem.id === item.id
            );
            
            // Create dropdown options for all products (without pagination)
            const dropdownOptions = formattedProducts.map(product => ({
                label: product.name,
                value: product.id,
                jenis: product.jenis,
                image: product.image,
                price: product.price
            }));
            
            // Find the corresponding product in formattedProducts by matching name and jenis
            const correspondingProduct = formattedProducts.find(p => 
                p.name === item.name && p.jenis === item.jenis
            );
            
            if (existingItemIndex >= 0) {
                // Item already exists in the table, update its quantity
                const existingItem = updatedItemData[existingItemIndex];
                const newQuantity = existingItem.quantity + item.count;
                const newTotalBiaya = existingItem.currentPrice * newQuantity;
                
                // Update the existing item with new quantity and total
                updatedItemData[existingItemIndex] = {
                    ...existingItem,
                    "Kuantitas": (
                        <Input
                            showRequired={false}
                            type="number"
                            value={newQuantity}
                            onChange={(newValue) => handleQuantityChange(existingItem.id, newValue)}
                        />
                    ),
                    quantity: newQuantity,
                    rawTotalBiaya: newTotalBiaya,
                    "Total Biaya": `Rp${newTotalBiaya.toLocaleString()}`
                };
            } else {
                // Item doesn't exist in the table, create a new row
                const productToUse = correspondingProduct || item;
                const newRow = {
                    id: productToUse.id,  
                    No: updatedItemData.length + 1,
                    "Foto Produk": (
                        <img 
                            src={productToUse.image}
                            alt={productToUse.name}
                            className="w-12 h-12 object-cover rounded"
                            onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = '/placeholder.jpg';
                            }}
                        />
                    ),
                    "Nama Produk": (
                        <InputDropdown
                            showRequired={false}
                            options={dropdownOptions}
                            value={productToUse.id}
                            onSelect={(newSelection) => handleDropdownChange(productToUse.id, newSelection)}
                        />
                    ),
                    "Jenis Barang": productToUse.jenis,
                    "Harga Satuan": `Rp${productToUse.price.toLocaleString()}`,
                    "Kuantitas": (
                        <Input
                            showRequired={false}
                            type="number"
                            value={item.count}
                            onChange={(newValue) => handleQuantityChange(productToUse.id, newValue)}
                        />
                    ),
                    quantity: item.count,
                    rawTotalBiaya: productToUse.price * item.count,
                    currentPrice: productToUse.price,
                    name: productToUse.name,
                    "Total Biaya": `Rp${(productToUse.price * item.count).toLocaleString()}`,
                    "Aksi": (
                        <button
                            type="button"
                            onClick={() => handleDeleteItem(productToUse.id)}
                            className="py-1 text-merah font-semibold"
                        >
                            Hapus
                        </button>
                    )
                };
                
                updatedItemData.push(newRow);
            }
        });
        
        // Renumber all items
        updatedItemData = updatedItemData.map((item, index) => ({
            ...item,
            No: index + 1
        }));
        
        // Update the state
        setItemData(updatedItemData);
        setIsModalOpen(false);
    };

    const createTableRow = (product, quantity) => {
        const totalBiaya = product.price * quantity;
        
        // Create dropdown options from all formattedProducts (without pagination)
        const dropdownOptions = formattedProducts.map(item => ({
            label: item.name,
            value: item.id,
            jenis: item.jenis,
            image: item.image,
            price: item.price
        }));
        
        // Find the corresponding product in formattedProducts by matching name and jenis
        const correspondingProduct = formattedProducts.find(p => 
            p.name === product.name && p.jenis === product.jenis
        );
    
        return {
            id: product.id,  
            No: itemData.length + 1,
            "Foto Produk": (
                <img 
                    src={product.image}
                    alt={product.name}
                    className="w-12 h-12 object-cover rounded"
                    onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '/placeholder.jpg';
                    }}
                />
            ),
            "Nama Produk": (
                <InputDropdown
                    showRequired={false}
                    options={dropdownOptions}
                    value={correspondingProduct ? correspondingProduct.id : null}
                    onSelect={(newSelection) => handleDropdownChange(product.id, newSelection)}
                />
            ),
            "Jenis Barang": product.jenis,
            "Harga Satuan": `Rp${product.price.toLocaleString()}`,
            "Kuantitas": (
                <Input
                    showRequired={false}
                    type="number"
                    value={quantity}
                    onChange={(newValue) => handleQuantityChange(product.id, newValue)}
                />
            ),
            quantity: quantity,
            rawTotalBiaya: totalBiaya,
            currentPrice: product.price,
            name: product.name,
            "Total Biaya": `Rp${totalBiaya.toLocaleString()}`,
            "Aksi": (
                <button
                    type="button"
                    onClick={() => handleDeleteItem(product.id)}
                    className="py-1 text-merah font-semibold"
                >
                    Hapus
                </button>
            )
        };
    };

    const handleDropdownChange = (itemId, nextSelection) => {
        setItemData(prevData => {
            const updatedData = [...prevData];
            const rowIndex = updatedData.findIndex((row) => row.id === itemId);
            
            if (rowIndex !== -1) {
                const selectedProduct = formattedProducts.find(
                    product => product.id === nextSelection.value
                );

                if (selectedProduct) {
                    const currentQuantity = updatedData[rowIndex].quantity;
                    const newRow = createTableRow(selectedProduct, currentQuantity);
                    newRow.No = updatedData[rowIndex].No; 
                    updatedData[rowIndex] = newRow;
                }
            }
            
            return updatedData;
        });
    };

    const handleQuantityChange = (itemId, newQuantity) => {
        setItemData(prevData => {
            const updatedData = [...prevData];
            const rowIndex = updatedData.findIndex((row) => row.id === itemId);
            
            if (rowIndex !== -1) {
                const currentItem = updatedData[rowIndex];
                const product = formattedProducts.find(p => p.id === currentItem.id);
                
                if (product) {
                    const newRow = createTableRow(product, Number(newQuantity));
                    newRow.No = currentItem.No; 
                    updatedData[rowIndex] = newRow;
                }
            }
            
            return updatedData;
        });
    };

    const handleDeleteItem = (itemId) => {
        setItemData(prevData => {
            const filteredData = prevData.filter(item => item.id !== itemId);

            return filteredData.map((item, index) => ({
                ...item,
                No: index + 1
            }));
        });
    };

    const handleTambahSubmit = async (e) => {
        e.preventDefault();
        try {
            if (!selectBayar) {
                setErrorMessage("Silakan pilih cara pembayaran (Cash/Non-Cash)");
                setErrorAlert(true);
                return;
            }
    
            if (selectBayar === 2 && !selectMetode) {
                setErrorMessage("Silakan pilih metode pembayaran");
                setErrorAlert(true);
                return;
            }
    
            if (itemData.length === 0) {
                setErrorMessage("Silakan pilih minimal 1 barang");
                setErrorAlert(true);
                return;
            }
    
            setLoading(true);
            const formattedProducts = itemData.map(item => {
                const baseProduct = {
                    harga_satuan: item.currentPrice,
                    kuantitas: item.quantity,
                    total_biaya: item.rawTotalBiaya
                };
    
                switch (item["Jenis Barang"]) {
                    case "Barang Handmade":
                        return {
                            ...baseProduct,
                            barang_handmade_id: item.id
                        };
                    case "Barang Mentah":
                        return {
                            ...baseProduct,
                            barang_mentah_id: item.id
                        };
                    case "Barang Non-Handmade":
                        return {
                            ...baseProduct,
                            barang_nonhandmade_id: item.id
                        };
                    case "Packaging":
                        return {
                            ...baseProduct,
                            packaging_id: item.id
                        };
                    default:
                        return null;
                }
            }).filter(Boolean); 
    
            // Calculate totals
            const subTotal = calculateSubtotal();
            const totalPenjualan = calculateTotalPenjualan(subTotal);
    
            const baseFormData = {
                cash_or_non: selectBayar === 1,
                sub_total: subTotal,
                diskon: diskon,
                pajak: pajak,
                total_pembelian: totalPenjualan,
                produk: formattedProducts
            };

            if (namaPembeli) {
                baseFormData.nama_pembeli = namaPembeli;
            } else {
                baseFormData.nama_pembeli = ''
            }
    
            const formData = selectBayar === 2 
                ? { ...baseFormData, metode_id: selectMetode }
                : baseFormData;
    
            await api.post('/pembelian-gudang', formData);
            setModalSucc(true);
        } catch (error) {
            console.error('Error submitting data:', error);
            setErrorMessage(error.response?.data?.message || "Terjadi kesalahan saat menyimpan data");
            setErrorAlert(true);
        } finally {
            setLoading(false);
        }
    };

    const handleAcc = () => {
        setModalSucc(false);
        navigate('/pembelianStok');
    };

    const resetSelection = () => {
        setSelectedItems([]);
        setIsModalOpen(false);
    };

    const subtotal = calculateSubtotal();
    const totalPenjualan = calculateTotalPenjualan(subtotal);
    const breadcrumbItems = [
        { label: "Daftar Pembelian Stok", href: "/pembelianStok" },
        { label: "Tambah Pembelian", href: "" },
    ];

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

    return (
        <LayoutWithNav>
            <div className="p-5">
                <Breadcrumbs items={breadcrumbItems} />

                <section className="bg-white p-5 mt-5 rounded-xl">
                    <form onSubmit={handleTambahSubmit}>
                        <section>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <Input 
                                    label="Nomor" 
                                    type1="text" 
                                    disabled={true} 
                                    value={nomor} 
                                    onChange={(e) => setNomor(e)} 
                                />
                                <Input 
                                    label="Tanggal" 
                                    type1="date" 
                                    value={tanggal} 
                                    onChange={(e) => setTanggal(e)} 
                                />
                                {/* Added Nama Pembeli field */}
                                <Input 
                                    label="Nama Pembeli" 
                                    type1="text" 
                                    required={false} 
                                    value={namaPembeli} 
                                    onChange={(e) => setNamaPembeli(e)} 
                                />
                                <InputDropdown 
                                    label="Cash/Non-Cash" 
                                    options={dataBayar} 
                                    value={selectBayar}
                                    onSelect={handleSelectBayar}
                                />
                                <div>
                                    <InputDropdown 
                                        label="Metode Pembayaran" 
                                        disabled={isMetodeDisabled} 
                                        options={paymentMethods} 
                                        value={selectMetode}
                                        onSelect={handleSelectMetode}
                                    />
                                </div>
                            </div>
                        </section>

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
                                    onClick={() => setIsModalOpen(true)}
                                    bgColor=""
                                    hoverColor={`hover:border-${themeColor} hover:border`}
                                    textColor={`text-${themeColor}`}
                                />
                            </div>
                        </section>

                        <section className="flex flex-col md:flex-row gap-8 p-4">
                            <div className="w-full md:w-2/4">
                                <TextArea
                                    label="Catatan"
                                    placeholder="Masukkan Catatan Di Sini"
                                    required={true}
                                    value={note}
                                    onChange={(e) => setNote(e.target.value)}
                                />
                            </div>

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
                                        <p className="font-bold">Total pembelian</p>
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

                    {/* Product Selection Modal */}
                    {isModalOpen && (
                        <section className="fixed inset-0 bg-white bg-opacity-80 flex justify-center items-center z-50">
                            <div className={`bg-white border border-${themeColor} rounded-md p-6 w-[90%] md:w-[70%] h-[90%] overflow-auto flex flex-col`}>
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
                                                onChange={handleSearchChange}
                                                onKeyDown={e => {
                                                    if (e.key === 'Enter') {
                                                        handleSearchSubmit();
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
                                    {productTypes.map((jenis) => (
                                        <button
                                            key={jenis}
                                            onClick={() => {
                                                setSelectedJenis(jenis);
                                                setSelectedCategory("Semua");
                                            }}
                                            className={`px-4 py-2 text-sm font-semibold whitespace-nowrap ${
                                                selectedJenis === jenis 
                                                    ? `text-${themeColor} border-b-2 border-${themeColor}` 
                                                    : "text-gray-400"
                                            }`}
                                        >
                                            {jenis}
                                        </button>
                                    ))}
                                </div>

                                <div className="flex flex-wrap gap-2 mt-4">
                                    {(selectedJenis === "Barang Non-Handmade") && 
                                        getCategories().map((kategori) => (
                                            <button
                                                key={kategori.id}
                                                onClick={() => handleCategoryChange(kategori.id)}
                                                className={`px-3 py-1 text-sm md:text-base rounded-md ${
                                                    selectedCategory === kategori.id
                                                        ? `bg-${themeColor} text-white`
                                                        : "border border-gray-300"
                                                }`}
                                            >
                                                {kategori.name}
                                            </button>
                                        ))
                                    }
                                </div>

                                <div className="mt-6 flex-1 min-h-0 overflow-y-auto no-scrollbar">
                                    {/* Dropdown Items Per Page */}
                                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 mb-2">
                                        <span className="text-xs sm:text-sm">Tampilkan</span>
                                        <select
                                            value={pagination[selectedJenis].limit}
                                            onChange={e => handleLimitChange(Number(e.target.value))}
                                            className="border rounded px-2 py-1 text-xs sm:text-sm"
                                        >
                                            {[5, 10, 15, 30, 50].map(opt => (
                                                <option key={opt} value={opt}>{opt}</option>
                                            ))}
                                        </select>
                                        <span className="text-xs sm:text-sm">per halaman</span>
                                    </div>
                                    {(() => {
                                        const currentPagination = pagination[selectedJenis];
                                        const totalPages = Math.ceil((currentPagination.total || 1) / currentPagination.limit);
                                        return (
                                            <Gallery2
                                                items={getFilteredItems()}
                                                onSelect={handleSelectItem}
                                                selectedItems={selectedItems}
                                                currentPage={currentPagination.page}
                                                totalPages={totalPages}
                                                totalItems={currentPagination.total}
                                                itemsPerPage={currentPagination.limit}
                                                onPageChange={handlePageChange}
                                                showPagination={totalPages > 1}
                                            />
                                        );
                                    })()}
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

            {isLoading && <Spinner />}

            {isErrorAlert && (
              <AlertError
                title="Gagal!!"
                description={errorMessage}
                confirmLabel="Ok"
                onConfirm={() => setErrorAlert(false)}
              />
            )}
        </LayoutWithNav>
    );
}