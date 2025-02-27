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
    const [transactions, setTransactions] = useState([]);
    const [topProducts, setTopProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [targetBulanan, setTargetBulanan] = useState({
        target: 0,
        tercapai: 0
    });
    const userData = JSON.parse(localStorage.getItem('userData'))
    const cabang_id = userData.userId

    const getProductImagePath = (product) => {
        switch (product.kategori) {
            case 'Handmade':
                return `${import.meta.env.VITE_API_URL}/images-barang-handmade/${product.image}`;
            case 'Non Handmade':
                return `${import.meta.env.VITE_API_URL}/images-barang-non-handmade/${product.image}`;
            case 'Custom':
                return `${import.meta.env.VITE_API_URL}/images-barang-custom/${product.image}`;
            case 'Packaging':
                return `${import.meta.env.VITE_API_URL}/images-packaging/${product.image}`;
            default:
                return '/icon/produk.svg';
        }
    };

    const fetchTopProducts = async () => {
        try {
            setIsLoading(true);
            const response = await api.get('/produk-penjualan/terlaris', {
                params: {
                    bulan: selectedMonth,
                    tahun: selectedYear,
                    cabang: cabang_id
                }
            });

            if (response.data.success) {
                const transformedTopProducts = response.data.data.map((product, index) => ({
                    No: index + 1,
                    Foto: product.image ? getProductImagePath(product) : '/icon/produk.svg',
                    "Nama Barang": product.name,
                    Terjual: product.total_terjual,
                    Kategori: product.kategori
                }));

                setTopProducts(transformedTopProducts);
            }
        } catch (error) {
            console.error('Error fetching top products:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Fetch transactions
    const fetchTransactions = async () => {
        try {
            setIsLoading(true);
            const response = await api.get('/penjualan', {
                params: {
                    bulan: selectedMonth,
                    tahun: selectedYear,
                    cabang: cabang_id
                }
            });

            if (response.data.success) {
                // Transform the data to match the existing table structure
                const transformedTransactions = response.data.data.map(transaction => ({
                    Nomor: transaction.penjualan_id,
                    Tanggal: moment(transaction.tanggal).format('DD/MM/YYYY'),
                    items: transaction.produk.map(produk => 
                        produk.barang_handmade?.nama_barang || 
                        produk.barang_non_handmade?.nama_barang || 
                        produk.barang_custom?.nama_barang || 
                        'Produk Tidak Dikenal'
                    ),
                    "Total Transaksi": transaction.total_penjualan
                }));

                setTransactions(transformedTransactions);
            }
        } catch (error) {
            console.error('Error fetching transactions:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Existing methods...
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

    useEffect(() => {
        fetchTargetBulanan();
        fetchTransactions();
        fetchTopProducts();
    }, [selectedMonth, cabang_id]);

    useEffect(() => {
        const userData = JSON.parse(localStorage.getItem('userData'));
        if (!userData || userData.role !== 'kasirtoko') {
            navigate('/login');
            return;
        }
    }, [navigate]);

    // Headers untuk kedua tabel
    const headersTransaksi = [
        { label: "Nomor", key: "Nomor", align: "text-left" },
        { label: "Tanggal", key: "Tanggal", align: "text-left" },
        { label: "Nama Barang", key: "Nama Barang", align: "text-left" },
        { label: "Total Transaksi", key: "Total Transaksi", align: "text-left" },
    ];

    const headersBarangTerlaris = [
        { label: "#", key: "No", align: "text-left" },
        { label: "Foto", key: "Foto", align: "text-left" },
        { label: "Nama Barang", key: "Nama Barang", align: "text-left" },
        { label: "Terjual", key: "Terjual", align: "text-center" },
        { label: "Kategori", key: "Kategori", align: "text-left" },
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
                                value={`${selectedYear}-${selectedMonth}`}
                                onChange={(e) => {
                                    const date = moment(e.target.value);
                                    setSelectedMonth(date.format('MM'));
                                    setSelectedYear(date.format('YYYY'));
                                }}
                                className="w-full px-4 py-2 border border-secondary rounded-lg bg-gray-100 cursor-pointer pr-5"
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
                                data={transactions.map(item => ({
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
                            data={topProducts.map(item => ({
                                ...item,
                                Terjual: `${item.Terjual.toLocaleString('id-ID')} Pcs`,
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