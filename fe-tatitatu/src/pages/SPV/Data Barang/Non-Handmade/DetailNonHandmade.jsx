import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../../../utils/api";
import Spinner from "../../../../components/Spinner";
import LayoutWithNav from "../../../../components/LayoutWithNav";
import Breadcrumbs from "../../../../components/Breadcrumbs";
import Button from "../../../../components/Button";
import ButtonDropdown from "../../../../components/ButtonDropdown";
import Table from "../../../../components/Table";
import Alert from "../../../../components/Alert";
import AlertSuccess from "../../../../components/AlertSuccess";

export default function DetailBarang() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [selectedCabang, setSelectedCabang] = useState("");
    const [isModalDel, setModalDel] = useState(false);
    const [isModalSucc, setModalSucc] = useState(false);
    const userData = JSON.parse(localStorage.getItem('userData'));
    const isAdminGudang = userData?.role === 'admingudang';
    const [isLoading, setLoading] = useState(true);
    const [data, setData] = useState(null);
    const [rincianBiayaPerCabang, setRincianBiayaPerCabang] = useState({});

    useEffect(() => {
        const fetchData = async () => {
            try {
                if (isAdminGudang) {
                    const response = await api.get(`/barang-nonhandmade-gudang/${id}`);
                    
                    if (response.data.success) {
                        const itemData = response.data.data;
                        
                        setData({
                            "Nama Barang": itemData.nama_barang,
                            "Nomor Barang": itemData.barang_nonhandmade_id,
                            "Kategori": itemData.kategori.nama_kategori_barang,
                            "Total HPP": itemData.total_hpp,
                            "Total Keuntungan": itemData.keuntungan,
                            "Harga Jual": itemData.harga_jual,
                            "Harga Jual Ideal": itemData.harga_jual_ideal,
                            "Harga Logis": itemData.harga_logis,
                            "Margin Persentase": itemData.margin_persentase,
                            "Margin Nominal": itemData.margin_nominal,
                            "Jumlah Minimum Stok": itemData.jumlah_minimum_stok,
                            "image": itemData.image,
                            "rincian_biaya": itemData.rincian_biaya.map(rb => ({
                                "Nama Biaya": rb.nama_biaya,
                                "Jumlah Biaya": rb.jumlah_biaya,
                                isEditable: true
                            }))
                        });
                    }
                } else {
                    // Fetch logic for non-admin gudang
                    const [itemResponse, biayaTokoResponse] = await Promise.all([
                        api.get(`/barang-non-handmade/${id}`),
                        api.get('/biaya-toko')
                    ]);

                    if (itemResponse.data.success) {
                        const itemData = itemResponse.data.data;
                        const biayaTokoData = biayaTokoResponse.data.success ? biayaTokoResponse.data.data : [];

                        const rincianBiayaMap = {};
                        const dataCabang = [];

                        itemData.rincian_biaya.forEach(rincian => {
                            const cabangName = rincian.cabang.nama_cabang;
                            const biayaToko = biayaTokoData.find(bt => bt.cabang_id === rincian.cabang_id);
                            
                            dataCabang.push({
                                nama: cabangName,
                                totalHPP: rincian.total_hpp,
                                keuntungan: rincian.keuntungan,
                                hargaJual: rincian.harga_jual,
                                hargaIdeal: rincian.harga_jual_ideal,
                                hargaLogis: rincian.harga_logis,
                                marginPersentase: rincian.margin_persentase,
                                marginNominal: rincian.margin_nominal
                            });

                            const branchRincianBiaya = [];

                            // if (biayaToko) {
                            //     branchRincianBiaya.push({
                            //         id: biayaToko.biaya_toko_id,
                            //         "Nama Biaya": `Biaya Operasional dan Staff ${cabangName}`,
                            //         "Jumlah Biaya": biayaToko.total_biaya,
                            //         isEditable: false
                            //     });
                            // }

                            rincian.detail_rincian_biaya.forEach(detail => {
                                if (!detail.biaya_toko_id && !detail.is_deleted) {
                                    branchRincianBiaya.push({
                                        id: detail.detail_rincian_biaya_id,
                                        "Nama Biaya": detail.nama_biaya,
                                        "Jumlah Biaya": detail.jumlah_biaya,
                                        isEditable: true
                                    });
                                }
                            });

                            rincianBiayaMap[cabangName] = branchRincianBiaya;
                        });

                        setRincianBiayaPerCabang(rincianBiayaMap);

                        setData({
                            "Nama Barang": itemData.nama_barang,
                            "Nomor Barang": itemData.barang_non_handmade_id,
                            "Kategori": itemData.kategori.nama_kategori_barang,
                            "Total HPP": itemData.rincian_biaya[0]?.total_hpp || 0,
                            "Total Keuntungan": itemData.rincian_biaya[0]?.keuntungan || 0,
                            "Harga Jual": itemData.rincian_biaya[0]?.harga_jual || 0,
                            "Jumlah Minimum Stok": itemData.jumlah_minimum_stok,
                            "image": itemData.image,
                            "dataCabang": dataCabang
                        });

  
                        if (dataCabang.length > 0) {
                            setSelectedCabang(dataCabang[0].nama);
                        }
                    }
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id, isAdminGudang]);

    const getCurrentBranchRincianBiaya = () => {
        if (isAdminGudang) {
            return data?.rincian_biaya || [];
        }
        return rincianBiayaPerCabang[selectedCabang] || [];
    };

    const getCurrentBranchData = () => {
        if (isAdminGudang) {
            return {
                "Total HPP": data["Total HPP"],
                "Total Keuntungan": data["Total Keuntungan"],
                "Harga Jual": data["Harga Jual"],
                "Harga Jual Ideal": data["Harga Jual Ideal"],
                "Harga Logis": data["Harga Logis"],
                "Margin Persentase": data["Margin Persentase"],
                "Margin Nominal": data["Margin Nominal"]
            };
        }
        
        const branchData = data.dataCabang.find(cabang => cabang.nama === selectedCabang);
        
        if (branchData) {
            return {
                "Total HPP": branchData.totalHPP,
                "Total Keuntungan": branchData.keuntungan,
                "Harga Jual": branchData.hargaJual,
                "Harga Jual Ideal": branchData.hargaIdeal,
                "Harga Logis": branchData.hargaLogis,
                "Margin Persentase": branchData.marginPersentase,
                "Margin Nominal": branchData.marginNominal
                
            };
        }
        
        return {
            "Total HPP": data["Total HPP"],
            "Total Keuntungan": data["Total Keuntungan"],
            "Harga Jual": data["Harga Jual"]
        };
    };

    const breadcrumbItems = [
        { label: "List Data Barang Non Handmade", href: "/dataBarang/non-handmade" },
        { label: "Detail Barang", href: "" },
    ];

    const headers = [
        { label: "No", key: "No", align: "text-left" },
        { label: "Nama Biaya", key: "Nama Biaya", align: "text-left" },
        { label: "Jumlah Biaya", key: "Jumlah Biaya", align: "text-left" },
    ];

    function formatNumberWithDots(number) {
        return number?.toLocaleString('id-ID') || '0';
    }

    const handleBtnDel = () => setModalDel(true);

    const handleConfirmDel = async () => {
        try {
            setLoading(true)
            const endpoint = isAdminGudang 
            ? `/barang-nonhandmade-gudang/${id}`
            : `/barang-non-handmade/${id}`
            const response = await api.delete(endpoint);
            
            if (response.data.success) {
                setModalSucc(true);
                setModalDel(false);
            }
        } catch (error) {
            console.error('Error deleting item:', error);
        } finally {
            setLoading(false)
        }
    };
    
    const handleCancelDel = () => setModalDel(false);
    const handleConfirmSucc = () => {
        setModalSucc(false);
        navigate('/dataBarang/non-handmade');
    };
    const handleBtnEdit = () => navigate(`/dataBarang/non-handmade/edit/${id}`);

    if (isLoading) return <Spinner />;
    if (!data) return <div>Data tidak ditemukan</div>;

    return (
        <LayoutWithNav >
            <div className="p-5">
                <Breadcrumbs items={breadcrumbItems} />

                <section className="mt-5 bg-white rounded-xl p-6">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center pb-5 border-b gap-4">
                        <h1 className="text-base font-bold">{data["Nama Barang"]}</h1>
                        <div className="flex gap-3">
                            <Button
                                label="Edit"
                                icon={
                                    <svg width="17" height="18" viewBox="0 0 17 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path fillRule="evenodd" clipRule="evenodd" d="M8.32 3.17554H2C0.895 3.17554 0 4.12454 0 5.29354V15.8815C0 17.0515 0.895 17.9995 2 17.9995H13C14.105 17.9995 15 17.0515 15 15.8815V8.13154L11.086 12.2755C10.7442 12.641 10.2991 12.8936 9.81 12.9995L7.129 13.5675C5.379 13.9375 3.837 12.3045 4.187 10.4525L4.723 7.61354C4.82 7.10154 5.058 6.63054 5.407 6.26154L8.32 3.17554Z" fill="#DA5903"/>
                                        <path fillRule="evenodd" clipRule="evenodd" d="M16.8457 1.31753C16.7446 1.06156 16.5964 0.826833 16.4087 0.62553C16.2242 0.428659 16.0017 0.271165 15.7547 0.16253C15.5114 0.0556667 15.2485 0.000488281 14.9827 0.000488281C14.7169 0.000488281 14.454 0.0556667 14.2107 0.16253C13.9637 0.271165 13.7412 0.428659 13.5567 0.62553L13.0107 1.20353L15.8627 4.22353L16.4087 3.64453C16.5983 3.44476 16.7468 3.20962 16.8457 2.95253C17.0517 2.427 17.0517 1.84306 16.8457 1.31753ZM14.4497 5.72053L11.5967 2.69953L6.8197 7.75953C6.74922 7.83462 6.70169 7.92831 6.6827 8.02953L6.1467 10.8695C6.0767 11.2395 6.3857 11.5655 6.7347 11.4915L9.4167 10.9245C9.51429 10.9028 9.60311 10.8523 9.6717 10.7795L14.4497 5.72053Z" fill="#DA5903"/>
                                    </svg>
                                }
                                bgColor="bg-white border border-oren"
                                textColor="text-oren"
                                onClick={handleBtnEdit}
                            />
                            <Button
                                label="Hapus"
                                icon={
                                    <svg width="16" height="18" viewBox="0 0 16 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M10.9918 1.35785L11.2623 3.23077H14.9232C15.1068 3.23077 15.2829 3.30371 15.4128 3.43354C15.5426 3.56337 15.6155 3.73947 15.6155 3.92308C15.6155 4.10669 15.5426 4.28278 15.4128 4.41261C15.2829 4.54245 15.1068 4.61538 14.9232 4.61538H14.2134L13.4075 14.0169C13.3586 14.5892 13.3189 15.06 13.2552 15.4403C13.1906 15.8363 13.0918 16.1908 12.8989 16.5194C12.596 17.0355 12.1456 17.4492 11.6057 17.7074C11.2623 17.8708 10.9005 17.9382 10.4998 17.9695C10.1149 18 9.64323 18 9.06907 18H6.93123C6.35707 18 5.88538 18 5.50046 17.9695C5.09984 17.9382 4.738 17.8708 4.39461 17.7074C3.85469 17.4492 3.40431 17.0355 3.10138 16.5194C2.90753 16.1908 2.81061 15.8363 2.74507 15.4403C2.68138 15.0591 2.64169 14.5892 2.59277 14.0169L1.78692 4.61538H1.07707C0.893462 4.61538 0.717371 4.54245 0.587538 4.41261C0.457705 4.28278 0.384766 4.10669 0.384766 3.92308C0.384766 3.73947 0.457705 3.56337 0.587538 3.43354C0.717371 3.30371 0.893462 3.23077 1.07707 3.23077H4.738L5.00846 1.35785L5.01861 1.30154C5.18661 0.572308 5.81246 0 6.59707 0H9.40323C10.1878 0 10.8137 0.572308 10.9817 1.30154L10.9918 1.35785ZM6.13646 3.23077H9.86292L9.62661 1.59138C9.5823 1.43723 9.46969 1.38462 9.4023 1.38462H6.598C6.53061 1.38462 6.418 1.43723 6.37369 1.59138L6.13646 3.23077ZM7.30784 7.61538C7.30784 7.43177 7.2349 7.25568 7.10507 7.12585C6.97524 6.99602 6.79915 6.92308 6.61553 6.92308C6.43192 6.92308 6.25583 6.99602 6.126 7.12585C5.99617 7.25568 5.92323 7.43177 5.92323 7.61538V12.2308C5.92323 12.4144 5.99617 12.5905 6.126 12.7203C6.25583 12.8501 6.43192 12.9231 6.61553 12.9231C6.79915 12.9231 6.97524 12.8501 7.10507 12.7203C7.2349 12.5905 7.30784 12.4144 7.30784 12.2308V7.61538ZM10.0771 7.61538C10.0771 7.43177 10.0041 7.25568 9.8743 7.12585C9.74447 6.99602 9.56838 6.92308 9.38477 6.92308C9.20115 6.92308 9.02506 6.99602 8.89523 7.12585C8.7654 7.25568 8.69246 7.43177 8.69246 7.61538V12.2308C8.69246 12.4144 8.7654 12.5905 8.89523 12.7203C9.02506 12.8501 9.20115 12.9231 9.38477 12.9231C9.56838 12.9231 9.74447 12.8501 9.8743 12.7203C10.0041 12.5905 10.0771 12.4144 10.0771 12.2308V7.61538Z" fill="white"/>
                                    </svg>
                                }
                                bgColor="bg-[#C51919]"
                                textColor="text-white"
                                onClick={handleBtnDel}
                            />
                        </div>
                    </div>

                    {!isAdminGudang && (
                        <div className="pt-5">
                            <h2 className="font-bold text-base mb-6">Ringkasan Harga Jual Seluruh Cabang</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                                {data.dataCabang.map((cabang, index) => (
                                    <div key={index} className="border border-gray-300 rounded-xl p-4 bg-[#F9F9F9]">
                                        <h3 className="text-primary mb-4">{cabang.nama}</h3>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-gray-500 text-sm">Harga Ideal</p>
                                                <p className="font-medium">Rp{formatNumberWithDots(cabang.hargaIdeal)}</p>
                                            </div>
                                            <div>
                                                <p className="text-gray-500 text-sm">Harga Logis</p>
                                                <p className="font-medium">Rp{formatNumberWithDots(cabang.hargaLogis)}</p>
                                            </div>
                                            <div>
                                                <p className="text-gray-500 text-sm">Margin Persentase</p>
                                                <p className="font-medium">{formatNumberWithDots(cabang.marginPersentase)}%</p>
                                            </div>
                                            <div>
                                                <p className="text-gray-500 text-sm">Margin Nominal</p>
                                                <p className="font-medium">Rp{formatNumberWithDots(cabang.marginNominal)}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div>
                        {!isAdminGudang && (
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="font-bold text-lg">Rincian Berdasarkan Cabang</h2>
                                <div className="w-48">
                                    <ButtonDropdown
                                        label={selectedCabang}
                                        options={data.dataCabang.map(c => ({
                                            label: c.nama,
                                            value: c.nama
                                        }))}
                                        onSelect={setSelectedCabang}
                                        icon={
                                            <svg className="w-5 h-5 text-primary" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2ZM12 11.5C10.62 11.5 9.5 10.38 9.5 9C9.5 7.62 10.62 6.5 12 6.5C13.38 6.5 14.5 7.62 14.5 9C14.5 10.38 13.38 11.5 12 11.5Z" fill="currentColor"/>
                                            </svg>
                                        }
                                    />
                                </div>
                            </div>
                        )}

                        <div className="flex gap-8 my-6">
                            <div className="w-48 h-48">
                                <img
                                    src={`${import.meta.env.VITE_API_URL}/${isAdminGudang ? 'images-barang-non-handmade-gudang' : 'images-barang-non-handmade'}/${data.image}`}
                                    alt={data["Nama Barang"]}
                                    className="w-full h-full object-cover rounded-lg"
                                />
                            </div>

                            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-y-4 md:gap-y-6">
                                <div>
                                    <p className="text-gray-500">Nomor Barang</p>
                                    <p className="font-medium">{data["Nomor Barang"]}</p>
                                </div>

                                <div>
                                    <p className="text-gray-500">Kategori</p>
                                    <p className="font-medium">{data.Kategori}</p>
                                </div>

                                <div>
                                    <p className="text-gray-500">Total HPP</p>
                                    <p className="font-medium">Rp{formatNumberWithDots(getCurrentBranchData()["Total HPP"])}</p>
                                </div>

                                <div>
                                    <p className="text-gray-500">Harga Jual Ideal</p>
                                    <p className="font-medium">Rp{formatNumberWithDots(getCurrentBranchData()["Harga Jual Ideal"])}</p>
                                </div>

                                <div>
                                    <p className="text-gray-500">Harga Logis</p>
                                    <p className="font-medium">Rp{formatNumberWithDots(getCurrentBranchData()["Harga Logis"])}</p>
                                </div>

                                <div>
                                    <p className="text-gray-500">Margin Persentase</p>
                                    <p className="font-medium">{formatNumberWithDots(getCurrentBranchData()["Margin Persentase"])}%</p>
                                </div>

                                <div>
                                    <p className="text-gray-500">Margin Nominal</p>
                                    <p className="font-medium">Rp{formatNumberWithDots(getCurrentBranchData()["Margin Nominal"])}</p>
                                </div>
                            </div>
                        </div>
                        <div className="mb-6">
                                <h3 className="font-bold mb-4">Rincian Biaya</h3>
                                <Table
                                    searchQuery=""
                                    hasSearch={false}
                                    headers={headers}
                                    data={getCurrentBranchRincianBiaya().map((item, index) => ({
                                        No: index + 1,
                                        "Nama Biaya": item["Nama Biaya"],
                                        "Jumlah Biaya": `Rp${formatNumberWithDots(item["Jumlah Biaya"])}`
                                    }))}
                                />
                            </div>
                    
                    </div>
                </section>

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

                {isLoading && (<Spinner/>)}

                {isModalSucc && (
                    <AlertSuccess
                        title="Berhasil!!"
                        description="Data berhasil dihapus"
                        confirmLabel="Ok"
                        onConfirm={handleConfirmSucc}
                    />
                )}
            </div>
        </LayoutWithNav>
    );
}