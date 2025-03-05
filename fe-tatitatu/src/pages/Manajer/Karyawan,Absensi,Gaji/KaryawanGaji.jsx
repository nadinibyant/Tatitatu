import { useEffect, useState } from "react";
import Button from "../../../components/Button";
import ButtonDropdown from "../../../components/ButtonDropdown";
import LayoutWithNav from "../../../components/LayoutWithNav";
import { menuItems, userOptions } from "../../../data/menu";
import moment from "moment";
import Table from "../../../components/Table";
import { useNavigate } from "react-router-dom";
import InputDropdown from "../../../components/InputDropdown";
import axios from 'axios'; // Make sure to install axios
import api from "../../../utils/api";
import AlertError from "../../../components/AlertError";

export default function KaryawanGaji() {
    const navigate = useNavigate();
    const userData = JSON.parse(localStorage.getItem('userData'));
    const isAdminGudang = userData?.role === 'admingudang'
    const isHeadGudang = userData?.role === 'headgudang';
    const isOwner = userData?.role === 'owner';
    const isManajer = userData?.role === 'manajer';
    const isAdmin = userData?.role === 'admin';
    const isFinance = userData?.role === 'finance'

    const themeColor = (isAdminGudang || isHeadGudang) 
    ? "coklatTua" 
    : (isManajer || isOwner || isFinance) 
      ? "biruTua" 
      : "primary";

    const [searchText, setSearchText] = useState("");
    const [selectedStore, setSelectedStore] = useState("Semua");
    const [selectedMonth, setSelectedMonth] = useState(moment().format("MMMM"));
    const [selectedYear, setSelectedYear] = useState(moment().format("YYYY"));
    const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
    const [filterPosition, setFilterPosition] = useState({ top: 0, left: 0 });
    const [errorMessasge, setErrorMessage] = useState("")
    const [errorAlert, setErrorAlert] = useState(false);
    
    // State for filter options
    const [filterOptions, setFilterOptions] = useState({
        divisi: [{ label: "Semua", value: "Semua" }],
        toko: [{ label: "Semua", value: "Semua" }],
        cabang: [{ label: "Semua", value: "Semua" }]
    });
    const [selectedDivisi, setSelectedDivisi] = useState("Semua")
    const [selectedToko, setSelectedToko] = useState("Semua")
    const [selectedCabang, setSelectedCabang] = useState("Semua")
    const [cabangData, setCabangData] = useState([])

    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchFilterOptions = async () => {
            try {
                const divisiResponse = await api.get('/divisi-karyawan');
                const divisiOptions = [
                    { label: "Semua", value: "Semua" },
                    ...divisiResponse.data.data.map(divisi => ({
                        label: divisi.nama_divisi,
                        value: divisi.nama_divisi,
                        divisi_id: divisi.divisi_karyawan_id 
                    }))
                ];

                const tokoResponse = await api.get('/toko');
                const tokoOptions = [
                    { label: "Semua", value: "Semua" },
                    ...tokoResponse.data.data.map(toko => ({
                        label: toko.nama_toko,
                        value: toko.nama_toko,
                        toko_id: toko.toko_id 
                    }))
                ];

                const cabangResponse = await api.get('/cabang');
                const cabangOptions = [
                    { label: "Semua", value: "Semua" },
                    ...cabangResponse.data.data.map(cabang => ({
                        label: cabang.nama_cabang,
                        value: cabang.nama_cabang,
                        cabang_id: cabang.cabang_id 
                    }))
                ];
    
                setFilterOptions({
                    divisi: divisiOptions,
                    toko: tokoOptions,
                    cabang: cabangOptions
                });
            } catch (err) {
                console.error('Error fetching filter options:', err);
                setError(err.response?.data?.message || 'An error occurred while fetching filter options');
            }
        };
    
        fetchFilterOptions();
    }, []);

    useEffect(() => {
        const fetchCabangData = async () => {
            try {
                const response = await api.get('/cabang');
                
                if (response.data.success) {
                    const transformedCabangData = [
                        { label: 'Semua', value: 'Semua', icon: '/icon/toko.svg' },
                        ...response.data.data.map(cabang => ({
                            label: cabang.nama_cabang,
                            value: cabang.nama_cabang,
                            icon: '/icon/toko.svg',
                            cabang_id: cabang.cabang_id 
                        }))
                    ];
                    
                    setCabangData(transformedCabangData);
                } else {
                    setError(response.data.message);
                }
            } catch (err) {
                console.error('Error fetching cabang data:', err);
                setError(err.response?.data?.message || 'An error occurred while fetching cabang data');
            }
        };
    
        fetchCabangData();
    }, []);

    const formatCurrency = (number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(number).replace('IDR', 'Rp');
    };

    const [editedPotongan, setEditedPotongan] = useState({});
    const [isEditing, setIsEditing] = useState(false);

    const headers = [
        { label: "No", key: "No", align: "text-left" },
        { label: "Nama", key: "Nama", align: "text-left" },
        { label: "Divisi", key: "Divisi", align: "text-left" },
        { label: "Toko", key: "Toko", align: "text-left" },
        { label: "Cabang", key: "Cabang", align: "text-left" },
        { label: "Potongan Gaji", key: "Potongan Gaji", align: "text-left" },
        { label: "Total Gaji Akhir", key: "Total Gaji Akhir", align: "text-left" }
    ];

    // Fetch data from API
    useEffect(() => {
        const fetchData = async () => {
            try {
                const monthMapping = {
                    'January': '01',
                    'February': '02',
                    'March': '03',
                    'April': '04',
                    'May': '05',
                    'June': '06',
                    'July': '07',
                    'August': '08',
                    'September': '09',
                    'October': '10',
                    'November': '11',
                    'December': '12'
                };
        
                const formattedMonth = monthMapping[selectedMonth] || moment().format('MM');
                
                setLoading(true);
                const response = await api.get(`/absensi-karyawan/${formattedMonth}/${selectedYear}`);

                if (response.data.success) {
                    const transformedData = response.data.data.map((item, index) => ({
                        id: item.karyawan.karyawan_id,
                        No: index + 1,
                        Nama: item.karyawan.nama_karyawan,
                        toko_id: item.karyawan.toko_id,
                        Divisi: item.karyawan.divisi.nama_divisi,
                        Toko: item.karyawan.toko.nama_toko,
                        Cabang: item.karyawan.cabang ? item.karyawan.cabang.nama_cabang : "-",
                        "Potongan Gaji": 0,
                        "Total Gaji Akhir": item.totalGajiAkhir,
                        "waktu_kerja_sebulan_menit": item.karyawan.waktu_kerja_sebulan_menit || null,
                        "waktu_kerja_sebulan_antar": item.karyawan.waktu_kerja_sebulan_antar || null
                    }));

                    setData(transformedData);
                } else {
                    setError(response.data.message);
                }
            } catch (err) {
                setError(err.response?.data?.message || 'An error occurred while fetching data');
                console.error('Error fetching data:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [selectedMonth, selectedYear]);

    const handleFilterClick = (event) => {
        const buttonRect = event.currentTarget.getBoundingClientRect();
        setFilterPosition({
          top: buttonRect.bottom + window.scrollY + 5,
          left: buttonRect.left + window.scrollX
        });
        setIsFilterModalOpen(prev => !prev);
    };

    const filteredData = data.filter(item => {
        const matchDivisi = selectedDivisi === "Semua" || item.Divisi === selectedDivisi;
        const matchToko = selectedToko === "Semua" || item.Toko === selectedToko;
        const matchCabang = selectedCabang === "Semua" || item.Cabang === selectedCabang;
        return matchDivisi && matchToko && matchCabang;
    });

    const handleApplyFilter = () => {
        setIsFilterModalOpen(false);
    };

    // const dataCabang = [
    //     { label: 'Semua', value: 'Semua', icon: '/icon/toko.svg' },
    //     { label: 'Gor Agus', value: 'Gor Agus', icon: '/icon/toko.svg' },
    //     { label: 'Lubeg', value: 'Lubeg', icon: '/icon/toko.svg' },
    // ];

    const handlePotongGajiChange = (id, value) => {
        const potongan = parseInt(value.replace(/\D/g, '')) || 0;
        const item = data.find(item => item.id === id);
        const gajiAwal = item["Total Gaji Akhir"]; // existing total salary
        
        setEditedPotongan(prev => ({
            ...prev,
            [id]: {
                potongan: potongan,
                totalGaji: gajiAwal - potongan
            }
        }));
    };

    const handleSelesai = () => {
        setData(prev => prev.map(item => ({
            ...item,
            "Potongan Gaji": editedPotongan[item.id]?.potongan || item["Potongan Gaji"],
            "Total Gaji Akhir": editedPotongan[item.id]?.totalGaji || item["Total Gaji Akhir"]
        })));
        setEditedPotongan({});
        setIsEditing(false);
    };
    
    const handleBatal = () => {
        setEditedPotongan({});
        setIsEditing(false);
    };

    // const handleRowClick = (row) => {
    //     navigate('/karyawan-absen-gaji/detail', { state: { id: row.id, divisi: row.Divisi } });
    // }

    const handleRowClick = (row) => {
        const employeeData = data.find(item => item.id === row.id);
        console.log(employeeData)
        let divisiType;
        if (employeeData.toko_id === 1) {
            if (employeeData.waktu_kerja_sebulan_antar === null) {
                divisiType = "Produksi";
            } else if (employeeData.waktu_kerja_sebulan_menit === null) {
                divisiType = "Transportasi";
            }
        } else {
            divisiType = employeeData.waktu_kerja_sebulan_antar === null || employeeData.waktu_kerja_sebulan_antar === "null" ? "Umum" : "Transportasi";
        }
        
        navigate('/dataKaryawanAbsenGaji/detail', { 
            state: { 
                id: row.id, 
                divisi: divisiType 
            } 
        });
    };

    const handleAddBayar = () => {
        navigate('/karyawan-absen-gaji/bayar-gaji', { 
            state: { 
                selectedMonth: selectedMonth,
                selectedYear: selectedYear,
                selectedCabang: selectedStore,
                karyawanData: data.map(item => ({
                    id: item.id,
                    nama: item.Nama,
                    divisi: item.Divisi,
                    toko: item.Toko,
                    cabang: item.Cabang,
                    potonganGaji: item["Potongan Gaji"],
                    totalGajiAkhir: item["Total Gaji Akhir"]
                }))
            } 
        });
    }
    // Render loading or error states
    if (loading) {
        return (
            <LayoutWithNav menuItems={menuItems} userOptions={userOptions}>
                <div className="p-5">Loading...</div>
            </LayoutWithNav>
        );
    }

    if (error) {
        return (
            <LayoutWithNav menuItems={menuItems} userOptions={userOptions}>
                <div className="p-5 text-red-500">Error: {error}</div>
            </LayoutWithNav>
        );
    }

    const handleExport = async () => {
        try {

            let queryParams = {};

            if (selectedToko !== "Semua") {
                const tokoOption = filterOptions.toko.find(option => option.value === selectedToko);
                if (tokoOption && tokoOption.toko_id) {
                    queryParams.toko_id = tokoOption.toko_id;
                }
            }

            if (selectedCabang !== "Semua") {
                const cabangOption = filterOptions.cabang.find(option => option.value === selectedCabang);
                if (cabangOption && cabangOption.cabang_id) {
                    queryParams.cabang = cabangOption.cabang_id;
                }
            }

            if (selectedDivisi !== "Semua") {
                const divisiOption = filterOptions.divisi.find(option => option.value === selectedDivisi);
                if (divisiOption && divisiOption.divisi_id) {
                    queryParams.divisi = divisiOption.divisi_id;
                }
            }
            
            if (selectedStore !== "Semua") {
                const storeOption = cabangData.find(option => option.value === selectedStore);
                if (storeOption && storeOption.cabang_id && !queryParams.cabang) {
                    queryParams.cabang = storeOption.cabang_id;
                }
            }

            const monthMapping = {
                'January': '01', 'February': '02', 'March': '03', 'April': '04',
                'May': '05', 'June': '06', 'July': '07', 'August': '08',
                'September': '09', 'October': '10', 'November': '11', 'December': '12'
            };
            const formattedMonth = monthMapping[selectedMonth] || moment().format('MM');
            queryParams.bulan = formattedMonth;

            queryParams.tahun = selectedYear;

            setLoading(true);
            
            const response = await api.get('/absensi-karyawan/export', {
                params: queryParams,
                responseType: 'blob'
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;

            const contentDisposition = response.headers['content-disposition'];
            let filename = 'karyawan-absensi-export.xlsx';
            if (contentDisposition) {
                const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
                if (filenameMatch && filenameMatch[1]) {
                    filename = filenameMatch[1].replace(/['"]/g, '');
                }
            }
            
            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
            
        } catch (error) {
            console.error('Error exporting data:', error);
            setErrorMessage(error.response.data.message)
            setErrorAlert(true)
        } finally {
            setLoading(false);
        }
    };

    return (
        <LayoutWithNav menuItems={menuItems} userOptions={userOptions}>
            <div className="p-5">
                <section className="flex flex-wrap md:flex-nowrap items-center justify-between space-y-2 md:space-y-0">
                    <div className="left w-full md:w-auto">
                        <p className={`text-${themeColor} text-base font-bold`}>Data Karyawan Absensi dan Gaji</p>
                    </div>

                    <div className="right flex flex-wrap md:flex-nowrap items-center space-x-0 md:space-x-4 w-full md:w-auto space-y-2 md:space-y-0">
                        <div className="w-full md:w-auto">
                            <Button 
                                label="Export" 
                                icon={<svg width="17" height="20" viewBox="0 0 17 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M1.44845 20L0.0742188 18.6012L2.96992 15.7055H0.761335V13.7423H6.30735V19.2883H4.34416V17.1043L1.44845 20ZM8.27054 19.6319V11.7791H0.417777V0H10.2337L16.1233 5.88957V19.6319H8.27054ZM9.25213 6.87117H14.1601L9.25213 1.96319V6.87117Z" fill="#7B0C42" />
                                </svg>} 
                                bgColor="border border-secondary" 
                                // hoverColor="hover:bg-white" 
                                textColor="text-black" 
                                onClick={handleExport}
                            />
                        </div>
                        <div className="w-44 md:w-44">
                            <ButtonDropdown 
                                selectedIcon={'/icon/toko.svg'} 
                                options={cabangData} 
                                onSelect={(value) => setSelectedStore(value)} 
                            />
                        </div>
                        <div className="w-full md:w-auto relative">
                            <div className="w-48 md:w-48">
                                <div className="relative">
                                    <input
                                        type="month"
                                        value={`${selectedYear}-${moment().month(selectedMonth).format('MM')}`}
                                        onChange={(e) => {
                                            const date = moment(e.target.value);
                                            setSelectedMonth(date.format('MMMM'));
                                            setSelectedYear(date.format('YYYY'));
                                        }}
                                        className="w-full px-4 py-2 border border-secondary rounded-lg bg-gray-100 cursor-pointer pr-5"
                                    />
                                </div>  
                            </div>
                        </div>
                        <div className="w-full md:w-auto">
                            <Button 
                                label="Bayar Gaji" 
                                icon={
                                    <svg width="20" height="20" viewBox="0 0 15 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M7.5 10.1111C7.07222 10.1111 6.70615 9.95893 6.40178 9.65456C6.09741 9.35019 5.94496 8.98385 5.94444 8.55556C5.94393 8.12726 6.09637 7.76119 6.40178 7.45733C6.70719 7.15348 7.07326 7.00104 7.5 7C7.92674 6.99896 8.29307 7.15141 8.599 7.45733C8.90493 7.76326 9.05711 8.12933 9.05556 8.55556C9.054 8.98178 8.90182 9.34811 8.599 9.65456C8.29619 9.961 7.92985 10.1132 7.5 10.1111ZM3.90278 3.11111H11.0972L12.6528 0H2.34722L3.90278 3.11111ZM4.7 14H10.3C11.4667 14 12.4583 13.595 13.275 12.7851C14.0917 11.9752 14.5 10.9801 14.5 9.8C14.5 9.30741 14.4157 8.82778 14.2472 8.36111C14.0787 7.89444 13.8389 7.47315 13.5278 7.09722L11.5056 4.66667H3.49444L1.47222 7.09722C1.16111 7.47315 0.921296 7.89444 0.752778 8.36111C0.584259 8.82778 0.5 9.30741 0.5 9.8C0.5 10.9796 0.905222 11.9747 1.71567 12.7851C2.52611 13.5956 3.52089 14.0005 4.7 14Z" fill="white"/>
                                    </svg>
                                }
                                onClick={handleAddBayar}
                                bgColor={`bg-${themeColor}`} 
                                textColor="text-white"
                            />
                        </div>
                    </div>
                </section>

                <section className="mt-5 bg-white rounded-xl">
                    <div className="p-5">
                        <Table
                            headers={headers}
                            data={filteredData.map((item) => ({
                                ...item,
                                "Potongan Gaji": isEditing ? (
                                    <div className="flex items-center" onClick={(e) => e.stopPropagation()}>
                                        <span className="mr-1">-Rp</span>
                                        <input
                                            type="text"
                                            value={editedPotongan[item.id]?.potongan?.toLocaleString() || item["Potongan Gaji"].toLocaleString()}
                                            onChange={(e) => handlePotongGajiChange(item.id, e.target.value)}
                                            onClick={(e) => e.stopPropagation()} 
                                            className="w-24 border border-gray-300 rounded px-2 py-1 text-right"
                                            placeholder="0"
                                        />
                                    </div>
                                ) : `-${formatCurrency(item["Potongan Gaji"])}`,
                                "Total Gaji Akhir": formatCurrency(
                                    editedPotongan[item.id]?.totalGaji || item["Total Gaji Akhir"]
                                )
                            }))}
                            hasFilter={true}
                            onFilterClick={handleFilterClick}
                            additionalButton={userData?.role === 'manajer' && (
                                <div className="flex gap-2">
                                    {isEditing ? (
                                        <>
                                            <Button
                                                label="Selesai"
                                                onClick={handleSelesai}
                                                bgColor="bg-primary"
                                                textColor="text-white"
                                            />
                                            <Button
                                                label="X Batal"
                                                onClick={handleBatal}
                                                bgColor=""
                                                textColor="text-merah"
                                            />
                                        </>
                                    ) : (
                                        <Button
                                            label="Potong Gaji"
                                            icon={<svg width="18" height="20" viewBox="0 0 18 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M4 19C5.65685 19 7 17.6569 7 16C7 14.3431 5.65685 13 4 13C2.34315 13 1 14.3431 1 16C1 17.6569 2.34315 19 4 19Z" stroke="#7B0C42" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                <path d="M12.001 13L4.00098 1M6.00098 13L9.00098 8.5M14.001 1L11.001 5.5" stroke="#7B0C42" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                <path d="M14 19C15.6569 19 17 17.6569 17 16C17 14.3431 15.6569 13 14 13C12.3431 13 11 14.3431 11 16C11 17.6569 12.3431 19 14 19Z" stroke="#7B0C42" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                            </svg>}
                                            onClick={() => setIsEditing(true)}
                                            bgColor="border border-secondary"
                                            textColor="text-black"
                                            hoverColor="hover:bg-gray-100"
                                        />
                                    )}
                                </div>
                            )}
                            onRowClick={handleRowClick}
                        />
                    </div>
                </section>

                {/* Filter Modal */}
                {isFilterModalOpen && (
                    <>
                        <div 
                        className="fixed inset-0"
                        onClick={() => setIsFilterModalOpen(false)}
                        />
                        <div 
                        className="absolute bg-white rounded-lg shadow-lg p-4 w-80 z-50"
                        style={{ 
                            top: filterPosition.top,
                            left: filterPosition.left 
                        }}
                        >
                        <div className="space-y-4">
                            <InputDropdown
                            label="Divisi"
                            options={filterOptions.divisi}
                            value={selectedDivisi}
                            onSelect={(value) => setSelectedDivisi(value.value)}
                            required={true}
                            />
                            <InputDropdown
                            label="Toko"
                            options={filterOptions.toko}
                            value={selectedToko}
                            onSelect={(value) => setSelectedToko(value.value)}
                            required={true}
                            />
                            <InputDropdown
                            label="Cabang"
                            options={filterOptions.cabang}
                            value={selectedCabang}
                            onSelect={(value) => setSelectedCabang(value.value)}
                            required={true}
                            />
                            <button
                            onClick={handleApplyFilter}
                            className="w-full bg-primary text-white py-2 px-4 rounded-lg hover:bg-opacity-90"
                            >
                            Simpan
                            </button>
                        </div>
                        </div>
                    </>
                )}
            </div>

            {errorAlert && (
              <AlertError
                title="Gagal!!"
                description={errorMessasge}
                confirmLabel="Ok"
                onConfirm={() => setErrorAlert(false)}
              />
            )}
        </LayoutWithNav>
    );
}