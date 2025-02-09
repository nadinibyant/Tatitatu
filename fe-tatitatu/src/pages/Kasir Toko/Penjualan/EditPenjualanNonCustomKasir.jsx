import { useEffect, useState } from "react";
import Breadcrumbs from "../../../components/Breadcrumbs";
import Input from "../../../components/Input";
import Navbar from "../../../components/Navbar";
import InputDropdown from "../../../components/InputDropdown";
import Table from "../../../components/Table";
import Button from "../../../components/Button";
import Gallery2 from "../../../components/Gallery2";
import TextArea from "../../../components/Textarea";
import { useNavigate } from "react-router-dom";
import AlertSuccess from "../../../components/AlertSuccess";
import Spinner from "../../../components/Spinner";
import LayoutWithNav from "../../../components/LayoutWithNav";

export default function EditPenjualanNonCustomKasir() {
    const [nomor, setNomor] = useState("");
    const [tanggal, setTanggal] = useState(null);
    const [namaPembeli, setNamaPembeli] = useState("");
    const [note, setNote] = useState("");
    const [selectBayar, setSelectedBayar] = useState("");
    const [selectMetode, setSelectMetode] = useState("");
    const [diskon, setDiskon] = useState(0);
    const [pajak, setPajak] = useState(0);
    const [dataCabang, setDataCabang] = useState([
        { nama: "Cabang Utama", data: [] },
    ]);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [activeCabang, setActiveCabang] = useState(null);
    const [resetSignal, setResetSignal] = useState(false);

    // Modal gallery state
    const [selectedCategory, setSelectedCategory] = useState("Semua");
    const [selectedJenis, setSelectedJenis] = useState("Barang Handmade");
    const [selectedItems, setSelectedItems] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [isLoading, setLoading] = useState(false);
    const [isModalSucc, setModalSucc] = useState(false);
    const [isMetodeDisabled, setIsMetodeDisabled] = useState(false);
    const userData = JSON.parse(localStorage.getItem('userData'));
    const isAdminGudang = userData?.role === 'admingudang';

    const existingData = {
        nomor: 'INV123',
        tanggal: '2024-01-07',
        nama_pembeli: 'Suryani',
        bayar: 'Cash',
        metode: '-',
        note: 'Catatan penting mengenai transaksi ini',
        data_produk: [
            {
                id: 1,
                "Foto Produk": "https://via.placeholder.com/150",
                "Nama Produk": "Gelang Cantik",
                "Jenis Barang": "Barang Handmade",
                "Harga Satuan": 15000,
                "kuantitas": 10,
                "Total Biaya": 150000,
                "rawTotalBiaya": 150000
            }
        ],
        diskon: 30,
        pajak: 1000
    };

    useEffect(() => {
        if (existingData) {
            // Set nilai-nilai dasar
            setNomor(existingData.nomor);
            setTanggal(existingData.tanggal);
            setNamaPembeli(existingData.nama_pembeli);
            setNote(existingData.note);
            setDiskon(existingData.diskon);
            setPajak(existingData.pajak);
    
            // Set pembayaran
            const bayarOption = dataBayar.find(opt => opt.label === existingData.bayar);
            if (bayarOption) {
                setSelectedBayar(bayarOption.id);
            }
    
            // Set metode pembayaran
            const metodeOption = dataMetode.find(opt => opt.label === existingData.metode);
            if (metodeOption) {
                setSelectMetode(metodeOption.id);
            }
    
            // Set data produk ke dalam tabel
            const initialDataCabang = [{
                nama: "Cabang Utama",
                data: existingData.data_produk.map((item, index) => ({
                    id: item.id,
                    No: index + 1,
                    "Foto Produk": (
                        <img
                            src={item["Foto Produk"]}
                            alt={item["Nama Produk"]}
                            className="w-12 h-12"
                        />
                    ),
                    "Nama Produk": (
                        <InputDropdown
                            showRequired={false}
                            options={dataBarang.reduce((allItems, data) => {
                                const items = data.items.map(item => ({
                                    label: item.name,
                                    value: item.price,
                                    jenis: data.jenis,
                                    kategori: item.kategori,
                                    image: item.image,
                                    code: item.code,
                                    id: item.id
                                }));
                                return [...allItems, ...items];
                            }, [])}
                            value={item["Nama Produk"]}
                            onSelect={(newSelection) => handleDropdownChange(item.id, newSelection)}
                        />
                    ),
                    "Jenis Barang": item["Jenis Barang"],
                    "Harga Satuan": `Rp${item["Harga Satuan"].toLocaleString('id-ID')}`,
                    "Kuantitas": (
                        <Input
                            showRequired={false}
                            type="number"
                            value={item.kuantitas}
                            onChange={(newCount) => handleQuantityChange(item.id, newCount)}
                        />
                    ),
                    "Total Biaya": `Rp${item["Total Biaya"].toLocaleString('id-ID')}`,
                    rawTotalBiaya: item["Total Biaya"],
                    quantity: item.kuantitas,
                    currentPrice: item["Harga Satuan"],
                    Aksi: (
                        <button
                            className="text-red-500 hover:text-red-700"
                            onClick={() => handleDeleteItem(0, item.id)}
                        >
                            Hapus
                        </button>
                    ),
                }))
            }];
    
            setDataCabang(initialDataCabang);
        }
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
            // Jumlahkan rawTotalBiaya dari setiap cabang
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
        setSelectedBayar(selectedOption.id); 
        if (selectedOption.id === 2) { 
            setSelectMetode(dataMetode[1].id); 
        } else {
            setSelectMetode(dataMetode[0].id); 
        }
    };

    const handleSelectMetode = (value) => {
        setSelectMetode(value);
    };
    
    const breadcrumbItems = isAdminGudang 
    ? [
        { label: "Daftar Penjualan Toko", href: "/penjualan-admin-gudang" },
        { label: "Edit Penjualan", href: "" },
    ]
    : [
        { label: "Daftar Penjualan Toko", href: "/penjualan-kasir" },
        { label: "Edit Penjualan", href: "" },
    ];

    const headers = [
        { label: "No", key: "No", align: "text-left" },
        { label: "Foto Produk", key: "Foto Produk", align: "text-left" },
        { label: "Nama Produk", key: "Nama Produk", align: "text-left" },
        { label: "Jenis Barang", key: "Jenis Barang", align: "text-left" },
        { label: "Harga Satuan", key: "Harga Satuan", align: "text-left" },
        { label: "Kuantitas", key: "Kuantitas", align: "text-left" },
        { label: "Total Biaya", key: "Total Biaya", align: "text-left" },
        { label: "Aksi", key: "Aksi", align: "text-left" },
    ];

    const btnAddBaris = (cabangIndex) => {
        setActiveCabang(cabangIndex);
        setIsModalOpen(true);
    };

    const dataBarang = [
        {
            jenis: "Barang Handmade",
            kategori: ["Semua", "Gelang", "Anting-Anting", "Cincin"],
            items: [
                { id: 1, image: "https://via.placeholder.com/150", code: "MMM453", name: "Gelang Barbie 123", price: 10000, kategori: "Gelang" },
                { id: 2, image: "https://via.placeholder.com/150", code: "MMM454", name: "Anting Keren 123", price: 15000, kategori: "Anting-Anting" },
                { id: 3, image: "https://via.placeholder.com/150", code: "MMM455", name: "Cincin Cantik 123", price: 20000, kategori: "Cincin" },
                { id: 4, image: "https://via.placeholder.com/150", code: "MMM456", name: "Gelang Modern", price: 12000, kategori: "Gelang" },
            ],
        },
        {
            jenis: "Barang Non-Handmade",
            kategori: ["Semua", "Kalung", "Topi", "Tas"],
            items: [
                { id: 5, image: "https://via.placeholder.com/150", code: "MMM457", name: "Kalung Emas", price: 50000, kategori: "Kalung" },
                { id: 6, image: "https://via.placeholder.com/150", code: "MMM458", name: "Topi Keren", price: 30000, kategori: "Topi" },
                { id: 7, image: "https://via.placeholder.com/150", code: "MMM459", name: "Tas Ransel", price: 100000, kategori: "Tas" },
                { id: 8, image: "https://via.placeholder.com/150", code: "MMM460", name: "Kalung Perak", price: 45000, kategori: "Kalung" },
            ],
        },
    ];

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
                                    value: item.price,
                                    jenis: data.jenis,
                                    kategori: item.kategori,
                                    image: item.image,
                                    code: item.code,
                                    id: item.id
                                }));
                                return [...allItems, ...items];
                            }, [])}
                            value={item.name}
                            onSelect={(newSelection) => {
                                const updatedDataCabang = [...dataCabang];
                                const itemIndex = updatedDataCabang[activeCabang].data.findIndex(
                                    (data) => data.id === item.id
                                );
    
                                if (itemIndex !== -1) {
                                    let selectedItem = null;
                                    let jenisBarang = '';
                                    
                                    for (const category of dataBarang) {
                                        const found = category.items.find(i => i.name === newSelection.label);
                                        if (found) {
                                            selectedItem = found;
                                            jenisBarang = category.jenis;
                                            break;
                                        }
                                    }
    
                                    if (selectedItem) {
                                        const currentQuantity = updatedDataCabang[activeCabang].data[itemIndex].quantity || 0;
                                        const newTotalBiaya = selectedItem.price * currentQuantity;
                                        updatedDataCabang[activeCabang].data[itemIndex] = {
                                            ...updatedDataCabang[activeCabang].data[itemIndex],
                                            "Nama Produk": (
                                                <InputDropdown
                                                    showRequired={false}
                                                    options={dataBarang.reduce((allItems, data) => {
                                                        const items = data.items.map(item => ({
                                                            label: item.name,
                                                            value: item.price,
                                                            jenis: data.jenis,
                                                            kategori: item.kategori,
                                                            image: item.image,
                                                            code: item.code,
                                                            id: item.id
                                                        }));
                                                        return [...allItems, ...items];
                                                    }, [])}
                                                    value={newSelection.label}
                                                    onSelect={(nextSelection) => {
                                                        const updatedCabangCopy = [...dataCabang];
                                                        const rowIndex = updatedCabangCopy[activeCabang].data.findIndex(
                                                            (row) => row.id === item.id
                                                        );
    
                                                        if (rowIndex !== -1) {
                                                            let newSelectedItem = null;
                                                            let newJenisBarang = '';
                                                            const currentQuantity = updatedCabangCopy[activeCabang].data[rowIndex].quantity || 0;
                                                            
                                                            for (const category of dataBarang) {
                                                                const found = category.items.find(i => i.name === nextSelection.label);
                                                                if (found) {
                                                                    newSelectedItem = found;
                                                                    newJenisBarang = category.jenis;
                                                                    break;
                                                                }
                                                            }
    
                                                            if (newSelectedItem) {
                                                                const newTotalBiaya = newSelectedItem.price * currentQuantity;
                                                                updatedCabangCopy[activeCabang].data[rowIndex] = {
                                                                    ...updatedCabangCopy[activeCabang].data[rowIndex],
                                                                    "Nama Produk": (
                                                                        <InputDropdown
                                                                            showRequired={false}
                                                                            options={dataBarang.reduce((allItems, data) => {
                                                                                const items = data.items.map(item => ({
                                                                                    label: item.name,
                                                                                    value: item.price,
                                                                                    jenis: data.jenis,
                                                                                    kategori: item.kategori,
                                                                                    image: item.image,
                                                                                    code: item.code,
                                                                                    id: item.id
                                                                                }));
                                                                                return [...allItems, ...items];
                                                                            }, [])}
                                                                            value={nextSelection.label}
                                                                            onSelect={(nextSelection) => handleDropdownChange(item.id, nextSelection)}
                                                                        />
                                                                    ),
                                                                    "Jenis Barang": newJenisBarang,
                                                                    "Harga Satuan": `Rp${newSelectedItem.price.toLocaleString()}`,
                                                                    "Kuantitas": (
                                                                        <Input
                                                                            showRequired={false}
                                                                            type="number"
                                                                            value={currentQuantity}
                                                                            onChange={(newCount) => handleQuantityChange(item.id, newCount)}
                                                                        />
                                                                    ),
                                                                    "Total Biaya": `Rp${newTotalBiaya.toLocaleString()}`,
                                                                    rawTotalBiaya: newTotalBiaya,
                                                                    name: nextSelection.label,
                                                                    currentPrice: newSelectedItem.price,
                                                                    quantity: currentQuantity
                                                                };
    
                                                                setDataCabang(updatedCabangCopy);
                                                            }
                                                        }
                                                    }}
                                                />
                                            ),
                                            "Jenis Barang": jenisBarang,
                                            "Harga Satuan": `Rp${selectedItem.price.toLocaleString()}`,
                                            "Total Biaya": `Rp${newTotalBiaya.toLocaleString()}`,
                                            rawTotalBiaya: newTotalBiaya,
                                            currentPrice: selectedItem.price
                                        };
                                        setDataCabang(updatedDataCabang);
                                    }
                                }
                            }}
                        />
                    ),
                    "Jenis Barang": item.jenis || dataBarang.find(d => 
                        d.items.some(i => i.name === item.name)
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


    const handleDropdownChange = (itemId, nextSelection) => {
        const updatedDataCabang = [...dataCabang];
        const cabangIndex = 0;  // karena kita hanya punya 1 cabang
        const rowIndex = updatedDataCabang[cabangIndex].data.findIndex(
            (row) => row.id === itemId
        );
    
        if (rowIndex !== -1) {
            let newSelectedItem = null;
            let newJenisBarang = '';
            const currentQuantity = updatedDataCabang[cabangIndex].data[rowIndex].quantity || 0;
            
            // Cari produk yang dipilih dan jenis barangnya
            for (const category of dataBarang) {
                const found = category.items.find(i => i.name === nextSelection.label);
                if (found) {
                    newSelectedItem = found;
                    newJenisBarang = category.jenis;
                    break;
                }
            }
    
            if (newSelectedItem) {
                const newTotalBiaya = newSelectedItem.price * currentQuantity;
                updatedDataCabang[cabangIndex].data[rowIndex] = {
                    ...updatedDataCabang[cabangIndex].data[rowIndex],
                    "Nama Produk": (
                        <InputDropdown
                            showRequired={false}
                            options={dataBarang.reduce((allItems, data) => {
                                const items = data.items.map(item => ({
                                    label: item.name,
                                    value: item.price,
                                    jenis: data.jenis,
                                    kategori: item.kategori,
                                    image: item.image,
                                    code: item.code,
                                    id: item.id
                                }));
                                return [...allItems, ...items];
                            }, [])}
                            value={nextSelection.label}
                            onSelect={(selection) => handleDropdownChange(itemId, selection)}
                        />
                    ),
                    "Jenis Barang": newJenisBarang,
                    "Harga Satuan": `Rp${newSelectedItem.price.toLocaleString('id-ID')}`,
                    "Kuantitas": (
                        <Input
                            showRequired={false}
                            type="number"
                            value={currentQuantity}
                            onChange={(newCount) => handleQuantityChange(itemId, newCount)}
                        />
                    ),
                    "Total Biaya": `Rp${newTotalBiaya.toLocaleString('id-ID')}`,
                    rawTotalBiaya: newTotalBiaya,
                    name: nextSelection.label,
                    currentPrice: newSelectedItem.price,
                    quantity: currentQuantity
                };
    
                setDataCabang(updatedDataCabang);
            }
        }
    };
    
    const handleQuantityChange = (itemId, newCount) => {
        const updatedCabangCopy = [...dataCabang];
        const cabangIndex = 0;  // karena kita hanya punya 1 cabang
        const rowIndex = updatedCabangCopy[cabangIndex].data.findIndex(
            (row) => row.id === itemId
        );
    
        if (rowIndex !== -1) {
            const currentItem = updatedCabangCopy[cabangIndex].data[rowIndex];
            const numericCount = Number(newCount);
            const newTotal = currentItem.currentPrice * numericCount;
            
            updatedCabangCopy[cabangIndex].data[rowIndex] = {
                ...currentItem,
                quantity: numericCount,
                rawTotalBiaya: newTotal,
                "Total Biaya": `Rp${newTotal.toLocaleString('id-ID')}`,
                "Kuantitas": (
                    <Input
                        showRequired={false}
                        type="number"
                        value={numericCount}
                        onChange={(value) => handleQuantityChange(itemId, value)}
                    />
                )
            };
            
            setDataCabang(updatedCabangCopy);
        }
    };

    const handleDeleteItem = (cabangIndex, itemId) => {
        const updatedCabang = [...dataCabang];
        updatedCabang[cabangIndex].data = updatedCabang[cabangIndex].data.filter(
            (item) => item.id !== itemId
        );
        setDataCabang(updatedCabang);
    };

    const dataBayar = [
        { id: 1, label: "Cash" },
        { id: 2, label: "Non-Cash" }
    ];

    const dataMetode = [
        { id: 1, label: "-" },
        { id: 2, label: "Mandiri" },
        { id: 3, label: "Bank Nagari" }
    ];

    const selectedBayarLabel = dataBayar.find(option => option.id === selectBayar)?.label || "";
    const selectedMetodeLabel = dataMetode.find(option => option.id === selectMetode)?.label || "";

    const subtotal = calculateSubtotal();
    const totalPenjualan = calculateTotalPenjualan(subtotal);
    const navigate = useNavigate();

    const handleTambahSubmit = (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            
            // Prepare the updated data
            const updatedData = {
                nomor,
                tanggal,
                nama_pembeli: namaPembeli,
                bayar: selectedBayarLabel,
                metode: selectedMetodeLabel,
                note,
                data_produk: dataCabang[0].data.map(item => ({
                    id: item.id,
                    "Foto Produk": typeof item["Foto Produk"] === 'string' ? item["Foto Produk"] : item["Foto Produk"].props.src,
                    "Nama Produk": typeof item["Nama Produk"] === 'string' ? item["Nama Produk"] : item["Nama Produk"].props.value,
                    "Jenis Barang": item["Jenis Barang"],
                    "Harga Satuan": item.currentPrice,
                    "kuantitas": item.quantity,
                    "Total Biaya": item.rawTotalBiaya
                })),
                diskon,
                pajak,
                total_penjualan: totalPenjualan
            };
    
            console.log('Updated Data:', updatedData);
            // mengirim updatedData ke API
            
            setModalSucc(true);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleAcc = () => {
        setModalSucc(false);
        navigate('/penjualan-kasir');
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
                                    <Input label={"Nomor"} type1={"text"} value={nomor} onChange={(e) => setNomor(e)} />
                                    <Input label={"Tanggal"} type1={"date"} value={tanggal} onChange={(e) => setTanggal(e)} />
                                    <Input label={"Nama Pembeli"} value={namaPembeli} onChange={(e) => setNamaPembeli(e)} />
                                    <InputDropdown label={"Cash/Non-Cash"} options={dataBayar} value={selectedBayarLabel} onSelect={handleSelectBayar} />
                                    <div className="">
                                        <InputDropdown label={"Metode Pembayaran"} disabled={isMetodeDisabled} options={dataMetode} value={selectedMetodeLabel} onSelect={handleSelectMetode} />
                                    </div>
                                </div>
                            </section>
    
                            {/* Section Tambah Data Per Cabang */}
                            <section className="pt-10">
                                {dataCabang.map((cabang, index) => (
                                    <div key={index} className="pt-5">
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
                                        {["Barang Handmade", "Barang Non-Handmade"].map((jenis) => (
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
                {/* modal success */}
                {isModalSucc && (
                    <AlertSuccess
                        title="Berhasil!!"
                        description="Data berhasil dihapus"
                        confirmLabel="Ok"
                        onConfirm={handleAcc}
                    />
                )}
    
                {isLoading && (
                    <Spinner/>
                )}
            </LayoutWithNav>
        </>
    );
}