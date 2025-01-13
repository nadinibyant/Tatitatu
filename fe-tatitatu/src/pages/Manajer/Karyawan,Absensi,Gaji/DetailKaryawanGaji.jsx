import { useLocation } from "react-router-dom";
import Navbar from "../../../components/Navbar";
import { menuItems, userOptions } from "../../../data/menu";
import Breadcrumbs from "../../../components/Breadcrumbs";
import Button from "../../../components/Button";
import { useState } from "react";
import moment from "moment";
import Table from "../../../components/Table";
import LayoutWithNav from "../../../components/LayoutWithNav";

export default function DetailKaryawanGaji(){
    const location = useLocation()
    const {id, divisi} = location.state || {}
    const [selectedMonth, setSelectedMonth] = useState(moment().format("MMMM"));
    const [selectedYear, setSelectedYear] = useState(moment().format("YYYY"));

    const breadcrumbItems = [
        { label: "Data Karyawan Absensi dan Gaji", href: "/karyawan-absen-gaji" },
        { label: "Detail", href: "" },
    ];

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
                    <div className="w-full md:w-auto relative">
                        <div className="w-48 md:w-48">
                            <div className="relative">
                                <input
                                    type="month"
                                        value={`${selectedYear}-${moment().month(selectedMonth).format('MM')}`}
                                        onChange={(e) => {
                                            const date = moment(e.target.value);
                                            setSelectedMonth(date.format('MMMM'));
                                            setSelectedYear(date.format('YYYY'));
                                        }}
                                        className="w-full px-4 py-2 border border-secondary rounded-lg bg-gray-100 cursor-pointer pr-5"
                                />
                            </div>
                        </div>
                    </div>
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