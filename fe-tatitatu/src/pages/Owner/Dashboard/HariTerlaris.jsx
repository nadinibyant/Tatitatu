import { useState } from "react";
import Button from "../../../components/Button";
import LayoutWithNav from "../../../components/LayoutWithNav";
import moment from "moment";
import Table from "../../../components/Table";

export default function HariTerlaris(){
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

    const [data,setData] = useState([
        {
            nama_toko: 'Tatitatu',
            data: {
                dashboard: {
                    hari_terlaris:{
                        waktu: 'Senin',
                        jumlah: 100001
                    },
                    jam_terpanas: {
                        waktu: '15.00 - 17.00',
                        jumlah: 20
                    }
                },
                data_hari: [
                    {
                        Hari: 'Senin',
                        'Produk Terjual': 1300,
                        'Jam Terpanas': '15.00 - 16.00',
                        'Total Transaksi':180000000
                    },
                    {
                        Hari: 'Senin',
                        'Produk Terjual': 1300,
                        'Jam Terpanas': '15.00 - 16.00',
                        'Total Transaksi':180000000
                    },
                    {
                        Hari: 'Senin',
                        'Produk Terjual': 1300,
                        'Jam Terpanas': '15.00 - 16.00',
                        'Total Transaksi':180000000
                    },
                    {
                        Hari: 'Senin',
                        'Produk Terjual': 1300,
                        'Jam Terpanas': '15.00 - 16.00',
                        'Total Transaksi':180000000
                    }
                ]
            }
        },
        {
            nama_toko: 'Rorotoli',
            data: {
                dashboard: {
                    hari_terlaris:{
                        waktu: 'Senin',
                        jumlah: 100001
                    },
                    jam_terpanas: {
                        waktu: '15.00 - 17.00',
                        jumlah: 20
                    }
                },
                data_hari: [
                    {
                        Hari: 'Senin',
                        'Produk Terjual': 1300,
                        'Jam Terpanas': '15.00 - 16.00',
                        'Total Transaksi':180000000
                    },
                    {
                        Hari: 'Senin',
                        'Produk Terjual': 1300,
                        'Jam Terpanas': '15.00 - 16.00',
                        'Total Transaksi':180000000
                    },
                    {
                        Hari: 'Senin',
                        'Produk Terjual': 1300,
                        'Jam Terpanas': '15.00 - 16.00',
                        'Total Transaksi':180000000
                    },
                    {
                        Hari: 'Senin',
                        'Produk Terjual': 1300,
                        'Jam Terpanas': '15.00 - 16.00',
                        'Total Transaksi':180000000
                    }
                ]
            }
        }
    ])

    const headers = [
        { label: "#", key: "nomor", align: "text-left" },
        { label: "Hari", key: "Hari", align: "text-left" },
        { label: "Produk Terjual", key: "Produk Terjual", align: "text-left" },
        { label: "Jam Terpanas", key: "Jam Terpanas", align: "text-left" },
        { label: "Total Transaksi", key: "Total Transaksi", align: "text-left" },
    ];

    function formatNumberWithDots(number) {
        return number.toLocaleString('id-ID');
    }

    return(
        <>
        <LayoutWithNav>
            <div className="p-5">
            <section className="flex flex-wrap md:flex-nowrap items-center justify-between space-y-2 md:space-y-0">
                    <div className="left w-full md:w-auto">
                        <p className="text-primary text-base font-bold">Hari Terlaris</p>
                    </div>

                    <div className="right flex flex-wrap md:flex-nowrap items-center space-x-0 md:space-x-4 w-full md:w-auto space-y-2 md:space-y-0">
                    <div className="w-full md:w-auto">
                        <Button 
                            label={`${formatDate(startDate)} - ${formatDate(endDate)}`} 
                            icon={<svg width="17" height="18" viewBox="0 0 17 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M5.59961 1V4.2M11.9996 1V4.2" stroke="#7B0C42" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M14.3996 2.60004H3.19961C2.31595 2.60004 1.59961 3.31638 1.59961 4.20004V15.4C1.59961 16.2837 2.31595 17 3.19961 17H14.3996C15.2833 17 15.9996 16.2837 15.9996 15.4V4.20004C15.99961 3.31638 15.2833 2.60004 14.3996 2.60004Z" stroke="#7B0C42" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M1.59961 7.39996H15.9996" stroke="#7B0C42" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>} 
                            bgColor="border border-secondary" 
                            hoverColor="hover:bg-white" 
                            textColor="text-black" 
                            onClick={toggleModal} 
                        />
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

                {data.map((toko, index) => (
                    <section key={index} className="mt-5 bg-white rounded-xl">
                        <div className="p-2 pb-0">
                            <div className="w-full p-4 rounded-lg flex items-center gap-3">
                                <div className="flex items-center justify-center w-8 h-8 rounded-lg">
                                    <svg width="25" height="26" viewBox="0 0 25 26" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M1.77506 2.27503C1.54232 2.73795 1.42787 3.31146 1.19899 4.4559L0.430023 8.30071C0.321042 8.82494 0.320198 9.36589 0.427543 9.89045C0.534887 10.415 0.74816 10.9122 1.05431 11.3514C1.36045 11.7907 1.75303 12.1629 2.20801 12.4452C2.66299 12.7274 3.17079 12.9139 3.70033 12.9931C4.22987 13.0723 4.77001 13.0426 5.28768 12.9059C5.80534 12.7691 6.28965 12.5281 6.71094 12.1976C7.13224 11.8672 7.48166 11.4542 7.73781 10.984C7.99396 10.5138 8.15146 9.99633 8.20066 9.46316L8.29067 8.57589C8.24194 9.14019 8.31145 9.70845 8.49478 10.2444C8.6781 10.7803 8.97119 11.272 9.35534 11.6883C9.73948 12.1045 10.2062 12.436 10.7257 12.6616C11.2453 12.8873 11.8061 13.002 12.3725 12.9986C12.9389 12.9952 13.4984 12.8737 14.0151 12.6418C14.5319 12.4099 14.9946 12.0728 15.3737 11.652C15.7528 11.2312 16.0399 10.7359 16.2168 10.1978C16.3936 9.65975 16.4563 9.0907 16.4008 8.52703L16.4947 9.46316C16.5439 9.99633 16.7014 10.5138 16.9575 10.984C17.2137 11.4542 17.5631 11.8672 17.9844 12.1976C18.4057 12.5281 18.89 12.7691 19.4076 12.9059C19.9253 13.0426 20.4654 13.0723 20.995 12.9931C21.5245 12.9139 22.0323 12.7274 22.4873 12.4452C22.9423 12.1629 23.3349 11.7907 23.641 11.3514C23.9472 10.9122 24.1604 10.415 24.2678 9.89045C24.3751 9.36589 24.3743 8.82494 24.2653 8.30071L23.4963 4.4559C23.2674 3.31146 23.153 2.73924 22.9202 2.27503C22.6777 1.79158 22.3363 1.36454 21.918 1.02161C21.4998 0.67868 21.0141 0.427534 20.4925 0.284472C19.991 0.146881 19.4072 0.146881 18.2396 0.146881H6.45571C5.28812 0.146881 4.70432 0.146881 4.20283 0.284472C3.68123 0.427534 3.19554 0.67868 2.77729 1.02161C2.35904 1.36454 2.01758 1.79158 1.77506 2.27503ZM20.4089 14.9346C21.4136 14.9372 22.4019 14.6798 23.2777 14.1875V15.5776C23.2777 20.4267 23.2777 22.8518 21.7707 24.3576C20.5581 25.5715 18.7514 25.8068 15.5624 25.8531V21.3641C15.5624 20.1618 15.5624 19.5613 15.3039 19.1138C15.1346 18.8206 14.8912 18.5771 14.598 18.4078C14.1505 18.1493 13.55 18.1493 12.3477 18.1493C11.1453 18.1493 10.5448 18.1493 10.0973 18.4078C9.80415 18.5771 9.56068 18.8206 9.39139 19.1138C9.13293 19.5613 9.13293 20.1618 9.13293 21.3641V25.8531C5.94392 25.8068 4.13725 25.5702 2.92465 24.3576C1.41759 22.8518 1.41759 20.4267 1.41759 15.5776V14.1875C2.29381 14.68 3.28256 14.9374 4.28769 14.9346C5.77372 14.9356 7.20442 14.371 8.28939 13.3555C9.39489 14.3744 10.8443 14.9383 12.3477 14.9346C13.851 14.9383 15.3004 14.3744 16.4059 13.3555C17.4909 14.371 18.9229 14.9356 20.4089 14.9346Z" fill="#7B0C42"/>
                                    </svg>
                                </div>
                                <h2 className="text-lg font-bold text-[#93025F]">{toko.nama_toko}</h2>
                            </div>
                        </div>

                        <div className="px-5 pb-5">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                <div className="w-full">
                                    <div className="flex items-center border border-[#F2E8F6] p-4 rounded-lg h-full">
                                        <div className="flex-1">
                                            <p className="text-gray-400 text-sm">Hari Terlaris</p>
                                            <p className="font-bold text-lg">{toko.data.dashboard.hari_terlaris.waktu}</p>
                                            <p className="">Rp{formatNumberWithDots(toko.data.dashboard.hari_terlaris.jumlah)}</p>
                                        </div>
                                        <div className="flex items-center justify-center ml-4">
                                            <img src="/Dashboard Produk/hariterlaris.svg" alt="hariterlaris" />
                                        </div>
                                    </div>
                                </div>

                                <div className="w-full">
                                    <div className="flex items-center border border-[#F2E8F6] p-4 rounded-lg h-full">
                                        <div className="flex-1">
                                            <p className="text-gray-400 text-sm">Jam Terpanas</p>
                                            <p className="font-bold text-lg">{toko.data.dashboard.jam_terpanas.waktu}</p>
                                            <p className="">Rp{formatNumberWithDots(toko.data.dashboard.jam_terpanas.jumlah)}</p>
                                        </div>
                                        <div className="flex items-center justify-center ml-4">
                                            <img src="/Dashboard Produk/hariterlaris.svg" alt="hariterlaris" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-5 pt-0">
                            <Table
                                headers={headers}
                                data={toko.data.data_hari.map((item, index) => ({
                                    ...item,
                                    nomor: index + 1,
                                    "Produk Terjual": `${item["Produk Terjual"]} Pcs`,
                                    "Total Transaksi": `Rp${formatNumberWithDots(item["Total Transaksi"])}`,
                                }))}
                            />      
                        </div>
                    </section>
                ))}
            </div>
        </LayoutWithNav>
        </>
    )
}