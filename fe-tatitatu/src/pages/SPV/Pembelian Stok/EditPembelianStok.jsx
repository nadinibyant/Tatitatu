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
import { useNavigate } from "react-router-dom";
import LayoutWithNav from "../../../components/LayoutWithNav";

export default function EditPembelianStok() {
    const data = {
        id: 1,
        nomor: 'STK1133',
        invoice: 'INV123',
        tanggal: '2024-12-21',
        pembayaran: 2,
        metode: 2,
        dataCabang: [
            {
                nama: "Cabang GOR.Haji Agus Salim",
                data: [
                    {
                        id: 1,
                        No: "1",
                        "Foto Produk" : (
                        <img src="https://via.placeholder.com/50" alt="Foto Produk" />
                        ),
                        "Nama Produk": 1,
                        "Jenis Barang": "Barang Handmade",
                        "Harga Satuan": 15000,
                        Kuantitas: 10,
                        "Total Biaya": 150000
                    },
                    {
                        id: 2,
                        No: "1",
                        "Foto Produk" : (
                        <img src="https://via.placeholder.com/50" alt="Foto Produk" />
                        ),
                        "Nama Produk": 1,
                        "Jenis Barang": "Barang Handmade",
                        "Harga Satuan": 15000,
                        Kuantitas: 10,
                        "Total Biaya": 150000
                    },
                    {
                        id: 3,
                        No: "1",
                        "Foto Produk" : (
                        <img src="https://via.placeholder.com/50" alt="Foto Produk" />
                        ),
                        "Nama Produk": 1,
                        "Jenis Barang": "Barang Handmade",
                        "Harga Satuan": 15000,
                        Kuantitas: 10,
                        "Total Biaya": 150000
                    },
                ]
            },
            {
                nama: "Cabang GOR.Lubuk Begalung",
                data: [
                    {
                        id: 4,
                        No: "1",
                        "Foto Produk" : (
                        <img src="https://via.placeholder.com/50" alt="Foto Produk" />
                        ),
                        "Nama Produk": 1,
                        "Jenis Barang": "Barang Handmade",
                        "Harga Satuan": 15000,
                        Kuantitas: 10,
                        "Total Biaya": 150000
                    },
                    {
                        id: 5,
                        No: "1",
                        "Foto Produk" : (
                        <img src="https://via.placeholder.com/50" alt="Foto Produk" />
                        ),
                        "Nama Produk": 1,
                        "Jenis Barang": "Barang Handmade",
                        "Harga Satuan": 15000,
                        Kuantitas: 10,
                        "Total Biaya": 150000
                    },
                    {
                        id: 6,
                        No: "1",
                        "Foto Produk" : (
                        <img src="https://via.placeholder.com/50" alt="Foto Produk" />
                        ),
                        "Nama Produk": 1,
                        "Jenis Barang": "Barang Handmade",
                        "Harga Satuan": 15000,
                        Kuantitas: 10,
                        "Total Biaya": 150000
                    },
                ]
            }
        ],
        catatan: "ini adalah catatan",
        subtotal: 8000,
        diskon: 30,
        pajak: 1000,
        totalpenjualan: 18000
    }

    const [nomor, setNomor] = useState(data.nomor || "");
    const [tanggal, setTanggal] = useState(data.tanggal || "");
    const [note, setNote] = useState(data.catatan || "");
    const [selectBayar, setSelectedBayar] = useState(data.pembayaran || "");
    const [selectMetode, setSelectMetode] = useState("");
    const [diskon, setDiskon] = useState(data.diskon || 0);
    const [pajak, setPajak] = useState(data.pajak || 0);
    const [dataCabang, setDataCabang] = useState([]);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [activeCabang, setActiveCabang] = useState(null);
    const [resetSignal, setResetSignal] = useState(false);

    const [selectedCategory, setSelectedCategory] = useState("Semua");
    const [selectedJenis, setSelectedJenis] = useState("Barang Handmade");
    const [selectedItems, setSelectedItems] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [isModalDel, setModalDel] = useState(false)
    const [isModalSucc, setModalSucc] = useState(false)
    const [selectedRow, setSelectRow] = useState("")
    const [selectedLabel, setSelectLabel] = useState("")
    const [isLoading, setLoading] = useState(false)
    const [isMetodeDisabled, setIsMetodeDisabled] = useState(false);

    // data fix
    const [updateData, setUpdateData] = useState({})
    

    useEffect(() => {
        setDataCabang(data.dataCabang);
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

    const handleModalDel = (id, isNew = false) => {
        setSelectRow(id);
        if (isNew) {
            // Jika data baru, langsung hapus baris tanpa modal
            handleDeleteItem(activeCabang, id);
        } else {
            // Jika data sudah ada, tampilkan modal hapus
            setModalDel(true);
        }
    }

    console.log(selectMetode)

    useEffect(() => {
        if (selectBayar === 1) { // Jika Cash
            setSelectMetode(dataMetode[0].id);
            setSelectLabel(dataMetode[0].label);
            setIsMetodeDisabled(true);
        } else if (selectBayar === 2) { // Jika Non-Cash
            setSelectMetode(dataMetode[1].id);
            setSelectLabel(dataMetode[1].label);
            setIsMetodeDisabled(false);
        }
    }, [selectBayar]);

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
        { id: 1, label: "Cash" },
        { id: 2, label: "Non-Cash" }
    ]

    useEffect(() => {
        if (data.pembayaran) {
            setSelectedBayar(data.pembayaran); 
        }
    }, [data.pembayaran]);

    useEffect(() => {
        if (selectBayar === 1) {
            setSelectMetode(dataMetode[0].id);
            setSelectLabel(dataMetode[0].label) 

        } else if (selectBayar === 2) {
            setSelectMetode(dataMetode[1].id); 
            setSelectLabel(dataMetode[1].label)
        }
    }, [selectBayar]);  
    
    const handleSelectBayar = (selectedOption) => {
        setSelectedBayar(selectedOption.id);
    };

    const selectedBayarLabel = dataBayar.find(option => option.id === selectBayar)?.label || "";
    
    const dataMetode = [
        { id: 1, label: "-" },
        { id: 2, label: "Mandiri" },
        { id: 3, label: "Bank Nagari" }
    ]

    useEffect(() => {
        if (data.metode) {
            const metodeOption = dataMetode.find(option => option.id === data.metode);
            if (metodeOption) {
                setSelectMetode(metodeOption.id); 
                setSelectLabel(metodeOption.label)
            }
        }
    }, [data.metode]);

    const handleSelectMetode = (value) => {
        setSelectMetode(value);
    };

    // const selectedMetodeLabel = dataMetode.find(option => option.id === selectMetode)?.label || "";

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

    const filteredItemsBarang = dataBarang
    .flatMap(item => item.items) 
    .map(item => ({
      label: item.name,
      value: item.id   
    })) || [];

    const handleChange = (selectedOption, cabangIndex, itemIndex, field) => {
        const updatedDataCabang = [...dataCabang];
    
        const item = updatedDataCabang[cabangIndex].data[itemIndex];
    
        if (item) {
            const selectedItem = dataBarang
                .flatMap(data => data.items) 
                .find(item => item.id === selectedOption.value); 
    
            const updatedItem = { ...item };
    
            if (field === "Nama Produk") {
                updatedItem["Nama Produk"] = selectedOption.value; 
                const jenisBarang = dataBarang.find(data => 
                    data.items.some(i => i.id === selectedItem.id)
                )?.jenis || updatedItem["Jenis Barang"]; 
    
                updatedItem["Jenis Barang"] = jenisBarang;  
                updatedItem["Harga Satuan"] = selectedItem.price; 
            } else if (field === "Kuantitas") {
                updatedItem["Kuantitas"] = selectedOption;  
            }
    
            // Menghitung ulang Total Biaya berdasarkan Harga Satuan dan Kuantitas
            const hargaSatuan = updatedItem["Harga Satuan"];
            const kuantitas = updatedItem["Kuantitas"];
            updatedItem["Total Biaya"] = hargaSatuan * kuantitas;
    
            // Update data di cabang yang sesuai
            updatedDataCabang[cabangIndex].data[itemIndex] = updatedItem;
            setDataCabang(updatedDataCabang);
        }
    };
    

    const tableData = dataCabang.map((cabang, cabangIndex) => {
        return cabang.data.map((item, itemIndex) => {
            const defaultProduct = filteredItemsBarang.find(option => option.value === item["Nama Produk"]);
            return {
                id: item.id,
                No: itemIndex + 1,
                "Foto Produk": item["Foto Produk"],
                "Nama Produk": (
                    <InputDropdown
                    showRequired={false}
                    options={filteredItemsBarang}
                    value={defaultProduct ? defaultProduct.label : ""}
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
            console.log(selectedItems)
            const newItems = selectedItems.map((item) => ({
                id: item.id,
                No: updatedCabang[activeCabang].data.length + 1,
                "Foto Produk": (
                    <img src={item.image} alt={item.name} className="w-12 h-12" />
                ),
                "Nama Produk": item.id,
                "Jenis Barang": selectedJenis,
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
            }));
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

    const handleEditSubmit = (event) => {
        event.preventDefault()
        try {
            setLoading(true)
            setModalSucc(true)
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    const handleModalSucc = () => {
        navigate('/pembelianStok')
    }


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
                                    <Input label={"Nomor"} type1={"text"} value={data.nomor} onChange={(e) => setNomor(e)} />
                                    <Input label={"Tanggal"} type1={"date"} value={data.tanggal} onChange={(e) => setTanggal(e)} />
                                    <InputDropdown label={"Cash/Non-Cash"} options={dataBayar} value={selectedBayarLabel} onSelect={handleSelectBayar} />
                                    <div className="md:col-span-3 md:w-1/3">
                                        <InputDropdown label={"Metode Pembayaran"} disabled={isMetodeDisabled} options={dataMetode} value={selectedLabel} onSelect={handleSelectMetode} />
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
                                    label="Catatan*"
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
                    description="Data berhasil dihapus"
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
