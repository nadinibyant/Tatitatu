import Breadcrumbs from "../../../../components/Breadcrumbs";
import Navbar from "../../../../components/Navbar";
import Table from "../../../../components/Table";
import { menuItems, userOptions } from "../../../../data/menuSpv";

export default function DetailNonPenjualan() {
    const breadcrumbItems = [
        { label: "Daftar Pemasukan", href: "/laporanKeuangan" },
        { label: "Detail Pemasukan", href: "" },
    ];

    const headers = [
        { label: "No", key: "No", align: "text-left" },
        { label: "Deskripsi", key: "deskripsi", align: "text-left" },
        { label: "Toko", key: "toko", align: "text-left" },
        { label: "Cabang", key: "cabang", align: "text-left" },
        { label: "Pengeluaran", key: "pengeluaran", align: "text-left"},
    ];

    const data = {
        nomor: 'BBN124',
        tanggal: '2024-12-12',
        deskripsi: 'Pengeluaran Buat Listrik',
        cabang: "Gor Agus",
        kategori: 'Beban Operasional',
        total: 10000,
        jenis: 'non-penjualan',
        detail: {
            nomor: 'INC123',
            tanggal: '2024-12-12',
            kategori: 'Hibah',
            bayar: 'Cash',
            metode: '-',
            dataDetail: [
                {
                    deskripsi: 'Dana Hibah',
                    toko: 'Tatitatu',
                    cabang: 'Cabang Gor HAS Padang',
                    pengeluaran: 1000000
                },
                {
                    deskripsi: 'Dana Hibah',
                    toko: 'Tatitatu',
                    cabang: 'Cabang Gor HAS Padang',
                    pengeluaran: 1000000
                },
                {
                    deskripsi: 'Dana Hibah',
                    toko: 'Tatitatu',
                    cabang: 'Cabang Gor HAS Padang',
                    pengeluaran: 1000000
                },
            ],
            total_detail: 3000000
        }
    };

    const totalPengeluaran = data.detail.dataDetail.reduce((sum, item) => sum + item.pengeluaran, 0);

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
                        <p className="font-bold text-lg">{data.detail.nomor}</p>
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
                                <p className="text-gray-500 text-sm">Cash/Non-Cash</p>
                                <p className="font-bold text-lg">{data.detail.bayar}</p>
                            </div>
                            <div className="">
                                <p className="text-gray-500 text-sm">Metode Pembayaran</p>
                                <p className="font-bold text-lg">{data.detail.metode}</p>
                            </div>
                        </div>
                    </section>

                    <section className="pt-8">
                        <p className="font-bold">Deskripsi Pemasukan</p>
                        <div className="pt-5">
                            <Table
                                headers={headers}
                                data={data.detail.dataDetail.map((item, index) => ({
                                    ...item,
                                    pengeluaran: formatRupiah(item.pengeluaran),  
                                    No: index + 1  
                                }))}
                            />
                        </div>
                        <div className="flex justify-end mt-5">
                            <div className="font-bold px-5">Total Pengeluaran</div>
                            <div className="font-bold">{formatRupiah(totalPengeluaran)}</div>
                        </div>
                    </section>
                </section>
            </div>
        </Navbar>
        </>
    );
}
