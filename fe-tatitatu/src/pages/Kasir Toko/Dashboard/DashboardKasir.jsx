import { useEffect, useState } from "react";
import Button from "../../../components/Button";
import LayoutWithNav from "../../../components/LayoutWithNav";
import moment from "moment";
import Table from "../../../components/Table";
import { useNavigate } from "react-router-dom";

export default function DashboardKasir(){
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [startDate, setStartDate] = useState(moment().format("YYYY-MM-DD"));
    const [endDate, setEndDate] = useState(moment().format("YYYY-MM-DD"));
    const navigate = useNavigate()

    useEffect(() => {
        const userData = JSON.parse(localStorage.getItem('userData'));
        if (!userData || userData.role !== 'kasirtoko') {
            navigate('/login');
            return;
        }
    }, [navigate]);

    // Data untuk target dan penjualan
    const [data, setData] = useState({
        target: {
            tercapai: 1500000,
            tersisa: 2500000
        },
        barang_terlaris: [
            { 
                No: 1,
                Foto: '/icon/produk.svg',
                "Nama Barang": "Mutiara Hitam",
                Terjual: 1001
            },
            { 
                No: 2,
                Foto: '/icon/produk.svg',
                "Nama Barang": "Mutiara Hitam",
                Terjual: 1001
            },
            { 
                No: 3,
                Foto: '/icon/produk.svg',
                "Nama Barang": "Mutiara Hitam",
                Terjual: 1001
            },
        ],
        transaksi: [
            {
                Nomor: "STK1323",
                Tanggal: "31/05/2024",
                items: [
                    "Gelang Barbie",
                    "Gelang Bulan",
                    "Kalung Mutiara",
                    "Cincin Perak",
                    "Gelang Perak"
                ],
                "Total Transaksi": 200000
            },
            {
                Nomor: "STK1324",
                Tanggal: "31/05/2024",
                items: [
                    "Gelang Emas",
                    "Kalung Emas"
                ],
                "Total Transaksi": 350000
            },
            {
                Nomor: "STK1325",
                Tanggal: "31/05/2024",
                items: [
                    "Gelang Silver"
                ],
                "Total Transaksi": 150000
            }
        ]
    });

    // Headers untuk kedua tabel
    const headersBarangTerlaris = [
        { label: "#", key: "No", align: "text-left" },
        { label: "Foto", key: "Foto", align: "text-left" },
        { label: "Nama Barang", key: "Nama Barang", align: "text-left" },
        { label: "Terjual", key: "Terjual", align: "text-center" },
    ];

    const headersTransaksi = [
        { label: "Nomor", key: "Nomor", align: "text-left" },
        { label: "Tanggal", key: "Tanggal", align: "text-left" },
        { label: "Nama Barang", key: "Nama Barang", align: "text-left" },
        { label: "Total Transaksi", key: "Total Transaksi", align: "text-left" },
    ];

    // Fungsi untuk menghandle calendar
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

    const formatNamaBarang = (items) => {
    if (items.length <= 2) {
        return items.join(", ");
    }
        return `${items[0]}, ${items[1]}, +${items.length - 2} Lainnya`;
    };

    return(
        <LayoutWithNav>
            <div className="p-5">
                {/* Header section */}
                <section className="flex flex-wrap md:flex-nowrap items-center justify-between space-y-2 md:space-y-0">
                        <div className="left w-full md:w-auto">
                            <p className="text-primary text-base font-bold">Dashboard</p>
                        </div>

                        <div className="right flex flex-wrap md:flex-nowrap items-center space-x-0 md:space-x-4 w-full md:w-auto space-y-2 md:space-y-0">
                            <div className="w-full md:w-auto">
                                <Button 
                                    label={`${formatDate(startDate)} - ${formatDate(endDate)}`} 
                                    icon={
                                        <svg width="17" height="18" viewBox="0 0 17 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M5.59961 1V4.2M11.9996 1V4.2" stroke="#7B0C42" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                            <path d="M14.3996 2.60004H3.19961C2.31595 2.60004 1.59961 3.31638 1.59961 4.20004V15.4C1.59961 16.2837 2.31595 17 3.19961 17H14.3996C15.2833 17 15.9996 16.2837 15.9996 15.4V4.20004C15.99961 3.31638 15.2833 2.60004 14.3996 2.60004Z" stroke="#7B0C42" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                            <path d="M1.59961 7.39996H15.9996" stroke="#7B0C42" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    } 
                                    bgColor="border border-secondary" 
                                    hoverColor="hover:bg-white" 
                                    textColor="text-black" 
                                    onClick={toggleModal} 
                                />
                            </div>
                        </div>

                        {/* Modal Calendar */}
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

                {/* Target section */}
                <section className="mt-5">
                    <div className="bg-white rounded-lg p-4">
                        <div className="flex items-center gap-2">
                            <img src="/Icon Warna/targetBulanan.svg" alt="target" className="w-6 h-6"/>
                            <h2 className="font-bold text-lg">Target Bulanan Kasir</h2>
                        </div>
                        <div className="mt-4 relative">
                            <div className="flex justify-between mb-2">
                                <span>Rp{data.target.tercapai.toLocaleString('id-ID')} Tercapai</span>
                                <span>Rp{data.target.tersisa.toLocaleString('id-ID')} Tersisa</span>
                            </div>
                            <div className="w-full h-4 bg-pink rounded-full overflow-hidden">
                                <div 
                                    className="h-full bg-primary rounded-full"
                                    style={{ 
                                        width: `${(data.target.tercapai / (data.target.tercapai + data.target.tersisa)) * 100}%`
                                    }}
                                ></div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Tabel section */}
                <div className="mt-5 grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {/* Search dan tabel transaksi */}
                    <section className="bg-white rounded-lg p-4">
                        <div className="mt-4">
                            <Table
                                headers={headersTransaksi}
                                data={data.transaksi.map(item => ({
                                    ...item,
                                    "Nama Barang": formatNamaBarang(item.items),
                                    "Total Transaksi": `Rp${item["Total Transaksi"].toLocaleString('id-ID')}`
                                }))}
                                hasSearch={true}
                                hasPagination={true}
                            />
                        </div>
                    </section>

                    {/* Tabel barang terlaris */}
                    <section className="bg-white rounded-lg p-4">
                        <h2 className="font-bold mb-4">10 Barang Terlaris Cabang</h2>
                        <Table
                            headers={headersBarangTerlaris}
                            data={data.barang_terlaris.map(item => ({
                                ...item,
                                Terjual:`${item.Terjual.toLocaleString('id-ID')} Pcs`,
                                Foto: <img src={item.Foto} alt={item["Nama Barang"]} className="w-8 h-8"/>
                            }))}
                            hasSearch={false}
                            hasPagination={false}
                        />
                    </section>
                </div>
            </div>
        </LayoutWithNav>
    )
}