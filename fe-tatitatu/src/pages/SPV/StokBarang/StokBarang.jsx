import { useState } from "react";
import Button from "../../../components/Button";
import Navbar from "../../../components/Navbar";
import { menuItems, userOptions } from "../../../data/menu";
import Table from "../../../components/Table";
import ButtonDropdown from "../../../components/ButtonDropdown";
import LayoutWithNav from "../../../components/LayoutWithNav";
import InputDropdown from "../../../components/InputDropdown";
import { X } from "lucide-react";

export default function StokBarang() {
    const headers = [
        { label: "Nomor", key: "Nomor", align: "text-left" },
        { label: "Nama Barang", key: "Nama Barang", align: "text-left" },
        { label: "Jenis", key: "Jenis", align: "text-left" },
        { label: "Kategori", key: "Kategori", align: "text-left" },
        { label: "Jumlah Stok", key: "Jumlah Stok", align: "text-left" },
    ];

    const [selectedJenis, setSelectedJenis] = useState("Semua");
    const [selectedKategori, setSelectedKategori] = useState("Semua");
    const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
    const [filterPosition, setFilterPosition] = useState({ top: 0, left: 0 });
    const [selectedStore, setSelectedStore] = useState("Semua");
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);

    const dataCabang = [
        { label: 'Semua', value: 'Semua', icon: '/icon/toko.svg' },
        { label: 'Gor Agus', value: 'Gor Agus', icon: '/icon/toko.svg' },
        { label: 'Lubeg', value: 'Lubeg', icon: '/icon/toko.svg' },
    ];

    const handleFilterClick = (event) => {
      const buttonRect = event.currentTarget.getBoundingClientRect();
      setFilterPosition({
        top: buttonRect.bottom + window.scrollY + 5,
        left: buttonRect.left + window.scrollX
      });
      setIsFilterModalOpen(prev => !prev);
    };
  
    const handleApplyFilter = () => {
      setIsFilterModalOpen(false);
    };

    const [data] = useState([
        {
            Nomor: "SIO202",
            "Nama Barang": "Gelang Besi",
            Jenis: "Sedang",
            Kategori: "Gelang",
            "Jumlah Stok": 1000,
            image: "/path/to/gelang-image.jpg",
            cabang: [
                { nama: "GOR HAS", stok: 500 },
                { nama: "Lubeg", stok: 500 }
            ]
        },
        {
            Nomor: "PC125",
            "Nama Barang": "Cincin Perak",
            Jenis: "Handmade",
            Kategori: "Cincin",
            "Jumlah Stok": 300,
            image: "/path/to/cincin-image.jpg",
            cabang: [
                { nama: "GOR HAS", stok: 150 },
                { nama: "Lubeg", stok: 150 }
            ]
        },
    ]);

    const handleRowClick = (row) => {
        setSelectedItem(row);
        setIsDetailModalOpen(true);
    };

    const rincianStokHeaders = [
        { label: "No", key: "No", align: "text-left" },
        { label: "Cabang", key: "Cabang", align: "text-left" },
        { label: "Jumlah Stok", key: "Jumlah Stok", align: "text-left" }
    ];

    const filterFields = [
        {
            label: "Jenis",
            key: "Jenis",
            options: [
                { label: "Semua", value: "Semua" },
                { label: "Handmade", value: "Handmade" },
                { label: "Non-Handmade", value: "Non-Handmade" },
                { label: "Custom", value: "Custom" },
                { label: "Packaging", value: "Packaging" },
            ]
        },
        {
            label: "Kategori",
            key: "Kategori",
            options: [
                { label: "Semua", value: "Semua" },
                { label: "Gelang", value: "Gelang" },
                { label: "Cincin", value: "Cincin" },
                { label: "Anting-Anting", value: "Anting-Anting" },
                { label: "Packaging", value: "Packaging" }
            ]
        }
    ];

    // Fungsi untuk memfilter data
    const filteredData = () => {
        let filteredItems = [...data];

        if (selectedJenis !== "Semua") {
            filteredItems = filteredItems.filter(item => item.Jenis === selectedJenis);
        }

        if (selectedKategori !== "Semua") {
            filteredItems = filteredItems.filter(item => item.Kategori === selectedKategori);
        }

        return filteredItems;
    };

    return (
        <>
            <LayoutWithNav menuItems={menuItems} userOptions={userOptions}>
                <div className="p-5">
                    <section className="flex flex-wrap md:flex-nowrap items-center justify-between space-y-2 md:space-y-0">
                        {/* Left Section */}
                        <div className="left w-full md:w-auto">
                            <p className="text-primary text-base font-bold">Stok Barang</p>
                        </div>

                        {/* Right Section */}
                        <div className="right flex flex-wrap md:flex-nowrap items-center space-x-0 md:space-x-4 w-full md:w-auto space-y-2 md:space-y-0">
                            <div className="w-full md:w-auto">
                                <Button
                                    label="Export"
                                    icon={<svg width="17" height="20" viewBox="0 0 17 20" fill="none"
                                        xmlns="http://www.w3.org/2000/svg">
                                        <path
                                            d="M1.44845 20L0.0742188 18.6012L2.96992 15.7055H0.761335V13.7423H6.30735V19.2883H4.34416V17.1043L1.44845 20ZM8.27054 19.6319V11.7791H0.417777V0H10.2337L16.1233 5.88957V19.6319H8.27054ZM9.25213 6.87117H14.1601L9.25213 1.96319V6.87117Z"
                                            fill="#7B0C42" />
                                    </svg>}
                                    bgColor="border border-secondary"
                                    hoverColor="hover:bg-white"
                                    textColor="text-black"
                                />
                            </div>

                            <div className="w-full md:w-auto">
                                <ButtonDropdown 
                                    selectedIcon={'/icon/toko.svg'} 
                                    options={dataCabang} 
                                    onSelect={(value) => setSelectedStore(value)} 
                                />
                            </div>
                        </div>
                    </section>

                    <section className="mt-5 bg-white rounded-xl">
                        <div className="p-5">
                            <Table
                                headers={headers}
                                data={filteredData().map(item => ({
                                    ...item,
                                    "Jumlah Stok": `${item["Jumlah Stok"].toLocaleString('id-ID')} Pcs`
                                }))}
                                hasFilter={true}
                                onFilterClick={handleFilterClick}
                                onRowClick={handleRowClick}
                            />
                        </div>
                    </section>

                    {/* Filter Modal */}
                    {isFilterModalOpen && (
                    <>
                        <div 
                            className="fixed inset-0"
                            onClick={() => setIsFilterModalOpen(false)}
                        />
                        <div 
                            className="absolute bg-white rounded-lg shadow-lg p-4 w-80 z-50"
                            style={{ 
                                top: filterPosition.top,
                                left: filterPosition.left 
                            }}
                        >
                            <div className="space-y-4">
                                {filterFields.map((field) => (
                                    <InputDropdown
                                        key={field.key}
                                        label={field.label}
                                        options={field.options}
                                        value={field.key === "Jenis" ? selectedJenis : selectedKategori}
                                        onSelect={(value) => 
                                            field.key === "Jenis" 
                                                ? setSelectedJenis(value.value)
                                                : setSelectedKategori(value.value)
                                        }
                                        required={true}
                                    />
                                ))}
                                <button
                                    onClick={handleApplyFilter}
                                    className="w-full bg-primary text-white py-2 px-4 rounded-lg hover:bg-opacity-90"
                                >
                                    Simpan
                                </button>
                            </div>
                        </div>
                    </>
                )}

{isDetailModalOpen && selectedItem && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg w-full max-w-3xl mx-4">
                            {/* Header with close button */}
                            <div className="flex justify-between items-center p-6">
                                <h2 className="text-xl font-semibold">{selectedItem["Nama Barang"]}</h2>
                                <button
                                    onClick={() => setIsDetailModalOpen(false)}
                                    className="text-gray-500 hover:text-gray-700"
                                >
                                    <X size={24} />
                                </button>
                            </div>

                            {/* Content */}
                            <div className="p-6">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {/* Image Column */}
                                    <div>
                                        <img
                                            src={selectedItem.image || "/placeholder-image.jpg"}
                                            alt={selectedItem["Nama Barang"]}
                                            className="w-full h-auto rounded-lg"
                                        />
                                    </div>

                                    {/* Details Columns */}
                                    <div className="col-span-2 grid grid-cols-2 gap-y-4">
                                        <div>
                                            <p className="text-gray-500">Nomor</p>
                                            <p className="font-medium">{selectedItem.Nomor}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-500">Nama Barang</p>
                                            <p className="font-medium">{selectedItem["Nama Barang"]}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-500">Jenis</p>
                                            <p className="font-medium">{selectedItem.Jenis}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-500">Total Stok Keseluruhan</p>
                                            <p className="font-medium">{selectedItem["Jumlah Stok"]}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Rincian Stok Table */}
                                <div className="mt-8">
                                    <h3 className="font-bold mb-4">Rincian Stok</h3>
                                    <Table
                                        headers={rincianStokHeaders}
                                        data={selectedItem.cabang.map((item, index) => ({
                                            No: index + 1,
                                            Cabang: item.nama,
                                            "Jumlah Stok": item.stok
                                        }))}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                </div>
            </LayoutWithNav>
        </>
    );
}