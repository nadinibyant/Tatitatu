import { useEffect, useState } from "react";
import Button from "../../../components/Button";
import ButtonDropdown from "../../../components/ButtonDropdown";
import Navbar from "../../../components/Navbar";
import { menuItems, userOptions } from "../../../data/menu";
import moment from "moment";
import Table from "../../../components/Table";
import { useNavigate } from "react-router-dom";
import ActionMenu from "../../../components/ActionMenu";
import api from "../../../utils/api";
import Spinner from "../../../components/Spinner";
import LayoutWithNav from "../../../components/LayoutWithNav";
import Alert from "../../../components/Alert";
import AlertSuccess from "../../../components/AlertSuccess";

export default function Penjualan() {
    const [selectedStore, setSelectedStore] = useState("Semua");
    const [selectedMonth, setSelectedMonth] = useState(moment().format('MM'));
    const [selectedYear, setSelectedYear] = useState(moment().format('YYYY'));

    const monthValue = `${selectedYear}-${selectedMonth}`;

    const handleMonthChange = (e) => {
      const value = e.target.value; 
      const [year, month] = value.split('-');
      setSelectedMonth(month);
      setSelectedYear(year);
    };

    const [data,setData] = useState([])
    const [dataCabang, setDataCabang] = useState([]);
    const [isLoading, setLoading] = useState(false)
    const [isModalDel, setModalDel] = useState(false);
    const [isModalSucc, setModalSucc] = useState(false);
    const [selectedRow, setSelectedRow] = useState(null);
    const userData = JSON.parse(localStorage.getItem('userData'))
    const toko_id = userData.userId

    useEffect(() => {
    const fetchCabang = async () => {
        try {
            setLoading(true)
            const response = await api.get(`/cabang?toko_id=${toko_id}`);
            if (response.data.success) {
                const cabangList = response.data.data.map(cabang => ({
                    label: cabang.nama_cabang,
                    value: cabang.cabang_id,
                    icon: '/icon/toko.svg'
                }));
                
                setDataCabang([
                    { label: 'Semua', value: 'Semua', icon: '/icon/toko.svg' },
                    ...cabangList
                ]);
            }
        } catch (error) {
            console.error('Error fetching cabang:', error);
        } finally {
            setLoading(false)
        }
    };

    fetchCabang();
}, []);

useEffect(() => {
    const fetchPenjualan = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/penjualan?toko_id=${toko_id}&bulan=${selectedMonth}&tahun=${selectedYear}`);
            const penjualanList = response.data.data;

            const detailedData = penjualanList.map(penjualan => {
                // Get names of all products
                const namaBarang = penjualan.produk
                    .map(produk => {
                        if (produk.barang_handmade) return produk.barang_handmade.nama_barang;
                        if (produk.barang_non_handmade) return produk.barang_non_handmade.nama_barang;
                        if (produk.barang_custom) return produk.barang_custom.nama_barang;
                        if (produk.packaging) return produk.packaging.nama_packaging;
                        return null;
                    })
                    .filter(Boolean)
                    .join(', ');

                // Calculate total quantity
                const jumlahBarang = penjualan.produk.reduce(
                    (sum, produk) => sum + produk.kuantitas,
                    0
                );

                // Check if any product is custom
                const hasCustom = penjualan.produk.some(
                    produk => produk.barang_custom
                );

                return {
                    Nomor: penjualan.penjualan_id,
                    Tanggal: penjualan.tanggal.split('T')[0],
                    Cabang: penjualan.cabang.nama_cabang,
                    "Nama Barang": namaBarang,
                    "Jumlah Barang": jumlahBarang.toLocaleString('id-ID'),
                    Diskon: penjualan.diskon,
                    Pajak: penjualan.pajak.toLocaleString('id-ID'),
                    "Total Transaksi": penjualan.total_penjualan,
                    tipe: hasCustom ? 'custom' : 'non-custom'
                };
            });

            setData(detailedData);
        } catch (error) {
            console.error('Error fetching penjualan:', error);
        } finally {
            setLoading(false);
        }
    };

    fetchPenjualan();
}, [selectedMonth, selectedYear, toko_id]);

// console.log(data)


    // const data = [
    //     {
    //         Nomor: 'STK123',
    //         Tanggal: '2024-12-12',
    //         Cabang: 'Gor Agus',
    //         "Nama Barang": "Gelang Barbie, Gelang Bulan, Gelang Baru, Gelang Bagus, Gelang Aja",
    //         "Jumlah Barang": 2,
    //         Diskon: 11,
    //         Pajak: 11,
    //         "Total Transaksi": 200000,
    //         tipe: 'custom'
    //     },
    //     {
    //         Nomor: 'STK124',
    //         Tanggal: '2024-12-13',
    //         Cabang: 'Lubeg',
    //         "Nama Barang": "Gelang Barbie, Gelang Bulan, Gelang Baru",
    //         "Jumlah Barang": 3,
    //         Diskon: 5,
    //         Pajak: 5,
    //         "Total Transaksi": 150000,
    //         tipe: 'non-custom'
    //     }
    // ];

    useEffect(() => {
        setSelectedStore("Semua");
    }, []);

    const headers = [
        { label: "Nomor", key: "Nomor", align: "text-left" },
        { label: "Tanggal", key: "Tanggal", align: "text-left" },
        { label: "Nama Barang", key: "Nama Barang", align: "text-left" },
        { label: "Jumlah Barang", key: "Jumlah Barang", align: "text-left" },
        { label: "Diskon", key: "Diskon", align: "text-left" },
        { label: "Pajak", key: "Pajak", align: "text-left" },
        { label: "Total Transaksi", key: "Total Transaksi", align: "text-left" },
        { label: "Aksi", key: "action", align: "text-left" },
    ];

    const formatNamaBarang = (namaBarang) => {
        const items = namaBarang.split(',');
        if (items.length > 2) {
            return (
                <>
                    {items.slice(0, 2).join(', ')}{" "}
                    <span className="text-gray-500">+ {items.length - 2} lainnya</span>
                </>
            );
        }
        return items.join(', ');
    };

    const formatRupiah = (amount) => {
        return `Rp ${amount.toLocaleString('id-ID')}`;
    };

    const selectedData = data.filter((item) => {
        const isStoreMatch = selectedStore === 'Semua' || item.Cabang === selectedStore;
        return isStoreMatch;
    });
    const navigate = useNavigate()
    const handleRowClick = (row) => {
        navigate('/penjualanToko/detail', {state: {nomor: row.Nomor, tipe: row.tipe}})
    }

    const handleEdit = (row) => {
        if (row.tipe === 'custom') {
            navigate(`/penjualanToko/edit/custom/${row.Nomor}`);
        } else {
            navigate(`/penjualanToko/edit/non-custom/${row.Nomor}`);
        }
    };

    const handleDelete = async (row) => {
        try {
            setLoading(true);
            const response = await api.delete(`/penjualan/${row.Nomor}`);
            if (response.data.success) {
                setModalSucc(true);
                // Refresh data after deletion
                const updatedData = data.filter(item => item.Nomor !== row.Nomor);
                setData(updatedData);
            }
        } catch (error) {
            console.error('Error deleting:', error);
        } finally {
            setLoading(false);
            setModalDel(false);
        }
    };

    const handleConfirmDel = () => {
        handleDelete(selectedRow);
    };

    return (
        <>
            <LayoutWithNav>
                <div className="p-5">
                    <section className="flex flex-wrap md:flex-nowrap items-center justify-between space-y-2 md:space-y-0">
                        <div className="left w-full md:w-auto">
                            <p className="text-primary text-base font-bold">Daftar Penjualan Toko</p>
                        </div>

                        <div className="right flex flex-wrap md:flex-nowrap items-center space-x-0 md:space-x-4 w-full md:w-auto space-y-2 md:space-y-0">
                            <div className="w-full md:w-auto">
                                <Button label="Export" icon={<svg width="17" height="20" viewBox="0 0 17 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M1.44845 20L0.0742188 18.6012L2.96992 15.7055H0.761335V13.7423H6.30735V19.2883H4.34416V17.1043L1.44845 20ZM8.27054 19.6319V11.7791H0.417777V0H10.2337L16.1233 5.88957V19.6319H8.27054ZM9.25213 6.87117H14.1601L9.25213 1.96319V6.87117Z" fill="#7B0C42" />
                                </svg>} bgColor="border border-secondary" hoverColor="hover:bg-white" textColor="text-black" />
                            </div>
                            <div className="w-full md:w-auto">
                                <ButtonDropdown selectedIcon={'/icon/toko.svg'} options={dataCabang} onSelect={(value) => setSelectedStore(value)} />
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
                        <div className="p-5">
                        <Table
                            headers={headers}
                            data={selectedData.map((item, index) => ({
                                ...item,
                                "Nama Barang": formatNamaBarang(item["Nama Barang"]),
                                "Total Transaksi": formatRupiah(item["Total Transaksi"]),
                                "Diskon": `${item["Diskon"]}%`,
                                Pajak: `${item.Pajak}`,
                                action: <ActionMenu 
                                    onEdit={() => handleEdit(item)} 
                                    onDelete={() => {
                                        setSelectedRow(item);
                                        setModalDel(true);
                                    }} 
                                />
                            }))}
                            onRowClick={handleRowClick}
                        />
                        </div>
                    </section>
                {isLoading && (<Spinner/>)}


                {isModalDel && (
                    <Alert
                        title="Hapus Data"
                        description="Apakah kamu yakin ingin menghapus data ini?"
                        confirmLabel="Hapus"
                        cancelLabel="Kembali"
                        onConfirm={handleConfirmDel}
                        onCancel={() => setModalDel(false)}
                        open={isModalDel}
                        onClose={() => setModalDel(false)}
                    />
                )}

                {isModalSucc && (
                    <AlertSuccess
                        title="Berhasil!!"
                        description="Data berhasil dihapus"
                        confirmLabel="Ok"
                        onConfirm={() => setModalSucc(false)}
                    />
                )}
                </div>

            </LayoutWithNav>
        </>
    );
}
