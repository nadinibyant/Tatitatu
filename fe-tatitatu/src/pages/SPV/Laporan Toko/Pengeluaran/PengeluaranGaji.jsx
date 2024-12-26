import Breadcrumbs from "../../../../components/Breadcrumbs";
import Navbar from "../../../../components/Navbar";
import Table from "../../../../components/Table";
import { menuItems, userOptions } from "../../../../data/menuSpv";

export default function PengeluaranGaji(){
    const breadcrumbItems = [
        { label: "Daftar Pengeluaran", href: "/laporanKeuangan" },
        { label: "Detail Laporan Keuangan Toko", href: "" },
    ];

    const data = {
        nomor: 'WAGE',
        tanggal: '2024-12-12',
        kategori: 'Bebang Gaji',
        cash: 'Cash',
        metode: '-',
        dataGaji: [
            {
                nama: 'Hamzah Abdillah Arif',
                divisi: 'SPV',
                toko: 'tatitatu',
                cabang: 'GOR Haji Agus Salim',
                absen: 15,
                kpi: 80,
                total_gaji_akhir: 2500000
            },
            {
                nama: 'Hamzah Abdillah Arif',
                divisi: 'SPV',
                toko: 'tatitatu',
                cabang: 'GOR Haji Agus Salim',
                absen: 15,
                kpi: 80,
                total_gaji_akhir: 2500000
            }
        ],
        akumulasi_akhir: 2000000
    }

    const headers = [
        { label: "No", key: "No", align: "text-left" },
        { label: "Nama", key: "nama", align: "text-left" },
        { label: "Divisi", key: "divisi", align: "text-left" },
        { label: "Toko", key: "toko", align: "text-left" },
        { label: "Cabang", key: "cabang", align: "text-left"},
        { label: "Absen", key: "absen", align: "text-left"},
        { label: "KPI", key: "kpi", align: "text-left"},
        { label: "Total Gaji Akhir", key: "total_gaji_akhir", align: "text-left"},
    ];

    const formatRupiah = (amount) => {
        return `Rp ${amount.toLocaleString('id-ID')}`;
    };

    return (
        <>
        <Navbar menuItems={menuItems} userOptions={userOptions} label={'Laporan Keuangan Toko'}>
            <div className="p-5">
                <Breadcrumbs items={breadcrumbItems} />

                <section className="p-5 bg-white mt-5 rounded-xl">
                    <div className="border-b py-2">
                        <p className="font-bold text-lg">{data.nomor}</p>
                    </div>

                    <section className="pt-5">
                        <div className="flex justify-between w-full">
                            <div className="">
                                <p className="text-gray-500 text-sm">Nomor</p>
                                <p className="font-bold text-lg">{data.nomor}</p>
                            </div>
                            <div className="">
                                <p className="text-gray-500 text-sm">Tanggal</p>
                                <p className="font-bold text-lg">{new Date(data.tanggal).toLocaleDateString()}</p>
                            </div>
                            <div className="">
                                <p className="text-gray-500 text-sm">Kategori</p>
                                <p className="font-bold text-lg">{data.kategori}</p>
                            </div>
                            <div className="">
                                <p className="text-gray-500 text-sm">Cash/Non-Cash</p>
                                <p className="font-bold text-lg">{data.cash}</p>
                            </div>
                            <div className="">
                                <p className="text-gray-500 text-sm">Metode Pembayaran</p>
                                <p className="font-bold text-lg">{data.metode}</p>
                            </div>
                        </div>
                    </section>

                    <section className="pt-10">
                        <p className="font-bold">Rincian Gaji</p>
                        <div className="pt-5">
                            <Table
                                headers={headers}
                                data={data.dataGaji.map((item, index) => ({
                                    ...item,
                                    "kpi": `${item["kpi"]}%`,
                                    "total_gaji_akhir": formatRupiah(item["total_gaji_akhir"]),  
                                    No: index + 1  
                                }))}
                            />
                        </div>
                    </section>

                        {/* Section Total */}
                        <section className="flex justify-end text-base py-10">
                            <div className="w-full md:w-1/2 lg:w-1/3 space-y-4 text-sm">
                                {/* akumulasi*/}
                                <div className="flex justify-between pb-2">
                                    <p className="font-bold">Akumulasi Gaji Akhir</p>
                                    <p className="font-bold">{formatRupiah(data.akumulasi_akhir) || 0}</p>
                                </div>
                            </div>
                        </section>
                </section>
            </div>
        </Navbar>
        </>
    )
}