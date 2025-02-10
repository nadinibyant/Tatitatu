import { useEffect, useState } from "react";
import Breadcrumbs from "../../../components/Breadcrumbs";
import Input from "../../../components/Input";
import Navbar from "../../../components/Navbar";
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

    const [nomor, setNomor] = useState(data.nomor || "");
    const [tanggal, setTanggal] = useState(data.tanggal || "");
    const [note, setNote] = useState(data.catatan || "");
    const [selectBayar, setSelectedBayar] = useState(data.pembayaran || "");
    const [diskon, setDiskon] = useState(data.diskon || 0);
    const [pajak, setPajak] = useState(data.pajak || 0);
    const [dataCabang, setDataCabang] = useState([]);
    const [categories, setCategories] = useState([]);
    const [dataBarang, setDataBarang] = useState([]);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [activeCabang, setActiveCabang] = useState(null);

    const [selectedCategory, setSelectedCategory] = useState("Semua");
    const [selectedJenis, setSelectedJenis] = useState("Barang Handmade");
    const [selectedItems, setSelectedItems] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [isModalDel, setModalDel] = useState(false)
    const [isModalSucc, setModalSucc] = useState(false)
    const [selectedRow, setSelectRow] = useState("")
    const [isLoading, setLoading] = useState(false)
    const [isMetodeDisabled, setIsMetodeDisabled] = useState(false);
    // const [cabangList, setCabangList] = useState([]);
    const [dataMetode, setDataMetode] = useState([]); 
    const [selectMetode, setSelectMetode] = useState({
        value: data.metode || 1,
        label: dataMetode.find(opt => opt.value === data.metode)?.label || "-"
    });

    useEffect(() => {
        const fetchPembelianData = async () => {
            try {
                setLoading(true)
                const response = await api.get(`/pembelian/${pembelianId}`); 
                const pembelianData = response.data.data;

                const isCash = pembelianData.cash_or_non;
                setSelectedBayar(isCash ? 1 : 2);

                setDiskon(pembelianData.diskon || 0);
                setPajak(pembelianData.pajak || 0);
    
                const groupedProducts = pembelianData.produk_pembelian.reduce((acc, product) => {
                    const cabangId = product.cabang_id;
                    if (!acc[cabangId]) {
                        acc[cabangId] = [];
                    }
                    acc[cabangId].push(product);
                    return acc;
                }, {});
    
                const transformedData = {
                    id: pembelianData.pembelian_id,
                    nomor: pembelianData.pembelian_id,
                    invoice: pembelianData.pembelian_id,
                    tanggal: pembelianData.tanggal.split('T')[0],
                    pembayaran: pembelianData.cash_or_non ? 1 : 2,
                    metode: pembelianData.metode_id,
                    dataCabang: await Promise.all(Object.entries(groupedProducts).map(async ([cabangId, products]) => {
                        const cabangResponse = await api.get(`/cabang/${cabangId}`);
                        return {
                            nama: cabangResponse.data.data.nama_cabang,
                            data: products.map((product, index) => {
                                let productData = product.barang_handmade || 
                                                product.barang_custom || 
                                                product.barang_non_handmade ||
                                                product.packaging;

                                let imagePath = '';
                                if (product.barang_handmade_id) {
                                    imagePath = 'images-barang-handmade';
                                } else if (product.barang_non_handmade_id) {
                                    imagePath = 'images-barang-non-handmade';
                                } else if (product.barang_custom_id) {
                                    imagePath = 'images-barang-custom';
                                } else if (product.packaging_id) {
                                    imagePath = 'images-packaging';
                                }
                                
                                return {
                                    id: product.produk_pembelian_id,
                                    No: index + 1,
                                    "Foto Produk": (
                                    <img 
                                        src={`${import.meta.env.VITE_API_URL}/${imagePath}/${productData.image}`}
                                        alt="Foto Produk" 
                                        className="w-12 h-12 object-cover rounded"
                                        onError={(e) => {
                                            e.target.src = 'https://via.placeholder.com/150';
                                        }}
                                    />
                                    ),
                                    "Nama Produk": product.barang_handmade_id || 
                                                product.barang_custom_id || 
                                                product.barang_non_handmade_id || 
                                                product.packaging_id,
                                    "Jenis Barang": productData.jenis_barang?.nama_jenis_barang ||
                                                (product.barang_handmade_id ? "Handmade" :
                                                product.barang_non_handmade_id ? "Barang Non-Handmade" :
                                                product.barang_custom_id ? "Barang Custom" :
                                                "Packaging"),
                                    "Harga Satuan": product.harga_satuan,
                                    "Kuantitas": product.kuantitas,
                                    "Total Biaya": product.total_biaya
                                };
                            })
                        };
                    })),
                    catatan: pembelianData.catatan || '',
                    subtotal: pembelianData.sub_total,
                    diskon: pembelianData.diskon,
                    pajak: pembelianData.pajak,
                    totalpenjualan: pembelianData.total_pembelian
                };
    
                setData(transformedData);
            } catch (error) {
                console.error('Error fetching pembelian data:', error);
            } finally {
                setLoading(false)
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
                const response = await api.get('/kategori-barang');
                if (response.data.success) {
                    const categoryList = response.data.data.map(cat => cat.nama_kategori_barang);
                    setCategories(['Semua', ...categoryList]);
                }
            } catch (error) {
                console.error('Error fetching categories:', error);
            }
        };
        fetchCategories();
    }, []);

    // Fetch all types of items
    useEffect(() => {
        const fetchAllItems = async () => {
            try {
                // Fetch handmade items
                const handmadeRes = await api.get('/barang-handmade');
                const handmadeItems = handmadeRes.data.data.map(item => ({
                    id: item.barang_handmade_id,
                    image: `${import.meta.env.VITE_API_URL}/images-barang-handmade/${item.image}`,
                    code: item.barang_handmade_id,
                    name: item.nama_barang,
                    price: item.rincian_biaya[0]?.harga_jual || 0,
                    kategori: item.kategori_barang.nama_kategori_barang
                }));

                // Fetch non-handmade items
                const nonHandmadeRes = await api.get('/barang-non-handmade');
                const nonHandmadeItems = nonHandmadeRes.data.data.map(item => ({
                    id: item.barang_non_handmade_id,
                    image: `${import.meta.env.VITE_API_URL}/images-barang-non-handmade/${item.image}`,
                    code: item.barang_non_handmade_id,
                    name: item.nama_barang,
                    price: item.rincian_biaya[0]?.harga_jual || 0,
                    kategori: item.kategori.nama_kategori_barang
                }));

                // Fetch custom items
                const customRes = await api.get('/barang-custom');
                const customItems = customRes.data.data.map(item => ({
                    id: item.barang_custom_id,
                    image: `${import.meta.env.VITE_API_URL}/images-barang-custom/${item.image}`,
                    code: item.barang_custom_id,
                    name: item.nama_barang,
                    price: item.harga,
                    kategori: item.kategori.nama_kategori_barang
                }));

                // Fetch packaging items
                const packagingRes = await api.get('/packaging');
                const packagingItems = packagingRes.data.data.map(item => ({
                    id: item.packaging_id,
                    image: `${import.meta.env.VITE_API_URL}/images-packaging/${item.image}`,
                    code: item.packaging_id,
                    name: item.nama_packaging,
                    price: item.harga,
                    kategori: item.kategori_barang.nama_kategori_barang
                }));

                setDataBarang([
                    {
                        jenis: "Barang Handmade",
                        kategori: categories,
                        items: handmadeItems
                    },
                    {
                        jenis: "Barang Non-Handmade",
                        kategori: categories,
                        items: nonHandmadeItems
                    },
                    {
                        jenis: "Barang Custom",
                        kategori: categories,
                        items: customItems
                    },
                    {
                        jenis: "Packaging",
                        kategori: categories,
                        items: packagingItems
                    }
                ]);
            } catch (error) {
                console.error('Error fetching items:', error);
            }
        };

        if (categories.length > 0) {
            fetchAllItems();
        }
    }, [categories]);

    useEffect(() => {
        const fetchMetodePembayaran = async () => {
            try {
                const response = await api.get('/metode-pembayaran');
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
                const response = await api.get('/cabang');
                if (response.data.success) {
                    // Buat array untuk semua cabang terlebih dahulu
                    const allCabang = response.data.data.map(cabang => ({
                        nama: cabang.nama_cabang,
                        data: [] // Inisialisasi dengan array kosong
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

    // data fix
    const [updateData, setUpdateData] = useState({})
    

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
        // logika delete
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

    // const [selectLabel, setSelectLabel] = useState(
    //     dataMetode.find(opt => opt.value === data.metode)?.label || "-"
    // );
    

    useEffect(() => {
        if (data.pembayaran) {
            setSelectedBayar(data.pembayaran); 
        }
    }, [data.pembayaran]);

    // useEffect(() => {
    //     if (selectBayar === 1) {
    //         setSelectMetode(dataMetode[0].id);
    //         setSelectLabel(dataMetode[0].label) 

    //     } else if (selectBayar === 2) {
    //         setSelectMetode(dataMetode[1].id); 
    //         setSelectLabel(dataMetode[1].label)
    //     }
    // }, [selectBayar]);  
    
    const handleSelectBayar = (selectedOption) => {
        setSelectedBayar(selectedOption.value);
        
        if (!dataMetode || dataMetode.length === 0) return;
    
        if (selectedOption.value === 1) { // Cash
            setSelectMetode({
                value: null,
                label: "-"
            });
            setIsMetodeDisabled(true);
        } else { // Non-Cash
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


    const breadcrumbItems = [
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

    // const dataBarang = [
    //     {
    //         jenis: "Barang Handmade",
    //         kategori: ["Semua", "Gelang", "Anting-Anting", "Cincin"],
    //         items: [
    //             { id: 1, image: "https://via.placeholder.com/150", code: "MMM453", name: "Gelang Barbie 123", price: 10000, kategori: "Gelang" },
    //             { id: 2, image: "https://via.placeholder.com/150", code: "MMM454", name: "Anting Keren 123", price: 15000, kategori: "Anting-Anting" },
    //             { id: 3, image: "https://via.placeholder.com/150", code: "MMM455", name: "Cincin Cantik 123", price: 20000, kategori: "Cincin" },
    //             { id: 4, image: "https://via.placeholder.com/150", code: "MMM456", name: "Gelang Modern", price: 12000, kategori: "Gelang" },
    //         ],
    //     },
    //     {
    //         jenis: "Barang Non-Handmade",
    //         kategori: ["Semua", "Kalung", "Topi", "Tas"],
    //         items: [
    //             { id: 5, image: "https://via.placeholder.com/150", code: "MMM457", name: "Kalung Emas", price: 50000, kategori: "Kalung" },
    //             { id: 6, image: "https://via.placeholder.com/150", code: "MMM458", name: "Topi Keren", price: 30000, kategori: "Topi" },
    //             { id: 7, image: "https://via.placeholder.com/150", code: "MMM459", name: "Tas Ransel", price: 100000, kategori: "Tas" },
    //             { id: 8, image: "https://via.placeholder.com/150", code: "MMM460", name: "Kalung Perak", price: 45000, kategori: "Kalung" },
    //         ],
    //     },
    //     {
    //         jenis: "Barang Custom",
    //         kategori: ["Semua", "Kalung", "Topi", "Tas"],
    //         items: [
    //             { id: 5, image: "https://via.placeholder.com/150", code: "MMM457", name: "Kalung Emas", price: 50000, kategori: "Kalung" },
    //             { id: 6, image: "https://via.placeholder.com/150", code: "MMM458", name: "Topi Keren", price: 30000, kategori: "Topi" },
    //             { id: 7, image: "https://via.placeholder.com/150", code: "MMM459", name: "Tas Ransel", price: 100000, kategori: "Tas" },
    //             { id: 8, image: "https://via.placeholder.com/150", code: "MMM460", name: "Kalung Perak", price: 45000, kategori: "Kalung" },
    //         ],
    //     },
    //     {
    //         jenis: "Packaging",
    //         kategori: ["Semua", "Kalung", "Topi", "Tas"],
    //         items: [
    //             { id: 9, image: "https://via.placeholder.com/150", code: "MMM457", name: "Zipper", price: 20000, kategori: "Kalung" },
    //             { id: 10, image: "https://via.placeholder.com/150", code: "MMM458", name: "Plastik", price: 30000, kategori: "Topi" },
    //         ],
    //     }
    // ];

    const filteredItemsBarang = dataBarang
    .flatMap(item => item.items)
    .map(item => ({
        label: item.name,
        value: item.id,
        price: item.price,   
        jenis: item.jenis,
        kategori: item.kategori,
        image: item.image
    }));

    const handleChange = (selectedOption, cabangIndex, itemIndex, field) => {
        const updatedDataCabang = [...dataCabang];
        const item = updatedDataCabang[cabangIndex].data[itemIndex];
    
        if (item) {
            if (field === "Nama Produk") {
                const selectedItem = dataBarang
                    .flatMap(data => data.items)
                    .find(item => item.id === selectedOption.value);
    
                if (selectedItem) {
                    const jenisBarang = dataBarang.find(data => 
                        data.items.some(i => i.id === selectedItem.id)
                    )?.jenis;

                    let imagePath = '';
                    switch (jenisBarang) {
                        case 'Barang Handmade':
                            imagePath = 'images-barang-handmade';
                            break;
                        case 'Barang Non-Handmade':
                            imagePath = 'images-barang-non-handmade';
                            break;
                        case 'Barang Custom':
                            imagePath = 'images-barang-custom';
                            break;
                        case 'Packaging':
                            imagePath = 'images-packaging';
                            break;
                    }
    
                    updatedDataCabang[cabangIndex].data[itemIndex] = {
                        ...item,
                        "Nama Produk": selectedOption.value,
                        "Jenis Barang": jenisBarang,
                        "Harga Satuan": selectedItem.price,
                        "Total Biaya": selectedItem.price * item.Kuantitas,
                        "Foto Produk": (
                            <img 
                                src={`${import.meta.env.VITE_API_URL}/${imagePath}/${selectedItem.image.split('/').pop()}`}
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
            if (dataBarang.length === 0) return {};
            const selectedItem = dataBarang
            .flatMap(d => d.items)
            .find(p => p.id === item["Nama Produk"]);
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
        
    const filteredItems = dataBarang
        .find((data) => data.jenis === selectedJenis)
        ?.items.filter(
            (item) =>
                (selectedCategory === "Semua" || item.kategori === selectedCategory) &&
                item.name.toLowerCase().includes(searchTerm.toLowerCase())
        );

    const resetSelection = () => {
        setSelectedItems([]);
        setIsModalOpen(false);
    };

    const handleModalSubmit = () => {
        if (activeCabang !== null) {
            const updatedCabang = [...dataCabang];
            const newItems = selectedItems.map((item) => {
                let jenisBarang;
                if (dataBarang.find(category => category.jenis === "Barang Handmade")?.items.find(i => i.id === item.id)) {
                    jenisBarang = "Handmade";
                } else if (dataBarang.find(category => category.jenis === "Barang Non-Handmade")?.items.find(i => i.id === item.id)) {
                    jenisBarang = "Barang Non-Handmade";
                } else if (dataBarang.find(category => category.jenis === "Barang Custom")?.items.find(i => i.id === item.id)) {
                    jenisBarang = "Barang Custom";
                } else {
                    jenisBarang = "Packaging";
                }
    
                return {
                    id: item.id,
                    No: updatedCabang[activeCabang].data.length + 1,
                    "Foto Produk": (
                        <img src={item.image} alt={item.name} className="w-12 h-12" />
                    ),
                    "Nama Produk": item.id,
                    "Jenis Barang": jenisBarang, 
                    "Harga Satuan": item.price,
                    Kuantitas: item.count,
                    "Total Biaya": parseInt(item.price) * item.count,
                    Aksi: (
                        <button
                            className="text-red-500 hover:text-red-700"
                            onClick={() => handleDeleteItem(activeCabang, item.id, true)}
                        >
                            Hapus
                        </button>
                    ),
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
    

    useEffect(() => {
        const updatedData = {
            ...data,
            nomor,  
            tanggal,  
            pembayaran: selectBayar, 
            metode: selectMetode,  
            dataCabang,  
            catatan: note
        };
        setUpdateData(updatedData)
    }, [nomor, tanggal, selectBayar, selectMetode, dataCabang]); 

    const navigate = useNavigate()

    const handleEditSubmit = async (event) => {
        event.preventDefault();
        try {
            setLoading(true);
    
            const cabangResponse = await api.get('/cabang');
            const cabangList = cabangResponse.data.data;
    
            const produkData = dataCabang.flatMap(cabang => {
                const cabangId = parseInt(cabangList.find(c => c.nama_cabang === cabang.nama)?.cabang_id);
    
                return cabang.data.map(item => {
                    let productId;
                    let productType;

                    if (item["Jenis Barang"] === "Handmade") {
                        productType = "barang_handmade_id";
                    } else if (item["Jenis Barang"] === "Barang Non-Handmade") {
                        productType = "barang_non_handmade_id";
                    } else if (item["Jenis Barang"] === "Barang Custom") {
                        productType = "barang_custom_id";
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
                cash_or_non: selectBayar === 1,
                sub_total: parseInt(subtotal),
                diskon: parseInt(diskon),
                pajak: parseInt(pajak),
                catatan: note || '',
                total_pembelian: parseInt(totalPenjualan),
                produk: produkData
            };

            const payload = selectBayar === 2 
                ? { ...basePayload, metode_id: parseInt(selectMetode?.value) }
                : basePayload;
    
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
        navigate('/pembelianStok')
    }

    useEffect(() => {
        if (data.catatan) {
            setNote(data.catatan);
        }
    }, [data.catatan])


    return (
        <>
            <LayoutWithNav menuItems={menuItems} userOptions={userOptions}>
                <div className="p-5">
                    <Breadcrumbs items={breadcrumbItems} />

                    {/* Section Form Input */}
                    <section className="bg-white p-5 mt-5 rounded-xl">
                        <form onSubmit={handleEditSubmit}>
                            <section>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <Input label={"Nomor"} type1={"text"} disabled={true} value={data.nomor} onChange={(e) => setNomor(e)} />
                                    <Input label={"Tanggal"} type1={"date"} value={data.tanggal} onChange={(e) => setTanggal(e)} />
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

                            {/* Section Tambah Data Per Cabang */}
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
                                                hoverColor="hover:border-primary hover:border"
                                                textColor="text-primary"
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
                                            value={diskon}
                                            required={false}
                                            onChange={(e) => setDiskon(e)}
                                        />
                                        </div>
                                    </div>
                                    {/* Pajak */}
                                    <div className="flex justify-between items-center border-b pb-2">
                                        <p className="font-bold">Pajak</p>
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
                                    {/* Total Penjualan */}
                                    <div className="flex justify-between border-b pb-2">
                                            <p className="font-bold">Total Penjualan</p>
                                            <p className="font-bold">Rp{totalPenjualan.toLocaleString()}</p>
                                        </div>
                                    {/* Tombol Simpan */}
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

                        {/* Modal Tambah Baris */}
                        {isModalOpen && (
                            <section className="fixed inset-0 bg-white bg-opacity-80 flex justify-center items-center z-50">
                                <div className="bg-white border border-primary rounded-md p-6 w-[90%] md:w-[70%] h-[90%] overflow-hidden">
                                    {/* Input Search */}
                                    <div className="flex flex-wrap md:flex-nowrap items-center justify-between mb-4 gap-4">
                                        <div className="relative w-full max-w-md flex-shrink-0">
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

                                        {/* Clear and Selected Count */}
                                        <div className="flex items-center space-x-4 flex-shrink-0">
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
                                            <p className="text-primary font-semibold">
                                                Terpilih {selectedItems.reduce((sum, item) => sum + item.count, 0)}
                                            </p>
                                        </div>

                                        {/* Buttons */}
                                        <div className="flex flex-wrap md:flex-nowrap gap-4 flex-shrink-0">
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
                                                bgColor="bg-primary"
                                                hoverColor="hover:bg-opacity-90"
                                                textColor="text-white"
                                                onClick={handleModalSubmit}
                                                type="submit"
                                            />
                                        </div>
                                    </div>

                                    {/* Tabs for Barang Types */}
                                    <div className="flex border-b border-gray-300 mb-4">
                                        {["Barang Handmade", "Barang Non-Handmade", "Barang Custom", "Packaging"].map((jenis) => (
                                            <button
                                                key={jenis}
                                                onClick={() => setSelectedJenis(jenis)}
                                                className={`px-4 py-2 text-sm font-semibold ${
                                                    selectedJenis === jenis ? "text-primary border-b-2 border-primary" : "text-gray-400"
                                                }`}
                                            >
                                                {jenis}
                                            </button>
                                        ))}
                                    </div>

                                    {/* Kategori Buttons */}
                                    <div className="flex flex-wrap gap-2 mt-4">
                                        {dataBarang
                                            .find((data) => data.jenis === selectedJenis)
                                            ?.kategori.map((kategori) => (
                                                <button
                                                    key={kategori}
                                                    onClick={() => setSelectedCategory(kategori)}
                                                    className={`px-3 py-1 text-sm md:text-base rounded-md ${
                                                        selectedCategory === kategori
                                                            ? "bg-primary text-white"
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
                                        />
                                    </div>
                                </div>
                            </section>
                        )}
                    </section>
                </div>
                {/* modal delete */}
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

                {/* modal success */}
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
