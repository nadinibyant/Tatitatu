// BayarGaji.jsx
import React, { useState } from 'react';
import Input from '../../../components/Input';
import InputDropdown from '../../../components/InputDropdown';
import Table from '../../../components/Table';
import LayoutWithNav from "../../../components/LayoutWithNav";
import { menuItems, userOptions } from "../../../data/menu";
import moment from "moment";
import Breadcrumbs from '../../../components/Breadcrumbs';

export default function BayarGaji() {
    // Data rincian gaji
    const dataRincianGaji = [
        {
            id: 1,
            Nama: 'Hamzah Abdillah Arif',
            Divisi: 'SPV',
            Toko: 'Tatitatu',
            Cabang: 'GOR. Haji Agus Salim',
            Absen: 15,
            KPI: "80%",
            "Total Gaji Akhir": 2500000
        },
        {
            id: 2,
            Nama: 'Hamzah Abdillah Arif',
            Divisi: 'Head Gudang',
            Toko: 'Tatitatu',
            Cabang: 'GOR. Haji Agus Salim',
            Absen: 15,
            KPI: "80%",
            "Total Gaji Akhir": 2500000
        },
        // ... tambahkan data lainnya
    ];

    const [formData, setFormData] = useState({
        nomor: '',
        tanggal: '',
        kategori: '',
        cashNonCash: '',
        metodePembayaran: ''
    });

    const headers = [
        { label: "No", key: "No", align: "text-left" },
        { label: "Nama", key: "Nama", align: "text-left" },
        { label: "Divisi", key: "Divisi", align: "text-left" },
        { label: "Toko", key: "Toko", align: "text-left" },
        { label: "Cabang", key: "Cabang", align: "text-left" },
        { label: "Absen", key: "Absen", align: "text-left" },
        { label: "KPI", key: "KPI", align: "text-left" },
        { label: "Total Gaji Akhir", key: "Total Gaji Akhir", align: "text-left" }
    ];

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const formatCurrency = (number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(number).replace('IDR', 'Rp');
    };

    const calculateTotal = () => {
        return dataRincianGaji.reduce((sum, item) => sum + item["Total Gaji Akhir"], 0);
    };

    const breadcrumbItems = [
        { label: "Daftar Karyawan Absensi dan Gaji", href: "/karyawan-absen-gaji" },
        { label: "Bayar Gaji", href: "" },
    ]

    return (
        <LayoutWithNav menuItems={menuItems} userOptions={userOptions}>
            <div className="p-5">
                <Breadcrumbs items={breadcrumbItems} />

                <div className="mt-5 bg-white rounded-xl p-5">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Input
                            label="Nomor"
                            value={formData.nomor}
                            onChange={(value) => handleInputChange('nomor', value)}
                            required
                        />
                        <Input
                            label="Tanggal dan Waktu"
                            type1="datetime-local"
                            value={formData.tanggal}
                            onChange={(value) => handleInputChange('tanggal', value)}
                            required
                        />
                        <InputDropdown
                            label="Kategori"
                            options={['Pilih Kategori Pengeluaran']}
                            value={formData.kategori}
                            onSelect={(value) => handleInputChange('kategori', value)}
                            required
                        />
                        <InputDropdown
                            label="Cash/Non-Cash"
                            options={['Cash', 'Non-Cash']}
                            value={formData.cashNonCash}
                            onSelect={(value) => handleInputChange('cashNonCash', value)}
                            required
                        />
                        <InputDropdown
                            label="Metode Pembayaran"
                            options={['-', 'Mandiri', 'BNI']}
                            value={formData.metodePembayaran}
                            onSelect={(value) => handleInputChange('metodePembayaran', value)}
                            disabled={formData.cashNonCash === 'Cash'}
                        />
                    </div>

                    <div className="mt-8">
                        <h3 className="font-medium mb-4">Rincian Gaji</h3>
                        <Table
                            headers={headers}
                            data={dataRincianGaji.map((item, index) => ({
                                ...item,
                                No: index + 1,
                                "Total Gaji Akhir": formatCurrency(item["Total Gaji Akhir"])
                            }))}
                            hasFilter={false}
                            hasSearch={false}
                        />
                        
                        <div className="flex justify-end mt-8">
                            <div className="text-right">
                                <div className="flex justify-between gap-20">
                                    <span className="font-medium">Total</span>
                                    <span className="font-medium">
                                        {formatCurrency(calculateTotal())}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 flex justify-end">
                            <button className="w-1/3 bg-primary text-white py-2 rounded-lg">
                                Simpan
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </LayoutWithNav>
    );
}