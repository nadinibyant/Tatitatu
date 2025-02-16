import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "../../../components/Navbar";
import { menuItems, userOptions } from "../../../data/menu";
import Breadcrumbs from "../../../components/Breadcrumbs";
import Button from "../../../components/Button";
import Table from "../../../components/Table";
import Alert from "../../../components/Alert";
import AlertSuccess from "../../../components/AlertSuccess";
import LayoutWithNav from "../../../components/LayoutWithNav";
import Spinner from "../../../components/Spinner";
import api from "../../../utils/api";
import AlertError from "../../../components/AlertError";

export default function DetailPemasukanJual() {
    const location = useLocation()
    const { nomor, tipe } = location.state || {};
    const isCustom = tipe === 'custom';
    const [errorMessage, setErrorMessage] = useState("");
    const [isModalDel, setModalDel] = useState(false)
    const [isModalSucc, setModalSucc] = useState(false)
    const userData = JSON.parse(localStorage.getItem('userData'));
    const isAdminGudang = userData?.role === 'admingudang';
    const [isLoading, setIsLoading] = useState(false)
    const [data, setData] = useState({
        nomor: '',
        tanggal: '',
        nama_pembeli: '',
        bayar: '',
        metode: '',
        catatan: '',
        data_produk: [], 
        rincian_biaya: [], 
        data_packaging: [], 
        sub_total: 0,
        diskon: 0,
        pajak: 0,
        total_penjualan: 0
    });

    const breadcrumbItems = isAdminGudang 
    ? [
        { label: "Daftar Penjualan Toko", href: "/penjualan-admin-gudang" },
        { label: "Detail Penjualan", href: "" },
    ]
    : [
        { label: "Daftar Penjualan Toko", href: "/penjualan-kasir" },
        { label: "Detail Penjualan", href: "" },
    ];

    const getImageUrl = (item) => {
        if (item.barang_handmade) {
            return `${import.meta.env.VITE_API_URL}/images-barang-handmade/${item.barang_handmade.image}`;
        }
        if (item.barang_non_handmade) {
            return `${import.meta.env.VITE_API_URL}/images-barang-non-handmade/${item.barang_non_handmade.image}`;
        }
        if (item.packaging) {
            return `${import.meta.env.VITE_API_URL}/images-packaging/${item.packaging.image}`;
        }
        if (item.barang_custom) {
            return `${import.meta.env.VITE_API_URL}/images-barang-custom/${item.barang_custom.image}`;
        }
        return "https://via.placeholder.com/150";
    };

    
    const fetchData = async () => {
        try {
            setIsLoading(true);
            const response = await api.get(`/penjualan/${nomor}`);
            if (response.data.success) {
                const salesData = response.data.data;
                
                let productData;
                if (isCustom) {
                    // custom
                    productData = salesData.produk
                        .filter(item => item.barang_custom)
                        .map(item => ({
                            "Foto Produk": item.barang_custom?.image || "placeholder.jpg",
                            "Nama Produk": item.barang_custom?.nama_barang || 'Unknown',
                            "Jenis Barang": item.barang_custom?.jenis_barang?.nama_jenis_barang || 'Custom',
                            "Harga Satuan": item.harga_satuan || 0,
                            "kuantitas": item.kuantitas || 0,
                            "Total Biaya": item.total_biaya || 0,
                            imageUrl: `${import.meta.env.VITE_API_URL}/images-barang-custom/${item.barang_custom?.image}`
                        }));
                } else {
                    //hand dan non
                    productData = salesData.produk
                        .filter(item => item.barang_handmade || item.barang_non_handmade)
                        .map(item => {
                            const barang = item.barang_handmade || item.barang_non_handmade;
                            const imagePrefix = item.barang_handmade ? 
                                'images-barang-handmade' : 'images-barang-non-handmade';
                                
                            return {
                                "Foto Produk": barang?.image || "placeholder.jpg",
                                "Nama Produk": barang?.nama_barang || 'Unknown',
                                "Jenis Barang": barang?.jenis_barang?.nama_jenis_barang || 
                                              barang?.jenis?.nama_jenis_barang || 'Unknown',
                                "Harga Satuan": item.harga_satuan || 0,
                                "kuantitas": item.kuantitas || 0,
                                "Total Biaya": item.total_biaya || 0,
                                imageUrl: `${import.meta.env.VITE_API_URL}/${imagePrefix}/${barang?.image}`
                            };
                        });
                }
    
                // Filter packaging
                const packagingData = salesData.produk
                    .filter(item => item.packaging)
                    .map(item => ({
                        "Foto Produk": item.packaging?.image || "placeholder.jpg",
                        "Nama Packaging": item.packaging?.nama_packaging || 'Unknown',
                        "Harga Satuan": item.harga_satuan || 0,
                        "kuantitas": item.kuantitas || 0,
                        "Total Biaya": item.total_biaya || 0,
                        imageUrl: `${import.meta.env.VITE_API_URL}/images-packaging/${item.packaging?.image}`
                    }));
                
                setData({
                    nomor: salesData.penjualan_id,
                    tanggal: salesData.tanggal,
                    nama_pembeli: salesData.nama_pembeli,
                    bayar: salesData.cash_or_non ? 'Cash' : 'Non-Cash',
                    metode: salesData.metode_pembayaran?.nama_metode || '-',
                    catatan: salesData.catatan || '',
                    data_produk: productData,
                    rincian_biaya_custom: salesData.rincian_biaya_custom || [],
                    data_packaging: packagingData,
                    sub_total: salesData.sub_total || 0,
                    diskon: salesData.diskon || 0,
                    pajak: salesData.pajak || 0,
                    total_penjualan: salesData.total_penjualan || 0
                });
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [nomor]);

    // const data = {
    //     nomor: 'INV123',
    //     tanggal: '2024-12-12',
    //     nama_pembeli: 'Suryani',
    //     bayar: 'Cash',
    //     metode: '-',
    //     catatan: 'Catatan penting mengenai transaksi ini',  
    //     data_produk: [
    //         {
    //             "Foto Produk": "https://via.placeholder.com/150",
    //             "Nama Produk": "Gelang Cantik",
    //             "Jenis Barang": "Barang Handmade",
    //             "Harga Satuan": 15000,
    //             kuantitas: 10,
    //             "Total Biaya": 150000
    //         },
    //         {
    //             "Foto Produk": "https://via.placeholder.com/150",
    //             "Nama Produk": "Gelang Cantik",
    //             "Jenis Barang": "Barang Handmade",
    //             "Harga Satuan": 15000,
    //             kuantitas: 10,
    //             "Total Biaya": 150000
    //         },
    //     ],
    //     rincian_biaya: [
    //         {
    //             "Nama Biaya": "Jasa",
    //             "Jumlah Biaya": 1000
    //         }
    //     ],
    //     data_packaging: [
    //         {
    //             "Foto Produk": "https://via.placeholder.com/150",
    //             "Nama Packaging": "zipper",
    //             "Harga Satuan": 1000,
    //             kuantitas: 10,
    //             "Total Biaya": 10000
    //         }
    //     ],
    //     sub_total: 8000,
    //     diskon: 30,
    //     pajak: 1000,
    //     total_penjualan: 18000
    // }

    const headers = [
        { label: "No", key: "No", align: "text-left" },
        { label: "Foto Produk", key: "Foto Produk", align: "text-left" },
        { label: "Nama Produk", key: "Nama Produk", align: "text-left" },
        { label: "Jenis Barang", key: "Jenis Barang", align: "text-left" },
        { label: "Harga Satuan", key: "Harga Satuan", align: "text-left"},
        { label: "Kuantitas", key: "kuantitas", align: "text-left"},
        { label: "Total Biaya", key: "Total Biaya", align: "text-left"},
    ];

    const headersRincianBiaya = [
        { label: "No", key: "No", align: "text-left" },
        { label: "Nama Biaya", key: "Nama Biaya", align: "text-left" },
        { label: "Jumlah Biaya", key: "Jumlah Biaya", align: "text-left" },
    ];

    const formatRupiah = (amount) => {
        return `Rp ${typeof amount === 'number' ? amount.toLocaleString('id-ID') : '0'}`;
    };

    const headers2 = [
        { label: "No", key: "No", align: "text-left" },
        ...(isCustom ? [
            { label: "Foto Produk", key: "Foto Produk", align: "text-left" },
            { label: "Nama Packaging", key: "Nama Packaging", align: "text-left" },
            { label: "Harga Satuan", key: "Harga Satuan", align: "text-left" },
            { label: "Kuantitas", key: "kuantitas", align: "text-left" },
            { label: "Total Biaya", key: "Total Biaya", align: "text-left"}
        ] : [
            { label: "Foto Produk", key: "Foto Produk", align: "text-left" },
            { label: "Nama Packaging", key: "Nama Packaging", align: "text-left" },
            { label: "Kuantitas", key: "kuantitas", align: "text-left" }
        ])
    ];

    const formatCurrency = (amount) => {
        return typeof amount === 'number' 
            ? amount.toLocaleString('id-ID', {
                style: 'currency',
                currency: 'IDR',
            })
            : 'Rp 0';
    };

    const navigate = useNavigate()
    const handleEdit = () => {
        if (isCustom) {
            navigate(`/penjualanToko/edit/custom/${data.nomor}`);
        } else {
            navigate(`/penjualanToko/edit/non-custom/${data.nomor}`);
        }
    };

    const handleDelete = () => {
        setModalDel(true)
    };

    const handleCancelDel = () => {
        setModalDel(false);
    };

    const handleConfirmDel = async () => {
        try {
            const response = await api.delete(`/penjualan/${data.nomor}`);
            if (response.data.success) {
                setModalSucc(true);
                setTimeout(() => {
                    const baseRoute = isAdminGudang ? '/penjualan-admin-gudang' : '/penjualanToko';
                    navigate(baseRoute);
                }, 2000);
            }
        } catch (error) {
            console.error('Error deleting data:', error);
            setErrorMessage(error.response?.data?.message || "Gagal menghapus data");
        } finally {
            setModalDel(false);
        }
    };

    return (
        <>
        <LayoutWithNav menuItems={menuItems} userOptions={userOptions}>
            <div className="p-5">
                <Breadcrumbs items={breadcrumbItems} />

                <section className="p-5 bg-white mt-5 rounded-xl">
                    <div className="border-b py-2 flex justify-between items-center">
                        <p className="font-bold text-lg">{data.nomor}</p>
                        <div className="flex gap-2">
                            <Button
                                label={'Edit'}
                                icon={
                                    <svg width="17" height="18" viewBox="0 0 17 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path fill-rule="evenodd" clip-rule="evenodd" d="M8.32 3.17554H2C0.895 3.17554 0 4.12454 0 5.29354V15.8815C0 17.0515 0.895 17.9995 2 17.9995H13C14.105 17.9995 15 17.0515 15 15.8815V8.13154L11.086 12.2755C10.7442 12.641 10.2991 12.8936 9.81 12.9995L7.129 13.5675C5.379 13.9375 3.837 12.3045 4.187 10.4525L4.723 7.61354C4.82 7.10154 5.058 6.63054 5.407 6.26154L8.32 3.17554Z" fill="#DA5903"/>
                                    <path fill-rule="evenodd" clip-rule="evenodd" d="M16.8457 1.31753C16.7446 1.06156 16.5964 0.826833 16.4087 0.62553C16.2242 0.428659 16.0017 0.271165 15.7547 0.16253C15.5114 0.0556667 15.2485 0.000488281 14.9827 0.000488281C14.7169 0.000488281 14.454 0.0556667 14.2107 0.16253C13.9637 0.271165 13.7412 0.428659 13.5567 0.62553L13.0107 1.20353L15.8627 4.22353L16.4087 3.64453C16.5983 3.44476 16.7468 3.20962 16.8457 2.95253C17.0517 2.427 17.0517 1.84306 16.8457 1.31753ZM14.4497 5.72053L11.5967 2.69953L6.8197 7.75953C6.74922 7.83462 6.70169 7.92831 6.6827 8.02953L6.1467 10.8695C6.0767 11.2395 6.3857 11.5655 6.7347 11.4915L9.4167 10.9245C9.51429 10.9028 9.60311 10.8523 9.6717 10.7795L14.4497 5.72053Z" fill="#DA5903"/>
                                    </svg>
                                }
                                bgColor="border border-oren"
                                hoverColor="hover:bg-orange-50"
                                textColor="text-oren"
                                onClick={handleEdit}
                            />
                            <Button
                                label={'Hapus'}
                                icon={
                                    <svg width="16" height="18" viewBox="0 0 16 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M10.9918 1.35785L11.2623 3.23077H14.9232C15.1068 3.23077 15.2829 3.30371 15.4128 3.43354C15.5426 3.56337 15.6155 3.73947 15.6155 3.92308C15.6155 4.10669 15.5426 4.28278 15.4128 4.41261C15.2829 4.54245 15.1068 4.61538 14.9232 4.61538H14.2134L13.4075 14.0169C13.3586 14.5892 13.3189 15.06 13.2552 15.4403C13.1906 15.8363 13.0918 16.1908 12.8989 16.5194C12.596 17.0355 12.1456 17.4492 11.6057 17.7074C11.2623 17.8708 10.9005 17.9382 10.4998 17.9695C10.1149 18 9.64323 18 9.06907 18H6.93123C6.35707 18 5.88538 18 5.50046 17.9695C5.09984 17.9382 4.738 17.8708 4.39461 17.7074C3.85469 17.4492 3.40431 17.0355 3.10138 16.5194C2.90753 16.1908 2.81061 15.8363 2.74507 15.4403C2.68138 15.0591 2.64169 14.5892 2.59277 14.0169L1.78692 4.61538H1.07707C0.893462 4.61538 0.717371 4.54245 0.587538 4.41261C0.457705 4.28278 0.384766 4.10669 0.384766 3.92308C0.384766 3.73947 0.457705 3.56337 0.587538 3.43354C0.717371 3.30371 0.893462 3.23077 1.07707 3.23077H4.738L5.00846 1.35785L5.01861 1.30154C5.18661 0.572308 5.81246 0 6.59707 0H9.40323C10.1878 0 10.8137 0.572308 10.9817 1.30154L10.9918 1.35785ZM6.13646 3.23077H9.86292L9.62661 1.59138C9.5823 1.43723 9.46969 1.38462 9.4023 1.38462H6.598C6.53061 1.38462 6.418 1.43723 6.37369 1.59138L6.13646 3.23077ZM7.30784 7.61538C7.30784 7.43177 7.2349 7.25568 7.10507 7.12585C6.97524 6.99602 6.79915 6.92308 6.61553 6.92308C6.43192 6.92308 6.25583 6.99602 6.126 7.12585C5.99617 7.25568 5.92323 7.43177 5.92323 7.61538V12.2308C5.92323 12.4144 5.99617 12.5905 6.126 12.7203C6.25583 12.8501 6.43192 12.9231 6.61553 12.9231C6.79915 12.9231 6.97524 12.8501 7.10507 12.7203C7.2349 12.5905 7.30784 12.4144 7.30784 12.2308V7.61538ZM10.0771 7.61538C10.0771 7.43177 10.0041 7.25568 9.8743 7.12585C9.74447 6.99602 9.56838 6.92308 9.38477 6.92308C9.20115 6.92308 9.02506 6.99602 8.89523 7.12585C8.7654 7.25568 8.69246 7.43177 8.69246 7.61538V12.2308C8.69246 12.4144 8.7654 12.5905 8.89523 12.7203C9.02506 12.8501 9.20115 12.9231 9.38477 12.9231C9.56838 12.9231 9.74447 12.8501 9.8743 12.7203C10.0041 12.5905 10.0771 12.4144 10.0771 12.2308V7.61538Z" fill="white"/>
                                    </svg>
                                }
                                bgColor="bg-merah"
                                textColor="text-white"
                                onClick={handleDelete}
                            />
                        </div>
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
                        <p className="font-bold">
                            {isCustom ? "Rincian Jumlah dan Bahan" : "List Produk"}
                        </p>
                        <div className="pt-5">
                            <Table
                                headers={headers}
                                data={(data.data_produk || []).map((item, index) => ({
                                    ...item,
                                    "Foto Produk": <img src={item.imageUrl} alt={item["Nama Produk"]} className="w-12 h-12 object-cover rounded-md" />, 
                                    "kuantitas": (typeof item.kuantitas === 'number' ? item.kuantitas.toLocaleString('id-ID') : '0'),
                                    "Harga Satuan": formatRupiah(item["Harga Satuan"] || 0),  
                                    "Total Biaya": formatRupiah(item["Total Biaya"] || 0),  
                                    No: index + 1  
                                }))}
                            />
                        </div>
                    </section>

                    {isCustom && (
                        <section className="pt-10">
                            <p className="font-bold">Rincian Biaya</p>
                            <div className="pt-5">
                                <Table
                                    headers={headersRincianBiaya}
                                    data={(data.rincian_biaya_custom || []).map((item, index) => ({
                                        "No": index + 1,
                                        "Nama Biaya": item.nama_biaya || 'Unknown',
                                        "Jumlah Biaya": formatRupiah(item.jumlah_biaya || 0)
                                    }))}
                                />
                            </div>
                        </section>
                    )}

                        <section className="pt-10">
                            <p className="font-bold">Packging</p>
                            <div className="pt-5">
                                <Table
                                    headers={headers2}
                                    data={(data.data_packaging || []).map((item, index) => ({
                                        No: index + 1,
                                        ...(isCustom ? {
                                            "Foto Produk": <img src={item.imageUrl} alt={item["Nama Packaging"]} className="w-12 h-12 object-cover rounded-md" />,
                                            "Nama Packaging": item["Nama Packaging"],
                                            "Harga Satuan": formatRupiah(item["Harga Satuan"]),
                                            "kuantitas": formatRupiah(item.kuantitas),
                                            "Total Biaya": formatRupiah(item["Total Biaya"])
                                        } : {
                                            "Foto Produk": <img src={item.imageUrl} alt={item["Nama Packaging"]} className="w-12 h-12 object-cover rounded-md" />,
                                            "Nama Packaging": item["Nama Packaging"],
                                            "kuantitas": item.kuantitas
                                        })
                                    }))}
                                />
                            </div>
                        </section>

                    {/* Section Total and Notes */}
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

            {isLoading && <Spinner/>}

            {/* modal delete */}
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

            {errorMessage && (
                <AlertError
                    title="Error"
                    description={errorMessage}
                    confirmLabel="Ok"
                    onConfirm={() => setErrorMessage("")}
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
        </LayoutWithNav>
        </>
    )
}