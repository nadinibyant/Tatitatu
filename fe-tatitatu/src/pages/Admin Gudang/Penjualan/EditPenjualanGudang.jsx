import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
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

export default function EditPenjualanGudang() {
    const { id } = useParams();
    const [nomor, setNomor] = useState("");
    const [tanggal, setTanggal] = useState(null);
    const [namaPembeli, setNamaPembeli] = useState("");
    const [note, setNote] = useState("");
    const [selectBayar, setSelectedBayar] = useState("");
    const [selectMetode, setSelectMetode] = useState("");
    const [diskon, setDiskon] = useState(0);
    const [pajak, setPajak] = useState(0);
    const [itemData, setItemData] = useState([]);
    const [packagingData, setPackagingData] = useState([]);
    const [hasPackaging, setHasPackaging] = useState(false);
    const [dataPackaging, setDataPackaging] = useState([]);

    const userData = JSON.parse(localStorage.getItem('userData'));
    const isAdminGudang = userData?.role === 'admingudang';

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
    const [isPackagingModalOpen, setIsPackagingModalOpen] = useState(false);
    const [selectedPackagingItems, setSelectedPackagingItems] = useState([]);

    useEffect(() => {
        const fetchPenjualan = async () => {
            try {
                setLoading(true);
                const response = await api.get(`/penjualan-gudang/${id}`);
                const data = response.data.data;
                
                setNomor(data.nomor);
                setTanggal(data.tanggal);
                setNamaPembeli(data.nama_pembeli);
                setNote(data.catatan);
                setSelectedBayar(data.jenis_pembayaran);
                setSelectMetode(data.metode_id);
                setDiskon(data.diskon);
                setPajak(data.pajak);
                
                const formattedItems = data.items.map((item, index) => ({
                    id: item.barang_id,
                    No: index + 1,
                    "Foto Produk": (
                        <img src={item.image} alt={item.nama_barang} className="w-12 h-12" />
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
                            value={item.barang_id}
                            onSelect={(newSelection) => handleDropdownChange(item.barang_id, newSelection)}
                        />
                    ),
                    "Jenis Barang": item.jenis_barang,
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
                    "Total Biaya": `Rp${(item.harga_satuan * item.kuantitas).toLocaleString()}`,
                    rawTotalBiaya: item.harga_satuan * item.kuantitas,
                    currentPrice: item.harga_satuan
                }));
                setItemData(formattedItems);

                if (data.packaging) {
                    const formattedPackaging = {
                        id: data.packaging.packaging_id,
                        No: 1,
                        "Foto Packaging": (
                            <img src={data.packaging.image} alt={data.packaging.nama_packaging} className="w-12 h-12" />
                        ),
                        "Nama Packaging": (
                            <InputDropdown
                                showRequired={false}
                                options={dataPackaging.map(pack => ({
                                    label: pack.name,
                                    value: pack.id,
                                    price: pack.price
                                }))}
                                value={data.packaging.packaging_id}
                                onSelect={(newSelection) => handlePackagingDropdownChange(data.packaging.packaging_id, newSelection)}
                            />
                        ),
                        "Harga Satuan": `Rp${data.packaging.harga_satuan.toLocaleString()}`,
                        "Kuantitas": (
                            <Input
                                showRequired={false}
                                type="number"
                                value={data.packaging.kuantitas}
                                onChange={(newCount) => handlePackagingQuantityChange(data.packaging.packaging_id, newCount)}
                            />
                        ),
                        quantity: data.packaging.kuantitas,
                        "Total Biaya": `Rp${(data.packaging.harga_satuan * data.packaging.kuantitas).toLocaleString()}`,
                        rawTotalBiaya: data.packaging.harga_satuan * data.packaging.kuantitas,
                        currentPrice: data.packaging.harga_satuan
                    };
                    setPackagingData([formattedPackaging]);
                    setHasPackaging(true);
                }
            } catch (error) {
                console.error("Error fetching penjualan:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchPenjualan();
    }, [id]);

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
                
                const [nonHandmadeRes, mentahRes, jenisRes, packagingRes] = await Promise.all([
                    api.get('/barang-nonhandmade-gudang'),
                    api.get('/barang-mentah'),
                    api.get('/jenis-barang-gudang'),
                    api.get('/packaging-gudang')
                ]);

                if (packagingRes.data.success) {
                    const packagingItems = packagingRes.data.data.map(item => ({
                        id: item.packaging_id.toString(),
                        image: item.image || "https://via.placeholder.com/150",
                        name: item.nama_packaging,
                        ukuran: item.ukuran,
                        price: item.harga_satuan,
                        stok: item.jumlum_minimum_stok
                    }));
                    setDataPackaging(packagingItems);
                }

                const jenisBarangData = jenisRes.data.data.filter(j => j.nama_jenis_barang !== "Packaging");
                setJenisBarang(jenisBarangData.map(j => `Barang ${j.nama_jenis_barang}`));

                const dataByJenis = {};
                jenisBarangData.forEach(jenis => {
                    dataByJenis[jenis.jenis_barang_id] = {
                        jenis: `Barang ${jenis.nama_jenis_barang}`,
                        items: []
                    };
                });

                nonHandmadeRes.data.data.forEach(item => {
                    const jenisId = item.jenis_barang_id;
                    if (dataByJenis[jenisId]) {
                        dataByJenis[jenisId].items.push({
                            id: item.barang_id.toString(),
                            image: item.image || "https://via.placeholder.com/150",
                            name: item.nama_barang,
                            price: item.harga_jual,
                            kategori: item.kategori?.nama_kategori_barang,
                            code: item.barang_id.toString()
                        });
                    }
                });

                Object.values(dataByJenis).forEach(jenis => {
                    if (jenis.jenis !== "Barang Mentah") {
                        const categories = [...new Set(jenis.items.map(item => item.kategori))];
                        jenis.kategori = ["Semua", ...categories];
                    }
                });

                const mentahJenis = jenisBarangData.find(j => j.nama_jenis_barang === "Mentah");
                if (mentahJenis) {
                    dataByJenis[mentahJenis.jenis_barang_id].items = mentahRes.data.data.map(item => ({
                        id: item.barang_mentah_id.toString(),
                        image: item.image || "https://via.placeholder.com/150",
                        name: item.nama_barang,
                        price: item.harga,
                        code: item.barang_mentah_id.toString()
                    }));
                }

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
    };

    const handlePackagingModalSubmit = () => {
        const newItems = selectedPackagingItems.map((item) => {
            const totalBiaya = parseInt(item.price) * item.count;
            const dropdownValue = {
                label: item.name,
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
                            label: pack.name,
                            value: pack.id,
                            price: pack.price
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
        const updatedData = [...packagingData];
        const rowIndex = updatedData.findIndex((row) => row.id === itemId);
        
        if (rowIndex !== -1) {
            const selectedItem = packagingData.find(item => item.id === nextSelection.value);
            
            if (selectedItem) {
                const currentQuantity = updatedData[rowIndex].quantity || 0;
                const newTotalBiaya = selectedItem.price * currentQuantity;
                
                updatedData[rowIndex] = {
                    ...updatedData[rowIndex],
                    id: selectedItem.id,
                    quantity: currentQuantity,
                    "Foto Packaging": (
                        <img src={selectedItem.image} alt={selectedItem.name} className="w-12 h-12" />
                    ),
                    "Nama Packaging": (
                        <InputDropdown
                            showRequired={false}
                            options={packagingData.map(pack => ({
                                label: pack.name,
                                value: pack.id,
                                price: pack.price
                            }))}
                            value={nextSelection.value}
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
                    "Total Biaya": `Rp${newTotalBiaya.toLocaleString()}`,
                    rawTotalBiaya: newTotalBiaya,
                    currentPrice: selectedItem.price
                };
                
                setPackagingData(updatedData);
            }
        }
    };

    const handlePackagingQuantityChange = (itemId, newCount) => {
        const updatedData = [...packagingData];
        const rowIndex = updatedData.findIndex((row) => row.id === itemId);

        if (rowIndex !== -1) {
            const currentItem = updatedData[rowIndex];
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
                        onChange={(newValue) => handlePackagingQuantityChange(itemId, newValue)}
                    />
                )
            };
            setPackagingData(updatedData);
        }
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
            const totalBiaya = parseInt(item.price) * item.count;
            const dropdownValue = {
                label: item.name,
                value: item.id,
                price: item.price
            };
            
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
                        value={dropdownValue.value}
                        onSelect={(newSelection) => handleDropdownChange(item.id, newSelection)}
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
                currentPrice: item.price
            };
        });

        setItemData([...itemData, ...newItems]);
        setIsModalOpen(false);
        setSelectedItems([]);
    };

    const handleDropdownChange = (itemId, nextSelection) => {
        const updatedData = [...itemData];
        const rowIndex = updatedData.findIndex((row) => row.id === itemId);
     
        if (rowIndex !== -1) {
            const selectedItem = dataBarang.reduce((found, category) => {
                if (found) return found;
                return category.items.find(item => item.id === nextSelection.value);
            }, null);
     
            if (selectedItem) {
                const jenisBarang = dataBarang.find(cat => 
                    cat.items.some(i => i.id === selectedItem.id)
                )?.jenis;
                
                const currentQuantity = updatedData[rowIndex].quantity || 0;
                const newTotalBiaya = selectedItem.price * currentQuantity;
                
                updatedData[rowIndex] = {
                    ...updatedData[rowIndex],
                    id: selectedItem.id,
                    "Foto Produk": (
                        <img src={selectedItem.image} alt={selectedItem.name} className="w-12 h-12" />
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
                            value={nextSelection.value}
                            onSelect={(newSelection) => handleDropdownChange(itemId, newSelection)}
                        />
                    ),
                    "Jenis Barang": jenisBarang,
                    "Harga Satuan": `Rp${selectedItem.price.toLocaleString()}`,
                    "Total Biaya": `Rp${newTotalBiaya.toLocaleString()}`,
                    rawTotalBiaya: newTotalBiaya,
                    currentPrice: selectedItem.price,
                    quantity: currentQuantity
                };
                
                setItemData(updatedData);
            }
        }
    };

    const handleQuantityChange = (itemId, newCount) => {
        const updatedData = [...itemData];
        const rowIndex = updatedData.findIndex((row) => row.id === itemId);

        if (rowIndex !== -1) {
            const currentItem = updatedData[rowIndex];
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
            setItemData(updatedData);
        }
    };

    const handleDeleteItem = (itemId) => {
        setItemData(prev => prev.filter(item => item.id !== itemId));
    };

    const calculateSubtotal = () => {
        return itemData.reduce((acc, row) => acc + (row.rawTotalBiaya || 0), 0);
    };

    const calculateTotalPenjualan = (subtotal) => {
        const diskonNominal = (diskon / 100) * subtotal;
        return subtotal - diskonNominal - pajak;
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
        { id: 1, label: "Cash" },
        { id: 2, label: "Non-Cash" }
    ];

    const subtotal = calculateSubtotal();
    const totalPenjualan = calculateTotalPenjualan(subtotal);
    const navigate = useNavigate();

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            
            const formData = {
                nomor,
                tanggal,
                nama_pembeli: namaPembeli,
                jenis_pembayaran: selectBayar,
                metode_id: selectMetode,
                catatan: note,
                diskon,
                pajak,
                items: itemData.map(item => ({
                    barang_id: item.id,
                    kuantitas: item.quantity,
                    harga_satuan: item.currentPrice
                })),
                packaging: packagingData.length > 0 ? {
                    packaging_id: packagingData[0].id,
                    kuantitas: packagingData[0].quantity,
                    harga_satuan: packagingData[0].currentPrice
                } : null
            };

            await api.put(`/penjualan-gudang/${id}`, formData);
            setModalSucc(true);
        } catch (error) {
            console.error("Error updating penjualan:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAcc = () => {
        setModalSucc(false);
        navigate('/penjualan-admin-gudang');
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
                                    <Input label={"Nomor"} type1={"text"} value={nomor} onChange={(e) => setNomor(e)} />
                                    <Input label={"Tanggal"} type1={"date"} value={tanggal} onChange={(e) => setTanggal(e)} />
                                    <Input label={"Nama Pembeli"} value={namaPembeli} onChange={(e) => setNamaPembeli(e)} />
                                    <InputDropdown 
                                        label={"Cash/Non-Cash"} 
                                        options={dataBayar.map(option => ({
                                            label: option.label,
                                            value: option.id
                                        }))} 
                                        value={selectBayar}
                                        onSelect={handleSelectBayar}
                                    />
                                    <div>
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
                                        hoverColor="hover:border-primary hover:border"
                                        textColor="text-primary"
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
                                            hoverColor="hover:border-primary hover:border"
                                            textColor="text-primary"
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
                    </section>

                    {/* Modal Tambah Baris */}
                    {isModalOpen && (
                        <section className="fixed inset-0 bg-white bg-opacity-80 flex justify-center items-center z-50">
                            <div className="bg-white border border-primary rounded-md p-6 w-[90%] md:w-[70%] h-[90%] overflow-hidden">
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
                                        <p className="text-primary font-semibold">
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
                                            bgColor="bg-primary"
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
                                                selectedJenis === jenis ? "text-primary border-b-2 border-primary" : "text-gray-400"
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
                                                            ? "bg-primary text-white"
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
                                        items={filteredItems || []}
                                        onSelect={handleSelectItem}
                                        selectedItems={selectedItems}
                                    />
                                </div>
                            </div>
                        </section>
                    )}

                    {/* Modal Tambah Baris */}
                    {isPackagingModalOpen && (
                        <section className="fixed inset-0 bg-white bg-opacity-80 flex justify-center items-center z-50">
                            <div className="bg-white border border-primary rounded-md p-6 w-[90%] md:w-[70%] h-[90%] overflow-hidden">
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
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="w-full border border-gray-300 rounded-md py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-gray-500"
                                        />
                                    </div>

                                    <div className="flex items-center space-x-4 flex-shrink-0">
                                        <button
                                            onClick={() => {
                                                setSearchTerm("");
                                                setSelectedPackagingItems([]);
                                            }}
                                            className="text-gray-400 hover:text-gray-700 focus:outline-none"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                        <p className="text-primary font-semibold">
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
                                            bgColor="bg-primary"
                                            hoverColor="hover:bg-opacity-90"
                                            textColor="text-white"
                                            onClick={handlePackagingModalSubmit}
                                        />
                                    </div>
                                </div>

                                <div className="mt-6 h-[calc(100%-180px)] overflow-y-auto no-scrollbar">
                                    <Gallery2
                                        items={dataPackaging.filter(item => 
                                            item.name.toLowerCase().includes(searchTerm.toLowerCase())
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
            </LayoutWithNav>
        </>
    );
}
  
                                        