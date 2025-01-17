import { useEffect, useState } from "react";
import Breadcrumbs from "../../../../components/Breadcrumbs";
import Navbar from "../../../../components/Navbar";
import Table from "../../../../components/Table";
import { menuItems, userOptions } from "../../../../data/menu";
import { useLocation } from "react-router-dom";
import LayoutWithNav from "../../../../components/LayoutWithNav";

export default function DetailNonPenjualan() {
    const location = useLocation()
    const {nomor} = location.state || {}
    
    const breadcrumbItems = [
        { label: "Daftar Pemasukan", href: "/laporanKeuangan" },
        { label: "Detail Pemasukan", href: "" },
    ];

    const headers = [
        { label: "No", key: "No", align: "text-left" },
        { label: "Deskripsi", key: "deskripsi", align: "text-left" },
        { label: "Toko", key: "toko", align: "text-left" },
        { label: "Cabang", key: "cabang", align: "text-left" },
        { label: "Pemasukan", key: "pemasukan", align: "text-left"},
    ];

    const data = {
        nomor: 'INC123',
        tanggal: '2024-12-12',
        kategori: 'Hibah',
        bayar: 'Cash',
        metode: '-',
        catatan: 'Catatan penting mengenai transaksi ini',  
        dataDetail: [
            {
                deskripsi: 'Dana Hibah',
                toko: 'Tatitatu',
                cabang: 'Cabang Gor HAS Padang',
                pemasukan: 1000000
            },
            {
                deskripsi: 'Dana Hibah',
                toko: 'Tatitatu',
                cabang: 'Cabang Gor HAS Padang',
                pemasukan: 1000000
            },
            {
                deskripsi: 'Dana Hibah',
                toko: 'Tatitatu',
                cabang: 'Cabang Gor HAS Padang',
                pemasukan: 1000000
            },
        ],
        total_detail: 3000000
    };

    const totalPemasukan = data.dataDetail.reduce((sum, item) => sum + item.pemasukan, 0);

    const formatRupiah = (amount) => {
        return `Rp ${amount.toLocaleString('id-ID')}`;
    };

    return (
        <>
        <LayoutWithNav menuItems={menuItems} userOptions={userOptions}>
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
                        <p className="font-bold">Deskripsi Pemasukan</p>
                        <div className="pt-5">
                            <Table
                                headers={headers}
                                data={data.dataDetail.map((item, index) => ({
                                    ...item,
                                    pemasukan: formatRupiah(item.pemasukan),  
                                    No: index + 1  
                                }))}
                            />
                        </div>
                        <div className="flex justify-between mt-5">
                            <div className="w-1/2">
                                <p className="font-bold mb-2">Catatan</p>
                                <textarea 
                                    className="w-full p-3 border rounded-lg"
                                    value={data.catatan}
                                    readOnly
                                    rows={4}
                                    placeholder="Masukan Catatan Disini"
                                />
                            </div>
                            <div className="flex items-start">
                                <div className="font-bold px-5">Total</div>
                                <div className="font-bold">{formatRupiah(totalPemasukan)}</div>
                            </div>
                        </div>
                    </section>
                </section>
            </div>
        </LayoutWithNav>
        </>
    );
}