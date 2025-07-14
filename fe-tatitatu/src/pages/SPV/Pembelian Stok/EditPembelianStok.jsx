import { useEffect, useState } from "react";
import Breadcrumbs from "../../../components/Breadcrumbs";
import Input from "../../../components/Input";
import { menuItems, userOptions } from "../../../data/menu";
import InputDropdown from "../../../components/InputDropdown";
import Table from "../../../components/Table";
import Button from "../../../components/Button";
import Gallery2 from "../../../components/Gallery2";
import TextArea from "../../../components/Textarea";
import Alert from "../../../components/Alert";
import AlertSuccess from "../../../components/AlertSuccess";
import Spinner from "../../../components/Spinner";
import { useLocation, useNavigate } from "react-router-dom";
import LayoutWithNav from "../../../components/LayoutWithNav";
import api from "../../../utils/api";

export default function EditPembelianStok() {
    const location = useLocation();
    const pembelianId = location.state?.id;
    const fromLaporanKeuangan = location.state?.fromLaporanKeuangan
    const [data, setData] = useState({
        id: '',
        nomor: '',
        invoice: '',
        tanggal: '',
        pembayaran: null,
        metode: null,
        dataCabang: [],
        catatan: '',
        subtotal: 0,
        diskon: 0,
        pajak: 0,
        totalpenjualan: 0
    });


    const [note, setNote] = useState(data.catatan || "");
    const [selectBayar, setSelectedBayar] = useState(data.pembayaran || "");
    const [diskon, setDiskon] = useState(data.diskon || 0);
    const [pajak, setPajak] = useState(data.pajak || 0);
    const [dataCabang, setDataCabang] = useState([]);
    const [categories, setCategories] = useState([]);


    const [isModalOpen, setIsModalOpen] = useState(false);
    const [activeCabang, setActiveCabang] = useState(null);

    const [selectedCategory, setSelectedCategory] = useState("Semua");
    const [selectedJenis, setSelectedJenis] = useState("Barang Handmade");
    const [selectedItems, setSelectedItems] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [isModalDel, setModalDel] = useState(false)
    const [isModalSucc, setModalSucc] = useState(false)
    const [isLoading, setLoading] = useState(false)
    const [isMetodeDisabled, setIsMetodeDisabled] = useState(false);
    const [dataMetode, setDataMetode] = useState([]); 
    const [selectMetode, setSelectMetode] = useState({
        value: data.metode || 1,
        label: dataMetode.find(opt => opt.value === data.metode)?.label || "-"
    });
    const userData = JSON.parse(localStorage.getItem('userData'))
    const isAdminGudang = userData?.role === 'admingudang'
    const isHeadGudang = userData?.role === 'headgudang';
    const isOwner = userData?.role === 'owner';
    const isManajer = userData?.role === 'manajer';
    const isAdmin = userData?.role === 'admin';
    const isFinance = userData?.role === 'finance'
    const [toko_id, setTokoId] = useState(userData.userId);

    const themeColor = (isAdminGudang || isHeadGudang) 
    ? 'coklatTua' 
    : (isManajer || isOwner || isFinance) 
      ? "biruTua" 
      : (isAdmin && userData?.userId !== 1 && userData?.userId !== 2)
        ? "hitam"
        : "primary";

    const [modalCurrentPage, setModalCurrentPage] = useState(1);
    const [modalItemsPerPage, setModalItemsPerPage] = useState(12);

    const [categoriesList, setCategoriesList] = useState([]);
    const [selectedCategoryId, setSelectedCategoryId] = useState(null);
    const [modalItems, setModalItems] = useState([]);
    const [modalTotalPages, setModalTotalPages] = useState(1);

    // Add new state for dropdown items (all items without pagination)
    const [dropdownItems, setDropdownItems] = useState([]);

    const filteredItems = modalItems.filter(item => {
        const matchesCategory = selectedCategory === "Semua" || 
                              item.kategori === selectedCategory;
        const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
  
        if (!item.price) {
            if (selectedJenis === "Barang Handmade" || selectedJenis === "Barang Non-Handmade") {
                if (activeCabang !== null && dataCabang[activeCabang]) {
                    const currentCabang = dataCabang[activeCabang];
                    if (currentCabang && item.rincian_biaya) {
                        const rincianBiaya = item.rincian_biaya.find(
                            rincian => rincian.cabang?.nama_cabang === currentCabang.nama
                        );
                        
                        if (rincianBiaya?.detail_rincian_biaya) {
                            const modalBiaya = rincianBiaya.detail_rincian_biaya.find(
                                detail => detail.nama_biaya === "Modal"
                            );
                            if (modalBiaya) {
                                item.price = modalBiaya.jumlah_biaya;
                            } else {
                                item.price = 0;
                            }
                        } else {
                            item.price = 0; 
                        }
                    } else {
                        item.price = 0; 
                    }
                } else {
                    item.price = 0;
                }
            } else {
                item.price = item.price || 0;
            }
        }
  
        return matchesCategory && matchesSearch;
    });



    useEffect(() => {
        setModalCurrentPage(1);
    }, [selectedJenis, selectedCategory, searchTerm, isModalOpen]);

    useEffect(() => {
        const fetchPembelianData = async () => {
            try {
                setLoading(true);
                const response = await api.get(`/pembelian/${pembelianId}`); 
                const pembelianData = response.data.data;

                if ((isFinance || isOwner || isManajer) && pembelianData.toko_id) {
                    setTokoId(pembelianData.toko_id)
                }
        
                const isCash = pembelianData.cash_or_non;
                setSelectedBayar(isCash ? 1 : 2);
                setDiskon(pembelianData.diskon || 0);
                setPajak(pembelianData.pajak || 0);
        
                const groupedProducts = pembelianData.produk.reduce((acc, product) => {
                    const cabangName = product.cabang.nama_cabang;
                    if (!acc[cabangName]) {
                        acc[cabangName] = [];
                    }
                    acc[cabangName].push(product);
                    return acc;
                }, {});
        
                const transformedData = {
                    id: pembelianData.pembelian_id,
                    nomor: pembelianData.pembelian_id,
                    tanggal: pembelianData.tanggal.split('T')[0],
                    pembayaran: pembelianData.cash_or_non ? 1 : 2,
                    metode: pembelianData.metode_id,
                    dataCabang: Object.entries(groupedProducts).map(([cabangName, products]) => {
                        return {
                            nama: cabangName,
                            data: products.map((product, index) => {
                                let productDetails;
                                let imagePath;
                                let imageFile;
        
                                if (product.barang_handmade) {
                                    productDetails = product.barang_handmade;
                                    imagePath = 'images-barang-handmade';
                                    imageFile = productDetails.image;
                                } else if (product.barang_non_handmade) {
                                    productDetails = product.barang_non_handmade;
                                    imagePath = 'images-barang-non-handmade';
                                    imageFile = productDetails.image;
                                } else if (product.barang_custom) {
                                    productDetails = product.barang_custom;
                                    imagePath = 'images-barang-custom';
                                    imageFile = productDetails.image;
                                } else if (product.packaging) {
                                    productDetails = product.packaging;
                                    imagePath = 'images-packaging';
                                    imageFile = productDetails.image;
                                }
        
                                return {
                                    id: productDetails?.barang_handmade_id || 
                                        productDetails?.barang_non_handmade_id || 
                                        productDetails?.barang_custom_id || 
                                        productDetails?.packaging_id,
                                    No: index + 1,
                                    "Foto Produk": (
                                        <img 
                                            src={`${import.meta.env.VITE_API_URL}/${imagePath}/${imageFile}`}
                                            alt="Foto Produk" 
                                            className="w-12 h-12 object-cover rounded"
                                            onError={(e) => {
                                                e.target.src = '/placeholder-image.jpg';
                                            }}
                                        />
                                    ),
                                    "Nama Produk": productDetails?.barang_handmade_id || 
                                                 productDetails?.barang_non_handmade_id || 
                                                 productDetails?.barang_custom_id || 
                                                 productDetails?.packaging_id,
                                    "Jenis Barang": productDetails?.jenis_barang?.nama_jenis_barang || 
                                                  (product.barang_handmade ? "Handmade" :
                                                   product.barang_non_handmade ? "Barang Non-Handmade" :
                                                   product.barang_custom ? "Bahan Custom" :
                                                   "Packaging"),
                                    "Harga Satuan": product.harga_satuan,
                                    "Kuantitas": product.kuantitas,
                                    "Total Biaya": product.total_biaya
                                };
                            })
                        };
                    }),
                    catatan: pembelianData.catatan || '',
                    subtotal: pembelianData.sub_total,
                    diskon: pembelianData.diskon,
                    pajak: pembelianData.pajak,
                    totalpenjualan: pembelianData.total_pembelian
                };
        
                setData(transformedData);
                setDataCabang(transformedData.dataCabang);
                setNote(transformedData.catatan);
                
            } catch (error) {
                console.error('Error fetching pembelian data:', error);
            } finally {
                setLoading(false);
            }
        };
    
        if (pembelianId) {
            fetchPembelianData();
        }
    }, [pembelianId]);

    useEffect(() => {
        if (data.metode && dataMetode.length > 0) {
            const selectedMetode = dataMetode.find(
                method => method.id === data.metode
            );
            
            if (selectedMetode) {
                setSelectMetode({
                    value: selectedMetode.id,
                    label: selectedMetode.label
                });
            }
        }
    }, [data.metode, dataMetode]);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await api.get(`/kategori-barang?toko_id=${toko_id}`);
                if (response.data.success) {
                    setCategoriesList(response.data.data);
                    setCategories(['Semua', ...response.data.data.map(cat => cat.nama_kategori_barang)]);
                }
            } catch {
                setCategoriesList([]);
                setCategories(['Semua']);
            }
        };
        fetchCategories();
    }, [toko_id]);

    useEffect(() => {
        const fetchAllItems = async () => {
            if (!isModalOpen) return;
            
            try {
                // Build query parameters for pagination
                const params = {
                    toko_id,
                    page: modalCurrentPage,
                    limit: modalItemsPerPage,
                };
                
                if (selectedCategoryId) params.category = selectedCategoryId;
                if (searchTerm) params.search = searchTerm;

                let endpoint = '';
                if (selectedJenis === 'Barang Handmade') endpoint = '/barang-handmade';
                else if (selectedJenis === 'Barang Non-Handmade') endpoint = '/barang-non-handmade';
                else if (selectedJenis === 'Bahan Custom') endpoint = '/barang-custom';
                else if (selectedJenis === 'Packaging') endpoint = '/packaging';

                const res = await api.get(endpoint, { params });
                const items = res.data.data.map(item => {
                    let price = 0;
                    const itemId = item.barang_handmade_id || item.barang_non_handmade_id || item.barang_custom_id || item.packaging_id;
                    
                    // Handle price differently based on item type
                    if (selectedJenis === 'Barang Handmade' || selectedJenis === 'Barang Non-Handmade') {
                        if (activeCabang !== null && dataCabang[activeCabang]) {
                            const currentCabang = dataCabang[activeCabang];
                            if (currentCabang && item.rincian_biaya) {
                                const rincianBiaya = item.rincian_biaya.find(
                                    rincian => rincian.cabang?.nama_cabang === currentCabang.nama
                                );
                                
                                if (rincianBiaya?.detail_rincian_biaya) {
                                    const modalBiaya = rincianBiaya.detail_rincian_biaya.find(
                                        detail => detail.nama_biaya === "Modal"
                                    );
                                    if (modalBiaya) {
                                        price = modalBiaya.jumlah_biaya;
                                    }
                                }
                            }
                        }
                    } else {
                        // For Bahan Custom and Packaging, use harga_satuan
                        price = item.harga_satuan || 0;
                    }
                    
                    return {
                        id: itemId,
                        image: item.image ? `${import.meta.env.VITE_API_URL}/images-barang-${selectedJenis === 'Barang Handmade' ? 'handmade' : selectedJenis === 'Barang Non-Handmade' ? 'non-handmade' : selectedJenis === 'Bahan Custom' ? 'custom' : 'packaging'}/${item.image}` : '',
                        code: itemId,
                        name: item.nama_barang || item.nama_packaging,
                        rincian_biaya: item.rincian_biaya,
                        price: price,
                        kategori: item.kategori_barang?.nama_kategori_barang || item.kategori?.nama_kategori_barang
                    };
                });
                
                setModalItems(items);
                setModalTotalPages(res.data.pagination?.totalPages || 1);
            } catch (error) {
                console.error('Error fetching items:', error);
                setModalItems([]);
                setModalTotalPages(1);
            }
        };

        if (categories.length > 0) {
            fetchAllItems();
        }
    }, [categories, modalCurrentPage, modalItemsPerPage, selectedCategoryId, searchTerm, isModalOpen, selectedJenis, activeCabang, dataCabang]);

    // Add new useEffect to fetch all items for dropdown (without pagination)
    useEffect(() => {
        const fetchDropdownItems = async () => {
            try {
                // Fetch all items without pagination for dropdown
                const params = {
                    toko_id,
                    limit: 1000, // Get all items
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
        
                setDropdownItems([...handmadeItems, ...nonHandmadeItems, ...customItems, ...packagingItems]);
            } catch (error) {
                console.error('Error fetching dropdown items:', error);
                setDropdownItems([]);
            }
        };

        fetchDropdownItems();
    }, [toko_id]);

    const filteredItemsBarang = dropdownItems.map(item => ({
        label: item.name, 
        value: item.id,
        price: item.price,   
        jenis: item.jenis,
        kategori: item.kategori,
        image: item.image
    }));

    const getModalPrice = (item, cabangIndex) => {
        if (!item || !item.rincian_biaya) return 0;
        
        const currentCabang = dataCabang[cabangIndex];
        if (!currentCabang) return 0;
        
        const rincianBiaya = item.rincian_biaya.find(
            rincian => rincian.cabang?.nama_cabang === currentCabang.nama
        );
        
        if (!rincianBiaya || !rincianBiaya.detail_rincian_biaya) return 0;
        
        const modalBiaya = rincianBiaya.detail_rincian_biaya.find(
            detail => detail.nama_biaya === "Modal"
        );
        
        return modalBiaya ? modalBiaya.jumlah_biaya : 0;
      };

    useEffect(() => {
        const fetchMetodePembayaran = async () => {
            try {
                const response = await api.get(`/metode-pembayaran?toko_id=${toko_id}`);
                if (response.data.success && response.data.data) {
                    const transformedMetode = response.data.data.map(metode => ({
                        id: metode.metode_id,
                        label: metode.nama_metode,
                        value: metode.metode_id
                    }));
                    
                    setDataMetode(transformedMetode);
                }
            } catch (error) {
                console.error('Error fetching payment methods:', error);
                setDataMetode([]);
            }
        };
    
        fetchMetodePembayaran();
    }, []);

    useEffect(() => {
        const fetchCabangData = async () => {
            try {
                const response = await api.get(`/cabang?toko_id=${toko_id}`);
                if (response.data.success) {
                    const allCabang = response.data.data.map(cabang => ({
                        nama: cabang.nama_cabang,
                        data: [] 
                    }));
    
                    if (data.dataCabang && data.dataCabang.length > 0) {
                        data.dataCabang.forEach(savedCabang => {
                            const cabangIndex = allCabang.findIndex(
                                cabang => cabang.nama === savedCabang.nama
                            );
                            if (cabangIndex !== -1) {
                                allCabang[cabangIndex].data = savedCabang.data;
                            }
                        });
                    }
                    
                    setDataCabang(allCabang);
                }
            } catch (error) {
                console.error('Error fetching cabang data:', error);
            }
        };
    
        fetchCabangData();
    }, [data.dataCabang]);


    

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
        if (!dataMetode || dataMetode.length === 0) return;
        
        if (selectBayar === 1) {
            setSelectMetode({
                value: null,
                label: "-"
            });
            setIsMetodeDisabled(true);
        } else if (selectBayar === 2) {
            const nonCashMethod = dataMetode[0];
            if (nonCashMethod) {
                setSelectMetode({
                    value: nonCashMethod.id,
                    label: nonCashMethod.label
                });
            }
            setIsMetodeDisabled(false);
        }
    }, [selectBayar, dataMetode]);

    const handleCancelDel = () => {
        setModalDel(false)
    }

    const handleConfirmDel = () => {
        setModalDel(false)
        setModalSucc(true)
    }

    const calculateSubtotal = () => {
        return dataCabang.reduce((acc, cabang) => {
            const totalCabang = cabang.data.reduce((cabAcc, row) => {
                const totalBiaya = row["Total Biaya"]
                return cabAcc + totalBiaya;
            }, 0);
            return acc + totalCabang;
        }, 0);
    };

    const calculateTotalPenjualan = (subtotal) => {
        const diskonNominal = (diskon / 100) * subtotal; 
        return subtotal - diskonNominal - pajak;
    };

    const dataBayar = [
        { id: 1, label: "Cash", value:1},
        { id: 2, label: "Non-Cash", value: 2}
    ]

    useEffect(() => {
        if (data.pembayaran) {
            setSelectedBayar(data.pembayaran); 
        }
    }, [data.pembayaran]);

    const handleSelectBayar = (selectedOption) => {
        setSelectedBayar(selectedOption.value);
        
        if (!dataMetode || dataMetode.length === 0) return;
    
        if (selectedOption.value === 1) {
            setSelectMetode({
                value: null,
                label: "-"
            });
            setIsMetodeDisabled(true);
        } else {
            if (selectMetode && selectMetode.value && selectMetode.label !== "-") {
                setSelectMetode(selectMetode);
            } else {
                const firstMethod = dataMetode[0];
                if (firstMethod) {
                    setSelectMetode({
                        value: firstMethod.id,
                        label: firstMethod.label
                    });
                }
            }
            setIsMetodeDisabled(false);
        }
    };

    useEffect(() => {
        if (data.metode) {
            const metodeOption = dataMetode.find(option => option.id === data.metode);
            if (metodeOption) {
                setSelectMetode({
                    value: metodeOption.id,
                    label: metodeOption.label
                });
            }
        }
    }, [data.metode, dataMetode]);

    const handleSelectMetode = (selectedOption) => {
        setSelectMetode({
            value: selectedOption.value,
            label: selectedOption.label
        });
    };

    const breadcrumbItems = fromLaporanKeuangan 
    ? [
        { label: "Daftar Laporan Keuangan Toko", href: "/laporanKeuangan" },
        { label: "Edit Pembelian", href: "" },
      ]
    : [
        { label: "Daftar Pembelian Stok", href: "/pembelianStok" },
        { label: "Edit Pembelian", href: "" },
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


    const btnAddBaris = (cabangIndex) => {
        setActiveCabang(cabangIndex);
        setIsModalOpen(true);
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

    const handleChange = async (selectedOption, cabangIndex, itemIndex, field) => {
        const updatedDataCabang = [...dataCabang];
        const item = updatedDataCabang[cabangIndex].data[itemIndex];
        const currentCabang = dataCabang[cabangIndex];
        
        if (item) {
            if (field === "Nama Produk") {
                const selectedItem = dropdownItems.find(item => item.id === selectedOption.value);
    
                if (selectedItem) {
                    let price;
                    if (selectedItem.jenis === "Barang Handmade" || selectedItem.jenis === "Barang Non-Handmade") {
                        const cabang = await api.get(`/cabang?toko_id=${toko_id}`);
                        const cabangData = cabang.data.data;
                        const currentCabangId = cabangData.find(c => c.nama_cabang === currentCabang.nama)?.cabang_id;
                        price = getModalPrice(selectedItem, currentCabangId);
                    } else {
                        price = selectedItem.price || 0;
                    }
    
                    updatedDataCabang[cabangIndex].data[itemIndex] = {
                        ...item,
                        "Nama Produk": selectedOption.value,
                        "Jenis Barang": selectedItem.jenis,
                        "Harga Satuan": price,
                        "Total Biaya": price * item.Kuantitas,
                        "Foto Produk": (
                            <img 
                                src={selectedItem.image}
                                alt="Foto Produk" 
                                className="w-12 h-12 object-cover rounded"
                                onError={(e) => {
                                    e.target.src = 'https://via.placeholder.com/150';
                                }}
                            />
                        )
                    };
                }
            } else if (field === "Kuantitas") {
                const hargaSatuan = item["Harga Satuan"];
                updatedDataCabang[cabangIndex].data[itemIndex] = {
                    ...item,
                    "Kuantitas": selectedOption,
                    "Total Biaya": hargaSatuan * selectedOption
                };
            }
    
            setDataCabang(updatedDataCabang);
        }
    };
    

    const tableData = dataCabang.map((cabang, cabangIndex) => {
        return cabang.data.map((item, itemIndex) => {
            return {
                id: item.id,
                No: itemIndex + 1,
                "Foto Produk": item["Foto Produk"],
                "Nama Produk": (
                    <InputDropdown
                        showRequired={false}
                        options={filteredItemsBarang}
                        value={item["Nama Produk"]}
                        onSelect={(selectedOption) => handleChange(selectedOption, cabangIndex, itemIndex, "Nama Produk")}
                    />
                ),
                "Jenis Barang": item["Jenis Barang"],
                "Harga Satuan": `Rp${(item["Harga Satuan"]).toLocaleString()}`,
                Kuantitas: (
                    <Input
                        showRequired={false}
                        type="number"
                        value={item.Kuantitas}
                        onChange={(e) => handleChange(e, cabangIndex, itemIndex, "Kuantitas")}
                    />
                ),
                "Total Biaya": `Rp${(item["Harga Satuan"] * item.Kuantitas).toLocaleString()}`,
                Aksi: (
                    <button
                        className="text-red-500 hover:text-red-700"
                        onClick={() => {
                            if (item.isNew) {
                                handleDeleteItem(cabangIndex, item.id, true);  
                            } else {
                                handleDeleteItem(cabangIndex, item.id, true);  
                            }
                        }}
                        type="button"
                    >
                        Hapus
                    </button>
                ),
            };
        });
    });
        
    

    const resetSelection = () => {
        setSelectedItems([]);
        setIsModalOpen(false);
    };

    const handleModalSubmit = () => {
        if (activeCabang !== null && activeCabang >= 0 && activeCabang < dataCabang.length) {
            const updatedCabang = [...dataCabang];
            const newItems = selectedItems.map(item => {
                let price = item.price || 0;
                
                if ((selectedJenis === "Barang Handmade" || selectedJenis === "Barang Non-Handmade")) {
                    const selectedItem = dropdownItems.find(i => i.id === item.id);
                    
                    if (selectedItem) {
                        const modalPrice = getModalPrice(selectedItem, activeCabang);
                        if (modalPrice !== undefined && modalPrice !== null) {
                            price = modalPrice;
                        }
                    }
                }
    
                price = Number(price) || 0;
                const count = Number(item.count) || 0;
                const totalBiaya = price * count;
    
                return {
                    id: item.id,
                    No: updatedCabang[activeCabang].data.length + 1,
                    "Foto Produk": (
                        <img 
                            src={item.image}
                            alt={item.name} 
                            className="w-12 h-12 object-cover rounded"
                            onError={(e) => {
                                e.target.src = '/placeholder-image.jpg';
                            }}
                        />
                    ),
                    "Nama Produk": item.id,
                    "Jenis Barang": selectedJenis,
                    "Harga Satuan": price,
                    Kuantitas: count,
                    "Total Biaya": totalBiaya,
                    isNew: true
                };
            });
    
            updatedCabang[activeCabang].data.push(...newItems);
            setDataCabang(updatedCabang);
        }
        setIsModalOpen(false);
        setSelectedItems([]);
    };

    const handleDeleteItem = (cabangIndex, itemId, isNew = false) => {
        const updatedCabang = [...dataCabang];
        if (isNew) {
            updatedCabang[cabangIndex].data = updatedCabang[cabangIndex].data.filter(
                (item) => item.id !== itemId
            );
        } else {
            updatedCabang[cabangIndex].data = updatedCabang[cabangIndex].data.filter(
                (item) => item.id !== itemId
            );
        }
        setDataCabang(updatedCabang);
    };
    

    const subtotal = calculateSubtotal();
    const totalPenjualan = calculateTotalPenjualan(subtotal);
    



    const navigate = useNavigate()

    const handleEditSubmit = async (event) => {
        event.preventDefault();
        try {
            setLoading(true);
    
            const cabangResponse = await api.get(`/cabang?toko_id=${toko_id}`);
            const cabangList = cabangResponse.data.data;
    
            const produkData = dataCabang.flatMap(cabang => {
                const cabangId = parseInt(cabangList.find(c => c.nama_cabang === cabang.nama)?.cabang_id);
    
                return cabang.data.map(item => {
                    let productType;

                    if (item["Jenis Barang"] === "Handmade" || item["Jenis Barang"] === "Barang Handmade") {
                        productType = "barang_handmade_id";
                    } else if (item["Jenis Barang"] === "Barang Non-Handmade" || item["Jenis Barang"] === "Non Handmade") {
                        productType = "barang_non_handmade_id";
                    } else if (item["Jenis Barang"] === "Bahan Custom" || item["Jenis Barang"] === "Custom") {
                        productType = "barang_custom_id";
                    } else if (item["Jenis Barang"] === "Packaging") {  
                        productType = "packaging_id";
                    } else {
                        productType = "packaging_id";
                    }

                    const hargaSatuan = typeof item["Harga Satuan"] === 'string' 
                        ? parseInt(item["Harga Satuan"].replace(/[^0-9.-]+/g, ""))
                        : parseInt(item["Harga Satuan"]);
    
                    const totalBiaya = typeof item["Total Biaya"] === 'string'
                        ? parseInt(item["Total Biaya"].replace(/[^0-9.-]+/g, ""))
                        : parseInt(item["Total Biaya"]);
    
                    return {
                        cabang_id: cabangId,
                        [productType]: item["Nama Produk"],
                        harga_satuan: hargaSatuan,
                        kuantitas: parseInt(item["Kuantitas"]),
                        total_biaya: totalBiaya
                    };
                });
            });
    
            const basePayload = {
                cash_or_non: selectBayar === 1 ? true : false,
                sub_total: parseInt(subtotal),
                diskon: parseInt(diskon),
                pajak: parseInt(pajak),
                catatan: note || '',
                total_pembelian: parseInt(totalPenjualan),
                produk: produkData,
            };

            let payload = basePayload;
            if (selectBayar === 1) {
                payload = {
                    ...basePayload,
                    metode_id: null
                };
            } else if (selectBayar === 2 && selectMetode?.value) {
                payload = {
                    ...basePayload,
                    metode_id: selectMetode.value
                };
            }
    
            const response = await api.put(`/pembelian/${pembelianId}`, payload);
            
            if (response.data.success) {
                setModalSucc(true);
            } else {
                throw new Error(response.data.message || 'Failed to update data');
            }
        } catch (error) {
            console.error('Error updating pembelian:', error);
            alert(error.response?.data?.message || 'Failed to update data');
        } finally {
            setLoading(false);
        }
    };

    const handleModalSucc = () => {
        if (fromLaporanKeuangan) {
            navigate('/laporanKeuangan');
        } else {
            navigate('/pembelianStok');
        }
    };

    useEffect(() => {
        if (data.catatan) {
            setNote(data.catatan);
        }
    }, [data.catatan])



    const handleCategoryChange = (kategoriNama) => {
        if (kategoriNama === 'Semua') {
            setSelectedCategoryId(null);
        } else {
            const found = categoriesList.find(cat => cat.nama_kategori_barang === kategoriNama);
            setSelectedCategoryId(found?.kategori_barang_id || null);
        }
        setModalCurrentPage(1);
        setSelectedCategory(kategoriNama);
    };



    useEffect(() => {
        setModalCurrentPage(1);
    }, [selectedJenis, selectedCategoryId, searchTerm, isModalOpen]);

    return (
        <>
            <LayoutWithNav menuItems={menuItems} userOptions={userOptions}>
                <div className="p-5">
                    <Breadcrumbs items={breadcrumbItems} />

                    <section className="bg-white p-5 mt-5 rounded-xl">
                        <form onSubmit={handleEditSubmit}>
                            <section>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <Input label={"Nomor"} type1={"text"} disabled={true} value={data.nomor} />
                                    <Input label={"Tanggal"} type1={"date"} value={data.tanggal} />
                                    <InputDropdown label={"Cash/Non-Cash"} options={dataBayar} value={dataBayar.find(opt => opt.value === selectBayar)?.value} onSelect={handleSelectBayar} />
                                    <div className="md:col-span-3 md:w-1/3">
                                        <InputDropdown 
                                            label={"Metode Pembayaran"} 
                                            disabled={isMetodeDisabled} 
                                            options={dataMetode || []}
                                            value={selectMetode?.value}
                                            onSelect={handleSelectMetode} 
                                        />
                                    </div>
                                </div>
                            </section>

                            <section className="pt-10">
                                {dataCabang.map((cabang, index) => (
                                    <div key={index} className="pt-5">
                                        <p className="font-bold">{cabang.nama}</p>
                                        <div className="pt-5">
                                            <Table headers={headers} data={tableData[index]} />
                                            <Button
                                                label="Tambah Baris"
                                                icon={
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                                                    </svg>
                                                }
                                                onClick={() => btnAddBaris(index)}
                                                bgColor=""
                                                hoverColor={`hover:border-${themeColor} hover:border`}
                                                textColor={`text-${themeColor}`}
                                            />
                                        </div>
                                    </div>
                                ))}
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
                                            value={pajak}
                                            showRequired={false}
                                            required={false}
                                            onChange={(e) => setPajak(e)}
                                        />
                                        </div>
                                    </div>
                                    <div className="flex justify-between border-b pb-2">
                                            <p className="font-bold">Total Pembelian</p>
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
                                                type="submit"
                                            />
                                        </div>
                                    </div>

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

                                    <div className="flex flex-wrap gap-2 mt-4">
                                        {categories.map((kategori) => (
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

                                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-2">
                                        <div className="text-xs sm:text-sm text-gray-500">
                                            Menampilkan {filteredItems.length === 0 ? 0 : ((modalCurrentPage - 1) * modalItemsPerPage + 1)}–{Math.min(modalCurrentPage * modalItemsPerPage, filteredItems.length)} dari {filteredItems.length} barang
                                        </div>
                                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                                            <span className="text-xs sm:text-sm">Tampilkan:</span>
                                            <select
                                                className="border rounded px-2 py-1 text-xs sm:text-sm"
                                                value={modalItemsPerPage}
                                                onChange={e => setModalItemsPerPage(Number(e.target.value))}
                                            >
                                                {[3, 12, 24, 48].map(num => (
                                                    <option key={num} value={num}>{num}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    <div className="mt-6 flex-1 min-h-0 overflow-y-auto no-scrollbar">
                                    <Gallery2
                                        items={modalItems}
                                        onSelect={handleSelectItem}
                                        selectedItems={selectedItems}
                                        showPagination={true}
                                        currentPage={modalCurrentPage}
                                        totalPages={modalTotalPages}
                                        totalItems={filteredItems.length}
                                        itemsPerPage={modalItemsPerPage}
                                        onPageChange={(page) => setModalCurrentPage(page)}
                                    />
                                    </div>
                                </div>
                            </section>
                        )}
                    </section>
                </div>
                {isModalDel && (
                    <Alert
                    title="Hapus Data"
                    description="Apakah kamu yakin ingin menghapus data ini?"
                    confirmLabel="Hapus"
                    cancelLabel="Kembali"
                    onConfirm={handleConfirmDel}
                    onCancel={handleCancelDel}
                    />
                )}

                {isModalSucc && (
                    <AlertSuccess
                    title="Berhasil!!"
                    description="Operasi data berhasil"
                    confirmLabel="Ok"
                    onConfirm={handleModalSucc}
                    />
                )}

                {isLoading && (
                    <Spinner/>
                )}
            </LayoutWithNav>
        </>
    );
}
