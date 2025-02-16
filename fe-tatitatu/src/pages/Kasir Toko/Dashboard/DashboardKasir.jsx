import { useEffect, useState } from "react";
import Button from "../../../components/Button";
import LayoutWithNav from "../../../components/LayoutWithNav";
import moment from "moment";
import Table from "../../../components/Table";
import { useNavigate } from "react-router-dom";
import api from "../../../utils/api";

export default function DashboardKasir(){
    const navigate = useNavigate()
    const [selectedMonth, setSelectedMonth] = useState(moment().format('MM'));
    const [selectedYear, setSelectedYear] = useState(moment().format('YYYY'));
    const monthValue = `${selectedYear}-${selectedMonth}`;
    const [targetBulanan, setTargetBulanan] = useState({
        target: 0,
        tercapai: 0
    });
    const userData = JSON.parse(localStorage.getItem('userData'))
    const cabang_id = userData.userId
    console.log(cabang_id)

    const fetchTargetBulanan = async () => {
        try {
            if (!cabang_id) return;
    
            const response = await api.get(`/target-bulanan-kasrir/${cabang_id}/cabang`);
            if (response.data.success) {
                const bulanNames = [
                    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
                    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
                ];
                const selectedMonthName = bulanNames[parseInt(selectedMonth) - 1];
                
                const targetData = response.data.data.find(item => 
                    item.bulan === selectedMonthName
                );
    
                if (targetData) {
                    setTargetBulanan({
                        tersisa: targetData.jumlah_target, 
                        tercapai: 0
                    });
                } else {
                    setTargetBulanan({
                        tersisa: 0,
                        tercapai: 0
                    });
                }
            }
        } catch (error) {
            console.error('Error fetching target bulanan:', error);
        }
    };

    const handleMonthChange = (e) => {
        const value = e.target.value;
        const [year, month] = value.split('-');
        setSelectedMonth(month);
        setSelectedYear(year);
    };

    useEffect(() => {
        fetchTargetBulanan();
    }, [selectedMonth, cabang_id]);

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
                                <input 
                                    type="month"
                                    value={monthValue}
                                    onChange={handleMonthChange}
                                    className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                                    style={{ maxWidth: '200px' }}
                                />
                            </div>
                        </div>
                    </section>

                {/* Target section */}
                <section className="mt-5">
                    <div className="bg-white rounded-lg p-4">
                        <div className="flex items-center gap-2">
                            <img src="/Icon Warna/targetKasir.svg" alt="target" className="w-6 h-6"/>
                            <h2 className="font-bold text-lg">Target Bulanan Kasir</h2>
                        </div>
                        <div className="mt-4 relative">
                            <div className="flex justify-between mb-2">
                                <span>Rp{(targetBulanan?.tercapai || 0).toLocaleString('id-ID')} Tercapai</span>
                                <span>Rp{(targetBulanan?.tersisa || 0).toLocaleString('id-ID')} Tersisa</span>
                            </div>
                            <div className="w-full h-4 bg-pink rounded-full overflow-hidden">
                                <div 
                                    className="h-full bg-primary rounded-full"
                                    style={{ 
                                        width: `${(targetBulanan?.tersisa > 0 && targetBulanan?.tercapai >= 0) 
                                            ? Math.min((targetBulanan.tercapai / targetBulanan.tersisa) * 100, 100) 
                                            : 0}%`
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