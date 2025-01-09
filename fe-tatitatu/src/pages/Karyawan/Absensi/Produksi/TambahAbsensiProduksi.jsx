import { useEffect, useState } from "react";
import InputDropdown from "../../../../components/InputDropdown";
import Input from "../../../../components/Input";
import { useNavigate } from "react-router-dom";
import LayoutWithNav from "../../../../components/LayoutWithNav";
import Breadcrumbs from "../../../../components/Breadcrumbs";
import Table from "../../../../components/Table";
import Button from "../../../../components/Button";
import TextArea from "../../../../components/Textarea";
import Gallery2 from "../../../../components/Gallery2";
import AlertSuccess from "../../../../components/AlertSuccess";
import Spinner from "../../../../components/Spinner";
import FileInput from "../../../../components/FileInput";

export default function TambahAbsensiProduksi() {
    const [nomor, setNomor] = useState("");
    const [tanggal, setTanggal] = useState(null);
    const [namaPembeli, setNamaPembeli] = useState("");
    const [note, setNote] = useState("");
    const [selectBayar, setSelectedBayar] = useState("");
    const [selectMetode, setSelectMetode] = useState("");
    const [diskon, setDiskon] = useState(0);
    const [pajak, setPajak] = useState(0);
    const [dataCabang, setDataCabang] = useState([
        { nama: "", data: [] }  
    ]);
    const userData = JSON.parse(localStorage.getItem('userData'));
    const isAdminGudang = userData?.role === 'admingudang';

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

    const breadcrumbItems = [
        { label: "Data Absensi", href: "/absensi-karyawan-produksi" },
        { label: "Tambah Absensi", href: "" },
    ]
    const headers = [
        { label: "No", key: "No", align: "text-center" },
        { label: "Nama Barang", key: "Nama Barang", align: "text-left" },
        { label: "Jumlah", key: "Jumlah", align: "text-left" }
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
            
            // Ambil semua items dari dataBarang
            const allItems = [];
            dataBarang.forEach(category => {
                category.items.forEach(item => {
                    allItems.push({
                        label: item.name,
                        id: item.id,
                        jenis: category.jenis,
                        kategori: item.kategori,
                        code: item.code,
                        price: item.price
                    });
                });
            });
    
            const newItems = selectedItems.map((item) => {
                return {
                    id: item.id,
                    No: updatedCabang[activeCabang].data.length + 1,
                    "Nama Barang": (
                        <InputDropdown
                            showRequired={false}
                            options={allItems}
                            value={item.name}
                            onSelect={(newSelection) => handleDropdownChange(item.id, newSelection)}
                        />
                    ),
                    "Jumlah": (
                        <Input
                            showRequired={false}
                            type="number"
                            value={item.count}
                            onChange={(newCount) => handleQuantityChange(item.id, newCount)}
                        />
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
        const rowIndex = updatedDataCabang[activeCabang].data.findIndex(
            (row) => row.id === itemId
        );
    
        if (rowIndex !== -1) {
            // Ambil semua items dari dataBarang
            const allItems = [];
            dataBarang.forEach(category => {
                category.items.forEach(item => {
                    allItems.push({
                        label: item.name, 
                        id: item.id,
                        jenis: category.jenis,
                        kategori: item.kategori,
                        code: item.code,
                        price: item.price
                    });
                });
            });
    
            const selectedValue = typeof nextSelection === 'object' ? nextSelection.label : nextSelection;
    
            updatedDataCabang[activeCabang].data[rowIndex] = {
                ...updatedDataCabang[activeCabang].data[rowIndex],
                "Nama Barang": (
                    <InputDropdown
                        showRequired={false}
                        options={allItems}
                        value={selectedValue}
                        onSelect={(newVal) => handleDropdownChange(itemId, newVal)}
                    />
                ),
                "Jumlah": (
                    <Input
                        showRequired={false}
                        type="number"
                        value={updatedDataCabang[activeCabang].data[rowIndex].quantity || 0}
                        onChange={(newCount) => handleQuantityChange(itemId, newCount)}
                    />
                ),
                name: selectedValue,
                quantity: updatedDataCabang[activeCabang].data[rowIndex].quantity || 0
            };
    
            setDataCabang(updatedDataCabang);
        }
    };
    
    const handleQuantityChange = (itemId, newCount) => {
        const updatedCabangCopy = [...dataCabang];
        const rowIndex = updatedCabangCopy[activeCabang].data.findIndex(
            (row) => row.id === itemId
        );
    
        if (rowIndex !== -1) {
            updatedCabangCopy[activeCabang].data[rowIndex].quantity = newCount;
            updatedCabangCopy[activeCabang].data[rowIndex]["Jumlah"] = (
                <Input
                    showRequired={false}
                    type="number"
                    value={newCount}
                    onChange={(newerCount) => handleQuantityChange(itemId, newerCount)}
                />
            );
            
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
            setModalSucc(true);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleAcc = () => {
        setModalSucc(false);
        navigate(isAdminGudang ? '/penjualan-admin-gudang' : '/penjualan-kasir');
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
                                <div className="">
                                    <div className="mb-6">
                                        <label className="block text-gray-700 font-medium mb-2">Foto Absen</label>
                                        <FileInput
                                            label="Masukan Foto Absen"
                                            onFileChange={(file) => console.log(file)}
                                            width="w-48 h-48"
                                        />
                                    </div>

                                    {/* Input Tanggal */}
                                    <div className="mb-6">
                                        <Input 
                                            label="Tanggal" 
                                            type1="date"
                                            width="w-full"
                                            value={tanggal}
                                            onChange={(e) => setTanggal(e)}
                                        />
                                    </div>
                                </div>
                            </section>
    
                            {/* Section Tambah Data Per Cabang */}
                            <section className="">
                                {dataCabang.map((cabang, index) => (
                                    <div key={index} className="">
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
                            <div className="flex justify-end gap-4 mt-6">
                                <button className="px-4 py-2 border rounded-lg">
                                    Batal
                                </button>
                                <button className="px-4 py-2 bg-primary text-white rounded-lg">
                                    Simpan
                                </button>
                            </div>
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