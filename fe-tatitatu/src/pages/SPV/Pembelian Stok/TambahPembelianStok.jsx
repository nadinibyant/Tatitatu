import { useEffect, useState, useCallback } from "react";
import Breadcrumbs from "../../../components/Breadcrumbs";
import Input from "../../../components/Input";
import { menuItems, userOptions } from "../../../data/menu";
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

export default function TambahPembelianStok() {
    const dataBayar = [
        { id: 1, label: "Cash", value:1},
        { id: 2, label: "Non-Cash", value: 2}
    ]
    
    const [nomor, setNomor] = useState("");
    const [tanggal, setTanggal] = useState(null);
    const [note, setNote] = useState("")
    const [selectBayar, setSelectedBayar] = useState(dataBayar[0].value);
    const [selectMetode, setSelectMetode] = useState("");
    const [diskon, setDiskon] = useState(0)
    const [pajak, setPajak] = useState(0)
    const [dataCabang, setDataCabang] = useState([]);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [activeCabang, setActiveCabang] = useState(null);

    // Modal gallery state
    const [selectedCategory, setSelectedCategory] = useState("Semua");
    const [selectedJenis, setSelectedJenis] = useState("Barang Handmade");
    const [selectedItems, setSelectedItems] = useState([]);
    const [searchTermInput, setSearchTermInput] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [isLoading, setLoading] = useState(false)
    const [isModalSucc, setModalSucc] = useState(false)
    const [isMetodeDisabled, setIsMetodeDisabled] = useState(false);
    
    const [kategoriList, setKategoriList] = useState([]);

    // State untuk semua produk (tanpa pagination, category, search)
    const [dropdownItems, setDropdownItems] = useState([]);

    // Ambil semua produk untuk dropdown
    const fetchDropdownItems = async () => {
        try {
            const params = {
                toko_id,
                limit: 10000, // Ambil semua data
            };
            const handmadeRes = await api.get('/barang-handmade', { params });
            const handmadeItems = handmadeRes.data.data.map(item => ({
                id: item.barang_handmade_id,
                image: `${import.meta.env.VITE_API_URL}/images-barang-handmade/${item.image}`,
                code: item.barang_handmade_id,
                name: item.nama_barang,
                rincian_biaya: item.rincian_biaya,
                kategori: item.kategori_barang.nama_kategori_barang,
                jenis: 'Barang Handmade'
            }));
            const nonHandmadeRes = await api.get('/barang-non-handmade', { params });
            const nonHandmadeItems = nonHandmadeRes.data.data.map(item => ({
                id: item.barang_non_handmade_id,
                image: `${import.meta.env.VITE_API_URL}/images-barang-non-handmade/${item.image}`,
                code: item.barang_non_handmade_id,
                name: item.nama_barang,
                rincian_biaya: item.rincian_biaya,
                kategori: item.kategori.nama_kategori_barang,
                jenis: 'Barang Non-Handmade'
            }));
            const customRes = await api.get('/barang-custom', { params });
            const customItems = customRes.data.data.map(item => ({
                id: item.barang_custom_id,
                image: `${import.meta.env.VITE_API_URL}/images-barang-custom/${item.image}`,
                code: item.barang_custom_id,
                name: item.nama_barang,
                price: item.harga_satuan,
                kategori: item.kategori.nama_kategori_barang,
                jenis: 'Bahan Custom'
            }));
            const packagingRes = await api.get('/packaging', { params });
            const packagingItems = packagingRes.data.data.map(item => ({
                id: item.packaging_id, 
                image: `${import.meta.env.VITE_API_URL}/images-packaging/${item.image}`,
                code: item.packaging_id, 
                name: item.nama_packaging,
                price: item.harga_satuan,
                kategori: item.kategori_barang.nama_kategori_barang,
                jenis: 'Packaging'
            }));
            setDropdownItems([
                ...handmadeItems,
                ...nonHandmadeItems,
                ...customItems,
                ...packagingItems
            ]);
        } catch (error) {
            console.error('Error fetching dropdown items:', error);
            setDropdownItems([]);
        }
    };
    const [errorAlert, setErrorAlert] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [paymentMethods, setPaymentMethods] = useState([]);
    const userData = JSON.parse(localStorage.getItem('userData'))
    const isAdminGudang = userData?.role === 'admingudang'
    const isHeadGudang = userData?.role === 'headgudang';
    const isOwner = userData?.role === 'owner';
    const isManajer = userData?.role === 'manajer';
    const isAdmin = userData?.role === 'admin';
    const isFinance = userData?.role === 'finance'
    const toko_id = userData.userId

    const themeColor = (isAdminGudang || isHeadGudang) 
    ? 'coklatTua' 
    : (isManajer || isOwner || isFinance) 
      ? "biruTua" 
      : (isAdmin && userData?.userId !== 1 && userData?.userId !== 2)
        ? "hitam"
        : "primary";

    const fetchPaymentMethods = async () => {
        try {
            const response = await api.get(`/metode-pembayaran?toko_id=${toko_id}`);
            const formattedMethods = [
                { id: 0, label: "-", value: 0 },
                ...response.data.data
                    .filter(method => !method.is_deleted)
                    .map(method => ({
                        id: method.metode_id,
                        label: method.nama_metode,
                        value: method.metode_id
                    }))
            ];
            setPaymentMethods(formattedMethods);
        } catch (error) {
            console.error('Error fetching payment methods:', error);
        }
    };

    useEffect(() => {
        fetchPaymentMethods();
    }, []);

    const getImageUrl = (item, jenisBarang) => {
        if (!item.image) return null;
        
        const baseUrl = import.meta.env.VITE_API_URL || '';
        if (!item.image) return '/placeholder-image.jpg';
        
        switch (jenisBarang) {
            case "Barang Handmade":
                return `${baseUrl}/images-barang-handmade/${item.image}`;
            case "Barang Non-Handmade":
                return `${baseUrl}/images-barang-non-handmade/${item.image}`;
            case "Bahan Custom":
                return `${baseUrl}/images-barang-custom/${item.image}`;
            case "Packaging":
                return `${baseUrl}/images-packaging/${item.image}`;
            default:
                return '/placeholder-image.jpg';
        }
    };

    const fetchCabang = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/cabang?toko_id=${toko_id}`);
            const formattedCabang = response.data.data.map(cabang => ({
                nama: cabang.nama_cabang,
                id: cabang.cabang_id,
                data: [] 
            }));
            setDataCabang(formattedCabang);
        } catch (error) {
            console.error('Error fetching cabang:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCabang();
    }, [toko_id]);

    // Fetch kategori data
    useEffect(() => {
        const fetchKategori = async () => {
            try {
                const response = await api.get(`/kategori-barang?toko_id=${toko_id}`);
                setKategoriList(response.data.data.filter(k => !k.is_deleted));
            } catch (error) {
                console.error('Error fetching kategori:', error);
                setKategoriList([]);
            }
        };
        fetchKategori();
    }, [toko_id]);

    // Fetch dropdown items
    useEffect(() => {
        fetchDropdownItems();
    }, [toko_id]);


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
        return subtotal - diskonNominal - parseInt(pajak);
    };

    const handleSelectBayar = (selectedOption) => {
        setSelectedBayar(selectedOption.value); 
        if (selectedOption.value === 1) { // Cash
            setSelectMetode(0); 
            setIsMetodeDisabled(true);
        } else { 
            const firstValidMethod = paymentMethods.find(method => method.value !== 0);
            setSelectMetode(firstValidMethod?.value || 0);
            setIsMetodeDisabled(false);
        }
    };
    
    const handleSelectMetode = (selectedOption) => {
        setSelectMetode(selectedOption.value);
    };

    const breadcrumbItems = [
        { label: "Daftar Pembelian Stok", href: "/pembelianStok" },
        { label: "Tambah Pembelian", href: "" },
    ];

    const headers = [
        { label: "No", key: "No", align: "text-left" },
        { label: "Foto Produk", key: "Foto Produk", align: "text-left" },
        { label: "Nama Produk", key: "Nama Produk", align: "text-left" },
        { label: "Jenis Barang", key: "Jenis Barang", align: "text-left" },
        { label: "Harga Satuan", key: "Harga Satuan", align: "text-left" },
        { label: "Kuantitas", key: "Kuantitas", align: "text-left", width: "110px"},
        { label: "Total Biaya", key: "Total Biaya", align: "text-left" },
        { label: "Aksi", key: "Aksi", align: "text-left" },
    ];

    const btnAddBaris = (cabangIndex) => {
        setActiveCabang(cabangIndex);
        setIsModalOpen(true);
    };

    
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
                updated.push({ ...item, count, jenis: selectedJenis });
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
        const newItems = selectedItems.map((item, idx) => {
            let price = item.price;
            if (item.rincian_biaya) {
                const cabangRincian = item.rincian_biaya.find(
                    rincian => rincian.cabang_id === dataCabang[activeCabang].id
                );
                if (cabangRincian) {
                    const modalDetail = cabangRincian.detail_rincian_biaya.find(
                        detail => detail.nama_biaya === "Modal"
                    );
                    if (modalDetail) {
                        price = modalDetail.jumlah_biaya;
                    }
                }
            }

            const totalBiaya = price * item.count;
            const itemType = item.jenis || "Barang Handmade";

            let typeSpecificId = {};
            switch(itemType) {
                case "Barang Handmade":
                    typeSpecificId = { barang_handmade_id: item.id };
                    break;
                case "Barang Non-Handmade":
                    typeSpecificId = { barang_non_handmade_id: item.id };
                    break;
                case "Bahan Custom":
                    typeSpecificId = { barang_custom_id: item.id };
                    break;
                case "Packaging":
                    typeSpecificId = { packaging_id: item.id };
                    break;
            }

            return {
                ...typeSpecificId,
                id: item.id,
                No: updatedCabang[activeCabang].data.length + 1, // This will be corrected after adding
                "Foto Produk": (
                    <div className="w-12 h-12 flex items-center justify-center">
                        <img 
                            src={item.image}
                            alt={item.name} 
                            className="w-full h-full object-cover rounded"
                            onError={(e) => {
                                e.target.src = '/placeholder-image.jpg';
                            }}
                        />
                    </div>
                ),
                "Nama Produk": (
                    <InputDropdown
                        showRequired={false}
                        options={dropdownItems.map(item => ({
                            label: item.name,
                            value: item.id,
                            jenis: item.jenis,
                            kategori: item.kategori,
                            image: item.image,
                            code: item.code,
                            rincian_biaya: item.rincian_biaya
                        }))}
                        value={item.id}
                        onSelect={(newSelection) => handleTableDropdownChange(activeCabang, updatedCabang[activeCabang].data.length + idx, newSelection)}
                    />
                ),
                "Jenis Barang": itemType,
                "Harga Satuan": `Rp${price.toLocaleString()}`,
                rawHargaSatuan: price,
                "Kuantitas": (
                    <Input
                        showRequired={false}
                        type="number"
                        value={item.count}
                        onChange={(newCount) => {
                            const updatedCabangCopy = [...dataCabang];
                            const itemIndex = updatedCabangCopy[activeCabang].data.findIndex(
                                (row) => row.id === item.id
                            );

                            if (itemIndex === -1) {
                                const newTotal = price * Number(newCount);
                                const updatedItem = {
                                    ...item,
                                    quantity: newCount,
                                    rawTotalBiaya: newTotal,
                                    "Total Biaya": `Rp${newTotal.toLocaleString()}`
                                };
                                updatedCabangCopy[activeCabang].data.push(updatedItem);
                            } else {
                                const currentItem = updatedCabangCopy[activeCabang].data[itemIndex];
                                const currentPrice = currentItem.rawHargaSatuan;
                                
                                updatedCabangCopy[activeCabang].data[itemIndex].quantity = newCount;
                                const newTotal = currentPrice * Number(newCount);
                                updatedCabangCopy[activeCabang].data[itemIndex].rawTotalBiaya = newTotal;
                                updatedCabangCopy[activeCabang].data[itemIndex]["Total Biaya"] = `Rp${newTotal.toLocaleString()}`;
                            }
                            // Preserve row numbers when quantity changes
                            setDataCabang(updatedCabangCopy);
                        }}
                    />
                ),
                quantity: item.count,
                "Total Biaya": `Rp${totalBiaya.toLocaleString()}`,
                rawTotalBiaya: totalBiaya,
                jenis: itemType,
                Aksi: (
                    <button
                        type="button"
                        className="text-red-500 hover:text-red-700"
                        onClick={() => handleDeleteItem(activeCabang, item.id)}
                    >
                        Hapus
                    </button>
                ),
            };
        });

        updatedCabang[activeCabang].data.push(...newItems);
        // Renumber all rows after adding new items
        updatedCabang[activeCabang].data = renumberRows(updatedCabang[activeCabang].data);
        setDataCabang(updatedCabang);
    }
    setIsModalOpen(false);
    setSelectedItems([]);
};


    // Function to renumber rows in a cabang
    const renumberRows = (cabangData) => {
        return cabangData.map((item, index) => ({
            ...item,
            No: index + 1
        }));
    };

    const handleDeleteItem = (cabangIndex, itemId) => {
        const updatedCabang = [...dataCabang];
        updatedCabang[cabangIndex].data = updatedCabang[cabangIndex].data.filter(
            (item) => item.id !== itemId
        );
        // Renumber the remaining rows
        updatedCabang[cabangIndex].data = renumberRows(updatedCabang[cabangIndex].data);
        setDataCabang(updatedCabang);
    };

    // Ganti/ubah handleTableDropdownChange agar menerima cabangIndex dan rowIndex:
    const handleTableDropdownChange = (cabangIndex, rowIndex, nextSelection) => {
        const updatedDataCabang = [...dataCabang];
        // Cari item yang dipilih dari dropdownItems
        const selectedItem = dropdownItems.find(i => i.id === nextSelection.value);
        if (selectedItem) {
            let newPrice = selectedItem.price || 0;
            // Hitung harga untuk Handmade/Non-Handmade dengan rincian_biaya
            if ((selectedItem.jenis === "Barang Handmade" || selectedItem.jenis === "Barang Non-Handmade") && selectedItem.rincian_biaya) {
                const currentCabangId = updatedDataCabang[cabangIndex].id;
                const rincianBiaya = selectedItem.rincian_biaya.find(
                    rincian => rincian.cabang_id === currentCabangId
                );
                if (rincianBiaya?.detail_rincian_biaya) {
                    const modalBiaya = rincianBiaya.detail_rincian_biaya.find(
                        detail => detail.nama_biaya === "Modal"
                    );
                    if (modalBiaya) {
                        newPrice = modalBiaya.jumlah_biaya;
                    }
                }
            }
            const currentQuantity = updatedDataCabang[cabangIndex].data[rowIndex].quantity || 0;
            const newTotalBiaya = newPrice * currentQuantity;
            // Tentukan ID field berdasarkan jenis produk
            let typeSpecificId = {};
            switch(selectedItem.jenis) {
                case "Barang Handmade":
                    typeSpecificId = { barang_handmade_id: selectedItem.id };
                    break;
                case "Barang Non-Handmade":
                    typeSpecificId = { barang_non_handmade_id: selectedItem.id };
                    break;
                case "Bahan Custom":
                    typeSpecificId = { barang_custom_id: selectedItem.id };
                    break;
                case "Packaging":
                    typeSpecificId = { packaging_id: selectedItem.id };
                    break;
            }
            updatedDataCabang[cabangIndex].data[rowIndex] = {
                ...updatedDataCabang[cabangIndex].data[rowIndex],
                ...typeSpecificId,
                id: selectedItem.id,
                "Foto Produk": (
                    <div className="w-12 h-12 flex items-center justify-center">
                        <img 
                            src={selectedItem.image}
                            alt={selectedItem.name} 
                            className="w-full h-full object-cover rounded"
                            onError={(e) => {
                                e.target.src = '/placeholder-image.jpg';
                            }}
                        />
                    </div>
                ),
                "Jenis Barang": selectedItem.jenis,
                "Harga Satuan": `Rp${newPrice.toLocaleString()}`,
                rawHargaSatuan: newPrice,
                rawTotalBiaya: newTotalBiaya,
                "Total Biaya": `Rp${newTotalBiaya.toLocaleString()}`,
                jenis: selectedItem.jenis
            };
            setDataCabang(updatedDataCabang);
        }
    };

    const subtotal = calculateSubtotal();
    const totalPenjualan = calculateTotalPenjualan(subtotal);
    const navigate = useNavigate()

    const handleTambahSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
    
            const hasItems = dataCabang.some(cabang => cabang.data.length > 0);
    
            if (!hasItems) {
                setErrorMessage('Minimal harus menambahkan 1 barang di salah satu cabang');
                setErrorAlert(true);
                return;
            }

            const produk = dataCabang.flatMap(cabang => 
                cabang.data.map(item => {
                    const baseProduct = {
                        cabang_id: cabang.id,
                        harga_satuan: parseInt(item.rawHargaSatuan || item.price),
                        kuantitas: parseInt(item.quantity),
                        total_biaya: parseInt(item.rawTotalBiaya)
                    };
    
                    if (item.barang_handmade_id) {
                        return { ...baseProduct, barang_handmade_id: item.barang_handmade_id };
                    } else if (item.barang_non_handmade_id) {
                        return { ...baseProduct, barang_non_handmade_id: item.barang_non_handmade_id };
                    } else if (item.barang_custom_id) {
                        return { ...baseProduct, barang_custom_id: item.barang_custom_id };
                    } else if (item.packaging_id) {
                        return { ...baseProduct, packaging_id: item.packaging_id };
                    }
                })
            );
    
            const payload = {
                tanggal: tanggal,
                cash_or_non: selectBayar === 1,
                sub_total: parseInt(calculateSubtotal()),
                catatan: note,
                diskon: parseInt(diskon),
                pajak: parseInt(pajak),
                total_pembelian: parseInt(calculateTotalPenjualan(calculateSubtotal())),
                metode_id: selectBayar === 1 ? null : parseInt(selectMetode),
                toko_id: toko_id,
                produk
            };
    
            await api.post('/pembelian', payload);
            setModalSucc(true);
        } catch (error) {
            console.error('Error submitting pembelian:', error);
            setErrorMessage(error.response?.data?.message || 'Gagal menambah pembelian');
            setErrorAlert(true);
        } finally {
            setLoading(false);
        }
    };

    const handleAcc = () => {
        setModalSucc(false)
        navigate('/pembelianStok')
    }

    // PAGINATION STATE
    const [pagination, setPagination] = useState({
        "Barang Handmade": { page: 1, limit: 5, total: 0 },
        "Barang Non-Handmade": { page: 1, limit: 5, total: 0 },
        "Bahan Custom": { page: 1, limit: 5, total: 0 },
        "Packaging": { page: 1, limit: 5, total: 0 },
    });
    const [barangData, setBarangData] = useState({
        "Barang Handmade": { items: [], total: 0 },
        "Barang Non-Handmade": { items: [], total: 0 },
        "Bahan Custom": { items: [], total: 0 },
        "Packaging": { items: [], total: 0 },
    });



    // Fetch paginated data for the selected jenis
    const fetchBarangPaginated = async (jenis, { page, limit, category, search }) => {
        setLoading(true);
        let endpoint = '';
        let typeKey = '';
        switch (jenis) {
            case 'Barang Handmade': endpoint = '/barang-handmade'; typeKey = 'barang_handmade'; break;
            case 'Barang Non-Handmade': endpoint = '/barang-non-handmade'; typeKey = 'barang_non_handmade'; break;
            case 'Bahan Custom': endpoint = '/barang-custom'; typeKey = 'barang_custom'; break;
            case 'Packaging': endpoint = '/packaging'; typeKey = 'packaging'; break;
            default: return;
        }
        const params = [
            `toko_id=${toko_id}`,
            `page=${page}`,
            `limit=${limit}`
        ];
        if (category && category !== 'Semua') params.push(`category=${category}`);
        if (search) params.push(`search=${encodeURIComponent(search)}`);
        try {
            const res = await api.get(`${endpoint}?${params.join('&')}`);
            const items = res.data.data.map(item => {
                let price = 0;
                if ((typeKey === 'barang_handmade' || typeKey === 'barang_non_handmade') && item.rincian_biaya) {
                    const currentCabangId = dataCabang[activeCabang]?.id;
                    const rincianBiaya = item.rincian_biaya.find(
                        rincian => rincian.cabang_id === currentCabangId
                    );
                    if (rincianBiaya?.detail_rincian_biaya) {
                        const modalBiaya = rincianBiaya.detail_rincian_biaya.find(
                            detail => detail.nama_biaya === "Modal"
                        );
                        if (modalBiaya) {
                            price = modalBiaya.jumlah_biaya;
                        }
                    }
                } else if (typeKey === 'packaging') {
                    price = item.harga_satuan;
                } else if (typeKey === 'barang_custom') {
                    price = item.harga_satuan;
                }
                return {
                    id: item[`${typeKey}_id`],
                    image: item.image,
                    code: item[`${typeKey}_id`],
                    name: typeKey === 'packaging' ? item.nama_packaging : item.nama_barang,
                    rincian_biaya: item.rincian_biaya,
                    price: price,
                    jenis: jenis,
                    kategori_id: item.kategori_barang_id || item.kategori_barang?.kategori_barang_id
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
        } catch {
            setBarangData(prev => ({ ...prev, [jenis]: { items: [], total: 0 } }));
        } finally {
            setLoading(false);
        }
    };

    // Fetch on modal open, jenis, category, search, page, or limit change
    useEffect(() => {
        if (!isModalOpen) return;
        fetchBarangPaginated(selectedJenis, {
            page: pagination[selectedJenis].page,
            limit: pagination[selectedJenis].limit,
            category: selectedCategory,
            search: searchTerm
        });
    }, [isModalOpen, selectedJenis, selectedCategory, searchTerm, pagination[selectedJenis].page, pagination[selectedJenis].limit]);

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

    // Handler for items per page change
    const handleItemsPerPageChange = useCallback((limit) => {
        setPagination(prev => ({
            ...prev,
            [selectedJenis]: {
                ...prev[selectedJenis],
                limit,
                page: 1
            }
        }));
    }, [selectedJenis]);

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


    return (
        <>
            <LayoutWithNav menuItems={menuItems} userOptions={userOptions}>
                <div className="p-5">
                    <Breadcrumbs items={breadcrumbItems} />

                    {/* Section Form Input */}
                    <section className="bg-white p-5 mt-5 rounded-xl">
                        <form onSubmit={handleTambahSubmit}>
                            <section>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <Input label={"Nomor"} type1={"text"} value={nomor} disabled={true} onChange={(e) => setNomor(e)} />
                                    <Input label={"Tanggal dan Waktu"} type1={"datetime-local"} required={true} value={tanggal} onChange={(e) => setTanggal(e)} />
                                    <InputDropdown label={"Cash/Non-Cash"} required={true} options={dataBayar} value={selectBayar} onSelect={handleSelectBayar} />
                                    <div className="md:col-span-3 md:w-1/3">
                                        <InputDropdown 
                                            label={"Metode Pembayaran"} 
                                            required={true} 
                                            disabled={isMetodeDisabled} 
                                            options={paymentMethods} 
                                            value={selectMetode} 
                                            onSelect={handleSelectMetode} 
                                        />
                                    </div>
                                </div>
                            </section>

                            {/* Section Tambah Data Per Cabang */}
                            <section className="pt-10">
                                {isLoading ? (
                                    <Spinner />
                                ) : (
                                    dataCabang.map((cabang, cabangIndex) => {
                                        // Rebuild table data dengan handler yang benar untuk setiap baris
                                        const tableData = cabang.data.map((item, rowIndex) => ({
                                            ...item,
                                            "Nama Produk": (
                                                <InputDropdown
                                                    showRequired={false}
                                                    options={dropdownItems.map(item => ({
                                                        label: item.name,
                                                        value: item.id,
                                                        jenis: item.jenis,
                                                        kategori: item.kategori,
                                                        image: item.image,
                                                        code: item.code,
                                                        rincian_biaya: item.rincian_biaya
                                                    }))}
                                                    value={item.id}
                                                    onSelect={(newSelection) => handleTableDropdownChange(cabangIndex, rowIndex, newSelection)}
                                                />
                                            ),
                                            "Kuantitas": (
                                                <Input
                                                    showRequired={false}
                                                    type="number"
                                                    value={item.quantity}
                                                    onChange={(newCount) => {
                                                        const updatedCabangCopy = [...dataCabang];
                                                        const currentItem = updatedCabangCopy[cabangIndex].data[rowIndex];
                                                        const currentPrice = currentItem.rawHargaSatuan;
                                                        
                                                        updatedCabangCopy[cabangIndex].data[rowIndex].quantity = newCount;
                                                        const newTotal = currentPrice * Number(newCount);
                                                        updatedCabangCopy[cabangIndex].data[rowIndex].rawTotalBiaya = newTotal;
                                                        updatedCabangCopy[cabangIndex].data[rowIndex]["Total Biaya"] = `Rp${newTotal.toLocaleString()}`;
                                                        setDataCabang(updatedCabangCopy);
                                                    }}
                                                />
                                            ),
                                            Aksi: (
                                                <button
                                                    type="button"
                                                    className="text-red-500 hover:text-red-700"
                                                    onClick={() => handleDeleteItem(cabangIndex, item.id)}
                                                >
                                                    Hapus
                                                </button>
                                            ),
                                        }));

                                        return (
                                            <div key={cabang.id} className="pt-5">
                                                <p className="font-bold">{cabang.nama}</p>
                                                <div className="pt-5">
                                                    <Table headers={headers} data={tableData} />
                                                    <Button
                                                        label="Tambah Baris"
                                                        icon={
                                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                                                            </svg>
                                                        }
                                                        onClick={() => btnAddBaris(cabangIndex)}
                                                        bgColor=""
                                                        hoverColor={`hover:border-${themeColor} hover:border`}
                                                        textColor={`text-${themeColor}`}
                                                    />
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
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
                                            <p className="font-bold">Total Pembelian</p>
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
                                                    value={searchTermInput}
                                                    onChange={e => setSearchTermInput(e.target.value)}
                                                    onKeyDown={e => {
                                                        if (e.key === 'Enter') {
                                                            setSearchTerm(searchTermInput);
                                                            setPagination(prev => ({
                                                                ...prev,
                                                                [selectedJenis]: {
                                                                    ...prev[selectedJenis],
                                                                    page: 1
                                                                }
                                                            }));
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

                                        {/* Bottom row: Action buttons */}
                                        <div className="flex justify-end gap-4">
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
                                    </div>

                                    {/* Tabs for Barang Types */}
                                    <div className="flex border-b border-gray-300 mb-4 overflow-x-auto">
                                        {["Barang Handmade", "Barang Non-Handmade", "Bahan Custom", "Packaging"].map((jenis) => (
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

                                    {isLoading ? (
                                        <div className="flex justify-center items-center h-64">
                                            <Spinner />
                                        </div>
                                    ) : (
                                        <>
                                            {/* Kategori Buttons */}
                                            <div className="flex flex-wrap gap-2 mt-4">
                                                <button
                                                    key="Semua"
                                                    onClick={() => setSelectedCategory("Semua")}
                                                    className={`px-3 py-1 text-sm md:text-base rounded-md ${
                                                        selectedCategory === "Semua" 
                                                            ? `bg-${themeColor} text-white` 
                                                            : "border border-gray-300"
                                                    }`}
                                                >
                                                    Semua
                                                </button>
                                                {kategoriList.map((kategori) => (
                                                    <button
                                                        key={kategori.kategori_barang_id}
                                                        onClick={() => handleCategoryChange(kategori.kategori_barang_id.toString())}
                                                        className={`px-3 py-1 text-sm md:text-base rounded-md ${
                                                            selectedCategory === kategori.kategori_barang_id.toString()
                                                                ? `bg-${themeColor} text-white`
                                                                : "border border-gray-300"
                                                        }`}
                                                    >
                                                        {kategori.nama_kategori_barang}
                                                    </button>
                                                ))}
                                            </div>

                                            {/* Gallery */}
                                            <div className="mt-6 flex-1 min-h-0 overflow-y-auto no-scrollbar">
                                                {/* Dropdown Items Per Page */}
                                                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 mb-2">
                                                    <span className="text-xs sm:text-sm">Tampilkan</span>
                                                    <select
                                                        value={pagination[selectedJenis].limit}
                                                        onChange={e => handleItemsPerPageChange(Number(e.target.value))}
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
                                                            items={barangData[selectedJenis].items.map(item => ({
                                                                ...item,
                                                                image: getImageUrl(item, selectedJenis)
                                                            }))}
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
                                        </>
                                    )}
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

                {errorAlert && (
                <AlertError
                    title="Gagal!!"
                    description={errorMessage}
                    confirmLabel="Ok"
                    onConfirm={() => setErrorAlert(false)}
                />
                )}
            </LayoutWithNav>
        </>
    );
}
