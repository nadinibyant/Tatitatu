import { useEffect, useState } from "react";
import Button from "../../../components/Button";
import ButtonDropdown from "../../../components/ButtonDropdown";
import Navbar from "../../../components/Navbar";
import { menuItems, userOptions } from "../../../data/menuSpv";
import moment from "moment";
import Table from "../../../components/Table";
import { useNavigate } from "react-router-dom";
import ActionMenu from "../../../components/ActionMenu";

export default function Penjualan() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [startDate, setStartDate] = useState(moment().format("YYYY-MM-DD"));
    const [endDate, setEndDate] = useState(moment().format("YYYY-MM-DD"));
    const [selectedJenis, setSelectedJenis] = useState("Pemasukan");
    const [selectedStore, setSelectedStore] = useState("Semua");

    const data = [
        {
            Nomor: 'STK123',
            Tanggal: '2024-12-12',
            Cabang: 'Gor Agus',
            "Nama Barang": "Gelang Barbie, Gelang Bulan, Gelang Baru, Gelang Bagus, Gelang Aja",
            "Jumlah Barang": 2,
            Diskon: 11,
            Pajak: 11,
            "Total Transaksi": 200000,
            tipe: 'custom'
        },
        {
            Nomor: 'STK124',
            Tanggal: '2024-12-13',
            Cabang: 'Lubeg',
            "Nama Barang": "Gelang Barbie, Gelang Bulan, Gelang Baru",
            "Jumlah Barang": 3,
            Diskon: 5,
            Pajak: 5,
            "Total Transaksi": 150000,
            tipe: 'non-custom'
        }
    ];

    useEffect(() => {
        setSelectedStore("Semua");
    }, []);

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

    const dataCabang = [
        { label: 'Semua', value: 'Semua', icon: '/icon/toko.svg' },
        { label: 'Gor Agus', value: 'Gor Agus', icon: '/icon/toko.svg' },
        { label: 'Lubeg', value: 'Lubeg', icon: '/icon/toko.svg' },
    ];

    const headers = [
        { label: "Nomor", key: "Nomor", align: "text-left" },
        { label: "Tanggal", key: "Tanggal", align: "text-center" },
        { label: "Nama Barang", key: "Nama Barang", align: "text-left" },
        { label: "Jumlah Barang", key: "Jumlah Barang", align: "text-left" },
        { label: "Diskon", key: "Diskon", align: "text-center" },
        { label: "Pajak", key: "Pajak", align: "text-center" },
        { label: "Total Transaksi", key: "Total Transaksi", align: "text-center" },
        { label: "Aksi", key: "action", align: "text-center" },
    ];

    const formatNamaBarang = (namaBarang) => {
        const items = namaBarang.split(',');
        if (items.length > 2) {
            return (
                <>
                    {items.slice(0, 2).join(', ')}{" "}
                    <span className="text-gray-500">+ {items.length - 2} lainnya</span>
                </>
            );
        }
        return items.join(', ');
    };

    const formatRupiah = (amount) => {
        return `Rp ${amount.toLocaleString('id-ID')}`;
    };

    const selectedData = data.filter((item) => {

        const isStoreMatch = selectedStore === 'Semua' || item.Cabang === selectedStore;

        const itemDate = moment(item.Tanggal);
        const isDateMatch = itemDate.isBetween(startDate, endDate, null, '[]');

        return isStoreMatch && isDateMatch;
    });

    const navigate = useNavigate()
    const handleRowClick = (row) => {
        navigate('/penjualanToko/detail', {state: {nomor: row.Nomor, tipe: row.tipe}})
    }

    const handleEdit = (nomor) => {
        // Add your edit logic here
        console.log('Editing item:', nomor);
    };
    
    const handleDelete = (nomor) => {
        // Add your delete logic here
        console.log('Deleting item:', nomor);
    };

    return (
        <>
            <Navbar menuItems={menuItems} userOptions={userOptions}>
                <div className="p-5">
                    <section className="flex flex-wrap md:flex-nowrap items-center justify-between space-y-2 md:space-y-0">
                        <div className="left w-full md:w-auto">
                            <p className="text-primary text-base font-bold">Daftar Penjualan Toko</p>
                        </div>

                        <div className="right flex flex-wrap md:flex-nowrap items-center space-x-0 md:space-x-4 w-full md:w-auto space-y-2 md:space-y-0">
                            <div className="w-full md:w-auto">
                                <Button label="Export" icon={<svg width="17" height="20" viewBox="0 0 17 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M1.44845 20L0.0742188 18.6012L2.96992 15.7055H0.761335V13.7423H6.30735V19.2883H4.34416V17.1043L1.44845 20ZM8.27054 19.6319V11.7791H0.417777V0H10.2337L16.1233 5.88957V19.6319H8.27054ZM9.25213 6.87117H14.1601L9.25213 1.96319V6.87117Z" fill="#7B0C42" />
                                </svg>} bgColor="border border-secondary" hoverColor="hover:bg-white" textColor="text-black" />
                            </div>
                            <div className="w-full md:w-auto">
                                <ButtonDropdown selectedIcon={'/icon/toko.svg'} options={dataCabang} onSelect={(value) => setSelectedStore(value)} />
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
                            data={selectedData.map((item, index) => ({
                                ...item,
                                "Nama Barang": formatNamaBarang(item["Nama Barang"]),
                                "Total Transaksi": formatRupiah(item["Total Transaksi"]),
                                "Diskon": `${item["Diskon"]}%`,
                                "action": <ActionMenu 
                                    onEdit={() => handleEdit(item.Nomor)} 
                                    onDelete={() => handleDelete(item.Nomor)}
                                />
                            }))}
                            onRowClick={handleRowClick}
                        />
                        </div>
                    </section>
                </div>
            </Navbar>
        </>
    );
}
