import React, { useState, useEffect } from 'react';
import Input from '../../../components/Input';
import InputDropdown from '../../../components/InputDropdown';
import Table from '../../../components/Table';
import LayoutWithNav from "../../../components/LayoutWithNav";
import { menuItems, userOptions } from "../../../data/menu";
import moment from "moment";
import Breadcrumbs from '../../../components/Breadcrumbs';
import api from "../../../utils/api";
import { useLocation, useNavigate } from 'react-router-dom';
import AlertSuccess from '../../../components/AlertSuccess';
import AlertError from '../../../components/AlertError';
import Spinner from '../../../components/Spinner';

export default function BayarGaji() {
    const location = useLocation();
    const { karyawanData, selectedMonth, selectedYear, selectedCabang } = location.state || {};
    const navigate = useNavigate();
    // const [initialState, setInitialState] = useState({
    //     selectedMonth: selectedMonth || moment().format("MMMM"),
    //     selectedYear: selectedYear || moment().format("YYYY"),
    //     selectedCabang: selectedCabang || "Semua"
    // });

    console.log(karyawanData)

    // Gunakan karyawanData langsung jika tersedia
    const [dataRincianGaji, setDataRincianGaji] = useState([]);
    const [loading, setLoading] = useState(!karyawanData);
    const [error, setError] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    const [isAlertSucc, setAlertSucc] = useState(false);
    const [isErrorAlert, setErrorAlert] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const [formData, setFormData] = useState({
        tanggal: moment().format("YYYY-MM-DDTHH:mm:ss"),
        kategori: '',
        cashNonCash: '',
        metodePembayaran: ''
    });

    useEffect(() => {
        if (karyawanData && karyawanData.length > 0) {
            const transformedData = karyawanData.map((item, index) => {
                let potonganValue = item.potonganGaji;
                if (typeof potonganValue === 'string') {
                    potonganValue = parseInt(potonganValue.replace(/\D/g, '')) || 0;
                }
                
                return {
                    id: item.id,
                    No: index + 1,
                    Nama: item.nama,
                    Divisi: item.divisi,
                    Toko: item.toko,
                    Cabang: item.cabang,
                    Absen: item.absen || 0, 
                    KPI: item.kpi || "0%",
                    "Total Gaji Akhir": item.totalGajiAkhir,
                    potonganGaji: potonganValue
                };
            });
            
            setDataRincianGaji(transformedData);
            setLoading(false);
        } 
    }, [karyawanData]);

    // const fetchSalaryDetails = async () => {
    //     try {
    //         const monthMapping = {
    //             'January': '01',
    //             'February': '02',
    //             'March': '03',
    //             'April': '04',
    //             'May': '05',
    //             'June': '06',
    //             'July': '07',
    //             'August': '08',
    //             'September': '09',
    //             'October': '10',
    //             'November': '11',
    //             'December': '12'
    //         };
    
    //         const formattedMonth = monthMapping[initialState.selectedMonth] || moment().format('MM');
            
    //         setLoading(true);
    //         const response = await api.get(`/absensi-karyawan/${formattedMonth}/${initialState.selectedYear}`);
    
    //         if (response.data.success) {
    //             const filteredData = response.data.data.filter(item => 
    //                 initialState.selectedCabang === "Semua" || 
    //                 item.karyawan.cabang.nama_cabang === initialState.selectedCabang
    //             ).map((item, index) => ({
    //                 id: item.karyawan.karyawan_id,
    //                 No: index + 1,
    //                 Nama: item.karyawan.nama_karyawan,
    //                 Divisi: item.karyawan.divisi.nama_divisi,
    //                 Toko: item.karyawan.toko.nama_toko,
    //                 Cabang: item.karyawan.cabang.nama_cabang,
    //                 Absen: Math.round(item.kehadiran), 
    //                 CutiDays: item.totalCutiDays?.toFixed(2) || 0,
    //                 TidakHadir: Math.round(item.tidakHadir) || 0,
    //                 TotalGajiPokok: item.totalGajiPokok || 0,
    //                 KPI: `${item.totalPersentaseTercapai?.toFixed(2) || 0}%`,
    //                 BonusDiterima: item.totalBonusDiterima || 0,
    //                 "Total Gaji Akhir": item.totalGajiAkhir,
    //                 potonganGaji: item.potonganGaji || 0
    //             }));
    
    //             setDataRincianGaji(filteredData);
    //         } else {
    //             setError(response.data.message);
    //         }
    //     } catch (err) {
    //         console.error('Error fetching salary details:', err);
    //         setError(err.response?.data?.message || 'An error occurred while fetching salary details');
    //     } finally {
    //         setLoading(false);
    //     }
    // };

    const [kategoriOptions, setKategoriOptions] = useState([]);
    const [metodePembayaranOptions, setMetodePembayaranOptions] = useState([]);

    useEffect(() => {
        const fetchDropdownOptions = async () => {
            try {
                const kategoriResponse = await api.get('/kategori-pengeluaran');
                const transformedKategoriOptions = kategoriResponse.data.success 
                    ? kategoriResponse.data.data.map(kategori => ({
                        label: kategori.kategori_pengeluaran,
                        value: kategori.kategori_pengeluaran_id
                    }))
                    : [];

                const metodePembayaranResponse = await api.get('/metode-pembayaran');
                const transformedMetodePembayaranOptions = metodePembayaranResponse.data.success 
                    ? [
                        { label: '-', value: '' },
                        ...metodePembayaranResponse.data.data.map(metode => ({
                            label: metode.nama_metode,
                            value: metode.metode_id
                        }))
                    ]
                    : [{ label: '-', value: '' }];

                setKategoriOptions(transformedKategoriOptions);
                setMetodePembayaranOptions(transformedMetodePembayaranOptions);
            } catch (err) {
                console.error('Error fetching dropdown options:', err);
            }
        };

        fetchDropdownOptions();
    }, []);

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
        const numValue = typeof number === 'string' ? 
            parseFloat(number.replace(/[^\d.-]/g, '')) : 
            number;
            
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(numValue).replace('IDR', 'Rp');
    };

    const calculateTotal = () => {
        return dataRincianGaji.reduce((sum, item) => {
            const value = typeof item["Total Gaji Akhir"] === 'string' 
                ? parseFloat(item["Total Gaji Akhir"].replace(/[^\d.-]/g, '')) 
                : item["Total Gaji Akhir"];
            return sum + (value || 0);
        }, 0);
    };

    const handleSubmitSalary = async () => {
        if (!formData.tanggal || !formData.kategori || !formData.cashNonCash) {
            setErrorMessage('Harap lengkapi semua data yang diperlukan');
            setErrorAlert(true);
            return;
        }

        if (formData.cashNonCash === 'Non-Cash' && !formData.metodePembayaran) {
            setErrorMessage('Harap pilih metode pembayaran');
            setErrorAlert(true);
            return;
        }

        try {
            setSubmitting(true);

            const payload = {
                tanggal: moment(formData.tanggal).toISOString(),
                kategori_pengeluaran_id: parseInt(formData.kategori),
                cash_or_non: formData.cashNonCash === 'Cash',
                metode_id: formData.cashNonCash === 'Cash' ? null : parseInt(formData.metodePembayaran),
                total: calculateTotal(),
                rincian_gaji: dataRincianGaji.map(item => {
                    // Extract KPI percentage value from string (e.g. "85.50%" -> 85.50)
                    let kpiValue = 0;
                    if (typeof item.KPI === 'string' && item.KPI.includes('%')) {
                        kpiValue = parseFloat(item.KPI.replace('%', ''));
                    } else if (typeof item.KPI === 'number') {
                        kpiValue = item.KPI;
                    }
                    
                    // Ensure the total gaji is a number
                    let totalGaji = item["Total Gaji Akhir"];
                    if (typeof totalGaji === 'string') {
                        totalGaji = parseFloat(totalGaji.replace(/[^\d.-]/g, ''));
                    }
                    
                    return {
                        karyawan_id: item.id,
                        absen: typeof item.Absen === 'number' ? item.Absen : 0,
                        kpi: kpiValue,
                        potongan_gaji: item.potonganGaji || 0,
                        total_gaji_akhir: totalGaji || 0
                    };
                })
            };

            const response = await api.post('/bayar-gaji', payload);

            if (response.data.success) {
                setAlertSucc(true);
            } else {
                setErrorMessage(response.data.message || 'Gagal membayar gaji');
                setErrorAlert(true);
            }
        } catch (error) {
            console.error('Error submitting salary payment:', error);
            setErrorMessage(error.response?.data?.message || 'Terjadi kesalahan saat membayar gaji');
            setErrorAlert(true);
        } finally {
            setSubmitting(false);
        }
    };

    const handleConfirmSucc = () => {
        setAlertSucc(false);
        navigate('/karyawan-absen-gaji');
    };

    const breadcrumbItems = [
        { label: "Daftar Karyawan Absensi dan Gaji", href: "/karyawan-absen-gaji" },
        { label: "Bayar Gaji", href: "" },
    ]

    // Render loading state
    if (loading) {
        return (
            <LayoutWithNav menuItems={menuItems} userOptions={userOptions}>
                <div className="p-5">Loading...</div>
            </LayoutWithNav>
        );
    }

    // Render error state
    if (error) {
        return (
            <LayoutWithNav menuItems={menuItems} userOptions={userOptions}>
                <div className="p-5 text-red-500">Error: {error}</div>
            </LayoutWithNav>
        );
    }

    return (
        <LayoutWithNav menuItems={menuItems} userOptions={userOptions}>
            <div className="p-5">
                <Breadcrumbs items={breadcrumbItems} />

                <div className="mt-5 bg-white rounded-xl p-5">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Input
                            label="Nomor"
                            value=""
                            disabled={true}
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
                            options={kategoriOptions}
                            value={formData.kategori}
                            onSelect={(value) => handleInputChange('kategori', value.value)}
                            required
                        />
                        <InputDropdown
                            label="Cash/Non-Cash"
                            options={[
                                { label: 'Cash', value: 'Cash' }, 
                                { label: 'Non-Cash', value: 'Non-Cash' }
                            ]}
                            value={formData.cashNonCash}
                            onSelect={(value) => {
                                handleInputChange('cashNonCash', value.value);
                                // Reset metode pembayaran when changing cash/non-cash
                                handleInputChange('metodePembayaran', '');
                            }}
                            required
                        />
                        <InputDropdown
                            label="Metode Pembayaran"
                            options={metodePembayaranOptions}
                            value={formData.metodePembayaran}
                            onSelect={(value) => handleInputChange('metodePembayaran', value.value)}
                            disabled={formData.cashNonCash === 'Cash'}
                            required={formData.cashNonCash === 'Non-Cash'}
                        />
                    </div>

                    <div className="mt-8">
                        <h3 className="font-medium mb-4">Rincian Gaji</h3>
                        <Table
                            headers={headers}
                            data={dataRincianGaji.map((item) => ({
                                ...item,
                                "TotalGajiPokok": item.TotalGajiPokok ? formatCurrency(item.TotalGajiPokok) : '-',
                                "BonusDiterima": item.BonusDiterima ? formatCurrency(item.BonusDiterima) : '-',
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
                            <button 
                                onClick={handleSubmitSalary}
                                disabled={submitting}
                                className="w-1/3 bg-primary text-white py-2 rounded-lg disabled:opacity-50"
                            >
                                {submitting ? 'Menyimpan...' : 'Simpan'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Success Alert */}
            {isAlertSucc && (
                <AlertSuccess
                    title="Berhasil!!"
                    description="Data gaji berhasil dibayarkan"
                    confirmLabel="Ok"
                    onConfirm={handleConfirmSucc}
                />
            )}

            {/* Error Alert */}
            {isErrorAlert && (
                <AlertError
                    title="Gagal!!"
                    description={errorMessage}
                    confirmLabel="Ok"
                    onConfirm={() => setErrorAlert(false)}
                />
            )}

            {/* Loading Spinner */}
            {submitting && <Spinner />}
        </LayoutWithNav>
    );
}