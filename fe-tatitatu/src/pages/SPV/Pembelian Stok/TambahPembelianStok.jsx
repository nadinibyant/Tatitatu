import { useEffect, useMemo, useState } from "react";
import Breadcrumbs from "../../../components/Breadcrumbs";
import Input from "../../../components/Input";
import Navbar from "../../../components/Navbar";
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
    const [nomor, setNomor] = useState("");
    const [tanggal, setTanggal] = useState(null);
    const [note, setNote] = useState("")
    const [selectBayar, setSelectedBayar] = useState("");
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
    const [searchTerm, setSearchTerm] = useState("");
    const [isLoading, setLoading] = useState(false)
    const [isModalSucc, setModalSucc] = useState(false)
    const [isMetodeDisabled, setIsMetodeDisabled] = useState(false);
    
    const [dataBarang, setDataBarang] = useState([]);
    const [kategoriList, setKategoriList] = useState([]);
    const [isLoadingBarang, setLoadingBarang] = useState(false);
    const [errorAlert, setErrorAlert] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [paymentMethods, setPaymentMethods] = useState([]);

    const fetchPaymentMethods = async () => {
        try {
            const response = await api.get('/metode-pembayaran');
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
            case "Barang Custom":
                return `${baseUrl}/images-barang-custom/${item.image}`;
            case "Packaging":
                return `${baseUrl}/images-packaging/${item.image}`;
            default:
                return '/placeholder-image.jpg';
        }
    };

    const fetchData = async () => {
        try {
            setLoadingBarang(true);
            const [handmadeRes, nonHandmadeRes, customRes, packagingRes, kategoriRes] = await Promise.all([
                api.get('/barang-handmade'),
                api.get('/barang-non-handmade'),
                api.get('/barang-custom'),
                api.get('/packaging'),
                api.get('/kategori-barang')
            ]);

            setKategoriList(kategoriRes.data.data.filter(k => !k.is_deleted));

            const formatItems = (items, type) => items.map(item => ({
                id: item[`${type}_id`],
                image: item.image,
                code: item[`${type}_id`],
                name: type === 'packaging' ? item.nama_packaging : item.nama_barang,
                price: type === 'packaging' ? item.harga_satuan : 
                       type === 'barang_custom' ? item.harga :
                       item.rincian_biaya[0]?.harga_jual || 0,
                kategori_id: item.kategori_barang_id || item.kategori_barang?.kategori_barang_id
            }));

            const handmadeData = {
                jenis: "Barang Handmade",
                items: formatItems(handmadeRes.data.data, 'barang_handmade')
            };

            const nonHandmadeData = {
                jenis: "Barang Non-Handmade",
                items: formatItems(nonHandmadeRes.data.data, 'barang_non_handmade')
            };

            const customData = {
                jenis: "Barang Custom",
                items: formatItems(customRes.data.data, 'barang_custom')
            };

            const packagingData = {
                jenis: "Packaging",
                items: formatItems(packagingRes.data.data, 'packaging')
            };

            setDataBarang([handmadeData, nonHandmadeData, customData, packagingData]);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoadingBarang(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const fetchCabang = async () => {
        try {
            setLoading(true);
            const response = await api.get('/cabang');
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
        if (selectedOption.value === 1) { 
            setSelectMetode(0); 
            setIsMetodeDisabled(true);
        } else {
            setSelectMetode(paymentMethods[1]?.value || 0);
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
        if (selectBayar === 1) { // Jika Cash
            setIsMetodeDisabled(true);
        } else if (selectBayar === 2) { // Jika Non-Cash
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

    const filteredItems = useMemo(() => {
        const selectedData = dataBarang.find((data) => data.jenis === selectedJenis);
        if (!selectedData) return [];

        return selectedData.items.filter(item => {
            const matchesCategory = selectedCategory === "Semua" || 
                                  item.kategori_id === parseInt(selectedCategory);
            const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
            return matchesCategory && matchesSearch;
        });
    }, [dataBarang, selectedJenis, selectedCategory, searchTerm]);


    const resetSelection = () => {
        setSelectedItems([]);
        setIsModalOpen(false);
    };

const handleModalSubmit = () => {
    if (activeCabang !== null) {
        const updatedCabang = [...dataCabang];
        const newItems = selectedItems.map(item => {
            const totalBiaya = parseInt(item.price) * item.count;
            const dropdownValue = item.id;
            const itemType = dataBarang.find(cat => 
                cat.items.find(i => i.id === item.id)
            )?.jenis;

            let typeSpecificId = {};
            console.log(itemType)
            switch(itemType) {
                case "Barang Handmade":
                    typeSpecificId = { barang_handmade_id: item.id };
                    break;
                case "Barang Non-Handmade":
                    typeSpecificId = { barang_non_handmade_id: item.id };
                    break;
                case "Barang Custom":
                    typeSpecificId = { barang_custom_id: item.id };
                    break;
                case "Packaging":
                    typeSpecificId = { packaging_id: item.id };
                    break;
            }

            return {
                ...typeSpecificId,
                id: item.id,
                No: updatedCabang[activeCabang].data.length + 1,
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
                        options={dataBarang.reduce((allItems, data) => {
                            const items = data.items.map(item => ({
                                label: item.name,
                                value: item.id,
                                jenis: data.jenis,
                                kategori: item.kategori,
                                image: item.image,
                                code: item.code
                            }));
                            return [...allItems, ...items];
                        }, [])}
                        value={dropdownValue}
                        onSelect={(newSelection) => {
                            let selectedItem = null;
                            let jenisBarang = '';
                            
                            for (const category of dataBarang) {
                                const found = category.items.find(i => i.id === newSelection.value);
                                if (found) {
                                    selectedItem = found;
                                    jenisBarang = category.jenis;
                                    break;
                                }
                            }

                            if (selectedItem) {
                                const updatedDataCabang = [...dataCabang];
                                const itemIndex = updatedDataCabang[activeCabang].data.findIndex(
                                    (data) => data.id === item.id
                                );

                                if (itemIndex !== -1) {
                                    const currentQuantity = updatedDataCabang[activeCabang].data[itemIndex].quantity || 0;
                                    const newTotalBiaya = selectedItem.price * currentQuantity;
                                    const newImageData = {
                                        imageUrl: getImageUrl(selectedItem, jenisBarang),
                                        image: selectedItem.image,
                                        itemType: jenisBarang
                                    };

                                    updatedDataCabang[activeCabang].data[itemIndex] = {
                                        ...updatedDataCabang[activeCabang].data[itemIndex],
                                        ...newImageData,
                                        "Foto Produk": (
                                            <div className="w-12 h-12 flex items-center justify-center">
                                                <img 
                                                    src={newImageData.imageUrl}
                                                    alt={selectedItem.name} 
                                                    className="w-full h-full object-cover rounded"
                                                    onError={(e) => {
                                                        e.target.src = '/placeholder-image.jpg';
                                                    }}
                                                />
                                            </div>
                                        ),
                                        "Jenis Barang": jenisBarang,
                                        "Harga Satuan": `Rp${selectedItem.price.toLocaleString()}`,
                                        rawHargaSatuan: selectedItem.price,
                                        rawTotalBiaya: newTotalBiaya,
                                        "Total Biaya": `Rp${newTotalBiaya.toLocaleString()}`,
                                    };

                                    setDataCabang(updatedDataCabang);
                                }
                            }
                        }}
                    />
                ),
                "Jenis Barang": itemType,
                "Harga Satuan": `Rp${item.price.toLocaleString()}`,
                rawHargaSatuan: item.price,
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
                                const newTotal = item.price * Number(newCount);
                                const updatedItem = {
                                    ...item,
                                    quantity: newCount,
                                    rawTotalBiaya: newTotal,
                                    "Total Biaya": `Rp${newTotal.toLocaleString()}`
                                };
                                updatedCabangCopy[activeCabang].data.push(updatedItem);
                            } else {
                                updatedCabangCopy[activeCabang].data[itemIndex].quantity = newCount;
                                const newTotal = item.price * Number(newCount);
                                updatedCabangCopy[activeCabang].data[itemIndex].rawTotalBiaya = newTotal;
                                updatedCabangCopy[activeCabang].data[itemIndex]["Total Biaya"] = `Rp${newTotal.toLocaleString()}`;
                            }
                            setDataCabang(updatedCabangCopy);
                        }}
                    />
                ),
                quantity: item.count,
                "Total Biaya": `Rp${totalBiaya.toLocaleString()}`,
                rawTotalBiaya: totalBiaya,
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


    const handleDeleteItem = (cabangIndex, itemId) => {
        const updatedCabang = [...dataCabang];
        updatedCabang[cabangIndex].data = updatedCabang[cabangIndex].data.filter(
            (item) => item.id !== itemId
        );
        setDataCabang(updatedCabang);
    };

    const dataBayar = [
        { id: 1, label: "Cash", value:1},
        { id: 2, label: "Non-Cash", value: 2}
    ]

    const dataMetode = [
        { id: 1, label: "-", value:1 },
        { id: 2, label: "Mandiri", value:2 },
        { id: 3, label: "Bank Nagari", value:3 }
    ]

    // const selectedBayarLabel = dataBayar.find(option => option.id === selectBayar)?.label || "";
    // const selectedMetodeLabel = dataMetode.find(option => option.id === selectMetode)?.label || "";

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

            // Format produk array
            const produk = dataCabang.flatMap(cabang => 
                cabang.data.map(item => {
                    const baseProduct = {
                        cabang_id: cabang.id,
                        harga_satuan: parseInt(item.rawHargaSatuan || item.price),
                        kuantitas: parseInt(item.quantity),
                        total_biaya: parseInt(item.rawTotalBiaya)
                    };
    
                    // Add specific product ID based on type
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
                metode_id: parseInt(selectMetode),
                sub_total: parseInt(calculateSubtotal()),
                diskon: parseInt(diskon),
                pajak: parseInt(pajak),
                total_pembelian: parseInt(calculateTotalPenjualan(calculateSubtotal())),
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
                                    dataCabang.map((cabang, index) => (
                                        <div key={cabang.id} className="pt-5">
                                            <p className="font-bold">{cabang.nama}</p>
                                            <div className="pt-5">
                                                <Table headers={headers} data={cabang.data} />
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
                                    ))
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
                                        <p className="font-bold">Pajak</p>
                                        <div className="w-30">
                                        <Input
                                            type="number"
                                            showRequired={false}
                                            value={pajak}
                                            required={true}
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

                                    {isLoadingBarang ? (
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
                                                            ? "bg-primary text-white" 
                                                            : "border border-gray-300"
                                                    }`}
                                                >
                                                    Semua
                                                </button>
                                                {kategoriList.map((kategori) => (
                                                    <button
                                                        key={kategori.kategori_barang_id}
                                                        onClick={() => setSelectedCategory(kategori.kategori_barang_id.toString())}
                                                        className={`px-3 py-1 text-sm md:text-base rounded-md ${
                                                            selectedCategory === kategori.kategori_barang_id.toString()
                                                                ? "bg-primary text-white"
                                                                : "border border-gray-300"
                                                        }`}
                                                    >
                                                        {kategori.nama_kategori_barang}
                                                    </button>
                                                ))}
                                            </div>

                                            {/* Gallery */}
                                            <div className="mt-6 h-[calc(100%-180px)] overflow-y-auto no-scrollbar">
                                                <Gallery2
                                                    items={filteredItems.map(item => ({
                                                        ...item,
                                                        image: getImageUrl(item, selectedJenis)
                                                    }))}
                                                    onSelect={handleSelectItem}
                                                    selectedItems={selectedItems}
                                                />
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
