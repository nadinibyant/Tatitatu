import { useState } from "react";
import LayoutWithNav from "../../../components/LayoutWithNav";
import { menuKasirToko, userOptions } from "../../../data/menu";
import Button from "../../../components/Button";
import Table from "../../../components/Table";
import ActionMenu from "../../../components/ActionMenu";
import { useNavigate } from "react-router-dom";

export default function PenjualanKasir() {
    const [isDateModalOpen, setIsDateModalOpen] = useState(false);
    const [selectedMonth, setSelectedMonth] = useState(5);
    const [selectedYear, setSelectedYear] = useState(2024);
    const userData = JSON.parse(localStorage.getItem('userData'));
    const isAdminGudang = userData?.role === 'admingudang';

    const months = [
        "Januari", "Februari", "Maret", "April", "Mei", "Juni",
        "Juli", "Agustus", "September", "Oktober", "November", "Desember"
    ];

    const years = Array.from(
        { length: 11 }, 
        (_, i) => new Date().getFullYear() - 5 + i
    );

    const formatDateLabel = () => {
        return `${months[selectedMonth - 1]} ${selectedYear}`;
    };

    // Data penjualan
    const [data, setData] = useState([
        {
            Nomor: "STK1323",
            Tanggal: "31/05/2024",
            "Nama Barang": [
                "Gelang Barbie", 
                "Gelang Bulan", 
                "Kalung Mutiara",
                "Cincin Perak",
                "Gelang Perak"
            ],
            "Jumlah Barang": 2,
            Diskon: "11%",
            Pajak: "11%",
            "Total Transaksi": "Rp.200.000",
            tipe: "custom"
        },
        // Duplicate data untuk contoh
        ...Array(10).fill(null).map((_, i) => ({
            Nomor: "STK1323",
            Tanggal: "31/05/2024",
            "Nama Barang": [
                "Gelang Barbie", 
                "Gelang Bulan",
                "Kalung Mutiara"
            ],
            "Jumlah Barang": 2,
            Diskon: "11%",
            Pajak: "11%",
            "Total Transaksi": "Rp.200.000",
            tipe: "non-custom"
        }))
    ]);

    const handleRowClick = (row) => {
        const baseRoute = isAdminGudang ? '/penjualan-admin-gudang' : '/penjualan-kasir';
        navigate(`${baseRoute}/detail`, {state: {nomor: row.Nomor, tipe: row.tipe}});
    }

    // Headers untuk tabel
    const headers = [
        { label: "Nomor", key: "Nomor", align: "text-left" },
        { label: "Tanggal", key: "Tanggal", align: "text-left" },
        { label: "Nama Barang", key: "Nama Barang", align: "text-left" },
        { label: "Jumlah Barang", key: "Jumlah Barang", align: "text-center" },
        { label: "Diskon", key: "Diskon", align: "text-center" },
        { label: "Pajak", key: "Pajak", align: "text-center" },
        { label: "Total Transaksi", key: "Total Transaksi", align: "text-right" },
        { label: "Aksi", key: "aksi", align: "text-right" },
    ];

    // Format nama barang
    const formatNamaBarang = (items) => {
        if (items.length <= 2) {
            return items.join(", ");
        }
        return `${items[0]}, ${items[1]}, +${items.length - 2} Lainnya`;
    };

    // Handlers untuk action menu
    const handleEdit = (row) => {
        const baseRoute = isAdminGudang ? '/penjualan-admin-gudang' : '/penjualan-kasir';
        if (row.tipe === 'custom') {
            navigate(`${baseRoute}/edit/custom/${row.Nomor}`);
        } else {
            navigate(`${baseRoute}/edit/non-custom/${row.Nomor}`);
        }
    };

    const handleDelete = (row) => {
        console.log("Delete:", row);
    };

    const navigate = useNavigate()
    
    const handleAdd = () => {
        const baseRoute = isAdminGudang ? '/penjualan-admin-gudang' : '/penjualan-kasir';
        navigate(`${baseRoute}/tambah`);
    }

    const handleAddCustom = () => {
        const baseRoute = isAdminGudang ? '/penjualan-admin-gudang' : '/penjualan-kasir';
        navigate(`${baseRoute}/tambah/custom`);
    }

    return (
        <LayoutWithNav menuItems={menuKasirToko} userOptions={userOptions}>
            <div className="p-5">
                <section className="flex flex-wrap md:flex-nowrap items-center justify-between space-y-2 md:space-y-0">
                    <div className="left w-full md:w-auto">
                        <p className="text-primary text-base font-bold">Daftar Penjualan Toko</p>
                    </div>
                    <div className="right flex flex-wrap md:flex-nowrap items-center space-x-0 md:space-x-4 w-full md:w-auto space-y-2 md:space-y-0">
                        <Button 
                            label={formatDateLabel()}
                            icon={<svg width="18" height="20" viewBox="0 0 18 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M6 1V4M12 1V4M1.5 7.5H16.5M4.5 3H13.5C14.8807 3 16 4.11929 16 5.5V15.5C16 16.8807 14.8807 18 13.5 18H4.5C3.11929 18 2 16.8807 2 15.5V5.5C2 4.11929 3.11929 3 4.5 3Z" stroke="#7B0C42" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>}
                            bgColor="border border-secondary"
                            hoverColor="hover:bg-white"
                            textColor="text-black"
                            onClick={() => setIsDateModalOpen(true)}
                        />

                        {/* Modal pemilihan bulan dan tahun */}
                        {isDateModalOpen && (
                            <div className="fixed inset-0 bg-white bg-opacity-50 flex items-center justify-center z-50">
                                <div className="bg-white rounded-lg p-6 w-72">
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="text-lg font-semibold">Pilih Periode</h3>
                                        <button 
                                            onClick={() => setIsDateModalOpen(false)}
                                            className="text-gray-500 hover:text-gray-700"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </div>

                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Bulan
                                        </label>
                                        <select
                                            className="w-full border rounded-md p-2 focus:ring-2 focus:ring-primary"
                                            value={selectedMonth}
                                            onChange={(e) => setSelectedMonth(Number(e.target.value))}
                                        >
                                            {months.map((month, index) => (
                                                <option key={month} value={index + 1}>
                                                    {month}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="mb-6">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Tahun
                                        </label>
                                        <select
                                            className="w-full border rounded-md p-2 focus:ring-2 focus:ring-primary"
                                            value={selectedYear}
                                            onChange={(e) => setSelectedYear(Number(e.target.value))}
                                        >
                                            {years.map(year => (
                                                <option key={year} value={year}>
                                                    {year}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="flex justify-end space-x-2">
                                        <button
                                            onClick={() => setIsDateModalOpen(false)}
                                            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                                        >
                                            Batal
                                        </button>
                                        <button
                                            onClick={() => {
                                                // Di sini bisa ditambahkan logic untuk fetch data sesuai periode yang dipilih
                                                setIsDateModalOpen(false);
                                            }}
                                            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
                                        >
                                            Terapkan
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        <Button
                            label="Custom"
                            icon={<svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M13 8H8V13C8 13.2652 7.89464 13.5196 7.70711 13.7071C7.51957 13.8946 7.26522 14 7 14C6.73478 14 6.48043 13.8946 6.29289 13.7071C6.10536 13.5196 6 13.2652 6 13V8H1C0.734784 8 0.48043 7.89464 0.292893 7.70711C0.105357 7.51957 0 7.26522 0 7C0 6.73478 0.105357 6.48043 0.292893 6.29289C0.48043 6.10536 0.734784 6 1 6H6V1C6 0.734784 6.10536 0.480429 6.29289 0.292893C6.48043 0.105357 6.73478 0 7 0C7.26522 0 7.51957 0.105357 7.70711 0.292893C7.89464 0.480429 8 0.734784 8 1V6H13C13.2652 6 13.5196 6.10536 13.7071 6.29289C13.8946 6.48043 14 6.73478 14 7C14 7.26522 13.8946 7.51957 13.7071 7.70711C13.5196 7.89464 13.2652 8 13 8Z" fill="#7B0C42"/>
                            </svg>}
                            bgColor="border border-primary"
                            textColor="text-primary"
                            hoverColor="hover:bg-primary hover:text-white"
                            onClick={handleAddCustom}
                        />
                        <Button
                            label="Tambah"
                            icon={<svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M13 8H8V13C8 13.2652 7.89464 13.5196 7.70711 13.7071C7.51957 13.8946 7.26522 14 7 14C6.73478 14 6.48043 13.8946 6.29289 13.7071C6.10536 13.5196 6 13.2652 6 13V8H1C0.734784 8 0.48043 7.89464 0.292893 7.70711C0.105357 7.51957 0 7.26522 0 7C0 6.73478 0.105357 6.48043 0.292893 6.29289C0.48043 6.10536 0.734784 6 1 6H6V1C6 0.734784 6.10536 0.480429 6.29289 0.292893C6.48043 0.105357 6.73478 0 7 0C7.26522 0 7.51957 0.105357 7.70711 0.292893C7.89464 0.480429 8 0.734784 8 1V6H13C13.2652 6 13.5196 6.10536 13.7071 6.29289C13.8946 6.48043 14 6.73478 14 7C14 7.26522 13.8946 7.51957 13.7071 7.70711C13.5196 7.89464 13.2652 8 13 8Z" fill="white"/>
                            </svg>}
                            onClick={handleAdd}
                            bgColor="bg-primary"
                            textColor="text-white"
                            hoverColor="hover:bg-primary/90"
                        />
                    </div>
                </section>

                <section className="mt-5 bg-white rounded-xl">
                    <div className="p-5">
                        <Table
                            headers={headers}
                            data={data.map(item => ({
                                ...item,
                                "Nama Barang": formatNamaBarang(item["Nama Barang"]),
                                aksi: <ActionMenu 
                                    onEdit={() => handleEdit(item)} 
                                    onDelete={() => handleDelete(item)} 
                                />
                            }))}
                            hasSearch={true}
                            hasPagination={true}
                            onRowClick={handleRowClick}
                        />
                    </div>
                </section>
            </div>
        </LayoutWithNav>
    );
}