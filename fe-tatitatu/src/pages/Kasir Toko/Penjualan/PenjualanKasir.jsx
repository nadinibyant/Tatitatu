import { useEffect, useState } from "react";
import LayoutWithNav from "../../../components/LayoutWithNav";
import { menuKasirToko, userOptions } from "../../../data/menu";
import Button from "../../../components/Button";
import Table from "../../../components/Table";
import ActionMenu from "../../../components/ActionMenu";
import { useNavigate } from "react-router-dom";
import Spinner from "../../../components/Spinner";
import api from "../../../utils/api";
import moment from "moment";
import Alert from "../../../components/Alert";
import AlertSuccess from "../../../components/AlertSuccess";
import AlertError from "../../../components/AlertError";

export default function PenjualanKasir() {
    const [isDateModalOpen, setIsDateModalOpen] = useState(false);
    const [selectedMonth, setSelectedMonth] = useState(moment().format('MM'));
    const [selectedYear, setSelectedYear] = useState(moment().format('YYYY'));
    const userData = JSON.parse(localStorage.getItem('userData'));
    const isAdminGudang = userData?.role === 'admingudang';
    const cabang_id = userData.userId
    const toko_id = userData.tokoId
    const [isLoading,setLoading] = useState(false)
    const [data, setData] = useState([]);
    const [isModalDel, setModalDel] = useState(false)
    const [selectedItem, setSelectedItem] = useState(null);
    const [isSuccess, setSuccess] = useState(false)
    const [errorAlert, setErrorAlert] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const monthValue = `${selectedYear}-${selectedMonth}`;

    const handleMonthChange = (e) => {
        const value = e.target.value; 
        const [year, month] = value.split('-');
        setSelectedMonth(month);
        setSelectedYear(year);
    };
    const fetchData = async () => {
        if (isAdminGudang) return;
        
        try {
            setLoading(true);
            const formattedMonth = String(selectedMonth).padStart(2, '0');
            const response = await api.get(`/penjualan?bulan=${formattedMonth}&tahun=${selectedYear}&cabang=${cabang_id}`);
            
            if (response.data.success) {
                const formattedData = response.data.data.map(item => ({
                    Nomor: item.penjualan_id,
                    Tanggal: new Date(item.tanggal).toLocaleDateString('id-ID'),
                    "Nama Barang": item.produk.map(p => 
                        p.barang_handmade?.nama_barang || 
                        p.barang_non_handmade?.nama_barang || 
                        p.packaging?.nama_packaging ||
                        p.barang_custom?.nama_barang || 'Unknown'
                    ),
                    "Jumlah Barang": item.produk.reduce((acc, curr) => acc + curr.kuantitas, 0),
                    Diskon: item.diskon ? `${(item.diskon / item.sub_total * 100).toFixed(0)}%` : '0%',
                    Pajak: item.pajak ? `${(item.pajak / item.sub_total * 100).toFixed(0)}%` : '0%',
                    "Total Transaksi": `Rp${item.total_penjualan.toLocaleString('id-ID')}`,
                    tipe: item.rincian_biaya_custom.length > 0 ? 'custom' : 'non-custom'
                }));
                setData(formattedData);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };
    

    useEffect(() => {
        fetchData();
    }, [selectedMonth, selectedYear]);

    const handleCancelDel = () => {
        setModalDel(false)
    }

    const handleConfirmDel = async () => {
        try {
            if (!selectedItem?.id) {
                throw new Error('No item selected');
            }
            await api.delete(`/penjualan/${selectedItem.id}`);
            setSuccess(true);
            fetchData(); 
        } catch (error) {
            console.error('Error deleting data:', error);
            setErrorMessage('Gagal menghapus data penjualan');
            setErrorAlert(true);
        } finally {
            setModalDel(false);
            setSelectedItem(null); 
        }
    };

    const handleRowClick = (row) => {
        const baseRoute = isAdminGudang ? '/penjualan-admin-gudang' : '/penjualan-kasir';
        navigate(`${baseRoute}/detail`, {state: {nomor: row.Nomor, tipe: row.tipe}});
    }

    // Headers untuk tabel
    const headers = [
        { label: "Nomor", key: "Nomor", align: "text-left" },
        { label: "Tanggal", key: "Tanggal", align: "text-left" },
        { label: "Nama Barang", key: "Nama Barang", align: "text-left" },
        { label: "Jumlah Barang", key: "Jumlah Barang", align: "text-left" },
        { label: "Diskon", key: "Diskon", align: "text-left" },
        { label: "Potongan Harga", key: "Pajak", align: "text-left" },
        { label: "Total Transaksi", key: "Total Transaksi", align: "text-left" },
        // { label: "Aksi", key: "aksi", align: "text-right" },
    ];

    // Format nama barang
    const formatNamaBarang = (items) => {
        if (items.length <= 2) {
            return items.join(", ");
        }
        return `${items[0]}, ${items[1]}, +${items.length - 2} Lainnya`;
    };

    const handleEdit = (row) => {
        const baseRoute = isAdminGudang ? '/penjualan-admin-gudang' : '/penjualan-kasir';
        if (row.tipe === 'custom') {
            navigate(`${baseRoute}/edit/custom/${row.Nomor}`);
        } else {
            navigate(`${baseRoute}/edit/non-custom/${row.Nomor}`);
        }
    };

    const handleDelete = () => {
        setModalDel(true)
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
                                // aksi: <ActionMenu 
                                //     onEdit={() => handleEdit(item)} 
                                //     onDelete={() => {
                                //         setSelectedItem({
                                //             id: item.Nomor
                                //         });
                                //         handleDelete();
                                //     }} 
                                // />
                            }))}
                            hasSearch={true}
                            hasPagination={true}
                            onRowClick={handleRowClick}
                        />
                    </div>
                </section>
            </div>

            {isLoading && <Spinner/>}

            {isModalDel && (
                <Alert
                title="Hapus Data"
                description="Apakah kamu yakin ingin menghapus data ini?"
                confirmLabel="Hapus"
                cancelLabel="Kembali"
                onConfirm={handleConfirmDel}
                onCancel={handleCancelDel}
                open={isModalDel}
                onClose={() => setModalDel(false)}
                />
            )}

            {isSuccess && (
                <AlertSuccess
                title="Berhasil!!"
                description="Data berhasil dihapus"
                confirmLabel="Ok"
                />
            )}
                {errorMessage && (
                    <AlertError
                        title={'Failed'}
                        description={errorMessage}
                        onConfirm={() => setErrorMessage(null)}
                    />
                )}
        </LayoutWithNav>
    );
}