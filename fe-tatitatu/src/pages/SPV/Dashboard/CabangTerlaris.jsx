import { useState } from "react";
import Button from "../../../components/Button";
import Navbar from "../../../components/Navbar";
import { menuItems, userOptions } from "../../../data/menu";
import moment from "moment";
import Table from "../../../components/Table";
import LayoutWithNav from "../../../components/LayoutWithNav";

export default function CabangTerlaris(){
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [startDate, setStartDate] = useState(moment().format("YYYY-MM-DD"));
    const [endDate, setEndDate] = useState(moment().format("YYYY-MM-DD"));

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

    const data = {
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
        data: [
            {
                Nama: 'Tatitatu',
                "Barang Terjual": 1300,
                Pemasukan: 180000000,
                Pengeluaran: 80000000,
                Keuntungan: 100000000
            },
            {
                Nama: 'Tatitatu',
                "Barang Terjual": 1300,
                Pemasukan: 180000000,
                Pengeluaran: 80000000,
                Keuntungan: 100000000
            },
            {
                Nama: 'Tatitatu',
                "Barang Terjual": 1300,
                Pemasukan: 180000000,
                Pengeluaran: 80000000,
                Keuntungan: 100000000
            },
            {
                Nama: 'Tatitatu',
                "Barang Terjual": 1300,
                Pemasukan: 180000000,
                Pengeluaran: 80000000,
                Keuntungan: 100000000
            },
            {
                Nama: 'Tatitatu',
                "Barang Terjual": 1300,
                Pemasukan: 180000000,
                Pengeluaran: 80000000,
                Keuntungan: 100000000
            },
            {
                Nama: 'Tatitatu',
                "Barang Terjual": 1300,
                Pemasukan: 180000000,
                Pengeluaran: 80000000,
                Keuntungan: 100000000
            },
            {
                Nama: 'Tatitatu',
                "Barang Terjual": 1300,
                Pemasukan: 180000000,
                Pengeluaran: 80000000,
                Keuntungan: 100000000
            },
            {
                Nama: 'Tatitatu',
                "Barang Terjual": 1300,
                Pemasukan: 180000000,
                Pengeluaran: 80000000,
                Keuntungan: 100000000
            },
            {
                Nama: 'Tatitatu',
                "Barang Terjual": 1300,
                Pemasukan: 180000000,
                Pengeluaran: 80000000,
                Keuntungan: 100000000
            },
            {
                Nama: 'Tatitatu',
                "Barang Terjual": 1300,
                Pemasukan: 180000000,
                Pengeluaran: 80000000,
                Keuntungan: 100000000
            },
            {
                Nama: 'Tatitatu',
                "Barang Terjual": 1300,
                Pemasukan: 180000000,
                Pengeluaran: 80000000,
                Keuntungan: 100000000
            },
            {
                Nama: 'Tatitatu',
                "Barang Terjual": 1300,
                Pemasukan: 180000000,
                Pengeluaran: 80000000,
                Keuntungan: 100000000
            },
            {
                Nama: 'Tatitatu',
                "Barang Terjual": 1300,
                Pemasukan: 180000000,
                Pengeluaran: 80000000,
                Keuntungan: 100000000
            },
        ]
    }

    function formatNumberWithDots(number) {
        return number.toLocaleString('id-ID');
    }

    const headers = [
        { label: "#", key: "nomor", align: "text-left" },
        { label: "Nama", key: "Nama", align: "text-left" },
        { label: "Barang Terjual", key: "Barang Terjual", align: "text-left" },
        { label: "Pemasukan", key: "Pemasukan", align: "text-left" },
        { label: "Pengeluaran", key: "Pengeluaran", align: "text-center" },
        { label: "Keuntungan", key: "Keuntungan", align: "text-center" },
    ];

    return (
        <>
        <LayoutWithNav menuItems={menuItems} userOptions={userOptions}>
            <div className="p-5">
                <section className="flex flex-wrap md:flex-nowrap items-center justify-between space-y-2 md:space-y-0">
                    <div className="left w-full md:w-auto">
                    <p className="text-primary text-base font-bold">Cabang Terbaik</p>
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
                    <div className="p-5 max-w-[1200px] mx-auto">
                        {/* Changed to grid layout for better responsiveness */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            {/* keuntungan */}
                            <div className="w-full">
                                <div className="flex items-center border border-[#F2E8F6] p-4 rounded-lg h-full">
                                    <div className="flex-1">
                                        <p className="text-gray-400 text-sm">Keuntungan Terbanyak</p>
                                        <p className="font-bold text-lg">{data.keuntungan.nama_toko}</p>
                                        <p className="">Rp{formatNumberWithDots(data.keuntungan.jumlah)}</p>
                                    </div>
                                    <div className="flex items-center justify-center ml-4">
                                        <img src="/keuangan/keuntungan.svg" alt="keuntungan" />
                                    </div>
                                </div>
                            </div>

                            {/* pemasukan */}
                            <div className="w-full">
                                <div className="flex items-center border border-[#F2E8F6] p-4 rounded-lg h-full">
                                    <div className="flex-1">
                                        <p className="text-gray-400 text-sm">Pemasukan Terbanyak</p>
                                        <p className="font-bold text-lg">{data.pemasukan.nama_toko}</p>
                                        <p className="">Rp{formatNumberWithDots(data.pemasukan.jumlah)}</p>
                                    </div>
                                    <div className="flex items-center justify-center ml-4">
                                        <img src="/keuangan/pemasukan.svg" alt="pemasukan" />
                                    </div>
                                </div>
                            </div>

                            {/* pengeluaran */}
                            <div className="w-full">
                                <div className="flex items-center border border-[#F2E8F6] p-4 rounded-lg h-full">
                                    <div className="flex-1">
                                        <p className="text-gray-400 text-sm">Pengeluaran Terbanyak</p>
                                        <p className="font-bold text-lg">{data.pengeluaran.nama_toko}</p>
                                        <p className="">Rp{formatNumberWithDots(data.pengeluaran.jumlah)}</p>
                                    </div>
                                    <div className="flex items-center justify-center ml-4">
                                        <img src="/keuangan/pengeluaran.svg" alt="pengeluaran" />
                                    </div>
                                </div>
                            </div>

                            {/* Barang Terbanyak */}
                            <div className="w-full">
                                <div className="flex items-center border border-[#F2E8F6] p-4 rounded-lg h-full">
                                    <div className="flex-1">
                                        <p className="text-gray-400 text-sm">Barang Custom Terlaris</p>
                                        <p className="font-bold text-lg">{data.barang.nama_barang}</p>
                                        <p className="">{formatNumberWithDots(data.barang.jumlah)}</p>
                                    </div>
                                    <div className="flex items-center justify-center ml-4">
                                        <img src="/keuangan/produkterjual.svg" alt="produk" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="mt-5 bg-white rounded-xl">
                    <div className="p-5">
                        <Table
                            headers={headers}
                            data={data.data.map((item, index) => ({
                                ...item,
                                nomor: index + 1,
                                "Barang Terjual": `${formatNumberWithDots(item["Barang Terjual"])}`,
                                Pemasukan: `Rp${formatNumberWithDots(item.Pemasukan)}`,
                                Pengeluaran: `Rp${formatNumberWithDots(item.Pengeluaran)}`,
                                Keuntungan: `Rp${formatNumberWithDots(item.Keuntungan)}`,
                            }))}
                        />
                    </div>
                </section>

            </div>
        </LayoutWithNav>
        </>
    )
}