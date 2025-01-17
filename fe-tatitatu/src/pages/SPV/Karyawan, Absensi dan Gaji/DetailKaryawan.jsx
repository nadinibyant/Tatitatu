import { useLocation } from "react-router-dom";
import Navbar from "../../../components/Navbar";
import { menuItems, userOptions } from "../../../data/menu";
import Breadcrumbs from "../../../components/Breadcrumbs";
import Button from "../../../components/Button";
import { useState } from "react";
import moment from "moment";
import Table from "../../../components/Table";
import LayoutWithNav from "../../../components/LayoutWithNav";

export default function DetailKaryawan(){
    const location = useLocation()
    const {id, divisi} = location.state || {}

    const breadcrumbItems = [
        { label: "Data Karyawan Absensi dan Gaji", href: "/dataKaryawanAbsenGaji" },
        { label: "Detail", href: "" },
    ];

        const [isModalOpen, setIsModalOpen] = useState(false);
        const [startDate, setStartDate] = useState(moment().format("YYYY-MM-DD"));
        const [endDate, setEndDate] = useState(moment().format("YYYY-MM-DD"));
        const [selectedMonth, setSelectedMonth] = useState(moment().format("MM"));
        const [selectedYear, setSelectedYear] = useState(moment().format("YYYY"));

        const formatMonthYear = () => {
            const monthName = moment(selectedMonth, "MM").format("MMMM");
            return `${monthName} ${selectedYear}`;
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
    
        const handleRowClick = (row) => {
            navigate(`/pembelianStok/detail`, { state: { id: row.id } });
        };
    
        const toggleModal = () => setIsModalOpen(!isModalOpen);
    
        const formatDate = (date) =>
            new Date(date).toLocaleDateString("en-US", {
            month: "short",
            day: "2-digit",
            year: "numeric",
        });

        const formatDate2 = (date) =>
            new Date(date).toLocaleDateString("id-ID", {
              day: "2-digit",
              month: "long",
              year: "numeric",
            });

        function formatNumberWithDots(number) {
            return number.toLocaleString('id-ID');
        }

        const headers = [
            { label: "Tanggal", key: "Tanggal", align: "text-left" },
            { label: "Foto", key: "Foto", align: "text-left" },
            { label: "Jam Masuk", key: "Jam Masuk", align: "text-left" },
            { label: "Jam Keluar", key: "Jam Keluar", align: "text-left" },
            { label: "Total Waktu", key: "Total Waktu", align: "text-center" },
            { label: "Gaji Pokok Perhari", key: "Gaji Pokok Perhari", align: "text-center" },
        ];

        const headersProduksi = [
            { label: "Tanggal", key: "Tanggal", align: "text-left" },
            { label: "Foto", key: "Foto", align: "text-left" },
            { label: "Jumlah Produksi", key: "Jumlah Produksi", align: "text-left" },
            { label: "Total Menit", key: "Total Menit", align: "text-left" },
            { label: "Status", key: "Status", align: "text-center" },
            { label: "Gaji Pokok Perhari", key: "Gaji Pokok Perhari", align: "text-center" },
        ];
    
        const headersTransportasi = [
            { label: "Tanggal", key: "Tanggal", align: "text-left" },
            { label: "Foto", key: "Foto", align: "text-left" },
            { label: "Lokasi", key: "Lokasi", align: "text-left" },
            { label: "Status", key: "Status", align: "text-center" },
        ];

        const [data, setData] = useState({
            "Gaji Pokok": 1000000,
            "Total Menit Kerja": 10200,
            "Persentase KPI Tercapai": 80,
            "Total Bonus": 245000,
            "Total Gaji Akhir": 1220000,
            profile: {
                nama: 'Nadini Annisa Byant',
                phone: '082283426568',
                email: 'nadini@gmail.com',
                toko: 'Tatitatu',
                cabang: 'Gor Agus',
                divisi: 'Kasir',
                total_gaji_pokok: 1000000,
                total_bonus: 500000,
                waktu_kerja_sebulan: 11200,
                kehadiran:11,
                izin:1,
                tidak_ada_kejelasan: 10
            },
            data: [
                {
                    id:1,
                    Tanggal: '2024-12-11',
                    Foto: 'https://via.placeholder.com/50',
                    "Jam Masuk": '13.00',
                    "Jam Keluar": '19.00',
                    "Total Waktu": 500,
                    "Gaji Pokok Perhari": 35000
                },
                {
                    id:1,
                    Tanggal: '2024-12-11',
                    Foto: 'https://via.placeholder.com/50',
                    "Jam Masuk": '13.00',
                    "Jam Keluar": '19.00',
                    "Total Waktu": 500,
                    "Gaji Pokok Perhari": 35000
                },
                {
                    id:1,
                    Tanggal: '2024-12-11',
                    Foto: 'https://via.placeholder.com/50',
                    "Jam Masuk": '13.00',
                    "Jam Keluar": '19.00',
                    "Total Waktu": 500,
                    "Gaji Pokok Perhari": 35000
                },
                {
                    id:1,
                    Tanggal: '2024-12-11',
                    Foto: 'https://via.placeholder.com/50',
                    "Jam Masuk": '13.00',
                    "Jam Keluar": '19.00',
                    "Total Waktu": 500,
                    "Gaji Pokok Perhari": 35000
                },
                {
                    id:1,
                    Tanggal: '2024-12-11',
                    Foto: 'https://via.placeholder.com/50',
                    "Jam Masuk": '13.00',
                    "Jam Keluar": '19.00',
                    "Total Waktu": 500,
                    "Gaji Pokok Perhari": 35000
                },
                {
                    id:1,
                    Tanggal: '2024-12-11',
                    Foto: 'https://via.placeholder.com/50',
                    "Jam Masuk": '13.00',
                    "Jam Keluar": '19.00',
                    "Total Waktu": 500,
                    "Gaji Pokok Perhari": 35000
                },
                {
                    id:1,
                    Tanggal: '2024-12-11',
                    Foto: 'https://via.placeholder.com/50',
                    "Jam Masuk": '13.00',
                    "Jam Keluar": '19.00',
                    "Total Waktu": 500,
                    "Gaji Pokok Perhari": 35000
                }
            ]
        })

            // Data berbeda untuk setiap divisi
    const dataProduksi = {
        ...data,
        data: [
            {
                Tanggal: '2024-12-11',
                Foto: 'https://via.placeholder.com/50',
                "Jumlah Produksi": "13 Pcs",
                "Total Menit": "20 Menit",
                "Status": "Diterima",
                "Gaji Pokok Perhari": 30000
            },
        ]
    };

    const dataTransportasi = {
        ...data,
        data: [
            {
                Tanggal: '2024-12-11',
                Foto: 'https://via.placeholder.com/50',
                Lokasi: "Youth Center Padang",
                Status: "Antar"
            },
            {
                Tanggal: '2024-12-11',
                Foto: 'https://via.placeholder.com/50',
                Lokasi: "Youth Center Padang",
                Status: "Jemput"
            },
        ]
    };

    const renderTable = () => {
        if (divisi === 'Produksi') {
          return (
            <Table
              headers={headersProduksi}
              data={dataProduksi.data.map((item, index) => ({
                ...item,
                Tanggal: formatDate2(item.Tanggal),
                Foto: <img src={item.Foto} className="w-12 h-12 object-cover" />,
                Status: <span className={`px-3 py-1 rounded-lg ${
                  item.Status === 'Diterima' ? 'bg-green-100 text-green-800' : ''
                }`}>{item.Status}</span>,
                "Gaji Pokok Perhari": `Rp${formatNumberWithDots(item["Gaji Pokok Perhari"])}`,
              }))}
            />
          );
        } else if (divisi === 'Transportasi') {
          return (
            <Table
              headers={headersTransportasi}
              data={dataTransportasi.data.map((item, index) => ({
                ...item,
                Tanggal: formatDate2(item.Tanggal),
                Foto: <img src={item.Foto} className="w-12 h-12 object-cover" />,
                Status: <span className={`px-3 py-1 rounded-lg ${
                  item.Status === 'Antar' ? 'bg-pink text-primary' : 'bg-primary text-white'
                }`}>{item.Status}</span>,
              }))}
            />
          );
        } else {
          // Tabel default untuk divisi lainnya
          return (
            <Table
              headers={headers}
              data={data.data.map((item, index) => ({
                ...item,
                Tanggal: formatDate2(item.Tanggal),
                Foto: <img src={item.Foto} className="w-12 h-12 object-cover" />,
                "Gaji Pokok Perhari": `Rp${formatNumberWithDots(item["Gaji Pokok Perhari"])}`,
                "Total Waktu": `${item["Total Waktu"]} Menit`,
              }))}
            />
          );
        }
      };
    

    return(
        <>
        <LayoutWithNav menuItems={menuItems} userOptions={userOptions} showAddNoteButton={true}>
            <div className="p-5">
            <section className="flex flex-wrap md:flex-nowrap items-center justify-between space-y-2 md:space-y-0">
                    <div className="left w-full md:w-auto">
                        <Breadcrumbs items={breadcrumbItems} />
                    </div>

                    <div className="right flex flex-wrap md:flex-nowrap items-center space-x-0 md:space-x-4 w-full md:w-auto space-y-2 md:space-y-0">
                        <div className="w-full md:w-auto">
                        <Button 
                            label={formatMonthYear()}
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
                                {/* Bulan */}
                                <div className="flex flex-col w-full">
                                    <label className="text-sm font-medium text-gray-600 pb-3">Bulan</label>
                                    <select
                                        value={selectedMonth}
                                        onChange={(e) => setSelectedMonth(e.target.value)}
                                        className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    >
                                        {moment.months().map((month, index) => (
                                            <option key={month} value={String(index + 1).padStart(2, '0')}>
                                                {month}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                {/* Tahun */}
                                <div className="flex flex-col w-full">
                                    <label className="text-sm font-medium text-gray-600 pb-3">Tahun</label>
                                    <select
                                        value={selectedYear}
                                        onChange={(e) => setSelectedYear(e.target.value)}
                                        className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    >
                                        {Array.from(
                                            { length: moment().year() - 1999 }, 
                                            (_, i) => moment().year() - i
                                        ).map((year) => (
                                            <option key={year} value={year}>
                                                {year}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            
                            {/* Quick select buttons */}
                            <div className="flex flex-col space-y-3 w-full">
                                <button
                                    onClick={() => {
                                        setSelectedMonth(moment().format("MM"));
                                        setSelectedYear(moment().format("YYYY"));
                                        setIsModalOpen(false);
                                    }}
                                    className="px-4 py-2 border border-gray-300 text-black rounded-md hover:bg-primary hover:text-white"
                                >
                                    Bulan Ini
                                </button>
                                <button
                                    onClick={() => {
                                        const lastMonth = moment().subtract(1, 'months');
                                        setSelectedMonth(lastMonth.format("MM"));
                                        setSelectedYear(lastMonth.format("YYYY"));
                                        setIsModalOpen(false);
                                    }}
                                    className="px-4 py-2 border border-gray-300 text-black rounded-md hover:bg-primary hover:text-white"
                                >
                                    Bulan Lalu
                                </button>
                            </div>
                        </div>
                    </div>
                )}
                </section>

                <section className="mt-5 bg-primary rounded-xl p-5">
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-5 items-center text-white">
                        <div className="flex flex-col">
                            <p className="text-sm">Gaji Pokok</p>
                            <p className="font-bold">{`Rp${formatNumberWithDots(data["Gaji Pokok"])}`}</p>
                        </div>
                        <div className="flex flex-col">
                            <p className="text-sm">Total Menit Kerja</p>
                            <p className="font-bold">{formatNumberWithDots(data["Total Menit Kerja"])}</p>
                        </div>
                        <div className="flex flex-col">
                            <p className="text-sm">Persentase KPI Tercapai</p>
                            <p className="font-bold">{`${data["Persentase KPI Tercapai"]}%`}</p>
                        </div>
                        <div className="flex flex-col">
                            <p className="text-sm">Total Bonus yang Diterima</p>
                            <p className="font-bold">{`Rp${formatNumberWithDots(data["Total Bonus"])}`}</p>
                        </div>
                        <div className="flex items-center justify-center space-x-3 text-center">
                            <img src="/icon/gajiAkhir.svg" alt="Icon Gaji Akhir" className="w-6 h-6" />
                            <div>
                            <p className="text-sm">Total Gaji Akhir</p>
                            <p className="font-bold">{`Rp${formatNumberWithDots(data["Total Gaji Akhir"])}`}</p>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="mt-5 bg-white rounded-xl p-5">
                    <div className="flex flex-col sm:flex-row items-center sm:space-x-8 space-y-5 sm:space-y-0 pb-5 border-b border-secondary">
                        {/* Profile Section */}
                        <div className="flex items-center space-x-4">
                            <img
                                src="https://via.placeholder.com/50"
                                alt="profile"
                                className="w-20 h-20 rounded-full"
                            />
                        </div>

                        {/* Contact Info */}
                        <div className="w-full">
                            <div className="flex flex-col sm:flex-row sm:space-x-8 w-full">
                                <div className="flex items-center space-x-2">
                                    <img src="/icon/call.svg" alt="call" className="w-5 h-5" />
                                    <p className="text-secondary">{data.profile.phone}</p>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <img src="/icon/mail.svg" alt="email" className="w-5 h-5" />
                                    <p className="text-secondary">{data.profile.email}</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-3 w-full mt-5">

                                <div className="">
                                    <p className="text-sm text-gray-500">Nama</p>
                                    <p className="font-bold">{data.profile.nama}</p>
                                </div>

                                <div className="">
                                    <p className="text-sm text-gray-500">Toko/Cabang</p>
                                    <p className="font-bold">{data.profile.toko}/{data.profile.cabang}</p>
                                </div>

                                <div className="">
                                    <p className="text-sm text-gray-500">Divisi</p>
                                    <p className="font-bold">{data.profile.divisi}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Information Section */}
                    <div className="py-5 space-y-4 w-full">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="">
                                <p className="text-sm text-gray-500">Total Gaji Pokok</p>
                                <p className="font-bold">Rp{formatNumberWithDots(data.profile.total_gaji_pokok)}</p>
                            </div>

                            <div className="">
                                <p className="text-sm text-gray-500">Total Bonus</p>
                                <p className="font-bold">Rp{formatNumberWithDots(data.profile.total_bonus)}</p>
                            </div>

                            <div className="">
                                <p className="text-sm text-gray-500">Waktu Kerja Sebulan</p>
                                <p className="font-bold">{formatNumberWithDots(data.profile.waktu_kerja_sebulan)} Menit</p>
                            </div>


                            <div className="">
                                <p className="text-sm text-gray-500">Kehadiran</p>
                                <p className="font-bold">{formatNumberWithDots(data.profile.kehadiran)}</p>
                            </div>

                            <div className="">
                                <p className="text-sm text-gray-500">Izin/Cuti</p>
                                <p className="font-bold">{formatNumberWithDots(data.profile.izin)}</p>
                            </div>

                            <div className="">
                                <p className="text-sm text-gray-500">Tidak Ada Kejelasan</p>
                                <p className="font-bold">{formatNumberWithDots(data.profile.tidak_ada_kejelasan)}</p>
                            </div>

                        </div>
                    </div>
                </section>

                <section className="mt-5 bg-white rounded-xl">
                    <div className="p-5">
                        {renderTable()}
                    </div>
                </section>


            </div>
        </LayoutWithNav>
        </>
    )
}