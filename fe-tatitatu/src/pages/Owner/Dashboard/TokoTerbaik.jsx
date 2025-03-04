import { useEffect, useState } from "react";
import Button from "../../../components/Button";
import LayoutWithNav from "../../../components/LayoutWithNav";
import moment from "moment";
import Table from "../../../components/Table";
import api from "../../../utils/api";

export default function TokoTerbaik(){
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedMonth, setSelectedMonth] = useState(moment().format('MM'));
    const [selectedYear, setSelectedYear] = useState(moment().format('YYYY'));
    const userData = JSON.parse(localStorage.getItem('userData'));
    const isOwner = userData?.role === 'owner';
    const isManajer = userData?.role === 'manajer';
    const isFinance = userData?.role === 'finance'
    const isAdminGudang = userData?.role === 'admingudang'
    const isHeadGudang = userData?.role === 'headgudang'

    const themeColor = (isAdminGudang || isHeadGudang) 
    ? "coklatTua" 
    : (isManajer || isOwner || isFinance) 
      ? "biruTua" 
      : "primary";

    const [dashboardData, setDashboardData] = useState({
        keuntungan: { nama_toko: '-', jumlah: 0 },
        pemasukan: { nama_toko: '-', jumlah: 0 },
        pengeluaran: { nama_toko: '-', jumlah: 0 },
        barang: { nama_barang: '-', jumlah: 0 }
    });
    const [tokoData, setTokoData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const monthValue = `${selectedYear}-${selectedMonth}`;

    const handleMonthChange = (e) => {
      const value = e.target.value; 
      const [year, month] = value.split('-');
      setSelectedMonth(month);
      setSelectedYear(year);
    };
    
    const getDateRange = (year, month) => {
        const startDate = moment(`${year}-${month}-01`).format('YYYY-MM-DD');
        const endDate = moment(`${year}-${month}-01`).endOf('month').format('YYYY-MM-DD');
        
        return { startDate, endDate };
    };
    
    // Fetch data from API
    const fetchTokoData = async () => {
        if (!isOwner && !isManajer) return;
        
        try {
            setIsLoading(true);
            const { startDate, endDate } = getDateRange(selectedYear, selectedMonth);
            const response = await api.get(`/toko/terlaris?startDate=${startDate}&endDate=${endDate}`);
            
            if (response.data.success) {
                const terlaris = response.data.data.toko_terlaris;
                
                setDashboardData({
                    keuntungan: { 
                        nama_toko: terlaris.keuntungan_tertinggi.nama_toko, 
                        jumlah: terlaris.keuntungan_tertinggi.keuntungan 
                    },
                    pemasukan: { 
                        nama_toko: terlaris.pemasukan_tertinggi.nama_toko, 
                        jumlah: terlaris.pemasukan_tertinggi.total_pemasukan 
                    },
                    pengeluaran: { 
                        nama_toko: terlaris.pengeluaran_tertinggi.nama_toko, 
                        jumlah: terlaris.pengeluaran_tertinggi.total_pengeluaran 
                    },
                    barang: { 
                        nama_barang: terlaris.penjualan_terbanyak.nama_toko, 
                        jumlah: terlaris.penjualan_terbanyak.produk_terjual 
                    }
                });

                const mappedTokoData = response.data.data.toko.map(toko => ({
                    Nama: toko.nama_toko,
                    'Barang Terjual': toko.produk_terjual,
                    Pemasukan: toko.total_pemasukan,
                    Pengeluaran: toko.total_pengeluaran,
                    Keuntungan: toko.keuntungan
                }));
                
                setTokoData(mappedTokoData);
            }
        } catch (error) {
            console.error('Error fetching toko data:', error);
            setDashboardData({
                keuntungan: { nama_toko: 'Error loading data', jumlah: 0 },
                pemasukan: { nama_toko: 'Error loading data', jumlah: 0 },
                pengeluaran: { nama_toko: 'Error loading data', jumlah: 0 },
                barang: { nama_barang: 'Error loading data', jumlah: 0 }
            });
            setTokoData([]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (isOwner || isManajer) {
            fetchTokoData();
        }
    }, [selectedMonth, selectedYear, isOwner, isManajer]);

    const staticData = {
        dashboard: {
            keuntungan: {
                nama_toko: '-',
                jumlah: 0
            },
            pemasukan: {
                nama_toko: '-',
                jumlah: 0
            },
            pengeluaran: {
                nama_toko: '-',
                jumlah: 0
            },
            barang: {
                nama_barang: '-',
                jumlah: 0
            },
        },
        data_toko: [
            {
                Nama: '-',
                'Barang Terjual': 0,
                Pemasukan: 0,
                Pengeluaran: 0,
                Keuntungan: 0
            }
        ]
    };

    function formatNumberWithDots(number) {
        if (number === null || number === undefined || isNaN(number)) {
            return '0';
        }
        return number.toLocaleString('id-ID');
    }

    const displayData = (isOwner || isManajer) ? {
        dashboard: dashboardData,
        data_toko: tokoData
    } : staticData;

    const getDashboardIconPath = (baseIconName) => {
        if (isManajer || isOwner || isFinance) {
          return `/keuangan/${baseIconName}_non.svg`;
        }
        return `/keuangan/${baseIconName}.svg`;
    };

    const renderOverviewSection = () => {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Keuntungan Card */}
                <div className="w-full">
                    <div className="flex items-center border border-[#F2E8F6] p-4 rounded-lg h-full">
                        <div className="flex-1">
                            <p className="text-gray-400 text-sm">Keuntungan Terbanyak</p>
                            <p className="font-bold text-lg">{displayData.dashboard.keuntungan.nama_toko}</p>
                            <p className="">Rp{formatNumberWithDots(displayData.dashboard.keuntungan.jumlah)}</p>
                        </div>
                        <div className="flex items-center justify-center ml-4">
                            <img src={getDashboardIconPath('keuntungan')} alt="keuntungan" />
                        </div>
                    </div>
                </div>
    
                {/* Pemasukan Card */}
                <div className="w-full">
                    <div className="flex items-center border border-[#F2E8F6] p-4 rounded-lg h-full">
                        <div className="flex-1">
                            <p className="text-gray-400 text-sm">Pemasukan Terbanyak</p>
                            <p className="font-bold text-lg">{displayData.dashboard.pemasukan.nama_toko}</p>
                            <p className="">Rp{formatNumberWithDots(displayData.dashboard.pemasukan.jumlah)}</p>
                        </div>
                        <div className="flex items-center justify-center ml-4">
                            <img src={getDashboardIconPath('pemasukan')} alt="pemasukan" />
                        </div>
                    </div>
                </div>
    
                {/* Pengeluaran Card */}
                <div className="w-full">
                    <div className="flex items-center border border-[#F2E8F6] p-4 rounded-lg h-full">
                        <div className="flex-1">
                            <p className="text-gray-400 text-sm">Pengeluaran Terbanyak</p>
                            <p className="font-bold text-lg">{displayData.dashboard.pengeluaran.nama_toko}</p>
                            <p className="">Rp{formatNumberWithDots(displayData.dashboard.pengeluaran.jumlah)}</p>
                        </div>
                        <div className="flex items-center justify-center ml-4">
                            <img src={getDashboardIconPath('pengeluaran')} alt="pengeluaran" />
                        </div>
                    </div>
                </div>
    
                {/* Barang Terjual Card */}
                <div className="w-full">
                    <div className="flex items-center border border-[#F2E8F6] p-4 rounded-lg h-full">
                        <div className="flex-1">
                            <p className="text-gray-400 text-sm">Barang Terjual Terlaris</p>
                            <p className="font-bold text-lg">
                                {displayData.dashboard.barang.nama_barang}
                            </p>
                            <p className="">{formatNumberWithDots(displayData.dashboard.barang.jumlah)} Pcs</p>
                        </div>
                        <div className="flex items-center justify-center ml-4">
                            <img src={getDashboardIconPath('produkterjual')} alt="produk" />
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    // Table column headers
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
                        <p className={`text-${themeColor} text-base font-bold`}>Toko Terbaik</p>
                    </div>

                    <div className="right flex flex-wrap md:flex-nowrap items-center space-x-0 md:space-x-4 w-full md:w-auto space-y-2 md:space-y-0">
                        <div className="w-full md:w-auto">
                            {/* Export button (commented out) */}
                        </div>
                        <div className="w-full md:w-auto">
                            <input
                                type="month"
                                value={`${selectedYear}-${selectedMonth}`}
                                onChange={handleMonthChange}
                                className="w-full px-4 py-2 border border-secondary rounded-lg bg-gray-100 cursor-pointer pr-5"
                            />
                        </div>
                    </div>
                </section>

                <section className="mt-5 bg-white rounded-xl">
                    <div className="p-5">
                        {isLoading ? (
                            <div className="text-center py-8">Loading dashboard data...</div>
                        ) : (
                            renderOverviewSection()
                        )}
                    </div>
                </section>

                <section className="mt-5 bg-white rounded-xl">
                    <div className="p-5">
                        {isLoading ? (
                            <div className="text-center py-8">Loading table data...</div>
                        ) : (
                            <Table
                                headers={headers}
                                data={displayData.data_toko.map((item, index) => ({
                                    ...item,
                                    nomor: index + 1,
                                    "Barang Terjual": `${item["Barang Terjual"]} Pcs`,
                                    Pemasukan: `Rp${formatNumberWithDots(item.Pemasukan)}`,
                                    Pengeluaran: `Rp${formatNumberWithDots(item.Pengeluaran)}`,
                                    Keuntungan: `Rp${formatNumberWithDots(item.Keuntungan)}`
                                }))}
                            />
                        )}           
                    </div>
                </section>
            </div>
        </LayoutWithNav>
        </>
    );
}