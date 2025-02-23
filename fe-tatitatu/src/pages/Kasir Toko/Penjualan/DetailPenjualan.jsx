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

export default function DetailPenjualanKasir() {
    const location = useLocation()
    const { nomor, tipe, fromLaporanKeuangan } = location.state || {};
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

    const breadcrumbItems = fromLaporanKeuangan
    ? [
        { label: "Daftar Laporan Keuangan", href: "/laporanKeuangan" },
        { label: "Detail Penjualan", href: "" },
    ]
    : isAdminGudang 
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
                    total_penjualan: salesData.total_penjualan || 0,
                    toko_id: salesData.toko_id,
                    cabang_id: salesData.cabang_id
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
        const editState = {
            toko_id: data.toko_id,
            cabang_id: data.cabang_id,
            fromLaporanKeuangan: fromLaporanKeuangan 
        };
    
        if (fromLaporanKeuangan) {
            if (isCustom) {
                navigate(`/laporanKeuangan/pemasukan/penjualan-custom/${data.nomor}`, {
                    state: editState
                });
            } else {
                navigate(`/laporanKeuangan/pemasukan/penjualan-non-custom/${data.nomor}`, {
                    state: editState
                });
            }
        } else {
            if (isCustom) {
                navigate(`/penjualan-kasir/edit/custom/${data.nomor}`, {
                    state: editState
                });
            } else {
                navigate(`/penjualan-kasir/edit/non-custom/${data.nomor}`, {
                    state: editState
                });
            }
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
                    if (fromLaporanKeuangan) {
                        navigate('/laporanKeuangan');
                    } else {
                        const baseRoute = isAdminGudang ? '/penjualan-admin-gudang' : '/penjualan-kasir';
                        navigate(baseRoute);
                    }
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
                                label={'Cetak'}
                                icon={
                                    <svg width="17" height="18" viewBox="0 0 17 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M8.98911 17.5412L8.98003 17.5429L8.92144 17.5718L8.90494 17.5751L8.89339 17.5718L8.8348 17.5429C8.826 17.5401 8.8194 17.5415 8.815 17.547L8.8117 17.5553L8.79767 17.9084L8.8018 17.9249L8.81005 17.9357L8.89586 17.9967L8.90824 18L8.91814 17.9967L9.00396 17.9357L9.01386 17.9225L9.01716 17.9084L9.00313 17.5561C9.00093 17.5473 8.99626 17.5423 8.98911 17.5412ZM9.20777 17.448L9.19705 17.4497L9.04439 17.5264L9.03614 17.5346L9.03367 17.5437L9.04852 17.8985L9.05264 17.9084L9.05925 17.9142L9.2251 17.991C9.23555 17.9937 9.24353 17.9915 9.24903 17.9844L9.25233 17.9728L9.22428 17.4662C9.22153 17.4563 9.21602 17.4502 9.20777 17.448ZM8.61779 17.4497C8.61415 17.4475 8.6098 17.4467 8.60565 17.4477C8.6015 17.4486 8.59787 17.4511 8.59551 17.4546L8.59055 17.4662L8.5625 17.9728C8.56305 17.9827 8.56773 17.9893 8.57653 17.9926L8.5889 17.991L8.75476 17.9142L8.76301 17.9076L8.76631 17.8985L8.78034 17.5437L8.77787 17.5338L8.76961 17.5256L8.61779 17.4497Z" fill="#7B0C42"/>
                                    <path d="M11.8022 11.5522C12.0043 11.5522 12.1994 11.6264 12.3504 11.7607C12.5015 11.895 12.598 12.0801 12.6216 12.2808L12.6274 12.3774V15.678C12.6273 15.8801 12.5531 16.0752 12.4188 16.2262C12.2845 16.3773 12.0995 16.4737 11.8988 16.4974L11.8022 16.5032H5.20095C4.99884 16.5031 4.80377 16.4289 4.65274 16.2946C4.5017 16.1603 4.40521 15.9753 4.38157 15.7746L4.37579 15.678V12.3774C4.37582 12.1753 4.45002 11.9802 4.58432 11.8292C4.71862 11.6781 4.90369 11.5816 5.10441 11.558L5.20095 11.5522H11.8022ZM14.2777 4.12579C14.9342 4.12579 15.5639 4.3866 16.0281 4.85084C16.4924 5.31508 16.7532 5.94473 16.7532 6.60127V12.3774C16.7532 12.8151 16.5793 13.2348 16.2698 13.5443C15.9603 13.8538 15.5405 14.0277 15.1028 14.0277H14.2777V11.5522C14.2777 11.1145 14.1038 10.6948 13.7943 10.3853C13.4848 10.0758 13.0651 9.9019 12.6274 9.9019H4.37579C3.9381 9.9019 3.51834 10.0758 3.20884 10.3853C2.89935 10.6948 2.72547 11.1145 2.72547 11.5522V14.0277H1.90032C1.46263 14.0277 1.04286 13.8538 0.733366 13.5443C0.423872 13.2348 0.25 12.8151 0.25 12.3774V6.60127C0.25 5.94473 0.510808 5.31508 0.97505 4.85084C1.43929 4.3866 2.06894 4.12579 2.72547 4.12579H14.2777ZM12.6274 5.77611H10.9771C10.7667 5.77634 10.5645 5.85687 10.4115 6.00125C10.2586 6.14563 10.1666 6.34295 10.1542 6.55291C10.1419 6.76286 10.2102 6.9696 10.3452 7.13088C10.4802 7.29216 10.6717 7.39581 10.8805 7.42065L10.9771 7.42642H12.6274C12.8377 7.42619 13.04 7.34566 13.1929 7.20128C13.3458 7.0569 13.4379 6.85958 13.4502 6.64962C13.4625 6.43967 13.3942 6.23293 13.2592 6.07165C13.1242 5.91037 12.9328 5.80672 12.7239 5.78188L12.6274 5.77611ZM12.6274 0C12.8462 0 13.0561 0.086936 13.2108 0.241683C13.3656 0.39643 13.4525 0.606313 13.4525 0.825158V2.47547H3.55063V0.825158C3.55063 0.606313 3.63757 0.39643 3.79232 0.241683C3.94706 0.086936 4.15695 0 4.37579 0H12.6274Z" fill="#7B0C42"/>
                                    </svg>
                                }
                                bgColor="border border-primary"
                                hoverColor="hover:bg-primary"
                                textColor="text-primary"
                                // onClick={handleEdit}
                            />
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