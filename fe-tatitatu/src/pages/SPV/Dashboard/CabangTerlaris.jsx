import { useState, useEffect } from "react";
import Button from "../../../components/Button";
import Navbar from "../../../components/Navbar";
import { menuItems, userOptions } from "../../../data/menu";
import moment from "moment";
import Table from "../../../components/Table";
import LayoutWithNav from "../../../components/LayoutWithNav";
import api from "../../../utils/api";

export default function CabangTerlaris(){
    const [selectedMonth, setSelectedMonth] = useState(moment().format('MM'));
    const [selectedYear, setSelectedYear] = useState(moment().format('YYYY'));
    const userData = JSON.parse(localStorage.getItem('userData'));
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState({
        keuntungan: {
            nama_toko: '',
            jumlah: 0
        },
        pemasukan: {
            nama_toko: '',
            jumlah: 0
        },
        pengeluaran: {
            nama_toko: '',
            jumlah: 0
        },
        barang: {
            nama_barang: '',
            jumlah: 0
        },
        data: []
    });

    const fetchData = async () => {
        try {
            setLoading(true);
            
            // Calculate start and end date based on selected month and year
            const startDate = moment(`${selectedYear}-${selectedMonth}-01`).startOf('month').format('YYYY-MM-DD');
            const endDate = moment(`${selectedYear}-${selectedMonth}-01`).endOf('month').format('YYYY-MM-DD');
            
            // Get toko_id from userData
            const tokoId = userData?.userId;
            
            // Make API request
            const response = await api.get(`/toko/terlaris?toko_id=${tokoId}&startDate=${startDate}&endDate=${endDate}`);
            
            if (response.data.success) {
                const apiData = response.data.data;
                
                // Transform API data to match component data structure
                const transformedData = {
                    keuntungan: {
                        nama_toko: apiData.cabang_terlaris.keuntungan_tertinggi.nama_cabang,
                        jumlah: apiData.cabang_terlaris.keuntungan_tertinggi.keuntungan
                    },
                    pemasukan: {
                        nama_toko: apiData.cabang_terlaris.pemasukan_tertinggi.nama_cabang,
                        jumlah: apiData.cabang_terlaris.pemasukan_tertinggi.total_pemasukan
                    },
                    pengeluaran: {
                        nama_toko: apiData.cabang_terlaris.pengeluaran_tertinggi.nama_cabang,
                        jumlah: apiData.cabang_terlaris.pengeluaran_tertinggi.total_pengeluaran
                    },
                    barang: {
                        nama_barang: apiData.cabang_terlaris.penjualan_terbanyak.nama_cabang,
                        jumlah: apiData.cabang_terlaris.penjualan_terbanyak.produk_terjual
                    },
                    data: apiData.toko.cabang.map(cabang => ({
                        Nama: cabang.nama_cabang,
                        "Barang Terjual": cabang.produk_terjual,
                        Pemasukan: cabang.total_pemasukan,
                        Pengeluaran: cabang.total_pengeluaran,
                        Keuntungan: cabang.keuntungan
                    }))
                };
                
                setData(transformedData);
            }
        } catch (error) {
            console.error('Error fetching cabang terlaris data:', error);
        } finally {
            setLoading(false);
        }
    };

    // Fetch data when the component mounts or when month/year selection changes
    useEffect(() => {
        fetchData();
    }, [selectedMonth, selectedYear, userData?.userId]);

    function formatNumberWithDots(number) {
        return number.toLocaleString('id-ID');
    }

    const headers = [
        { label: "#", key: "nomor", align: "text-left" },
        { label: "Nama", key: "Nama", align: "text-left" },
        { label: "Barang Terjual", key: "Barang Terjual", align: "text-left" },
        { label: "Pemasukan", key: "Pemasukan", align: "text-left" },
        { label: "Pengeluaran", key: "Pengeluaran", align: "text-center" },
        { label: "Keuntungan", key: "Keuntungan", align: "text-center" },
    ];

    return (
        <>
        <LayoutWithNav menuItems={menuItems} userOptions={userOptions}>
            <div className="p-5">
                <section className="flex flex-wrap md:flex-nowrap items-center justify-between space-y-2 md:space-y-0">
                    <div className="left w-full md:w-auto">
                    <p className="text-primary text-base font-bold">Cabang Terbaik</p>
                    </div>

                    <div className="right flex flex-wrap md:flex-nowrap items-center space-x-0 md:space-x-4 w-full md:w-auto space-y-2 md:space-y-0">
                    <div className="w-full md:w-auto">
                        {/* Button component was here, commented out in original code */}
                    </div>
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

                <section className="mt-5 bg-white rounded-xl">
                    <div className="p-5 mx-auto">
                        {/* Changed to grid layout for better responsiveness */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            {/* keuntungan */}
                            <div className="w-full">
                                <div className="flex items-center border border-[#F2E8F6] p-4 rounded-lg h-full">
                                    <div className="flex-1">
                                        <p className="text-gray-400 text-sm">Keuntungan Terbanyak</p>
                                        <p className="font-bold text-lg">{loading ? 'Loading...' : data.keuntungan.nama_toko}</p>
                                        <p className="">Rp{loading ? '0' : formatNumberWithDots(data.keuntungan.jumlah)}</p>
                                    </div>
                                    <div className="flex items-center justify-center ml-4">
                                        <img src="/keuangan/keuntungan.svg" alt="keuntungan" />
                                    </div>
                                </div>
                            </div>

                            {/* pemasukan */}
                            <div className="w-full">
                                <div className="flex items-center border border-[#F2E8F6] p-4 rounded-lg h-full">
                                    <div className="flex-1">
                                        <p className="text-gray-400 text-sm">Pemasukan Terbanyak</p>
                                        <p className="font-bold text-lg">{loading ? 'Loading...' : data.pemasukan.nama_toko}</p>
                                        <p className="">Rp{loading ? '0' : formatNumberWithDots(data.pemasukan.jumlah)}</p>
                                    </div>
                                    <div className="flex items-center justify-center ml-4">
                                        <img src="/keuangan/pemasukan.svg" alt="pemasukan" />
                                    </div>
                                </div>
                            </div>

                            {/* pengeluaran */}
                            <div className="w-full">
                                <div className="flex items-center border border-[#F2E8F6] p-4 rounded-lg h-full">
                                    <div className="flex-1">
                                        <p className="text-gray-400 text-sm">Pengeluaran Terbanyak</p>
                                        <p className="font-bold text-lg">{loading ? 'Loading...' : data.pengeluaran.nama_toko}</p>
                                        <p className="">Rp{loading ? '0' : formatNumberWithDots(data.pengeluaran.jumlah)}</p>
                                    </div>
                                    <div className="flex items-center justify-center ml-4">
                                        <img src="/keuangan/pengeluaran.svg" alt="pengeluaran" />
                                    </div>
                                </div>
                            </div>

                            {/* Barang Terbanyak */}
                            <div className="w-full">
                                <div className="flex items-center border border-[#F2E8F6] p-4 rounded-lg h-full">
                                    <div className="flex-1">
                                        <p className="text-gray-400 text-sm">Produk Terjual Terlaris</p>
                                        <p className="font-bold text-lg">{loading ? 'Loading...' : data.barang.nama_barang}</p>
                                        <p className="">{loading ? '0' : formatNumberWithDots(data.barang.jumlah)} Pcs</p>
                                    </div>
                                    <div className="flex items-center justify-center ml-4">
                                        <img src="/keuangan/produkterjual.svg" alt="produk" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="mt-5 bg-white rounded-xl">
                    <div className="p-5">
                        {loading ? (
                            <div className="text-center py-8">Loading data...</div>
                        ) : (
                            <Table
                                headers={headers}
                                data={data.data.map((item, index) => ({
                                    ...item,
                                    nomor: index + 1,
                                    "Barang Terjual": `${formatNumberWithDots(item["Barang Terjual"])} Pcs`,
                                    Pemasukan: `Rp${formatNumberWithDots(item.Pemasukan)}`,
                                    Pengeluaran: `Rp${formatNumberWithDots(item.Pengeluaran)}`,
                                    Keuntungan: `Rp${formatNumberWithDots(item.Keuntungan)}`,
                                }))}
                            />
                        )}
                    </div>
                </section>
            </div>
        </LayoutWithNav>
        </>
    )
}