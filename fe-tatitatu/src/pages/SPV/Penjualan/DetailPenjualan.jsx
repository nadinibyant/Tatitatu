import { useLocation } from "react-router-dom";
import Navbar from "../../../components/Navbar";
import { menuItems, userOptions } from "../../../data/menuSpv";
import Breadcrumbs from "../../../components/Breadcrumbs";
import Table from "../../../components/Table";

export default function DetailPenjualan() {
    const location = useLocation()
    const {nomor} = location.state || {}
    const breadcrumbItems = [
        { label: "Daftar Penjualan Toko", href: "/penjualanToko" },
        { label: "Detail Penjualan", href: "" },
    ];

    const data = {
        nomor: 'INV123',
        tanggal: '2024-12-12',
        nama_pembeli: 'Suryani',
        bayar: 'Cash',
        metode: '-',
        catatan: 'Catatan penting mengenai transaksi ini',  
        data_produk: [
            {
                "Foto Produk": "https://via.placeholder.com/150",
                "Nama Produk": "Gelang Cantik",
                "Jenis Barang": "Barang Handmade",
                "Harga Satuan": 15000,
                kuantitas: 10,
                "Total Biaya": 150000
            },
            {
                "Foto Produk": "https://via.placeholder.com/150",
                "Nama Produk": "Gelang Cantik",
                "Jenis Barang": "Barang Handmade",
                "Harga Satuan": 15000,
                kuantitas: 10,
                "Total Biaya": 150000
            },
        ],
        data_packaging: [
            {
                "Nama Packaging": "zipper",
                "Harga Satuan": 1000,
                kuantitas: 10,
                "Total Biaya": 10000
            }
        ],
        sub_total: 8000,
        diskon: 30,
        pajak: 1000,
        total_penjualan: 18000
    }

    const headers = [
        { label: "No", key: "No", align: "text-left" },
        { label: "Foto Produk", key: "Foto Produk", align: "text-left" },
        { label: "Nama Produk", key: "Nama Produk", align: "text-left" },
        { label: "Jenis Barang", key: "Jenis Barang", align: "text-left" },
        { label: "Harga Satuan", key: "Harga Satuan", align: "text-left"},
        { label: "Kuantitas", key: "kuantitas", align: "text-left"},
        { label: "Total Biaya", key: "Total Biaya", align: "text-left"},
    ];

    const formatRupiah = (amount) => {
        return `Rp ${amount.toLocaleString('id-ID')}`;
    };

    const headers2 = [
        { label: "No", key: "No", align: "text-left" },
        { label: "Nama Packaging", key: "Nama Packaging", align: "text-left" },
        { label: "Harga Satuan", key: "Harga Satuan", align: "text-left" },
        { label: "Kuantitas", key: "kuantitas", align: "text-left" },
        { label: "Total Biaya", key: "Total Biaya", align: "text-left"},
    ];

    const formatCurrency = (amount) => {
        return amount.toLocaleString('id-ID', {
            style: 'currency',
            currency: 'IDR',
        });
    };

    return (
        <>
        <Navbar menuItems={menuItems} userOptions={userOptions}>
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

                    <section className="pt-10">
                        <p className="font-bold">List Produk</p>
                        <div className="pt-5">
                            <Table
                                headers={headers}
                                data={data.data_produk.map((item, index) => ({
                                    ...item,
                                    "Foto Produk": <img src={item["Foto Produk"]} alt={item["Nama Produk"]} className="w-12 h-12 object-cover" />, 
                                    "kuantitas": item.kuantitas.toLocaleString('id-ID'),
                                    "Harga Satuan": formatRupiah(item["Harga Satuan"]),  
                                    "Total Biaya": formatRupiah(item["Total Biaya"]),  
                                    No: index + 1  
                                }))}
                            />
                        </div>
                    </section>

                    <section className="pt-10">
                        <p className="font-bold">Packging</p>
                        <div className="pt-5">
                            <Table
                                headers={headers2}
                                data={data.data_packaging.map((item, index) => ({
                                    ...item,
                                    "kuantitas": item.kuantitas.toLocaleString('id-ID'),  
                                    "Total Biaya": formatRupiah(item["Total Biaya"]),  
                                    "Harga Satuan": formatRupiah(item["Harga Satuan"]),  
                                    No: index + 1  
                                }))}
                            />
                        </div>
                    </section>

                        <section className="flex justify-between py-10">
                        {/* Notes Section */}
                            <div className="w-1/2 pr-8">
                                <p className="font-bold mb-2">Catatan</p>
                                <textarea 
                                    className="w-full p-3 border rounded-lg"
                                    value={data.catatan}
                                    readOnly
                                    rows={4}
                                    placeholder="Masukan Catatan Disini"
                                />
                            </div>

                            {/* Totals Section */}
                            <div className="w-1/2 lg:w-1/3 space-y-4 text-sm">
                                {/* Sub Total */}
                                <div className="flex justify-between border-b pb-2">
                                    <p className="font-bold">Sub Total</p>
                                    <p>{formatCurrency(data.sub_total) || 0}</p>
                                </div>
                                {/* Diskon Keseluruhan */}
                                <div className="flex justify-between border-b pb-2">
                                    <p className="font-bold">Diskon Keseluruhan</p>
                                    <p>{data.diskon|| 0}%</p>
                                </div>
                                {/* pajak */}
                                <div className="flex justify-between border-b pb-2">
                                    <p className="font-bold">Pajak</p>
                                    <p>{formatCurrency(data.pajak) || 0}</p>
                                </div>
                                {/* Total Penjualan */}
                                <div className="flex justify-between border-b pb-2">
                                    <p className="font-bold">Total Penjualan</p>
                                    <p className="font-bold">{formatCurrency(data.total_penjualan) || 0}</p>
                                </div>
                            </div>
                        </section>
                </section>
            </div>
        </Navbar>
        </>
    )
}
