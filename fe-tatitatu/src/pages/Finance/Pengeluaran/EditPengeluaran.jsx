import React, { useState, useEffect } from 'react';
import Input from '../../../components/Input';
import InputDropdown from '../../../components/InputDropdown';
import Table from '../../../components/Table';
import Breadcrumbs from "../../../components/Breadcrumbs";
import LayoutWithNav from "../../../components/LayoutWithNav";

export default function EditPengeluaran() {
    const breadcrumbItems = [
        { label: "Daftar Pengeluaran", href: "/pengeluaran" },
        { label: "Edit Pengeluaran", href: "" },
    ];

    const initialData = {
        formData: {
            nomor: "EXP1223",
            tanggal: "2024-01-12T10:00",
            kategori: "Pilih Kategori Pengeluaran",
            cashNonCash: "Cash",
            metodePembayaran: "-"
        },
        tableData: [
            {
                id: 1,
                deskripsi: "Dana Hibah",
                toko: "Rumah Produksi",
                cabang: "-",
                jumlahPengeluaran: "1000000"
            },
            {
                id: 2,
                deskripsi: "Dana Sedekah Dari Syifa",
                toko: "Tatitatu",
                cabang: "GOR. HAS Padang",
                jumlahPengeluaran: "1000000"
            }
        ]
    };

    const [formData, setFormData] = useState(initialData.formData);
    const [tableRows, setTableRows] = useState(initialData.tableData);

    // Options for dropdowns
    const tokoOptions = ['Rumah Produksi', 'Tatitatu'];
    const cabangOptions = ['-', 'GOR. HAS Padang'];
    const cashOptions = ['Cash', 'Non-Cash'];
    const metodePembayaranOptions = ['-', 'Mandiri', 'BNI'];

    useEffect(() => {
        if (formData.cashNonCash === 'Cash') {
            setFormData(prev => ({
                ...prev,
                metodePembayaran: '-'
            }));
        }
    }, [formData.cashNonCash]);

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleRowChange = (id, field, value) => {
        setTableRows(prev => prev.map(row => {
            if (row.id === id) {
                return { ...row, [field]: value };
            }
            return row;
        }));
    };

    const addNewRow = () => {
        const newRow = {
            id: Date.now(),
            deskripsi: '',
            toko: '',
            cabang: '',
            jumlahPengeluaran: ''
        };
        setTableRows([...tableRows, newRow]);
    };

    const deleteRow = (id) => {
        setTableRows(prev => prev.filter(row => row.id !== id));
    };

    const tableData = tableRows.map((row, index) => ({
        no: index + 1,
        deskripsi: (
            <Input
                value={row.deskripsi}
                onChange={(value) => handleRowChange(row.id, 'deskripsi', value)}
                width="w-full"
                showRequired={false}
                required={false}
            />
        ),
        toko: (
            <InputDropdown
                options={tokoOptions}
                value={row.toko}
                onSelect={(value) => handleRowChange(row.id, 'toko', value)}
                width="w-48"
                showRequired={false}
                required={false}
            />
        ),
        cabang: (
            <InputDropdown
                options={cabangOptions}
                value={row.cabang}
                onSelect={(value) => handleRowChange(row.id, 'cabang', value)}
                width="w-48"
                showRequired={false}
                required={false}
            />
        ),
        jumlahPengeluaran: (
            <Input
                type="number"
                value={row.jumlahPengeluaran}
                onChange={(value) => handleRowChange(row.id, 'jumlahPengeluaran', value)}
                width="w-40"
                showRequired={false}
                required={false}
            />
        ),
        aksi: (
            <button
                onClick={() => deleteRow(row.id)}
                className="text-red-500 hover:text-red-700"
            >
                Hapus
            </button>
        )
    }));

    const tableHeaders = [
        { key: 'no', label: 'No' },
        { key: 'deskripsi', label: 'Deskripsi' },
        { key: 'toko', label: 'Toko' },
        { key: 'cabang', label: 'Cabang' },
        { key: 'jumlahPengeluaran', label: 'Jumlah Pengeluaran' },
        { key: 'aksi', label: 'Aksi' }
    ];

    const calculateTotal = () => {
        return tableRows.reduce((sum, row) => {
            const amount = parseInt(row.jumlahPengeluaran) || 0;
            return sum + amount;
        }, 0);
    };

    // Function to handle save/update
    const handleSave = () => {
        // Prepare the updated data
        const updatedData = {
            formData: { ...formData },
            tableData: tableRows.map(row => ({
                id: row.id,
                deskripsi: row.deskripsi,
                toko: row.toko,
                cabang: row.cabang,
                jumlahPengeluaran: row.jumlahPengeluaran
            }))
        };

        // Here you can handle the saving of updated data
        console.log('Data yang diupdate:', updatedData);
    };

    return (
        <LayoutWithNav>
            <div className="p-5">
                <Breadcrumbs items={breadcrumbItems} />
                <section className="mt-5 bg-white rounded-xl">
                    <div className="p-5">
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
                                options={cashOptions}
                                value={formData.cashNonCash}
                                onSelect={(value) => handleInputChange('cashNonCash', value)}
                                required
                            />
                            <InputDropdown
                                label="Metode Pembayaran"
                                options={metodePembayaranOptions}
                                value={formData.metodePembayaran}
                                onSelect={(value) => handleInputChange('metodePembayaran', value)}
                                width="w-full"
                                disabled={formData.cashNonCash === 'Cash'}
                            />
                        </div>

                        <div className="mt-8">
                            <h3 className="font-medium mb-4">Deskripsi Pengeluaran</h3>
                            
                            <Table
                                headers={tableHeaders}
                                data={tableData}
                                hasSearch={false}
                            />

                            <div className="mt-4">
                                <button
                                    onClick={addNewRow}
                                    className="flex items-center text-primary hover:text-primary-dark"
                                >
                                    <span className="mr-2 text-xl">+</span>
                                    <span className="text-primary">Tambah Baris</span>
                                </button>
                            </div>

                            <div className="flex justify-end mt-8">
                                <div className="text-right">
                                    <div className="flex justify-between gap-52">
                                        <span className="font-medium">Total</span>
                                        <span className="font-medium">
                                            Rp{calculateTotal().toLocaleString()}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 flex justify-end">
                                <button 
                                    onClick={handleSave}
                                    className="w-1/3 bg-primary text-white py-2 rounded-lg"
                                >
                                    Simpan
                                </button>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </LayoutWithNav>
    );
}