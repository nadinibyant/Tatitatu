import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import Breadcrumbs from "../../../../components/Breadcrumbs";
import Navbar from "../../../../components/Navbar";
import Table from "../../../../components/Table";
import { menuItems, userOptions } from "../../../../data/menu";
import LayoutWithNav from "../../../../components/LayoutWithNav";
import api from "../../../../utils/api";
import Spinner from "../../../../components/Spinner";

export default function PengeluaranGaji(){
    const location = useLocation();
    const { nomor, fromLaporanKeuangan } = location.state || {};
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [gajiData, setGajiData] = useState(null);
    
    const breadcrumbItems = [
        { label: "Laporan Keuangan Toko", href: "/laporanKeuangan" },
        { label: "Detail Pengeluaran Gaji", href: "" },
    ];

    useEffect(() => {
        const fetchGajiData = async () => {
            try {
                setLoading(true);
                const response = await api.get(`/bayar-gaji/${nomor}`);
                
                if (response.data.success) {
                    setGajiData(response.data.data);
                } else {
                    setError(response.data.message || 'Failed to fetch data');
                }
            } catch (err) {
                setError(err.message || 'An error occurred while fetching data');
                console.error('Error fetching pengeluaran gaji:', err);
            } finally {
                setLoading(false);
            }
        };
        
        if (nomor) {
            fetchGajiData();
        }
    }, [nomor]);

    const headers = [
        { label: "No", key: "No", align: "text-left" },
        { label: "Nama", key: "nama", align: "text-left" },
        { label: "Divisi", key: "divisi", align: "text-left" },
        { label: "Toko", key: "toko", align: "text-left" },
        { label: "Cabang", key: "cabang", align: "text-left"},
        { label: "Absen", key: "absen", align: "text-left"},
        { label: "KPI", key: "kpi", align: "text-left"},
        { label: "Potongan Gaji", key: "potongan_gaji", align: "text-left"},
        { label: "Total Gaji Akhir", key: "total_gaji_akhir", align: "text-left"},
    ];

    const formatRupiah = (amount) => {
        return `Rp ${Number(amount).toLocaleString('id-ID')}`;
    };

    if (loading) return (
        <LayoutWithNav menuItems={menuItems} userOptions={userOptions}>
            <div className="p-5 flex justify-center items-center h-screen">
                <Spinner />
            </div>
        </LayoutWithNav>
    );

    if (error) return (
        <LayoutWithNav menuItems={menuItems} userOptions={userOptions}>
            <div className="p-5">
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    <p>Error: {error}</p>
                </div>
            </div>
        </LayoutWithNav>
    );

    if (!gajiData) return (
        <LayoutWithNav menuItems={menuItems} userOptions={userOptions}>
            <div className="p-5">
                <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
                    <p>Data not found</p>
                </div>
            </div>
        </LayoutWithNav>
    );

    // Calculate total from rincian_gaji
    const totalGajiAkhir = gajiData.rincian_gaji.reduce((total, item) => total + item.total_gaji_akhir, 0);

    // Transform data for the table
    const tableData = gajiData.rincian_gaji.map((item, index) => {
        return {
            No: index + 1,
            nama: item.karyawan?.nama_karyawan || '-',
            divisi: item.karyawan?.divisi?.nama_divisi || '-',
            toko: item.karyawan?.toko?.nama_toko || '-',
            cabang: item.karyawan?.cabang?.nama_cabang || '-',
            absen: item.absen,
            kpi: `${item.kpi}%`,
            potongan_gaji: formatRupiah(item.potongan_gaji),
            total_gaji_akhir: formatRupiah(item.total_gaji_akhir)
        };
    });

    return (
        <>
        <LayoutWithNav menuItems={menuItems} userOptions={userOptions}>
            <div className="p-5">
                <Breadcrumbs items={breadcrumbItems} />

                <section className="p-5 bg-white mt-5 rounded-xl">
                    <div className="border-b py-2">
                        <p className="font-bold text-lg">{gajiData.bayar_gaji_id}</p>
                    </div>

                    <section className="pt-5">
                        <div className="flex justify-between w-full flex-wrap md:flex-nowrap">
                            <div className="w-1/2 md:w-auto mb-4 md:mb-0">
                                <p className="text-gray-500 text-sm">Nomor</p>
                                <p className="font-bold text-lg">{gajiData.bayar_gaji_id}</p>
                            </div>
                            <div className="w-1/2 md:w-auto mb-4 md:mb-0">
                                <p className="text-gray-500 text-sm">Tanggal</p>
                                <p className="font-bold text-lg">{new Date(gajiData.tanggal).toLocaleDateString()}</p>
                            </div>
                            <div className="w-1/2 md:w-auto mb-4 md:mb-0">
                                <p className="text-gray-500 text-sm">Kategori</p>
                                <p className="font-bold text-lg">{gajiData.kategori_pengeluaran?.kategori_pengeluaran || 'Beban Gaji'}</p>
                            </div>
                            <div className="w-1/2 md:w-auto mb-4 md:mb-0">
                                <p className="text-gray-500 text-sm">Cash/Non-Cash</p>
                                <p className="font-bold text-lg">{gajiData.cash_or_non ? 'Cash' : 'Non-Cash'}</p>
                            </div>
                            <div className="w-1/2 md:w-auto">
                                <p className="text-gray-500 text-sm">Metode Pembayaran</p>
                                <p className="font-bold text-lg">{gajiData.cash_or_non ? '-' : (gajiData.metode?.nama_metode || '-')}</p>
                            </div>
                        </div>
                    </section>

                    <section className="pt-10">
                        <p className="font-bold">Rincian Gaji</p>
                        <div className="pt-5 overflow-x-auto">
                            <Table headers={headers} data={tableData} />
                        </div>
                    </section>

                    {/* Section Total */}
                    <section className="flex justify-end text-base py-10">
                        <div className="w-full md:w-1/2 lg:w-1/3 space-y-4 text-sm">
                            {/* akumulasi*/}
                            <div className="flex justify-between pb-2">
                                <p className="font-bold">Akumulasi Gaji Akhir</p>
                                <p className="font-bold">{formatRupiah(totalGajiAkhir)}</p>
                            </div>
                        </div>
                    </section>
                </section>
            </div>
        </LayoutWithNav>
        </>
    );
}