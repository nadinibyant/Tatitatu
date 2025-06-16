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
    const isAdminGudang = userData?.role === 'admingudang'
    const isHeadGudang = userData?.role === 'headgudang';
    const isOwner = userData?.role === 'owner';
    const isManajer = userData?.role === 'manajer';
    const isAdmin = userData?.role === 'admin';
    const isFinance = userData?.role === 'finance'
    const isKasirToko = userData?.role === 'kasirtoko';
    const isKaryawanProduksi = userData?.role === 'karyawanproduksi';
    const cabang_id = userData.userId
    const toko_id = userData?.tokoId;

    const getImagePath = (kategori) => {
        if (!kategori) return '';
        
        const normalizedCategory = kategori.toLowerCase();
        
        if (normalizedCategory.includes('handmade') && !normalizedCategory.includes('non')) {
            return 'images-barang-handmade';
        } else if (
            (normalizedCategory.includes('non') && normalizedCategory.includes('handmade')) || 
            normalizedCategory.includes('non-handmade')
        ) {
            return 'images-barang-non-handmade';
        } else if (normalizedCategory.includes('custom')) {
            return 'images-barang-custom';
        } else if (normalizedCategory.includes('packaging')) {
            return 'images-packaging';
        } else if (normalizedCategory.includes('mentah') || normalizedCategory.includes('bahan')) {
            return 'images-barang-mentah';
        } else {
            return 'images-barang-handmade'; 
        }
    };

    const themeColor = (isAdminGudang || isHeadGudang || isKaryawanProduksi || toko_id === 1) 
        ? 'coklatTua' 
        : (isManajer || isOwner || isFinance) 
        ? "biruTua" 
        : ((isAdmin && userData?.userId !== 1 && userData?.userId !== 2) || 
            (isKasirToko && toko_id !== undefined && toko_id !== null && toko_id !== 1 && toko_id !== 2))
            ? "hitam"
            : "primary";
    const targetColor = (isAdminGudang || isHeadGudang || isKaryawanProduksi || toko_id === 1) 
        ? 'coklatMuda' 
        : (isManajer || isOwner || isFinance) 
        ? "biruMuda" 
        : ((isAdmin && userData?.userId !== 1 && userData?.userId !== 2) || 
            (isKasirToko && toko_id !== undefined && toko_id !== null && toko_id !== 1 && toko_id !== 2))
            ? "secondary"
            : "pink";

    const getTargetKasirIcon = () => {
        if (themeColor === 'coklatTua') {
        return "/Icon Warna/targetKasir_gudang.svg";
        } else if (themeColor === 'biruTua') {
        return "/Icon Warna/targetKasir_non.svg";
        } else if (themeColor === 'hitam') {
        return "/Icon Warna/targetKasir_toko2.svg";
        } else {
        return "/Icon Warna/targetKasir.svg"; 
        }
    };

    // const exportIcon = (isAdminGudang || isHeadGudang) ? (
    //     <svg xmlns="http://www.w3.org/2000/svg" width="17" height="20" viewBox="0 0 17 20" fill="none">
    //       <path d="M1.37423 20L0 18.6012L2.89571 15.7055H0.687116V13.7423H6.23313V19.2883H4.26994V17.1043L1.37423 20ZM8.19632 19.6319V11.7791H0.343558V0H10.1595L16.0491 5.88957V19.6319H8.19632ZM9.17791 6.87117H14.0859L9.17791 1.96319V6.87117Z" fill="#71503D"/>
    //     </svg>
    //   ) : (isManajer || isOwner || isFinance) ? (
    //     <svg xmlns="http://www.w3.org/2000/svg" width="17" height="20" viewBox="0 0 17 20" fill="none">
    //       <path d="M1.37423 20L0 18.6012L2.89571 15.7055H0.687116V13.7423H6.23313V19.2883H4.26994V17.1043L1.37423 20ZM8.19632 19.6319V11.7791H0.343558V0H10.1595L16.0491 5.88957V19.6319H8.19632ZM9.17791 6.87117H14.0859L9.17791 1.96319V6.87117Z" fill="#023F80"/>
    //     </svg>
    //   ) : (isAdmin && (userData?.userId !== 1 && userData?.userId !== 2)) ? (
    //     <svg xmlns="http://www.w3.org/2000/svg" width="17" height="20" viewBox="0 0 17 20" fill="none">
    //     <path d="M1.37423 20L0 18.6012L2.89571 15.7055H0.687116V13.7423H6.23313V19.2883H4.26994V17.1043L1.37423 20ZM8.19632 19.6319V11.7791H0.343558V0H10.1595L16.0491 5.88957V19.6319H8.19632ZM9.17791 6.87117H14.0859L9.17791 1.96319V6.87117Z" fill="#2D2D2D"/>
    //     </svg>     
    //   ) : (
    //     <svg width="17" height="20" viewBox="0 0 17 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    //       <path d="M1.44845 20L0.0742188 18.6012L2.96992 15.7055H0.761335V13.7423H6.30735V19.2883H4.34416V17.1043L1.44845 20ZM8.27054 19.6319V11.7791H0.417777V0H10.2337L16.1233 5.88957V19.6319H8.27054ZM9.25213 6.87117H14.1601L9.25213 1.96319V6.87117Z" fill="#7B0C42" />
    //     </svg>
    //   );

    const fetchTopProducts = async () => {
        try {
            setIsLoading(true);
            const startDate = moment(`${selectedYear}-${selectedMonth}-01`).format('YYYY-MM-DD');
            const endDate = moment(`${selectedYear}-${selectedMonth}-01`).endOf('month').format('YYYY-MM-DD');
     
            const response = await api.get(`/produk-penjualan/cabang/topten`, {
                params: {
                    cabang_id: cabang_id,
                    startDate: startDate,
                    endDate: endDate
                }
            });
    
            if (response.data.success) {
                const transformedTopProducts = response.data.data.map((product, index) => ({
                    No: index + 1,
                    Foto: product.image ? 
                        `${import.meta.env.VITE_API_URL}/${getImagePath(product.kategori)}/${product.image}` : 
                        '/icon/produk.svg',
                    "Nama Barang": product.nama || product.name || '-', 
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

    const fetchTargetBulanan = async () => {
        try {
            if (!cabang_id) return;
            const year = selectedYear;
    
            const response = await api.get(`/target-bulanan-kasir`, {
                params: {
                    cabang: cabang_id,
                    tahun: year
                }
            });
        
            if (response.data.success) {
                const monthNames = [
                    "January", "February", "March", "April", "May", "June",
                    "July", "August", "September", "October", "November", "December"
                ];
    
                const selectedMonthName = monthNames[parseInt(selectedMonth) - 1];
    
                const targetData = response.data.data.find(item => 
                    item.bulan === selectedMonthName
                );
                
                if (targetData) {
                    const totalTarget = targetData.jumlah_target || 0;
                    const achieved = targetData.tercapai || 0;
                    const remaining = Math.max(0, totalTarget - achieved);
                    
                    setTargetBulanan({
                        tersisa: remaining,  
                        tercapai: achieved,
                        total: totalTarget  
                    });
                } else {
                    setTargetBulanan({
                        tersisa: 0,
                        tercapai: 0,
                        total: 0
                    });
                }
            }
        } catch (error) {
            console.error('Error fetching target bulanan:', error);
            setTargetBulanan({
                tersisa: 0,
                tercapai: 0,
                total: 0
            });
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
                        <p className={`text-${themeColor} text-base font-bold`}>Dashboard</p>
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
                            <img src={getTargetKasirIcon()} alt="target" className="w-6 h-6"/>
                            <h2 className="font-bold text-lg">Target Bulanan Kasir</h2>
                        </div>
                        <div className="mt-4 relative">
                            <div className="flex justify-between mb-2">
                                <span>Rp{(targetBulanan?.tercapai || 0).toLocaleString('id-ID')} Tercapai</span>
                                <span>Rp{(targetBulanan?.tersisa || 0).toLocaleString('id-ID')} Tersisa</span>
                            </div>
                            <div className={`w-full h-4 bg-${targetColor} rounded-full overflow-hidden`}>
                                <div 
                                    className={`h-full bg-${themeColor} rounded-full`}
                                    style={{ 
                                        width: `${
                                            (targetBulanan?.total > 0) 
                                                ? Math.min((targetBulanan.tercapai / targetBulanan.total) * 100, 100) 
                                                : 0
                                        }%`
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