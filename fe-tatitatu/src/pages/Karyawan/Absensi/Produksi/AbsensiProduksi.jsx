import { useState, useEffect } from "react";
import LayoutWithNav from "../../../../components/LayoutWithNav";
import Button from "../../../../components/Button";
import Table from "../../../../components/Table";
import { useNavigate } from "react-router-dom";
import api from "../../../../utils/api";
import Spinner from "../../../../components/Spinner";
import { X } from "lucide-react";

export default function AbsensiProduksi(){
    const [data, setData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedRow, setSelectedRow] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [detailData, setDetailData] = useState(null);
    const [isLoadingDetail, setIsLoadingDetail] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);
                const response = await api.get('/produksi-gudang/karyawan/1');
                
                // Transform data untuk table
                const transformedData = response.data.data.map((item, index) => {
                    // Format tanggal
                    const date = new Date(item.tanggal);
                    const formattedDate = date.toLocaleDateString('id-ID', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric'
                    });

                    return {
                        nomor: index + 1,
                        Tanggal: formattedDate,
                        Foto: <img 
                            src={`${import.meta.env.VITE_API_URL}/images-produksi-gudang/${item.image}`}
                            alt="Produksi" 
                            className="w-16 h-16 object-cover rounded"
                            onError={(e) => {
                                e.target.src = 'https://via.placeholder.com/150';
                            }}
                        />,
                        'Jumlah Produksi': item.jumlah_produksi.toLocaleString('id-ID'),
                        'Total Menit': `${item.total_menit.toLocaleString('id-ID')} Menit`,
                        Status: <StatusBadge status={item.status} />,
                        raw: item
                    };
                });

                setData(transformedData);
            } catch (err) {
                setError(err.message);
                console.error('Error fetching data:', err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleAdd = () => {
        navigate('/absensi-karyawan-produksi/tambah');
    };

    const handleRowClick = async (row) => {
        setSelectedRow(row);
        setIsModalOpen(true);
        setIsLoadingDetail(true);
        
        try {
            const produksiResponse = await api.get(`/produksi-gudang/${row.raw.produksi_gudang_id}`);
            const produksiData = produksiResponse.data.data;

            const detailsPromises = produksiData.produk.map(async (item) => {
                try {
                    const barangResponse = await api.get(`/barang-handmade-gudang/${item.barang.barang_handmade_id}`);
                    return {
                        ...item,
                        detailBarang: barangResponse.data.data
                    };
                } catch (error) {
                    console.error(`Error fetching detail for item ${item.barang.barang_handmade_id}:`, error);
                    return {
                        ...item,
                        detailBarang: null
                    };
                }
            });
    
            const produkWithDetails = await Promise.all(detailsPromises);

            setDetailData({
                ...produksiData,
                produk: produkWithDetails
            });
        } catch (err) {
            console.error('Error fetching detail:', err);
        } finally {
            setIsLoadingDetail(false);
        }
    };

    const StatusBadge = ({ status }) => {
        let statusColor = '';
        let displayStatus = '';

        switch(status.toLowerCase()) {
            case 'proses':
                statusColor = 'bg-yellow-50 text-yellow-600 border border-yellow-200';
                displayStatus = 'Proses';
                break;
            case 'diterima':
                statusColor = 'bg-green-50 text-green-600 border border-green-200';
                displayStatus = 'Diterima';
                break;
            case 'ditolak':
                statusColor = 'bg-red-50 text-red-500 border border-red-200';
                displayStatus = 'Ditolak';
                break;
            default:
                statusColor = 'bg-gray-50 text-gray-600 border border-gray-200';
                displayStatus = status;
        }

        return (
            <span className={`px-4 py-1 rounded-md text-sm font-medium inline-block min-w-[100px] text-center ${statusColor}`}>
                {displayStatus}
            </span>
        );
    };

    const headers = [
        { label: "No", key: "nomor", align: "text-left" },
        { label: "Tanggal", key: "Tanggal", align: "text-left" },
        { label: "Foto", key: "Foto", align: "text-left" },
        { label: "Jumlah Produksi", key: "Jumlah Produksi", align: "text-left" },
        { label: "Total Menit", key: "Total Menit", align: "text-left" },
        { label: "Status", key: "Status", align: "text-left" }
    ];

    if (isLoading) {
        return (
            <LayoutWithNav>
                <div className="flex justify-center items-center h-screen">
                    <Spinner />
                </div>
            </LayoutWithNav>
        );
    }

    if (error) {
        return (
            <LayoutWithNav>
                <div className="p-5">
                    <div className="text-red-500">Error: {error}</div>
                </div>
            </LayoutWithNav>
        );
    }

    return(
        <LayoutWithNav>
            <div className="p-5">
                <section className="flex flex-wrap md:flex-nowrap items-center justify-between space-y-2 md:space-y-0">
                    {/* Left Section */}
                    <div className="left w-full md:w-auto">
                        <p className="text-primary text-base font-bold">Data Absensi</p>
                    </div>

                    {/* Right Section */}
                    <div className="right flex flex-wrap md:flex-nowrap items-center space-x-0 md:space-x-4 w-full md:w-auto space-y-2 md:space-y-0">
                        <div className="w-full md:w-auto">
                            <Button
                                label="Tambah"
                                icon={
                                    <svg width="16" height="16" viewBox="0 0 13 13" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M13 8H8V13C8 13.2652 7.89464 13.5196 7.70711 13.7071C7.51957 13.8946 7.26522 14 7 14C6.73478 14 6.48043 13.8946 6.29289 13.7071C6.10536 13.5196 6 13.2652 6 13V8H1C0.734784 8 0.48043 7.89464 0.292893 7.70711C0.105357 7.51957 0 7.26522 0 7C0 6.73478 0.105357 6.48043 0.292893 6.29289C0.48043 6.10536 0.734784 6 1 6H6V1C6 0.734784 6.10536 0.480429 6.29289 0.292893C6.48043 0.105357 6.73478 0 7 0C7.26522 0 7.51957 0.105357 7.70711 0.292893C7.89464 0.480429 8 0.734784 8 1V6H13C13.2652 6 13.5196 6.10536 13.7071 6.29289C13.8946 6.48043 14 6.73478 14 7C14 7.26522 13.8946 7.51957 13.7071 7.70711C13.5196 7.89464 13.2652 8 13 8Z" fill="white"/>
                                    </svg>
                                }
                                bgColor="bg-primary"
                                hoverColor="hover:bg-opacity-90 hover:border hover:border-primary hover:text-white"
                                textColor="text-white"
                                onClick={handleAdd}
                            />
                        </div>
                    </div>
                </section>

                <section className="mt-5 bg-white rounded-xl">
                    <div className="p-5">
                        <Table 
                            data={data}
                            headers={headers}
                            hasSearch={true}
                            hasPagination={true}
                            onRowClick={handleRowClick}
                        />
                    </div>
                </section>

                {/* Detail Modal */}
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 overflow-y-auto">
                        {/* Overlay */}
                        <div 
                            className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" 
                            onClick={() => setIsModalOpen(false)}
                        ></div>
                        
                        {/* Modal */}
                        <div className="relative min-h-screen flex items-center justify-center p-4">
                            <div className="relative bg-white rounded-lg w-full max-w-2xl">
                                {/* Header with close button */}
                                <div className="flex justify-between items-start p-4">
                                    <h3 className="text-base font-medium">Detail</h3>
                                    <button 
                                        onClick={() => setIsModalOpen(false)} 
                                        className="text-gray-400"
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                                
                                {/* Content */}
                                <div className="px-4 pb-4">
                                    {isLoadingDetail ? (
                                        <div className="flex justify-center items-center p-4">
                                            <Spinner />
                                        </div>
                                    ) : (
                                        <>
                                            <div className="flex items-start gap-8 mb-4">
                                                <div>
                                                    <p className="text-gray-500 text-sm mb-1">Tanggal</p>
                                                    <p className="text-sm">{selectedRow?.Tanggal || '-'}</p>
                                                </div>
                                                <div>
                                                    <p className="text-gray-500 text-sm mb-1">Status</p>
                                                    <div>{selectedRow?.Status}</div>
                                                </div>
                                            </div>

                                            <Table 
                                                data={detailData?.produk?.map((item, index) => {
                                                    const waktuPengerjaan = item?.detailBarang?.waktu_pengerjaan || 0;
                                                    const totalMenit = item.jumlah * waktuPengerjaan;

                                                    return {
                                                        nomor: index + 1,
                                                        nama_barang: item.barang.nama_barang,
                                                        jumlah: item.jumlah.toLocaleString('id-ID'),
                                                        total_menit: `${totalMenit.toLocaleString('id-ID')} Menit`
                                                    };
                                                }) || []}
                                                headers={[
                                                    { label: "No", key: "nomor", align: "text-left" },
                                                    { label: "Nama Barang", key: "nama_barang", align: "text-left" },
                                                    { label: "Jumlah", key: "jumlah", align: "text-left" },
                                                    { label: "Total Menit", key: "total_menit", align: "text-left" }
                                                ]}
                                            />
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </LayoutWithNav>
    );
}