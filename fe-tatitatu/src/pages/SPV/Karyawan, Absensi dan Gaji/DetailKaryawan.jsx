import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "../../../components/Navbar";
import { menuItems, userOptions } from "../../../data/menu";
import Breadcrumbs from "../../../components/Breadcrumbs";
import Button from "../../../components/Button";
import { useEffect, useState } from "react";
import moment from "moment";
import Table from "../../../components/Table";
import LayoutWithNav from "../../../components/LayoutWithNav";
import api from "../../../utils/api";
import Spinner from "../../../components/Spinner";
import ModalEditAbsensi from "./ModalEditAbsensi";
import Alert from "../../../components/Alert";

export default function DetailKaryawan(){
    const [isLoading, setLoading] = useState(false)
    const location = useLocation()
    const {id, divisi} = location.state || {}
    const [selectedMonth, setSelectedMonth] = useState(moment().format('MM'));
    const [selectedYear, setSelectedYear] = useState(moment().format('YYYY'));
    const monthValue = `${selectedYear}-${selectedMonth}`;
    const userData = JSON.parse(localStorage.getItem('userData'))
    const isHeadGudang = userData?.role === 'headgudang'
    const isManager = userData?.role === 'manajer'
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedAbsensi, setSelectedAbsensi] = useState(null);

    const [isAlert, setIsAlert] = useState(false);
    const [deleteId, setDeleteId] = useState(null);

    const handleDelete = (id) => {
        setDeleteId(id);
        setIsAlert(true);
    };

    const handleConfirmDel = async () => {
        try {
            setLoading(true);
            await api.delete(`/absensi-karyawan/${deleteId}`);
            
            fetchAbsensiData();
            
            setIsAlert(false);
        } catch (error) {
            console.error('Error deleting data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleMonthChange = (e) => {
        const value = e.target.value; 
        const [year, month] = value.split('-');
        setSelectedMonth(month);
        setSelectedYear(year);
    };
    
    const breadcrumbItems = [
        { label: "Data Karyawan Absensi dan Gaji", href: "/dataKaryawanAbsenGaji" },
        { label: "Detail", href: "" },
    ];

    const [isModalOpen, setIsModalOpen] = useState(false);

    const navigate = useNavigate()

    const handleRowClick = (row) => {
        navigate(`/pembelianStok/detail`, { state: { id: row.id } });
    };

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
        { label: "Foto", key: "Foto", align: "text-left"},
        { label: "Jam Masuk", key: "Jam Masuk", align: "text-left" },
        { label: "Jam Keluar", key: "Jam Keluar", align: "text-left" },
        { label: "Total Waktu", key: "Total Waktu", align: "text-left" },
        { label: "Gaji Pokok Perhari", key: "Gaji Pokok Perhari", align: "text-left" },
        ...(isManager ? [{ label: "Aksi", key: "Aksi", align: "text-center" }] : []), 
    ];
    
    const headersProduksi = [
        { label: "Tanggal", key: "Tanggal", align: "text-left" },
        { label: "Foto", key: "Foto", align: "text-left" },
        { label: "Jumlah Produksi", key: "Jumlah Produksi", align: "text-left" },
        { label: "Total Menit", key: "Total Menit", align: "text-left" },
        { label: "Status", key: "Status", align: "text-left" },
        { label: "Gaji Pokok Perhari", key: "Gaji Pokok Perhari", align: "text-left" },
    ];
    
    const headersTransportasi = [
        { label: "Tanggal", key: "Tanggal", align: "text-left" },
        { label: "Foto", key: "Foto", align: "text-left"},
        { label: "Lokasi", key: "Lokasi", align: "text-left" },
        { label: "Status", key: "Status", align: "text-left" },
        ...(isManager ? [{ label: "Aksi", key: "Aksi", align: "text-center" }] : []), 
    ];

    const handleEdit = (item) => {
        setSelectedAbsensi(item);
        setIsEditModalOpen(true);
    };


    const [data, setData] = useState({
        "Gaji Pokok": 0,
        "Total Menit Kerja": 0,
        "Persentase KPI Tercapai": 0,
        "Total Bonus": 0,
        "Total Gaji Akhir": 0,
        profile: {
            nama: '',
            phone: '',
            email: '',
            toko: '',
            cabang: '',
            divisi: '',
            total_gaji_pokok: 0,
            total_bonus: 0,
            waktu_kerja_sebulan_antar: 0,
            waktu_kerja_sebulan_menit: 0,
            kehadiran:0,
            izin:0,
            tidak_ada_kejelasan: 0,
            foto: ''
        },
        data: [
        ]
    })

    const fetchProfile = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/data-absensi-karyawan/${id}/${selectedMonth}/${selectedYear}/karyawan`);
            const { 
                karyawan, 
                kehadiran, 
                totalCutiDays, 
                tidakHadir,
                totalGajiPokok,
                totalMenit,
                totalPersentaseTercapai,
                totalBonusDiterima,
                totalGajiAkhir
            } = response.data.data;
     
            setData(prevData => ({
                ...prevData,
                "Gaji Pokok": totalGajiPokok || 0,
                "Total Menit Kerja": totalMenit || 0,
                "Persentase KPI Tercapai": totalPersentaseTercapai || 0,
                "Total Bonus": totalBonusDiterima || 0,
                "Total Gaji Akhir": totalGajiAkhir || 0,
                profile: {
                    nama: karyawan.nama_karyawan,
                    phone: karyawan.nomor_handphone || '-',
                    email: karyawan.email,
                    toko: karyawan.toko.nama_toko, 
                    cabang: karyawan.cabang?.nama_cabang || '-',
                    divisi: karyawan.divisi.nama_divisi,
                    total_gaji_pokok: karyawan.jumlah_gaji_pokok || 0,
                    total_bonus: karyawan.bonus || 0,
                    waktu_kerja_sebulan_antar: karyawan.waktu_kerja_sebulan_antar,
                    waktu_kerja_sebulan_menit: karyawan.waktu_kerja_sebulan_menit,
                    kehadiran: kehadiran || 0,
                    izin: totalCutiDays || 0,
                    tidak_ada_kejelasan: tidakHadir || 0,
                    foto: karyawan.image || 'https://via.placeholder.com/50'
                }
            }));
        } catch (error) {
            console.error('Error fetching profile:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchProduksiGudangData = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/produksi-gudang?toko_id=1`);
            
            if (response.data.success) {
                const formattedData = response.data.data.map(item => ({
                    id: item.produksi_gudang_id,
                    Tanggal: item.tanggal,
                    Foto: `${import.meta.env.VITE_API_URL}/images-produksi-gudang/${item.image}`,
                    "Jumlah Produksi": `${item.jumlah_produksi.toLocaleString('id-ID') || 0} Pcs`,
                    "Total Menit": `${item.total_menit.toLocaleString('id-ID') || 0} Menit`,
                    Status: item.status,
                    "Gaji Pokok Perhari": item.gaji_pokok_perhari || 0,
                    produkInfo: item.produk && item.produk.length > 0 
                        ? item.produk.map(p => `${p.jumlah}x ${p.barang.nama_barang}`).join(', ')
                        : '-'
                }));
        
                setData(prevData => ({
                    ...prevData,
                    data: formattedData
                }));
            }
        } catch (error) {
            console.error('Error fetching produksi gudang data:', error);
        } finally {
            setLoading(false);
        }
    };


    const fetchAbsensiData = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/list-absensi-karyawan/${id}/${selectedMonth}/${selectedYear}/karyawan`);
            const { absensiRecord, totalGajiPokok, totalMenit } = response.data.data;

            if (divisi === 'Transportasi') {
                setData(prevData => ({
                    ...prevData,
                    "Total Menit Kerja": totalMenit || 0,
                    "Gaji Pokok": totalGajiPokok || 0,
                    data: absensiRecord.map(item => ({
                        id: item.absensi_karyawan_id,
                        Tanggal: item.tanggal,
                        Foto: `${import.meta.env.VITE_API_URL}/images-absensi-karyawan/${item.image}`,
                        Lokasi: item.lokasi,
                        Status: item.status
                    }))
                }));
            } 
            else if (divisi === 'Produksi') {
                setData(prevData => ({
                    ...prevData,
                    "Total Menit Kerja": totalMenit || 0,
                    "Gaji Pokok": totalGajiPokok || 0,
                    data: absensiRecord.map(item => ({
                        id: item.absensi_karyawan_id,
                        Tanggal: item.tanggal,
                        Foto: `${import.meta.env.VITE_API_URL}/images-absensi-karyawan/${item.image}`,
                        "Jumlah Produksi": item.jumlah_produksi.toLocaleString('id-ID') || "0 Pcs",
                        "Total Menit": item.total_menit ? `${item.total_menit} Menit` : "0 Menit",
                        "Status": item.status || "Pending",
                        "Gaji Pokok Perhari": item.gaji_pokok_perhari || 0
                    }))
                }));
            } 
            else {
                setData(prevData => ({
                    ...prevData,
                    "Total Menit Kerja": totalMenit || 0,
                    "Gaji Pokok": totalGajiPokok || 0,
                    data: absensiRecord.map(item => ({
                        id: item.absensi_karyawan_id,
                        Tanggal: item.tanggal,
                        Foto:`${import.meta.env.VITE_API_URL}/images-absensi-karyawan/${item.image}`,
                        "Jam Masuk": item.jam_masuk || '-',
                        "Jam Keluar": item.jam_keluar || '-',
                        "Total Waktu": item.total_menit || 0,
                        "Gaji Pokok Perhari": item.gaji_pokok_perhari || 0
                    }))
                }));
            }
    
        } catch (error) {
            console.error('Error fetching absensi data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            await fetchProfile();
            
            if (divisi === 'Produksi' && (userData?.role === 'headgudang' || userData?.role === 'manajer')) {
                await fetchProduksiGudangData();
            } else {
                await fetchAbsensiData();
            }
        };
        fetchData();
    }, [selectedMonth, selectedYear, divisi]);

    const renderTable = () => {
        if (divisi === 'Produksi') {
            return (
                <Table
                    headers={headersProduksi}
                    data={data.data.map((item, index) => ({
                        ...item,
                        Tanggal: formatDate2(item.Tanggal),
                        Foto: <img src={item.Foto} className="w-12 h-12 object-cover" />,
                        Status: <span className={`px-3 py-1 rounded-lg ${
                            item.Status === 'Diterima' ? 'bg-green-100 text-green-800' : '',
                            item.Status === 'Ditolak' ? 'bg-red-100 text-red-800' : '',
                            item.Status === 'proses' ? 'bg-yellow-100 text-yellow-800' : ''
                        }`}>{item.Status}</span>,
                        "Gaji Pokok Perhari": `Rp${formatNumberWithDots(item["Gaji Pokok Perhari"])}`,
                    }))}
                />
            );
        } else if (divisi === 'Transportasi') {
            return (
                <Table
                    headers={headersTransportasi}
                    data={data.data.map((item, index) => ({
                        ...item,
                        Tanggal: formatDate2(item.Tanggal),
                        Foto: <img src={item.Foto} className="w-12 h-12 object-cover" />,
                        Status: <span className={`px-3 py-1 rounded-lg ${
                            item.Status === 'Antar' ? 'bg-pink text-primary' : 'bg-primary text-white'
                        }`}>{item.Status}</span>,
                        ...(isManager && {
                            Aksi: (
                                <div className="flex items-center justify-center space-x-2">
                                    <button 
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleEdit(item);
                                        }}
                                        className="p-1 text-blue-600 hover:text-blue-800"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                        </svg>
                                    </button>
                                    <button 
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDelete(item.id);
                                        }}
                                        className="p-1 text-red-600 hover:text-red-800"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                </div>
                            )
                        })
                    }))}
                />
            );
        } else {
            return (
                <Table
                    headers={headers}
                    data={data.data.map((item, index) => ({
                        ...item,
                        Tanggal: formatDate2(item.Tanggal),
                        Foto: <img src={item.Foto} className="w-12 h-12 object-cover" />,
                        "Gaji Pokok Perhari": `Rp${formatNumberWithDots(item["Gaji Pokok Perhari"])}`,
                        "Total Waktu": `${item["Total Waktu"]} Menit`,
                        ...(isManager && {
                            Aksi: (
                                <div className="flex items-center justify-center space-x-2">
                                    <button 
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleEdit(item);
                                        }}
                                        className="p-1 text-blue-600 hover:text-blue-800"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                        </svg>
                                    </button>
                                    <button 
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDelete(item.id);
                                        }}
                                        className="p-1 text-red-600 hover:text-red-800"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                </div>
                            )
                        })
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
                            <p className="font-bold text-start">{`Rp${formatNumberWithDots(data["Total Gaji Akhir"])}`}</p>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="mt-5 bg-white rounded-xl p-5">
                    <div className="flex flex-col sm:flex-row items-center sm:space-x-8 space-y-5 sm:space-y-0 pb-5 border-b border-secondary">
                        {/* Profile Section */}
                        <div className="flex items-center space-x-4">
                            <img
                                src={`${import.meta.env.VITE_API_URL}/images-karyawan/${data.profile.foto}`}
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
                                {divisi === "Transportasi" ? (
                                    <p className="font-bold">{formatNumberWithDots(data.profile.waktu_kerja_sebulan_antar) || 0} Antar</p>   
                                ) : (
                                    <p className="font-bold">{formatNumberWithDots(data.profile.waktu_kerja_sebulan_menit) || 0} Menit</p>   
                                )}
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

                {isLoading && <Spinner />}

                {isManager && (
                    <ModalEditAbsensi
                        isOpen={isEditModalOpen}
                        onClose={() => setIsEditModalOpen(false)}
                        divisi={divisi}
                        absensiData={selectedAbsensi}
                        onSuccess={() => {
                            fetchAbsensiData();
                        }}
                    />
                )}

                {isAlert && (
                    <Alert
                        title="Hapus Data"
                        description="Apakah kamu yakin ingin menghapus data ini?"
                        confirmLabel="Hapus"
                        cancelLabel="Kembali"
                        onConfirm={handleConfirmDel}
                        onCancel={() => setIsAlert(false)}
                        open={isAlert}
                        onClose={() => setIsAlert(false)}
                    />
                )}
            </div>
        </LayoutWithNav>
        </>
    )
}