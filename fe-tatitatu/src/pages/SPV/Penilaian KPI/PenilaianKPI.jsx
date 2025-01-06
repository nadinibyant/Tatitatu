import { useEffect, useState } from "react";
import Button from "../../../components/Button";
import Navbar from "../../../components/Navbar";
import { menuItems, userOptions } from "../../../data/menu";
import moment from "moment";
import Table from "../../../components/Table";
import ButtonDropdown from "../../../components/ButtonDropdown";
import { useNavigate } from "react-router-dom";
import LayoutWithNav from "../../../components/LayoutWithNav";

export default function PenilaianKPI() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [startDate, setStartDate] = useState(moment().format("YYYY-MM-DD"));
    const [endDate, setEndDate] = useState(moment().format("YYYY-MM-DD"));
    const [selectedJenis, setSelectedJenis] = useState("Semua");
    const [selectedKategori, setSelectedKategori] = useState("Semua");
    const [selectedStore, setSelectedStore] = useState("Semua");
    const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
    const userData = JSON.parse(localStorage.getItem('userData'));
    const isHeadGudang = userData?.role === 'headgudang';

    const handleFilterClick = () => {
        setIsFilterModalOpen(true);
    };

    const handleApplyFilter = () => {
        setIsFilterModalOpen(false);
    };

    const handleToday = () => {
        const today = moment().startOf("day");
        setStartDate(today.format("YYYY-MM-DD"));
        setEndDate(today.format("YYYY-MM-DD"));
        setIsModalOpen(false);
    };

    const handleLast7Days = () => {
        const today = moment().startOf("day");
        const sevenDaysAgo = today.clone().subtract(7, "days");
        setStartDate(sevenDaysAgo.format("YYYY-MM-DD"));
        setEndDate(today.format("YYYY-MM-DD"));
        setIsModalOpen(false);
    };

    const handleThisMonth = () => {
        const startMonth = moment().startOf("month");
        const endMonth = moment().endOf("month");
        setStartDate(startMonth.format("YYYY-MM-DD"));
        setEndDate(endMonth.format("YYYY-MM-DD"));
        setIsModalOpen(false);
    };

    const toggleModal = () => setIsModalOpen(!isModalOpen);

    const formatDate = (date) =>
        new Date(date).toLocaleDateString("en-US", {
            month: "short",
            day: "2-digit",
            year: "numeric",
        });

    const data = [
        {
            id: 1,
            Nama: 'Nadini Annisa',
            Divisi: 'SPV',
            Cabang: 'Gor Agus',
            KPI: 15,
            "Total Gaji Akhir": 15000000
        },
        {
            id:2,
            Nama: 'Nadini Annisa',
            Divisi: 'SPV',
            Cabang: 'Gor Agus',
            KPI: 15,
            "Total Gaji Akhir": 15000000
        },
        {
            id: 3,
            Nama: 'Nadini Annisa',
            Divisi: 'Content Creator',
            Cabang: 'Lubeg',
            KPI: 10,
            "Total Gaji Akhir": 14000000
        },
        {
            id:4,
            Nama: 'John Doe',
            Divisi: 'Admin',
            Cabang: 'Lubeg',
            KPI: 20,
            "Total Gaji Akhir": 16000000
        },
        { 
            id: 5,
            Nama: 'John Doe',
            Divisi: 'Admin',
            Cabang: 'Lubeg',
            KPI: 20,
            "Total Gaji Akhir": 16000000
        },
        {
            id:6,
            Nama: 'John Doe',
            Divisi: 'Admin',
            Cabang: 'Lubeg',
            KPI: 20,
            "Total Gaji Akhir": 16000000
        },
        {
            id:7,
            Nama: 'John Doe',
            Divisi: 'Admin',
            Cabang: 'Lubeg',
            KPI: 20,
            "Total Gaji Akhir": 16000000
        },
        {
            id:8,
            Nama: 'John Doe',
            Divisi: 'Admin',
            Cabang: 'Lubeg',
            KPI: 20,
            "Total Gaji Akhir": 16000000
        },
        {
            id:9,
            Nama: 'John Doe',
            Divisi: 'Admin',
            Cabang: 'Lubeg',
            KPI: 20,
            "Total Gaji Akhir": 16000000
        },{
            id:10,
            Nama: 'John Doe',
            Divisi: 'Admin',
            Cabang: 'Lubeg',
            KPI: 20,
            "Total Gaji Akhir": 16000000
        },{
            id:11,
            Nama: 'John Doe',
            Divisi: 'Admin',
            Cabang: 'Lubeg',
            KPI: 20,
            "Total Gaji Akhir": 16000000
        },{
            id:12,
            Nama: 'John Doe',
            Divisi: 'Admin',
            Cabang: 'Lubeg',
            KPI: 20,
            "Total Gaji Akhir": 16000000
        },
    ];

    const headers = [
        { label: "#", key: "nomor", align: "text-left" },
        { label: "Nama", key: "Nama", align: "text-left" },
        { label: "Divisi", key: "Divisi", align: "text-left" },
        ...(!isHeadGudang ? [{ label: "Cabang", key: "Cabang", align: "text-left" }] : []),
        { label: "KPI", key: "KPI", align: "text-left" },
        { label: "Total Gaji Akhir", key: "Total Gaji Akhir", align: "text-left" },
    ];

    function formatNumberWithDots(number) {
        return number.toLocaleString('id-ID');
    }

    const filterFields = [
        // Filter Cabang hanya untuk admin
        ...(!isHeadGudang ? [{
            label: "Cabang",
            key: "Cabang",
            options: [
                { label: "Semua", value: "Semua" },
                { label: "Gor Agus", value: "Gor Agus" },
                { label: "Lubeg", value: "Lubeg" },
            ]
        }] : []),
        // Filter Divisi untuk semua role
        {
            label: "Divisi",
            key: "Divisi",
            options: [
                { label: "Semua", value: "Semua" },
                { label: "SPV", value: "SPV" },
                { label: "Content Creator", value: "Content Creator" },
                { label: "Admin", value: "Admin" },
            ]
        }
    ];

    const filteredData = () => {
        let dataToDisplay = [...data];
    
        if (selectedKategori !== "Semua") {
            dataToDisplay = dataToDisplay.filter(item => item.Divisi === selectedKategori);
        }
    
        if (!isHeadGudang && selectedStore !== "Semua") {
            dataToDisplay = dataToDisplay.filter(item => item.Cabang === selectedStore);
        }
    
        return dataToDisplay;
    };

    const navigate = useNavigate()
    const handleRowClick = (row) => {
        navigate('/daftarPenilaianKPI/tambah-kpi', {state: {id:row.id}})
    }

    return (
        <>
            <LayoutWithNav menuItems={menuItems} userOptions={userOptions} showAddNoteButton={true}>
                <div className="p-5">
                    <section className="flex flex-wrap md:flex-nowrap items-center justify-between space-y-2 md:space-y-0">
                        <div className="left w-full md:w-auto">
                            <p className="text-primary text-base font-bold">Daftar Penilaian KPI</p>
                        </div>

                        <div className="right flex flex-wrap md:flex-nowrap items-center space-x-0 md:space-x-4 w-full md:w-auto space-y-2 md:space-y-0">
                            <div className="w-full md:w-auto">
                                <Button label="Export" icon={<svg width="17" height="20" viewBox="0 0 17 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M1.44845 20L0.0742188 18.6012L2.96992 15.7055H0.761335V13.7423H6.30735V19.2883H4.34416V17.1043L1.44845 20ZM8.27054 19.6319V11.7791H0.417777V0H10.2337L16.1233 5.88957V19.6319H8.27054ZM9.25213 6.87117H14.1601L9.25213 1.96319V6.87117Z" fill="#7B0C42" />
                                </svg>} bgColor="border border-secondary" hoverColor="hover:bg-white" textColor="text-black" />
                            </div>
                            <div className="w-full md:w-auto">
                                <Button label={`${formatDate(startDate)} - ${formatDate(endDate)}`} icon={<svg width="17" height="18" viewBox="0 0 17 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M5.59961 1V4.2M11.9996 1V4.2" stroke="#7B0C42" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    <path d="M14.3996 2.60004H3.19961C2.31595 2.60004 1.59961 3.31638 1.59961 4.20004V15.4C1.59961 16.2837 2.31595 17 3.19961 17H14.3996C15.2833 17 15.9996 16.2837 15.9996 15.4V4.20004C15.99961 3.31638 15.2833 2.60004 14.3996 2.60004Z" stroke="#7B0C42" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    <path d="M1.59961 7.39996H15.9996" stroke="#7B0C42" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>} bgColor="border border-secondary" hoverColor="hover:bg-white" textColor="text-black" onClick={toggleModal} />
                            </div>
                        </div>

                            {/* Modal */}
                            {isModalOpen && (
                                <div className="fixed inset-0 bg-white bg-opacity-80 flex justify-center items-center z-50">
                                    <div className="relative flex flex-col items-start p-6 space-y-4 bg-white rounded-lg shadow-md max-w-lg">
                                        <button
                                            onClick={() => setIsModalOpen(false)}
                                            className="absolute top-2 right-2 text-gray-600 hover:text-gray-900"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                        <div className="flex space-x-4 w-full">
                                            <div className="flex flex-col w-full">
                                                <label className="text-sm font-medium text-gray-600 pb-3">Dari</label>
                                                <input
                                                    type="date"
                                                    value={startDate}
                                                    onChange={(e) => setStartDate(e.target.value)}
                                                    className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                                                />
                                            </div>
                                            <div className="flex flex-col w-full">
                                                <label className="text-sm font-medium text-gray-600 pb-3">Ke</label>
                                                <input
                                                    type="date"
                                                    value={endDate}
                                                    onChange={(e) => setEndDate(e.target.value)}
                                                    className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                                                />
                                            </div>
                                        </div>
                                        <div className="flex flex-col space-y-3 w-full">
                                            <button
                                                onClick={handleToday}
                                                className="px-4 py-2 border border-gray-300 text-black rounded-md hover:bg-primary hover:text-white"
                                            >
                                                Hari Ini
                                            </button>
                                            <button
                                                onClick={handleLast7Days}
                                                className="px-4 py-2 border border-gray-300 text-black rounded-md hover:bg-primary hover:text-white"
                                            >
                                                7 Hari Terakhir
                                            </button>
                                            <button
                                                onClick={handleThisMonth}
                                                className="px-4 py-2 border border-gray-300 text-black rounded-md hover:bg-primary hover:text-white"
                                            >
                                                Bulan Ini
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                    </section>

                    <section className="mt-5 bg-white rounded-xl">
                        <div className="p-5">
                            <Table
                                headers={headers}
                                data={filteredData().map((item, index) => ({
                                    ...item,
                                    nomor: index + 1,
                                    "Total Gaji Akhir": `Rp${formatNumberWithDots(item["Total Gaji Akhir"])}`,
                                }))}
                                hasFilter={true}
                                onFilterClick={handleFilterClick}
                                onRowClick={handleRowClick}
                            />
                        </div>
                    </section>
                </div>

                {/* Filter Modal */}
                {isFilterModalOpen && (
                    <div className="fixed inset-0 bg-white bg-opacity-80 flex justify-center items-center z-50">
                        <div className="relative flex flex-col items-start p-6 space-y-4 border w-full bg-white rounded-lg shadow-md max-w-lg">
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
                                            selectedStore={field.key === "Cabang" ? selectedStore : selectedKategori}
                                            onSelect={(value) => field.key === "Cabang" ? setSelectedStore(value) : setSelectedKategori(value)}
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
            </LayoutWithNav>
        </>
    );
}
