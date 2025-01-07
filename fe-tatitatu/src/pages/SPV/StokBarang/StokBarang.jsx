import { useState } from "react";
import Button from "../../../components/Button";
import Navbar from "../../../components/Navbar";
import { menuItems, userOptions } from "../../../data/menu";
import Table from "../../../components/Table";
import ButtonDropdown from "../../../components/ButtonDropdown";
import LayoutWithNav from "../../../components/LayoutWithNav";

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

    const handleFilterClick = () => {
        setIsFilterModalOpen(true);
    };

    const handleApplyFilter = () => {
        setIsFilterModalOpen(false);
    };

    const [data] = useState([
        {
            Nomor: "PC124",
            "Nama Barang": "Gelang Besi",
            Jenis: "Non-Handmade",
            Kategori: "Gelang",
            "Jumlah Stok": 500
        },
        {
            Nomor: "PC125",
            "Nama Barang": "Cincin Perak",
            Jenis: "Handmade",
            Kategori: "Cincin",
            "Jumlah Stok": 300
        },
        {
            Nomor: "PC126",
            "Nama Barang": "Anting Emas",
            Jenis: "Custom",
            Kategori: "Anting-Anting",
            "Jumlah Stok": 2500
        },
        {
            Nomor: "PC127",
            "Nama Barang": "Kotak Perhiasan",
            Jenis: "Packaging",
            Kategori: "Packaging",
            "Jumlah Stok": 1000
        }
    ]);

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
                            />
                        </div>
                    </section>

                    {/* Filter Modal */}
                    {isFilterModalOpen && (
                        <div className="fixed inset-0 bg-white bg-opacity-80 flex justify-center items-center z-50">
                            <div className="relative flex flex-col items-start p-6 space-y-4 bg-white rounded-lg shadow-md max-w-lg w-full">
                                <button
                                    onClick={() => setIsFilterModalOpen(false)}
                                    className="absolute top-2 right-2 text-gray-600 hover:text-gray-900"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                                <h2 className="text-lg font-bold mb-4">Filter</h2>
                                <form className="w-full" onSubmit={(e) => { e.preventDefault(); handleApplyFilter(); }}>
                                    {filterFields.map((field, index) => (
                                        <div className="mb-4" key={index}>
                                            <label className="block text-gray-700 font-medium mb-2">
                                                {field.label}
                                            </label>
                                            <ButtonDropdown
                                                options={field.options}
                                                selectedStore={field.key === "Jenis" ? selectedJenis : selectedKategori}
                                                onSelect={(value) => field.key === "Jenis" ? setSelectedJenis(value) : setSelectedKategori(value)}
                                            />
                                        </div>
                                    ))}
                                    <button
                                        type="submit"
                                        className="py-2 px-4 w-full bg-primary text-white rounded-md hover:bg-white hover:border hover:border-primary hover:text-black focus:outline-none"
                                    >
                                        Terapkan
                                    </button>
                                </form>
                            </div>
                        </div>
                    )}
                </div>
            </LayoutWithNav>
        </>
    );
}