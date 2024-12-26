import Breadcrumbs from "../../../../components/Breadcrumbs";
import Navbar from "../../../../components/Navbar";
import Table from "../../../../components/Table";
import { menuItems, userOptions } from "../../../../data/menuSpv";

export default function Pengeluaran() {
    const breadcrumbItems = [
        { label: "Daftar Pengeluaran", href: "/laporanKeuangan" },
        { label: "Detail Laporan Keuangan Toko", href: "" },
    ];

    const headers = [
        { label: "No", key: "No", align: "text-left" },
        { label: "Deskripsi", key: "deskripsi", align: "text-left" },
        { label: "Toko", key: "toko", align: "text-left" },
        { label: "Cabang", key: "cabang", align: "text-left" },
        { label: "Pengeluaran", key: "pengeluaran", align: "text-left"},
    ];

    const data = {
        nomor: 'EXP123',
        tanggal: '2024-12-12',
        kategori: 'Hibah',
        bayar: 'Cash',
        metode: '-' ,
        dataDetail: [
          {
              deskripsi: 'Biaya Operasional Staff',
              toko: 'Tatitatu',
              cabang: 'Cabang Gor HAS padang',
              pengeluaran: 1000000
          },
          {
              deskripsi: 'Biaya Operasional Staff',
              toko: 'Tatitatu',
              cabang: 'Cabang Gor HAS padang',
              pengeluaran: 1000000
          },
        ],
        sub_total: 8000,
        pemotongan: 1000,
        total_pengeluaran: 18000
    }

    const formatRupiah = (amount) => {
        return `Rp ${amount.toLocaleString('id-ID')}`;
    };

    const formatCurrency = (amount) => {
        return amount.toLocaleString('id-ID', {
            style: 'currency',
            currency: 'IDR',
        });
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
                                <p className="text-gray-500 text-sm">Cash/Non-Cash</p>
                                <p className="font-bold text-lg">{data.bayar}</p>
                            </div>
                            <div className="">
                                <p className="text-gray-500 text-sm">Metode Pembayaran</p>
                                <p className="font-bold text-lg">{data.metode}</p>
                            </div>
                        </div>
                    </section>

                    <section className="pt-8">
                        <p className="font-bold">Deskripsi Pengeluaran</p>
                        <div className="pt-5">
                            <Table
                                headers={headers}
                                data={data.dataDetail.map((item, index) => ({
                                    ...item,
                                    pengeluaran: formatRupiah(item.pengeluaran),  
                                    No: index + 1  
                                }))}
                            />
                        </div>

                        {/* Section Total */}
                        <section className="flex justify-end text-base py-10">
                            <div className="w-full md:w-1/2 lg:w-1/3 space-y-4 text-sm">
                                {/* Sub Total */}
                                <div className="flex justify-between border-b pb-2">
                                    <p className="font-bold">Sub Total</p>
                                    <p>{formatCurrency(data.sub_total) || 0}</p>
                                </div>
                                {/* Diskon Keseluruhan */}
                                <div className="flex justify-between border-b pb-2">
                                    <p className="font-bold">Pemotongan</p>
                                    <p>{formatCurrency(data.pemotongan) || 0}</p>
                                </div>
                                {/* Total Penjualan */}
                                <div className="flex justify-between border-b pb-2">
                                    <p className="font-bold">Total Pengeluaran</p>
                                    <p className="font-bold">{formatCurrency(data.total_pengeluaran) || 0}</p>
                                </div>
                            </div>
                        </section>
                    </section>
                </section>
            </div>
        </Navbar>
        </>
    );
}
