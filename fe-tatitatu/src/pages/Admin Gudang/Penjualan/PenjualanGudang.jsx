import { useEffect, useState } from "react";
import Button from "../../../components/Button";
import LayoutWithNav from "../../../components/LayoutWithNav";
import { menuItems, userOptions } from "../../../data/menu";
import moment from "moment";
import Table from "../../../components/Table";
import { useNavigate } from "react-router-dom";
import ActionMenu from "../../../components/ActionMenu";
import api from "../../../utils/api";
import Alert from "../../../components/Alert";
import AlertSuccess from "../../../components/AlertSuccess";

export default function PenjualanGudang() {
    const [selectedMonth, setSelectedMonth] = useState(moment().format('MM'));
    const [selectedYear, setSelectedYear] = useState(moment().format('YYYY'));
    const [penjualanData, setPenjualanData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalDel, setModalDel] = useState(false);
    const [isModalSucc, setModalSucc] = useState(false);
    const [selectedId, setSelectedId] = useState(null);

    const monthValue = `${selectedYear}-${selectedMonth}`;

    const handleMonthChange = (e) => {
        const value = e.target.value;
        const [year, month] = value.split('-');
        setSelectedMonth(month);
        setSelectedYear(year);
    };

    // useEffect(() => {
    //     const fetchPenjualan = async () => {
    //         setLoading(true);
    //         try {
    //             const response = await api.get('/penjualan-gudang');
    //             if (response.data.success) {
    //                 setPenjualanData(response.data.data);
    //             }
    //         } catch (error) {
    //             console.error('Error fetching data:', error);
    //         } finally {
    //             setLoading(false);
    //         }
    //     };

    //     fetchPenjualan();
    // }, [selectedMonth, selectedYear]);

    const fetchPenjualan = async () => {
        setLoading(true);
        try {
            const response = await api.get('/penjualan-gudang');
            if (response.data.success) {
                setPenjualanData(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPenjualan();
    }, [selectedMonth, selectedYear]);

    const headers = [
        { label: "Nomor", key: "penjualan_id", align: "text-left" },
        { label: "Tanggal", key: "tanggal", align: "text-center" },
        { label: "Nama Barang", key: "nama_barang", align: "text-left" },
        { label: "Jumlah Barang", key: "jumlah_barang", align: "text-left" },
        { label: "Diskon", key: "diskon", align: "text-center" },
        { label: "Pajak", key: "pajak", align: "text-center" },
        { label: "Total Transaksi", key: "total_penjualan", align: "text-center" },
        { label: "Aksi", key: "action", align: "text-center" },
    ];

    const formatNamaBarang = (produk) => {
        const namaBarang = produk.map(item => item.nama_barang).filter(Boolean);
    
        if (namaBarang.length > 2) {
            return (
                <>
                    {namaBarang.slice(0, 2).join(', ')}{" "}
                    <span className="text-gray-500">+ {namaBarang.length - 2} lainnya</span>
                </>
            );
        }
        return namaBarang.join(', ');
    };

    const getTotalBarang = (produk) => {
        return produk.reduce((sum, item) => sum + item.kuantitas, 0);
    };

    const formatRupiah = (amount) => {
        return `Rp ${amount.toLocaleString('id-ID')}`;
    };

    const navigate = useNavigate();
    
    const handleRowClick = (row) => {
        navigate('/penjualan-admin-gudang/detail', {
            state: {
                nomor: row.penjualan_id,
                tipe: row.cash_or_non ? 'cash' : 'non-cash'
            }
        });
    };

    const handleEdit = (row) => {
        navigate(`/penjualan-admin-gudang/edit/${row.penjualan_id}`);
    };
    
    const handleDelete = (penjualan_id) => {
        setSelectedId(penjualan_id);
        setModalDel(true);
    };

    const handleBtnAdd = () => {
        navigate('/penjualan-admin-gudang/tambah');
    };

    const handleConfirmDel = async () => {
        try {
            await api.delete(`/penjualan-gudang/${selectedId}`);
            setModalDel(false);
            setModalSucc(true);
            fetchPenjualan(); 
        } catch (error) {
            console.error('Error deleting:', error);
        }
    };

    return (
        <LayoutWithNav menuItems={menuItems} userOptions={userOptions}>
            <div className="p-5">
                <section className="flex flex-wrap md:flex-nowrap items-center justify-between space-y-2 md:space-y-0">
                    <div className="left w-full md:w-auto">
                        <p className="text-primary text-base font-bold">Daftar Penjualan Toko</p>
                    </div>

                    <div className="right flex flex-wrap md:flex-nowrap items-center space-x-0 md:space-x-4 w-full md:w-auto space-y-2 md:space-y-0">
                        <div className="w-full md:w-auto">
                            <Button 
                                label="Export" 
                                icon={
                                    <svg width="17" height="20" viewBox="0 0 17 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M1.44845 20L0.0742188 18.6012L2.96992 15.7055H0.761335V13.7423H6.30735V19.2883H4.34416V17.1043L1.44845 20ZM8.27054 19.6319V11.7791H0.417777V0H10.2337L16.1233 5.88957V19.6319H8.27054ZM9.25213 6.87117H14.1601L9.25213 1.96319V6.87117Z" fill="#7B0C42" />
                                    </svg>
                                } 
                                bgColor="border border-secondary" 
                                hoverColor="hover:bg-white" 
                                textColor="text-black" 
                            />
                        </div>
                        <div className="w-full md:w-auto">
                            <input 
                                type="month"
                                value={monthValue}
                                onChange={handleMonthChange}
                                className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                                style={{ maxWidth: '200px' }}
                            />
                        </div>
                        <div className="w-full md:w-auto">
                            <Button 
                                label="Tambah" 
                                icon={
                                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M13 8H8V13C8 13.2652 7.89464 13.5196 7.70711 13.7071C7.51957 13.8946 7.26522 14 7 14C6.73478 14 6.48043 13.8946 6.29289 13.7071C6.10536 13.5196 6 13.2652 6 13V8H1C0.734784 8 0.48043 7.89464 0.292893 7.70711C0.105357 7.51957 0 7.26522 0 7C0 6.73478 0.105357 6.48043 0.292893 6.29289C0.48043 6.10536 0.734784 6 1 6H6V1C6 0.734784 6.10536 0.480429 6.29289 0.292893C6.48043 0.105357 6.73478 0 7 0C7.26522 0 7.51957 0.105357 7.70711 0.292893C7.89464 0.480429 8 0.734784 8 1V6H13C13.2652 6 13.5196 6.10536 13.7071 6.29289C13.8946 6.48043 14 6.73478 14 7C14 7.26522 13.8946 7.51957 13.7071 7.70711C13.5196 7.89464 13.2652 8 13 8Z" fill="white"/>
                                    </svg>
                                } 
                                bgColor="bg-primary" 
                                textColor="text-white" 
                                onClick={handleBtnAdd}
                            />
                        </div>
                    </div>
                </section>

                <section className="mt-5 bg-white rounded-xl">
                    <div className="p-5">
                        <Table
                            headers={headers}
                            data={penjualanData.map((item) => ({
                                penjualan_id: item.penjualan_id,
                                tanggal: moment(item.tanggal).format('YYYY-MM-DD'),
                                nama_barang: formatNamaBarang(item.produk),
                                jumlah_barang: item.produk.reduce((sum, prod) => sum + prod.kuantitas, 0).toLocaleString('id-ID'),
                                diskon: `${item.diskon}%`,
                                pajak: formatRupiah(item.pajak),
                                total_penjualan: formatRupiah(item.total_penjualan),
                                type: item.cash_or_non ? 'cash' : 'non-cash',
                                action: (
                                    <ActionMenu 
                                        onEdit={() => handleEdit(item)} 
                                        onDelete={() => handleDelete(item.penjualan_id)} 
                                    />
                                )
                            }))}
                            onRowClick={handleRowClick}
                        />
                    </div>
                </section>
            </div>
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

            {/* modal success */}
            {isModalSucc && (
                <AlertSuccess
                    title="Berhasil!!"
                    description="Data berhasil dihapus"
                    confirmLabel="Ok"
                    onConfirm={() => setModalSucc(false)}
                />
            )}
        </LayoutWithNav>
    );
}