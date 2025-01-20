import { useEffect, useState } from "react";
import Button from "../../../components/Button";
import LayoutWithNav from "../../../components/LayoutWithNav";
import moment from "moment";
import Table from "../../../components/Table";

export default function TokoTerbaik(){
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedMonth, setSelectedMonth] = useState(moment().format('MM'));
    const [selectedYear, setSelectedYear] = useState(moment().format('YYYY'));

    const monthValue = `${selectedYear}-${selectedMonth}`;

    const handleMonthChange = (e) => {
      const value = e.target.value; 
      const [year, month] = value.split('-');
      setSelectedMonth(month);
      setSelectedYear(year);
    };
    //   const [startDate, setStartDate] = useState(moment().format("YYYY-MM-DD"));
    //   const [endDate, setEndDate] = useState(moment().format("YYYY-MM-DD"));


    //   const handleToday = () => {
    //     const today = moment().startOf("day");
    //     setStartDate(today.format("YYYY-MM-DD"));
    //     setEndDate(today.format("YYYY-MM-DD"));
    //     setIsModalOpen(false);
    //   };
    
    //   const handleLast7Days = () => {
    //     const today = moment().startOf("day");
    //     const sevenDaysAgo = today.clone().subtract(7, "days");
    //     setStartDate(sevenDaysAgo.format("YYYY-MM-DD"));
    //     setEndDate(today.format("YYYY-MM-DD"));
    //     setIsModalOpen(false);
    //   };
    
    //   const handleThisMonth = () => {
    //     const startMonth = moment().startOf("month");
    //     const endMonth = moment().endOf("month");
    //     setStartDate(startMonth.format("YYYY-MM-DD"));
    //     setEndDate(endMonth.format("YYYY-MM-DD"));
    //     setIsModalOpen(false);
    //   };
    
    //   const toggleModal = () => setIsModalOpen(!isModalOpen);
    
    //   const formatDate = (date) =>
    //     new Date(date).toLocaleDateString("en-US", {
    //       month: "short",
    //       day: "2-digit",
    //       year: "numeric",
    //     });
        const data = {
            dashboard: {
                keuntungan: {
                    nama_toko: 'Tatitatu',
                    jumlah: 10000000
                },
                pemasukan: {
                    nama_toko: 'Rumah Produksi',
                    jumlah: 65000000
                },
                pengeluaran: {
                    nama_toko: 'Tatitatu',
                    jumlah: 100000000
                },
                barang: {
                    nama_barang:'Bonifade',
                    jumlah: 1200
                },
            },
            data_toko: [
                {
                    Nama: 'Tatitatu',
                    'Barang Terjual': 1300,
                    Pemasukan: 180000000,
                    Pengeluaran: 80000000,
                    Keuntungan: 100000000
                },
                {
                    Nama: 'Tatitatu',
                    'Barang Terjual': 1300,
                    Pemasukan: 180000000,
                    Pengeluaran: 80000000,
                    Keuntungan: 100000000
                },
                {
                    Nama: 'Tatitatu',
                    'Barang Terjual': 1300,
                    Pemasukan: 180000000,
                    Pengeluaran: 80000000,
                    Keuntungan: 100000000
                },
                {
                    Nama: 'Tatitatu',
                    'Barang Terjual': 1300,
                    Pemasukan: 180000000,
                    Pengeluaran: 80000000,
                    Keuntungan: 100000000
                }
            ]
        }

        function formatNumberWithDots(number) {
            return number.toLocaleString('id-ID');
        }

        const renderOverviewSection = () => {
            return (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Keuntungan Card */}
                    <div className="w-full">
                        <div className="flex items-center border border-[#F2E8F6] p-4 rounded-lg h-full">
                            <div className="flex-1">
                                <p className="text-gray-400 text-sm">Keuntungan Terbanyak</p>
                                <p className="font-bold text-lg">{data.dashboard.keuntungan.nama_toko}</p>
                                <p className="">Rp{formatNumberWithDots(data.dashboard.keuntungan.jumlah)}</p>
                            </div>
                            <div className="flex items-center justify-center ml-4">
                                <img src="/keuangan/keuntungan.svg" alt="keuntungan" />
                            </div>
                        </div>
                    </div>
        
                    {/* Pemasukan Card */}
                    <div className="w-full">
                        <div className="flex items-center border border-[#F2E8F6] p-4 rounded-lg h-full">
                            <div className="flex-1">
                                <p className="text-gray-400 text-sm">Pemasukan Terbanyak</p>
                                <p className="font-bold text-lg">{data.dashboard.pemasukan.nama_toko}</p>
                                <p className="">Rp{formatNumberWithDots(data.dashboard.pemasukan.jumlah)}</p>
                            </div>
                            <div className="flex items-center justify-center ml-4">
                                <img src="/keuangan/pemasukan.svg" alt="pemasukan" />
                            </div>
                        </div>
                    </div>
        
                    {/* Pengeluaran Card */}
                    <div className="w-full">
                        <div className="flex items-center border border-[#F2E8F6] p-4 rounded-lg h-full">
                            <div className="flex-1">
                                <p className="text-gray-400 text-sm">Pengeluaran Terbanyak</p>
                                <p className="font-bold text-lg">{data.dashboard.pengeluaran.nama_toko}</p>
                                <p className="">Rp{formatNumberWithDots(data.dashboard.pengeluaran.jumlah)}</p>
                            </div>
                            <div className="flex items-center justify-center ml-4">
                                <img src="/keuangan/pengeluaran.svg" alt="pengeluaran" />
                            </div>
                        </div>
                    </div>
        
                    {/* Barang Custom Card */}
                    <div className="w-full">
                        <div className="flex items-center border border-[#F2E8F6] p-4 rounded-lg h-full">
                            <div className="flex-1">
                                <p className="text-gray-400 text-sm">Barang Custom Terlaris</p>
                                <p className="font-bold text-lg">{data.dashboard.barang.nama_barang}</p>
                                <p className="">{formatNumberWithDots(data.dashboard.barang.jumlah)}</p>
                            </div>
                            <div className="flex items-center justify-center ml-4">
                                <img src="/keuangan/produkterjual.svg" alt="produk" />
                            </div>
                        </div>
                    </div>
                </div>
            );
        };

        const headers = [
            { label: "#", key: "nomor", align: "text-left" },
            { label: "Nama", key: "Nama", align: "text-left" },
            { label: "Barang Terjual", key: "Barang Terjual", align: "text-left" },
            { label: "Pemasukan", key: "Pemasukan", align: "text-left" },
            { label: "Pengeluaran", key: "Pengeluaran", align: "text-left" },
            { label: "Keuntungan", key: "Keuntungan", align: "text-left" },
        ];
    return(
        <>
        <LayoutWithNav>
            <div className="p-5">
                <section className="flex flex-wrap md:flex-nowrap items-center justify-between space-y-2 md:space-y-0">
                    <div className="left w-full md:w-auto">
                        <p className="text-primary text-base font-bold">Toko Terbaik</p>
                    </div>

                    <div className="right flex flex-wrap md:flex-nowrap items-center space-x-0 md:space-x-4 w-full md:w-auto space-y-2 md:space-y-0">
                    <div className="w-full md:w-auto">
                        <Button 
                            label="Export" 
                            icon={<svg width="17" height="20" viewBox="0 0 17 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M1.44845 20L0.0742188 18.6012L2.96992 15.7055H0.761335V13.7423H6.30735V19.2883H4.34416V17.1043L1.44845 20ZM8.27054 19.6319V11.7791H0.417777V0H10.2337L16.1233 5.88957V19.6319H8.27054ZM9.25213 6.87117H14.1601L9.25213 1.96319V6.87117Z" fill="#7B0C42" />
                            </svg>} 
                            bgColor="border border-secondary" 
                            hoverColor="hover:bg-white" 
                            textColor="text-black" 
                        />
                    </div>
                    <div className="w-full md:w-auto">
                        <input 
                            type="month"
                            value={monthValue}
                            onChange={handleMonthChange}
                            className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                            style={{
                                maxWidth: '200px',
                            }}
                        />
                    </div>
                </div>

                    {/* Modal */}
                    {/* {isModalOpen && (
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
                    )} */}
                </section>

                <section className="mt-5 bg-white rounded-xl">
                    <div className="p-5">
                        {renderOverviewSection()}
                    </div>
                </section>

                <section className="mt-5 bg-white rounded-xl">
                    <div className="p-5">
                        <Table
                            headers={headers}
                            data={data.data_toko.map((item, index) => ({
                                ...item,
                                nomor: index + 1,
                                "Barang Terjual": `${item["Barang Terjual"]} Pcs`,
                                Pemasukan: `Rp${formatNumberWithDots(item.Pemasukan)}`,
                                Pengeluaran: `Rp${formatNumberWithDots(item.Pengeluaran)}`,
                                Keuntungan: `Rp${formatNumberWithDots(item.Keuntungan)}`
                            }))}
                        />           
                    </div>
                </section>
            </div>
        </LayoutWithNav>
        </>
    )
}