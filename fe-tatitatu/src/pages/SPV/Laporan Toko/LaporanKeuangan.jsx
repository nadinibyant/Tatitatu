import Navbar from "../../../components/Navbar";
import { menuItems, userOptions } from "../../../data/menuSpv";
import moment from "moment";
import { useEffect, useState } from "react";
import ButtonDropdown from "../../../components/ButtonDropdown";
import Button from "../../../components/Button";
import Table from "../../../components/Table";
import { useNavigate } from "react-router-dom";

export default function LaporanKeuangan() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [startDate, setStartDate] = useState(moment().format("YYYY-MM-DD"));
    const [endDate, setEndDate] = useState(moment().format("YYYY-MM-DD"));
    const [selectedJenis, setSelectedJenis] = useState("Pemasukan");
    const [selectedStore, setSelectedStore] = useState("Semua"); 

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
        { label: "Nomor", key: "nomor", align: "text-left" },
        { label: "Tanggal", key: "tanggal", align: "text-center" },
        { label: "Deskripsi", key: "deskripsi", align: "text-left" },
        { label: "Cabang", key: "cabang", align: "text-left" },
        { label: "Kategori", key: "kategori", align: "text-center" },
        { label: "Total", key: "total", align: "text-center" },
    ];

    // const data = {
    //     keuntungan: 10000000,
    //     pemasukan: 10000000,
    //     pengeluaran: 10000000,
    //     produkTerjual: 120,
    //     dataLaporan: [
    //         {
    //             id_jenis: 1,
    //             nama_jenis: 'Pemasukan',
    //             data: [
    //                 {
    //                     nomor: 'BBN123',
    //                     tanggal: '2024-12-12',
    //                     deskripsi: 'Pengeluaran Buat Listrik',
    //                     cabang: "Gor Agus",
    //                     kategori: 'Beban Operasional',
    //                     total: 10000,
    //                     jenis: 'non-penjualan',
    //                     detail: {
    //                         nomor: 'INC123',
    //                         tanggal: '2024-12-12',
    //                         kategori: 'Hibah',
    //                         bayar: 'Cash',
    //                         metode: '-',
    //                         dataDetail: [
    //                             {
    //                                 deskripsi: 'Dana Hibah',
    //                                 toko: 'Tatitatu',
    //                                 cabang: 'Cabang Gor HAS Padang',
    //                                 pengeluaran: 1000000
    //                             },
    //                             {
    //                                 deskripsi: 'Dana Hibah',
    //                                 toko: 'Tatitatu',
    //                                 cabang: 'Cabang Gor HAS Padang',
    //                                 pengeluaran: 1000000
    //                             },
    //                             {
    //                                 deskripsi: 'Dana Hibah',
    //                                 toko: 'Tatitatu',
    //                                 cabang: 'Cabang Gor HAS Padang',
    //                                 pengeluaran: 1000000
    //                             },
    //                         ],
    //                         total_detail: 2000000
    //                     }
    //                 },
    //                 {
    //                     nomor: 'BBN124',
    //                     tanggal: '2024-12-12',
    //                     deskripsi: 'Pengeluaran Buat Listrik',
    //                     cabang: "Gor Agus",
    //                     kategori: 'Beban Operasional',
    //                     total: 10000,
    //                     jenis: 'non-penjualan',
    //                     detail: {
    //                         nomor: 'INC123',
    //                         tanggal: '2024-12-12',
    //                         kategori: 'Hibah',
    //                         bayar: 'Cash',
    //                         metode: '-',
    //                         dataDetail: [
    //                             {
    //                                 deskripsi: 'Dana Hibah',
    //                                 toko: 'Tatitatu',
    //                                 cabang: 'Cabang Gor HAS Padang',
    //                                 pengeluaran: 1000000
    //                             },
    //                             {
    //                                 deskripsi: 'Dana Hibah',
    //                                 toko: 'Tatitatu',
    //                                 cabang: 'Cabang Gor HAS Padang',
    //                                 pengeluaran: 1000000
    //                             },
    //                             {
    //                                 deskripsi: 'Dana Hibah',
    //                                 toko: 'Tatitatu',
    //                                 cabang: 'Cabang Gor HAS Padang',
    //                                 pengeluaran: 1000000
    //                             },
    //                         ],
    //                         total_detail: 2000000
    //                     }
    //                 },
    //                 {
    //                     nomor: 'BBN125',
    //                     tanggal: '2024-12-12',
    //                     deskripsi: 'Pengeluaran Buat Listrik',
    //                     cabang: "Lubeg",
    //                     kategori: 'Beban Operasional',
    //                     total: 10000,
    //                     jenis: 'penjualan',
    //                     detail: {
    //                         nomor: 'INV123',
    //                         tanggal: '2024-12-12',
    //                         nama_pembeli: 'Suryani',
    //                         bayar: 'Cash',
    //                         metode: '-',
    //                         data_produk: [
    //                             {
    //                                 "Foto Produk": "https://via.placeholder.com/150",
    //                                 "Nama Produk": "Gelang Cantik",
    //                                 "Jenis Barang": "Barang Handmade",
    //                                 "Harga Satuan": 15000,
    //                                 kuantitas: 10,
    //                                 "Total Biaya": 150000
    //                             },
    //                             {
    //                                 "Foto Produk": "https://via.placeholder.com/150",
    //                                 "Nama Produk": "Gelang Cantik",
    //                                 "Jenis Barang": "Barang Handmade",
    //                                 "Harga Satuan": 15000,
    //                                 kuantitas: 10,
    //                                 "Total Biaya": 150000
    //                             },
    //                         ],
    //                         data_packaging: [
    //                             {
    //                                 "Nama Packaging": "zipper",
    //                                 "Harga Satuan": "1000",
    //                                 kuantitas: 10,
    //                                 "Total Biaya": 10000
    //                             }
    //                         ],
    //                         sub_total: 8000,
    //                         diskon: 30,
    //                         pajak: 1000,
    //                         total_penjualan: 18000
    //                     }
    //                 },
    //                 {
    //                     nomor: 'BBN126',
    //                     tanggal: '2024-12-12',
    //                     deskripsi: 'Pengeluaran Buat Listrik',
    //                     cabang: "Lubeg",
    //                     kategori: 'Beban Operasional',
    //                     total: 10000,
    //                     jenis: 'penjualan',
    //                     detail: {
    //                         nomor: 'INV123',
    //                         tanggal: '2024-12-12',
    //                         nama_pembeli: 'Suryani',
    //                         bayar: 'Cash',
    //                         metode: '-',
    //                         data_produk: [
    //                             {
    //                                 "Foto Produk": "https://via.placeholder.com/150",
    //                                 "Nama Produk": "Gelang Cantik",
    //                                 "Jenis Barang": "Barang Handmade",
    //                                 "Harga Satuan": 15000,
    //                                 kuantitas: 10,
    //                                 "Total Biaya": 150000
    //                             },
    //                             {
    //                                 "Foto Produk": "https://via.placeholder.com/150",
    //                                 "Nama Produk": "Gelang Cantik",
    //                                 "Jenis Barang": "Barang Handmade",
    //                                 "Harga Satuan": 15000,
    //                                 kuantitas: 10,
    //                                 "Total Biaya": 150000
    //                             },
    //                         ],
    //                         data_packaging: [
    //                             {
    //                                 "Nama Packaging": "zipper",
    //                                 "Harga Satuan": "1000",
    //                                 kuantitas: 10,
    //                                 "Total Biaya": 10000
    //                             }
    //                         ],
    //                         sub_total: 8000,
    //                         diskon: 30,
    //                         pajak: 1000,
    //                         total_penjualan: 18000
    //                     }
    //                 }
    //             ]
    //         },
    //         {
    //             id_jenis: 2,
    //             nama_jenis: 'Pengeluaran',
    //             data: [
    //                 {
    //                     nomor: 'BBN127',
    //                     tanggal: '2024-12-12',
    //                     deskripsi: 'Pengeluaran Buat Listrik',
    //                     cabang: "Lubeg",
    //                     kategori: 'Beban Operasional',
    //                     total: 10000,
    //                     jenis: 'pengeluaran',
    //                     detail: {
    //                         nomor: 'EXP123',
    //                         tangggal: '2024-12-12',
    //                         kategori: 'Hibah',
    //                         bayar: 'Cash',
    //                         metode: '-' ,
    //                         dataDetail: [
    //                           {
    //                               deskripsi: 'Biaya Operasional Staff',
    //                               toko: 'Tatitatu',
    //                               cabang: 'Cabang Gor HAS padang',
    //                               pengeluaran: 1000000
    //                           },
    //                           {
    //                               deskripsi: 'Biaya Operasional Staff',
    //                               toko: 'Tatitatu',
    //                               cabang: 'Cabang Gor HAS padang',
    //                               pengeluaran: 1000000
    //                           },
    //                         ],
    //                         sub_total: 8000,
    //                         pemotongan: 1000,
    //                         total_pengeluaran: 18000
    //                     }
    //                 },
    //                 {
    //                     nomor: 'BBN128',
    //                     tanggal: '2024-12-12',
    //                     deskripsi: 'Pengeluaran Buat Listrik',
    //                     cabang: "Lubeg",
    //                     kategori: 'Beban Operasional',
    //                     total: 10000,
    //                     jenis: 'pengeluaran',
    //                     detail: {
    //                         nomor: 'EXP123',
    //                         tangggal: '2024-12-12',
    //                         kategori: 'Hibah',
    //                         bayar: 'Cash',
    //                         metode: '-' ,
    //                         dataDetail: [
    //                           {
    //                               deskripsi: 'Biaya Operasional Staff',
    //                               toko: 'Tatitatu',
    //                               cabang: 'Cabang Gor HAS padang',
    //                               pengeluaran: 1000000
    //                           },
    //                           {
    //                               deskripsi: 'Biaya Operasional Staff',
    //                               toko: 'Tatitatu',
    //                               cabang: 'Cabang Gor HAS padang',
    //                               pengeluaran: 1000000
    //                           },
    //                         ],
    //                         sub_total: 8000,
    //                         pemotongan: 1000,
    //                         total_pengeluaran: 18000
    //                     }
    //                 },
    //                 {
    //                     nomor: 'BBN129',
    //                     tanggal: '2024-12-12',
    //                     deskripsi: 'Pengeluaran Buat Listrik',
    //                     cabang: "Lubeg",
    //                     kategori: 'Beban Operasional',
    //                     total: 10000,
    //                     jenis: 'gaji',
    //                     detail: {
    //                         nomor: 'WAGE',
    //                         tanggal: '2024-12-12',
    //                         kategori: 'Bebang Gaji',
    //                         cash: 'Cash',
    //                         metode: '-',
    //                         dataGaji: [
    //                             {
    //                                 nama: 'Hamzah Abdillah Arif',
    //                                 divisi: 'SPV',
    //                                 toko: 'tatitatu',
    //                                 cabang: 'GOR Haji Agus Salim',
    //                                 absen: 15,
    //                                 kpi: 80,
    //                                 total_gaji_akhir: 2500000
    //                             },
    //                             {
    //                                 nama: 'Hamzah Abdillah Arif',
    //                                 divisi: 'SPV',
    //                                 toko: 'tatitatu',
    //                                 cabang: 'GOR Haji Agus Salim',
    //                                 absen: 15,
    //                                 kpi: 80,
    //                                 total_gaji_akhir: 2500000
    //                             }
    //                         ],
    //                         akumulasi_akhir: 2000000
    //                     }
    //                 },
    //                 {
    //                     nomor: 'BBN1210',
    //                     tanggal: '2024-12-12',
    //                     deskripsi: 'Pengeluaran Buat Listrik',
    //                     cabang: "Lubeg",
    //                     kategori: 'Beban Operasional',
    //                     total: 10000,
    //                     jenis: 'gaji',
    //                     detail: {
    //                         nomor: 'WAGE',
    //                         tanggal: '2024-12-12',
    //                         kategori: 'Bebang Gaji',
    //                         cash: 'Cash',
    //                         metode: '-',
    //                         dataGaji: [
    //                             {
    //                                 nama: 'Hamzah Abdillah Arif',
    //                                 divisi: 'SPV',
    //                                 toko: 'tatitatu',
    //                                 cabang: 'GOR Haji Agus Salim',
    //                                 absen: 15,
    //                                 kpi: 80,
    //                                 total_gaji_akhir: 2500000
    //                             },
    //                             {
    //                                 nama: 'Hamzah Abdillah Arif',
    //                                 divisi: 'SPV',
    //                                 toko: 'tatitatu',
    //                                 cabang: 'GOR Haji Agus Salim',
    //                                 absen: 15,
    //                                 kpi: 80,
    //                                 total_gaji_akhir: 2500000
    //                             }
    //                         ],
    //                         akumulasi_akhir: 2000000
    //                     }
    //                 }
    //             ]
    //         }
    //     ]
    // };

    const data = {
        keuntungan: 10000000,
        pemasukan: 10000000,
        pengeluaran: 10000000,
        produkTerjual: 120,
        dataLaporan: [
            {
                id_jenis: 1,
                nama_jenis: 'Pemasukan',
                data: [
                    {
                        nomor: 'BBN123',
                        tanggal: '2024-12-12',
                        deskripsi: 'Pengeluaran Buat Listrik',
                        cabang: "Gor Agus",
                        kategori: 'Beban Operasional',
                        total: 10000,
                        jenis: 'non-penjualan',
                    },
                    {
                        nomor: 'BBN124',
                        tanggal: '2024-12-12',
                        deskripsi: 'Pengeluaran Buat Listrik',
                        cabang: "Gor Agus",
                        kategori: 'Beban Operasional',
                        total: 10000,
                        jenis: 'non-penjualan',
                    },
                    {
                        nomor: 'BBN125',
                        tanggal: '2024-12-12',
                        deskripsi: 'Pengeluaran Buat Listrik',
                        cabang: "Lubeg",
                        kategori: 'Beban Operasional',
                        total: 10000,
                        jenis: 'penjualan',
                    },
                    {
                        nomor: 'BBN126',
                        tanggal: '2024-12-12',
                        deskripsi: 'Pengeluaran Buat Listrik',
                        cabang: "Lubeg",
                        kategori: 'Beban Operasional',
                        total: 10000,
                        jenis: 'penjualan',
                    }
                ]
            },
            {
                id_jenis: 2,
                nama_jenis: 'Pengeluaran',
                data: [
                    {
                        nomor: 'BBN127',
                        tanggal: '2024-12-12',
                        deskripsi: 'Pengeluaran Buat Listrik',
                        cabang: "Lubeg",
                        kategori: 'Beban Operasional',
                        total: 10000,
                        jenis: 'pengeluaran',
                    },
                    {
                        nomor: 'BBN128',
                        tanggal: '2024-12-12',
                        deskripsi: 'Pengeluaran Buat Listrik',
                        cabang: "Lubeg",
                        kategori: 'Beban Operasional',
                        total: 10000,
                        jenis: 'pengeluaran',
                    },
                    {
                        nomor: 'BBN129',
                        tanggal: '2024-12-12',
                        deskripsi: 'Pengeluaran Buat Listrik',
                        cabang: "Lubeg",
                        kategori: 'Beban Operasional',
                        total: 10000,
                        jenis: 'gaji',
                    },
                    {
                        nomor: 'BBN1210',
                        tanggal: '2024-12-12',
                        deskripsi: 'Pengeluaran Buat Listrik',
                        cabang: "Lubeg",
                        kategori: 'Beban Operasional',
                        total: 10000,
                        jenis: 'gaji',
                    }
                ]
            }
        ]
    };

    const selectedData = data.dataLaporan
        .find((item) => item.nama_jenis === selectedJenis)
        ?.data.filter((item) => {
            // Filter by store
            const isStoreMatch =
                selectedStore === 'Semua' || item.cabang === selectedStore;

            // Filter by date range
            const itemDate = moment(item.tanggal);
            const isDateMatch =
                itemDate.isBetween(startDate, endDate, null, '[]');

            return isStoreMatch && isDateMatch;
        }) || [];
    
    const navigate = useNavigate()
    const handleRowClick = (row) => {
        if (row.jenis === 'non-penjualan') {
            navigate('/laporanKeuangan/pemasukan/non-penjualan', { state: { nomor: row.nomor } });
        } else if (row.jenis === 'penjualan') {
            navigate('/laporanKeuangan/pemasukan/penjualan', { state: { nomor: row.nomor } });
        } else if (row.jenis === 'pengeluaran') {
            navigate('/laporanKeuangan/pengeluaran', { state: { nomor: row.nomor } });
        } else {
            navigate('/laporanKeuangan/pengeluaran/gaji', { state: { nomor: row.nomor } });
        }
    }
    

    return (
        <>
            <Navbar menuItems={menuItems} userOptions={userOptions} label={'Laporan Keuangan'}>
                <div className="p-5">
                    <section className="flex flex-wrap md:flex-nowrap items-center justify-between space-y-2 md:space-y-0">
                        <div className="left w-full md:w-auto">
                            <p className="text-primary text-base font-bold">Laporan Keuangan Toko</p>
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
                        </div>
                    </section>

                    <section className="mt-5 bg-white rounded-xl">
                        <div className="grid grid-cols-1 p-5 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            {/* Keuntungan */}
                            <div className="flex items-center border border-[#F2E8F6] p-4 rounded-lg">
                                <div className="flex-1">
                                    <p className="text-gray-400 text-sm">Keuntungan</p>
                                    <p className="font-bold text-lg">Rp {data.keuntungan.toLocaleString()}</p>
                                </div>
                                <div className="flex items-center justify-center ml-4">
                                    <img src="/keuangan/keuntungan.svg" alt="Keuntungan" />
                                </div>
                            </div>

                            {/* Pemasukan */}
                            <div className="flex items-center border border-[#F2E8F6] p-4 rounded-lg">
                                <div className="flex-1">
                                    <p className="text-gray-400 text-sm">Pemasukan</p>
                                    <p className="font-bold text-lg">Rp {data.pemasukan.toLocaleString()}</p>
                                </div>
                                <div className="flex items-center justify-center ml-4">
                                    <img src="/keuangan/pemasukan.svg" alt="Pemasukan" />
                                </div>
                            </div>

                            {/* Pengeluaran */}
                            <div className="flex items-center border border-[#F2E8F6] p-4 rounded-lg">
                                <div className="flex-1">
                                    <p className="text-gray-400 text-sm">Pengeluaran</p>
                                    <p className="font-bold text-lg">Rp {data.pengeluaran.toLocaleString()}</p>
                                </div>
                                <div className="flex items-center justify-center ml-4">
                                    <img src="/keuangan/pengeluaran.svg" alt="Pengeluaran" />
                                </div>
                            </div>

                            {/* Produk Terjual */}
                            <div className="flex items-center border border-[#F2E8F6] p-4 rounded-lg">
                                <div className="flex-1">
                                    <p className="text-gray-400 text-sm">Produk Terjual</p>
                                    <p className="font-bold text-lg">{data.produkTerjual} Pcs</p>
                                </div>
                                <div className="flex items-center justify-center ml-4">
                                    <img src="/keuangan/produkterjual.svg" alt="Produk Terjual" />
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="bg-white mt-5 rounded-xl">
                        <div className="p-4">
                            <div className="flex border-b border-gray-300 mb-4">
                                {["Pemasukan", "Pengeluaran"].map((jenis) => (
                                    <button
                                        key={jenis}
                                        onClick={() => setSelectedJenis(jenis)}
                                        className={`px-4 py-2 text-sm font-semibold ${
                                            selectedJenis === jenis
                                                ? "text-primary border-b-2 border-primary"
                                                : "text-gray-400"
                                        }`}
                                    >
                                        {jenis}
                                    </button>
                                ))}
                            </div>

                            <Table headers={headers} data={selectedData} onRowClick={handleRowClick}/>
                        </div>
                    </section>
                </div>
            </Navbar>
        </>
    );
}
